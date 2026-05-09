import supabase from "../_lib/supabase.js";
import { cors, adminAuth } from "../_lib/helpers.js";

export default async function handler(req, res) {
  if (cors(req, res)) return;
  if (!adminAuth(req, res)) return;

  if (req.method === "GET") {
    const { villa_id } = req.query;
    let query = supabase.from("seasonal_pricing").select("id, villa_id, label, start_date, end_date, price_per_night, created_at").order("start_date");
    if (villa_id) query = query.eq("villa_id", villa_id);
    const { data, error } = await query;
    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
  }

  if (req.method === "POST") {
    const { villa_id, label, start_date, end_date, price_per_night } = req.body;
    if (!villa_id || !start_date || !end_date || !price_per_night) {
      return res.status(400).json({ error: "villa_id, start_date, end_date and price_per_night are required" });
    }
    const { data, error } = await supabase
      .from("seasonal_pricing")
      .insert({ villa_id, label: label || "Custom Rate", start_date, end_date, price_per_night: parseFloat(price_per_night) })
      .select()
      .single();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json(data);
  }

  return res.status(405).json({ error: "Method not allowed" });
}
