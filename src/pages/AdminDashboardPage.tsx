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

type Tab =
  | "reservations"
  | "pricing-calendar"
  | "availability-blocking"
  | "currencies"
  | "users";
type ResFilter = "all" | "pending" | "confirmed" | "cancelled";

const PROPERTY_NAMES = SHELTERS.map((s) => s.name);

const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { formatPrice, currency, setCurrency, rates } = useCurrency();
  const secret = sessionStorage.getItem("adminSecret") ?? "";
  const adminUser = sessionStorage.getItem("adminUser") ?? "Admin";

  useEffect(() => {
    if (!secret) navigate("/admin", { replace: true });
  }, [secret, navigate]);

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
    status: string,
    notes?: string,
  ) => {
    setActionLoading(id);
    try {
      const res = await api("/reservations", {
        method: "PUT",
        body: JSON.stringify({ id, status, ...(notes && { notes }) }),
      });
      if (res.ok) {
        setReservations((prev) =>
          prev.map((r) =>
            r.id === id
              ? {
                  ...r,
                  status,
                  ...(notes && { notes }),
                  updated_at: new Date().toISOString(),
                }
              : r,
          ),
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
    if (r.status !== "pending") return false;
    return new Date(r.created_at) > new Date(lastSeenAt);
  }).length;

  return (
    <>
      <style>{`
        .adm-layout { display: flex; gap: 20px; padding: 20px; background: #f5f6fa; min-height: 100vh; }
        .adm-sidebar { width: 200px; }
        .adm-content { flex: 1; }
        .adm-tabs { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 20px; border-bottom: 2px solid #e5e7eb; }
        .adm-tab { padding: 12px 16px; border: none; background: transparent; cursor: pointer; font-size: 0.9rem; font-weight: 500; color: #666; border-bottom: 3px solid transparent; transition: all 0.2s; }
        .adm-tab:hover { color: #333; }
        .adm-tab.active { color: #c9a84c; border-bottom-color: #c9a84c; }
        .adm-tab-wrap { display: flex; align-items: center; gap: 8px; }
        .adm-badge { background: #ef4444; color: white; padding: 2px 8px; border-radius: 12px; font-size: 0.75rem; font-weight: 600; }
        .adm-body { background: white; border-radius: 12px; padding: 24px; }
        .adm-form-row { display: flex; gap: 16px; margin-bottom: 16px; flex-wrap: wrap; }
        .adm-form-field { flex: 1; min-width: 200px; }
        .adm-form-field label { display: block; margin-bottom: 6px; font-weight: 600; color: #333; font-size: 0.9rem; }
        .adm-form-field input, .adm-form-field select, .adm-form-field textarea { width: 100%; padding: 10px 12px; border: 1.5px solid #e5e7eb; border-radius: 8px; font-family: inherit; font-size: 0.9rem; }
        .adm-form-field input:focus, .adm-form-field select:focus, .adm-form-field textarea:focus { outline: none; border-color: #c9a84c; box-shadow: 0 0 0 3px rgba(201, 168, 76, 0.1); }
        .adm-btn { padding: 10px 20px; background: #1a1a2e; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; transition: all 0.2s; }
        .adm-btn:hover { background: #0a0a1e; }
        .adm-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .adm-btn.danger { background: #ef4444; }
        .adm-btn.danger:hover { background: #dc2626; }
        .adm-table { width: 100%; border-collapse: collapse; margin-top: 16px; }
        .adm-table th { background: #f5f6fa; padding: 12px; text-align: left; font-weight: 600; color: #333; border-bottom: 2px solid #e5e7eb; }
        .adm-table td { padding: 12px; border-bottom: 1px solid #e5e7eb; }
        .adm-table tr:hover { background: #fafbfc; }
        .adm-badge-status { display: inline-block; padding: 4px 12px; border-radius: 16px; font-size: 0.75rem; font-weight: 600; }
        .adm-badge-status.pending { background: #fef3c7; color: #92400e; }
        .adm-badge-status.confirmed { background: #d1fae5; color: #065f46; }
        .adm-badge-status.cancelled { background: #fee2e2; color: #7f1d1d; }
        .adm-section-title { font-size: 1.1rem; font-weight: 700; color: #1a1a2e; margin-bottom: 16px; }
        .adm-form-msg { padding: 12px 16px; border-radius: 8px; margin-bottom: 16px; font-size: 0.9rem; }
        .adm-form-msg.error { background: #fee2e2; color: #7f1d1d; border: 1px solid #fecaca; }
        .adm-form-msg.success { background: #d1fae5; color: #065f46; border: 1px solid #a7f3d0; }
        .adm-loading { text-align: center; padding: 32px; color: #666; }
        .adm-actions { display: flex; gap: 8px; flex-wrap: wrap; }
        .adm-actions button { padding: 6px 12px; font-size: 0.8rem; }
      `}</style>

      <div className="adm-layout">
        {/* Sidebar */}
        <div className="adm-sidebar">
          <div style={{ padding: "12px", fontWeight: "600", color: "#333" }}>
            Admin: {adminUser}
          </div>
        </div>

        {/* Main Content */}
        <div className="adm-content">
          {/* Tabs */}
          <div className="adm-tabs">
            {(
              [
                "reservations",
                "pricing-calendar",
                "availability-blocking",
                "currencies",
                "users",
              ] as Tab[]
            ).map((t) => (
              <button
                key={t}
                className={`adm-tab${activeTab === t ? " active" : ""}`}
                onClick={() => {
                  setActiveTab(t);
                  if (t === "reservations") markReservationsSeen();
                }}
              >
                <span className="adm-tab-wrap">
                  {t === "reservations"
                    ? "Reservations"
                    : t === "pricing-calendar"
                      ? "Pricing Calendar"
                      : t === "availability-blocking"
                        ? "Availability & Blocking"
                        : t === "currencies"
                          ? "Currencies"
                          : "Users"}
                  {t === "reservations" && newCount > 0 && (
                    <span className="adm-badge">{newCount}</span>
                  )}
                </span>
              </button>
            ))}
          </div>

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
                            (resFilter === "all" || r.status === resFilter) &&
                            (resPropFilter === "all" ||
                              r.property === resPropFilter),
                        )
                        .map((r) => (
                          <tr key={r.id}>
                            <td>{r.guest_name}</td>
                            <td>{r.property}</td>
                            <td>
                              {r.checkin} to {r.checkout}
                            </td>
                            <td>
                              <span className={`adm-badge-status ${r.status}`}>
                                {r.status}
                              </span>
                            </td>
                            <td>
                              <div className="adm-actions">
                                {r.status === "pending" && (
                                  <button
                                    className="adm-btn"
                                    disabled={actionLoading === r.id}
                                    onClick={() =>
                                      updateReservation(r.id, "confirmed")
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
                        ))}
                    </tbody>
                  </table>
                )}
              </>
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
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                    >
                      {SUPPORTED_CURRENCIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
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
                    <div className="adm-form-msg success">{userSuccess}</div>
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
                          <td>{new Date(u.created_at).toLocaleDateString()}</td>
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
    </>
  );
};

export default AdminDashboardPage;
