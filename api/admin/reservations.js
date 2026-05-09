import supabase from "../_lib/supabase.js";
import { cors, adminAuth } from "../_lib/helpers.js";

export default async function handler(req, res) {
  if (cors(req, res)) return;
  if (!adminAuth(req, res)) return;
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const { data, error } = await supabase
    .from("reservations")
    .select("id, property_name, guests, checkin, checkout, name, email, phone, total_price, confirmed, cancelled, created_at")
    .order("created_at", { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
}
