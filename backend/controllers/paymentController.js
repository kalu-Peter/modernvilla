const PESAPAL_BASE = process.env.PESAPAL_SANDBOX === "true"
  ? "https://cybqa.pesapal.com/pesapalv3"
  : "https://pay.pesapal.com/v3";

const CONSUMER_KEY    = process.env.PESAPAL_CONSUMER_KEY;
const CONSUMER_SECRET = process.env.PESAPAL_CONSUMER_SECRET;

// ─── PesaPal helpers ────────────────────────────────────────────────────────

async function getPesapalToken() {
  const res = await fetch(`${PESAPAL_BASE}/api/Auth/RequestToken`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Accept": "application/json" },
    body: JSON.stringify({ consumer_key: CONSUMER_KEY, consumer_secret: CONSUMER_SECRET }),
  });
  const data = await res.json();
  if (!data.token) throw new Error(`PesaPal auth failed: ${JSON.stringify(data)}`);
  return data.token;
}

async function getOrRegisterIPN(token) {
  if (process.env.PESAPAL_IPN_ID) return process.env.PESAPAL_IPN_ID;
  const ipnUrl = process.env.PESAPAL_IPN_URL;
  if (!ipnUrl) return "";
  try {
    const res = await fetch(`${PESAPAL_BASE}/api/URLSetup/RegisterIPN`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json", "Authorization": `Bearer ${token}` },
      body: JSON.stringify({ url: ipnUrl, ipn_notification_type: "GET" }),
    });
    const text = await res.text();
    const data = JSON.parse(text);
    if (data.ipn_id) return data.ipn_id;
    console.warn("[PesaPal] IPN registration returned no ipn_id:", text);
    return "";
  } catch (err) {
    console.warn("[PesaPal] IPN registration skipped:", err.message);
    return "";
  }
}

// ─── PesaPal routes ─────────────────────────────────────────────────────────

export async function initiatePesapal(req, res) {
  const { amount, description, email, phone, firstName, lastName, callbackUrl } = req.body;
  if (!amount || !email) return res.status(400).json({ error: "amount and email are required" });

  try {
    const token       = await getPesapalToken();
    const ipnId       = await getOrRegisterIPN(token);
    const merchantRef = `CROC-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

    const submitRes = await fetch(`${PESAPAL_BASE}/api/Transactions/SubmitOrderRequest`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({
        id: merchantRef,
        currency: "KES",
        amount: Math.ceil(amount),
        description: description || "Villa Reservation – Crocodile Lodge",
        callback_url: callbackUrl,
        ...(ipnId ? { notification_id: ipnId } : {}),
        billing_address: {
          email_address: email,
          phone_number: phone || "",
          first_name: firstName || "",
          last_name: lastName || "",
        },
      }),
    });

    const data = await submitRes.json();
    if (!data.redirect_url) {
      return res.status(400).json({ error: data.error?.message || "Failed to initiate PesaPal payment" });
    }
    return res.json({
      redirectUrl:       data.redirect_url,
      orderTrackingId:   data.order_tracking_id,
      merchantReference: merchantRef,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

export async function checkPesapalStatus(req, res) {
  const { orderTrackingId } = req.body;
  if (!orderTrackingId) return res.status(400).json({ error: "orderTrackingId required" });

  try {
    const token     = await getPesapalToken();
    const statusRes = await fetch(
      `${PESAPAL_BASE}/api/Transactions/GetTransactionStatus?orderTrackingId=${encodeURIComponent(orderTrackingId)}`,
      { headers: { "Accept": "application/json", "Authorization": `Bearer ${token}` } }
    );
    const data = await statusRes.json();

    const desc = (data.payment_status_description || "").toLowerCase();
    const status =
      desc === "completed" ? "success" :
      desc === "failed" || desc === "reversed" ? "failed" :
      "pending";

    return res.json({
      status,
      transactionId: data.confirmation_code || orderTrackingId,
      paymentMethod: data.payment_method,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

// IPN GET callback — PesaPal pings this after a transaction event
export async function handleIPN(_req, res) {
  return res.status(200).send("OK");
}

// One-off: register IPN URL and return the ipn_id
export async function registerIPNEndpoint(_req, res) {
  try {
    const token = await getPesapalToken();
    const ipnUrl = process.env.PESAPAL_IPN_URL || `${process.env.FRONTEND_URL}/api/payments`;
    const r = await fetch(`${PESAPAL_BASE}/api/URLSetup/RegisterIPN`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json", "Authorization": `Bearer ${token}` },
      body: JSON.stringify({ url: ipnUrl, ipn_notification_type: "GET" }),
    });
    const text = await r.text();
    try {
      return res.json(JSON.parse(text));
    } catch {
      return res.status(502).json({ error: "PesaPal returned non-JSON", raw: text.slice(0, 200) });
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
