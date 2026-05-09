import supabase from "../_lib/supabase.js";
import { cors, adminAuth } from "../_lib/helpers.js";

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

// Parse .ics text → array of { start, end } date strings (YYYY-MM-DD)
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
    // DTEND in iCal is exclusive — subtract 1 day
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

export default async function handler(req, res) {
  if (cors(req, res)) return;
  if (!adminAuth(req, res)) return;

  // ── GET: list blocked dates OR get saved iCal URLs
  if (req.method === "GET") {
    if (req.query.action === "ical-urls") {
      const { data, error } = await supabase
        .from("site_settings")
        .select("key, value")
        .like("key", "ical_url_%");
      if (error) return res.status(500).json({ error: error.message });
      const urls = Object.fromEntries((data ?? []).map((r) => [r.key.replace("ical_url_", ""), r.value]));
      return res.json(urls);
    }

    const { property } = req.query;
    let query = supabase
      .from("blocked_dates")
      .select("id, property_name, blocked_date, reason, created_at")
      .order("blocked_date");
    if (property) query = query.eq("property_name", property);
    const { data, error } = await query;
    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
  }

  if (req.method === "POST") {
    const { action } = req.body;

    // ── Sync iCal URL
    if (action === "sync-ical") {
      const { property_name, ical_url } = req.body;
      if (!property_name || !ical_url) {
        return res.status(400).json({ error: "property_name and ical_url are required" });
      }

      // Save URL to site_settings
      await supabase.from("site_settings").upsert(
        { key: `ical_url_${property_name}`, value: ical_url },
        { onConflict: "key" }
      );

      // Fetch the .ics file
      let icsText;
      try {
        const r = await fetch(ical_url);
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        icsText = await r.text();
      } catch (err) {
        return res.status(502).json({ error: `Failed to fetch iCal: ${err.message}` });
      }

      // Parse events
      const events = parseIcal(icsText);
      if (events.length === 0) {
        return res.json({ message: "No bookings found in iCal feed", count: 0 });
      }

      // Build all blocked date rows
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

    // ── Manual block dates
    const { property_name, blocked_date, start_date, end_date, reason } = req.body;

    if (!property_name) {
      return res.status(400).json({ error: "property_name is required" });
    }

    const validReasons = ["maintenance", "manual_block", "owner_stay"];
    const resolvedReason = reason && validReasons.includes(reason) ? reason : "manual_block";

    const rangeStart = start_date ?? blocked_date;
    const rangeEnd   = end_date ?? blocked_date;

    if (!rangeStart) {
      return res.status(400).json({ error: "A date or date range is required" });
    }

    const dates = datesInRange(rangeStart, rangeEnd);
    if (dates.length === 0) {
      return res.status(400).json({ error: "Invalid date range" });
    }

    const rows = dates.map((d) => ({ property_name, blocked_date: d, reason: resolvedReason }));

    const { data, error } = await supabase
      .from("blocked_dates")
      .upsert(rows, { onConflict: "property_name,blocked_date", ignoreDuplicates: true })
      .select();

    if (error) return res.status(500).json({ error: error.message });

    return res.status(201).json({
      message: `${dates.length} date(s) blocked for ${property_name}`,
      count: dates.length,
      blocked: data,
    });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
