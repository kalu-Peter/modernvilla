import supabase from "../db/supabase.js";
import bcrypt from "bcryptjs";

// ─── Auth / Users ────────────────────────────────────────────

export async function login(req, res) {
  const { username, password } = req.body ?? {};
  if (!username || !password)
    return res.status(400).json({ error: "username and password required" });

  const { data: user, error } = await supabase
    .from("admin_users")
    .select("id, username, password_hash")
    .eq("username", username.trim().toLowerCase())
    .single();

  if (error || !user)
    return res.status(401).json({ error: "Invalid credentials" });

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid)
    return res.status(401).json({ error: "Invalid credentials" });

  return res.json({ secret: process.env.ADMIN_SECRET, username: user.username });
}

export async function listUsers(req, res) {
  const { data, error } = await supabase
    .from("admin_users")
    .select("id, username, created_at")
    .order("created_at");
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
}

export async function createUser(req, res) {
  const { username, password } = req.body ?? {};
  if (!username || !password)
    return res.status(400).json({ error: "username and password required" });
  if (password.length < 8)
    return res.status(400).json({ error: "password must be at least 8 characters" });

  const hash = await bcrypt.hash(password, 12);
  const { data, error } = await supabase
    .from("admin_users")
    .insert({ username: username.trim().toLowerCase(), password_hash: hash })
    .select("id, username, created_at")
    .single();

  if (error) {
    if (error.code === "23505")
      return res.status(409).json({ error: "Username already exists" });
    return res.status(500).json({ error: error.message });
  }
  res.status(201).json({ message: "User created", user: data });
}

export async function deleteUser(req, res) {
  const { id } = req.params;
  const { error } = await supabase.from("admin_users").delete().eq("id", id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: "User deleted" });
}

// ─── Reservations ────────────────────────────────────────────

