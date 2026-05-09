import supabase from "../_lib/supabase.js";
import { cors, adminAuth } from "../_lib/helpers.js";
import bcrypt from "bcryptjs";

export default async function handler(req, res) {
  if (cors(req, res)) return;
  if (!adminAuth(req, res)) return;

  // GET — list all admin users
  if (req.method === "GET") {
    const { data, error } = await supabase
      .from("admin_users")
      .select("id, username, created_at")
      .order("created_at");
    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
  }

  // POST — create a new admin user
  if (req.method === "POST") {
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
      if (error.code === "23505")
        return res.status(409).json({ error: "Username already exists" });
      return res.status(500).json({ error: error.message });
    }
    return res.status(201).json({ message: "User created", user: data });
  }

  // DELETE — remove a user by ?id=
  if (req.method === "DELETE") {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: "id query param required" });
    const { error } = await supabase.from("admin_users").delete().eq("id", id);
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ message: "User deleted" });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
