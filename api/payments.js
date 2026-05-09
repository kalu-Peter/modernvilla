import { cors } from "./_lib/helpers.js";

const PESAPAL_BASE = process.env.PESAPAL_SANDBOX === "true"
  ? "https://cybqa.pesapal.com/pesapalv3"
  : "https://pay.pesapal.com/v3";

const CONSUMER_KEY    = process.env.PESAPAL_CONSUMER_KEY;
const CONSUMER_SECRET = process.env.PESAPAL_CONSUMER_SECRET;

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
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ url: ipnUrl, ipn_notification_type: "GET" }),
    });
    const data = await res.json();
    return data.ipn_id || "";
  } catch {
    return "";
  }
}

export default async function handler(req, res) {
  if (cors(req, res)) return;

  // IPN callback from PesaPal (GET request)
  if (req.method === "GET") {
    return res.status(200).send("OK");
  }

  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { action, ...body } = req.body ?? {};

  try {
    // ── Initiate PesaPal payment ──────────────────────────────────────────────
    if (action === "pesapal-initiate") {
      const { amount, description, email, phone, firstName, lastName, callbackUrl } = body;
      if (!amount || !email) return res.status(400).json({ error: "amount and email are required" });

      const token     = await getPesapalToken();
      const ipnId     = await getOrRegisterIPN(token);
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
        redirectUrl:      data.redirect_url,
        orderTrackingId:  data.order_tracking_id,
        merchantReference: merchantRef,
      });
    }

    // ── Check PesaPal transaction status ─────────────────────────────────────
    if (action === "pesapal-status") {
      const { orderTrackingId } = body;
      if (!orderTrackingId) return res.status(400).json({ error: "orderTrackingId required" });

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
        transactionId:  data.confirmation_code || orderTrackingId,
        paymentMethod:  data.payment_method,
      });
    }

    return res.status(400).json({ error: "Invalid action. Use: pesapal-initiate, pesapal-status" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