export async function getAllReservations(req, res) {
  const { data, error } = await supabase
    .from("reservations")
    .select("id, property_name, guests, checkin, checkout, name, email, phone, total_price, amount_paid, payment_transaction_id, payment_status, confirmed, cancelled, created_at")
    .order("created_at", { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
}

export async function updateReservation(req, res) {
  const { id } = req.params;
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

// ─── Blocked Dates ───────────────────────────────────────────

function datesInRange(start, end) {
  const dates = [];
  const cur = new Date(start);
  const last = new Date(end);
  while (cur <= last) {
    dates.push(cur.toISOString().split("T")[0]);
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
}

function parseIcal(text) {
  const events = [];
  const blocks = text.split("BEGIN:VEVENT");
  for (let i = 1; i < blocks.length; i++) {
    const block = blocks[i];
    const startMatch = block.match(/DTSTART(?:;[^:]*)?:(\d{8})/);
    const endMatch   = block.match(/DTEND(?:;[^:]*)?:(\d{8})/);
    if (!startMatch) continue;
    const toDate = (s) => `${s.slice(0,4)}-${s.slice(4,6)}-${s.slice(6,8)}`;
    const start = toDate(startMatch[1]);
    let end = start;
    if (endMatch) {
      const d = new Date(toDate(endMatch[1]));
      d.setDate(d.getDate() - 1);
      end = d.toISOString().split("T")[0];
    }
    if (end >= start) events.push({ start, end });
  }
  return events;
}

export async function blockDate(req, res) {
  const { action, property_name, blocked_date, start_date, end_date, reason, ical_url } = req.body;

  // ── Sync iCal URL
  if (action === "sync-ical") {
    if (!property_name || !ical_url) {
      return res.status(400).json({ error: "property_name and ical_url are required" });
    }

    await supabase.from("site_settings").upsert(
      { key: `ical_url_${property_name}`, value: ical_url },
      { onConflict: "key" }
    );

    let icsText;
    try {
      const r = await fetch(ical_url);
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      icsText = await r.text();
    } catch (err) {
      return res.status(502).json({ error: `Failed to fetch iCal: ${err.message}` });
    }

    const events = parseIcal(icsText);
    if (events.length === 0) {
      return res.json({ message: "No bookings found in iCal feed", count: 0 });
    }

    const rows = [];
    for (const { start, end } of events) {
      for (const date of datesInRange(start, end)) {
        rows.push({ property_name, blocked_date: date, reason: "airbnb_sync" });
      }
    }

    const { error } = await supabase
      .from("blocked_dates")
      .upsert(rows, { onConflict: "property_name,blocked_date", ignoreDuplicates: true });

    if (error) return res.status(500).json({ error: error.message });

    return res.json({
      message: `Synced ${events.length} Airbnb booking(s) — ${rows.length} date(s) blocked`,
      events: events.length,
      count: rows.length,
    });
  }

  if (!property_name) {
    return res.status(400).json({ error: "property_name is required" });
  }

  const validReasons = ["maintenance", "manual_block", "owner_stay"];
  const resolvedReason = reason && validReasons.includes(reason) ? reason : "manual_block";

  const rangeStart = start_date ?? blocked_date;
  const rangeEnd = end_date ?? blocked_date;

  if (!rangeStart) {
    return res.status(400).json({ error: "A date or date range is required" });
  }

  const dates = datesInRange(rangeStart, rangeEnd);
  if (dates.length === 0) {
    return res.status(400).json({ error: "Invalid date range" });
  }

  const rows = dates.map((d) => ({
    property_name,
    blocked_date: d,
    reason: resolvedReason,
  }));

  const { data, error } = await supabase
    .from("blocked_dates")
    .upsert(rows, { onConflict: "property_name,blocked_date", ignoreDuplicates: true })
    .select();

  if (error) return res.status(500).json({ error: error.message });

  res.status(201).json({ message: `${dates.length} date(s) blocked for ${property_name}`, count: dates.length, blocked: data });
}

export async function getBlockedDates(req, res) {
  const { property, action } = req.query;

  // Return saved iCal URLs from site_settings
  if (action === "ical-urls") {
    const { data, error } = await supabase
      .from("site_settings")
      .select("key, value")
      .like("key", "ical_url_%");
    if (error) return res.status(500).json({ error: error.message });
    const urls = Object.fromEntries((data ?? []).map((r) => [r.key.replace("ical_url_", ""), r.value]));
    return res.json(urls);
  }

  let query = supabase
    .from("blocked_dates")
    .select("id, property_name, blocked_date, reason, created_at")
    .order("blocked_date");

  if (property) query = query.eq("property_name", property);

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
}

export async function unblockDate(req, res) {
  const { id } = req.params;

  const { error } = await supabase.from("blocked_dates").delete().eq("id", id);
  if (error) return res.status(500).json({ error: error.message });

  res.json({ message: "Date unblocked successfully" });
}

// ─── Pricing ─────────────────────────────────────────────────

export async function getAllPricing(req, res) {
  const { data, error } = await supabase
    .from("pricing")
    .select("*")
    .order("property_name")
    .order("min_guests");

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
}

export async function updatePricing(req, res) {
  const { id } = req.params;
  const { price } = req.body;

  if (price === undefined || isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
    return res.status(400).json({ error: "price must be a positive number" });
  }

  const { data, error } = await supabase
    .from("pricing")
    .update({ price: parseFloat(price) })
    .eq("id", id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ error: "Pricing row not found" });

  res.json({ message: "Pricing updated", pricing: data });
}

// ─── Seasonal Pricing ─────────────────────────────────────

export async function getSeasonalPricing(req, res) {
  const { villa_id } = req.query;
  let query = supabase.from("seasonal_pricing").select("id, villa_id, label, start_date, end_date, price_per_night, created_at").order("start_date");
  if (villa_id) query = query.eq("villa_id", villa_id);
  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
}

export async function createSeasonalPricing(req, res) {
  const { villa_id, label, start_date, end_date, price_per_night } = req.body;

  if (!villa_id || !start_date || !end_date || !price_per_night) {
    return res.status(400).json({ error: "villa_id, start_date, end_date and price_per_night are required" });
  }
  if (new Date(end_date) < new Date(start_date)) {
    return res.status(400).json({ error: "end_date must be on or after start_date" });
  }
  if (parseFloat(price_per_night) <= 0) {
    return res.status(400).json({ error: "price_per_night must be a positive number" });
  }

  const { data, error } = await supabase
    .from("seasonal_pricing")
    .insert({ villa_id, label: label || "Custom Rate", start_date, end_date, price_per_night: parseFloat(price_per_night) })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json({ message: "Seasonal pricing rule created", rule: data });
}

export async function updateSeasonalPricing(req, res) {
  const { id } = req.params;
  const { label, start_date, end_date, price_per_night } = req.body;

  const updates = {};
  if (label !== undefined) updates.label = label;
  if (start_date !== undefined) updates.start_date = start_date;
  if (end_date !== undefined) updates.end_date = end_date;
  if (price_per_night !== undefined) {
    if (parseFloat(price_per_night) <= 0) return res.status(400).json({ error: "price_per_night must be positive" });
    updates.price_per_night = parseFloat(price_per_night);
  }

  const { data, error } = await supabase
    .from("seasonal_pricing")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ error: "Rule not found" });
  res.json({ message: "Seasonal pricing updated", rule: data });
}

export async function deleteSeasonalPricing(req, res) {
  const { id } = req.params;
  const { error } = await supabase.from("seasonal_pricing").delete().eq("id", id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: "Seasonal pricing rule deleted" });
}
