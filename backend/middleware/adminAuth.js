/**
 * Simple secret-header admin authentication.
 * Clients must send: x-admin-secret: <ADMIN_SECRET>
 */
export function adminAuth(req, res, next) {
  const secret = req.headers["x-admin-secret"];
  if (!secret || secret !== process.env.ADMIN_SECRET) {
    return res.status(401).json({ error: "Unauthorized – invalid admin secret" });
  }
  next();
}
