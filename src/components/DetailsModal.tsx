import React, { useState } from "react";
import type { Villa } from "../types";
import { getVillaPrice, VILLAS } from "../types";
import { useCurrency } from "../context/CurrencyContext";

const WA_NUMBER = "254715510119";

interface DetailsModalProps {
  villa: Villa;
  checkInDate: string;
  checkOutDate: string;
  onClose: () => void;
  onReserve: (
    villaId: string,
    guestCount: number,
    price: number,
    checkIn: string,
    checkOut: string,
  ) => void;
}

function nightsBetween(a: string, b: string) {
  if (!a || !b) return 0;
  const diff = new Date(b).getTime() - new Date(a).getTime();
  return Math.max(0, Math.round(diff / 86400000));
}

const DetailsModal: React.FC<DetailsModalProps> = ({
  villa,
  checkInDate,
  checkOutDate,
  onClose,
  onReserve,
}) => {
  const [guestCount, setGuestCount] = useState<number>(1);
  const [activeGalleryImg, setActiveGalleryImg] = useState<number>(0);
  const price = getVillaPrice(villa.id, guestCount);
  const tier = VILLAS.find((v) => v.id === villa.id)?.pricing[0] ?? null;
  const { formatPrice } = useCurrency();
  const nights = nightsBetween(checkInDate, checkOutDate);

  const handleReserve = () => {
    if (price === null) {
      alert(`Sorry, ${villa.name} is not available for ${guestCount} guests.`);
      return;
    }
    if (!checkInDate || !checkOutDate) {
      alert("Please select check-in and check-out dates first.");
      return;
    }
    onReserve(villa.id, guestCount, price, checkInDate, checkOutDate);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-content--wide" onClick={(e) => e.stopPropagation()}>

        <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>

        {/* Coloured header */}
        <div className="modal-header" style={{ backgroundColor: villa.color }}>
          <h2>{villa.name}</h2>
          <div className="modal-header-meta">
            {villa.bedrooms && <span>🛏 {villa.bedrooms} Bedroom{villa.bedrooms > 1 ? "s" : ""}</span>}
            {villa.bathrooms && <span>🚿 {villa.bathrooms} Bathroom{villa.bathrooms > 1 ? "s" : ""}</span>}
            <span>👥 Up to {villa.maxGuests} guests</span>
          </div>
        </div>

        {/* Gallery */}
        {villa.gallery && villa.gallery.length > 0 && (
          <div className="modal-gallery">
            <div className="modal-gallery-main">
              <img
                src={villa.gallery[activeGalleryImg]}
                alt={`${villa.name} — photo ${activeGalleryImg + 1}`}
              />
              {/* Prev arrow */}
              {activeGalleryImg > 0 && (
                <button
                  className="gallery-arrow gallery-arrow--prev"
                  onClick={() => setActiveGalleryImg((i) => i - 1)}
                  aria-label="Previous image"
                >&#8249;</button>
              )}
              {/* Next arrow */}
              {activeGalleryImg < villa.gallery.length - 1 && (
                <button
                  className="gallery-arrow gallery-arrow--next"
                  onClick={() => setActiveGalleryImg((i) => i + 1)}
                  aria-label="Next image"
                >&#8250;</button>
              )}
              {/* Counter */}
              <div className="gallery-counter">
                {activeGalleryImg + 1} / {villa.gallery.length}
              </div>
            </div>
            <div className="modal-gallery-thumbs">
              {villa.gallery.map((src, i) => (
                <button
                  key={i}
                  className={`modal-gallery-thumb${i === activeGalleryImg ? " active" : ""}`}
                  onClick={() => setActiveGalleryImg(i)}
                >
                  <img src={src} alt={`Thumbnail ${i + 1}`} />
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="modal-body">

          {/* Description */}
          <div className="modal-section">
            <h4>About this property</h4>
            <p style={{ whiteSpace: "pre-line" }}>{villa.description}</p>
          </div>

          {/* Amenities */}
          {villa.amenities && villa.amenities.length > 0 && (
            <div className="modal-section">
              <h4>Amenities</h4>
              <ul className="amenities-list">
                {villa.amenities.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Dates */}
          {(checkInDate || checkOutDate) && (
            <div className="modal-section">
              <h4>Your stay</h4>
              <div className="modal-dates-bar">
                <div className="modal-date-item">
                  <span className="modal-date-label">Check-in</span>
                  <span className="modal-date-value">{checkInDate || "—"}</span>
                </div>
                <div className="modal-dates-arrow">→</div>
                <div className="modal-date-item">
                  <span className="modal-date-label">Check-out</span>
                  <span className="modal-date-value">{checkOutDate || "—"}</span>
                </div>
              </div>
              {nights > 0 && (
                <p style={{ marginTop: 10, fontSize: "0.78rem", fontFamily: "'Josefin Sans', sans-serif", letterSpacing: "0.08em", color: "rgba(255,255,255,0.4)", textTransform: "uppercase" }}>
                  {nights} night{nights !== 1 ? "s" : ""}
                </p>
              )}
            </div>
          )}

          {/* Guest selector (only for bookable villas) */}
          {!villa.contactOnly && (
            <div className="modal-section">
              <h4>Number of guests</h4>
              <div className="guest-selector">
                <button
                  className="guest-step-btn"
                  onClick={() => setGuestCount((g) => Math.max(1, g - 1))}
                  disabled={guestCount <= 1}
                  aria-label="Remove guest"
                >−</button>
                <div className="guest-count-display">
                  {guestCount} <span>{guestCount === 1 ? "guest" : "guests"}</span>
                </div>
                <button
                  className="guest-step-btn"
                  onClick={() => setGuestCount((g) => Math.min(villa.maxGuests, g + 1))}
                  disabled={guestCount >= villa.maxGuests}
                  aria-label="Add guest"
                >+</button>
              </div>
              {tier && guestCount > tier.baseGuests && (
                <p style={{ marginTop: 10, fontSize: "0.78rem", fontFamily: "'Josefin Sans', sans-serif", letterSpacing: "0.06em", color: "rgba(255,255,255,0.5)", textTransform: "uppercase" }}>
                  +{guestCount - tier.baseGuests} extra guest{guestCount - tier.baseGuests > 1 ? "s" : ""} added
                </p>
              )}
            </div>
          )}

          {/* Pricing & CTA */}
          <div className="modal-section price-section">
            {villa.contactOnly ? (
              <>
                <h4>Booking</h4>
                <p style={{ marginBottom: 16, color: "#ffffff", fontSize: "0.88rem", fontFamily: "'Josefin Sans', sans-serif", lineHeight: 1.7, letterSpacing: "0.02em" }}>
                  This property is booked directly with the owners. Contact us on WhatsApp to check availability and arrange your stay.
                </p>
                <a
                  className="btn-reserve-now"
                  href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(`Hi, I'm interested in booking the ${villa.name}. Could you please provide availability and pricing details?`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ backgroundColor: "#25d366", display: "flex", alignItems: "center", gap: 10, justifyContent: "center" }}
                >
                  <svg width="18" height="18" viewBox="0 0 32 32" fill="white" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16 0C7.163 0 0 7.163 0 16c0 2.822.737 5.469 2.027 7.773L0 32l8.473-2.007A15.938 15.938 0 0 0 16 32c8.837 0 16-7.163 16-16S24.837 0 16 0zm0 29.333a13.27 13.27 0 0 1-6.77-1.853l-.485-.29-5.027 1.19 1.213-4.903-.317-.503A13.267 13.267 0 0 1 2.667 16C2.667 8.636 8.636 2.667 16 2.667S29.333 8.636 29.333 16 23.364 29.333 16 29.333zm7.27-9.87c-.397-.2-2.352-1.16-2.717-1.293-.364-.133-.63-.2-.896.2-.265.397-1.03 1.293-1.262 1.56-.232.265-.464.298-.86.1-.397-.2-1.676-.617-3.192-1.97-1.18-1.052-1.977-2.352-2.208-2.748-.232-.397-.025-.612.174-.81.179-.178.397-.464.596-.696.2-.232.265-.397.397-.663.133-.265.067-.497-.033-.696-.1-.2-.896-2.16-1.228-2.958-.323-.775-.65-.67-.896-.683l-.763-.013c-.265 0-.696.1-1.06.497-.364.397-1.393 1.36-1.393 3.317s1.427 3.847 1.626 4.113c.2.265 2.807 4.287 6.803 6.013.95.41 1.692.655 2.27.838.953.303 1.82.26 2.506.158.764-.114 2.352-.962 2.683-1.89.33-.928.33-1.724.232-1.89-.1-.165-.364-.265-.762-.464z" />
                  </svg>
                  Contact Us on WhatsApp
                </a>
              </>
            ) : price !== null ? (
              <>
                <h4>Price per night</h4>
                <div className="price-display">{formatPrice(price)}</div>
                {nights > 0 && (
                  <div className="price-per-night-label">
                    {formatPrice(price * nights)} total for {nights} night{nights !== 1 ? "s" : ""}
                  </div>
                )}
                {tier && (
                  <div className="price-breakdown">
                    <span>Base rate (up to {tier.baseGuests} guests): {formatPrice(tier.basePrice)}</span>
                    {tier.extraPersonFee > 0 && (
                      <span>Extra guest: +{formatPrice(tier.extraPersonFee)} / person / night</span>
                    )}
                    {tier.extraPersonFee === 0 && (
                      <span>Max {villa.maxGuests} guest{villa.maxGuests > 1 ? "s" : ""} — no extra charges</span>
                    )}
                  </div>
                )}
                <button className="btn-reserve-now" onClick={handleReserve}>
                  Reserve Now
                </button>
              </>
            ) : (
              <div className="unavailable-message">
                This accommodation is currently unavailable for the selected dates.
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default DetailsModal;
