import supabase from "../_lib/supabase.js";
import { cors, adminAuth } from "../_lib/helpers.js";
import bcrypt from "bcryptjs";

export default async function handler(req, res) {
  if (cors(req, res)) return;

  // POST /api/admin/auth - Login
  if (req.method === "POST" && !req.query.action) {
    const { username, password } = req.body ?? {};
    if (!username || !password)
      return res.status(400).json({ error: "username and password required" });

    const { data: user, error } = await supabase
      .from("admin_users")
      .select("id, username, password_hash")
      .eq("username", username.trim().toLowerCase())
      .single();

    if (error || !user)
      return res.status(401).json({ error: "Invalid credentials" });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid)
      return res.status(401).json({ error: "Invalid credentials" });

    return res.json({ secret: process.env.ADMIN_SECRET, username: user.username });
  }

  // GET /api/admin/auth - List all admin users
  if (req.method === "GET") {
    if (!adminAuth(req, res)) return;

    const { data, error } = await supabase
      .from("admin_users")
      .select("id, username, created_at")
      .order("created_at");
    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
  }

  // POST /api/admin/auth?action=create - Create a new admin user
  if (req.method === "POST" && req.query.action === "create") {
    if (!adminAuth(req, res)) return;

    const { username, password } = req.body ?? {};
    if (!username || !password)
      return res.status(400).json({ error: "username and password required" });
    if (password.length < 8)
      return res.status(400).json({ error: "password must be at least 8 characters" });

    const hash = await bcrypt.hash(password, 12);
    const { data, error } = await supabase
      .from("admin_users")
      .insert({ username: username.trim().toLowerCase(), password_hash: hash })
      .select("id, username, created_at")
      .single();

    if (error) {
      if (error.code === "23505" || error.message.includes("unique")) {
        return res.status(409).json({ error: "Username already exists" });
      }
      return res.status(500).json({ error: error.message });
    }

    return res.status(201).json({ message: "User created", user: data });
  }

  // DELETE /api/admin/auth?id=xxx - Remove a user by ID
  if (req.method === "DELETE") {
    if (!adminAuth(req, res)) return;

    const { id } = req.query;
    if (!id) return res.status(400).json({ error: "id query param required" });
    const { error } = await supabase.from("admin_users").delete().eq("id", id);
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ message: "User deleted" });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
