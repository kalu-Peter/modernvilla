import supabase from "../db/supabase.js";

export async function getPricingForProperty(req, res) {
  const { property } = req.params;

  const { data, error } = await supabase
    .from("pricing")
    .select("*")
    .eq("property_name", property)
    .order("min_guests");

  if (error) return res.status(500).json({ error: error.message });
  if (!data.length)
    return res
      .status(404)
      .json({ error: `No pricing found for property: ${property}` });

  res.json(data);
}

/**
 * Calculate the price for a given property, guest count, and night count.
 * Returns the matching pricing tier or the last (highest) tier if over range.
 */
export async function getSeasonalPriceForDate(req, res) {
  const { villaId, checkin } = req.query;
  if (!villaId || !checkin) {
    return res.status(400).json({ error: "villaId and checkin are required" });
  }

  // Find a seasonal rule that covers the check-in date
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

export function calculateTotalPrice(pricingRows, guests, nights) {
  if (!pricingRows.length) return 0;
  const tier =
    pricingRows.find((p) => guests >= p.min_guests && guests <= p.max_guests) ||
    pricingRows[pricingRows.length - 1];
  return tier.price * guests * nights;
}
