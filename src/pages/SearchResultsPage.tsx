import React, { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { VILLAS } from "../types";
import CurrencySelector from "../components/CurrencySelector";
import { useCurrency } from "../context/CurrencyContext";

function nightsBetween(a: string, b: string) {
  if (!a || !b) return 0;
  return Math.max(
    0,
    Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000),
  );
}

function fmtDate(d: string) {
  if (!d) return "";
  return new Date(d + "T00:00:00").toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

interface VillaStatus {
  villaId: string;
  available: boolean;
  price: number | null;
}

const SearchResultsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();

  const checkin = searchParams.get("checkin") ?? "";
  const checkout = searchParams.get("checkout") ?? "";
  const guests = Number(searchParams.get("guests") ?? 1);
  const nights = nightsBetween(checkin, checkout);

  const [statuses, setStatuses] = useState<Record<string, VillaStatus>>({});
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!checkin || !checkout) {
      setLoading(false);
      return;
    }

    const checkAll = async () => {
      setLoading(true);
      const results: Record<string, VillaStatus> = {};

      await Promise.all(
        VILLAS.map(async (villa) => {
          let available = villa.isAvailable !== false;
          if (available) {
            try {
              const params = new URLSearchParams({
                property: villa.name,
                checkin,
                checkout,
              });
              const res = await fetch(`/api/availability?${params}`);
              if (res.ok) {
                const data = await res.json();
                available = !!data.available;
              }
            } catch {
              /* keep available=true on network error */
            }
          }

          let price: number | null = null;
          try {
            const res = await fetch(
              `/api/seasonal-price?villaId=${encodeURIComponent(villa.id)}&checkin=${checkin}`,
            );
            if (res.ok) {
              const data = await res.json();
              price = data.price ?? null;
            }
          } catch {
            /* fallback to base */
          }

          results[villa.id] = { villaId: villa.id, available, price };
        }),
      );

      setStatuses(results);
      setLoading(false);
    };

    checkAll();
  }, [checkin, checkout]);

  const handleReserve = (villaId: string) => {
    navigate(
      `/reservation?villaId=${villaId}&guestCount=${guests}&checkin=${checkin}&checkout=${checkout}`,
    );
  };

  // Only show villas that are available and not opening soon
  const visibleVillas = VILLAS.filter((villa) => {
    if (villa.openingSoon) return false;
    const s = statuses[villa.id];
    return s?.available ?? true;
  });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
        * { margin:0; padding:0; box-sizing:border-box; }
        body { font-family:'Cormorant Garamond',serif; background:#f5f6fa; color:#1a1a2e; }

        .sr-nav {
          position:fixed; top:0; left:0; right:0; z-index:100;
          padding:22px 60px; display:flex; align-items:center; justify-content:space-between;
          background:rgba(201,168,76,0.95); backdrop-filter:blur(12px); -webkit-backdrop-filter:blur(12px);
          border-bottom:1px solid rgba(255,255,255,0.18);
          box-shadow:0 2px 16px rgba(0,0,0,0.08);
        }
        .sr-nav-logo { font-family:'Playfair Display',serif; font-size:1.2rem; font-weight:700; color:#fff; text-decoration:none; display:flex; align-items:center; gap:10px; }
        .sr-nav-logo span { color:rgba(255,255,255,0.65); }
        .sr-nav-logo-img { height:36px; width:36px; border-radius:50%; object-fit:cover; border:2px solid rgba(255,255,255,0.3); flex-shrink:0; }
        .sr-nav-links { display:flex; gap:36px; list-style:none; }
        .sr-nav-links a { font-family:'Inter',sans-serif; font-size:0.72rem; font-weight:500; letter-spacing:0.06em; text-transform:uppercase; color:#fff; text-decoration:none; opacity:0.75; transition:opacity 0.2s; }
        .sr-nav-links a:hover { opacity:1; }
        .hamburger { display:none; flex-direction:column; gap:5px; background:none; border:none; cursor:pointer; }
        .hamburger span { width:22px; height:2px; background:#fff; display:block; }
        .mobile-menu { display:none; position:fixed; inset:0; background:rgba(26,26,46,0.98); z-index:50; flex-direction:column; align-items:center; justify-content:center; gap:28px; }
        .mobile-menu.open { display:flex; }
        .mobile-menu a { font-family:'Inter',sans-serif; font-size:1rem; font-weight:500; letter-spacing:0.1em; text-transform:uppercase; color:#fff; text-decoration:none; }

        .sr-wrap { max-width:1200px; margin:0 auto; padding:110px 40px 80px; }

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
          .sr-nav { padding:18px 20px; }
          .sr-nav-links { display:none; }
          .hamburger { display:flex; }
          .sr-wrap { padding:90px 20px 60px; }
          .sr-grid { grid-template-columns:1fr; }
        }
      `}</style>

      {/* NAV */}
      <nav className="sr-nav">
        <Link to="/" className="sr-nav-logo">
          <img
            src="/favicon/logo.jpeg"
            alt="Crocodile Lodge"
            className="sr-nav-logo-img"
          />
          Croc<span>odile</span> Lodge
        </Link>
        <ul className="sr-nav-links">
          <li>
            <a href="/#villas">Villas</a>
          </li>
          <li>
            <Link to="/gallery">Gallery</Link>
          </li>
          <li>
            <a href="/#contact">Contact</a>
          </li>
        </ul>
        <CurrencySelector />
        <button
          className="hamburger"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Menu"
        >
          <span />
          <span />
          <span />
        </button>
      </nav>

      <div className={`mobile-menu${mobileMenuOpen ? " open" : ""}`}>
        <a href="/#villas" onClick={() => setMobileMenuOpen(false)}>
          Villas
        </a>
        <Link to="/gallery" onClick={() => setMobileMenuOpen(false)}>
          Gallery
        </Link>
        <a href="/#contact" onClick={() => setMobileMenuOpen(false)}>
          Contact
        </a>
      </div>

      <div className="sr-wrap">
        <div className="sr-header">
          <h1 className="sr-title">Available Villas</h1>
          <div className="sr-subtitle">
            {fmtDate(checkin)} — {fmtDate(checkout)} &nbsp;·&nbsp; {nights}{" "}
            night{nights !== 1 ? "s" : ""} &nbsp;·&nbsp; {guests} guest
            {guests !== 1 ? "s" : ""}
          </div>
        </div>

        {loading ? (
          <div className="sr-loading">Checking availability…</div>
        ) : visibleVillas.length === 0 ? (
          <div className="sr-loading">
            No villas available for the selected dates. Try different dates or{" "}
            <a href="https://wa.me/254715510119" style={{ color: "#c9a84c" }}>
              contact us
            </a>
            .
          </div>
        ) : (
          <div className="sr-grid">
            {visibleVillas.map((villa) => {
              const status = statuses[villa.id];
              const pricePerNight =
                status?.price ?? villa.pricing[0]?.basePrice ?? 0;
              const totalBase = pricePerNight * nights;
              return (
                <div key={villa.id} className="sr-card">
                  <div className="sr-card-img">
                    <img
                      src={villa.image}
                      alt={villa.name}
                      loading="lazy"
                      decoding="async"
                    />
                    <span className="sr-card-badge available">Available</span>
                  </div>
                  <div className="sr-card-body">
                    <div className="sr-card-type">{villa.type}</div>
                    <div className="sr-card-name">{villa.name}</div>
                    <div className="sr-card-meta">
                      {villa.bedrooms && (
                        <span>
                          {villa.bedrooms} Bed{villa.bedrooms > 1 ? "s" : ""}
                        </span>
                      )}
                      <span>Up to {villa.maxGuests} guests</span>
                    </div>
                    <div className="sr-card-amenities">
                      <span className="sr-card-amenity">Pool</span>
                      <span className="sr-card-amenity">AC</span>
                      <span className="sr-card-amenity">Kitchen</span>
                      <span className="sr-card-amenity">WiFi</span>
                      <span className="sr-card-amenity">Laundry</span>
                    </div>
                    <div className="sr-card-price">
                      <div className="sr-card-price-total">{formatPrice(totalBase)}</div>
                      <div className="sr-card-price-sub">{formatPrice(pricePerNight)} / night</div>
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
                        to={`/villa/${villa.id}`}
                        style={{
                          fontFamily: "'Inter',sans-serif",
                          fontSize: "0.65rem",
                          letterSpacing: "0.12em",
                          textTransform: "uppercase",
                          color: villa.color ?? "#0a0a0a",
                          textDecoration: "underline",
                          textUnderlineOffset: 3,
                        }}
                      >
                        View Details
                      </Link>
                      {villa.contactOnly ? (
                        <a
                          href={`https://wa.me/254715510119?text=${encodeURIComponent(`Hi, I'd like to book ${villa.name} from ${checkin} to ${checkout} for ${guests} guest${guests !== 1 ? "s" : ""}.`)}`}
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
                          WhatsApp
                        </a>
                      ) : (
                        <button
                          className="sr-btn-reserve"
                          style={{ width: "auto", padding: "10px 20px" }}
                          onClick={() => handleReserve(villa.id)}
                        >
                          Reserve
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
