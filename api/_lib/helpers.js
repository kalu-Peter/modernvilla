/** Set CORS headers and handle preflight OPTIONS requests.
 *  Returns true if the request was a preflight (caller should return early). */
export function cors(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-admin-secret");
  if (req.method === "OPTIONS") {
    res.status(204).end();
    return true;
  }
  return false;
}

/** Check the x-admin-secret header. Returns false and sends 401 if invalid. */
export function adminAuth(req, res) {
  const secret = req.headers["x-admin-secret"];
  if (!secret || secret !== process.env.ADMIN_SECRET) {
    res.status(401).json({ error: "Unauthorized – invalid admin secret" });
    return false;
  }
  return true;
}

/**
 * Send an email via Resend.
 * Requires RESEND_API_KEY and RESEND_FROM env vars.
 * Silently fails if key is missing (so bookings still work without email config).
 */
export async function sendEmail({ to, subject, html }) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return;
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.RESEND_FROM || "Crocodile Lodge <noreply@crocodilelodge.co.ke>",
      to,
      subject,
      html,
    }),
  });
}
