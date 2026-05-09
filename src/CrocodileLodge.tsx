import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import VillaCard from "./components/VillaCard";
import CurrencySelector from "./components/CurrencySelector";
import SEO from "./components/SEO";
import type { Villa } from "./types";
import { VILLAS } from "./types";

const CrocodileLodge: React.FC = () => {
  const navigate = useNavigate();
  const [checkin, setCheckin] = useState<string>("");
  const [checkout, setCheckout] = useState<string>("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [guests, setGuests] = useState<number>(1);
  const [navVisible, setNavVisible] = useState<boolean>(true);
  const [navScrolled, setNavScrolled] = useState<boolean>(false);

  // Set default dates on mount
  useEffect(() => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const fmt = (d: Date) => d.toISOString().split("T")[0];
    setCheckin(fmt(today));
    setCheckout(fmt(tomorrow));
  }, []);

  // Nav hide/show on scroll
  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setNavScrolled(y > 80);
      setNavVisible(y < lastY || y < 80);
      lastY = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Scroll Reveal Logic
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("visible");
        });
      },
      { threshold: 0.1 },
    );

    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const getNightsCount = (): number => {
    if (!checkin || !checkout) return 0;
    const d1 = new Date(checkin);
    const d2 = new Date(checkout);
    return Math.max(
      0,
      Math.ceil((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24)),
    );
  };

  const handleSearch = () => {
    if (!checkin || !checkout) {
      alert("Please select check-in and check-out dates.");
      return;
    }
    if (getNightsCount() <= 0) {
      alert("Check-out must be after check-in.");
      return;
    }
    navigate(
      `/search?checkin=${checkin}&checkout=${checkout}&guests=${guests}`,
    );
  };

  const handleSelectVilla = (villa: Villa) => {
    navigate(`/villa/${villa.id}?checkin=${checkin}&checkout=${checkout}`);
  };

  return (
    <>
      <SEO url="/" />
      <style>{`


        :root {
          --croc-deep: #0a0a0a;
          --croc-forest: #141414;
          --croc-moss: #282828;
          --croc-sage: #505050;
          --croc-sand: #d4d4d4;
          --croc-cream: #f0f0f0;
          --croc-gold: #909090;
          --croc-amber: #e0e0e0;
          --croc-water: #686868;
          --croc-sky: #c0c0c0;
          --text-dark: #0a0a0a;
          --text-light: #f0f0f0;
        }

        * { margin: 0; padding: 0; box-sizing: border-box; }

        html { scroll-behavior: smooth; }

        body {
          font-family: 'Cormorant Garamond', serif;
          background: var(--croc-deep);
          color: var(--croc-cream);
          overflow-x: hidden;
        }

        /* TOP BAR */
        .topbar {
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 101;
          height: 42px;
          background: #fff;
          border-bottom: 1px solid rgba(0,0,0,0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 28px;
          padding: 0 40px;
        }
        .topbar-item {
          display: flex;
          align-items: center;
          gap: 7px;
          font-family: 'Inter', sans-serif;
          font-size: 0.7rem;
          font-weight: 500;
          letter-spacing: 0.03em;
          color: rgba(10,10,10,0.5);
          text-decoration: none;
          white-space: nowrap;
          transition: color 0.2s;
        }
        .topbar-item:hover { color: #1a1a2e; }
        .topbar-divider { width: 1px; height: 14px; background: rgba(0,0,0,0.15); }
        @media (max-width: 768px) {
          .topbar { gap: 14px; padding: 0 16px; }
          .topbar-item { font-size: 0.65rem; }
          .topbar-item.topbar-addr { display: none; }
        }
        @media (max-width: 480px) {
          .topbar-item.topbar-maps { display: none; }
          .topbar-divider.topbar-div-maps { display: none; }
        }

        /* NAV */
        nav {
          position: fixed;
          top: 42px; left: 0; right: 0;
          z-index: 100;
          padding: 28px 60px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: rgba(201,168,76,0.92);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(255,255,255,0.15);
          transition: transform 0.35s ease, background 0.35s ease, padding 0.35s ease;
        }
        nav.nav-hidden { transform: translateY(-100%); }
        nav.nav-scrolled {
          background: rgba(201,168,76,0.98);
          backdrop-filter: blur(12px);
          padding: 18px 60px;
          box-shadow: 0 2px 24px rgba(0,0,0,0.4);
        }

        .nav-logo {
          font-family: 'Playfair Display', serif;
          font-size: 1.4rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          color: var(--croc-cream);
          text-decoration: none;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .nav-logo-img {
          height: 40px;
          width: 40px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid rgba(255,255,255,0.3);
          flex-shrink: 0;
        }
        .nav-logo span { color: var(--croc-gold); }

        .nav-links {
          display: flex;
          gap: 44px;
          list-style: none;
        }
        .nav-links a, .nav-links button {
          font-family: 'Inter', sans-serif;
          font-size: 0.7rem;
          font-weight: 500;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--croc-cream);
          text-decoration: none;
          opacity: 0.85;
          transition: opacity 0.3s, color 0.3s;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
        }
        .nav-links a:hover, .nav-links button:hover { opacity: 1; color: var(--croc-gold); }

        .currency-selector {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-right: 8px;
        }
        .currency-selector .currency-icon { font-size: 0.85rem; }
        .currency-selector select {
          font-family: 'Inter', sans-serif;
          font-size: 0.65rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          background: transparent;
          border: 1px solid rgba(255,255,255,0.3);
          color: rgba(255,255,255,0.85);
          padding: 6px 10px;
          cursor: pointer;
          outline: none;
          border-radius: 2px;
          transition: border-color 0.2s, color 0.2s;
        }
        .currency-selector select option { background: #1a1a2e; color: #fff; }
        .currency-selector select:hover { border-color: var(--croc-gold); color: var(--croc-gold); }

        .nav-book {
          font-family: 'Inter', sans-serif;
          font-size: 0.65rem;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--croc-deep);
          background: var(--croc-gold);
          padding: 12px 28px;
          text-decoration: none;
          transition: background 0.3s, transform 0.2s;
        }
        .nav-book:hover { background: var(--croc-amber); transform: translateY(-1px); }

        /* HAMBURGER MENU */
        .hamburger {
          display: none;
          flex-direction: column;
          gap: 6px;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
          z-index: 101;
        }

        .hamburger span {
          width: 24px;
          height: 2px;
          background: var(--croc-cream);
          transition: all 0.3s ease;
          display: block;
        }

        .hamburger.active span:nth-child(1) {
          transform: rotate(45deg) translate(8px, 8px);
        }

        .hamburger.active span:nth-child(2) {
          opacity: 0;
        }

        .hamburger.active span:nth-child(3) {
          transform: rotate(-45deg) translate(7px, -7px);
        }

        .mobile-menu {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(13, 26, 15, 0.98);
          z-index: 50;
          padding-top: 100px;
          flex-direction: column;
          align-items: center;
          gap: 30px;
          backdrop-filter: blur(4px);
        }

        .mobile-menu.active {
          display: flex;
        }

        .mobile-menu a, .mobile-menu button {
          font-family: 'Inter', sans-serif;
          font-size: 1rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--croc-cream);
          text-decoration: none;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
          transition: color 0.3s;
        }

        .mobile-menu a:hover, .mobile-menu button:hover {
          color: var(--croc-gold);
        }

        .mobile-menu .nav-book {
          display: inline-block;
          margin-top: 20px;
          font-size: 0.75rem;
        }

        /* HERO */
        .hero {
          min-height: 100vh;
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          background: url('/images/landscape.jpeg') center center / cover no-repeat;
        }

        .hero-gate-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.25) 50%, rgba(0,0,0,0.7) 100%);
        }

        .hero-content {
          position: relative;
          z-index: 10;
          width: 100%;
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 36px;
          padding: 120px 0 100px;
        }

        .hero-title-wrap {
          text-align: center;
          max-width: 900px;
          padding: 0 40px;
          margin-top: 80px;
        }
        @media (max-width: 768px) {
          .hero-title-wrap { margin-top: 0; }
        }

        .booking-bar-hero {
          position: relative;
          z-index: 10;
          width: 100%;
        }

        .hero-tagline {
          max-width: 720px;
          margin: 0 auto;
          padding: 0 24px;
          text-align: center;
          opacity: 0;
          animation: fade-up 1s ease 0.9s forwards;
        }
        .hero-tagline p {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(1.1rem, 1.9vw, 1.4rem);
          font-style: italic;
          color: rgba(255,255,255,0.82);
          line-height: 1.7;
          margin: 0;
          text-shadow: 0 1px 8px rgba(0,0,0,0.45);
        }
        .hero-tagline p + p { margin-top: 10px; }
        @media (max-width: 768px) {
          .hero-tagline { padding: 0 20px; }
          .hero-tagline p { font-size: 1.05rem; line-height: 1.65; }
        }
        @media (max-width: 480px) {
          .hero-tagline p { font-size: 0.98rem; }
        }

        .hero-eyebrow {
          font-family: 'Inter', sans-serif;
          font-size: 0.65rem;
          font-weight: 300;
          letter-spacing: 0.35em;
          text-transform: uppercase;
          color: var(--croc-gold);
          margin-bottom: 28px;
          opacity: 0;
          animation: fade-up 1s ease 0.3s forwards;
        }

        .hero-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(3rem, 6vw, 6rem);
          font-weight: 900;
          line-height: 1.05;
          color: #ffffff;
          opacity: 0;
          animation: fade-up 1s ease 0.5s forwards;
          margin-bottom: 0;
        }
        .hero-title em {
          font-style: italic;
          color: #ffffff;
          display: block;
        }

        .btn-primary {
          font-family: 'Inter', sans-serif;
          font-size: 0.7rem;
          font-weight: 400;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--croc-deep);
          background: var(--croc-gold);
          padding: 18px 42px;
          text-decoration: none;
          display: inline-block;
          transition: all 0.3s;
          position: relative;
          overflow: hidden;
        }
        .btn-primary::before {
          content: '';
          position: absolute;
          inset: 0;
          background: var(--croc-amber);
          transform: translateX(-100%);
          transition: transform 0.3s ease;
        }
        .btn-primary:hover::before { transform: translateX(0); }
        .btn-primary span { position: relative; z-index: 1; }

        .btn-ghost {
          font-family: 'Inter', sans-serif;
          font-size: 0.7rem;
          font-weight: 300;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--croc-cream);
          text-decoration: none;
          border-bottom: 1px solid rgba(240,240,240,0.3);
          padding-bottom: 3px;
          transition: border-color 0.3s, color 0.3s;
        }
        .btn-ghost:hover { border-color: var(--croc-gold); color: var(--croc-gold); }

        .hero-stats {
          position: absolute;
          bottom: 60px;
          right: 10%;
          display: flex;
          gap: 50px;
          opacity: 0;
          animation: fade-up 1s ease 1.1s forwards;
        }
        .stat-item { text-align: center; }
        .stat-num {
          font-family: 'Playfair Display', serif;
          font-size: 2.2rem;
          font-weight: 700;
          color: var(--croc-gold);
          display: block;
        }
        .stat-label {
          font-family: 'Inter', sans-serif;
          font-size: 0.6rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: rgba(240,240,240,0.5);
        }

        .scroll-hint {
          position: absolute;
          bottom: 60px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          opacity: 0;
          animation: fade-in 1s ease 1.5s forwards;
        }
        .scroll-hint span {
          font-family: 'Inter', sans-serif;
          font-size: 0.55rem;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: rgba(240,240,240,0.4);
        }
        .scroll-line {
          width: 1px;
          height: 60px;
          background: linear-gradient(180deg, var(--croc-gold), transparent);
          animation: scroll-pulse 2s ease-in-out infinite;
        }
        @keyframes scroll-pulse {
          0%, 100% { opacity: 0.4; transform: scaleY(1); }
          50% { opacity: 1; transform: scaleY(1.1); }
        }

        @keyframes fade-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        /* WHATSAPP FLOAT */
        .whatsapp-float {
          position: fixed;
          bottom: 30px;
          right: 30px;
          z-index: 999;
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          animation: fade-in 1s ease 1s forwards;
          opacity: 0;
        }

        .whatsapp-label {
          background: #fff;
          color: #128c7e;
          font-family: 'Inter', sans-serif;
          font-size: 0.7rem;
          font-weight: 600;
          letter-spacing: 0.08em;
          padding: 8px 14px;
          border-radius: 4px;
          box-shadow: 0 4px 16px rgba(0,0,0,0.18);
          white-space: nowrap;
          opacity: 0;
          transform: translateX(10px);
          transition: opacity 0.3s, transform 0.3s;
          pointer-events: none;
        }

        .whatsapp-float:hover .whatsapp-label {
          opacity: 1;
          transform: translateX(0);
        }

        .whatsapp-btn {
          width: 58px;
          height: 58px;
          border-radius: 50%;
          background: #25d366;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 20px rgba(37,211,102,0.45);
          transition: transform 0.3s, box-shadow 0.3s;
          flex-shrink: 0;
        }

        .whatsapp-float:hover .whatsapp-btn {
          transform: scale(1.08);
          box-shadow: 0 6px 26px rgba(37,211,102,0.6);
        }

        .whatsapp-btn svg {
          width: 30px;
          height: 30px;
          fill: #fff;
        }

        /* CAROUSEL */
        .carousel-container {
          position: absolute;
          right: 0;
          top: 0;
          width: 100%;
          height: 100%;
          opacity: 0;
          animation: fade-in 1s ease 0.5s forwards;
        }

        .carousel-slides {
          position: relative;
          width: 100%;
          height: 100%;
          overflow: hidden;
        }

        .carousel-slide {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background-size: cover;
          background-position: center;
          opacity: 0;
          transition: opacity 0.8s ease;
        }

        .carousel-slide.active {
          opacity: 1;
        }

        .carousel-controls {
          position: absolute;
          bottom: 30px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 12px;
          z-index: 10;
        }

        .carousel-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: rgba(144,144,144,0.3);
          cursor: pointer;
          transition: all 0.3s;
          border: 1px solid rgba(144,144,144,0.5);
        }

        .carousel-dot.active {
          background: var(--croc-gold);
          width: 28px;
          border-radius: 5px;
        }

        .carousel-btn {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 50px;
          height: 50px;
          background: rgba(10,10,10,0.5);
          border: 1px solid rgba(144,144,144,0.4);
          color: var(--croc-gold);
          font-size: 1.6rem;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10;
        }

        .carousel-btn:hover {
          background: rgba(10,10,10,0.8);
          border-color: var(--croc-gold);
        }

        .carousel-btn.prev {
          left: 10px;
        }

        .carousel-btn.next {
          right: 10px;
        }

        /* BOOKING SECTION */
        .booking-section {
          background: var(--croc-sand);
          padding: 0;
          position: relative;
          z-index: 10;
        }

        .booking-bar {
          max-width: 860px;
          margin: 0 auto;
          padding: 0;
          display: grid;
          grid-template-columns: 1fr 1fr 1fr auto;
          gap: 0;
          background: var(--croc-sand);
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 8px 36px rgba(0,0,0,0.32);
        }

        .booking-field {
          padding: 18px 24px;
          border-right: 1px solid rgba(10,10,10,0.15);
          position: relative;
        }

        .booking-field label {
          display: block;
          font-family: 'Inter', sans-serif;
          font-size: 0.55rem;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: rgba(10,10,10,0.5);
          margin-bottom: 5px;
        }

        .booking-field input, .booking-field select {
          width: 100%;
          background: transparent;
          border: none;
          outline: none;
          font-family: 'Playfair Display', serif;
          font-size: 0.95rem;
          color: var(--croc-deep);
          cursor: pointer;
        }

        .booking-field select option { background: var(--croc-sand); }

        .booking-check {
          padding: 18px 24px;
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
        }
        .booking-check span {
          font-family: 'Inter', sans-serif;
          font-size: 0.6rem;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: rgba(10,10,10,0.5);
        }

        .booking-submit {
          background: var(--croc-forest);
          color: var(--croc-cream);
          border: none;
          padding: 0 36px;
          font-family: 'Inter', sans-serif;
          font-size: 0.65rem;
          font-weight: 400;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          cursor: pointer;
          transition: background 0.3s;
          white-space: nowrap;
          border-radius: 0 12px 12px 0;
        }
        .booking-submit:hover { background: var(--croc-moss); }

        /* BOOKING RESULT SECTION */
        .booking-result-section {
          background: var(--croc-cream);
          padding: 100px 60px;
          display: flex;
          justify-content: center;
        }

        .booking-widget {
          max-width: 640px;
          width: 100%;
          text-align: center;
        }

        .booking-widget .section-title { color: var(--croc-deep); }
        .booking-widget .section-title em { color: var(--croc-moss); }
        .booking-widget .section-tag { color: var(--croc-gold); }

        .price-summary {
          background: white;
          border: 1px solid rgba(10,10,10,0.1);
          padding: 32px 40px;
          margin: 0 0 32px;
          text-align: left;
        }

        .price-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 0;
          border-bottom: 1px solid rgba(10,10,10,0.07);
          font-family: 'Inter', sans-serif;
          font-size: 0.72rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--croc-deep);
        }

        .price-row:last-child { border-bottom: none; }

        .price-total {
          border-top: 2px solid var(--croc-gold) !important;
          border-bottom: none !important;
          margin-top: 8px;
          padding-top: 16px;
          font-size: 0.85rem;
          font-weight: 600;
        }

        .price-total span:last-child {
          font-family: 'Playfair Display', serif;
          font-size: 1.4rem;
          color: var(--croc-moss);
          font-weight: 700;
        }

        .booking-hint {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.15rem;
          font-style: italic;
          color: rgba(10,10,10,0.5);
          margin: 32px 0;
          line-height: 1.7;
        }

        .checking-avail {
          font-family: 'Inter', sans-serif;
          font-size: 0.72rem;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: var(--croc-gold);
          margin: 40px 0;
          animation: avail-pulse 1.4s ease-in-out infinite;
        }

        @keyframes avail-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }

        .avail-result {
          padding: 36px 40px;
          margin: 8px 0 32px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 14px;
          text-align: center;
        }

        .avail-available {
          background: #0a0a0a;
          border: 1px solid #0a0a0a;
        }

        .avail-booked {
          background: rgba(10,10,10,0.04);
          border: 1px solid rgba(10,10,10,0.18);
        }

        .avail-icon {
          font-size: 2.2rem;
          font-weight: 700;
          line-height: 1;
        }

        .avail-available .avail-icon { color: var(--croc-cream); }
        .avail-booked .avail-icon { color: var(--croc-sage); }

        .avail-text {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .avail-text strong {
          font-family: 'Inter', sans-serif;
          font-size: 0.78rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--croc-deep);
        }

        .avail-available .avail-text strong { color: var(--croc-cream); }

        .avail-text span {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.05rem;
          color: rgba(10,10,10,0.65);
          line-height: 1.6;
        }

        .avail-available .avail-text span { color: rgba(240,240,240,0.72); }

        .avail-text em { font-style: italic; color: var(--croc-sage); }
        .avail-available .avail-text em { color: var(--croc-sky); }

        .btn-reserve {
          background: var(--croc-cream);
          color: var(--croc-deep);
          border: none;
          padding: 16px 44px;
          font-family: 'Inter', sans-serif;
          font-size: 0.7rem;
          font-weight: 400;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          cursor: pointer;
          transition: background 0.3s, color 0.3s;
          margin-top: 8px;
        }

        .btn-reserve:hover { background: var(--croc-sand); color: var(--croc-deep); }

        .booking-footnote {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-size: 0.95rem;
          color: rgba(10,10,10,0.4);
          margin-top: 32px;
        }

        /* AVAILABILITY CALENDAR (legacy — kept for reference) */
        .availability-section {
          background: white;
          padding: 100px 60px;
        }

        .section-header {
          text-align: center;
          margin-bottom: 70px;
        }

        .section-tag {
          font-family: 'Inter', sans-serif;
          font-size: 0.62rem;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: var(--croc-gold);
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
        }
        .section-tag::before, .section-tag::after {
          content: '';
          display: block;
          width: 40px;
          height: 1px;
          background: var(--croc-gold);
          opacity: 0.5;
        }

        .section-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(2.2rem, 4vw, 3.5rem);
          font-weight: 700;
          color: var(--croc-deep);
          line-height: 1.15;
        }
        .section-title em { font-style: italic; color: var(--croc-gold); }

        .calendar-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 40px;
          max-width: 900px;
          margin: 0 auto;
        }

        .calendar-month {
          background: var(--croc-sand);
          border: 1px solid rgba(144,144,144,0.2);
          padding: 30px;
        }

        .calendar-month-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.1rem;
          color: var(--croc-deep);
          text-align: center;
          margin-bottom: 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .cal-nav {
          background: none;
          border: 1px solid rgba(144,144,144,0.3);
          color: var(--croc-deep);
          width: 30px; height: 30px;
          cursor: pointer;
          font-size: 0.9rem;
          transition: background 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .cal-nav:hover { background: rgba(144,144,144,0.2); }

        .calendar-days-header {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 4px;
          margin-bottom: 8px;
        }
        .day-name {
          font-family: 'Inter', sans-serif;
          font-size: 0.55rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(144,144,144,0.6);
          text-align: center;
          padding: 6px 0;
        }

        .calendar-days {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 4px;
        }
        .cal-day {
          aspect-ratio: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Inter', sans-serif;
          font-size: 0.75rem;
          color: rgba(144,144,144,0.7);
          cursor: pointer;
          border-radius: 2px;
          transition: all 0.2s;
          position: relative;
        }
        .cal-day:hover:not(.booked):not(.empty) {
          background: rgba(144,144,144,0.2);
          color: var(--croc-deep);
        }
        .cal-day.available { color: var(--croc-deep); }
        .cal-day.booked {
          background: rgba(144,144,144,0.1);
          cursor: not-allowed;
          text-decoration: line-through;
          color: rgba(144,144,144,0.3);
        }
        .cal-day.selected {
          background: var(--croc-deep);
          color: var(--croc-sand);
          font-weight: 400;
        }
        .cal-day.today::after {
          content: '';
          position: absolute;
          bottom: 3px;
          left: 50%; transform: translateX(-50%);
          width: 3px; height: 3px;
          border-radius: 50%;
          background: var(--croc-gold);
        }
        .cal-day.empty { cursor: default; }

        .calendar-legend {
          display: flex;
          gap: 24px;
          justify-content: center;
          margin-top: 30px;
        }
        .legend-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-family: 'Inter', sans-serif;
          font-size: 0.6rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(240,240,240,0.5);
        }
        .legend-dot {
          width: 10px; height: 10px;
          border-radius: 2px;
        }
        .legend-dot.available { background: var(--croc-cream); }
        .legend-dot.booked { background: rgba(240,240,240,0.1); border: 1px solid rgba(240,240,240,0.2); }
        .legend-dot.selected { background: var(--croc-gold); }

        /* VILLAS SECTION */
        .villas-section {
          background: white;
          padding: 120px 60px;
          position: relative;
          overflow: hidden;
        }
        .villas-section::before {
          content: 'VILLAS';
          position: absolute;
          top: 50%;
          left: -2%;
          transform: translateY(-50%) rotate(-90deg);
          font-family: 'Playfair Display', serif;
          font-size: 15rem;
          font-weight: 900;
          color: rgba(240,240,240,0.02);
          letter-spacing: 0.1em;
          white-space: nowrap;
          pointer-events: none;
        }

        .villas-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          grid-auto-rows: 1fr;
          gap: 30px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .villa-card {
          position: relative;
          overflow: hidden;
          cursor: pointer;
          background: white;
          border-radius: 4px;
          box-shadow: 0 4px 12px rgba(13, 26, 15, 0.15);
          transition: box-shadow 0.3s;
          display: flex;
          flex-direction: column;
          height: 100%;
        }
        .villa-card:hover {
          box-shadow: 0 8px 24px rgba(13, 26, 15, 0.25);
        }
        .villa-card-header h3 {
          color: #000000;
          font-size: 1.4rem;
        }
        .villa-card-content {
          display: flex;
          flex-direction: column;
          gap: 12px;
          flex-grow: 1;
          padding: 20px;
        }
        
        .villa-guests {
          font-family: 'Inter', sans-serif;
          font-size: 0.85rem;
          color: rgba(13, 26, 15, 0.7);
          margin: 0;
        }
        .villa-guests strong {
          color: var(--croc-deep);
          font-weight: 600;
        }

        .villa-meta-chips {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .villa-chip {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          background: rgba(13, 26, 15, 0.07);
          border: 1px solid rgba(13, 26, 15, 0.12);
          border-radius: 20px;
          padding: 5px 12px;
          font-family: 'Inter', sans-serif;
          font-size: 0.72rem;
          letter-spacing: 0.06em;
          color: rgba(13, 26, 15, 0.75);
          font-weight: 500;
        }
        
        .villa-amenity-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin: 4px 0 8px;
        }
        .villa-amenity-chip {
          font-size: 0.75rem;
          padding: 4px 10px;
          border-radius: 20px;
          background: rgba(13, 26, 15, 0.07);
          color: rgba(13, 26, 15, 0.7);
          font-family: 'Montserrat', sans-serif;
          letter-spacing: 0.01em;
        }
        
        .villa-status {
          display: flex;
          align-items: center;
        }
        .status-available {
          color: var(--croc-moss);
          font-family: 'Inter', sans-serif;
          font-size: 0.8rem;
          font-weight: 500;
        }
        .status-unavailable {
          color: var(--croc-sage);
          font-family: 'Inter', sans-serif;
          font-size: 0.8rem;
          font-weight: 500;
        }
        .villa-card-buttons {
          display: flex;
          gap: 12px;
          margin-top: auto;
        }
        .btn-view-details,
        .btn-reserve-quick {
          flex: 1;
          padding: 12px 16px;
          border: none;
          border-radius: 4px;
          font-family: 'Inter', sans-serif;
          font-size: 0.8rem;
          font-weight: 400;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: white;
          cursor: pointer;
          transition: opacity 0.3s, transform 0.2s;
        }
        .btn-view-details:hover:not(:disabled),
        .btn-reserve-quick:hover:not(:disabled) {
          opacity: 0.9;
          transform: translateY(-2px);
        }
        .btn-view-details:disabled,
        .btn-reserve-quick:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .villa-card-image {
          width: 100%;
          height: 280px;
          overflow: hidden;
          position: relative;
        }
        .villa-card-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }
        .villa-card:hover .villa-card-image img {
          transform: scale(1.05);
        }
        .card-img-nav {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(0,0,0,0.45);
          color: #fff;
          border: none;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          font-size: 1.2rem;
          line-height: 1;
          cursor: pointer;
          z-index: 2;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s;
        }
        .card-img-nav:hover { background: rgba(0,0,0,0.7); }
        .card-img-prev { left: 8px; }
        .card-img-next { right: 8px; }
        .card-img-dots {
          position: absolute;
          bottom: 8px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 5px;
          z-index: 2;
        }
        .card-img-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: rgba(255,255,255,0.5);
          cursor: pointer;
          transition: background 0.2s;
        }
        .card-img-dot.active { background: #fff; }

        .villa-img-bg {
          height: 380px;
          transition: transform 0.6s ease;
          position: relative;
          overflow: hidden;
        }
        .villa-card:nth-child(1) .villa-img-bg { background: linear-gradient(135deg, #111111 0%, #222222 50%, #0a0a0a 100%); }
        .villa-card:nth-child(2) .villa-img-bg { background: linear-gradient(135deg, #1a1a1a 0%, #2e2e2e 50%, #141414 100%); }
        .villa-card:nth-child(3) .villa-img-bg { background: linear-gradient(135deg, #262626 0%, #3a3a3a 50%, #1e1e1e 100%); }

        /* Decorative villa illustrations */
        .villa-decoration {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0.15;
          font-size: 6rem;
        }

        .villa-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, transparent 30%, rgba(0,0,0,0.88) 100%);
          opacity: 0.7;
          transition: opacity 0.4s;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: 36px;
        }
        .villa-category {
          font-family: 'Inter', sans-serif;
          font-size: 0.58rem;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: var(--croc-gold);
          margin-bottom: 10px;
        }
        .villa-name {
          font-family: 'Playfair Display', serif;
          font-size: 1.6rem;
          font-weight: 700;
          color: var(--croc-cream);
          margin-bottom: 10px;
          line-height: 1.2;
        }
        .villa-detail {
          font-family: 'Cormorant Garamond', serif;
          font-size: 0.95rem;
          font-style: italic;
          color: rgba(240,240,240,0.65);
          margin-bottom: 20px;
        }
        .villa-price {
          display: flex;
          align-items: baseline;
          gap: 8px;
          margin-bottom: 18px;
        }
        .price-num {
          font-family: 'Playfair Display', serif;
          font-size: 1.8rem;
          color: var(--croc-gold);
        }
        .price-per {
          font-family: 'Inter', sans-serif;
          font-size: 0.6rem;
          letter-spacing: 0.1em;
          color: rgba(240,240,240,0.4);
        }
        .villa-btn {
          font-family: 'Inter', sans-serif;
          font-size: 0.62rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--croc-deep);
          background: var(--croc-gold);
          padding: 12px 24px;
          text-decoration: none;
          display: inline-block;
          width: fit-content;
          transition: background 0.3s;
        }
        .villa-btn:hover { background: var(--croc-amber); }

        /* AMENITIES SECTION */
        .amenities-section {
          background: white;
          padding: 120px 60px;
          color: var(--croc-deep);
        }

        /* Section tag overrides for light-background sections */
        .amenities-section .section-tag,
        .testimonials-section .section-tag,
        .experience-section .section-tag,
        .booking-widget .section-tag { color: var(--croc-sage); }

        .amenities-section .section-tag::before,
        .amenities-section .section-tag::after,
        .testimonials-section .section-tag::before,
        .testimonials-section .section-tag::after { background: var(--croc-sage); opacity: 0.6; }

        .amenities-section .section-title { color: var(--croc-deep); }
        .amenities-section .section-title em { color: var(--croc-moss); }

        .amenities-intro {
          font-size: 1.2rem;
          font-style: italic;
          color: rgba(10,10,10,0.6);
          max-width: 600px;
          margin: 24px auto 70px;
          text-align: center;
          line-height: 1.8;
        }

        .amenities-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 2px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .amenity-card {
          background: rgba(10,10,10,0.03);
          border: 1px solid rgba(10,10,10,0.08);
          padding: 44px 28px;
          text-align: center;
          transition: all 0.4s ease;
          position: relative;
          overflow: hidden;
          cursor: pointer;
          font-family: sans-serif;
        }
        .amenity-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: var(--croc-deep);
          transform: translateY(100%);
          transition: transform 0.4s ease;
        }
        .amenity-card:hover::before { transform: translateY(0); }
        .amenity-card:hover .amenity-icon { transform: scale(1.2) rotate(10deg); }
        .amenity-card:hover .amenity-name { color: var(--croc-cream); }
        .amenity-card:hover .amenity-desc { color: rgba(240,240,240,0.6); }

        .amenity-icon {
          font-size: 2.4rem;
          margin-bottom: 20px;
          display: block;
          position: relative;
          z-index: 1;
          transition: transform 0.4s ease;
        }
        .amenity-name {
          font-family: 'Playfair Display', serif;
          font-size: 1rem;
          font-weight: 700;
          color: var(--croc-deep);
          margin-bottom: 10px;
          position: relative;
          z-index: 1;
          line-height: 1.3;
        }
        .amenity-desc {
          font-size: 0.82rem;
          font-style: italic;
          color: rgba(10,10,10,0.65);
          line-height: 1.6;
          position: relative;
          z-index: 1;
        }

        .amenities-row2 {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 2px;
          max-width: 1200px;
          margin: 2px auto 0;
        }

        /* EXPERIENCE SECTION */
        .experience-section {
          background: white;
          padding: 120px 0;
          position: relative;
          overflow: hidden;
        }

        .experience-inner {
          display: grid;
          grid-template-columns: 1fr 1fr;
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 60px;
          gap: 80px;
          align-items: center;
        }

        .experience-visual {
          position: relative;
        }

        .exp-main-img {
          width: 100%;
          height: 560px;
          background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 40%, #111111 100%);
          position: relative;
          overflow: hidden;
        }
        .exp-main-img::before {
          content: '🌊';
          position: absolute;
          font-size: 12rem;
          opacity: 0.07;
          bottom: -20px;
          right: -20px;
        }
        .exp-main-img::after {
          content: '🌴';
          position: absolute;
          font-size: 8rem;
          opacity: 0.1;
          top: 20px;
          left: 20px;
        }

        .exp-float-card {
          position: absolute;
          bottom: -30px;
          right: -30px;
          background: var(--croc-gold);
          color: var(--croc-deep);
          padding: 30px;
          width: 180px;
          text-align: center;
        }
        .exp-float-num {
          font-family: 'Playfair Display', serif;
          font-size: 2.5rem;
          font-weight: 900;
          display: block;
          line-height: 1;
        }
        .exp-float-label {
          font-family: 'Inter', sans-serif;
          font-size: 0.58rem;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          opacity: 0.7;
          line-height: 1.4;
          margin-top: 6px;
        }

        .experience-text .section-tag { justify-content: flex-start; }
        .experience-text .section-tag::before { display: none; }
        .experience-text .section-title { text-align: left; margin-bottom: 24px; }

        .exp-desc {
          font-size: 1.08rem;
          font-style: italic;
          color: rgba(10,10,10,0.65);
          line-height: 1.9;
          margin-bottom: 40px;
        }

        .exp-features {
          display: flex;
          flex-direction: column;
          gap: 20px;
          margin-bottom: 44px;
        }
        .exp-feature {
          display: flex;
          align-items: flex-start;
          gap: 20px;
          padding-bottom: 20px;
          border-bottom: 1px solid rgba(240,240,240,0.07);
        }
        .exp-feature:last-child { border: none; padding: 0; }
        .exp-feature-icon {
          width: 44px; height: 44px;
          border: 1px solid rgba(144,144,144,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
          flex-shrink: 0;
          color: var(--croc-gold);
        }
        .exp-feature-title {
          font-family: 'Playfair Display', serif;
          font-size: 1rem;
          font-weight: 700;
          color: var(--croc-cream);
          margin-bottom: 4px;
        }
        .exp-feature-desc {
          font-size: 0.88rem;
          font-style: italic;
          color: rgba(240,240,240,0.5);
          line-height: 1.5;
        }

        /* TESTIMONIALS */
        .testimonials-section {
          background: white;
          padding: 100px 60px;
        }

        .testimonials-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 30px;
          max-width: 1100px;
          margin: 60px auto 0;
        }

        .testimonial-card {
          background: rgba(10,10,10,0.03);
          border: 1px solid rgba(10,10,10,0.1);
          padding: 40px;
          position: relative;
        }
        .testimonial-card::before {
          content: '"';
          font-family: 'Playfair Display', serif;
          font-size: 6rem;
          color: var(--croc-gold);
          opacity: 0.2;
          position: absolute;
          top: 10px;
          left: 28px;
          line-height: 1;
        }

        .testimonial-text {
          font-size: 1rem;
          font-style: italic;
          color: rgba(10,10,10,0.7);
          line-height: 1.8;
          margin-bottom: 28px;
          padding-top: 30px;
        }

        .testimonial-author {
          display: flex;
          align-items: center;
          gap: 14px;
        }
        .author-avatar {
          width: 44px; height: 44px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
          flex-shrink: 0;
        }
        .avatar-1 { background: linear-gradient(135deg, #141414, #2e2e2e); }
        .avatar-2 { background: linear-gradient(135deg, #2a2a2a, #484848); }
        .avatar-3 { background: linear-gradient(135deg, #484848, #6a6a6a); }

        .author-name {
          font-family: 'Playfair Display', serif;
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--croc-deep);
        }
        .author-origin {
          font-family: 'Inter', sans-serif;
          font-size: 0.58rem;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: rgba(10,10,10,0.5);
          margin-top: 2px;
        }

        .stars {
          color: var(--croc-gold);
          font-size: 0.7rem;
          letter-spacing: 2px;
          margin-bottom: 14px;
        }

        /* REVIEWS */
        .reviews-section {
          background: #f5f6fa;
          padding: 120px 60px;
          position: relative;
          overflow: hidden;
        }
        .reviews-section::before {
          content: '"';
          position: absolute;
          top: -40px;
          left: 4%;
          font-family: 'Playfair Display', serif;
          font-size: 28rem;
          color: rgba(0,0,0,0.03);
          line-height: 1;
          pointer-events: none;
        }
        .reviews-header {
          text-align: center;
          margin-bottom: 70px;
        }
        .reviews-tag {
          font-family: 'Inter', sans-serif;
          font-size: 0.62rem;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: #c9a84c;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
        }
        .reviews-tag::before, .reviews-tag::after {
          content: '';
          display: block;
          width: 40px;
          height: 1px;
          background: #c9a84c;
          opacity: 0.5;
        }
        .reviews-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(2rem, 3.5vw, 3rem);
          font-weight: 700;
          color: #1a1a2e;
          line-height: 1.15;
        }
        .reviews-title em { font-style: italic; color: #c9a84c; }
        .reviews-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 28px;
          max-width: 1200px;
          margin: 0 auto;
        }
        .review-card {
          background: #ffffff;
          border: 1px solid #eef0f4;
          border-radius: 16px;
          padding: 36px 32px;
          display: flex;
          flex-direction: column;
          gap: 24px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.06);
          transition: box-shadow 0.3s, border-color 0.3s, transform 0.3s;
        }
        .review-card:hover {
          box-shadow: 0 8px 32px rgba(0,0,0,0.1);
          border-color: rgba(201,168,76,0.3);
          transform: translateY(-3px);
        }
        .review-stars {
          display: flex;
          gap: 4px;
          color: #c9a84c;
          font-size: 0.9rem;
        }
        .review-text {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.08rem;
          font-style: italic;
          color: #4b5563;
          line-height: 1.75;
          flex: 1;
        }
        .review-author {
          display: flex;
          align-items: center;
          gap: 14px;
          padding-top: 20px;
          border-top: 1px solid #eef0f4;
        }
        .review-avatar {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          background: linear-gradient(135deg, #c9a84c, #8b6914);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Inter', sans-serif;
          font-size: 0.85rem;
          font-weight: 700;
          color: #fff;
          flex-shrink: 0;
        }
        .review-name {
          font-family: 'Inter', sans-serif;
          font-size: 0.78rem;
          font-weight: 600;
          color: #1a1a2e;
        }
        .review-platform {
          font-family: 'Inter', sans-serif;
          font-size: 0.62rem;
          color: #9098a9;
          letter-spacing: 0.04em;
          margin-top: 2px;
        }
        .reviews-cta {
          text-align: center;
          margin-top: 56px;
        }
        .reviews-cta a {
          font-family: 'Inter', sans-serif;
          font-size: 0.7rem;
          font-weight: 500;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #c9a84c;
          text-decoration: none;
          border-bottom: 1px solid rgba(201,168,76,0.4);
          padding-bottom: 3px;
          transition: border-color 0.2s;
        }
        .reviews-cta a:hover { border-color: #c9a84c; }
        @media (max-width: 900px) {
          .reviews-section { padding: 80px 30px; }
          .reviews-grid { grid-template-columns: 1fr; gap: 20px; }
        }
        @media (max-width: 600px) {
          .reviews-section { padding: 60px 20px; }
          .review-card { padding: 28px 22px; }
        }

        /* LOCATION MAP */
        .location-section {
          background: var(--croc-cream);
          padding: 100px 60px;
        }
        .location-inner {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1.6fr;
          gap: 60px;
          align-items: center;
        }
        .location-label {
          font-family: 'Inter', sans-serif;
          font-size: 0.6rem;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: var(--croc-moss);
          margin-bottom: 16px;
        }
        .location-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(1.8rem, 3.5vw, 2.8rem);
          font-weight: 700;
          color: var(--croc-deep);
          line-height: 1.15;
          margin-bottom: 24px;
        }
        .location-desc {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.05rem;
          color: rgba(10,10,10,0.6);
          line-height: 1.8;
          margin-bottom: 32px;
        }
        .location-detail {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 14px;
        }
        .location-detail-icon {
          font-size: 0.9rem;
          margin-top: 2px;
          flex-shrink: 0;
        }
        .location-detail-text {
          font-family: 'Inter', sans-serif;
          font-size: 0.72rem;
          letter-spacing: 0.06em;
          color: rgba(10,10,10,0.65);
          line-height: 1.6;
        }
        .location-directions-btn {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          margin-top: 28px;
          padding: 14px 28px;
          background: var(--croc-forest);
          color: var(--croc-cream);
          font-family: 'Inter', sans-serif;
          font-size: 0.65rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          text-decoration: none;
          border-radius: 6px;
          transition: background 0.3s;
        }
        .location-directions-btn:hover { background: var(--croc-moss); }
        .location-map {
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 16px 60px rgba(0,0,0,0.15);
          height: 420px;
        }
        .location-map iframe {
          width: 100%;
          height: 100%;
          border: none;
          display: block;
        }
        @media (max-width: 1024px) {
          .location-section { padding: 80px 30px; }
          .location-inner { grid-template-columns: 1fr; gap: 40px; }
          .location-map { height: 320px; }
        }
        @media (max-width: 600px) {
          .location-section { padding: 60px 24px; }
          .location-map { height: 260px; border-radius: 10px; }
        }

        /* CONTACT/FOOTER */
        footer {
          background: var(--croc-sand);
          padding: 36px 60px;
          border-top: 1px solid rgba(144,144,144,0.2);
        }

        .footer-main {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 32px;
          flex-wrap: wrap;
          padding-bottom: 24px;
          border-bottom: 1px solid rgba(10,10,10,0.1);
          margin-bottom: 20px;
        }

        .footer-logo {
          font-family: 'Playfair Display', serif;
          font-size: 1.2rem;
          font-weight: 900;
          color: var(--croc-deep);
          white-space: nowrap;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .footer-logo-img {
          height: 48px;
          width: 48px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid rgba(10,10,10,0.12);
          flex-shrink: 0;
        }
        .footer-logo span { color: var(--croc-deep); }

        .footer-contact-row {
          display: flex;
          align-items: center;
          gap: 28px;
          flex-wrap: wrap;
        }
        .footer-contact-item {
          display: flex;
          align-items: center;
          gap: 7px;
        }
        .contact-icon { font-size: 0.78rem; }
        .contact-text {
          font-family: 'Inter', sans-serif;
          font-size: 0.68rem;
          letter-spacing: 0.04em;
          color: rgba(10,10,10,0.6);
          line-height: 1;
        }

        .social-links { display: flex; gap: 10px; }
        .social-link {
          width: 32px; height: 32px;
          border: 1px solid rgba(10,10,10,0.2);
          display: flex; align-items: center; justify-content: center;
          text-decoration: none; color: var(--croc-deep); transition: all 0.3s;
        }
        .social-link:hover { background: var(--croc-deep); color: var(--croc-sand); border-color: var(--croc-deep); }

        .footer-bottom {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .copyright {
          font-family: 'Inter', sans-serif;
          font-size: 0.58rem;
          letter-spacing: 0.1em;
          color: rgba(10,10,10,0.4);
        }
        .footer-legal { display: flex; gap: 24px; }
        .footer-legal a {
          font-family: 'Inter', sans-serif;
          font-size: 0.58rem;
          letter-spacing: 0.1em;
          color: rgba(10,10,10,0.4);
          text-decoration: none;
          transition: color 0.2s;
        }
        .footer-legal a:hover { color: var(--croc-deep); }

        /* Reveal animation */
        .reveal {
          opacity: 0;
          transform: translateY(30px);
          transition: opacity 0.8s ease, transform 0.8s ease;
        }
        .reveal.visible {
          opacity: 1;
          transform: translateY(0);
        }

        /* Responsive */
        @media (max-width: 1024px) {
          nav { padding: 24px 30px; }
          .nav-links { display: none; }
          .hero-content { padding-left: 6%; }
          .hero-stats { right: 6%; gap: 30px; }
          .booking-bar { grid-template-columns: 1fr 1fr; }
          .booking-submit { grid-column: span 2; padding: 16px; }
          .booking-bar .booking-field:last-of-type { grid-column: span 2; }
          .booking-result-section { padding: 80px 24px; }
          .price-summary { padding: 24px; }
          .avail-result { padding: 28px 24px; }
          .villas-grid, .villa-row-2 { grid-template-columns: 1fr; }
          .amenities-grid, .amenities-row2 { grid-template-columns: repeat(3, 1fr); }
          .experience-inner { grid-template-columns: 1fr; }
          .testimonials-grid { grid-template-columns: 1fr 1fr; }
          .footer-top { grid-template-columns: 1fr; gap: 40px; }
          .booking-field { padding: 16px 18px; }
        }

        @media (max-width: 600px) {
          .hero { background-image: url('/images/portrait.jpeg'); }
          .amenities-grid, .amenities-row2 { grid-template-columns: repeat(2, 1fr); }
          .testimonials-grid { grid-template-columns: 1fr; }
          .hero-stats { display: none; }
          .calendar-grid { grid-template-columns: 1fr; }
          .footer-top { grid-template-columns: 1fr; }
          footer { padding: 60px 24px 40px; }
          .amenities-section, .villas-section, .experience-section, .testimonials-section { padding: 80px 24px; }
          .hamburger { display: flex; }
          .nav-links { display: none; }
          .nav-book { display: none; }
          nav { padding: 20px 24px; }
          .hero-content { align-items: center; padding: 0 16px; }
          .booking-bar-hero { width: 100%; display: flex; justify-content: center; }
          .booking-bar { grid-template-columns: 1fr; width: 100%; }
          .booking-submit { border-radius: 0 0 16px 16px; }
        }
      `}</style>

      {/* TOP BAR */}
      <div className="topbar">
        <span className="topbar-item topbar-addr">
          📍 Diani, Kwale County, Kenya
        </span>
        <span className="topbar-divider topbar-div-addr" />
        <a href="tel:+254715510119" className="topbar-item">
          📞 +254 715 510 119
        </a>
        <span className="topbar-divider" />
        <a href="mailto:crocodilelodgediani@gmail.com" className="topbar-item">
          📧 crocodilelodgediani@gmail.com
        </a>
        <span className="topbar-divider topbar-div-maps" />
        <a
          href="https://maps.app.goo.gl/tSFjVexSKAK9GiRE7"
          target="_blank"
          rel="noopener noreferrer"
          className="topbar-item topbar-maps"
        >
          🗺 View on Maps
        </a>
      </div>

      {/* NAV */}
      <nav
        className={`${navScrolled ? "nav-scrolled" : ""} ${!navVisible ? "nav-hidden" : ""}`}
      >
        <Link to="/" className="nav-logo">
          <img
            src="/favicon/logo.jpeg"
            alt="Crocodile Lodge"
            className="nav-logo-img"
          />
          Croc<span>odile</span> Lodge
        </Link>
        <ul className="nav-links">
          <li>
            <a href="#villas">Villas</a>
          </li>
          <li>
            <Link to="/gallery">Gallery</Link>
          </li>
          <li>
            <a href="#contact">Contact</a>
          </li>
        </ul>
        <CurrencySelector />
        <button
          className={`hamburger ${mobileMenuOpen ? "active" : ""}`}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </nav>

      {/* MOBILE MENU */}
      <div className={`mobile-menu ${mobileMenuOpen ? "active" : ""}`}>
        <a href="#villas" onClick={() => setMobileMenuOpen(false)}>
          Villas
        </a>
        <Link to="/gallery" onClick={() => setMobileMenuOpen(false)}>
          Gallery
        </Link>
        <a href="#about" onClick={() => setMobileMenuOpen(false)}>
          About
        </a>
        <a href="#contact" onClick={() => setMobileMenuOpen(false)}>
          Contact
        </a>
        <a
          href="#availability"
          className="nav-book"
          onClick={() => setMobileMenuOpen(false)}
        >
          Book Direct — Best Rate
        </a>
      </div>

      {/* HERO */}
      <section className="hero" id="availability">
        <div className="hero-gate-overlay"></div>

        <div className="hero-content">
          <div className="hero-title-wrap">
            <h1 className="hero-title">
              Welcome to
              <br />
              <em>Crocodile Lodge</em>
            </h1>
          </div>

          {/* BOOKING BAR */}
          <div className="booking-bar-hero">
            <div className="booking-bar">
              <div className="booking-field">
                <label>Check In</label>
                <input
                  type="date"
                  value={checkin}
                  onChange={(e) => setCheckin(e.target.value)}
                />
              </div>
              <div className="booking-field">
                <label>Check Out</label>
                <input
                  type="date"
                  value={checkout}
                  onChange={(e) => setCheckout(e.target.value)}
                />
              </div>
              <div className="booking-field">
                <label>Guests</label>
                <input
                  type="number"
                  min="1"
                  max="21"
                  value={guests}
                  onChange={(e) => setGuests(Number(e.target.value))}
                />
              </div>
              <button className="booking-submit" onClick={handleSearch}>
                Search
              </button>
            </div>
          </div>

          {/* HERO TAGLINE */}
          <div className="hero-tagline">
            <p>
              The Indian Ocean is calling you, just steps from Diani Beach in
              Kenya...
            </p>
            <p>
              The Lodge, a dreamy oasis just minutes from the sea, invites you
              to experience an unforgettable vacation.
            </p>
            <p>
              Kite surfing, scuba diving, safaris... Adventure awaits, set to
              the rhythm of the savannah and turquoise waves.
            </p>
            <p>
              Send me a message, and I'll reveal the secrets of this little
              corner of paradise.
            </p>
          </div>
        </div>
      </section>

      {/* VILLAS */}
      <section className="villas-section" id="villas">
        <div className="section-header reveal" style={{ marginBottom: "40px" }}>
          <div className="section-tag">Accommodation</div>
          <h2 className="section-title">Crocodile <em style={{color:"#c9a84c",fontStyle:"italic"}}>Stay</em></h2>
        </div>

        <div className="villas-grid">
          {VILLAS.map((villa, index) => (
            <div key={villa.id} style={{ transitionDelay: `${index * 0.1}s` }}>
              <VillaCard villa={villa} onSelectVilla={handleSelectVilla} />
            </div>
          ))}
        </div>
      </section>

      {/* REVIEWS */}
      <section className="reviews-section">
        <div className="reviews-header reveal">
          <div className="reviews-tag">Guest Reviews</div>
          <h2 className="reviews-title">
            What Our Guests <em>Say</em>
          </h2>
        </div>
        <div className="reviews-grid">
          {[
            {
              name: "Mitchelle Waiyaki",
              text: "This villa is nothing short of Amazing. The house has ample space it's clean. We enjoyed all the amenities. The pool table was a good idea. Jacy (the host) was so amazing and helpful. Looking forward to coming back for sure.",
            },
            {
              name: "Molline Dove",
              text: "Beautiful place. Quiet and serene. Wonderful, friendly hosts. Definitely worth many return visits ❣️🤩🎊",
            },
            {
              name: "Philip Kiganjo",
              text: "Crocodile Villa lodge is an amazing place to stay as you stay in Diani. My team of 17 friends enjoyed our stay at the villa, which is conveniently located 15 mins from the beach. The rooms were clean and well organized, all amenities were available for use and in good condition, and the swimming pool was absolutely divine 🤗",
            },
          ].map((review) => (
            <div key={review.name} className="review-card reveal">
              <div className="review-stars">★★★★★</div>
              <p className="review-text">"{review.text}"</p>
              <div className="review-author">
                <div className="review-avatar">{review.name.charAt(0)}</div>
                <div>
                  <div className="review-name">{review.name}</div>
                  <div className="review-platform">Verified Guest</div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="reviews-cta">
          <a
            href="https://maps.app.goo.gl/SshmqRxQdQEuLnTB7"
            target="_blank"
            rel="noopener noreferrer"
          >
            Read more reviews →
          </a>
        </div>
      </section>

      {/* LOCATION */}
      <section className="location-section">
        <div className="location-inner">
          <div>
            <div className="location-label">Find Us</div>
            <h2 className="location-title">Our Location</h2>
            <p className="location-desc">
              Crocodile Lodge is your perfect coastal retreat.
            </p>
            <div className="location-detail">
              <span className="location-detail-icon">📍</span>
              <span className="location-detail-text">
                Diani, Kwale County, Kenya
              </span>
            </div>

            <div className="location-detail">
              <span className="location-detail-icon">✈️</span>
              <span className="location-detail-text">
                45 mins - 1.5 hrs drive from Moi International Airport, Mombasa
              </span>
            </div>
            <a
              href="https://maps.app.goo.gl/tSFjVexSKAK9GiRE7"
              target="_blank"
              rel="noopener noreferrer"
              className="location-directions-btn"
            >
              Get Directions →
            </a>
          </div>
          <div className="location-map">
            <iframe
              title="Crocodile Lodge Location"
              src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d3978.2948503175276!2d39.5494013!3d-4.3556933!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x18404f0031034e99%3A0xa1696bc658b00344!2scrocodile%20lodge!5e0!3m2!1sen!2ske!4v1774341398801!5m2!1sen!2ske"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer id="contact">
        <div className="footer-main">
          <div className="footer-logo">
            <img
              src="/favicon/logo.jpeg"
              alt="Crocodile Lodge"
              className="footer-logo-img"
            />
            Croc<span>odile</span> Villas
          </div>
          <div className="social-links">
            <a
              href="https://www.facebook.com/share/1CWQwy8KEX/"
              className="social-link"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
            >
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                width="18"
                height="18"
              >
                <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.413c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
              </svg>
            </a>
            <a
              href="https://www.tiktok.com/@crocodilelodgediani?_r=1&_t=ZS-94XeUr1MiH7"
              className="social-link"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="TikTok"
            >
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                width="18"
                height="18"
              >
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z" />
              </svg>
            </a>
            <a
              href="https://wa.me/254715510119"
              className="social-link"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
            >
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                width="18"
                height="18"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
              </svg>
            </a>
            <a
              href="mailto:crocodilelodgediani@gmail.com"
              className="social-link"
              aria-label="Email"
            >
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                width="18"
                height="18"
              >
                <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z" />
              </svg>
            </a>
          </div>
        </div>

        <div className="footer-bottom">
          <span className="copyright">
            © 2026 Crocodile Villas. All rights reserved.
          </span>
          <div className="footer-legal">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Use</a>
            <a href="#">Sitemap</a>
          </div>
        </div>
      </footer>
    </>
  );
};

export default CrocodileLodge;
