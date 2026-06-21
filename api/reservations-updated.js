import { cors } from "./_lib/helpers.js";
import supabase from "./_lib/supabase.js";

function isWeekend(dateString) {
  const date = new Date(dateString);
  const dayOfWeek = date.getUTCDay();
  return dayOfWeek === 5 || dayOfWeek === 6; // Friday 5, Saturday 6
}

async function calculateDetailedPrice(propertyName, checkin, checkout, guests) {
  // Get property rates
  const { data: rates, error: ratesError } = await supabase
    .from("property_rates")
    .select("*")
    .eq("property_name", propertyName)
    .single();

  if (ratesError || !rates) {
    throw new Error(`Could not find rates for property: ${propertyName}`);
  }

  // Calculate number of nights
  const checkInDate = new Date(checkin);
  const checkOutDate = new Date(checkout);
  const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));

  let roomCharges = 0;

  // Calculate room charges per night
  const currentDate = new Date(checkInDate);
  while (currentDate < checkOutDate) {
    const dateStr = currentDate.toISOString().split("T")[0];
    const isWeekendDay = isWeekend(dateStr);

    if (isWeekendDay) {
      roomCharges += rates.weekend_price_per_night;
    } else {
      roomCharges += rates.base_price_per_night;
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
  const taxAmount = (subtotal + cleaningFee + monetaryFee) * (rates.tax_percentage / 100);

  // Total
  const totalPrice = subtotal + cleaningFee + monetaryFee + taxAmount;

  return {
    totalPrice: Math.round(totalPrice * 100) / 100,
    breakdown: {
      roomCharges: Math.round(roomCharges * 100) / 100,
      guestCharges: Math.round(guestCharges * 100) / 100,
      subtotal: Math.round(subtotal * 100) / 100,
      cleaningFee,
      monetaryFee,
      taxPercentage: rates.tax_percentage,
      taxAmount: Math.round(taxAmount * 100) / 100,
    },
  };
}

export default async function handler(req, res) {
  if (cors(req, res)) return;

  if (req.method === "GET") {
    const { property, checkin, checkout, guests } = req.query;

    if (!property || !checkin || !checkout || !guests) {
      return res.status(400).json({
        error: "property, checkin, checkout, and guests are required",
      });
    }

    try {
      const result = await calculateDetailedPrice(property, checkin, checkout, parseInt(guests));
      return res.json(result);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  if (req.method === "POST") {
    const { property_name, guests, checkin, checkout, name, phone, email } = req.body;

    if (!property_name || !guests || !checkin || !checkout || !name || !phone || !email) {
      return res.status(400).json({
        error: "Missing required fields: property_name, guests, checkin, checkout, name, phone, email",
      });
    }

    try {
      // Calculate total price using the detailed pricing function
      const priceResult = await calculateDetailedPrice(property_name, checkin, checkout, guests);
      const total_price = priceResult.totalPrice;

      const { data, error } = await supabase.from("reservations").insert([
        {
          property_name,
          guests,
          checkin,
          checkout,
          name,
          phone,
          email,
          total_price,
          payment_status: "pending",
        },
      ]);

      if (error) {
        return res.status(500).json({ error: error.message });
      }

      return res.json({ success: true, data, priceBreakdown: priceResult.breakdown });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
