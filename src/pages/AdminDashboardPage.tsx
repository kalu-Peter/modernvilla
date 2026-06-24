import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SHELTERS } from "../types";
import type {
  AdminReservation,
  BlockedDate,
  SeasonalPricingRule,
  PricingTier,
} from "../types";
import { useCurrency, SUPPORTED_CURRENCIES } from "../context/CurrencyContext";
import PricingCalendarTab from "../components/PricingCalendarTab";

type Tab =
  | "reservations"
  | "blocked-dates"
  | "seasonal-pricing"
  | "pricing-calendar"
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
  ); // eslint-disable-line

  // ── Blocked Dates ─────────────────────────────────────────────────────────
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [blockLoading, setBlockLoading] = useState(false);
  const [blockPropFilter, setBlockPropFilter] = useState("all");
  const [blockMode, setBlockMode] = useState<"single" | "range" | "month">(
    "single",
  );
  const [blockForm, setBlockForm] = useState({
    property_name: PROPERTY_NAMES[0] ?? "",
    single_date: "",
    start_date: "",
    end_date: "",
    month: "",
    reason: "manual_block",
  });
  const [blockSaving, setBlockSaving] = useState(false);
  const [blockError, setBlockError] = useState("");
  const [blockSuccess, setBlockSuccess] = useState("");

  // ── iCal Sync ─────────────────────────────────────────────────────────────
  const [icalUrls, setIcalUrls] = useState<Record<string, string>>({});
  const [icalForm, setIcalForm] = useState({
    property_name: PROPERTY_NAMES[0] ?? "",
    ical_url: "",
  });
  const [icalSyncing, setIcalSyncing] = useState(false);
  const [icalError, setIcalError] = useState("");
  const [icalSuccess, setIcalSuccess] = useState("");

  const fetchIcalUrls = useCallback(async () => {
    const res = await api("/blocked-dates?action=ical-urls");
    if (res.ok) setIcalUrls(await res.json());
  }, [api]);

  const syncIcal = async (e: React.FormEvent) => {
    e.preventDefault();
    setIcalError("");
    setIcalSuccess("");
    if (!icalForm.ical_url.trim()) {
      setIcalError("Please enter an iCal URL.");
      return;
    }
    setIcalSyncing(true);
    try {
      const res = await api("/blocked-dates", {
        method: "POST",
        body: JSON.stringify({
          action: "sync-ical",
          property_name: icalForm.property_name,
          ical_url: icalForm.ical_url.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setIcalError(data.error ?? "Sync failed.");
        return;
      }
      setIcalSuccess(data.message ?? "Sync complete.");
      await fetchIcalUrls();
      await fetchBlockedDates();
    } finally {
      setIcalSyncing(false);
    }
  };

  const fetchBlockedDates = useCallback(async () => {
    setBlockLoading(true);
    try {
      const param =
        blockPropFilter !== "all"
          ? `?property=${encodeURIComponent(blockPropFilter)}`
          : "";
      const res = await api(`/blocked-dates${param}`);
      if (res.ok) setBlockedDates(await res.json());
    } finally {
      setBlockLoading(false);
    }
  }, [api, blockPropFilter]);

  // ── Pricing Tiers ───────────────────────────────────────────────────────
  const [pricingTiers, setPricingTiers] = useState<PricingTier[]>([]);
  const [pricingShelter, setPricingShelter] = useState(SHELTERS[0]?.name || "");
  const [pricingError, setPricingError] = useState("");
  const [pricingSuccess, setPricingSuccess] = useState("");
  const [pricingSaving, setPricingSaving] = useState(false);

  // Single day pricing form
  const [singleDayDate, setSingleDayDate] = useState("");
  const [singleDayPrice, setSingleDayPrice] = useState("");
  const [singleDayExtra, setSingleDayExtra] = useState("");

  // Weekend pricing form
  const [weekendPrice, setWeekendPrice] = useState("");
  const [weekendExtra, setWeekendExtra] = useState("");

  // Yearly pricing form
  const [yearlyPrice, setYearlyPrice] = useState("");
  const [yearlyExtra, setYearlyExtra] = useState("");

  const fetchPricingTiers = useCallback(
    async (propertyName: string) => {
      const res = await api(
        `/seasonal-pricing?property_name=${encodeURIComponent(propertyName)}`,
      );
      if (res.ok) {
        const data = await res.json();
        setPricingTiers(data.data || data);
        // Pre-fill forms with existing data
        const yearly =
          data.data?.find?.((t: PricingTier) => t.tier_type === "yearly") ||
          data.find((t: PricingTier) => t.tier_type === "yearly");
        if (yearly) {
          setYearlyPrice(String(yearly.base_price));
          setYearlyExtra(String(yearly.extra_person_fee || ""));
        }
        const weekend =
          data.data?.find?.((t: PricingTier) => t.tier_type === "weekend") ||
          data.find((t: PricingTier) => t.tier_type === "weekend");
        if (weekend) {
          setWeekendPrice(String(weekend.base_price));
          setWeekendExtra(String(weekend.extra_person_fee || ""));
        }
      }
    },
    [api],
  );

  const upsertPricingTier = async (
    tierType: "single_day" | "weekend" | "yearly",
  ) => {
    setPricingError("");
    setPricingSuccess("");

    let basePrice = 0;
    let extraPersonFee = 0;
    let specificDate = null;

    if (tierType === "single_day") {
      if (!singleDayDate) {
        setPricingError("Please select a date for single day pricing.");
        return;
      }
      basePrice = parseFloat(singleDayPrice);
      extraPersonFee = parseFloat(singleDayExtra) || 0;
      specificDate = singleDayDate;
    } else if (tierType === "weekend") {
      basePrice = parseFloat(weekendPrice);
      extraPersonFee = parseFloat(weekendExtra) || 0;
    } else {
      basePrice = parseFloat(yearlyPrice);
      extraPersonFee = parseFloat(yearlyExtra) || 0;
    }

    if (isNaN(basePrice) || basePrice <= 0) {
      setPricingError(`Please enter a valid base price for ${tierType}.`);
      return;
    }

    setPricingSaving(true);
    try {
      const res = await api("/seasonal-pricing", {
        method: "POST",
        body: JSON.stringify({
          property_name: pricingShelter,
          tier_type: tierType,
          specific_date: specificDate,
          base_price: basePrice,
          extra_person_fee: extraPersonFee || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setPricingError(
          data.error || data.message || "Failed to save pricing tier.",
        );
        return;
      }

      const tier = data.data || data;
      setPricingTiers((prev) => {
        const idx = prev.findIndex(
          (t) => t.tier_type === tierType && t.specific_date === specificDate,
        );
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = tier;
          return updated;
        }
        return [...prev, tier];
      });

      // Reset form fields based on tier type
      if (tierType === "single_day") {
        setSingleDayDate("");
        setSingleDayPrice("");
        setSingleDayExtra("");
      } else if (tierType === "weekend") {
        setWeekendPrice("");
        setWeekendExtra("");
      } else {
        setYearlyPrice("");
        setYearlyExtra("");
      }

      setPricingSuccess(
        `${tierType.replace("_", " ")} pricing saved successfully.`,
      );
    } finally {
      setPricingSaving(false);
    }
  };

  const deletePricingTier = async (id: number) => {
    if (!window.confirm("Delete this pricing tier?")) return;
    setPricingError("");
    setPricingSuccess("");
    try {
      const res = await api(`/seasonal-pricing?id=${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        setPricingError(data.error || "Failed to delete pricing tier.");
        return;
      }
      setPricingTiers((prev) => prev.filter((t) => t.id !== id));
      setPricingSuccess("Pricing tier deleted.");
    } catch (e) {
      setPricingError("Error deleting pricing tier.");
    }
  };

  const abbrevPrice = (kes: number) => {
    const rate = rates[currency.code] ?? 1;
    const n = kes * rate;
    const num =
      n >= 1000
        ? `${(n / 1000) % 1 === 0 ? (n / 1000).toFixed(0) : (n / 1000).toFixed(1)}k`
        : String(Math.round(n));
    return `${currency.symbol}${num}`;
  };

  // ── Users ─────────────────────────────────────────────────────────────────
  type AdminUser = { id: string; username: string; created_at: string };
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userForm, setUserForm] = useState({ username: "", password: "" });
  const [userError, setUserError] = useState("");
  const [userSuccess, setUserSuccess] = useState("");
  const [userSaving, setUserSaving] = useState(false);

  const fetchUsers = useCallback(async () => {
    setUsersLoading(true);
    try {
      const res = await api("/auth");
      if (res.ok) setUsers(await res.json());
    } finally {
      setUsersLoading(false);
    }
  }, [api]);

  const createUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserError("");
    setUserSuccess("");
    if (!userForm.username || !userForm.password) {
      setUserError("Both fields are required.");
      return;
    }
    setUserSaving(true);
    try {
      const res = await api("/auth?action=create", {
        method: "POST",
        body: JSON.stringify(userForm),
      });
      const data = await res.json();
      if (!res.ok) {
        setUserError(data.error ?? "Failed to create user.");
        return;
      }
      setUserSuccess(`User "${data.user.username}" created.`);
      setUserForm({ username: "", password: "" });
      await fetchUsers();
    } finally {
      setUserSaving(false);
    }
  };

  const deleteUser = async (id: string, username: string) => {
    if (!window.confirm(`Delete user "${username}"?`)) return;
    await api(`/auth?id=${id}`, { method: "DELETE" });
    await fetchUsers();
  };

  // ── Load on tab switch ────────────────────────────────────────────────────
  useEffect(() => {
    if (activeTab === "reservations") fetchReservations(true);
    if (activeTab === "blocked-dates") {
      fetchBlockedDates();
      fetchIcalUrls();
    }
    if (activeTab === "seasonal-pricing" && pricingShelter)
      fetchPricingTiers(pricingShelter);
    if (activeTab === "users") fetchUsers();
  }, [
    activeTab,
    fetchReservations,
    fetchBlockedDates,
    fetchIcalUrls,
    fetchPricingTiers,
    fetchUsers,
    pricingShelter,
  ]);

  useEffect(() => {
    if (activeTab === "blocked-dates") fetchBlockedDates();
  }, [blockPropFilter]); // eslint-disable-line

  // ── Actions ───────────────────────────────────────────────────────────────
  const confirmReservation = async (id: string) => {
    setActionLoading(id + "-confirm");
    try {
      await api(`/reservations?id=${id}`, {
        method: "PUT",
        body: JSON.stringify({ action: "confirm" }),
      });
      await fetchReservations();
    } finally {
      setActionLoading(null);
    }
  };

  const cancelReservation = async (id: string) => {
    if (!window.confirm("Cancel this reservation?")) return;
    setActionLoading(id + "-cancel");
    try {
      await api(`/reservations?id=${id}`, {
        method: "PUT",
        body: JSON.stringify({ action: "cancel" }),
      });
      await fetchReservations();
    } finally {
      setActionLoading(null);
    }
  };

  const unblockDate = async (id: number) => {
    if (!window.confirm("Unblock this date?")) return;
    await api(`/blocked-dates?id=${id}`, { method: "DELETE" });
    await fetchBlockedDates();
  };

  const submitBlockDate = async (e: React.FormEvent) => {
    e.preventDefault();
    setBlockError("");
    setBlockSuccess("");

    let start_date = "",
      end_date = "";

    if (blockMode === "single") {
      if (!blockForm.single_date) {
        setBlockError("Please select a date.");
        return;
      }
      start_date = blockForm.single_date;
      end_date = blockForm.single_date;
    } else if (blockMode === "range") {
      if (!blockForm.start_date || !blockForm.end_date) {
        setBlockError("Please select both start and end dates.");
        return;
      }
      if (blockForm.end_date < blockForm.start_date) {
        setBlockError("End date must be after start date.");
        return;
      }
      start_date = blockForm.start_date;
      end_date = blockForm.end_date;
    } else {
      if (!blockForm.month) {
        setBlockError("Please select a month.");
        return;
      }
      const [y, m] = blockForm.month.split("-").map(Number);
      const firstDay = new Date(y, m - 1, 1);
      const lastDay = new Date(y, m, 0);
      start_date = firstDay.toISOString().split("T")[0];
      end_date = lastDay.toISOString().split("T")[0];
    }

    setBlockSaving(true);
    try {
      const res = await api("/blocked-dates", {
        method: "POST",
        body: JSON.stringify({
          property_name: blockForm.property_name,
          start_date,
          end_date,
          reason: blockForm.reason,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setBlockError(data.error ?? "Failed to block dates.");
        return;
      }
      setBlockSuccess(data.message ?? "Dates blocked successfully.");
      setBlockForm((f) => ({
        ...f,
        single_date: "",
        start_date: "",
        end_date: "",
        month: "",
      }));
      await fetchBlockedDates();
    } finally {
      setBlockSaving(false);
    }
  };

  // ── Derived ───────────────────────────────────────────────────────────────
  const filteredReservations = reservations.filter((r) => {
    const matchProp =
      resPropFilter === "all" || r.property_name === resPropFilter;
    const matchStatus =
      resFilter === "all" ||
      (resFilter === "confirmed" && r.confirmed && !r.cancelled) ||
      (resFilter === "cancelled" && r.cancelled) ||
      (resFilter === "pending" && !r.confirmed && !r.cancelled);
    return matchProp && matchStatus;
  });

  const newCount = reservations.filter(
    (r) => new Date(r.created_at) > new Date(lastSeenAt),
  ).length;

  const stats = {
    total: reservations.length,
    confirmed: reservations.filter((r) => r.confirmed && !r.cancelled).length,
    pending: reservations.filter((r) => !r.confirmed && !r.cancelled).length,
    cancelled: reservations.filter((r) => r.cancelled).length,
    revenue: reservations
      .filter((r) => r.confirmed && !r.cancelled)
      .reduce((sum, r) => sum + Number(r.total_price), 0),
  };

  const logout = () => {
    sessionStorage.removeItem("adminSecret");
    sessionStorage.removeItem("adminUser");
    navigate("/admin", { replace: true });
  };

  const fmt = (d: string) =>
    new Date(d).toLocaleDateString("en-KE", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  if (!secret) return null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@700&display=swap');

        * { margin: 0; padding: 0; box-sizing: border-box; }

        .adm-root {
          min-height: 100vh;
          background: #f5f6fa;
          color: #1a1a2e;
          font-family: 'Inter', sans-serif;
          display: flex;
          flex-direction: column;
        }

        /* ── Top bar ── */
        .adm-topbar {
          background: #ffffff;
          border-bottom: 1px solid #eef0f4;
          padding: 0 32px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 64px;
          flex-shrink: 0;
          box-shadow: 0 1px 3px rgba(0,0,0,0.04);
        }
        .adm-topbar-logo {
          font-family: 'Playfair Display', serif;
          font-size: 1.15rem;
          color: #1a1a2e;
          letter-spacing: 0.02em;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .adm-topbar-logo::before {
          content: '';
          width: 8px; height: 8px;
          background: #c9a84c;
          border-radius: 50%;
          display: inline-block;
        }
        .adm-topbar-logo span { color: #c9a84c; }
        .adm-topbar-right { display: flex; align-items: center; gap: 16px; }
        .adm-topbar-user {
          font-size: 0.78rem;
          color: #9098a9;
          font-weight: 400;
        }
        .adm-topbar-user strong { color: #1a1a2e; font-weight: 600; }
        .adm-logout {
          font-size: 0.72rem;
          font-weight: 500;
          color: #6b7280;
          background: none;
          border: 1.5px solid #e5e7eb;
          border-radius: 8px;
          padding: 7px 18px;
          cursor: pointer;
          transition: all 0.18s;
          font-family: 'Inter', sans-serif;
        }
        .adm-logout:hover { background: #f9fafb; border-color: #d1d5db; color: #374151; }
        .adm-currency-select {
          font-family: 'Inter', sans-serif;
          font-size: 0.75rem;
          font-weight: 500;
          color: #1a1a2e;
          background: #f5f6fa;
          border: 1.5px solid #e5e7eb;
          border-radius: 8px;
          padding: 7px 28px 7px 10px;
          cursor: pointer;
          outline: none;
          appearance: none;
          -webkit-appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' fill='none'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%239098a9' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 10px center;
          transition: border-color 0.18s;
        }
        .adm-currency-select:hover { border-color: #c9a84c; }

        /* ── Stats ── */
        .adm-stats {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 16px;
          padding: 24px 32px;
          background: transparent;
        }
        .adm-stat {
          background: #ffffff;
          border-radius: 14px;
          padding: 20px 22px;
          box-shadow: 0 1px 4px rgba(0,0,0,0.06);
          border: 1px solid #eef0f4;
          position: relative;
          overflow: hidden;
        }
        .adm-stat::after {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 3px;
          background: #e5e7eb;
          border-radius: 14px 14px 0 0;
        }
        .adm-stat:nth-child(2)::after { background: #10b981; }
        .adm-stat:nth-child(3)::after { background: #f59e0b; }
        .adm-stat:nth-child(4)::after { background: #ef4444; }
        .adm-stat:nth-child(5)::after { background: #c9a84c; }
        .adm-stat-label {
          font-size: 0.68rem;
          font-weight: 500;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          color: #9098a9;
          margin-bottom: 10px;
        }
        .adm-stat-value {
          font-size: 1.9rem;
          font-weight: 700;
          color: #1a1a2e;
          line-height: 1;
          font-family: 'Playfair Display', serif;
        }
        .adm-stat-value.accent { color: #c9a84c; }

        /* ── Tabs ── */
        .adm-tabs {
          display: flex;
          gap: 4px;
          background: #ffffff;
          padding: 0 32px;
          border-bottom: 1px solid #eef0f4;
          box-shadow: 0 1px 3px rgba(0,0,0,0.04);
        }
        .adm-tab {
          font-size: 0.72rem;
          font-weight: 500;
          letter-spacing: 0.02em;
          color: #9098a9;
          background: none;
          border: none;
          border-bottom: 2px solid transparent;
          padding: 16px 20px 14px;
          cursor: pointer;
          font-family: 'Inter', sans-serif;
          transition: color 0.18s, border-color 0.18s;
        }
        .adm-tab:hover { color: #4b5563; }
        .adm-tab.active { color: #1a1a2e; border-bottom-color: #c9a84c; font-weight: 600; }
        .adm-tab-wrap { display: inline-flex; align-items: center; gap: 8px; }
        .adm-badge {
          background: #ef4444;
          color: #fff;
          font-size: 0.6rem;
          font-weight: 700;
          min-width: 18px;
          height: 18px;
          border-radius: 9px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0 5px;
          letter-spacing: 0;
        }

        /* ── Content area ── */
        .adm-body { flex: 1; padding: 28px 32px; }

        /* ── Section header ── */
        .adm-section-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
          flex-wrap: wrap;
          gap: 12px;
        }
        .adm-section-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.35rem;
          color: #1a1a2e;
        }
        .adm-filters { display: flex; gap: 8px; flex-wrap: wrap; }
        .adm-select {
          background: #ffffff;
          border: 1.5px solid #e5e7eb;
          border-radius: 8px;
          color: #374151;
          font-family: 'Inter', sans-serif;
          font-size: 0.75rem;
          font-weight: 500;
          padding: 8px 14px;
          outline: none;
          cursor: pointer;
          transition: border-color 0.18s;
        }
        .adm-select:focus { border-color: #c9a84c; }
        .adm-filter-btn {
          background: #ffffff;
          border: 1.5px solid #e5e7eb;
          border-radius: 8px;
          color: #9098a9;
          font-family: 'Inter', sans-serif;
          font-size: 0.72rem;
          font-weight: 500;
          padding: 8px 16px;
          cursor: pointer;
          transition: all 0.18s;
        }
        .adm-filter-btn:hover { color: #374151; border-color: #c9a84c; }
        .adm-filter-btn.active { background: #1a1a2e; color: #ffffff; border-color: #1a1a2e; }

        /* ── Table card ── */
        .adm-table-wrap {
          overflow-x: auto;
          background: #ffffff;
          border-radius: 14px;
          border: 1px solid #eef0f4;
          box-shadow: 0 1px 4px rgba(0,0,0,0.06);
        }
        .adm-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 900px;
        }
        .adm-table th {
          font-size: 0.65rem;
          font-weight: 600;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: #9098a9;
          text-align: left;
          padding: 14px 18px;
          border-bottom: 1px solid #eef0f4;
          white-space: nowrap;
          background: #fafbfc;
        }
        .adm-table th:first-child { border-radius: 14px 0 0 0; }
        .adm-table th:last-child  { border-radius: 0 14px 0 0; }
        .adm-table td {
          font-size: 0.82rem;
          color: #374151;
          padding: 14px 18px;
          border-bottom: 1px solid #f3f4f6;
          vertical-align: middle;
        }
        .adm-table tr:hover td { background: #fafbfc; }
        .adm-table tr:last-child td { border-bottom: none; }

        /* ── Status badges ── */
        .badge {
          display: inline-block;
          font-size: 0.65rem;
          font-weight: 600;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          padding: 4px 10px;
          border-radius: 20px;
        }
        .badge-confirmed { background: #d1fae5; color: #065f46; }
        .badge-pending   { background: #fef3c7; color: #92400e; }
        .badge-cancelled { background: #fee2e2; color: #991b1b; }
        .badge-paid      { background: #d1fae5; color: #065f46; }
        .badge-failed    { background: #fee2e2; color: #991b1b; }
        .badge-default   { background: #f3f4f6; color: #6b7280; }

        /* ── Action buttons ── */
        .adm-btn {
          font-family: 'Inter', sans-serif;
          font-size: 0.7rem;
          font-weight: 600;
          letter-spacing: 0.02em;
          padding: 7px 14px;
          border: none;
          border-radius: 7px;
          cursor: pointer;
          transition: all 0.18s;
          white-space: nowrap;
        }
        .adm-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .adm-btn-confirm { background: #d1fae5; color: #065f46; }
        .adm-btn-confirm:hover:not(:disabled) { background: #10b981; color: #fff; }
        .adm-btn-cancel  { background: #f3f4f6; color: #6b7280; }
        .adm-btn-cancel:hover:not(:disabled)  { background: #fee2e2; color: #991b1b; }
        .adm-btn-remove  { background: #f3f4f6; color: #6b7280; }
        .adm-btn-remove:hover:not(:disabled)  { background: #fee2e2; color: #991b1b; }
        .adm-btn-save    { background: #1a1a2e; color: #ffffff; border-radius: 8px; }
        .adm-btn-save:hover:not(:disabled)    { background: #2d2d4e; }

        /* ── Loading / empty ── */
        .adm-loading {
          padding: 60px 0;
          text-align: center;
          font-size: 0.78rem;
          font-weight: 500;
          color: #9098a9;
        }

        /* ── Form card ── */
        .adm-form-card {
          background: #ffffff;
          border: 1px solid #eef0f4;
          border-radius: 14px;
          padding: 28px 32px;
          margin-top: 24px;
          box-shadow: 0 1px 4px rgba(0,0,0,0.06);
        }
        .adm-form-card h3 {
          font-size: 0.72rem;
          font-weight: 600;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: #9098a9;
          margin-bottom: 20px;
        }
        .adm-form-row {
          display: flex;
          gap: 14px;
          flex-wrap: wrap;
          align-items: flex-end;
        }
        .adm-form-field { display: flex; flex-direction: column; gap: 6px; }
        .adm-form-field label {
          font-size: 0.65rem;
          font-weight: 600;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          color: #9098a9;
        }
        .adm-form-field input,
        .adm-form-field select {
          background: #f9fafb;
          border: 1.5px solid #e5e7eb;
          border-radius: 8px;
          color: #1a1a2e;
          font-family: 'Inter', sans-serif;
          font-size: 0.82rem;
          padding: 10px 14px;
          outline: none;
          min-width: 160px;
          transition: border-color 0.18s;
        }
        .adm-form-field input:focus,
        .adm-form-field select:focus { border-color: #c9a84c; background: #fff; }
        .adm-form-msg {
          font-size: 0.75rem;
          font-weight: 500;
          margin-top: 14px;
          padding: 10px 14px;
          border-radius: 8px;
        }
        .adm-form-msg.error { color: #991b1b; background: #fef2f2; border: 1px solid #fecaca; }
        .adm-form-msg.success { color: #065f46; background: #f0fdf4; border: 1px solid #bbf7d0; }

        /* ── Price input ── */
        .adm-price-input {
          background: #ffffff;
          border: 1.5px solid #c9a84c;
          border-radius: 6px;
          color: #1a1a2e;
          font-family: 'Inter', sans-serif;
          font-size: 0.85rem;
          padding: 6px 10px;
          outline: none;
          width: 110px;
        }
        .adm-price-cell { display: flex; align-items: center; gap: 8px; }
        .adm-price-click {
          cursor: pointer;
          border-bottom: 1.5px dashed #c9a84c;
          padding-bottom: 1px;
          color: #374151;
        }
        .adm-price-click:hover { color: #1a1a2e; border-bottom-color: #1a1a2e; }

        @media (max-width: 768px) {
          .adm-topbar { padding: 0 16px; }
          .adm-stats  { grid-template-columns: repeat(2, 1fr); padding: 16px; }
          .adm-tabs   { padding: 0 16px; }
          .adm-body   { padding: 20px 16px; }
        }
      `}</style>

      <div className="adm-root">
        {/* Top bar */}
        <div className="adm-topbar">
          <div className="adm-topbar-logo">
            Alsace<span> Hideaways</span>
          </div>
          <div className="adm-topbar-right">
            <div className="adm-topbar-user">
              Signed in as <strong>{adminUser}</strong>
            </div>
            <select
              className="adm-currency-select"
              value={currency.code}
              onChange={(e) => {
                const found = SUPPORTED_CURRENCIES.find(
                  (c) => c.code === e.target.value,
                );
                if (found) setCurrency(found);
              }}
              aria-label="Select currency"
            >
              {SUPPORTED_CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.symbol} {c.code}
                </option>
              ))}
            </select>
            <button className="adm-logout" onClick={logout}>
              Sign Out
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="adm-stats">
          <div className="adm-stat">
            <div className="adm-stat-label">Total Reservations</div>
            <div className="adm-stat-value">{stats.total}</div>
          </div>
          <div className="adm-stat">
            <div className="adm-stat-label">Confirmed</div>
            <div className="adm-stat-value" style={{ color: "#10b981" }}>
              {stats.confirmed}
            </div>
          </div>
          <div className="adm-stat">
            <div className="adm-stat-label">Pending</div>
            <div className="adm-stat-value" style={{ color: "#eab308" }}>
              {stats.pending}
            </div>
          </div>
          <div className="adm-stat">
            <div className="adm-stat-label">Cancelled</div>
            <div className="adm-stat-value" style={{ color: "#ef4444" }}>
              {stats.cancelled}
            </div>
          </div>
          <div className="adm-stat">
            <div className="adm-stat-label">Confirmed Revenue</div>
            <div className="adm-stat-value accent">
              {formatPrice(stats.revenue)}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="adm-tabs">
          {(
            [
              "reservations",
              "blocked-dates",
              "seasonal-pricing",
              "pricing-calendar",
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
                  : t === "blocked-dates"
                    ? "Blocked Dates"
                    : t === "seasonal-pricing"
                      ? "Pricing (Legacy)"
                      : t === "pricing-calendar"
                        ? "Pricing Calendar"
                        : "Users"}
                {t === "reservations" && newCount > 0 && (
                  <span className="adm-badge">{newCount}</span>
                )}
              </span>
            </button>
          ))}
        </div>

        <div className="adm-body">
          {/* ── RESERVATIONS ──────────────────────────────── */}
          {activeTab === "reservations" && (
            <>
              <div className="adm-section-head">
                <div className="adm-section-title">Reservations</div>
                <div className="adm-filters">
                  <select
                    className="adm-select"
                    value={resPropFilter}
                    onChange={(e) => setResPropFilter(e.target.value)}
                  >
                    <option value="all">All Properties</option>
                    {PROPERTY_NAMES.map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                  {(
                    ["all", "pending", "confirmed", "cancelled"] as ResFilter[]
                  ).map((f) => (
                    <button
                      key={f}
                      className={`adm-filter-btn${resFilter === f ? " active" : ""}`}
                      onClick={() => setResFilter(f)}
                    >
                      {f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                  ))}
                  <button
                    className="adm-filter-btn"
                    onClick={() => fetchReservations()}
                  >
                    ↺ Refresh
                  </button>
                </div>
              </div>

              {resLoading ? (
                <div className="adm-loading">Loading reservations…</div>
              ) : filteredReservations.length === 0 ? (
                <div className="adm-loading">No reservations found.</div>
              ) : (
                <div className="adm-table-wrap">
                  <table className="adm-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Property</th>
                        <th>Guest Name</th>
                        <th>Phone</th>
                        <th>Guests</th>
                        <th>Check-In</th>
                        <th>Check-Out</th>
                        <th>Total ({currency.code})</th>
                        <th>Payment</th>
                        <th>Status</th>
                        <th>Booked</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredReservations.map((r) => {
                        const status = r.cancelled
                          ? "cancelled"
                          : r.confirmed
                            ? "confirmed"
                            : "pending";
                        return (
                          <tr key={r.id}>
                            <td
                              style={{
                                fontFamily: "monospace",
                                fontSize: "0.7rem",
                                color: "#aaaaaa",
                              }}
                            >
                              {r.id.slice(0, 8)}…
                            </td>
                            <td>{r.property_name}</td>
                            <td>
                              <div>{r.name}</div>
                              <div
                                style={{
                                  fontSize: "0.65rem",
                                  color: "#aaaaaa",
                                }}
                              >
                                {r.email}
                              </div>
                            </td>
                            <td>{r.phone}</td>
                            <td style={{ textAlign: "center" }}>{r.guests}</td>
                            <td>{fmt(r.checkin)}</td>
                            <td>{fmt(r.checkout)}</td>
                            <td>{formatPrice(Number(r.total_price))}</td>
                            <td>
                              <span
                                className={`badge badge-${r.payment_status === "paid" ? "paid" : r.payment_status === "failed" ? "failed" : "default"}`}
                              >
                                {r.payment_status}
                              </span>
                              {r.amount_paid != null && (
                                <div
                                  style={{
                                    fontSize: "0.7rem",
                                    color: "#059669",
                                    marginTop: 3,
                                    fontWeight: 600,
                                  }}
                                >
                                  {formatPrice(Number(r.amount_paid))} deposited
                                </div>
                              )}
                            </td>
                            <td>
                              <span className={`badge badge-${status}`}>
                                {status}
                              </span>
                            </td>
                            <td
                              style={{ fontSize: "0.68rem", color: "#aaaaaa" }}
                            >
                              {fmt(r.created_at)}
                            </td>
                            <td>
                              <div style={{ display: "flex", gap: 8 }}>
                                <button
                                  className="adm-btn adm-btn-confirm"
                                  disabled={
                                    r.confirmed ||
                                    r.cancelled ||
                                    actionLoading === r.id + "-confirm"
                                  }
                                  onClick={() => confirmReservation(r.id)}
                                >
                                  {actionLoading === r.id + "-confirm"
                                    ? "…"
                                    : "Confirm"}
                                </button>
                                <button
                                  className="adm-btn adm-btn-cancel"
                                  disabled={
                                    r.cancelled ||
                                    actionLoading === r.id + "-cancel"
                                  }
                                  onClick={() => cancelReservation(r.id)}
                                >
                                  {actionLoading === r.id + "-cancel"
                                    ? "…"
                                    : "Cancel"}
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          {/* ── BLOCKED DATES ─────────────────────────────── */}
          {activeTab === "blocked-dates" && (
            <>
              {/* Add block form */}
              <div className="adm-form-card">
                <h3>Block Dates</h3>

                {/* Mode selector */}
                <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
                  {(["single", "range", "month"] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setBlockMode(m)}
                      style={{
                        padding: "6px 16px",
                        fontSize: "0.7rem",
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                        fontFamily: "'Josefin Sans', sans-serif",
                        border: "1px solid",
                        borderColor: blockMode === m ? "#0a0a0a" : "#e0e0e0",
                        background: blockMode === m ? "#0a0a0a" : "#ffffff",
                        color: blockMode === m ? "#ffffff" : "#aaaaaa",
                        cursor: "pointer",
                      }}
                    >
                      {m === "single"
                        ? "Single Day"
                        : m === "range"
                          ? "Date Range"
                          : "Whole Month"}
                    </button>
                  ))}
                </div>

                <form onSubmit={submitBlockDate}>
                  <div className="adm-form-row">
                    <div className="adm-form-field">
                      <label>Property</label>
                      <select
                        className="adm-select"
                        value={blockForm.property_name}
                        onChange={(e) =>
                          setBlockForm((f) => ({
                            ...f,
                            property_name: e.target.value,
                          }))
                        }
                      >
                        {PROPERTY_NAMES.map((n) => (
                          <option key={n} value={n}>
                            {n}
                          </option>
                        ))}
                      </select>
                    </div>

                    {blockMode === "single" && (
                      <div className="adm-form-field">
                        <label>Date</label>
                        <input
                          type="date"
                          value={blockForm.single_date}
                          min={new Date().toISOString().split("T")[0]}
                          onChange={(e) =>
                            setBlockForm((f) => ({
                              ...f,
                              single_date: e.target.value,
                            }))
                          }
                        />
                      </div>
                    )}

                    {blockMode === "range" && (
                      <>
                        <div className="adm-form-field">
                          <label>Start Date</label>
                          <input
                            type="date"
                            value={blockForm.start_date}
                            min={new Date().toISOString().split("T")[0]}
                            onChange={(e) =>
                              setBlockForm((f) => ({
                                ...f,
                                start_date: e.target.value,
                              }))
                            }
                          />
                        </div>
                        <div className="adm-form-field">
                          <label>End Date</label>
                          <input
                            type="date"
                            value={blockForm.end_date}
                            min={
                              blockForm.start_date ||
                              new Date().toISOString().split("T")[0]
                            }
                            onChange={(e) =>
                              setBlockForm((f) => ({
                                ...f,
                                end_date: e.target.value,
                              }))
                            }
                          />
                        </div>
                      </>
                    )}

                    {blockMode === "month" && (
                      <div className="adm-form-field">
                        <label>Month</label>
                        <input
                          type="month"
                          value={blockForm.month}
                          min={new Date().toISOString().slice(0, 7)}
                          onChange={(e) =>
                            setBlockForm((f) => ({
                              ...f,
                              month: e.target.value,
                            }))
                          }
                        />
                      </div>
                    )}

                    <div className="adm-form-field">
                      <label>Reason</label>
                      <select
                        value={blockForm.reason}
                        onChange={(e) =>
                          setBlockForm((f) => ({
                            ...f,
                            reason: e.target.value,
                          }))
                        }
                        style={{
                          background: "#ffffff",
                          border: "1px solid #e0e0e0",
                          color: "#1a1a1a",
                          fontFamily: "'Josefin Sans', sans-serif",
                          fontSize: "0.8rem",
                          padding: "10px 14px",
                          outline: "none",
                          minWidth: 160,
                        }}
                      >
                        <option value="manual_block">Manual Block</option>
                        <option value="maintenance">Maintenance</option>
                        <option value="owner_stay">Owner Stay</option>
                      </select>
                    </div>

                    <button
                      className="adm-btn adm-btn-save"
                      type="submit"
                      disabled={blockSaving}
                      style={{ padding: "10px 24px", alignSelf: "flex-end" }}
                    >
                      {blockSaving
                        ? "Blocking…"
                        : blockMode === "single"
                          ? "Block Day"
                          : blockMode === "range"
                            ? "Block Range"
                            : "Block Month"}
                    </button>
                  </div>
                  {blockError && (
                    <div className="adm-form-msg error">{blockError}</div>
                  )}
                  {blockSuccess && (
                    <div className="adm-form-msg success">{blockSuccess}</div>
                  )}
                </form>
              </div>

              {/* Airbnb iCal Sync */}
              <div className="adm-form-card">
                <h3>Airbnb iCal Sync</h3>
                <form onSubmit={syncIcal}>
                  <div className="adm-form-row">
                    <div className="adm-form-field">
                      <label>Property</label>
                      <select
                        className="adm-select"
                        value={icalForm.property_name}
                        onChange={(e) =>
                          setIcalForm((f) => ({
                            ...f,
                            property_name: e.target.value,
                          }))
                        }
                      >
                        {PROPERTY_NAMES.map((n) => (
                          <option key={n} value={n}>
                            {n}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div
                      className="adm-form-field"
                      style={{ flex: 1, minWidth: 280 }}
                    >
                      <label>Airbnb iCal URL (.ics)</label>
                      <input
                        type="url"
                        placeholder="https://www.airbnb.com/calendar/ical/…"
                        value={icalForm.ical_url}
                        onChange={(e) =>
                          setIcalForm((f) => ({
                            ...f,
                            ical_url: e.target.value,
                          }))
                        }
                        style={{ width: "100%" }}
                      />
                    </div>
                    <button
                      className="adm-btn adm-btn-save"
                      type="submit"
                      disabled={icalSyncing}
                      style={{
                        padding: "10px 24px",
                        alignSelf: "flex-end",
                        background: "#c9a84c",
                        color: "#fff",
                      }}
                    >
                      {icalSyncing ? "Syncing…" : "Sync Now"}
                    </button>
                  </div>
                  {icalError && (
                    <div className="adm-form-msg error">{icalError}</div>
                  )}
                  {icalSuccess && (
                    <div className="adm-form-msg success">{icalSuccess}</div>
                  )}
                </form>

                {/* Saved iCal URLs */}
                {Object.keys(icalUrls).length > 0 && (
                  <div style={{ marginTop: 20 }}>
                    <div
                      style={{
                        fontSize: "0.65rem",
                        fontWeight: 600,
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                        color: "#9098a9",
                        marginBottom: 10,
                      }}
                    >
                      Saved iCal URLs
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 8,
                      }}
                    >
                      {Object.entries(icalUrls).map(([prop, url]) => (
                        <div
                          key={prop}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                            padding: "10px 14px",
                            background: "#f9fafb",
                            borderRadius: 8,
                            border: "1px solid #eef0f4",
                          }}
                        >
                          <span
                            style={{
                              fontSize: "0.75rem",
                              fontWeight: 600,
                              color: "#1a1a2e",
                              minWidth: 140,
                            }}
                          >
                            {prop}
                          </span>
                          <span
                            style={{
                              fontSize: "0.7rem",
                              color: "#6b7280",
                              wordBreak: "break-all",
                              flex: 1,
                            }}
                          >
                            {url}
                          </span>
                          <button
                            type="button"
                            className="adm-btn adm-btn-save"
                            style={{
                              padding: "6px 16px",
                              whiteSpace: "nowrap",
                              background: "#c9a84c",
                            }}
                            disabled={icalSyncing}
                            onClick={async () => {
                              setIcalError("");
                              setIcalSuccess("");
                              setIcalSyncing(true);
                              try {
                                const r = await api("/blocked-dates", {
                                  method: "POST",
                                  body: JSON.stringify({
                                    action: "sync-ical",
                                    property_name: prop,
                                    ical_url: url,
                                  }),
                                });
                                const d = await r.json();
                                if (!r.ok) {
                                  setIcalError(d.error ?? "Sync failed.");
                                  return;
                                }
                                setIcalSuccess(d.message ?? "Sync complete.");
                                await fetchBlockedDates();
                              } finally {
                                setIcalSyncing(false);
                              }
                            }}
                          >
                            Re-sync
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="adm-section-head">
                <div className="adm-section-title">Blocked Dates</div>
                <div className="adm-filters">
                  <select
                    className="adm-select"
                    value={blockPropFilter}
                    onChange={(e) => setBlockPropFilter(e.target.value)}
                  >
                    <option value="all">All Properties</option>
                    {PROPERTY_NAMES.map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                  <button
                    className="adm-filter-btn"
                    onClick={fetchBlockedDates}
                  >
                    ↺ Refresh
                  </button>
                </div>
              </div>

              {blockLoading ? (
                <div className="adm-loading">Loading blocked dates…</div>
              ) : blockedDates.length === 0 ? (
                <div className="adm-loading">No blocked dates found.</div>
              ) : (
                <div className="adm-table-wrap">
                  <table className="adm-table">
                    <thead>
                      <tr>
                        <th>Property</th>
                        <th>Blocked Date</th>
                        <th>Reason</th>
                        <th>Blocked On</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {blockedDates.map((b) => (
                        <tr key={b.id}>
                          <td>{b.property_name}</td>
                          <td>{fmt(b.blocked_date)}</td>
                          <td>
                            <span className="badge badge-default">
                              {b.reason.replace("_", " ")}
                            </span>
                          </td>
                          <td style={{ fontSize: "0.68rem", color: "#aaaaaa" }}>
                            {fmt(b.created_at)}
                          </td>
                          <td>
                            <button
                              className="adm-btn adm-btn-remove"
                              onClick={() => unblockDate(b.id)}
                            >
                              Unblock
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          {/* ── PRICING TIERS ────────────────────────────── */}
          {activeTab === "seasonal-pricing" && (
            <>
              <style>{`
                .pricing-wrap { background: #fff; border: 1px solid #eef0f4; border-radius: 16px; padding: 28px; box-shadow: 0 1px 4px rgba(0,0,0,0.06); margin-bottom: 24px; }
                .pricing-header { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; flex-wrap: wrap; }
                .pricing-select { font-family: 'Inter', sans-serif; padding: 8px 12px; border: 1.5px solid #e5e7eb; border-radius: 8px; background: #fff; color: #1a1a2e; cursor: pointer; }
                .pricing-select:focus { outline: none; border-color: #c9a84c; }
                .pricing-tier { background: #f5f6fa; border: 1.5px solid #c9a84c; border-radius: 12px; padding: 24px; margin-bottom: 20px; }
                .pricing-tier-title { font-family: 'Playfair Display', serif; font-size: 1.1rem; font-weight: 700; color: #1a1a2e; margin-bottom: 16px; text-transform: capitalize; }
                .pricing-form { display: grid; gap: 16px; }
                .pricing-row { display: grid; grid-template-columns: 1fr 1fr 1fr auto; gap: 12px; align-items: flex-end; }
                @media (max-width: 900px) { .pricing-row { grid-template-columns: 1fr 1fr; } }
                .pricing-field { display: flex; flex-direction: column; gap: 5px; }
                .pricing-field label { font-size: 0.6rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: #9098a9; }
                .pricing-field input { background: #fff; border: 1.5px solid #e5e7eb; border-radius: 8px; padding: 9px 12px; font-family: 'Inter', sans-serif; font-size: 0.85rem; color: #1a1a2e; outline: none; }
                .pricing-field input:focus { border-color: #c9a84c; }
                .pricing-btn { padding: 9px 20px; font-family: 'Inter', sans-serif; font-size: 0.7rem; font-weight: 600; letter-spacing: 0.04em; background: #1a1a2e; color: #fff; border: none; border-radius: 8px; cursor: pointer; transition: background 0.18s; }
                .pricing-btn:hover { background: #2a2a3e; }
                .pricing-btn:disabled { background: #ccc; cursor: not-allowed; }
                .pricing-list { margin-top: 16px; border-top: 1px solid #e5e7eb; padding-top: 16px; }
                .pricing-list-item { display: flex; justify-content: space-between; align-items: center; background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px 16px; margin-bottom: 8px; font-family: 'Inter', sans-serif; font-size: 0.85rem; }
                .pricing-list-label { color: #1a1a2e; font-weight: 600; }
                .pricing-list-value { color: #9098a9; margin-right: 12px; }
                .pricing-list-delete { background: #ef4444; color: #fff; border: none; padding: 5px 12px; border-radius: 6px; cursor: pointer; font-size: 0.7rem; font-weight: 600; transition: background 0.18s; }
                .pricing-list-delete:hover { background: #dc2626; }
                .adm-form-msg { padding: 12px 16px; border-radius: 8px; font-size: 0.85rem; font-family: 'Inter', sans-serif; }
                .adm-form-msg.success { background: #d1fae5; color: #065f46; border: 1px solid #a7f3d0; }
                .adm-form-msg.error { background: #fee2e2; color: #7f1d1d; border: 1px solid #fecaca; }
              `}</style>

              <div className="pricing-wrap">
                <div className="pricing-header">
                  <label
                    htmlFor="pricing-shelter"
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: "700",
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: "#9098a9",
                    }}
                  >
                    Select Property
                  </label>
                  <select
                    id="pricing-shelter"
                    className="pricing-select"
                    value={pricingShelter}
                    onChange={(e) => {
                      setPricingShelter(e.target.value);
                      fetchPricingTiers(e.target.value);
                      setSingleDayDate("");
                      setSingleDayPrice("");
                      setSingleDayExtra("");
                    }}
                  >
                    {SHELTERS.map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                {pricingError && (
                  <div className="adm-form-msg error">{pricingError}</div>
                )}
                {pricingSuccess && (
                  <div className="adm-form-msg success">{pricingSuccess}</div>
                )}

                {/* SINGLE DAY PRICING */}
                <div className="pricing-tier">
                  <div className="pricing-tier-title">Single Day Pricing</div>
                  <div className="pricing-form">
                    <div className="pricing-row">
                      <div className="pricing-field">
                        <label>Date</label>
                        <input
                          type="date"
                          value={singleDayDate}
                          onChange={(e) => setSingleDayDate(e.target.value)}
                        />
                      </div>
                      <div className="pricing-field">
                        <label>Base Price</label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={singleDayPrice}
                          onChange={(e) => setSingleDayPrice(e.target.value)}
                          placeholder="0.00"
                        />
                      </div>
                      <div className="pricing-field">
                        <label>Extra Person Fee</label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={singleDayExtra}
                          onChange={(e) => setSingleDayExtra(e.target.value)}
                          placeholder="0.00"
                        />
                      </div>
                      <button
                        className="pricing-btn"
                        onClick={() => upsertPricingTier("single_day")}
                        disabled={pricingSaving}
                      >
                        {pricingSaving ? "Saving..." : "Save"}
                      </button>
                    </div>
                  </div>
                  <div className="pricing-list">
                    {pricingTiers
                      .filter(
                        (t) =>
                          t.tier_type === "single_day" &&
                          t.property_name === pricingShelter,
                      )
                      .map((tier) => (
                        <div key={tier.id} className="pricing-list-item">
                          <div>
                            <span className="pricing-list-label">
                              {tier.specific_date}:
                            </span>
                            <span className="pricing-list-value">
                              {formatPrice(tier.base_price)}
                              {tier.extra_person_fee &&
                                ` + ${formatPrice(tier.extra_person_fee)}/person`}
                            </span>
                          </div>
                          <button
                            className="pricing-list-delete"
                            onClick={() => deletePricingTier(tier.id)}
                          >
                            Delete
                          </button>
                        </div>
                      ))}
                  </div>
                </div>

                {/* WEEKEND PRICING */}
                <div className="pricing-tier">
                  <div className="pricing-tier-title">Weekend Pricing</div>
                  <div className="pricing-form">
                    <div className="pricing-row">
                      <div className="pricing-field">
                        <label>Base Price</label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={weekendPrice}
                          onChange={(e) => setWeekendPrice(e.target.value)}
                          placeholder="0.00"
                        />
                      </div>
                      <div className="pricing-field">
                        <label>Extra Person Fee</label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={weekendExtra}
                          onChange={(e) => setWeekendExtra(e.target.value)}
                          placeholder="0.00"
                        />
                      </div>
                      <div></div>
                      <button
                        className="pricing-btn"
                        onClick={() => upsertPricingTier("weekend")}
                        disabled={pricingSaving}
                      >
                        {pricingSaving ? "Saving..." : "Save"}
                      </button>
                    </div>
                  </div>
                  <div className="pricing-list">
                    {pricingTiers
                      .filter(
                        (t) =>
                          t.tier_type === "weekend" &&
                          t.property_name === pricingShelter,
                      )
                      .map((tier) => (
                        <div key={tier.id} className="pricing-list-item">
                          <div>
                            <span className="pricing-list-label">
                              Weekend Rate:
                            </span>
                            <span className="pricing-list-value">
                              {formatPrice(tier.base_price)}
                              {tier.extra_person_fee &&
                                ` + ${formatPrice(tier.extra_person_fee)}/person`}
                            </span>
                          </div>
                          <button
                            className="pricing-list-delete"
                            onClick={() => deletePricingTier(tier.id)}
                          >
                            Delete
                          </button>
                        </div>
                      ))}
                  </div>
                </div>

                {/* YEARLY PRICING */}
                <div className="pricing-tier">
                  <div className="pricing-tier-title">Yearly Pricing</div>
                  <div className="pricing-form">
                    <div className="pricing-row">
                      <div className="pricing-field">
                        <label>Base Price</label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={yearlyPrice}
                          onChange={(e) => setYearlyPrice(e.target.value)}
                          placeholder="0.00"
                        />
                      </div>
                      <div className="pricing-field">
                        <label>Extra Person Fee</label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={yearlyExtra}
                          onChange={(e) => setYearlyExtra(e.target.value)}
                          placeholder="0.00"
                        />
                      </div>
                      <div></div>
                      <button
                        className="pricing-btn"
                        onClick={() => upsertPricingTier("yearly")}
                        disabled={pricingSaving}
                      >
                        {pricingSaving ? "Saving..." : "Save"}
                      </button>
                    </div>
                  </div>
                  <div className="pricing-list">
                    {pricingTiers
                      .filter(
                        (t) =>
                          t.tier_type === "yearly" &&
                          t.property_name === pricingShelter,
                      )
                      .map((tier) => (
                        <div key={tier.id} className="pricing-list-item">
                          <div>
                            <span className="pricing-list-label">
                              Yearly Rate:
                            </span>
                            <span className="pricing-list-value">
                              {formatPrice(tier.base_price)}
                              {tier.extra_person_fee &&
                                ` + ${formatPrice(tier.extra_person_fee)}/person`}
                            </span>
                          </div>
                          <button
                            className="pricing-list-delete"
                            onClick={() => deletePricingTier(tier.id)}
                          >
                            Delete
                          </button>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === "pricing-calendar" && <PricingCalendarTab />}

          {activeTab === "users" && (
            <>
              <div className="adm-section">
                <div className="adm-section-title">Create Admin User</div>
                <form onSubmit={createUser}>
                  <div className="adm-form-row">
                    <div className="adm-form-field">
                      <label>Username</label>
                      <input
                        type="text"
                        placeholder="e.g. manager"
                        value={userForm.username}
                        onChange={(e) =>
                          setUserForm((f) => ({
                            ...f,
                            username: e.target.value,
                          }))
                        }
                        required
                      />
                    </div>
                    <div className="adm-form-field">
                      <label>Password (min 8 chars)</label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={userForm.password}
                        onChange={(e) =>
                          setUserForm((f) => ({
                            ...f,
                            password: e.target.value,
                          }))
                        }
                        required
                      />
                    </div>
                    <button
                      className="adm-btn adm-btn-save"
                      type="submit"
                      disabled={userSaving}
                      style={{ padding: "10px 24px", alignSelf: "flex-end" }}
                    >
                      {userSaving ? "…" : "Create User"}
                    </button>
                  </div>
                  {userError && (
                    <div className="adm-form-msg error">{userError}</div>
                  )}
                  {userSuccess && (
                    <div className="adm-form-msg success">{userSuccess}</div>
                  )}
                </form>
              </div>

              <div className="adm-section">
                <div className="adm-section-title">Admin Users</div>
                {usersLoading ? (
                  <div className="adm-empty">Loading…</div>
                ) : users.length === 0 ? (
                  <div className="adm-empty">No users yet.</div>
                ) : (
                  <div className="adm-table-wrap">
                    <table className="adm-table">
                      <thead>
                        <tr>
                          <th>Username</th>
                          <th>Created</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((u) => (
                          <tr key={u.id}>
                            <td>{u.username}</td>
                            <td>{fmt(u.created_at)}</td>
                            <td>
                              <button
                                className="adm-btn adm-btn-cancel"
                                onClick={() => deleteUser(u.id, u.username)}
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default AdminDashboardPage;
