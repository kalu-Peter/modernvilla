import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import SEO from "./components/SEO";

const Gallery: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>("general");
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      if (diff > 0)
        setViewerIndex((i) => Math.min(i + 1, currentImages.length - 1));
      else setViewerIndex((i) => Math.max(i - 1, 0));
    }
    touchStartX.current = null;
  };

  const galleryData = {
    general: [
      { src: "/images/WhatsApp Image 2026-04-03 at 13.21.35.jpeg", alt: "Crocodile Lodge" },
      { src: "/images/WhatsApp Image 2026-04-03 at 13.21.35 (1).jpeg", alt: "Lodge Grounds" },
      { src: "/images/WhatsApp Image 2026-04-03 at 13.21.35 (2).jpeg", alt: "Outdoor Area" },
      { src: "/images/WhatsApp Image 2026-04-03 at 13.21.36.jpeg", alt: "Property" },
      { src: "/images/WhatsApp Image 2026-04-03 at 13.21.36 (1).jpeg", alt: "Lodge Exterior" },
      { src: "/images/WhatsApp Image 2026-04-03 at 13.21.36 (2).jpeg", alt: "Garden" },
      { src: "/images/WhatsApp Image 2026-04-03 at 13.21.36 (3).jpeg", alt: "Tropical Setting" },
      { src: "/images/WhatsApp Image 2026-04-03 at 13.21.36 (4).jpeg", alt: "Lodge Area" },
      { src: "/images/IMG_20240814_134945.jpg", alt: "Lodge View" },
      {
        src: "/images/crocodile/Maisons Diani-photos-Pierre_Rich-2.jpg",
        alt: "Crocodile Lodge",
      },
      {
        src: "/images/crocodile/IMG_20241121_135225.jpg",
        alt: "Lodge Exterior",
      },
      { src: "/images/crocodile/IMG_20241121_135032.jpg", alt: "Common Area" },
      { src: "/images/crocodile/IMG_20240717_131652.jpg", alt: "Garden View" },
      {
        src: "/images/crocodile/WhatsApp Image 2026-03-09 at 13.25.32.jpeg",
        alt: "Poolside",
      },
      {
        src: "/images/crocodile/WhatsApp Image 2026-03-09 at 13.25.33.jpeg",
        alt: "Pool Area",
      },
      {
        src: "/images/crocodile/WhatsApp Image 2026-03-09 at 13.25.36.jpeg",
        alt: "Outdoor Space",
      },
      {
        src: "/images/crocodile/WhatsApp Image 2026-03-09 at 13.25.37.jpeg",
        alt: "Lodge Surroundings",
      },
      {
        src: "/images/crocodile/WhatsApp Image 2026-03-09 at 13.25.52.jpeg",
        alt: "Tropical Gardens",
      },
      {
        src: "/images/crocodile/WhatsApp Image 2026-03-09 at 13.25.58.jpeg",
        alt: "Property View",
      },
      {
        src: "/images/crocodile/WhatsApp Image 2026-03-09 at 13.26.32.jpeg",
        alt: "Grounds",
      },
      {
        src: "/images/crocodile/WhatsApp Image 2026-03-09 at 13.26.36.jpeg",
        alt: "Lodge Area",
      },
      {
        src: "/images/crocodile/WhatsApp Image 2026-03-09 at 13.26.37.jpeg",
        alt: "Outdoor Living",
      },
      {
        src: "/images/crocodile/WhatsApp Image 2026-03-09 at 13.26.42.jpeg",
        alt: "Lodge Entrance",
      },
      { src: "/images/gate.jpg", alt: "Main Gate" },
      { src: "/images/poolview.jpeg", alt: "Pool View" },
      { src: "/images/IMG-20250728-WA0039.jpg", alt: "General View" },
    ],
    blue: [
      {
        src: "/images/crocodile/blue/Maisons Diani-photos-Pierre_Rich-45.jpg",
        alt: "Blue Villa",
      },
      {
        src: "/images/crocodile/blue/Maisons Diani-photos-Pierre_Rich-37.jpg",
        alt: "Blue Villa Interior",
      },
      {
        src: "/images/crocodile/blue/IMG-20250728-WA0040.jpg",
        alt: "Blue Villa Room",
      },
      {
        src: "/images/crocodile/blue/IMG-20250728-WA0036.jpg",
        alt: "Blue Villa Bedroom",
      },
      {
        src: "/images/crocodile/blue/IMG-20250728-WA0033.jpg",
        alt: "Blue Villa Living Area",
      },
      {
        src: "/images/crocodile/blue/IMG-20250728-WA0031.jpg",
        alt: "Blue Villa Exterior",
      },
      {
        src: "/images/crocodile/blue/IMG-20250728-WA0015.jpg",
        alt: "Blue Villa View",
      },
      {
        src: "/images/crocodile/blue/20241121_140024.jpg",
        alt: "Blue Villa Space",
      },
      {
        src: "/images/crocodile/blue/20241121_135924.jpg",
        alt: "Blue Villa Detail",
      },
      {
        src: "/images/crocodile/blue/20241121_135917.jpg",
        alt: "Blue Villa Area",
      },
      {
        src: "/images/crocodile/blue/20241121_135844.jpg",
        alt: "Blue Villa Garden",
      },
    ],
    green: [
      {
        src: "/images/crocodile/green/Maisons Diani-photos-Pierre_Rich-38.jpg",
        alt: "Green Villa",
      },
      {
        src: "/images/crocodile/green/Maisons Diani-photos-Pierre_Rich-42.jpg",
        alt: "Green Villa Interior",
      },
      {
        src: "/images/crocodile/green/IMG-20250728-WA0038.jpg",
        alt: "Green Villa Bedroom",
      },
      {
        src: "/images/crocodile/green/IMG-20250728-WA0037.jpg",
        alt: "Green Villa Living Area",
      },
      {
        src: "/images/crocodile/green/IMG-20250728-WA0033.jpg",
        alt: "Green Villa Exterior",
      },
      {
        src: "/images/crocodile/green/IMG-20250728-WA0032.jpg",
        alt: "Green Villa Garden",
      },
      {
        src: "/images/crocodile/green/IMG-20250728-WA0024.jpg",
        alt: "Green Villa View",
      },
    ],
    gold: [
      {
        src: "/images/crocodile/gold/Maisons Diani-photos-Pierre_Rich-15.jpg",
        alt: "Gold Lodge",
      },
      {
        src: "/images/crocodile/gold/Maisons Diani-photos-Pierre_Rich-11.jpg",
        alt: "Gold Lodge Interior",
      },
      {
        src: "/images/crocodile/gold/WhatsApp Image 2026-03-09 at 13.25.46.jpeg",
        alt: "Gold Lodge Space",
      },
      {
        src: "/images/crocodile/gold/20250803_162410.jpg",
        alt: "Gold Lodge Room",
      },
      {
        src: "/images/crocodile/gold/20250803_162250.jpg",
        alt: "Gold Lodge Bedroom",
      },
      {
        src: "/images/crocodile/gold/20250803_162139.jpg",
        alt: "Gold Lodge Area",
      },
      {
        src: "/images/crocodile/gold/20250803_162136.jpg",
        alt: "Gold Lodge Living",
      },
      {
        src: "/images/crocodile/gold/20250307_142357.jpg",
        alt: "Gold Lodge View",
      },
      {
        src: "/images/crocodile/gold/20250307_142209.jpg",
        alt: "Gold Lodge Detail",
      },
      {
        src: "/images/crocodile/gold/20250307_142205.jpg",
        alt: "Gold Lodge Exterior",
      },
      {
        src: "/images/crocodile/gold/20250307_142151.jpg",
        alt: "Gold Lodge Garden",
      },
      {
        src: "/images/crocodile/gold/IMG-20250307-WA0019.jpg",
        alt: "Gold Lodge Amenity",
      },
      {
        src: "/images/crocodile/gold/IMG-20250307-WA0012.jpg",
        alt: "Gold Lodge Feature",
      },
      {
        src: "/images/crocodile/gold/IMG_20250226_192834.jpg",
        alt: "Gold Lodge Evening",
      },
      {
        src: "/images/crocodile/gold/IMG_20250226_134129.jpg",
        alt: "Gold Lodge Dining",
      },
      {
        src: "/images/crocodile/gold/IMG_20250226_134110.jpg",
        alt: "Gold Lodge Lounge",
      },
      {
        src: "/images/crocodile/gold/IMG_20250226_132636.jpg",
        alt: "Gold Lodge Pool",
      },
    ],
    mango1stfloor: [
      {
        src: "/images/mango 1st floor/1st floor 1.jpg",
        alt: "Mango 1st Floor",
      },
      {
        src: "/images/mango 1st floor/1st floor 2.jpg",
        alt: "Mango 1st Floor",
      },
      {
        src: "/images/mango 1st floor/1st floor 3.jpg",
        alt: "Mango 1st Floor",
      },
      {
        src: "/images/mango 1st floor/1st floor 4.jpg",
        alt: "Mango 1st Floor",
      },
      {
        src: "/images/mango 1st floor/1st floor 5.jpg",
        alt: "Mango 1st Floor",
      },
      {
        src: "/images/mango 1st floor/1st floor 6.jpg",
        alt: "Mango 1st Floor",
      },
      {
        src: "/images/mango 1st floor/1st floor 7.jpg",
        alt: "Mango 1st Floor",
      },
      {
        src: "/images/mango 1st floor/1st floor 8.jpg",
        alt: "Mango 1st Floor",
      },
      {
        src: "/images/mango 1st floor/1st floor 9.jpg",
        alt: "Mango 1st Floor",
      },
      {
        src: "/images/mango 1st floor/1st floor 10.jpg",
        alt: "Mango 1st Floor",
      },
    ],
    mangopark: [
      {
        src: "/images/mango park/Maisons Diani-photos-Pierre_Rich-55.jpg",
        alt: "Mango Park",
      },
      {
        src: "/images/mango park/Maisons Diani-photos-Pierre_Rich-52.jpg",
        alt: "Mango Park",
      },
      {
        src: "/images/mango park/Maisons Diani-photos-Pierre_Rich-61_BD.jpg",
        alt: "Mango Park",
      },
      {
        src: "/images/mango park/Maisons Diani-photos-Pierre_Rich-58.jpg",
        alt: "Mango Park",
      },
      {
        src: "/images/mango park/Maisons Diani-photos-Pierre_Rich-57.jpg",
        alt: "Mango Park",
      },
      { src: "/images/mango park/20250731_100752.jpg", alt: "Mango Park" },
      { src: "/images/mango park/20250731_100808.jpg", alt: "Mango Park" },
      { src: "/images/mango park/20250731_100905.jpg", alt: "Mango Park" },
      { src: "/images/mango park/20250731_101142.jpg", alt: "Mango Park" },
    ],
    paradise: [
      {
        src: "/images/paradise/IMG_20260223_151803.jpg",
        alt: "Paradise Villa",
      },
      {
        src: "/images/paradise/IMG_20260223_151823.jpg",
        alt: "Paradise Villa",
      },
      {
        src: "/images/paradise/IMG_20260223_151836.jpg",
        alt: "Paradise Villa",
      },
      {
        src: "/images/paradise/IMG_20260223_151847.jpg",
        alt: "Paradise Villa",
      },
      {
        src: "/images/paradise/IMG_20260223_151927.jpg",
        alt: "Paradise Villa",
      },
      {
        src: "/images/paradise/IMG_20260223_151930.jpg",
        alt: "Paradise Villa",
      },
      {
        src: "/images/paradise/IMG_20260223_151951.jpg",
        alt: "Paradise Villa",
      },
      {
        src: "/images/paradise/IMG_20260223_151959.jpg",
        alt: "Paradise Villa",
      },
      {
        src: "/images/paradise/IMG_20260223_152031.jpg",
        alt: "Paradise Villa",
      },
      {
        src: "/images/paradise/IMG_20260223_154754.jpg",
        alt: "Paradise Villa",
      },
      {
        src: "/images/paradise/IMG_20260223_154913.jpg",
        alt: "Paradise Villa",
      },
    ],
  };

  const videos = [
    { src: "/videos/VID-20260309-WA0002.mp4", label: "Crocodile Lodge" },
    { src: "/videos/VID-20260309-WA0004.mp4", label: "Crocodile Lodge" },
    { src: "/videos/VID-20260309-WA0006.mp4", label: "Crocodile Lodge" },
    { src: "/videos/VID-20260309-WA0007.mp4", label: "Crocodile Lodge" },
    { src: "/videos/VID-20260309-WA0008.mp4", label: "Crocodile Lodge" },
    { src: "/videos/VID-20260309-WA0019.mp4", label: "Crocodile Lodge" },
    { src: "/videos/VID-20260309-WA0021.mp4", label: "Crocodile Lodge" },
    { src: "/videos/VID-20260309-WA0026.mp4", label: "Crocodile Lodge" },
    { src: "/videos/VID-20260309-WA0027.mp4", label: "Crocodile Lodge" },
  ];

  const currentImages =
    galleryData[activeSection as keyof typeof galleryData] ?? [];

  const sections = [
    { id: "general", label: "General", color: "#c8b89a" },
    { id: "blue", label: "Blue Villa", color: "#3b82f6" },
    { id: "green", label: "Green Villa", color: "#10b981" },
    { id: "gold", label: "Gold Lodge", color: "#eab308" },
    { id: "mango1stfloor", label: "Mango 1st Floor", color: "#f97316" },
    { id: "mangopark", label: "Mango Villas", color: "#84cc16" },
    { id: "paradise", label: "Paradise Villa", color: "#7c3aed" },
    { id: "videos", label: "Videos", color: "#ef4444" },
  ];

  return (
    <>
      <SEO
        title="Photo Gallery"
        description="Browse photos of Crocodile Lodge — our Blue Villa, Green Villa, Gold Lodge, pool, and tropical gardens in Diani Beach, Kenya."
        url="/gallery"
      />
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

        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }

        html { scroll-behavior: smooth; }

        body {
          font-family: 'Cormorant Garamond', serif;
          background: #f5f6fa;
          color: #1a1a2e;
          overflow-x: hidden;
        }

        /* NAV */
        nav {
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 100;
          padding: 22px 60px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: rgba(201,168,76,0.95);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(255,255,255,0.18);
          box-shadow: 0 2px 16px rgba(0,0,0,0.08);
        }

        .nav-logo {
          font-family: 'Playfair Display', serif;
          font-size: 1.4rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          color: #fff;
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
        .nav-logo span { color: rgba(255,255,255,0.65); }

        .nav-links {
          display: flex;
          gap: 40px;
          list-style: none;
        }
        .nav-links a, .nav-links button {
          font-family: 'Inter', sans-serif;
          font-size: 0.72rem;
          font-weight: 500;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: #fff;
          text-decoration: none;
          opacity: 0.75;
          transition: opacity 0.2s;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
        }
        .nav-links a:hover, .nav-links button:hover { opacity: 1; }

        .nav-book {
          font-family: 'Inter', sans-serif;
          font-size: 0.7rem;
          font-weight: 600;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: #1a1a2e;
          background: #fff;
          padding: 10px 22px;
          border-radius: 8px;
          text-decoration: none;
          transition: background 0.2s, transform 0.15s;
        }
        .nav-book:hover { background: #f0f0f0; transform: translateY(-1px); }

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
          background: rgba(10, 10, 10, 0.98);
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
          font-size: 0.95rem;
          font-weight: 500;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #fff;
          text-decoration: none;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
          transition: color 0.2s;
        }

        .mobile-menu a:hover, .mobile-menu button:hover {
          color: #c9a84c;
        }

        .mobile-menu .nav-book {
          display: inline-block;
          margin-top: 20px;
          font-size: 0.75rem;
        }

        /* GALLERY */
        .gallery-container {
          min-height: 100vh;
          background: #f5f6fa;
          padding-top: 110px;
          padding-bottom: 80px;
        }

        .gallery-header {
          text-align: center;
          margin-bottom: 52px;
          padding: 0 60px;
        }

        .gallery-eyebrow {
          font-family: 'Inter', sans-serif;
          font-size: 0.65rem;
          font-weight: 600;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: #c9a84c;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
        }
        .gallery-eyebrow::before {
          content: '';
          display: block;
          width: 50px;
          height: 1px;
          background: rgba(10,10,10,0.2);
        }
        .gallery-eyebrow::after {
          content: '';
          display: block;
          width: 50px;
          height: 1px;
          background: rgba(10,10,10,0.2);
        }

        .gallery-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(2.5rem, 5vw, 4rem);
          font-weight: 900;
          color: #1a1a2e;
          margin-bottom: 36px;
        }

        /* SECTION TABS */
        .section-tabs {
          display: flex;
          justify-content: center;
          gap: 10px;
          margin-bottom: 60px;
          flex-wrap: wrap;
          padding: 0 60px;
        }

        .section-tab {
          font-family: 'Inter', sans-serif;
          font-size: 0.72rem;
          font-weight: 600;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          padding: 10px 24px;
          border: 1.5px solid #e5e7eb;
          border-radius: 24px;
          background: #fff;
          color: #9098a9;
          cursor: pointer;
          transition: all 0.18s;
          box-shadow: 0 1px 3px rgba(0,0,0,0.04);
        }

        .section-tab.active {
          background: #1a1a2e;
          color: #fff;
          border-color: #1a1a2e;
          box-shadow: 0 4px 12px rgba(26,26,46,0.2);
        }

        .section-tab:hover:not(.active) {
          border-color: #c9a84c;
          color: #c9a84c;
          background: #fff;
        }

        /* GALLERY ITEMS */
        .gallery-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 30px;
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 60px;
        }

        .gallery-item {
          position: relative;
          overflow: hidden;
          aspect-ratio: 1;
          cursor: zoom-in;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.07);
          transition: box-shadow 0.22s, transform 0.22s;
        }
        .gallery-item:hover { box-shadow: 0 10px 32px rgba(0,0,0,0.14); transform: translateY(-2px); }

        .gallery-item-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
          display: block;
        }

        .gallery-item:hover .gallery-item-img {
          transform: scale(1.06);
        }

        .gallery-item-overlay {
          position: absolute;
          inset: 0;
          background: rgba(26,26,46,0.5);
          opacity: 0;
          transition: opacity 0.3s;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
        }

        .gallery-item:hover .gallery-item-overlay {
          opacity: 1;
        }

        /* Image viewer — compact panel, not full-screen */
        .img-viewer-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.72);
          backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);
          z-index: 9999; display: flex; align-items: center; justify-content: center;
          padding: 80px 20px 20px;
        }
        .img-viewer {
          width: 100%; max-width: 860px;
          display: flex; flex-direction: column; gap: 8px;
        }
        .img-viewer-topbar {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 4px;
        }
        .img-viewer-back {
          display: inline-flex; align-items: center; gap: 8px;
          background: none; border: none; color: rgba(255,255,255,0.75);
          font-family: 'Inter', sans-serif; font-size: 0.72rem; font-weight: 500;
          letter-spacing: 0.06em; text-transform: uppercase; cursor: pointer;
          transition: color 0.2s; padding: 0;
        }
        .img-viewer-back:hover { color: #c9a84c; }
        .img-viewer-counter {
          font-family: 'Inter', sans-serif; font-size: 0.72rem; font-weight: 500;
          letter-spacing: 0.06em; color: rgba(255,255,255,0.45);
        }
        .img-viewer-stage {
          width: 100%; height: 380px; position: relative; overflow: hidden;
          background: #111;
        }
        .img-viewer-img {
          width: 100%; height: 100%;
          object-fit: cover; display: block; user-select: none;
        }
        .img-viewer-arrow {
          position: absolute; top: 50%; transform: translateY(-50%);
          background: rgba(0,0,0,0.45); border: none; color: #fff;
          font-size: 2rem; width: 44px; height: 44px; border-radius: 50%;
          cursor: pointer; display: flex; align-items: center; justify-content: center;
          transition: background 0.2s;
        }
        .img-viewer-arrow:hover { background: rgba(0,0,0,0.72); }
        .img-viewer-arrow--prev { left: 10px; }
        .img-viewer-arrow--next { right: 10px; }
        .img-viewer-thumbs {
          display: flex; gap: 6px; overflow-x: auto;
          scrollbar-width: thin; scrollbar-color: #555 transparent;
          padding-bottom: 2px;
        }
        .img-viewer-thumb {
          flex-shrink: 0; width: 68px; height: 50px; border: 2px solid transparent;
          border-radius: 3px; overflow: hidden; cursor: pointer; padding: 0;
          background: none; opacity: 0.5; transition: opacity 0.2s, border-color 0.2s;
        }
        .img-viewer-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .img-viewer-thumb:hover, .img-viewer-thumb.active { opacity: 1; border-color: #c9a84c; }
        @media (max-width: 600px) {
          .img-viewer-overlay { padding: 70px 0 0; align-items: flex-start; }
          .img-viewer-stage { height: 260px; }
          .img-viewer-thumb { width: 54px; height: 40px; }
        }

        .gallery-item-text {
          font-family: 'Playfair Display', serif;
          font-size: 1.4rem;
          color: var(--croc-cream);
          text-align: center;
          font-weight: 700;
        }

        /* VIDEO GRID */
        .video-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 24px;
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 60px;
        }
        .video-card {
          background: #1a1a2e;
          border-radius: 14px;
          overflow: hidden;
          box-shadow: 0 4px 16px rgba(0,0,0,0.12);
        }
        .video-card video {
          width: 100%; display: block;
          max-height: 280px; object-fit: cover;
        }
        .video-card-label {
          font-family: 'Inter', sans-serif;
          font-size: 0.65rem; font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase;
          color: rgba(255,255,255,0.45); padding: 12px 16px;
        }

        @media (max-width: 900px) {
          .gallery-grid { grid-template-columns: repeat(2, 1fr); padding: 0 30px; }
          .video-grid { grid-template-columns: 1fr 1fr; padding: 0 30px; }
          .gallery-header { padding: 0 30px; }
          .section-tabs { padding: 0 30px; }
          nav { padding: 24px 30px; }
        }

        @media (max-width: 600px) {
          .gallery-grid { grid-template-columns: 1fr; }
          .video-grid { grid-template-columns: 1fr; padding: 0 20px; }
          .gallery-title { font-size: 2rem; }
          .section-tabs { gap: 10px; }
          .section-tab { padding: 10px 16px; font-size: 0.65rem; }
          .gallery-container { padding-top: 100px; }
          .hamburger { display: flex; }
          .nav-links { display: none; }
          .nav-book { display: none; }
          nav { padding: 20px 24px; }
        }
      `}</style>

      {/* NAV */}
      <nav>
        <Link to="/" className="nav-logo">
          <img src="/favicon/logo.jpeg" alt="Crocodile Lodge" className="nav-logo-img" />
          Croc<span>odile</span> Lodge
        </Link>
        <ul className="nav-links">
          <li>
            <a href="/">Villas</a>
          </li>
          <li>
            <Link to="/gallery">Gallery</Link>
          </li>
          <li>
            <a href="/">Contact</a>
          </li>
        </ul>
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
        <Link to="/" onClick={() => setMobileMenuOpen(false)}>
          Home
        </Link>
        <a href="/" onClick={() => setMobileMenuOpen(false)}>
          Villas
        </a>
        <Link to="/gallery" onClick={() => setMobileMenuOpen(false)}>
          Gallery
        </Link>
        <a href="/" onClick={() => setMobileMenuOpen(false)}>
          About
        </a>
        <a href="/" onClick={() => setMobileMenuOpen(false)}>
          Contact
        </a>
        <a
          href="/"
          className="nav-book"
          onClick={() => setMobileMenuOpen(false)}
        >
          Book Direct — Best Rate
        </a>
      </div>

      {/* GALLERY */}
      <section className="gallery-container">
        <div className="gallery-header">
          <div className="gallery-eyebrow">Our Collections</div>
          <h1 className="gallery-title">Photo Gallery</h1>
        </div>

        {/* Section Tabs */}
        <div className="section-tabs">
          {sections.map((section) => (
            <button
              key={section.id}
              className={`section-tab ${activeSection === section.id ? "active" : ""}`}
              onClick={() => setActiveSection(section.id)}
              style={
                activeSection === section.id
                  ? { borderColor: section.color }
                  : {}
              }
            >
              {section.label}
            </button>
          ))}
        </div>

        {/* Gallery Grid / Video Grid */}
        {activeSection === "videos" ? (
          <div className="video-grid">
            {videos.map((video, index) => (
              <div key={index} className="video-card">
                <video controls preload="metadata" playsInline>
                  <source src={video.src} type="video/mp4" />
                </video>
                <div className="video-card-label">{video.label}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="gallery-grid">
            {currentImages.map((image, index) => (
              <div
                key={index}
                className="gallery-item"
                onClick={() => {
                  setViewerIndex(index);
                  setViewerOpen(true);
                }}
              >
                <img
                  src={image.src}
                  alt={image.alt}
                  className="gallery-item-img"
                  loading="lazy"
                  decoding="async"
                />
                <div className="gallery-item-overlay">
                  <div className="gallery-item-text">{image.alt}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Image viewer */}
      {viewerOpen && (
        <div
          className="img-viewer-overlay"
          onClick={() => setViewerOpen(false)}
        >
          <div className="img-viewer" onClick={(e) => e.stopPropagation()}>
            <div className="img-viewer-topbar">
              <button
                className="img-viewer-back"
                onClick={() => setViewerOpen(false)}
              >
                ← Back to gallery
              </button>
              <span className="img-viewer-counter">
                {viewerIndex + 1} / {currentImages.length}
              </span>
            </div>
            <div
              className="img-viewer-stage"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              {viewerIndex > 0 && (
                <button
                  className="img-viewer-arrow img-viewer-arrow--prev"
                  onClick={() => setViewerIndex((i) => i - 1)}
                >
                  &#8249;
                </button>
              )}
              <img
                className="img-viewer-img"
                src={currentImages[viewerIndex]?.src}
                alt={currentImages[viewerIndex]?.alt}
                decoding="async"
              />
              {viewerIndex < currentImages.length - 1 && (
                <button
                  className="img-viewer-arrow img-viewer-arrow--next"
                  onClick={() => setViewerIndex((i) => i + 1)}
                >
                  &#8250;
                </button>
              )}
            </div>
            <div className="img-viewer-thumbs">
              {currentImages.map((img, i) => (
                <button
                  key={i}
                  className={`img-viewer-thumb${i === viewerIndex ? " active" : ""}`}
                  onClick={() => setViewerIndex(i)}
                >
                  <img
                    src={img.src}
                    alt={img.alt}
                    loading="lazy"
                    decoding="async"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Gallery;
