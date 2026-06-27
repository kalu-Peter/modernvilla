import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation, Trans } from "react-i18next";
import { SHELTERS, SHELTER_DISPLAY_NAMES, getPropertyNameForShelter } from "../types";
import TopBar from "../components/TopBar";
import Header from "../components/Header";
import { useCurrency } from "../context/CurrencyContext";
import { formatDate as formatLocalDate, getDefaultDateRange } from "../utils/dates";
import {
  SHELTER_TO_PROPERTY_ID,
  calculateDetailedPrice,
  fetchPropertyPricing,
  nightsBetween,
  type PropertyPricing,
} from "../utils/pricing";

const MIN_NIGHTS: Record<string, number> = {
  "shelter-a": 2,
  "shelter-b": 2,
  "la-maison-modern": 2,
  "refuge-de-la-martre": 2,
};

function getMinNights(shelterId: string) {
  return MIN_NIGHTS[shelterId] ?? 1;
}

function minCheckout(checkin: string, shelterId: string) {
  if (!checkin) return "";
  const d = new Date(checkin);
  d.setDate(d.getDate() + getMinNights(shelterId));
  return d.toISOString().split("T")[0];
}

function formatDate(d: string, locale: string) {
  if (!d) return "";
  return new Date(d + "T00:00:00").toLocaleDateString(
    locale === "fr" ? "fr-FR" : "en-GB",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    },
  );
}

const ReservationPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const { formatPrice } = useCurrency();

  const shelterId = queryParams.get("shelterId") ?? "";
  const shelter = SHELTERS.find((s) => s.id === shelterId);

  // Same 3-night default the home hero search uses, applied whenever this
  // page is opened without dates already chosen (e.g. a direct link).
  const queryCheckin = queryParams.get("checkin") ?? queryParams.get("checkIn");
  const queryCheckout = queryParams.get("checkout") ?? queryParams.get("checkOut");
  const dateDefaults = getDefaultDateRange();
  const [checkin, setCheckin] = useState(queryCheckin ?? dateDefaults.checkin);
  const [checkout, setCheckout] = useState(queryCheckout ?? dateDefaults.checkout);
  const [guestCount, setGuestCount] = useState(
    Number(queryParams.get("guestCount") ?? 1),
  );
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [confirmationId, setConfirmationId] = useState("");

  useEffect(() => {
    if (!shelterId) navigate("/");
  }, [shelterId, navigate]);

  if (!shelter) return null;

  const displayName = SHELTER_DISPLAY_NAMES[shelter.id] ?? shelter.name;

  // Fetch pricing from new API
  const [pricing, setPricing] = React.useState<PropertyPricing | null>(null);

  const minNights = getMinNights(shelter.id);
  const nights = nightsBetween(checkin, checkout);

  // Fetch property pricing from database
  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      const propertyId = shelter ? SHELTER_TO_PROPERTY_ID[shelter.id] : undefined;
      const result = propertyId ? await fetchPropertyPricing(propertyId) : null;
      if (!cancelled) setPricing(result);
    })();
    return () => {
      cancelled = true;
    };
  }, [shelter]);

  const priceBreakdown =
    checkin && checkout && pricing && guestCount > 0
      ? calculateDetailedPrice(pricing, checkin, checkout, guestCount)
      : null;

  const total = priceBreakdown?.totalPrice ?? 0;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const validate = () => {
    if (!checkin || !checkout || nights <= 0) {
      setSubmitError(t("reservation.errorInvalidDates"));
      return false;
    }
    if (nights < minNights) {
      setSubmitError(
        t("reservation.errorMinNights", {
          shelterName: displayName,
          count: minNights,
        }),
      );
      return false;
    }
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setSubmitError(t("reservation.errorFullName"));
      return false;
    }
    if (
      !formData.email.trim() ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
    ) {
      setSubmitError(t("reservation.errorInvalidEmail"));
      return false;
    }
    if (!formData.phone.trim()) {
      setSubmitError(t("reservation.errorPhone"));
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitError("");
    if (!validate()) return;
    setSubmitting(true);
    try {
      const propertyName = getPropertyNameForShelter(shelter.id);
      if (!propertyName) {
        setSubmitError(t("reservation.errorPropertyNotFound"));
        setSubmitting(false);
        return;
      }
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          property_name: propertyName,
          guests: guestCount,
          checkin,
          checkout,
          name: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
          phone: formData.phone.trim(),
          email: formData.email.trim().toLowerCase(),
        }),
      });
      const data = (await res.json()) as {
        reservation?: { id: string };
        error?: string;
      };
      if (!res.ok) {
        setSubmitError(data.error ?? t("reservation.errorGeneric"));
        return;
      }
      setConfirmationId(data.reservation?.id ?? "");
      setSubmitted(true);
    } catch {
      setSubmitError(t("reservation.errorNetwork"));
    } finally {
      setSubmitting(false);
    }
  };

  // ── Success screen ──────────────────────────────────────────────────────────
  if (submitted) {
    const waMessage = encodeURIComponent(
      t("reservation.waSuccessMessage", {
        property: displayName,
        checkin: formatDate(checkin, i18n.language),
        checkout: formatDate(checkout, i18n.language),
        guests: guestCount,
        name: `${formData.firstName} ${formData.lastName}`,
        total: formatPrice(total),
      }),
    );

    return (
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=Inter:wght@400;500;600&display=swap');
          * { margin:0; padding:0; box-sizing:border-box; }
          body { font-family:'Inter',sans-serif; background:#dbdbdb; color:#1a1a2e; }
          .success-wrap { min-height:100vh; display:flex; align-items:center; justify-content:center; padding:60px 20px; }
          .success-box { max-width:540px; width:100%; background:#fff; border-radius:20px; padding:52px 48px; box-shadow:0 4px 32px rgba(0,0,0,0.07); border:1px solid #eef0f4; text-align:center; }
          .success-check { width:64px; height:64px; border-radius:50%; background:#d1fae5; color:#059669; font-size:1.8rem; display:flex; align-items:center; justify-content:center; margin:0 auto 28px; }
          .success-box h1 { font-family:'Playfair Display',serif; font-size:2rem; color:#1a1a2e; margin-bottom:12px; }
          .success-box p { color:#6b7280; font-size:0.92rem; line-height:1.75; margin-bottom:10px; }
          .success-id { font-size:0.68rem; font-weight:600; letter-spacing:0.18em; text-transform:uppercase; color:#c4c9d4; margin:12px 0 36px; }
          .success-divider { border:none; border-top:1px solid #f3f4f6; margin:28px 0; }
          .success-note { font-size:0.8rem; color:#9098a9; margin-bottom:28px; line-height:1.6; }
          .wa-btn { display:inline-flex; align-items:center; gap:10px; padding:15px 32px; background:#25d366; color:#fff; font-family:'Inter',sans-serif; font-size:0.8rem; font-weight:600; letter-spacing:0.04em; border:none; border-radius:10px; cursor:pointer; text-decoration:none; margin-bottom:14px; transition:background 0.18s; }
          .wa-btn:hover { background:#1ebe5d; }
          .wa-btn svg { flex-shrink:0; }
          .btn-home { display:inline-block; padding:12px 28px; background:transparent; color:#9098a9; font-family:'Inter',sans-serif; font-size:0.75rem; font-weight:500; border:1.5px solid #e5e7eb; border-radius:10px; cursor:pointer; text-decoration:none; transition:all 0.18s; }
          .btn-home:hover { border-color:#c9a84c; color:#1a1a2e; }
        `}</style>
        <div className="success-wrap">
          <div className="success-box">
            <div className="success-check">✓</div>
            <h1>{t("reservation.successTitle")}</h1>
            <p>
              <Trans
                i18nKey="reservation.successBody"
                values={{
                  firstName: formData.firstName,
                  shelterName: displayName,
                  email: formData.email,
                }}
                components={[<strong key="0" />, <strong key="1" />, <strong key="2" />]}
              />
            </p>
            {confirmationId && (
              <div className="success-id">
                {t("reservation.referenceNumber", {
                  id: confirmationId.substring(0, 8).toUpperCase(),
                })}
              </div>
            )}
            <hr className="success-divider" />
            <p className="success-note">{t("reservation.successNote")}</p>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 12,
              }}
            >
              <a
                href={`https://wa.me/?text=${waMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="wa-btn"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                {t("common.contactWhatsapp")}
              </a>
              <button className="btn-home" onClick={() => navigate("/")}>
                {t("reservation.backToHomeBtn")}
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  // ── Booking form ────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Cormorant+Garamond:wght@300;400&display=swap');
        * { margin:0; padding:0; box-sizing:border-box; }
        body { font-family:'Cormorant Garamond',serif; background:#dbdbdb; color:#1a1a2e; }

        .rp-wrap { max-width:1100px; margin:0 auto; padding:160px 40px 80px; display:grid; grid-template-columns:1fr 380px; gap:56px; align-items:start; }

        /* Left column – form */
        .rp-left h1 { font-family:'Playfair Display',serif; font-size:2rem; font-weight:700; margin-bottom:8px; color:#1a1a2e; }
        .rp-subtitle { font-family:'Inter',sans-serif; font-size:0.78rem; color:#9098a9; margin-bottom:36px; }
        .rp-section { margin-bottom:28px; padding-bottom:28px; border-bottom:1px solid #eef0f4; }
        .rp-section:last-of-type { border-bottom:none; margin-bottom:0; }
        .rp-section-title { font-family:'Inter',sans-serif; font-size:0.62rem; font-weight:700; letter-spacing:0.1em; text-transform:uppercase; color:#9098a9; margin-bottom:16px; }
        .rp-row { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
        .rp-field { margin-bottom:14px; }
        .rp-field:last-child { margin-bottom:0; }
        .rp-field label { display:block; font-family:'Inter',sans-serif; font-size:0.62rem; font-weight:600; letter-spacing:0.06em; text-transform:uppercase; color:#9098a9; margin-bottom:7px; }
        .rp-field input, .rp-field select { width:100%; padding:12px 14px; background:#fff; border:1.5px solid #e5e7eb; border-radius:10px; font-family:'Inter',sans-serif; font-size:0.85rem; color:#1a1a2e; outline:none; transition:border-color 0.18s, box-shadow 0.18s; }
        .rp-field input:focus, .rp-field select:focus { border-color:#c9a84c; box-shadow:0 0 0 3px rgba(201,168,76,0.12); }
        .rp-field input::placeholder { color:#c4c9d4; }
        .rp-phone-wrap { display:flex; }
        .rp-phone-prefix { padding:12px 14px; background:#f5f6fa; border:1.5px solid #e5e7eb; border-right:none; border-radius:10px 0 0 10px; font-family:'Inter',sans-serif; font-size:0.8rem; font-weight:500; color:#6b7280; white-space:nowrap; display:flex; align-items:center; }
        .rp-phone-wrap input { border-radius:0 10px 10px 0 !important; }

        .rp-error { background:#fef2f2; border:1px solid #fecaca; color:#991b1b; font-family:'Inter',sans-serif; font-size:0.78rem; font-weight:500; padding:12px 16px; border-radius:10px; margin-bottom:18px; }

        .rp-submit { width:100%; padding:16px; background:#1a1a2e; color:#fff; font-family:'Inter',sans-serif; font-size:0.8rem; font-weight:600; letter-spacing:0.06em; text-transform:uppercase; border:none; border-radius:12px; cursor:pointer; transition:background 0.2s; margin-top:8px; }
        .rp-submit:hover:not(:disabled) { background:#c9a84c; }
        .rp-submit:disabled { opacity:0.5; cursor:not-allowed; }

        /* Invoice note */
        .rp-invoice-note { background:#fffbf0; border:1.5px solid #f5e4a8; border-radius:12px; padding:18px 20px; margin-top:20px; }
        .rp-invoice-note p { font-family:'Inter',sans-serif; font-size:0.78rem; color:#92400e; line-height:1.65; }
        .rp-invoice-note strong { color:#78350f; }

        /* Right column – summary card */
        .rp-card { background:#fff; border:1px solid #eef0f4; border-radius:18px; padding:32px; box-shadow:0 2px 12px rgba(0,0,0,0.05); position:sticky; top:88px; }
        .rp-card-shelter { font-family:'Playfair Display',serif; font-size:1.25rem; color:#1a1a2e; margin-bottom:4px; }
        .rp-card-loc { font-family:'Inter',sans-serif; font-size:0.72rem; color:#9098a9; margin-bottom:20px; }
        .rp-card-dates { display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:20px; }
        .rp-card-date { background:#f5f6fa; border-radius:10px; padding:12px 14px; }
        .rp-card-date-label { font-family:'Inter',sans-serif; font-size:0.6rem; font-weight:600; letter-spacing:0.08em; text-transform:uppercase; color:#9098a9; margin-bottom:4px; }
        .rp-card-date-val { font-family:'Inter',sans-serif; font-size:0.82rem; font-weight:600; color:#1a1a2e; }
        .rp-card-divider { border:none; border-top:1px solid #f3f4f6; margin:18px 0; }
        .rp-card-line { display:flex; justify-content:space-between; align-items:center; font-family:'Inter',sans-serif; font-size:0.8rem; color:#6b7280; margin-bottom:10px; }
        .rp-card-line.total { font-size:0.92rem; font-weight:700; color:#1a1a2e; margin-top:14px; padding-top:14px; border-top:1.5px solid #eef0f4; margin-bottom:0; }
        .rp-card-nights-badge { display:inline-block; background:#f5f6fa; border-radius:20px; font-size:0.68rem; font-weight:600; color:#9098a9; padding:3px 10px; margin-left:8px; }
        .rp-card-zero { text-align:center; color:#c4c9d4; font-family:'Inter',sans-serif; font-size:0.78rem; padding:12px 0; }

        /* WhatsApp pill */
        .rp-wa-pill { display:flex; align-items:center; gap:8px; margin-top:20px; padding:12px 16px; background:#f0fdf4; border:1px solid #bbf7d0; border-radius:10px; font-family:'Inter',sans-serif; font-size:0.75rem; color:#065f46; font-weight:500; }

        @media (max-width: 900px) {
          .rp-wrap { grid-template-columns:1fr; padding:140px 20px 60px; gap:32px; }
          .rp-card { position:static; }
        }
      `}</style>

      <TopBar />
      <Header />

      <div className="rp-wrap">
        {/* ── Left: form ── */}
        <div className="rp-left">
          <h1>{t("reservation.completeBooking")}</h1>
          <p className="rp-subtitle">{t("reservation.completeBookingSub")}</p>

          <form onSubmit={handleSubmit}>
            {/* Trip dates */}
            <div className="rp-section">
              <div className="rp-section-title">{t("reservation.tripDetails")}</div>
              <div className="rp-row">
                <div className="rp-field">
                  <label>{t("reservation.checkIn")}</label>
                  <input
                    type="date"
                    value={checkin}
                    min={formatLocalDate(new Date())}
                    onChange={(e) => {
                      setCheckin(e.target.value);
                      const min = minCheckout(e.target.value, shelter.id);
                      if (checkout < min) setCheckout(min);
                    }}
                  />
                </div>
                <div className="rp-field">
                  <label>{t("reservation.checkOut")}</label>
                  <input
                    type="date"
                    value={checkout}
                    min={
                      minCheckout(checkin, shelter.id) ||
                      formatLocalDate(new Date())
                    }
                    onChange={(e) => setCheckout(e.target.value)}
                  />
                </div>
              </div>
              <div className="rp-field">
                <label>{t("reservation.guests")}</label>
                <select
                  value={guestCount}
                  onChange={(e) => setGuestCount(Number(e.target.value))}
                >
                  {Array.from(
                    { length: shelter.maxGuests ?? 10 },
                    (_, i) => i + 1,
                  ).map((n) => (
                    <option key={n} value={n}>
                      {t("common.guest", { count: n })}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Guest details */}
            <div className="rp-section">
              <div className="rp-section-title">{t("reservation.yourDetails")}</div>
              <div className="rp-row">
                <div className="rp-field">
                  <label>{t("reservation.firstName")}</label>
                  <input
                    type="text"
                    name="firstName"
                    placeholder="Jane"
                    value={formData.firstName}
                    onChange={handleChange}
                    autoComplete="given-name"
                  />
                </div>
                <div className="rp-field">
                  <label>{t("reservation.lastName")}</label>
                  <input
                    type="text"
                    name="lastName"
                    placeholder="Smith"
                    value={formData.lastName}
                    onChange={handleChange}
                    autoComplete="family-name"
                  />
                </div>
              </div>
              <div className="rp-field">
                <label>{t("reservation.emailAddress")}</label>
                <input
                  type="email"
                  name="email"
                  placeholder="jane@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                />
              </div>
              <div className="rp-field">
                <label>{t("reservation.phoneNumber")}</label>
                <div className="rp-phone-wrap">
                  <span className="rp-phone-prefix">+33</span>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="6 12 34 56 78"
                    value={formData.phone}
                    onChange={handleChange}
                    autoComplete="tel"
                  />
                </div>
              </div>
            </div>

            {submitError && <div className="rp-error">{submitError}</div>}

            <button className="rp-submit" type="submit" disabled={submitting}>
              {submitting ? t("reservation.sendingRequest") : t("reservation.requestBooking")}
            </button>

            <div className="rp-invoice-note">
              <p>
                <strong>{t("reservation.invoiceNoteHow")}</strong>{" "}
                {t("reservation.invoiceNoteBody")}{" "}
                <strong>+33 6 01 94 33 48</strong>.
              </p>
            </div>
          </form>
        </div>

        {/* ── Right: summary card ── */}
        <div className="rp-card">
          <div className="rp-card-shelter">{displayName}</div>
          <div className="rp-card-loc">
            {t("reservation.locationLine")} · {t("common.bed", { count: shelter.bedrooms ?? 1 })}
          </div>

          {checkin && checkout && nights > 0 ? (
            <>
              <div className="rp-card-dates">
                <div className="rp-card-date">
                  <div className="rp-card-date-label">{t("reservation.checkIn")}</div>
                  <div className="rp-card-date-val">{formatDate(checkin, i18n.language)}</div>
                </div>
                <div className="rp-card-date">
                  <div className="rp-card-date-label">{t("reservation.checkOut")}</div>
                  <div className="rp-card-date-val">{formatDate(checkout, i18n.language)}</div>
                </div>
              </div>

              <hr className="rp-card-divider" />

              <div className="rp-card-line">
                <span>
                  {t("reservation.roomCharges")}{" "}
                  {nights > 0 && (
                    <span className="rp-card-nights-badge">{nights}n</span>
                  )}
                </span>
                <span>
                  {formatPrice(priceBreakdown?.roomCharges ?? 0)}
                </span>
              </div>
              {(priceBreakdown?.guestCharges ?? 0) > 0 && (
                <div className="rp-card-line">
                  <span>{t("reservation.extraGuests")}</span>
                  <span>
                    {formatPrice(priceBreakdown?.guestCharges ?? 0)}
                  </span>
                </div>
              )}
              <div className="rp-card-line">
                <span>{t("reservation.cleaningFee")}</span>
                <span>
                  {formatPrice(priceBreakdown?.cleaningFee ?? 0)}
                </span>
              </div>
              <div className="rp-card-line">
                <span>{t("reservation.monetaryFee")}</span>
                <span>
                  {formatPrice(priceBreakdown?.monetaryFee ?? 0)}
                </span>
              </div>
              <div className="rp-card-line">
                <span>
                  {t("reservation.tax", { pct: priceBreakdown?.taxPercentage ?? 0 })}
                </span>
                <span>
                  {formatPrice(priceBreakdown?.taxAmount ?? 0)}
                </span>
              </div>

              <div className="rp-card-line total">
                <span>{t("reservation.total")}</span>
                <span>{formatPrice(total)}</span>
              </div>

              <p
                style={{
                  fontFamily: "'Inter',sans-serif",
                  fontSize: "0.68rem",
                  color: "#9098a9",
                  marginTop: 10,
                  lineHeight: 1.5,
                }}
              >
                {t("reservation.invoiceSentNote")}
              </p>
            </>
          ) : (
            <div className="rp-card-zero">{t("reservation.selectDatesPricing")}</div>
          )}

          <div className="rp-wa-pill">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#25d366">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            {t("reservation.quickReply", { phone: "+33 6 01 94 33 48" })}
          </div>
        </div>
      </div>
    </>
  );
};

export default ReservationPage;
