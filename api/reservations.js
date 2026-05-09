import supabase from "./_lib/supabase.js";
import { cors, sendEmail } from "./_lib/helpers.js";

export default async function handler(req, res) {
  if (cors(req, res)) return;
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { property_name, guests, checkin, checkout, name, phone, email, total_price } = req.body;

  if (!property_name || !guests || !checkin || !checkout || !name || !phone || !email || total_price === undefined) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const guestCount = parseInt(guests, 10);
  if (isNaN(guestCount) || guestCount < 1) {
    return res.status(400).json({ error: "guests must be a positive integer" });
  }

  const checkinDate  = new Date(checkin);
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

  try {
    // Availability check
    const { data: conflicts } = await supabase
      .from("reservations")
      .select("id")
      .eq("property_name", property_name)
      .eq("cancelled", false)
      .lt("checkin", checkout)
      .gt("checkout", checkin);

    if (conflicts && conflicts.length > 0) {
      return res.status(409).json({ error: "Property already booked for those dates" });
    }

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
        amount_paid: null,
        payment_transaction_id: null,
        payment_status: "pending",
        confirmed: false,
        cancelled: false,
      })
      .select("id, property_name, checkin, checkout, total_price")
      .single();

    if (error) return res.status(500).json({ error: error.message });

    const nights  = Math.round((checkoutDate - checkinDate) / 86400000);
    const fmtDate = (d) => new Date(d).toLocaleDateString("en-KE", { day: "2-digit", month: "long", year: "numeric" });
    const refNum  = data.id.substring(0, 8).toUpperCase();

    // ── Guest confirmation email ─────────────────────────────────────────────
    await sendEmail({
      to: email.trim().toLowerCase(),
      subject: `Booking Request Received – ${property_name} | Crocodile Lodge`,
      html: `
        <div style="font-family:Georgia,serif;max-width:620px;margin:0 auto;color:#1a1a1a;background:#fff;">
          <div style="background:#1a1a2e;padding:36px 44px;display:flex;align-items:center;justify-content:space-between;">
            <div>
              <h1 style="font-family:Georgia,serif;color:#f0f0f0;font-size:1.3rem;margin:0;letter-spacing:0.03em;">Crocodile Lodge</h1>
              <p style="color:#c9a84c;font-size:0.68rem;letter-spacing:0.22em;text-transform:uppercase;margin:5px 0 0;">Diani Beach, Kenya</p>
            </div>
            <div style="text-align:right;">
              <p style="color:#9098a9;font-size:0.62rem;letter-spacing:0.15em;text-transform:uppercase;margin:0;">Booking Reference</p>
              <p style="color:#c9a84c;font-family:monospace;font-size:1rem;font-weight:bold;margin:4px 0 0;">#${refNum}</p>
            </div>
          </div>

          <div style="padding:40px 44px;">
            <p style="font-size:1rem;margin:0 0 6px;">Dear <strong>${name.trim()}</strong>,</p>
            <p style="color:#6b7280;line-height:1.7;margin:0 0 32px;font-size:0.92rem;">
              Thank you for choosing Crocodile Lodge. We have received your booking request and will confirm it shortly.
              Our team will be in touch to finalise your stay.
            </p>

            <!-- Booking details table -->
            <table style="width:100%;border-collapse:collapse;margin-bottom:28px;">
              <tr>
                <td style="padding:10px 14px;background:#f5f6fa;border-radius:8px 8px 0 0;font-size:0.62rem;letter-spacing:0.18em;text-transform:uppercase;color:#9098a9;font-weight:bold;" colspan="2">Booking Summary</td>
              </tr>
              <tr style="background:#fafbfc;">
                <td style="padding:12px 14px;color:#9098a9;font-size:0.85rem;border-bottom:1px solid #eef0f4;width:40%;">Property</td>
                <td style="padding:12px 14px;font-weight:bold;font-size:0.9rem;border-bottom:1px solid #eef0f4;">${property_name}</td>
              </tr>
              <tr>
                <td style="padding:12px 14px;color:#9098a9;font-size:0.85rem;border-bottom:1px solid #eef0f4;">Check-In</td>
                <td style="padding:12px 14px;font-size:0.9rem;border-bottom:1px solid #eef0f4;">${fmtDate(checkin)}</td>
              </tr>
              <tr style="background:#fafbfc;">
                <td style="padding:12px 14px;color:#9098a9;font-size:0.85rem;border-bottom:1px solid #eef0f4;">Check-Out</td>
                <td style="padding:12px 14px;font-size:0.9rem;border-bottom:1px solid #eef0f4;">${fmtDate(checkout)}</td>
              </tr>
              <tr>
                <td style="padding:12px 14px;color:#9098a9;font-size:0.85rem;border-bottom:1px solid #eef0f4;">Nights</td>
                <td style="padding:12px 14px;font-size:0.9rem;border-bottom:1px solid #eef0f4;">${nights}</td>
              </tr>
              <tr style="background:#fafbfc;">
                <td style="padding:12px 14px;color:#9098a9;font-size:0.85rem;border-bottom:1px solid #eef0f4;">Guests</td>
                <td style="padding:12px 14px;font-size:0.9rem;border-bottom:1px solid #eef0f4;">${guestCount}</td>
              </tr>
              <tr>
                <td style="padding:16px 14px;color:#1a1a2e;font-size:0.9rem;font-weight:bold;">Total Amount</td>
                <td style="padding:16px 14px;font-weight:bold;font-size:1.1rem;color:#c9a84c;">Ksh ${Number(total_price).toLocaleString()}</td>
              </tr>
            </table>

            <!-- Invoice note -->
            <div style="background:#fffbf0;border:1.5px solid #f5e4a8;border-radius:10px;padding:18px 20px;margin-bottom:28px;">
              <p style="font-size:0.82rem;color:#92400e;margin:0;line-height:1.65;">
                <strong>Next steps:</strong> Our team will review your request and send you a formal invoice.
                For the quickest confirmation, contact us on WhatsApp at <strong>+254 715 510 119</strong>.
              </p>
            </div>

            <p style="color:#9098a9;font-size:0.78rem;line-height:1.7;margin:0;">
              For inquiries, email us at <a href="mailto:info@crocodilelodge.co.ke" style="color:#1a1a2e;">info@crocodilelodge.co.ke</a>
            </p>
          </div>

          <div style="background:#f5f6fa;border-top:1px solid #eef0f4;padding:20px 44px;text-align:center;">
            <p style="font-size:0.68rem;color:#9098a9;letter-spacing:0.1em;margin:0;">Crocodile Lodge · Diani Beach, Kwale County, Kenya</p>
          </div>
        </div>
      `,
    });

    // ── Admin invoice email ──────────────────────────────────────────────────
    const adminEmail = process.env.ADMIN_EMAIL;
    if (adminEmail) {
      await sendEmail({
        to: adminEmail,
        subject: `New Booking Request – ${property_name} | #${refNum}`,
        html: `
          <div style="font-family:Georgia,serif;max-width:620px;margin:0 auto;color:#1a1a1a;background:#fff;">
            <div style="background:#1a1a2e;padding:28px 36px;">
              <h1 style="font-family:Georgia,serif;color:#f0f0f0;font-size:1.1rem;margin:0;">New Booking Request</h1>
              <p style="color:#c9a84c;font-size:0.68rem;letter-spacing:0.2em;text-transform:uppercase;margin:5px 0 0;">Crocodile Lodge · Ref #${refNum}</p>
            </div>

            <div style="padding:32px 36px;">
              <!-- Two columns: Guest + Property -->
              <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
                <tr>
                  <td style="vertical-align:top;width:50%;padding-right:16px;">
                    <p style="font-size:0.6rem;letter-spacing:0.18em;text-transform:uppercase;color:#9098a9;margin:0 0 10px;font-weight:bold;">Guest Details</p>
                    <p style="font-size:0.9rem;font-weight:bold;margin:0 0 4px;">${name.trim()}</p>
                    <p style="font-size:0.82rem;color:#6b7280;margin:0 0 3px;">${email.trim().toLowerCase()}</p>
                    <p style="font-size:0.82rem;color:#6b7280;margin:0;">+254${phone.trim().replace(/\D/g,'')}</p>
                  </td>
                  <td style="vertical-align:top;width:50%;padding-left:16px;border-left:1px solid #eef0f4;">
                    <p style="font-size:0.6rem;letter-spacing:0.18em;text-transform:uppercase;color:#9098a9;margin:0 0 10px;font-weight:bold;">Booking Details</p>
                    <p style="font-size:0.9rem;font-weight:bold;margin:0 0 4px;">${property_name}</p>
                    <p style="font-size:0.82rem;color:#6b7280;margin:0 0 3px;">${fmtDate(checkin)} → ${fmtDate(checkout)}</p>
                    <p style="font-size:0.82rem;color:#6b7280;margin:0;">${nights} nights · ${guestCount} guests</p>
                  </td>
                </tr>
              </table>

              <!-- Invoice line items -->
              <table style="width:100%;border-collapse:collapse;background:#f5f6fa;border-radius:10px;overflow:hidden;margin-bottom:24px;">
                <tr style="background:#eef0f4;">
                  <th style="text-align:left;padding:10px 16px;font-size:0.62rem;letter-spacing:0.14em;text-transform:uppercase;color:#9098a9;font-weight:bold;">Description</th>
                  <th style="text-align:right;padding:10px 16px;font-size:0.62rem;letter-spacing:0.14em;text-transform:uppercase;color:#9098a9;font-weight:bold;">Amount</th>
                </tr>
                <tr style="background:#fff;">
                  <td style="padding:12px 16px;font-size:0.85rem;border-bottom:1px solid #eef0f4;">Accommodation (${nights} night${nights !== 1 ? "s" : ""})</td>
                  <td style="text-align:right;padding:12px 16px;font-size:0.85rem;border-bottom:1px solid #eef0f4;">Ksh ${Number(total_price).toLocaleString()}</td>
                </tr>
                <tr style="background:#1a1a2e;">
                  <td style="padding:14px 16px;font-size:0.9rem;font-weight:bold;color:#fff;">Total Due</td>
                  <td style="text-align:right;padding:14px 16px;font-size:1rem;font-weight:bold;color:#c9a84c;">Ksh ${Number(total_price).toLocaleString()}</td>
                </tr>
              </table>

              <div style="background:#fef3c7;border:1px solid #fcd34d;border-radius:8px;padding:14px 16px;margin-bottom:24px;">
                <p style="font-size:0.8rem;color:#92400e;margin:0;font-weight:bold;">⏳ Pending Confirmation</p>
                <p style="font-size:0.78rem;color:#92400e;margin:6px 0 0;line-height:1.5;">Please review and confirm or decline this booking in the admin dashboard.</p>
              </div>

              <a href="${process.env.SITE_URL ?? 'https://crocodilelodge.co.ke'}/crocodile-admin/dashboard"
                 style="display:inline-block;background:#c9a84c;color:#fff;padding:12px 28px;text-decoration:none;font-size:0.75rem;letter-spacing:0.15em;text-transform:uppercase;border-radius:8px;font-family:Georgia,serif;">
                View in Dashboard →
              </a>
            </div>
          </div>
        `,
      });
    }

    return res.status(201).json({ message: "Reservation created successfully", reservation: data });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
