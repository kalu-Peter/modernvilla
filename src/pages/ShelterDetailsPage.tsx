import React, { useState, useRef, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { SHELTERS } from "../types";
import CurrencySelector from "../components/CurrencySelector";
import LanguageSwitcher from "../components/LanguageSwitcher";
import SEO from "../components/SEO";

const WA_NUMBER = "";

const ShelterDetailsPage: React.FC = () => {
  const { t } = useTranslation();
  const { shelterId } = useParams<{ shelterId: string }>();

  const shelter = SHELTERS.find((s) => s.id === shelterId);

  const [activeImg, setActiveImg] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [navVisible, setNavVisible] = useState(true);
  const touchStartX = useRef<number | null>(null);

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
    shelter.gallery && shelter.gallery.length > 0
      ? shelter.gallery
      : [shelter.image];

  // Nav hide/show on scroll
  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setNavVisible(y < lastY || y < 80);
      lastY = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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

  const waLink = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(
    t("shelterDetails.waMessage", { shelterName: shelter.name }),
  )}`;

  return (
    <>
      <SEO
        title={shelter.name}
        description={`${shelter.name} at Alsace Hideaways, Alsace — sleeps up to ${shelter.maxGuests} guests. Luxury vacation rental in France.`}
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

        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        body { font-family: 'Cormorant Garamond', serif; background: #dbdbdb; color: #1a1a2e; overflow-x: hidden; }

        nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          padding: 22px 60px; display: flex; justify-content: space-between; align-items: center;
          background: rgba(201,168,76,0.95); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(255,255,255,0.18);
          box-shadow: 0 2px 16px rgba(0,0,0,0.08);
          transition: transform 0.35s ease;
        }
        nav.nav-hidden { transform: translateY(-100%); }
        .nav-logo {
          font-family: 'Playfair Display', serif; font-size: 1.4rem; font-weight: 700;
          letter-spacing: 0.05em; color: #f0f0f0; text-decoration: none;
          background: none; border: none; cursor: pointer; padding: 0;
        }
        .nav-logo span { color: #909090; }
        .nav-links { display: flex; gap: 44px; list-style: none; }
        .nav-links a, .nav-links button {
          font-family: 'Inter', sans-serif; font-size: 0.72rem; font-weight: 500;
          letter-spacing: 0.06em; text-transform: uppercase; color: #fff;
          text-decoration: none; opacity: 0.75; transition: opacity 0.2s;
          background: none; border: none; cursor: pointer; padding: 0;
        }
        .nav-links a:hover, .nav-links button:hover { opacity: 1; }

        .language-selector {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-right: 8px;
        }
        .language-selector select {
          font-family: 'Inter', sans-serif;
          font-size: 0.7rem;
          font-weight: 500;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          background: transparent;
          border: 1px solid rgba(255,255,255,0.4);
          color: #fff;
          padding: 6px 10px;
          cursor: pointer;
          outline: none;
          border-radius: 4px;
          transition: border-color 0.2s;
        }
        .language-selector select option { background: #1a1a2e; color: #fff; }
        .language-selector select:hover { border-color: #fff; }

        .hamburger { display: none; flex-direction: column; gap: 6px; background: none; border: none; cursor: pointer; padding: 0; z-index: 101; }
        .hamburger span { width: 24px; height: 2px; background: #f0f0f0; transition: all 0.3s ease; display: block; }
        .hamburger.active span:nth-child(1) { transform: rotate(45deg) translate(8px, 8px); }
        .hamburger.active span:nth-child(2) { opacity: 0; }
        .hamburger.active span:nth-child(3) { transform: rotate(-45deg) translate(7px, -7px); }

        .mobile-menu {
          display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%;
          background: rgba(10,10,10,0.97); z-index: 50; padding-top: 100px;
          flex-direction: column; align-items: center; gap: 30px;
        }
        .mobile-menu.active { display: flex; }
        .mobile-menu a, .mobile-menu button {
          font-family: 'Josefin Sans', sans-serif; font-size: 1rem; letter-spacing: 0.2em;
          text-transform: uppercase; color: #f0f0f0; text-decoration: none;
          background: none; border: none; cursor: pointer; padding: 0; transition: color 0.3s;
        }
        .mobile-menu a:hover, .mobile-menu button:hover { color: #b8913e; }

        /* ── SHELTER DETAILS PAGE ── */
        .vdp-page { min-height: 100vh; background: #f5f6fa; padding-top: 70px; }

        /* ── PAGE HEADER (replaces hero) ── */
        .vdp-header {
          max-width: 860px; margin: 0 auto;
          padding: 36px 40px 20px;
        }
        .vdp-type {
          font-family: 'Inter', sans-serif; font-size: 0.65rem; font-weight: 700;
          letter-spacing: 0.1em; text-transform: uppercase; color: #c9a84c; margin-bottom: 8px;
        }
        .vdp-title {
          font-family: 'Playfair Display', serif; font-size: clamp(1.6rem, 4vw, 2.4rem);
          font-weight: 900; color: #1a1a2e; line-height: 1.1; margin-bottom: 10px;
        }
        .vdp-meta {
          display: flex; gap: 16px; flex-wrap: wrap;
          font-family: 'Inter', sans-serif; font-size: 0.68rem; font-weight: 500;
          letter-spacing: 0.04em; text-transform: uppercase; color: #9098a9;
        }

        /* ── GALLERY ── */
        .vdp-gallery {
          max-width: 860px; margin: 0 auto 0;
          padding: 0 40px;
        }
        .vdp-gallery-main {
          width: 100%; height: 380px; position: relative; overflow: hidden;
          background: #f2f2f2;
        }
        .vdp-gallery-main img { width: 100%; height: 100%; object-fit: cover; transition: opacity 0.3s; display: block; }
        .vdp-thumbs {
          display: flex; gap: 6px; padding: 8px 0; overflow-x: auto;
          scrollbar-width: thin; scrollbar-color: #ccc transparent;
        }
        .vdp-thumb {
          flex-shrink: 0; width: 72px; height: 52px; border: 2px solid transparent;
          border-radius: 4px; overflow: hidden; cursor: pointer; padding: 0;
          background: none; opacity: 0.55; transition: opacity 0.2s, border-color 0.2s;
        }
        .vdp-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .vdp-thumb:hover, .vdp-thumb.active { opacity: 1; border-color: #b8913e; }

        @media(max-width:768px) {
          nav { padding: 18px 20px; }
          .nav-links { display: none; }
          .hamburger { display: flex; }
          .vdp-header { padding: 24px 20px 16px; }
          .vdp-gallery { padding: 0 20px; }
          .vdp-gallery-main { height: 240px; }
          .vdp-thumb { width: 58px; height: 42px; }
        }

        /* ── BODY GRID ── */
        .vdp-body {
          max-width: 860px; margin: 0 auto;
          padding: 36px 40px 100px;
        }
        @media(max-width:768px) {
          .vdp-body { padding: 24px 20px 80px; }
        }

        /* back link */
        .vdp-back {
          display: inline-flex; align-items: center; gap: 8px; margin-bottom: 32px;
          font-family: 'Inter', sans-serif; font-size: 0.72rem; font-weight: 500;
          letter-spacing: 0.04em; text-transform: uppercase;
          color: #9098a9; text-decoration: none;
          transition: color 0.2s;
        }
        .vdp-back:hover { color: #c9a84c; }

        .vdp-section { margin-bottom: 44px; }

        .vdp-info-header { margin-bottom: 20px; }
        .vdp-info-name {
          font-family: 'Playfair Display', serif; font-size: 2rem; font-weight: 700;
          color: #0a0a0a; margin-bottom: 10px; line-height: 1.15;
        }
        .vdp-info-stats {
          display: flex; align-items: center; gap: 0;
          font-family: 'Josefin Sans', sans-serif; font-size: 0.72rem;
          letter-spacing: 0.1em; text-transform: uppercase; color: rgba(10,10,10,0.5);
          flex-wrap: wrap;
        }
        .vdp-info-stat { display: flex; align-items: center; gap: 6px; }
        .vdp-info-dot {
          width: 4px; height: 4px; border-radius: 50%;
          background: rgba(10,10,10,0.25); margin: 0 12px;
        }

        .vdp-description {
          font-family: 'Cormorant Garamond', serif; font-size: 1.12rem;
          color: rgba(10,10,10,0.72); line-height: 1.55; margin-bottom: 32px;
        }

        /* amenities grid */
        .vdp-amenities { border-top: 1px solid rgba(0,0,0,0.08); padding-top: 28px; }
        .vdp-amenities-group { margin-bottom: 22px; }
        .vdp-amenities-group-title {
          font-family: 'Inter', sans-serif; font-size: 0.65rem; font-weight: 700;
          letter-spacing: 0.08em; text-transform: uppercase; color: #9098a9;
          margin-bottom: 12px;
        }
        .vdp-amenities-items {
          display: flex; flex-wrap: wrap; gap: 8px;
        }
        .vdp-amenity-chip {
          display: flex; align-items: center; gap: 8px;
          background: #fff; border: 1.5px solid #eef0f4; border-radius: 20px;
          padding: 7px 14px;
          font-family: 'Inter', sans-serif; font-size: 0.72rem; font-weight: 500;
          color: #374151; box-shadow: 0 1px 3px rgba(0,0,0,0.04);
        }
        .vdp-amenity-chip svg { flex-shrink: 0; color: #c9a84c; }

        /* ── BOOKING WIDGET ── */
        .vdp-widget {
          position: sticky; top: 110px;
          background: #ffffff; border: 1px solid #eef0f4;
          border-radius: 16px; overflow: hidden;
          box-shadow: 0 4px 24px rgba(0,0,0,0.08);
        }
        .vdp-widget-header {
          padding: 26px 28px 22px; border-bottom: 1px solid #eef0f4;
          background: #fafbfc;
        }
        .vdp-widget-header h3 {
          font-family: 'Playfair Display', serif; font-size: 1.45rem; font-weight: 700;
          color: #1a1a2e; margin-bottom: 4px;
        }
        .vdp-widget-sub {
          font-family: 'Inter', sans-serif; font-size: 0.65rem; font-weight: 500;
          letter-spacing: 0.04em; text-transform: uppercase; color: #9098a9;
        }
        .vdp-widget-body {
          padding: 26px 28px 30px; display: flex; flex-direction: column; gap: 20px;
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

        /* guest selector override for light bg */
        .vdp-page .guest-selector {
          border: 1px solid rgba(0,0,0,0.18); background: #f9f9f9;
        }
        .vdp-page .guest-step-btn { color: #b8913e; }
        .vdp-page .guest-step-btn:disabled { color: #bbb; }
        .vdp-page .guest-count-display {
          color: #0a0a0a;
          border-left: 1px solid rgba(0,0,0,0.12);
          border-right: 1px solid rgba(0,0,0,0.12);
        }
        .vdp-page .guest-count-display span { color: rgba(10,10,10,0.4); }

        /* price section override for light bg */
        .vdp-page .price-section {
          background: #f5f5f5;
          border: 1px solid rgba(0,0,0,0.1);
        }
        .vdp-page .price-section h4 { color: #b8913e !important; }
        .vdp-page .price-display { color: #b8913e; }
        .vdp-page .price-per-night-label { color: rgba(10,10,10,0.45); }
        .vdp-page .price-breakdown {
          background: rgba(0,0,0,0.03);
          border: 1px solid rgba(0,0,0,0.07);
        }
        .vdp-page .price-breakdown span { color: rgba(10,10,10,0.6); }
        .vdp-page .unavailable-message { color: rgba(10,10,10,0.55); }
      `}</style>

      {/* NAV */}
      <nav className={!navVisible ? "nav-hidden" : ""}>
        <Link to="/" className="nav-logo">
          Alsace <span>Hideaways</span>
        </Link>
        <ul className="nav-links">
          <li>
            <a href="/#shelters">{t("nav.shelters")}</a>
          </li>
          <li>
            <Link to="/gallery">{t("nav.gallery")}</Link>
          </li>
          <li>
            <a href="/#contact">{t("nav.contact")}</a>
          </li>
        </ul>
        <CurrencySelector />
        <LanguageSwitcher />
        <button
          className={`hamburger ${mobileMenuOpen ? "active" : ""}`}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={t("nav.toggleMenu")}
        >
          <span />
          <span />
          <span />
        </button>
      </nav>

      {/* MOBILE MENU */}
      <div className={`mobile-menu ${mobileMenuOpen ? "active" : ""}`}>
        <a href="/#shelters" onClick={() => setMobileMenuOpen(false)}>
          {t("nav.shelters")}
        </a>
        <Link to="/gallery" onClick={() => setMobileMenuOpen(false)}>
          {t("nav.gallery")}
        </Link>
        <a href="/#contact" onClick={() => setMobileMenuOpen(false)}>
          {t("nav.contact")}
        </a>
      </div>

      <div className="vdp-page">
        {/* PAGE HEADER */}
        <div className="vdp-header">
          <div className="vdp-type">{shelter.type}</div>
          <h1 className="vdp-title">{shelter.name}</h1>
          <div className="vdp-meta">
            {shelter.bedrooms && (
              <span>🛏 {t("common.bedroom", { count: shelter.bedrooms })}</span>
            )}
            {shelter.bathrooms && (
              <span>
                🚿 {t("common.bathroom", { count: shelter.bathrooms })}
              </span>
            )}
            <span>{t("common.upToGuests", { count: shelter.maxGuests })}</span>
          </div>
        </div>

        {/* GALLERY */}
        <div className="vdp-gallery">
          <div
            className="vdp-gallery-main"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <img
              src={images[activeImg]}
              alt={`${shelter.name} — photo ${activeImg + 1}`}
              decoding="async"
            />
            {activeImg > 0 && (
              <button
                className="gallery-arrow gallery-arrow--prev"
                onClick={() => setActiveImg((i) => i - 1)}
                aria-label="Previous"
              >
                &#8249;
              </button>
            )}
            {activeImg < images.length - 1 && (
              <button
                className="gallery-arrow gallery-arrow--next"
                onClick={() => setActiveImg((i) => i + 1)}
                aria-label="Next"
              >
                &#8250;
              </button>
            )}
            {images.length > 1 && (
              <div className="gallery-counter">
                {activeImg + 1} / {images.length}
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className="vdp-thumbs">
              {images.map((src, i) => (
                <button
                  key={i}
                  className={`vdp-thumb${i === activeImg ? " active" : ""}`}
                  onClick={() => setActiveImg(i)}
                >
                  <img
                    src={src}
                    alt={`Thumbnail ${i + 1}`}
                    loading="lazy"
                    decoding="async"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* BODY */}
        <div className="vdp-body">
          <div className="vdp-section">
            {/* Name + stats header */}
            <div className="vdp-info-header">
              <div className="vdp-info-stats">
                {shelter.bedrooms && (
                  <span className="vdp-info-stat">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M2 9V5a1 1 0 0 1 1-1h18a1 1 0 0 1 1 1v4" />
                      <path d="M2 9h20v9a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V9z" />
                      <path d="M10 9V5" />
                      <path d="M2 14h20" />
                    </svg>
                    {t("common.bed", { count: shelter.bedrooms })}
                  </span>
                )}
                {shelter.bathrooms && (
                  <span className="vdp-info-stat">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M4 7h16M4 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7z" />
                      <circle cx="10" cy="13" r="1" fill="currentColor" />
                      <circle cx="14" cy="13" r="1" fill="currentColor" />
                    </svg>
                    {t("common.bathroom", { count: shelter.bathrooms })}
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            <p className="vdp-description" style={{ whiteSpace: "pre-line" }}>
              {shelter.description}
            </p>

            {/* Amenities */}
            {shelter.amenities && shelter.amenities.length > 0 && (
              <div className="vdp-amenities">
                <div className="vdp-amenities-group">
                  <div className="vdp-amenities-group-title">{t("shelterDetails.features")}</div>
                  <div className="vdp-amenities-items">
                    {shelter.amenities.map((amenity) => (
                      <div key={amenity} className="vdp-amenity-chip">
                        {amenity}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Reserve / WhatsApp button */}
          <div style={{ marginTop: 36 }}>
            {shelter.contactOnly ? (
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
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 32 32"
                  fill="white"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M16 0C7.163 0 0 7.163 0 16c0 2.822.737 5.469 2.027 7.773L0 32l8.473-2.007A15.938 15.938 0 0 0 16 32c8.837 0 16-7.163 16-16S24.837 0 16 0zm0 29.333a13.27 13.27 0 0 1-6.77-1.853l-.485-.29-5.027 1.19 1.213-4.903-.317-.503A13.267 13.267 0 0 1 2.667 16C2.667 8.636 8.636 2.667 16 2.667S29.333 8.636 29.333 16 23.364 29.333 16 29.333zm7.27-9.87c-.397-.2-2.352-1.16-2.717-1.293-.364-.133-.63-.2-.896.2-.265.397-1.03 1.293-1.262 1.56-.232.265-.464.298-.86.1-.397-.2-1.676-.617-3.192-1.97-1.18-1.052-1.977-2.352-2.208-2.748-.232-.397-.025-.612.174-.81.179-.178.397-.464.596-.696.2-.232.265-.397.397-.663.133-.265.067-.497-.033-.696-.1-.2-.896-2.16-1.228-2.958-.323-.775-.65-.67-.896-.683l-.763-.013c-.265 0-.696.1-1.06.497-.364.397-1.393 1.36-1.393 3.317s1.427 3.847 1.626 4.113c.2.265 2.807 4.287 6.803 6.013.95.41 1.692.655 2.27.838.953.303 1.82.26 2.506.158.764-.114 2.352-.962 2.683-1.89.33-.928.33-1.724.232-1.89-.1-.165-.364-.265-.762-.464z" />
                </svg>
                {t("common.contactWhatsapp")}
              </a>
            ) : (
              <Link
                to={`/reservation?shelterId=${shelter.id}`}
                className="btn-reserve-now"
                style={{
                  display: "block",
                  textAlign: "center",
                  textDecoration: "none",
                }}
              >
                {t("common.reserveNow")}
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ShelterDetailsPage;
