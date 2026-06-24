import React, { useCallback, useEffect, useState, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { SHELTERS } from "../types";
import type { AdminReservation } from "../types";
import { useCurrency, SUPPORTED_CURRENCIES } from "../context/CurrencyContext";
import PricingCalendarTab from "../components/PricingCalendarTab";

// Lazy load AvailabilityTab to avoid import issues
const AvailabilityTab = React.lazy(() =>
  import("../components/AvailabilityTab").then((m) => ({
    default: m.AvailabilityTab,
  })),
);

const RevenueTab = React.lazy(() =>
  import("../components/RevenueTab").then((m) => ({
    default: m.RevenueTab,
  })),
);

type Tab =
  | "reservations"
  | "revenue"
  | "pricing-calendar"
  | "availability-blocking"
  | "currencies"
  | "users";
type ResFilter = "all" | "pending" | "confirmed" | "cancelled";

const getReservationStatus = (
  r: AdminReservation,
): "pending" | "confirmed" | "cancelled" =>
  r.cancelled ? "cancelled" : r.confirmed ? "confirmed" : "pending";

const NAV_ITEMS: { id: Tab; label: string }[] = [
  { id: "reservations", label: "Reservations" },
  { id: "revenue", label: "Revenue" },
  { id: "pricing-calendar", label: "Pricing Calendar" },
  { id: "availability-blocking", label: "Availability & Blocking" },
  { id: "currencies", label: "Currencies" },
  { id: "users", label: "Users" },
];

const TAB_META: Record<Tab, { title: string; subtitle: string }> = {
  reservations: {
    title: "Reservations",
    subtitle: "Review, confirm, and manage incoming booking requests",
  },
  revenue: {
    title: "Revenue",
    subtitle: "Track monthly and yearly earnings across all properties",
  },
  "pricing-calendar": {
    title: "Pricing Calendar",
    subtitle: "Set base rates and date-specific price overrides",
  },
  "availability-blocking": {
    title: "Availability & Blocking",
    subtitle: "Manage manual blocks and sync external calendars",
  },
  currencies: {
    title: "Currencies",
    subtitle: "Configure the display currency and view exchange rates",
  },
  users: {
    title: "Users",
    subtitle: "Manage admin accounts with dashboard access",
  },
};

const NavIcon: React.FC<{ tab: Tab }> = ({ tab }) => {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    width: 18,
    height: 18,
  };
  switch (tab) {
    case "reservations":
      return (
        <svg {...common}>
          <path d="M9 4h6a1 1 0 0 1 1 1v15a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z" />
          <path d="M9.5 3h5v2h-5z" />
          <path d="M9 10h6M9 13.5h6M9 17h3.5" />
        </svg>
      );
    case "revenue":
      return (
        <svg {...common}>
          <path d="M4 20V11M10 20V5M16 20v-6" />
          <path d="M2.5 20.5h19" />
        </svg>
      );
    case "pricing-calendar":
      return (
        <svg {...common}>
          <rect x="3.5" y="5" width="17" height="15.5" rx="2" />
          <path d="M3.5 9.5h17M8 3v4M16 3v4" />
        </svg>
      );
    case "availability-blocking":
      return (
        <svg {...common}>
          <rect x="5" y="11" width="14" height="9" rx="2" />
          <path d="M8 11V7.5a4 4 0 0 1 8 0V11" />
        </svg>
      );
    case "currencies":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8.5" />
          <path d="M9.3 15.2c.5 1 1.5 1.6 2.7 1.6 1.8 0 3.1-1 3.1-2.4 0-3-6-1.3-6-4.3 0-1.4 1.4-2.4 3.1-2.4 1.2 0 2.2.6 2.7 1.6M12 7v10" />
        </svg>
      );
    case "users":
      return (
        <svg {...common}>
          <circle cx="9" cy="8" r="3" />
          <path d="M2.7 19.5c0-3 2.8-5 6.3-5s6.3 2 6.3 5" />
          <circle cx="17.2" cy="9.3" r="2.3" />
          <path d="M21.3 19.5c0-2.2-1.7-4-4.1-4.6" />
        </svg>
      );
  }
};

