import supabase from "../_lib/supabase.js";
import { cors, adminAuth } from "../_lib/helpers.js";

export default async function handler(req, res) {
  if (cors(req, res)) return;
  if (!adminAuth(req, res)) return;

  const { id } = req.query;

  // GET /api/admin/reservations - List all reservations
  if (req.method === "GET" && !id) {
    const { data, error } = await supabase
      .from("reservations")
      .select("id, property_name, guests, checkin, checkout, name, email, phone, total_price, confirmed, cancelled, created_at")
      .order("created_at", { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
  }

  // PUT /api/admin/reservations?id=xxx - Confirm or cancel a reservation
  if (req.method === "PUT" && id) {
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

  return res.status(405).json({ error: "Method not allowed" });
}
