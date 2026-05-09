import supabase from "./_lib/supabase.js";
import { cors } from "./_lib/helpers.js";

export default async function handler(req, res) {
  if (cors(req, res)) return;
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const { villaId, checkin } = req.query;
  if (!villaId || !checkin) {
    return res.status(400).json({ error: "villaId and checkin are required" });
  }

  const { data, error } = await supabase
    .from("seasonal_pricing")
    .select("price_per_night, label")
    .eq("villa_id", villaId)
    .lte("start_date", checkin)
    .gte("end_date", checkin)
    .order("created_at", { ascending: false })
    .limit(1);

  if (error) return res.status(500).json({ error: error.message });

  if (data && data.length > 0) {
    return res.json({ price: data[0].price_per_night, label: data[0].label, source: "seasonal" });
  }

  return res.json({ price: null, source: "none" });
}
