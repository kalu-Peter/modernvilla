import supabase from "../_lib/supabase.js";
import { cors, adminAuth } from "../_lib/helpers.js";

export default async function handler(req, res) {
  if (cors(req, res)) return;
  if (!adminAuth(req, res)) return;

  const { id } = req.query;

  // GET /api/admin/seasonal-pricing - List all seasonal pricing
  if (req.method === "GET" && !id) {
    const { villa_id } = req.query;
    let query = supabase.from("seasonal_pricing").select("id, villa_id, label, start_date, end_date, price_per_night, created_at").order("start_date");
    if (villa_id) query = query.eq("villa_id", villa_id);
    const { data, error } = await query;
    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
  }

  // POST /api/admin/seasonal-pricing - Create seasonal pricing
  if (req.method === "POST" && !id) {
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

  // PUT /api/admin/seasonal-pricing?id=xxx - Update seasonal pricing
  if (req.method === "PUT" && id) {
    const { label, start_date, end_date, price_per_night } = req.body;
    const updates = {};
    if (label !== undefined) updates.label = label;
    if (start_date !== undefined) updates.start_date = start_date;
    if (end_date !== undefined) updates.end_date = end_date;
    if (price_per_night !== undefined) updates.price_per_night = parseFloat(price_per_night);

    if (!Object.keys(updates).length) {
      return res.status(400).json({ error: "No fields to update" });
    }

    const { data, error } = await supabase
      .from("seasonal_pricing")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    if (!data) return res.status(404).json({ error: "Rule not found" });
    return res.json(data);
  }

  // DELETE /api/admin/seasonal-pricing?id=xxx - Delete seasonal pricing
  if (req.method === "DELETE" && id) {
    const { error } = await supabase.from("seasonal_pricing").delete().eq("id", id);
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ message: "Seasonal pricing rule deleted" });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
