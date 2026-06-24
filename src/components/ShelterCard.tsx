import React, { useState } from "react";
import type { Shelter } from "../types";

interface ShelterCardProps {
  shelter: Shelter;
  onSelectShelter: (shelter: Shelter) => void;
}

const BedIcon = () => (
  <svg
    width="15"
    height="15"
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
);

const GuestIcon = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="9" cy="7" r="4" />
    <path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    <path d="M21 21v-2a4 4 0 0 0-3-3.85" />
  </svg>
);

const BathIcon = () => (
  <svg
    width="15"
    height="15"
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
);

const ShelterCard: React.FC<ShelterCardProps> = ({
  shelter,
  onSelectShelter,
}) => {
  const images =
    shelter.gallery && shelter.gallery.length > 0
      ? shelter.gallery
      : [shelter.image];
  const [imgIndex, setImgIndex] = useState(0);

  const prev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setImgIndex((i) => (i - 1 + images.length) % images.length);
  };
  const next = (e: React.MouseEvent) => {
    e.stopPropagation();
    setImgIndex((i) => (i + 1) % images.length);
  };

  return (
    <div
      className="shelter-card reveal"
      onClick={() => onSelectShelter(shelter)}
      style={{ cursor: "pointer" }}
    >
      <div className="shelter-card-image" style={{ position: "relative" }}>
        <img
          src={images[imgIndex]}
          alt={shelter.name}
          loading="lazy"
          decoding="async"
        />
        {images.length > 1 && (
          <>
            <button className="card-img-nav card-img-prev" onClick={prev}>
              ‹
            </button>
            <button className="card-img-nav card-img-next" onClick={next}>
              ›
            </button>
            <div className="card-img-dots">
              {images.map((_, i) => (
                <span
                  key={i}
                  className={`card-img-dot${i === imgIndex ? " active" : ""}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setImgIndex(i);
                  }}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <div className="shelter-card-header">
        <h3>{shelter.name}</h3>
        <div className="shelter-amenity-chips">
          <span className="shelter-amenity-chip">AC</span>
          <span className="shelter-amenity-chip">Kitchen</span>
          <span className="shelter-amenity-chip">WiFi</span>
          <span className="shelter-amenity-chip">Laundry</span>
        </div>
      </div>

      <div className="shelter-card-content">
        {/* Icon chips row */}
        <div className="shelter-meta-chips">
          {shelter.bedrooms && (
            <span className="shelter-chip">
              <BedIcon />
              {shelter.bedrooms} Bedroom{shelter.bedrooms > 1 ? "s" : ""}
            </span>
          )}
          {shelter.beds && (
            <span className="shelter-chip">
              <BedIcon />
              {shelter.beds} Bed{shelter.beds > 1 ? "s" : ""}
            </span>
          )}
          {shelter.bathrooms && (
            <span className="shelter-chip">
              <BathIcon />
              {shelter.bathrooms} Bath
            </span>
          )}
          <span className="shelter-chip">
            <GuestIcon />
            Max {shelter.maxGuests}
          </span>
        </div>

        <div className="shelter-card-buttons">
          {shelter.openingSoon ? (
            <span
              style={{
                fontFamily: "'Josefin Sans', sans-serif",
                fontSize: "0.72rem",
                fontWeight: 600,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "#7c3aed",
                background: "rgba(124,58,237,0.08)",
                padding: "4px 10px",
                borderRadius: 4,
              }}
            >
              Opening Soon
            </span>
          ) : (
            <button
              onClick={() => shelter.isAvailable && onSelectShelter(shelter)}
              disabled={!shelter.isAvailable}
              style={{
                background: shelter.isAvailable ? "#6b7280" : "transparent",
                color: shelter.isAvailable ? "#fff" : "#6b7280",
                fontFamily: "'Josefin Sans', sans-serif",
                fontSize: "0.78rem",
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                border: "1.5px solid #6b7280",
                borderRadius: 6,
                padding: "7px 18px",
                cursor: shelter.isAvailable ? "pointer" : "default",
                opacity: shelter.isAvailable ? 1 : 0.4,
                transition: "background 0.2s, color 0.2s",
              }}
            >
              View Details
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShelterCard;
