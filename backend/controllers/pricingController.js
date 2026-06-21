import supabase from "../db/supabase.js";

/**
 * Check if a date is a weekend (Friday or Saturday)
 */
function isWeekend(dateString) {
  const date = new Date(dateString);
  const dayOfWeek = date.getUTCDay();
  return dayOfWeek === 5 || dayOfWeek === 6; // Friday 5, Saturday 6
}

/**
 * Export utility functions for other modules to use
 */
export const pricingUtils = {
  isWeekend,
  calculateDetailedPrice: async (property, checkin, checkout, guests) => {
    return calculateDetailedPrice(property, checkin, checkout, guests);
  },
};

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
 * Get detailed property rates (base price, weekend price, fees, etc.)
 */
export async function getPropertyRates(req, res) {
  const { property } = req.params;

  const { data, error } = await supabase
    .from("property_rates")
    .select("*")
    .eq("property_name", property)
    .single();

  if (error) return res.status(500).json({ error: error.message });
  if (!data)
    return res
      .status(404)
      .json({ error: `No rates found for property: ${property}` });

  res.json(data);
}

/**
 * Calculate total price with detailed breakdown
 * @param {string} property - Property name
 * @param {string} checkin - Check-in date (YYYY-MM-DD)
 * @param {string} checkout - Check-out date (YYYY-MM-DD)
 * @param {number} guests - Number of guests
 * @returns {Promise<Object>} Pricing breakdown
 */
export async function calculateDetailedPrice(property, checkin, checkout, guests) {
  // Get property rates
  const { data: rates, error: ratesError } = await supabase
    .from("property_rates")
    .select("*")
    .eq("property_name", property)
    .single();

  if (ratesError || !rates) {
    throw new Error(`Could not find rates for property: ${property}`);
  }

  // Calculate number of nights
  const checkInDate = new Date(checkin);
  const checkOutDate = new Date(checkout);
  const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));

  let roomCharges = 0;
  let weekendNights = 0;
  let weekdayNights = 0;

  // Calculate room charges per night
  const currentDate = new Date(checkInDate);
  while (currentDate < checkOutDate) {
    const dateStr = currentDate.toISOString().split("T")[0];
    const isWeekendDay = isWeekend(dateStr);

    if (isWeekendDay) {
      roomCharges += rates.weekend_price_per_night;
      weekendNights++;
    } else {
      roomCharges += rates.base_price_per_night;
      weekdayNights++;
    }

    currentDate.setUTCDate(currentDate.getUTCDate() + 1);
  }

  // Calculate guest charges (additional guests over base_guest_count)
  const additionalGuests = Math.max(0, guests - rates.base_guest_count);
  const guestCharges = additionalGuests * rates.additional_guest_charge * nights;

  // Calculate subtotal before fees and taxes
  const subtotal = roomCharges + guestCharges;

  // Apply cleaning fee, monetary fee, and tax
  const cleaningFee = rates.cleaning_fee;
  const monetaryFee = rates.monetary_fee;
  const taxAmount = roomCharges * (rates.tax_percentage / 100);

  // Total
  const totalPrice = subtotal + cleaningFee + monetaryFee + taxAmount;

  return {
    breakdown: {
      weekdayNights,
      weekendNights,
      roomCharges: Math.round(roomCharges * 100) / 100,
      guestCharges: Math.round(guestCharges * 100) / 100,
      subtotal: Math.round(subtotal * 100) / 100,
      cleaningFee,
      monetaryFee,
      taxPercentage: rates.tax_percentage,
      taxAmount: Math.round(taxAmount * 100) / 100,
    },
    totalPrice: Math.round(totalPrice * 100) / 100,
  };
}

/**
 * API endpoint to calculate price
 */
export async function calculatePrice(req, res) {
  const { property, checkin, checkout, guests } = req.query;

  if (!property || !checkin || !checkout || !guests) {
    return res.status(400).json({
      error: "property, checkin, checkout, and guests are required",
    });
  }

  try {
    const result = await calculateDetailedPrice(property, checkin, checkout, parseInt(guests));
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
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
