import supabase from "../_lib/supabase.js";
import { cors } from "../_lib/helpers.js";
import bcrypt from "bcryptjs";

export default async function handler(req, res) {
  if (cors(req, res)) return;
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

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
