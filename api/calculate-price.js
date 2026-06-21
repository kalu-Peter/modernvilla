import supabase from "./_lib/supabase.js";
import { cors } from "./_lib/helpers.js";

function isWeekend(dateString) {
  const date = new Date(dateString);
  const dayOfWeek = date.getUTCDay();
  return dayOfWeek === 5 || dayOfWeek === 6; // Friday 5, Saturday 6
}

export default async function handler(req, res) {
  if (cors(req, res)) return;
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { property, checkin, checkout, guests } = req.query;

  if (!property || !checkin || !checkout || !guests) {
    return res.status(400).json({
      error: "property, checkin, checkout, and guests are required",
    });
  }

  try {
    // Get property rates
    const { data: rates, error: ratesError } = await supabase
      .from("property_rates")
      .select("*")
      .eq("property_name", property)
      .single();

    if (ratesError || !rates) {
      return res.status(404).json({ error: `No rates found for property: ${property}` });
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
    const numGuests = parseInt(guests);
    const additionalGuests = Math.max(0, numGuests - rates.base_guest_count);
    const guestCharges = additionalGuests * rates.additional_guest_charge * nights;

    // Calculate subtotal before fees and taxes
    const subtotal = roomCharges + guestCharges;

    // Apply cleaning fee, monetary fee, and tax
    const cleaningFee = rates.cleaning_fee;
    const monetaryFee = rates.monetary_fee;
    const taxAmount = roomCharges * (rates.tax_percentage / 100);

    // Total
    const totalPrice = subtotal + cleaningFee + monetaryFee + taxAmount;

    res.json({
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
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
