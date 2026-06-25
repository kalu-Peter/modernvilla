import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import CurrencySelector from "./CurrencySelector";
import LanguageSwitcher from "./LanguageSwitcher";

const Header: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const isHome = location.pathname === "/";
  const sheltersHref = isHome ? "#shelters" : "/#shelters";
  const aboutHref = isHome ? "#about" : "/#about";
  const contactHref = isHome ? "#contact" : "/#contact";
  const bookHref = isHome ? "#availability" : "/#availability";

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [navVisible, setNavVisible] = useState(true);
  const [navScrolled, setNavScrolled] = useState(false);

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

  return (
    <>
      <style>{`
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
          transition: transform 0.35s ease, background 0.35s ease, padding 0.35s ease, top 0.35s ease;
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
          color: #f0f0f0;
          text-decoration: none;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .nav-logo span { color: #c9a84c; }

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
          color: #f0f0f0;
          text-decoration: none;
          opacity: 0.85;
          transition: opacity 0.3s, color 0.3s;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
        }
        .nav-links a:hover, .nav-links button:hover { opacity: 1; color: #c9a84c; }

        .currency-selector, .language-selector {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-right: 8px;
        }
        .currency-selector select, .language-selector select {
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
        .currency-selector select option, .language-selector select option { background: #1a1a2e; color: #fff; }
        .currency-selector select:hover, .language-selector select:hover { border-color: #c9a84c; color: #c9a84c; }

        .nav-book {
          font-family: 'Inter', sans-serif;
          font-size: 0.65rem;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #0a0a0a;
          background: #c9a84c;
          padding: 12px 28px;
          text-decoration: none;
          transition: background 0.3s, transform 0.2s;
        }
        .nav-book:hover { background: #e0c068; transform: translateY(-1px); }

        /* HAMBURGER */
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
          background: #f0f0f0;
          transition: all 0.3s ease;
          display: block;
        }
        .hamburger.active span:nth-child(1) { transform: rotate(45deg) translate(8px, 8px); }
        .hamburger.active span:nth-child(2) { opacity: 0; }
        .hamburger.active span:nth-child(3) { transform: rotate(-45deg) translate(7px, -7px); }

        /* MOBILE MENU */
        .mobile-menu {
          display: none;
          position: fixed;
          top: 0; left: 0;
          width: 100%;
          height: 100%;
          background: #fff;
          z-index: 102;
          padding-top: 100px;
          flex-direction: column;
          align-items: center;
          gap: 30px;
        }
        .mobile-menu.active { display: flex; }

        .mobile-menu-close {
          position: absolute;
          top: 20px;
          right: 20px;
          background: none;
          border: none;
          cursor: pointer;
          font-size: 1.6rem;
          color: rgba(10,10,10,0.5);
          line-height: 1;
          padding: 4px 8px;
          transition: color 0.2s;
        }
        .mobile-menu-close:hover { color: #0a0a0a; }

        .mobile-menu a, .mobile-menu button:not(.mobile-menu-close) {
          font-family: 'Inter', sans-serif;
          font-size: 1rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #0a0a0a;
          text-decoration: none;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
          transition: color 0.3s;
        }
        .mobile-menu a:hover, .mobile-menu button:not(.mobile-menu-close):hover { color: #8b6914; }

        .mobile-menu .nav-book {
          display: inline-block;
          margin-top: 20px;
          font-size: 0.75rem;
          color: #0a0a0a !important;
        }

        @media (max-width: 1024px) {
          nav { padding: 24px 30px; }
          .nav-links { display: none; }
        }

        @media (max-width: 768px) {
          nav { top: 64px; padding: 16px 24px; }
          .hamburger { display: flex; }
          .nav-links { display: none; }
          .nav-book { display: none; }
        }
      `}</style>

      <nav className={`${navScrolled ? "nav-scrolled" : ""} ${!navVisible ? "nav-hidden" : ""}`}>
        <Link to="/" className="nav-logo">
          Alsace<span> Hideaways</span>
        </Link>
        <ul className="nav-links">
          <li>
            <a href={sheltersHref}>{t("nav.shelters")}</a>
          </li>
          <li>
            <Link to="/gallery">{t("nav.gallery")}</Link>
          </li>
          <li>
            <a href={contactHref}>{t("nav.contact")}</a>
          </li>
        </ul>
        <CurrencySelector />
        <LanguageSwitcher />
        <button
          className={`hamburger ${mobileMenuOpen ? "active" : ""}`}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={t("nav.toggleMenu")}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </nav>

      <div className={`mobile-menu ${mobileMenuOpen ? "active" : ""}`}>
        <button
          className="mobile-menu-close"
          onClick={() => setMobileMenuOpen(false)}
          aria-label={t("nav.closeMenu")}
        >
          ✕
        </button>
        <a href={sheltersHref} onClick={() => setMobileMenuOpen(false)}>
          {t("nav.shelters")}
        </a>
        <Link to="/gallery" onClick={() => setMobileMenuOpen(false)}>
          {t("nav.gallery")}
        </Link>
        <a href={aboutHref} onClick={() => setMobileMenuOpen(false)}>
          {t("nav.about")}
        </a>
        <a href={contactHref} onClick={() => setMobileMenuOpen(false)}>
          {t("nav.contact")}
        </a>
        <a href={bookHref} className="nav-book" onClick={() => setMobileMenuOpen(false)}>
          {t("nav.bookDirect")}
        </a>
      </div>
    </>
  );
};

export default Header;
