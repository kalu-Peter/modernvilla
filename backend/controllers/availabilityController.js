import supabase from "../db/supabase.js";

/**
 * Returns true if property is free for [checkin, checkout).
 * Checks both reservations and blocked_dates tables.
 */
export async function checkAvailability(req, res) {
  const { property, checkin, checkout } = req.query;

  if (!property || !checkin || !checkout) {
    return res
      .status(400)
      .json({ error: "property, checkin, and checkout are required" });
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
    const { isAvailable, reason } = await isPropertyAvailable(
      property,
      checkin,
      checkout
    );
    res.json({ available: isAvailable, reason: reason ?? null });
  } catch (err) {
    console.error("[availability] error:", err.message);
    res.status(500).json({ error: err.message });
  }
}

/**
 * Core availability logic, reused by reservation creation.
 */
export async function isPropertyAvailable(property, checkin, checkout) {
  // 1. Check overlapping reservations (exclude cancelled ones)
  const { data: conflicts, error: resError } = await supabase
    .from("reservations")
    .select("id")
    .eq("property_name", property)
    .eq("cancelled", false)
    .lt("checkin", checkout)   // existing checkin < requested checkout
    .gt("checkout", checkin);  // existing checkout > requested checkin

  if (resError) throw new Error(resError.message);
  if (conflicts.length > 0) {
    return { isAvailable: false, reason: "Property already booked for those dates" };
  }

  // 2. Check blocked dates that fall within [checkin, checkout)
  const { data: blocked, error: blkError } = await supabase
    .from("blocked_dates")
    .select("blocked_date, reason")
    .eq("property_name", property)
    .gte("blocked_date", checkin)
    .lt("blocked_date", checkout);

  if (blkError) throw new Error(blkError.message);
  if (blocked.length > 0) {
    return {
      isAvailable: false,
      reason: `Property blocked from ${blocked[0].blocked_date} (${blocked[0].reason})`,
    };
  }

  return { isAvailable: true };
}
