import supabase from "./_lib/supabase.js";
import { cors } from "./_lib/helpers.js";

export default async function handler(req, res) {
  if (cors(req, res)) return;
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const { property, checkin, checkout } = req.query;

  if (!property || !checkin || !checkout) {
    return res.status(400).json({ error: "property, checkin and checkout are required" });
  }

  const checkinDate = new Date(checkin);
  const checkoutDate = new Date(checkout);

  if (isNaN(checkinDate) || isNaN(checkoutDate)) {
    return res.status(400).json({ error: "Invalid date format. Use YYYY-MM-DD" });
  }
  if (checkoutDate <= checkinDate) {
    return res.status(400).json({ error: "checkout must be after checkin" });
  }

  try {
    // 1. Check overlapping reservations (exclude cancelled)
    const { data: conflicts, error: resError } = await supabase
      .from("reservations")
      .select("id")
      .eq("property_name", property)
      .eq("cancelled", false)
      .lt("checkin", checkout)
      .gt("checkout", checkin);

    if (resError) throw new Error(resError.message);
    if (conflicts.length > 0) {
      return res.json({ available: false, reason: "Property already booked for those dates" });
    }

    // 2. Check blocked dates within the range
    const { data: blocked, error: blkError } = await supabase
      .from("blocked_dates")
      .select("blocked_date, reason")
      .eq("property_name", property)
      .gte("blocked_date", checkin)
      .lt("blocked_date", checkout);

    if (blkError) throw new Error(blkError.message);
    if (blocked.length > 0) {
      return res.json({
        available: false,
        reason: `Property blocked from ${blocked[0].blocked_date} (${blocked[0].reason})`,
      });
    }

    return res.json({ available: true, reason: null });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
