import React, { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { SHELTERS } from "../types";
import TopBar from "../components/TopBar";
import Header from "../components/Header";
import { useCurrency } from "../context/CurrencyContext";

function nightsBetween(a: string, b: string) {
  if (!a || !b) return 0;
  return Math.max(
    0,
    Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000),
  );
}

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
  price: number | null;
  cleaningFee?: number;
  monetaryFee?: number;
}

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

          // Map the batch results to shelters
          SHELTERS.forEach((shelter) => {
            const propertyData = data.data.properties.find(
              (p: any) => p.name === shelter.name,
            );

            let available = shelter.isAvailable !== false;
            let price: number | null = null;
            let cleaningFee = 5200;
            let monetaryFee = 5200;

            if (propertyData) {
              available = propertyData.available;

              // Calculate price based on first night (simplified)
              if (propertyData.pricing) {
                const firstNightDate = new Date(checkin);
                const dayOfWeek = firstNightDate.getDay();
                const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

                price = isWeekend
                  ? propertyData.pricing.weekend_price
                  : propertyData.pricing.weekday_price;

                cleaningFee = propertyData.pricing.cleaning_fee || 5200;
                monetaryFee = propertyData.pricing.monetary_fee || 5200;
              }
            }

            results[shelter.id] = {
              shelterId: shelter.id,
              available,
              price,
              cleaningFee,
              monetaryFee,
            };
          });
        }
      } catch (error) {
        console.error("Failed to check availability:", error);
        // Fallback: assume all are available
        SHELTERS.forEach((shelter) => {
          results[shelter.id] = {
            shelterId: shelter.id,
            available: true,
            price: null,
            cleaningFee: 5200,
            monetaryFee: 5200,
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
              const status = statuses[shelter.id];
              const pricePerNight =
                status?.price ?? shelter.pricing[0]?.basePrice ?? 0;
              const totalBase = pricePerNight * nights;
              const cleaningFee = status?.cleaningFee ?? 5200;
              const monetaryFee = status?.monetaryFee ?? 5200;
              const taxPercentage = 5.5;
              const subtotal = totalBase + cleaningFee + monetaryFee;
              const taxAmount =
                Math.round(subtotal * (taxPercentage / 100) * 100) / 100;
              const totalWithFees =
                Math.round((subtotal + taxAmount) * 100) / 100;
              return (
                <div key={shelter.id} className="sr-card">
                  <div className="sr-card-img">
                    <img
                      src={shelter.image}
                      alt={shelter.name}
                      loading="lazy"
                      decoding="async"
                    />
                    <span className="sr-card-badge available">{t("searchResults.available")}</span>
                  </div>
                  <div className="sr-card-body">
                    <div className="sr-card-type">{shelter.type}</div>
                    <div className="sr-card-name">{shelter.name}</div>
                    <div className="sr-card-meta">
                      {shelter.bedrooms && (
                        <span>{t("common.bed", { count: shelter.bedrooms })}</span>
                      )}
                      <span>{t("common.upToGuests", { count: shelter.maxGuests })}</span>
                    </div>
                    <div className="sr-card-amenities">
                      <span className="sr-card-amenity">{t("common.amenityAC")}</span>
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
                        to={`/shelter/${shelter.id}`}
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
                          href={`https://wa.me/33601943348?text=${encodeURIComponent(t("searchResults.waMessage", { shelterName: shelter.name, checkin, checkout, count: guests }))}`}
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