const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { currency, setCurrency, rates } = useCurrency();
  const secret = sessionStorage.getItem("adminSecret") ?? "";
  const adminUser = sessionStorage.getItem("adminUser") ?? "Admin";

  useEffect(() => {
    if (!secret) navigate("/admin", { replace: true });
  }, [secret, navigate]);

  const handleLogout = () => {
    sessionStorage.removeItem("adminSecret");
    sessionStorage.removeItem("adminUser");
    navigate("/admin", { replace: true });
  };

  const api = useCallback(
    (path: string, options: RequestInit = {}) =>
      fetch(`/api/admin${path}`, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          "x-admin-secret": secret,
          ...(options.headers as Record<string, string>),
        },
      }),
    [secret],
  );

  // ── Tab ──────────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<Tab>("reservations");

  // ── Notifications ─────────────────────────────────────────────────────────
  const [lastSeenAt, setLastSeenAt] = useState<string>(
    () => localStorage.getItem("adminLastSeenAt") ?? new Date(0).toISOString(),
  );

  const markReservationsSeen = () => {
    const now = new Date().toISOString();
    localStorage.setItem("adminLastSeenAt", now);
    setLastSeenAt(now);
  };

  // ── Reservations ─────────────────────────────────────────────────────────
  const [reservations, setReservations] = useState<AdminReservation[]>([]);
  const [resLoading, setResLoading] = useState(false);
  const [resFilter, setResFilter] = useState<ResFilter>("all");
  const [resPropFilter, setResPropFilter] = useState("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchReservations = useCallback(
    async (markSeen = false) => {
      setResLoading(true);
      try {
        const res = await api("/reservations");
        if (res.ok) {
          setReservations(await res.json());
          if (markSeen) markReservationsSeen();
        }
      } finally {
        setResLoading(false);
      }
    },
    [api],
  );

  const updateReservation = async (
    id: string,
    changes: Partial<
      Pick<AdminReservation, "confirmed" | "cancelled" | "payment_status">
    >,
  ) => {
    setActionLoading(id);
    try {
      const res = await api("/reservations", {
        method: "PUT",
        body: JSON.stringify({ id, ...changes }),
      });
      if (res.ok) {
        setReservations((prev) =>
          prev.map((r) => (r.id === id ? { ...r, ...changes } : r)),
        );
      }
    } finally {
      setActionLoading(null);
    }
  };

  const deleteReservation = async (id: string) => {
    if (!window.confirm("Delete this reservation?")) return;
    setActionLoading(id);
    try {
      const res = await api(`/reservations?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setReservations((prev) => prev.filter((r) => r.id !== id));
      }
    } finally {
      setActionLoading(null);
    }
  };

  // ── Users ────────────────────────────────────────────────────────────────
  const [users, setUsers] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userForm, setUserForm] = useState({ username: "", password: "" });
  const [userError, setUserError] = useState("");
  const [userSuccess, setUserSuccess] = useState("");

  const fetchUsers = useCallback(async () => {
    setUsersLoading(true);
    try {
      const res = await api("/users");
      if (res.ok) setUsers(await res.json());
    } finally {
      setUsersLoading(false);
    }
  }, [api]);

  const createUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserError("");
    setUserSuccess("");

    if (!userForm.username.trim() || !userForm.password.trim()) {
      setUserError("Username and password required");
      return;
    }

    try {
      const res = await api("/users", {
        method: "POST",
        body: JSON.stringify(userForm),
      });

      if (!res.ok) {
        const data = await res.json();
        setUserError(data.error ?? "Creation failed");
        return;
      }

      setUserSuccess("User created successfully");
      setUserForm({ username: "", password: "" });
      await fetchUsers();

      setTimeout(() => setUserSuccess(""), 3000);
    } catch {
      setUserError("Failed to create user");
    }
  };

  const deleteUser = async (username: string) => {
    if (!window.confirm(`Delete user "${username}"?`)) return;

    try {
      const res = await api(`/users?username=${username}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        setUserError("Deletion failed");
        return;
      }

      setUsers((prev) => prev.filter((u) => u.username !== username));
      setUserSuccess("User deleted");
      setTimeout(() => setUserSuccess(""), 3000);
    } catch {
      setUserError("Failed to delete user");
    }
  };

  // ── Setup on tab change ──────────────────────────────────────────────────
  useEffect(() => {
    if (activeTab === "reservations") fetchReservations(true);
    if (activeTab === "users") fetchUsers();
  }, [activeTab, fetchReservations, fetchUsers]);

  // ── Calculate notification count ─────────────────────────────────────────
  const newCount = reservations.filter((r) => {
    if (getReservationStatus(r) !== "pending") return false;
    return new Date(r.created_at) > new Date(lastSeenAt);
  }).length;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@700&display=swap');

        .adm-shell { display: flex; min-height: 100vh; background: #f3f4f7; font-family: 'Inter', sans-serif; }

        /* ── Sidebar ─────────────────────────────────────────────────────── */
        .adm-sidebar { width: 264px; flex-shrink: 0; background: #16162a; color: #e7e8f0; display: flex; flex-direction: column; position: sticky; top: 0; height: 100vh; }
        .adm-brand { padding: 28px 24px 22px; display: flex; align-items: center; gap: 10px; }
        .adm-brand-dot { width: 9px; height: 9px; border-radius: 50%; background: #c9a84c; flex-shrink: 0; }
        .adm-brand-name { font-family: 'Playfair Display', serif; font-size: 1.15rem; color: #fff; letter-spacing: 0.01em; }
        .adm-brand-name span { color: #c9a84c; }
        .adm-brand-sub { font-size: 0.66rem; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: #6e7186; padding: 0 24px 22px; }

        .adm-nav { flex: 1; padding: 4px 12px; display: flex; flex-direction: column; gap: 2px; overflow-y: auto; }
        .adm-nav-item { display: flex; align-items: center; gap: 12px; padding: 11px 14px; border-radius: 10px; border: none; background: transparent; color: #aaadc2; font-size: 0.86rem; font-weight: 500; cursor: pointer; text-align: left; width: 100%; transition: background 0.15s, color 0.15s; position: relative; }
        .adm-nav-item:hover { background: rgba(255,255,255,0.06); color: #fff; }
        .adm-nav-item.active { background: rgba(201,168,76,0.14); color: #e9c873; }
        .adm-nav-item.active::before { content: ''; position: absolute; left: -12px; top: 8px; bottom: 8px; width: 3px; border-radius: 2px; background: #c9a84c; }
        .adm-nav-icon { display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .adm-nav-label { flex: 1; }
        .adm-nav-badge { background: #ef4444; color: #fff; padding: 1px 7px; border-radius: 10px; font-size: 0.68rem; font-weight: 700; }

        .adm-sidebar-footer { padding: 16px; border-top: 1px solid rgba(255,255,255,0.08); }
        .adm-user-card { display: flex; align-items: center; gap: 10px; padding: 8px 10px; border-radius: 10px; margin-bottom: 8px; }
        .adm-user-avatar { width: 34px; height: 34px; border-radius: 50%; background: #c9a84c; color: #16162a; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.85rem; flex-shrink: 0; }
        .adm-user-info { flex: 1; min-width: 0; }
        .adm-user-name { font-size: 0.85rem; font-weight: 600; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .adm-user-role { font-size: 0.7rem; color: #6e7186; }
        .adm-logout-btn { width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px; padding: 9px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.1); background: transparent; color: #aaadc2; font-size: 0.82rem; font-weight: 600; cursor: pointer; transition: background 0.15s, color 0.15s, border-color 0.15s; }
        .adm-logout-btn:hover { background: rgba(239,68,68,0.12); color: #fca5a5; border-color: rgba(239,68,68,0.3); }

        /* ── Main ────────────────────────────────────────────────────────── */
        .adm-main { flex: 1; min-width: 0; display: flex; flex-direction: column; }
        .adm-topbar { background: #fff; border-bottom: 1px solid #e9eaef; padding: 22px 36px; }
        .adm-topbar-title { font-size: 1.3rem; font-weight: 700; color: #16162a; margin-bottom: 4px; }
        .adm-topbar-subtitle { font-size: 0.85rem; color: #8b8e9f; }
        .adm-content { flex: 1; padding: 28px 36px 48px; }
        .adm-body { background: white; border: 1px solid #eef0f4; border-radius: 14px; padding: 26px; box-shadow: 0 1px 3px rgba(16,16,40,0.04); }

        .adm-form-row { display: flex; gap: 16px; margin-bottom: 16px; flex-wrap: wrap; }
        .adm-form-field { flex: 1; min-width: 200px; }
        .adm-form-field label { display: block; margin-bottom: 7px; font-weight: 600; color: #6b7280; font-size: 0.72rem; letter-spacing: 0.04em; text-transform: uppercase; }
        .adm-form-field input, .adm-form-field select, .adm-form-field textarea { width: 100%; padding: 10px 13px; border: 1.5px solid #e5e7eb; border-radius: 9px; font-family: inherit; font-size: 0.9rem; background: #f9fafb; color: #16162a; transition: border-color 0.15s, background 0.15s; }
        .adm-form-field input:focus, .adm-form-field select:focus, .adm-form-field textarea:focus { outline: none; border-color: #c9a84c; background: #fff; box-shadow: 0 0 0 3px rgba(201, 168, 76, 0.12); }

        .adm-btn { padding: 10px 20px; background: #16162a; color: white; border: none; border-radius: 9px; cursor: pointer; font-weight: 600; font-size: 0.85rem; transition: all 0.15s; }
        .adm-btn:hover { background: #2d2d4e; }
        .adm-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .adm-btn.danger { background: #fff; color: #dc2626; border: 1.5px solid #fecaca; }
        .adm-btn.danger:hover { background: #fef2f2; }

        .adm-table { width: 100%; border-collapse: collapse; margin-top: 16px; }
        .adm-table th { background: #f8f9fb; padding: 12px 14px; text-align: left; font-weight: 600; color: #6b7280; font-size: 0.72rem; letter-spacing: 0.04em; text-transform: uppercase; border-bottom: 1.5px solid #eef0f4; }
        .adm-table td { padding: 13px 14px; border-bottom: 1px solid #f1f2f6; font-size: 0.88rem; color: #1f2030; }
        .adm-table tr:hover td { background: #fafbfd; }

        .adm-badge-status { display: inline-block; padding: 4px 12px; border-radius: 16px; font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.03em; }
        .adm-badge-status.pending { background: #fef3c7; color: #92400e; }
        .adm-badge-status.confirmed { background: #d1fae5; color: #065f46; }
        .adm-badge-status.cancelled { background: #fee2e2; color: #7f1d1d; }

        .adm-section-title { font-size: 1.05rem; font-weight: 700; color: #16162a; margin-bottom: 16px; }
        .adm-form-msg { padding: 12px 16px; border-radius: 9px; margin-bottom: 16px; font-size: 0.85rem; }
        .adm-form-msg.error { background: #fee2e2; color: #7f1d1d; border: 1px solid #fecaca; }
        .adm-form-msg.success { background: #d1fae5; color: #065f46; border: 1px solid #a7f3d0; }
        .adm-loading { text-align: center; padding: 40px; color: #8b8e9f; font-size: 0.9rem; }
        .adm-actions { display: flex; gap: 8px; flex-wrap: wrap; }
        .adm-actions button { padding: 7px 14px; font-size: 0.78rem; }
      `}</style>

      <div className="adm-shell">
        {/* Sidebar */}
        <aside className="adm-sidebar">
          <div className="adm-brand">
            <div className="adm-brand-dot" />
            <div className="adm-brand-name">
              Alsace<span> Hideaways</span>
            </div>
          </div>
          <div className="adm-brand-sub">Admin Console</div>

          <nav className="adm-nav">
            {NAV_ITEMS.map(({ id, label }) => (
              <button
                key={id}
                className={`adm-nav-item${activeTab === id ? " active" : ""}`}
                onClick={() => {
                  setActiveTab(id);
                  if (id === "reservations") markReservationsSeen();
                }}
              >
                <span className="adm-nav-icon">
                  <NavIcon tab={id} />
                </span>
                <span className="adm-nav-label">{label}</span>
                {id === "reservations" && newCount > 0 && (
                  <span className="adm-nav-badge">{newCount}</span>
                )}
              </button>
            ))}
          </nav>

          <div className="adm-sidebar-footer">
            <div className="adm-user-card">
              <div className="adm-user-avatar">
                {adminUser.charAt(0).toUpperCase()}
              </div>
              <div className="adm-user-info">
                <div className="adm-user-name">{adminUser}</div>
                <div className="adm-user-role">Administrator</div>
              </div>
            </div>
            <button className="adm-logout-btn" onClick={handleLogout}>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
                width={15}
                height={15}
              >
                <path d="M9 21H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3" />
                <path d="M16 17l5-5-5-5M21 12H9" />
              </svg>
              Log Out
            </button>
          </div>
        </aside>

        {/* Main */}
        <div className="adm-main">
          <div className="adm-topbar">
            <div className="adm-topbar-title">{TAB_META[activeTab].title}</div>
            <div className="adm-topbar-subtitle">
              {TAB_META[activeTab].subtitle}
            </div>
          </div>

          <div className="adm-content">
            <div className="adm-body">
              {/* ── RESERVATIONS ──────────────────────────────────────────── */}
              {activeTab === "reservations" && (
                <>
                  {/* Filters */}
                  <div className="adm-form-row">
                    <div className="adm-form-field">
                      <label>Status</label>
                      <select
                        value={resFilter}
                        onChange={(e) =>
                          setResFilter(e.target.value as ResFilter)
                        }
                      >
                        <option value="all">All</option>
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                    <div className="adm-form-field">
                      <label>Property</label>
                      <select
                        value={resPropFilter}
                        onChange={(e) => setResPropFilter(e.target.value)}
                      >
                        <option value="all">All Properties</option>
                        {SHELTERS.filter((s) => !s.openingSoon).map((s) => (
                          <option key={s.id} value={s.name}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Table */}
                  {resLoading ? (
                    <div className="adm-loading">Loading reservations…</div>
                  ) : reservations.length === 0 ? (
                    <div className="adm-loading">No reservations.</div>
                  ) : (
                    <table className="adm-table">
                      <thead>
                        <tr>
                          <th>Guest</th>
                          <th>Property</th>
                          <th>Dates</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reservations
                          .filter(
                            (r) =>
                              (resFilter === "all" ||
                                getReservationStatus(r) === resFilter) &&
                              (resPropFilter === "all" ||
                                r.property_name === resPropFilter),
                          )
                          .map((r) => {
                            const status = getReservationStatus(r);
                            return (
                              <tr key={r.id}>
                                <td>{r.name}</td>
                                <td>{r.property_name}</td>
                                <td>
                                  {r.checkin} to {r.checkout}
                                </td>
                                <td>
                                  <span
                                    className={`adm-badge-status ${status}`}
                                  >
                                    {status}
                                  </span>
                                </td>
                                <td>
                                  <div className="adm-actions">
                                    {status === "pending" && (
                                      <button
                                        className="adm-btn"
                                        disabled={actionLoading === r.id}
                                        onClick={() =>
                                          updateReservation(r.id, {
                                            confirmed: true,
                                          })
                                        }
                                      >
                                        Confirm
                                      </button>
                                    )}
                                    <button
                                      className="adm-btn danger"
                                      disabled={actionLoading === r.id}
                                      onClick={() => deleteReservation(r.id)}
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  )}
                </>
              )}

              {/* ── REVENUE ───────────────────────────────────────────────── */}
              {activeTab === "revenue" && (
                <Suspense
                  fallback={
                    <div style={{ padding: "24px" }}>Loading module...</div>
                  }
                >
                  <RevenueTab />
                </Suspense>
              )}

              {/* ── PRICING CALENDAR ──────────────────────────────────────── */}
              {activeTab === "pricing-calendar" && <PricingCalendarTab />}

              {/* ── AVAILABILITY & BLOCKING ────────────────────────────────── */}
              {activeTab === "availability-blocking" && (
                <Suspense
                  fallback={
                    <div style={{ padding: "24px" }}>Loading module...</div>
                  }
                >
                  <AvailabilityTab />
                </Suspense>
              )}

              {/* ── CURRENCIES ────────────────────────────────────────────── */}
              {activeTab === "currencies" && (
                <>
                  <div className="adm-section-title">Currency Settings</div>
                  <div className="adm-form-row">
                    <div className="adm-form-field">
                      <label>Display Currency</label>
                      <select
                        value={currency.code}
                        onChange={(e) => {
                          const selected = SUPPORTED_CURRENCIES.find(
                            (c) => c.code === e.target.value,
                          );
                          if (selected) setCurrency(selected);
                        }}
                      >
                        {SUPPORTED_CURRENCIES.map((c) => (
                          <option key={c.code} value={c.code}>
                            {c.name} ({c.code})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div style={{ marginTop: "24px" }}>
                    <div className="adm-section-title">Exchange Rates</div>
                    <table className="adm-table">
                      <thead>
                        <tr>
                          <th>Currency</th>
                          <th>Rate (to KES)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(rates).map(([curr, rate]) => (
                          <tr key={curr}>
                            <td>{curr}</td>
                            <td>{rate.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

              {/* ── USERS ─────────────────────────────────────────────────── */}
              {activeTab === "users" && (
                <>
                  <div className="adm-section-title">Create Admin User</div>
                  <form onSubmit={createUser}>
                    <div className="adm-form-row">
                      <div className="adm-form-field">
                        <label>Username</label>
                        <input
                          type="text"
                          value={userForm.username}
                          onChange={(e) =>
                            setUserForm((f) => ({
                              ...f,
                              username: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div className="adm-form-field">
                        <label>Password</label>
                        <input
                          type="password"
                          value={userForm.password}
                          onChange={(e) =>
                            setUserForm((f) => ({
                              ...f,
                              password: e.target.value,
                            }))
                          }
                        />
                      </div>
                    </div>
                    <button type="submit" className="adm-btn">
                      Create User
                    </button>
                    {userError && (
                      <div className="adm-form-msg error">{userError}</div>
                    )}
                    {userSuccess && (
                      <div className="adm-form-msg success">
                        {userSuccess}
                      </div>
                    )}
                  </form>

                  {usersLoading ? (
                    <div className="adm-loading">Loading users…</div>
                  ) : users.length === 0 ? (
                    <div className="adm-loading">No users yet.</div>
                  ) : (
                    <table className="adm-table">
                      <thead>
                        <tr>
                          <th>Username</th>
                          <th>Created</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((u) => (
                          <tr key={u.username}>
                            <td>{u.username}</td>
                            <td>
                              {new Date(u.created_at).toLocaleDateString()}
                            </td>
                            <td>
                              <button
                                className="adm-btn danger"
                                onClick={() => deleteUser(u.username)}
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminDashboardPage;
