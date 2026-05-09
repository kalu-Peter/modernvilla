import supabase from "../../_lib/supabase.js";
import { cors, adminAuth } from "../../_lib/helpers.js";

export default async function handler(req, res) {
  if (cors(req, res)) return;
  if (!adminAuth(req, res)) return;

  const { id } = req.query;

  if (req.method === "PUT") {
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

  if (req.method === "DELETE") {
    const { error } = await supabase.from("seasonal_pricing").delete().eq("id", id);
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ message: "Seasonal pricing rule deleted" });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
