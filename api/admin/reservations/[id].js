import supabase from "../../_lib/supabase.js";
import { cors, adminAuth } from "../../_lib/helpers.js";

export default async function handler(req, res) {
  if (cors(req, res)) return;
  if (!adminAuth(req, res)) return;
  if (req.method !== "PUT") return res.status(405).json({ error: "Method not allowed" });

  const { id } = req.query;
  const { action } = req.body;

  if (action === "confirm") {
    const { data, error } = await supabase
      .from("reservations")
      .update({ confirmed: true })
      .eq("id", id)
      .select("id, confirmed, property_name, checkin, checkout")
      .single();
    if (error) return res.status(500).json({ error: error.message });
    if (!data) return res.status(404).json({ error: "Reservation not found" });
    return res.json({ message: "Reservation confirmed", reservation: data });
  }

  if (action === "cancel") {
    const { data, error } = await supabase
      .from("reservations")
      .update({ cancelled: true, confirmed: false })
      .eq("id", id)
      .select("id, cancelled, property_name, checkin, checkout")
      .single();
    if (error) return res.status(500).json({ error: error.message });
    if (!data) return res.status(404).json({ error: "Reservation not found" });
    return res.json({ message: "Reservation cancelled", reservation: data });
  }

  return res.status(400).json({ error: "action must be 'confirm' or 'cancel'" });
}
