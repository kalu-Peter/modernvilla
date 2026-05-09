import supabase from "../db/supabase.js";
import { isPropertyAvailable } from "./availabilityController.js";

export async function createReservation(req, res) {
  const { property_name, guests, checkin, checkout, name, phone, email, total_price, amount_paid, payment_transaction_id } =
    req.body;

  // --- Validation ---
  if (
    !property_name || !guests || !checkin || !checkout ||
    !name || !phone || !email || total_price === undefined
  ) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const guestCount = parseInt(guests, 10);
  if (isNaN(guestCount) || guestCount < 1) {
    return res.status(400).json({ error: "guests must be a positive integer" });
  }

  const checkinDate = new Date(checkin);
  const checkoutDate = new Date(checkout);

  if (isNaN(checkinDate) || isNaN(checkoutDate)) {
    return res.status(400).json({ error: "Invalid date format. Use YYYY-MM-DD" });
  }
  if (checkoutDate <= checkinDate) {
    return res.status(400).json({ error: "checkout must be after checkin" });
  }
  if (checkinDate < new Date(new Date().toDateString())) {
    return res.status(400).json({ error: "checkin cannot be in the past" });
  }

  // --- Availability check ---
  let availability;
  try {
    availability = await isPropertyAvailable(property_name, checkin, checkout);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }

  if (!availability.isAvailable) {
    return res.status(409).json({ error: availability.reason });
  }

  // --- Create reservation ---
  const { data, error } = await supabase
    .from("reservations")
    .insert({
      property_name,
      guests: guestCount,
      checkin,
      checkout,
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim().toLowerCase(),
      total_price: parseFloat(total_price),
      amount_paid: amount_paid ? parseFloat(amount_paid) : null,
      payment_transaction_id: payment_transaction_id || null,
      payment_status: "pending",
      confirmed: false,
      cancelled: false,
    })
    .select("id, property_name, checkin, checkout, total_price, payment_status")
    .single();

  if (error) return res.status(500).json({ error: error.message });

  res.status(201).json({
    message: "Reservation created successfully",
    reservation: data,
  });
}
