import React, { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { SHELTERS, SHELTER_DISPLAY_NAMES, getPropertyNameForShelter } from "../types";
import TopBar from "../components/TopBar";
import Header from "../components/Header";
import { useCurrency } from "../context/CurrencyContext";
import { calculateDetailedPrice, nightsBetween, type PropertyPricing } from "../utils/pricing";

function fmtDate(d: string, locale: string) {
  if (!d) return "";
  return new Date(d + "T00:00:00").toLocaleDateString(
    locale === "fr" ? "fr-FR" : "en-GB",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    },
  );
}

interface ShelterStatus {
  shelterId: string;
  available: boolean;
  pricing: PropertyPricing | null;
}

// Fallbacks when the live pricing API is unreachable.
const FALLBACK_CLEANING_FEE = 40;
const FALLBACK_LINEN_FEE = 12;
const FALLBACK_CLEANING_FEE_BY_SHELTER: Record<string, number> = {
  "shelter-a": 80,
  "shelter-b": 80,
  "la-maison-modern": 40,
  "refuge-de-la-martre": 40,
};

const SearchResultsPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();

  const checkin = searchParams.get("checkin") ?? "";
  const checkout = searchParams.get("checkout") ?? "";
  const guests = Number(searchParams.get("guests") ?? 1);
  const nights = nightsBetween(checkin, checkout);

  const [statuses, setStatuses] = useState<Record<string, ShelterStatus>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!checkin || !checkout) {
      setLoading(false);
      return;
    }

    const checkAll = async () => {
      setLoading(true);
      const results: Record<string, ShelterStatus> = {};

      try {
        // Use the new batch endpoint for better performance
        const params = new URLSearchParams({
          checkin,
          checkout,
        });
        const res = await fetch(`/api/availability/batch?${params}`);

        if (res.ok) {
          const data = await res.json();

          // Map the batch results to shelters. The backend's properties.name
          // is the plain DB name ("Shelter A"), not shelter.name (the long
          // display string with location baked in, e.g. "Shelter A -
          // Griesheim-près-Molsheim, France") — those never matched, so
          // propertyData was always undefined and every card silently fell
          // back to the static base price instead of live pricing.
          SHELTERS.forEach((shelter) => {
            const propertyName = getPropertyNameForShelter(shelter.id);
            const propertyData = data.data.properties.find(
              (p: any) => p.name === propertyName,
            );

            let available = shelter.isAvailable !== false;
            let pricing: PropertyPricing | null = null;

            if (propertyData) {
              available = propertyData.available;
              if (propertyData.pricing) {
                pricing = {
                  weekday_price: propertyData.pricing.weekday_price,
                  weekend_price: propertyData.pricing.weekend_price,
                  extra_person_fee: propertyData.pricing.extra_person_fee || 0,
                  cleaning_fee:
                    propertyData.pricing.cleaning_fee ||
                    FALLBACK_CLEANING_FEE_BY_SHELTER[shelter.id] ||
                    FALLBACK_CLEANING_FEE,
                  linen_fee: propertyData.pricing.linen_fee ?? FALLBACK_LINEN_FEE,
                };
              }
            }

            // No live pricing at all (property has no pricing row yet, or
            // the property/API lookup failed) — fall back to a flat rate
            // from the static tiers in types.ts so the card still shows a
            // usable estimate instead of nothing.
            if (!pricing) {
              const tier = shelter.pricing[0];
              const flatRate = tier?.basePrice ?? 0;
              pricing = {
                weekday_price: flatRate,
                weekend_price: flatRate,
                extra_person_fee: tier?.extraPersonFee ?? 0,
                cleaning_fee: FALLBACK_CLEANING_FEE_BY_SHELTER[shelter.id] ?? FALLBACK_CLEANING_FEE,
                linen_fee: FALLBACK_LINEN_FEE,
              };
            }

            results[shelter.id] = { shelterId: shelter.id, available, pricing };
          });
        }
      } catch (error) {
        console.error("Failed to check availability:", error);
        // Fallback: assume all are available, price from the static tiers
        SHELTERS.forEach((shelter) => {
          const tier = shelter.pricing[0];
          const flatRate = tier?.basePrice ?? 0;
          results[shelter.id] = {
            shelterId: shelter.id,
            available: true,
            pricing: {
              weekday_price: flatRate,
              weekend_price: flatRate,
              extra_person_fee: tier?.extraPersonFee ?? 0,
              cleaning_fee: FALLBACK_CLEANING_FEE_BY_SHELTER[shelter.id] ?? FALLBACK_CLEANING_FEE,
              linen_fee: FALLBACK_LINEN_FEE,
            },
          };
        });
      }

      setStatuses(results);
      setLoading(false);
    };

    checkAll();
  }, [checkin, checkout]);

  const handleReserve = (shelterId: string) => {
    navigate(
      `/reservation?shelterId=${shelterId}&guestCount=${guests}&checkin=${checkin}&checkout=${checkout}`,
    );
  };

  // Only show shelters that are available and not opening soon
  const visibleShelters = SHELTERS.filter((shelter) => {
    if (shelter.openingSoon) return false;
    const s = statuses[shelter.id];
    return s?.available ?? true;
  });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
        * { margin:0; padding:0; box-sizing:border-box; }
        body { font-family:'Cormorant Garamond',serif; background:#dbdbdb; color:#1a1a2e; }

        .sr-wrap { max-width:1200px; margin:0 auto; padding:160px 40px 80px; }

        .sr-header { margin-bottom:40px; }
        .sr-title { font-family:'Playfair Display',serif; font-size:clamp(1.6rem,4vw,2.4rem); font-weight:700; margin-bottom:8px; color:#1a1a2e; }
        .sr-subtitle { font-family:'Inter',sans-serif; font-size:0.72rem; font-weight:500; letter-spacing:0.05em; text-transform:uppercase; color:rgba(26,26,46,0.4); }

        .sr-grid { display:grid; grid-template-columns:repeat(auto-fill, minmax(340px,1fr)); gap:28px; }

        .sr-card { background:#fff; border:1px solid #eef0f4; border-radius:16px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.05); transition:box-shadow 0.22s, transform 0.22s; }
        .sr-card:hover { box-shadow:0 12px 36px rgba(0,0,0,0.1); transform:translateY(-3px); }

        .sr-card-img { position:relative; width:100%; height:220px; overflow:hidden; }
        .sr-card-img img { width:100%; height:100%; object-fit:cover; display:block; transition:transform 0.4s; }
        .sr-card:hover .sr-card-img img { transform:scale(1.03); }
        .sr-card-badge { position:absolute; top:14px; right:14px; font-family:'Inter',sans-serif; font-size:0.65rem; font-weight:600; letter-spacing:0.04em; text-transform:uppercase; padding:5px 12px; border-radius:20px; }
        .sr-card-badge.available { background:#d1fae5; color:#065f46; }

        .sr-card-body { padding:22px 24px 24px; }
        .sr-card-type { font-family:'Inter',sans-serif; font-size:0.65rem; font-weight:600; letter-spacing:0.1em; text-transform:uppercase; color:#c9a84c; margin-bottom:6px; }
        .sr-card-name { font-family:'Playfair Display',serif; font-size:1.3rem; font-weight:700; margin-bottom:10px; color:#1a1a2e; }
        .sr-card-meta { display:flex; gap:14px; font-family:'Inter',sans-serif; font-size:0.72rem; font-weight:500; color:#9098a9; margin-bottom:16px; }
        .sr-card-amenities { display:flex; flex-wrap:wrap; gap:6px; margin-bottom:20px; }
        .sr-card-amenity { background:#f5f6fa; border:1px solid #eef0f4; border-radius:20px; padding:4px 12px; font-family:'Inter',sans-serif; font-size:0.68rem; font-weight:500; color:#6b7280; }
        .sr-card-price { margin-bottom:18px; }
        .sr-card-price-total { font-family:'Playfair Display',serif; font-size:1.6rem; font-weight:700; color:#1a1a2e; }
        .sr-card-price-sub { font-family:'Inter',sans-serif; font-size:0.65rem; font-weight:500; color:#9098a9; margin-top:3px; }

        .sr-btn-reserve { width:100%; padding:13px; background:#1a1a2e; color:#fff; border:none; border-radius:10px; font-family:'Inter',sans-serif; font-size:0.78rem; font-weight:600; letter-spacing:0.04em; cursor:pointer; transition:background 0.18s, transform 0.12s; }
        .sr-btn-reserve:hover { background:#c9a84c; transform:translateY(-1px); }

        .sr-loading { text-align:center; padding:80px 0; font-family:'Inter',sans-serif; font-size:0.78rem; font-weight:500; color:#9098a9; }

        @media(max-width:768px) {
          .sr-wrap { padding:140px 20px 60px; }
          .sr-grid { grid-template-columns:1fr; }
        }
      `}</style>

      <TopBar />
      <Header />

      <div className="sr-wrap">
        <div className="sr-header">
          <h1 className="sr-title">{t("searchResults.title")}</h1>
          <div className="sr-subtitle">
            {fmtDate(checkin, i18n.language)} — {fmtDate(checkout, i18n.language)} &nbsp;·&nbsp;{" "}
            {t("common.night", { count: nights })} &nbsp;·&nbsp;{" "}
            {t("common.guest", { count: guests })}
          </div>
        </div>

        {loading ? (
          <div className="sr-loading">{t("searchResults.checkingAvailability")}</div>
        ) : visibleShelters.length === 0 ? (
          <div className="sr-loading">
            {t("searchResults.noSheltersPrefix")}{" "}
            <a href="https://wa.me/33601943348" style={{ color: "#c9a84c" }}>
              {t("common.contactUs")}
            </a>
            .
          </div>
        ) : (
          <div className="sr-grid">
            {visibleShelters.map((shelter) => {
              const displayName = SHELTER_DISPLAY_NAMES[shelter.id] ?? shelter.name;
              const status = statuses[shelter.id];
              const pricePerNight = status?.pricing?.weekday_price ?? 0;
              const breakdown = calculateDetailedPrice(
                status?.pricing ?? null,
                checkin,
                checkout,
                guests,
                shelter.pricing[0]?.baseGuests,
              );
              const totalWithFees = breakdown?.totalPrice ?? 0;
              return (
                <div key={shelter.id} className="sr-card">
                  <div className="sr-card-img">
                    <img
                      src={shelter.image}
                      alt={displayName}
                      loading="lazy"
                      decoding="async"
                    />
                    <span className="sr-card-badge available">{t("searchResults.available")}</span>
                  </div>
                  <div className="sr-card-body">
                    <div className="sr-card-type">{shelter.type}</div>
                    <div className="sr-card-name">{displayName}</div>
                    <div className="sr-card-meta">
                      {shelter.bedrooms && (
                        <span>{t("common.bed", { count: shelter.bedrooms })}</span>
                      )}
                      <span>{t("common.upToGuests", { count: shelter.maxGuests })}</span>
                    </div>
                    <div className="sr-card-amenities">
                      {shelter.id !== "la-maison-modern" && (
                        <span className="sr-card-amenity">{t("common.amenityAC")}</span>
                      )}
                      <span className="sr-card-amenity">{t("common.amenityKitchen")}</span>
                      <span className="sr-card-amenity">{t("common.amenityWifi")}</span>
                      <span className="sr-card-amenity">{t("common.amenityLaundry")}</span>
                    </div>
                    <div className="sr-card-price">
                      <div className="sr-card-price-total">
                        {formatPrice(totalWithFees)}
                      </div>
                      <div className="sr-card-price-sub">
                        {formatPrice(pricePerNight)} {t("searchResults.perNight")}
                      </div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginTop: 4,
                      }}
                    >
                      <Link
                        to={`/shelter/${shelter.id}?checkin=${checkin}&checkout=${checkout}&guestCount=${guests}`}
                        style={{
                          display: "inline-block",
                          fontFamily: "'Inter',sans-serif",
                          fontSize: "0.65rem",
                          letterSpacing: "0.12em",
                          textTransform: "uppercase",
                          color: "#fff",
                          background: "#6b7280",
                          border: "1.5px solid #6b7280",
                          borderRadius: 6,
                          padding: "7px 16px",
                          textDecoration: "none",
                          fontWeight: 700,
                          transition: "opacity 0.2s",
                        }}
                      >
                        {t("common.viewDetails")}
                      </Link>
                      {shelter.contactOnly ? (
                        <a
                          href={`https://wa.me/33601943348?text=${encodeURIComponent(t("searchResults.waMessage", { shelterName: displayName, checkin, checkout, count: guests }))}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                            padding: "10px 16px",
                            background: "#25d366",
                            color: "#fff",
                            borderRadius: 6,
                            fontFamily: "'Inter',sans-serif",
                            fontSize: "0.65rem",
                            letterSpacing: "0.12em",
                            textTransform: "uppercase",
                            textDecoration: "none",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {t("common.whatsapp")}
                        </a>
                      ) : (
                        <button
                          className="sr-btn-reserve"
                          style={{ width: "auto", padding: "10px 20px" }}
                          onClick={() => handleReserve(shelter.id)}
                        >
                          {t("common.reserve")}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};

export default SearchResultsPage;
