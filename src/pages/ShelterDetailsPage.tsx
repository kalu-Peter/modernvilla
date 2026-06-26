import React, { useState, useRef, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { SHELTERS, SHELTER_DISPLAY_NAMES } from "../types";
import { getShelterPrice } from "../types";
import { useCurrency } from "../context/CurrencyContext";
import TopBar from "../components/TopBar";
import Header from "../components/Header";
import SEO from "../components/SEO";
import {
  ArrowLeft,
  BedDouble,
  Bed,
  Bath,
  Users,
  Camera,
  ChevronLeft,
  ChevronRight,
  X,
  Wifi,
  ShowerHead,
  UtensilsCrossed,
  Refrigerator,
  Microwave,
  Car,
  PawPrint,
  Wind,
  Flame,
  ShieldAlert,
  WashingMachine,
  Tv,
  KeyRound,
  TreePine,
  Coffee,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

const WA_NUMBER = "";

// Static fee table — the live backend pricing endpoint used by the
// Reservation page returns null/zero room rates in this environment, which
// makes its price breakdown show all €0.00. Rather than depend on that
// flaky endpoint here, these known-correct values are applied directly.
const TAX_PERCENTAGE = 5.5;
const MONETARY_FEE = 40;
const CLEANING_FEE_BY_SHELTER: Record<string, number> = {
  "shelter-a": 80,
  "shelter-b": 80,
  "la-maison-modern": 40,
  "refuge-de-la-martre": 40,
};

function nightsBetween(a: string, b: string) {
  if (!a || !b) return 0;
  const diff = new Date(b).getTime() - new Date(a).getTime();
  return Math.max(0, Math.round(diff / 86400000));
}

// Mirrors the shape of ReservationPage's price breakdown (room charges,
// cleaning fee, monetary fee, tax, total) but driven by the static, reliable
// per-night rate already used elsewhere on this page instead of the backend.
function calculateStaticBreakdown(
  shelterId: string,
  pricePerNight: number | null,
  nights: number,
) {
  if (pricePerNight === null || nights <= 0) return null;

  const roomCharges = pricePerNight * nights;
  const cleaningFee = CLEANING_FEE_BY_SHELTER[shelterId] ?? MONETARY_FEE;
  const monetaryFee = MONETARY_FEE;

  const subtotal = roomCharges + cleaningFee + monetaryFee;
  const taxAmount = Math.round(subtotal * (TAX_PERCENTAGE / 100) * 100) / 100;
  const totalPrice = Math.round((subtotal + taxAmount) * 100) / 100;

  return {
    roomCharges,
    cleaningFee,
    monetaryFee,
    taxAmount,
    taxPercentage: TAX_PERCENTAGE,
    totalPrice,
  };
}

const AMENITY_ICONS: { match: string[]; Icon: React.ElementType }[] = [
  { match: ["wifi"], Icon: Wifi },
  { match: ["bathtub", "bath"], Icon: Bath },
  { match: ["shower"], Icon: ShowerHead },
  { match: ["kitchen", "dishes", "cooking", "stove", "oven", "baking"], Icon: UtensilsCrossed },
  { match: ["refrigerator", "freezer"], Icon: Refrigerator },
  { match: ["microwave"], Icon: Microwave },
  { match: ["parking"], Icon: Car },
  { match: ["pet"], Icon: PawPrint },
  { match: ["air conditioning"], Icon: Wind },
  { match: ["heating"], Icon: Flame },
  { match: ["smoke alarm", "fire extinguisher", "first aid", "safe"], Icon: ShieldAlert },
  { match: ["washer", "laundry"], Icon: WashingMachine },
  { match: ["tv"], Icon: Tv },
  { match: ["self check-in", "lockbox", "private entrance"], Icon: KeyRound },
  { match: ["garden", "patio", "balcony", "backyard", "outdoor", "terrace", "bbq"], Icon: TreePine },
  { match: ["coffee", "hot water kettle"], Icon: Coffee },
  { match: ["dishwasher"], Icon: Sparkles },
];

function getAmenityIcon(label: string) {
  const lower = label.toLowerCase();
  const found = AMENITY_ICONS.find(({ match }) => match.some((m) => lower.includes(m)));
  const Icon = found?.Icon ?? CheckCircle2;
  return <Icon size={18} strokeWidth={1.8} />;
}

const ShelterDetailsPage: React.FC = () => {
  const { t } = useTranslation();
  const { shelterId } = useParams<{ shelterId: string }>();
  const { formatPrice } = useCurrency();

  const shelter = SHELTERS.find((s) => s.id === shelterId);

  const [activeImg, setActiveImg] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [descExpanded, setDescExpanded] = useState(false);
  const [descMaxHeight, setDescMaxHeight] = useState<string>("7.2em");
  const [needsClamp, setNeedsClamp] = useState(true);
  const [checkin, setCheckin] = useState("");
  const [checkout, setCheckout] = useState("");
  const [guestCount, setGuestCount] = useState(1);

  const touchStartX = useRef<number | null>(null);
  const descRef = useRef<HTMLParagraphElement>(null);

  // Reset transient UI state when navigating between shelters (React's
  // "adjust state during render" pattern — avoids an extra effect render pass)
  const [prevShelterId, setPrevShelterId] = useState(shelterId);
  if (shelterId !== prevShelterId) {
    setPrevShelterId(shelterId);
    setActiveImg(0);
    setLightboxOpen(false);
    setDescExpanded(false);
    setCheckin("");
    setCheckout("");
    setGuestCount(1);
  }

  useEffect(() => {
    if (descExpanded && descRef.current) {
      setDescMaxHeight(`${descRef.current.scrollHeight}px`);
    } else {
      setDescMaxHeight("7.2em");
    }
  }, [descExpanded, shelter?.description]);

  useEffect(() => {
    const el = descRef.current;
    if (!el) return;
    setNeedsClamp(el.scrollHeight > el.clientHeight + 2);
  }, [shelter?.description]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("vdp-visible");
        });
      },
      { threshold: 0.15 },
    );
    document.querySelectorAll(".vdp-reveal").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [shelterId]);

  useEffect(() => {
    if (!lightboxOpen) return;
    const images = shelter?.gallery && shelter.gallery.length > 0 ? shelter.gallery : shelter ? [shelter.image] : [];
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxOpen(false);
      if (e.key === "ArrowLeft") setActiveImg((i) => Math.max(0, i - 1));
      if (e.key === "ArrowRight") setActiveImg((i) => Math.min(images.length - 1, i + 1));
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lightboxOpen]);

  if (!shelter) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#ffffff",
          color: "#0a0a0a",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}
        >
          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "2rem",
            }}
          >
            {t("shelterDetails.notFound")}
          </h2>
          <Link
            to="/"
            style={{
              color: "#b8913e",
              fontFamily: "'Josefin Sans', sans-serif",
              fontSize: "0.8rem",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
            }}
          >
            {t("common.backToHome")}
          </Link>
        </div>
      </div>
    );
  }

  const images =
    shelter.gallery && shelter.gallery.length > 0 ? shelter.gallery : [shelter.image];

  const displayName = SHELTER_DISPLAY_NAMES[shelter.id] ?? shelter.name;

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) setActiveImg((i) => Math.min(i + 1, images.length - 1));
      else setActiveImg((i) => Math.max(i - 1, 0));
    }
    touchStartX.current = null;
  };

  const openLightbox = (index: number) => {
    setActiveImg(index);
    setLightboxOpen(true);
  };

  const waLink = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(
    t("shelterDetails.waMessage", { shelterName: displayName }),
  )}`;

  const nights = nightsBetween(checkin, checkout);
  const price = getShelterPrice(shelter.id, guestCount);
  const thumbs = images.slice(1, 5);

  const breakdown = calculateStaticBreakdown(shelter.id, price, nights);

  return (
    <>
      <SEO
        title={displayName}
        description={`${displayName} at Alsace Hideaways, Alsace — sleeps up to ${shelter.maxGuests} guests. Luxury vacation rental in France.`}
        image={shelter.image}
        url={`/shelter/${shelter.id}`}
        type="article"
      />
      <style>{`
        :root {
          --croc-deep: #0a0a0a;
          --croc-forest: #141414;
          --croc-moss: #282828;
          --croc-sage: #505050;
          --croc-sand: #d4d4d4;
          --croc-cream: #f0f0f0;
          --croc-gold: #4B7BA7;
          --croc-amber: #e0e0e0;
        }

        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        body { font-family: 'Cormorant Garamond', serif; background: #dbdbdb; color: #1a1a2e; overflow-x: hidden; }

        /* ── SHELTER DETAILS PAGE ── */
        .vdp-page { min-height: 100vh; background: #f5f6fa; padding-top: 140px; }
        @media (max-width: 768px) {
          .vdp-page { padding-top: 130px; }
        }

        .vdp-container { max-width: 1140px; margin: 0 auto; padding: 0 40px 100px; }
        @media (max-width: 768px) {
          .vdp-container { padding: 0 20px 80px; }
        }

        .vdp-back {
          display: inline-flex; align-items: center; gap: 8px; margin-bottom: 24px;
          font-family: 'Inter', sans-serif; font-size: 0.72rem; font-weight: 600;
          letter-spacing: 0.04em; text-transform: uppercase;
          color: #9098a9; text-decoration: none;
          transition: color 0.2s, gap 0.2s;
        }
        .vdp-back:hover { color: #c9a84c; gap: 12px; }

        /* ── HERO GALLERY ── */
        .vdp-hero-gallery {
          position: relative;
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 8px;
          border-radius: 20px;
          overflow: hidden;
          margin-bottom: 32px;
        }
        .vdp-hero-main {
          position: relative; border: none; padding: 0; cursor: pointer;
          background: #eef0f4; display: block; width: 100%; height: 460px;
          overflow: hidden;
        }
        .vdp-hero-main img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 0.5s ease; }
        .vdp-hero-main:hover img { transform: scale(1.04); }

        .vdp-hero-thumbs {
          display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr;
          gap: 8px; height: 460px;
        }
        .vdp-hero-thumb {
          position: relative; border: none; padding: 0; cursor: pointer; overflow: hidden;
          background: #eef0f4;
        }
        .vdp-hero-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 0.4s ease; }
        .vdp-hero-thumb:hover img { transform: scale(1.08); }

        .vdp-photos-badge {
          position: absolute; bottom: 18px; right: 18px; z-index: 5;
          display: flex; align-items: center; gap: 7px;
          background: rgba(10,10,10,0.68); color: #fff; border: none;
          padding: 9px 18px; border-radius: 30px; cursor: pointer;
          font-family: 'Inter', sans-serif; font-size: 0.78rem; font-weight: 600;
          backdrop-filter: blur(4px);
          transition: background 0.2s, transform 0.2s;
        }
        .vdp-photos-badge:hover { background: rgba(10,10,10,0.85); transform: translateY(-1px); }

        @media (max-width: 768px) {
          .vdp-hero-gallery { grid-template-columns: 1fr; border-radius: 14px; }
          .vdp-hero-main { height: 260px; }
          .vdp-hero-thumbs { height: auto; grid-auto-rows: 90px; }
        }

        /* ── 2-COL LAYOUT ── */
        .vdp-layout { display: grid; grid-template-columns: 1fr 380px; gap: 32px; align-items: start; }
        @media (max-width: 1024px) {
          .vdp-layout { grid-template-columns: 1fr; }
        }

        /* ── PROPERTY INFO CARD ── */
        .vdp-card {
          background: #ffffff; border-radius: 20px; padding: 40px;
          box-shadow: 0 4px 24px rgba(0,0,0,0.06);
          transition: box-shadow 0.3s ease;
        }
        .vdp-card:hover { box-shadow: 0 10px 36px rgba(0,0,0,0.09); }
        @media (max-width: 768px) {
          .vdp-card { padding: 24px 20px; border-radius: 16px; }
        }

        .vdp-type {
          font-family: 'Inter', sans-serif; font-size: 0.65rem; font-weight: 700;
          letter-spacing: 0.1em; text-transform: uppercase; color: #c9a84c; margin-bottom: 8px;
        }
        .vdp-info-name {
          font-family: 'Playfair Display', serif; font-size: 2rem; font-weight: 800;
          color: #0a0a0a; margin-bottom: 14px; line-height: 1.15;
        }
        @media (max-width: 600px) {
          .vdp-info-name { font-size: 1.5rem; }
        }

        .vdp-info-stats {
          display: flex; align-items: center; gap: 18px; flex-wrap: wrap;
          font-family: 'Inter', sans-serif; font-size: 0.85rem; font-weight: 500;
          color: #4b5563; margin-bottom: 22px;
        }
        .vdp-info-stat { display: flex; align-items: center; gap: 7px; }
        .vdp-info-stat svg { color: #b8913e; }

        .vdp-capacity {
          display: flex; align-items: center; gap: 14px;
          padding: 16px 20px; background: #f9fafb; border-radius: 14px;
          margin-bottom: 28px; color: #1a1a2e;
          font-family: 'Inter', sans-serif; font-size: 0.95rem;
        }
        .vdp-capacity svg { color: #b8913e; flex-shrink: 0; }
        .vdp-capacity strong { font-weight: 800; }

        .vdp-section-title {
          font-family: 'Playfair Display', serif; font-size: 1.25rem; font-weight: 700;
          color: #1a1a2e; margin-bottom: 16px;
        }

        .vdp-desc-wrap { margin-bottom: 32px; }
        .vdp-description {
          font-family: 'Cormorant Garamond', serif; font-size: 1.12rem;
          color: rgba(10,10,10,0.72); line-height: 1.6;
          overflow: hidden; transition: max-height 0.4s ease;
        }
        .vdp-show-more {
          margin-top: 10px; background: none; border: none; padding: 0; cursor: pointer;
          font-family: 'Inter', sans-serif; font-size: 0.82rem; font-weight: 700;
          color: #b8913e; text-decoration: underline; transition: color 0.2s;
        }
        .vdp-show-more:hover { color: #8b6914; }

        /* amenities grid */
        .vdp-amenities { border-top: 1px solid rgba(0,0,0,0.08); padding-top: 28px; }
        .vdp-amenities-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px 24px; }
        @media (max-width: 600px) {
          .vdp-amenities-grid { grid-template-columns: 1fr; }
        }
        .vdp-amenity-item {
          display: flex; align-items: center; gap: 12px;
          font-family: 'Inter', sans-serif; font-size: 0.92rem; color: #374151;
        }
        .vdp-amenity-icon {
          display: flex; align-items: center; justify-content: center;
          width: 36px; height: 36px; border-radius: 50%;
          background: #f5f6fa; color: #b8913e; flex-shrink: 0;
        }

        /* ── BOOKING WIDGET ── */
        .vdp-widget {
          position: sticky; top: 110px;
          background: #ffffff; border: 1px solid #eef0f4;
          border-radius: 20px; overflow: hidden;
          box-shadow: 0 4px 24px rgba(0,0,0,0.08);
          transition: box-shadow 0.3s ease;
        }
        .vdp-widget:hover { box-shadow: 0 10px 36px rgba(0,0,0,0.12); }
        @media (max-width: 1024px) {
          .vdp-widget { position: static; }
        }
        .vdp-widget-body { padding: 28px; display: flex; flex-direction: column; gap: 18px; }

        .vdp-widget-label {
          font-family: 'Inter', sans-serif; font-size: 0.68rem; font-weight: 700;
          letter-spacing: 0.1em; text-transform: uppercase; color: #9098a9; margin-bottom: 6px;
        }

        /* trip-summary block — mirrors ReservationPage's .rp-card */
        .rp-card-divider { border: none; border-top: 1px solid #f3f4f6; margin: 0; }
        .rp-card-shelter { font-family: 'Playfair Display', serif; font-size: 1.05rem; font-weight: 700; color: #1a1a2e; }
        .rp-card-loc { font-family: 'Inter', sans-serif; font-size: 0.72rem; color: #9098a9; margin-top: 2px; }
        .rp-card-breakdown {
          display: flex; flex-direction: column; gap: 10px;
          padding: 14px 16px; background: #f9fafb; border: 1px solid #eef0f4; border-radius: 12px;
        }
        .rp-card-line {
          display: flex; justify-content: space-between; align-items: center;
          font-family: 'Inter', sans-serif; font-size: 0.8rem; color: #6b7280;
        }
        .rp-card-line.total {
          font-size: 0.95rem; font-weight: 800; color: #1a1a2e;
          margin-top: 4px; padding-top: 10px; border-top: 1.5px solid #eef0f4;
        }
        .rp-card-nights-badge {
          display: inline-block; background: #eef0f4; border-radius: 20px;
          font-size: 0.68rem; font-weight: 600; color: #9098a9; padding: 2px 9px; margin-left: 4px;
        }
        .rp-card-zero {
          text-align: center; color: #c4c9d4; font-family: 'Inter', sans-serif;
          font-size: 0.78rem; padding: 14px 0;
          background: #f9fafb; border: 1px solid #eef0f4; border-radius: 12px;
        }

        .vdp-field label {
          display: block; font-family: 'Inter', sans-serif; font-size: 0.65rem; font-weight: 600;
          letter-spacing: 0.05em; text-transform: uppercase; color: #9098a9; margin-bottom: 8px;
        }
        .vdp-field input {
          width: 100%; padding: 11px 14px;
          background: #f9fafb; border: 1.5px solid #e5e7eb;
          border-radius: 10px; font-family: 'Cormorant Garamond', serif; font-size: 1rem;
          color: #1a1a2e; outline: none; transition: border-color 0.18s, box-shadow 0.18s;
        }
        .vdp-field input:focus { border-color: #c9a84c; box-shadow: 0 0 0 3px rgba(201,168,76,0.12); background: #fff; }
        .vdp-dates { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

        .vdp-reserve-btn {
          display: block; width: 100%; text-align: center; padding: 17px;
          background: #ff385c; color: #ffffff; border: none; border-radius: 14px;
          font-family: 'Inter', sans-serif; font-size: 0.95rem; font-weight: 700;
          letter-spacing: 0.01em; text-decoration: none; cursor: pointer;
          transition: background 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
          box-shadow: 0 6px 18px rgba(255,56,92,0.35);
        }
        .vdp-reserve-btn:hover { background: #e31c5f; transform: translateY(-2px); box-shadow: 0 10px 24px rgba(255,56,92,0.4); }
        @media (max-width: 1024px) {
          .vdp-reserve-btn { width: 100%; }
        }

        /* guest selector override for light bg */
        .vdp-page .guest-selector { border: 1px solid rgba(0,0,0,0.18); background: #f9f9f9; }
        .vdp-page .guest-step-btn { color: #b8913e; }
        .vdp-page .guest-step-btn:disabled { color: #bbb; }
        .vdp-page .guest-count-display {
          color: #0a0a0a;
          border-left: 1px solid rgba(0,0,0,0.12);
          border-right: 1px solid rgba(0,0,0,0.12);
        }
        .vdp-page .guest-count-display span { color: rgba(10,10,10,0.4); }

        /* ── LIGHTBOX ── */
        .vdp-lightbox {
          position: fixed; inset: 0; background: rgba(0,0,0,0.92); z-index: 2000;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          padding: 50px 20px 30px; animation: vdpFadeIn 0.25s ease;
        }
        @keyframes vdpFadeIn { from { opacity: 0; } to { opacity: 1; } }
        .vdp-lightbox-stage { position: relative; max-width: 1100px; width: 100%; }
        .vdp-lightbox-stage img { width: 100%; max-height: 70vh; object-fit: contain; display: block; border-radius: 8px; }
        .vdp-lightbox-close {
          position: fixed; top: 20px; right: 20px; z-index: 2001;
        }
        .vdp-lightbox-thumbs {
          display: flex; gap: 8px; margin-top: 20px; max-width: 1100px; width: 100%;
          overflow-x: auto; padding-bottom: 4px;
          scrollbar-width: thin; scrollbar-color: #666 transparent;
        }
        .vdp-thumb {
          flex-shrink: 0; width: 72px; height: 52px; border: 2px solid transparent;
          border-radius: 4px; overflow: hidden; cursor: pointer; padding: 0;
          background: none; opacity: 0.5; transition: opacity 0.2s, border-color 0.2s;
        }
        .vdp-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .vdp-thumb:hover, .vdp-thumb.active { opacity: 1; border-color: #c9a84c; }

        /* reveal-on-scroll */
        .vdp-reveal { opacity: 0; transform: translateY(24px); transition: opacity 0.6s ease, transform 0.6s ease; }
        .vdp-reveal.vdp-visible { opacity: 1; transform: translateY(0); }
      `}</style>

      <TopBar />
      <Header />

      <div className="vdp-page">
        <div className="vdp-container">
          <Link to="/" className="vdp-back">
            <ArrowLeft size={14} /> {t("common.backToHome")}
          </Link>

          {/* HERO GALLERY */}
          <div className="vdp-hero-gallery vdp-reveal">
            <button
              className="vdp-hero-main"
              onClick={() => openLightbox(activeImg)}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              aria-label={t("shelterDetails.openGallery")}
            >
              <img
                src={images[activeImg]}
                alt={`${displayName} — photo ${activeImg + 1}`}
                decoding="async"
              />
            </button>

            {thumbs.length > 0 && (
              <div className="vdp-hero-thumbs">
                {thumbs.map((src, i) => (
                  <button
                    key={i + 1}
                    className="vdp-hero-thumb"
                    onClick={() => openLightbox(i + 1)}
                    aria-label={`${t("shelterDetails.openGallery")} ${i + 2}`}
                  >
                    <img
                      src={src}
                      alt={`${displayName} — photo ${i + 2}`}
                      loading="lazy"
                      decoding="async"
                    />
                  </button>
                ))}
              </div>
            )}

            {images.length > 1 && (
              <button className="vdp-photos-badge" onClick={() => openLightbox(activeImg)}>
                <Camera size={15} /> {t("shelterDetails.photos", { count: images.length })}
              </button>
            )}
          </div>

          {/* LAYOUT */}
          <div className="vdp-layout">
            {/* MAIN COLUMN */}
            <div>
              <div className="vdp-card vdp-reveal">
                <div className="vdp-type">{shelter.type}</div>
                <h1 className="vdp-info-name">{displayName}</h1>

                <div className="vdp-info-stats">
                  {shelter.bedrooms && (
                    <span className="vdp-info-stat">
                      <BedDouble size={16} /> {t("common.bedroom", { count: shelter.bedrooms })}
                    </span>
                  )}
                  {shelter.beds && (
                    <span className="vdp-info-stat">
                      <Bed size={16} /> {t("common.bed", { count: shelter.beds })}
                    </span>
                  )}
                  {shelter.bathrooms && (
                    <span className="vdp-info-stat">
                      <Bath size={16} /> {t("common.bathroom", { count: shelter.bathrooms })}
                    </span>
                  )}
                </div>

                {/* Capacity & size */}
                <div className="vdp-capacity">
                  <Users size={22} />
                  <span>
                    {t("shelterDetails.maximumGuests")}: <strong>{shelter.maxGuests}</strong>
                  </span>
                </div>

                {/* Description */}
                <div className="vdp-desc-wrap">
                  <h2 className="vdp-section-title">{t("shelterDetails.aboutProperty")}</h2>
                  <p
                    ref={descRef}
                    className="vdp-description"
                    style={{ whiteSpace: "pre-line", maxHeight: descMaxHeight }}
                  >
                    {shelter.description}
                  </p>
                  {needsClamp && (
                    <button
                      className="vdp-show-more"
                      onClick={() => setDescExpanded((v) => !v)}
                      aria-expanded={descExpanded}
                    >
                      {descExpanded ? t("shelterDetails.showLess") : t("shelterDetails.showMore")}
                    </button>
                  )}
                </div>

                {/* Amenities */}
                {shelter.amenities && shelter.amenities.length > 0 && (
                  <div className="vdp-amenities">
                    <h2 className="vdp-section-title">{t("shelterDetails.features")}</h2>
                    <div className="vdp-amenities-grid">
                      {shelter.amenities.map((amenity) => (
                        <div key={amenity} className="vdp-amenity-item">
                          <span className="vdp-amenity-icon">{getAmenityIcon(amenity)}</span>
                          <span>{amenity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* STICKY BOOKING SIDEBAR */}
            <div className="vdp-reveal">
              <div className="vdp-widget">
                {shelter.contactOnly ? (
                  <div className="vdp-widget-body">
                    <div className="vdp-widget-label">{t("shelterDetails.bestPrice")}</div>
                    <p
                      style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: "1rem",
                        color: "rgba(10,10,10,0.65)",
                        lineHeight: 1.6,
                      }}
                    >
                      {t("shelterDetails.contactOnlyNote")}
                    </p>
                    <a
                      className="btn-reserve-now"
                      href={waLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        backgroundColor: "#25d366",
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        justifyContent: "center",
                      }}
                    >
                      <svg width="18" height="18" viewBox="0 0 32 32" fill="white" xmlns="http://www.w3.org/2000/svg">
                        <path d="M16 0C7.163 0 0 7.163 0 16c0 2.822.737 5.469 2.027 7.773L0 32l8.473-2.007A15.938 15.938 0 0 0 16 32c8.837 0 16-7.163 16-16S24.837 0 16 0zm0 29.333a13.27 13.27 0 0 1-6.77-1.853l-.485-.29-5.027 1.19 1.213-4.903-.317-.503A13.267 13.267 0 0 1 2.667 16C2.667 8.636 8.636 2.667 16 2.667S29.333 8.636 29.333 16 23.364 29.333 16 29.333zm7.27-9.87c-.397-.2-2.352-1.16-2.717-1.293-.364-.133-.63-.2-.896.2-.265.397-1.03 1.293-1.262 1.56-.232.265-.464.298-.86.1-.397-.2-1.676-.617-3.192-1.97-1.18-1.052-1.977-2.352-2.208-2.748-.232-.397-.025-.612.174-.81.179-.178.397-.464.596-.696.2-.232.265-.397.397-.663.133-.265.067-.497-.033-.696-.1-.2-.896-2.16-1.228-2.958-.323-.775-.65-.67-.896-.683l-.763-.013c-.265 0-.696.1-1.06.497-.364.397-1.393 1.36-1.393 3.317s1.427 3.847 1.626 4.113c.2.265 2.807 4.287 6.803 6.013.95.41 1.692.655 2.27.838.953.303 1.82.26 2.506.158.764-.114 2.352-.962 2.683-1.89.33-.928.33-1.724.232-1.89-.1-.165-.364-.265-.762-.464z" />
                      </svg>
                      {t("common.contactWhatsapp")}
                    </a>
                  </div>
                ) : (
                  <div className="vdp-widget-body">
                    <div className="rp-card-shelter">{displayName}</div>
                    <div className="rp-card-loc">
                      {t("footer.address")} · {t("common.bed", { count: shelter.bedrooms ?? 1 })}
                    </div>

                    <div className="vdp-dates">
                      <div className="vdp-field">
                        <label>{t("reservation.checkIn")}</label>
                        <input
                          type="date"
                          value={checkin}
                          onChange={(e) => setCheckin(e.target.value)}
                        />
                      </div>
                      <div className="vdp-field">
                        <label>{t("reservation.checkOut")}</label>
                        <input
                          type="date"
                          value={checkout}
                          onChange={(e) => setCheckout(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="vdp-field">
                      <label>{t("reservation.guests")}</label>
                      <div className="guest-selector">
                        <button
                          className="guest-step-btn"
                          onClick={() => setGuestCount((g) => Math.max(1, g - 1))}
                          disabled={guestCount <= 1}
                          aria-label={t("shelterDetails.removeGuest")}
                        >
                          −
                        </button>
                        <div className="guest-count-display">
                          {guestCount} <span>{t("common.guestWord", { count: guestCount })}</span>
                        </div>
                        <button
                          className="guest-step-btn"
                          onClick={() => setGuestCount((g) => Math.min(shelter.maxGuests, g + 1))}
                          disabled={guestCount >= shelter.maxGuests}
                          aria-label={t("shelterDetails.addGuest")}
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {breakdown ? (
                      <div className="rp-card-breakdown">
                        <div className="rp-card-line">
                          <span>
                            {t("reservation.roomCharges")}{" "}
                            <span className="rp-card-nights-badge">{nights}n</span>
                          </span>
                          <span>{formatPrice(breakdown.roomCharges)}</span>
                        </div>
                        <div className="rp-card-line">
                          <span>{t("reservation.cleaningFee")}</span>
                          <span>{formatPrice(breakdown.cleaningFee)}</span>
                        </div>
                        <div className="rp-card-line">
                          <span>{t("reservation.monetaryFee")}</span>
                          <span>{formatPrice(breakdown.monetaryFee)}</span>
                        </div>
                        <div className="rp-card-line">
                          <span>{t("reservation.tax", { pct: breakdown.taxPercentage })}</span>
                          <span>{formatPrice(breakdown.taxAmount)}</span>
                        </div>
                        <div className="rp-card-line total">
                          <span>{t("reservation.total")}</span>
                          <span>{formatPrice(breakdown.totalPrice)}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="rp-card-zero">{t("reservation.selectDatesPricing")}</div>
                    )}

                    <Link
                      to={`/reservation?shelterId=${shelter.id}&checkin=${checkin}&checkout=${checkout}&guestCount=${guestCount}`}
                      className="vdp-reserve-btn"
                    >
                      {t("common.reserve")}
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* LIGHTBOX */}
      {lightboxOpen && (
        <div
          className="vdp-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={t("shelterDetails.openGallery")}
          onClick={() => setLightboxOpen(false)}
        >
          <button
            className="modal-close vdp-lightbox-close"
            onClick={() => setLightboxOpen(false)}
            aria-label={t("shelterDetails.closeGallery")}
            autoFocus
          >
            <X size={18} />
          </button>

          <div className="vdp-lightbox-stage" onClick={(e) => e.stopPropagation()}>
            <img
              src={images[activeImg]}
              alt={`${displayName} — photo ${activeImg + 1}`}
            />
            {activeImg > 0 && (
              <button
                className="gallery-arrow gallery-arrow--prev"
                onClick={() => setActiveImg((i) => i - 1)}
                aria-label="Previous"
              >
                <ChevronLeft size={22} />
              </button>
            )}
            {activeImg < images.length - 1 && (
              <button
                className="gallery-arrow gallery-arrow--next"
                onClick={() => setActiveImg((i) => i + 1)}
                aria-label="Next"
              >
                <ChevronRight size={22} />
              </button>
            )}
            <div className="gallery-counter">
              {activeImg + 1} / {images.length}
            </div>
          </div>

          <div className="vdp-lightbox-thumbs" onClick={(e) => e.stopPropagation()}>
            {images.map((src, i) => (
              <button
                key={i}
                className={`vdp-thumb${i === activeImg ? " active" : ""}`}
                onClick={() => setActiveImg(i)}
              >
                <img src={src} alt={`Thumbnail ${i + 1}`} loading="lazy" decoding="async" />
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default ShelterDetailsPage;
