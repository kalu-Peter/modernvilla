import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { VILLAS } from "../types";
import type { AdminReservation, BlockedDate, SeasonalPricingRule } from "../types";
import { useCurrency, SUPPORTED_CURRENCIES } from "../context/CurrencyContext";

type Tab = "reservations" | "blocked-dates" | "seasonal-pricing" | "currencies" | "users";
type ResFilter = "all" | "pending" | "confirmed" | "cancelled";

const PROPERTY_NAMES = VILLAS.map((v) => v.name);

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
    () => localStorage.getItem("adminLastSeenAt") ?? new Date(0).toISOString()
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

  const fetchReservations = useCallback(async (markSeen = false) => {
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
  }, [api]); // eslint-disable-line

  // ── Blocked Dates ─────────────────────────────────────────────────────────
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [blockLoading, setBlockLoading] = useState(false);
  const [blockPropFilter, setBlockPropFilter] = useState("all");
  const [blockMode, setBlockMode] = useState<"single" | "range" | "month">("single");
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
  const [icalForm, setIcalForm] = useState({ property_name: PROPERTY_NAMES[0] ?? "", ical_url: "" });
  const [icalSyncing, setIcalSyncing] = useState(false);
  const [icalError, setIcalError] = useState("");
  const [icalSuccess, setIcalSuccess] = useState("");

  const fetchIcalUrls = useCallback(async () => {
    const res = await api("/blocked-dates?action=ical-urls");
    if (res.ok) setIcalUrls(await res.json());
  }, [api]);

  const syncIcal = async (e: React.FormEvent) => {
    e.preventDefault();
    setIcalError(""); setIcalSuccess("");
    if (!icalForm.ical_url.trim()) { setIcalError("Please enter an iCal URL."); return; }
    setIcalSyncing(true);
    try {
      const res = await api("/blocked-dates", {
        method: "POST",
        body: JSON.stringify({ action: "sync-ical", property_name: icalForm.property_name, ical_url: icalForm.ical_url.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setIcalError(data.error ?? "Sync failed."); return; }
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
      const param = blockPropFilter !== "all" ? `?property=${encodeURIComponent(blockPropFilter)}` : "";
      const res = await api(`/blocked-dates${param}`);
      if (res.ok) setBlockedDates(await res.json());
    } finally {
      setBlockLoading(false);
    }
  }, [api, blockPropFilter]);


  // ── Seasonal Pricing ──────────────────────────────────────────────────────
  const [seasonalRules, setSeasonalRules] = useState<SeasonalPricingRule[]>([]);

  const [seasonalVilla, setSeasonalVilla] = useState(VILLAS[0].id);
  const [calEditRule, setCalEditRule] = useState<SeasonalPricingRule | null>(null);

  // ── Calendar pricing UI ───────────────────────────────────────────────────
  const now = new Date();
  const [calYear,  setCalYear]  = useState(now.getFullYear());
  const [calMonth, setCalMonth] = useState(now.getMonth()); // 0-indexed
  type CalMode = "single" | "range" | "weekends" | "fullmonth";
  const [calMode,       setCalMode]       = useState<CalMode>("range");
  const [calRangeStart, setCalRangeStart] = useState<string | null>(null);
  const [calRangeEnd,   setCalRangeEnd]   = useState<string | null>(null);
  const [calHover,      setCalHover]      = useState<string | null>(null);
  const [calLabel,      setCalLabel]      = useState("");
  const [calPrice,      setCalPrice]      = useState("");
  const [calSaving,     setCalSaving]     = useState(false);
  const [calError,      setCalError]      = useState("");
  const [calSuccess,    setCalSuccess]    = useState("");

  const calDateStr = (y: number, m: number, d: number) =>
    `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

  const calPriceForDate = (dateStr: string): SeasonalPricingRule | null =>
    seasonalRules.find(r =>
      r.villa_id === seasonalVilla &&
      dateStr >= r.start_date.slice(0, 10) &&
      dateStr <= r.end_date.slice(0, 10)
    ) ?? null;

  const isInCalSelection = (dateStr: string): boolean => {
    if (!calRangeStart) return false;
    const tentativeEnd = calRangeEnd ?? (calMode === "range" && !calRangeEnd ? calHover : null) ?? calRangeStart;
    const [s, e] = calRangeStart <= tentativeEnd ? [calRangeStart, tentativeEnd] : [tentativeEnd, calRangeStart];
    return dateStr >= s && dateStr <= e;
  };

  const getWeekendsInMonth = (y: number, m: number) => {
    const weekends: Array<{ start: string; end: string }> = [];
    const days = new Date(y, m + 1, 0).getDate();
    for (let d = 1; d <= days; d++) {
      const dow = new Date(y, m, d).getDay(); // 0=Sun, 6=Sat
      if (dow === 6) {
        const sat = calDateStr(y, m, d);
        const sun = calDateStr(y, m, d + 1 <= days ? d + 1 : d);
        weekends.push({ start: sat, end: d + 1 <= days ? sun : sat });
      } else if (dow === 0 && d === 1) {
        // Month starts on Sunday — lone Sunday
        weekends.push({ start: calDateStr(y, m, d), end: calDateStr(y, m, d) });
      }
    }
    return weekends;
  };

  const weekendDatesInMonth = (y: number, m: number): string[] => {
    const days = new Date(y, m + 1, 0).getDate();
    const result: string[] = [];
    for (let d = 1; d <= days; d++) {
      const dow = new Date(y, m, d).getDay();
      if (dow === 0 || dow === 6) result.push(calDateStr(y, m, d));
    }
    return result;
  };

  const isWeekendSelected = (dateStr: string) =>
    calMode === "weekends" && weekendDatesInMonth(calYear, calMonth).includes(dateStr);

  const isFullMonthSelected = (dateStr: string) => {
    if (calMode !== "fullmonth") return false;
    const start = calDateStr(calYear, calMonth, 1);
    const end   = calDateStr(calYear, calMonth, new Date(calYear, calMonth + 1, 0).getDate());
    return dateStr >= start && dateStr <= end;
  };

  const handleCalDayClick = (dateStr: string) => {
    setCalError(""); setCalSuccess("");
    if (calMode === "single") {
      setCalRangeStart(dateStr); setCalRangeEnd(dateStr);
      const rule = calPriceForDate(dateStr);
      if (rule) {
        setCalEditRule(rule);
        setCalLabel(rule.label);
        const rate = rates[currency.code] ?? 1;
        setCalPrice(String(Math.round(Number(rule.price_per_night) * rate * 100) / 100));
      } else {
        setCalEditRule(null);
        setCalLabel(""); setCalPrice("");
      }
    } else if (calMode === "range") {
      setCalEditRule(null);
      if (!calRangeStart || calRangeEnd) {
        setCalRangeStart(dateStr); setCalRangeEnd(null);
      } else {
        const [s, e] = dateStr >= calRangeStart ? [calRangeStart, dateStr] : [dateStr, calRangeStart];
        setCalRangeStart(s); setCalRangeEnd(e);
      }
    }
  };

  const panelVisible =
    (calMode === "single"    && calRangeStart !== null) ||
    (calMode === "range"     && calRangeStart !== null && calRangeEnd !== null) ||
    (calMode === "weekends"  ) ||
    (calMode === "fullmonth" );

  const saveCalendarRule = async () => {
    const priceInCurrency = parseFloat(calPrice);
    if (isNaN(priceInCurrency) || priceInCurrency <= 0) { setCalError("Enter a valid price per night."); return; }
    // Always store in KES (base currency); convert from selected currency
    const rate = rates[currency.code] ?? 1;
    const price = Math.round(priceInCurrency / rate);
    setCalSaving(true); setCalError(""); setCalSuccess("");
    try {
      if (calMode === "single" && calEditRule) {
        // Update existing rule
        const res  = await api(`/seasonal-pricing/${calEditRule.id}`, { method: "PUT", body: JSON.stringify({ label: calLabel || calEditRule.label, price_per_night: price }) });
        const data = await res.json();
        if (!res.ok) { setCalError(data.error ?? "Failed to update."); return; }
        setSeasonalRules(prev => prev.map(r => r.id === calEditRule.id ? { ...r, label: data.label, price_per_night: data.price_per_night } : r));
      } else if (calMode === "weekends") {
        const weekends = getWeekendsInMonth(calYear, calMonth);
        if (weekends.length === 0) { setCalError("No weekends found in this month."); return; }
        const updatedRules = [...seasonalRules];
        for (const { start, end } of weekends) {
          const existing = seasonalRules.find(r => r.start_date.slice(0, 10) === start && r.end_date.slice(0, 10) === end);
          if (existing) {
            const res  = await api(`/seasonal-pricing/${existing.id}`, { method: "PUT", body: JSON.stringify({ label: calLabel || "Weekend Rate", price_per_night: price }) });
            const data = await res.json();
            if (!res.ok) { setCalError(data.error ?? "Failed to update weekend rule."); return; }
            const idx = updatedRules.findIndex(r => r.id === existing.id);
            if (idx !== -1) updatedRules[idx] = { ...updatedRules[idx], label: data.label, price_per_night: data.price_per_night };
          } else {
            const res  = await api("/seasonal-pricing", { method: "POST", body: JSON.stringify({ villa_id: seasonalVilla, label: calLabel || "Weekend Rate", start_date: start, end_date: end, price_per_night: price }) });
            const data = await res.json();
            if (!res.ok) { setCalError(data.error ?? "Failed to save weekend rule."); return; }
            updatedRules.push(data);
          }
        }
        setSeasonalRules(updatedRules);
      } else if (calMode === "fullmonth") {
        const start = calDateStr(calYear, calMonth, 1);
        const end   = calDateStr(calYear, calMonth, new Date(calYear, calMonth + 1, 0).getDate());
        const existing = seasonalRules.find(r => r.start_date.slice(0, 10) === start && r.end_date.slice(0, 10) === end);
        if (existing) {
          const res  = await api(`/seasonal-pricing/${existing.id}`, { method: "PUT", body: JSON.stringify({ label: calLabel || "Monthly Rate", price_per_night: price }) });
          const data = await res.json();
          if (!res.ok) { setCalError(data.error ?? "Failed to update."); return; }
          setSeasonalRules(prev => prev.map(r => r.id === existing.id ? { ...r, label: data.label, price_per_night: data.price_per_night } : r));
        } else {
          const res  = await api("/seasonal-pricing", { method: "POST", body: JSON.stringify({ villa_id: seasonalVilla, label: calLabel || "Monthly Rate", start_date: start, end_date: end, price_per_night: price }) });
          const data = await res.json();
          if (!res.ok) { setCalError(data.error ?? "Failed to save."); return; }
          setSeasonalRules(prev => [...prev, data]);
        }
      } else {
        // range or new single day
        const end = calRangeEnd ?? calRangeStart!;
        const existing = seasonalRules.find(r => r.start_date.slice(0, 10) === calRangeStart! && r.end_date.slice(0, 10) === end);
        if (existing) {
          const res  = await api(`/seasonal-pricing/${existing.id}`, { method: "PUT", body: JSON.stringify({ label: calLabel || existing.label, price_per_night: price }) });
          const data = await res.json();
          if (!res.ok) { setCalError(data.error ?? "Failed to update."); return; }
          setSeasonalRules(prev => prev.map(r => r.id === existing.id ? { ...r, label: data.label, price_per_night: data.price_per_night } : r));
        } else {
          const res  = await api("/seasonal-pricing", { method: "POST", body: JSON.stringify({ villa_id: seasonalVilla, label: calLabel || "Custom Rate", start_date: calRangeStart!, end_date: end, price_per_night: price }) });
          const data = await res.json();
          if (!res.ok) { setCalError(data.error ?? "Failed to save."); return; }
          setSeasonalRules(prev => [...prev, data]);
        }
      }
      setCalSuccess(calEditRule ? "Rule updated." : "Pricing rule saved.");
      setCalRangeStart(null); setCalRangeEnd(null); setCalPrice(""); setCalLabel(""); setCalEditRule(null);
    } finally {
      setCalSaving(false);
    }
  };

  const deleteCalRule = async (id: number) => {
    if (!window.confirm("Delete this pricing rule?")) return;
    await api(`/seasonal-pricing/${id}`, { method: "DELETE" });
    setSeasonalRules(prev => prev.filter(r => r.id !== id));
    setCalRangeStart(null); setCalRangeEnd(null); setCalPrice(""); setCalLabel(""); setCalEditRule(null);
  };

  const abbrevPrice = (kes: number) => {
    const rate = rates[currency.code] ?? 1;
    const n = kes * rate;
    const num = n >= 1000 ? `${(n / 1000 % 1 === 0 ? (n / 1000).toFixed(0) : (n / 1000).toFixed(1))}k` : String(Math.round(n));
    return `${currency.symbol}${num}`;
  };

  const fetchSeasonalPricing = useCallback(async (villaId: string) => {
    const res = await api(`/seasonal-pricing?villa_id=${encodeURIComponent(villaId)}`);
    if (res.ok) setSeasonalRules(await res.json());
  }, [api]);

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
      const res = await api("/users");
      if (res.ok) setUsers(await res.json());
    } finally {
      setUsersLoading(false);
    }
  }, [api]);

  const createUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserError(""); setUserSuccess("");
    if (!userForm.username || !userForm.password) { setUserError("Both fields are required."); return; }
    setUserSaving(true);
    try {
      const res = await api("/users", { method: "POST", body: JSON.stringify(userForm) });
      const data = await res.json();
      if (!res.ok) { setUserError(data.error ?? "Failed to create user."); return; }
      setUserSuccess(`User "${data.user.username}" created.`);
      setUserForm({ username: "", password: "" });
      await fetchUsers();
    } finally {
      setUserSaving(false);
    }
  };

  const deleteUser = async (id: string, username: string) => {
    if (!window.confirm(`Delete user "${username}"?`)) return;
    await api(`/users?id=${id}`, { method: "DELETE" });
    await fetchUsers();
  };

  // ── Load on tab switch ────────────────────────────────────────────────────
  useEffect(() => {
    if (activeTab === "reservations") fetchReservations(true);
    if (activeTab === "blocked-dates") { fetchBlockedDates(); fetchIcalUrls(); }
    if (activeTab === "seasonal-pricing") fetchSeasonalPricing(seasonalVilla);
    if (activeTab === "users") fetchUsers();
  }, [activeTab, fetchReservations, fetchBlockedDates, fetchIcalUrls, fetchSeasonalPricing, fetchUsers, seasonalVilla]);

  useEffect(() => {
    if (activeTab === "blocked-dates") fetchBlockedDates();
  }, [blockPropFilter]); // eslint-disable-line

  // ── Actions ───────────────────────────────────────────────────────────────
  const confirmReservation = async (id: string) => {
    setActionLoading(id + "-confirm");
    try {
      await api(`/reservations/${id}`, { method: "PUT", body: JSON.stringify({ action: "confirm" }) });
      await fetchReservations();
    } finally {
      setActionLoading(null);
    }
  };

  const cancelReservation = async (id: string) => {
    if (!window.confirm("Cancel this reservation?")) return;
    setActionLoading(id + "-cancel");
    try {
      await api(`/reservations/${id}`, { method: "PUT", body: JSON.stringify({ action: "cancel" }) });
      await fetchReservations();
    } finally {
      setActionLoading(null);
    }
  };

  const unblockDate = async (id: number) => {
    if (!window.confirm("Unblock this date?")) return;
    await api(`/blocked-dates/${id}`, { method: "DELETE" });
    await fetchBlockedDates();
  };

  const submitBlockDate = async (e: React.FormEvent) => {
    e.preventDefault();
    setBlockError(""); setBlockSuccess("");

    let start_date = "", end_date = "";

    if (blockMode === "single") {
      if (!blockForm.single_date) { setBlockError("Please select a date."); return; }
      start_date = blockForm.single_date;
      end_date = blockForm.single_date;
    } else if (blockMode === "range") {
      if (!blockForm.start_date || !blockForm.end_date) { setBlockError("Please select both start and end dates."); return; }
      if (blockForm.end_date < blockForm.start_date) { setBlockError("End date must be after start date."); return; }
      start_date = blockForm.start_date;
      end_date = blockForm.end_date;
    } else {
      if (!blockForm.month) { setBlockError("Please select a month."); return; }
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
        body: JSON.stringify({ property_name: blockForm.property_name, start_date, end_date, reason: blockForm.reason }),
      });
      const data = await res.json();
      if (!res.ok) { setBlockError(data.error ?? "Failed to block dates."); return; }
      setBlockSuccess(data.message ?? "Dates blocked successfully.");
      setBlockForm((f) => ({ ...f, single_date: "", start_date: "", end_date: "", month: "" }));
      await fetchBlockedDates();
    } finally {
      setBlockSaving(false);
    }
  };

  // ── Derived ───────────────────────────────────────────────────────────────
  const filteredReservations = reservations.filter((r) => {
    const matchProp = resPropFilter === "all" || r.property_name === resPropFilter;
    const matchStatus =
      resFilter === "all" ||
      (resFilter === "confirmed" && r.confirmed && !r.cancelled) ||
      (resFilter === "cancelled" && r.cancelled) ||
      (resFilter === "pending" && !r.confirmed && !r.cancelled);
    return matchProp && matchStatus;
  });

  const newCount = reservations.filter(
    (r) => new Date(r.created_at) > new Date(lastSeenAt)
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

  const fmt = (d: string) => new Date(d).toLocaleDateString("en-KE", { day: "2-digit", month: "short", year: "numeric" });

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
          <div className="adm-topbar-logo">Croc<span>odile</span> Lodge</div>
          <div className="adm-topbar-right">
            <div className="adm-topbar-user">
              Signed in as <strong>{adminUser}</strong>
            </div>
            <select
              className="adm-currency-select"
              value={currency.code}
              onChange={(e) => {
                const found = SUPPORTED_CURRENCIES.find((c) => c.code === e.target.value);
                if (found) setCurrency(found);
              }}
              aria-label="Select currency"
            >
              {SUPPORTED_CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>{c.symbol} {c.code}</option>
              ))}
            </select>
            <button className="adm-logout" onClick={logout}>Sign Out</button>
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
            <div className="adm-stat-value" style={{ color: "#10b981" }}>{stats.confirmed}</div>
          </div>
          <div className="adm-stat">
            <div className="adm-stat-label">Pending</div>
            <div className="adm-stat-value" style={{ color: "#eab308" }}>{stats.pending}</div>
          </div>
          <div className="adm-stat">
            <div className="adm-stat-label">Cancelled</div>
            <div className="adm-stat-value" style={{ color: "#ef4444" }}>{stats.cancelled}</div>
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
          {(["reservations", "blocked-dates", "seasonal-pricing", "users"] as Tab[]).map((t) => (
            <button
              key={t}
              className={`adm-tab${activeTab === t ? " active" : ""}`}
              onClick={() => {
                setActiveTab(t);
                if (t === "reservations") markReservationsSeen();
              }}
            >
              <span className="adm-tab-wrap">
                {t === "reservations" ? "Reservations"
                  : t === "blocked-dates" ? "Blocked Dates"
                  : t === "seasonal-pricing" ? "Pricing"
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
                    {PROPERTY_NAMES.map((n) => <option key={n} value={n}>{n}</option>)}
                  </select>
                  {(["all", "pending", "confirmed", "cancelled"] as ResFilter[]).map((f) => (
                    <button
                      key={f}
                      className={`adm-filter-btn${resFilter === f ? " active" : ""}`}
                      onClick={() => setResFilter(f)}
                    >
                      {f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                  ))}
                  <button className="adm-filter-btn" onClick={() => fetchReservations()}>↺ Refresh</button>
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
                        const status = r.cancelled ? "cancelled" : r.confirmed ? "confirmed" : "pending";
                        return (
                          <tr key={r.id}>
                            <td style={{ fontFamily: "monospace", fontSize: "0.7rem", color: "#aaaaaa" }}>
                              {r.id.slice(0, 8)}…
                            </td>
                            <td>{r.property_name}</td>
                            <td>
                              <div>{r.name}</div>
                              <div style={{ fontSize: "0.65rem", color: "#aaaaaa" }}>{r.email}</div>
                            </td>
                            <td>{r.phone}</td>
                            <td style={{ textAlign: "center" }}>{r.guests}</td>
                            <td>{fmt(r.checkin)}</td>
                            <td>{fmt(r.checkout)}</td>
                            <td>{formatPrice(Number(r.total_price))}</td>
                            <td>
                              <span className={`badge badge-${r.payment_status === "paid" ? "paid" : r.payment_status === "failed" ? "failed" : "default"}`}>
                                {r.payment_status}
                              </span>
                              {r.amount_paid != null && (
                                <div style={{ fontSize: "0.7rem", color: "#059669", marginTop: 3, fontWeight: 600 }}>
                                  {formatPrice(Number(r.amount_paid))} deposited
                                </div>
                              )}
                            </td>
                            <td>
                              <span className={`badge badge-${status}`}>{status}</span>
                            </td>
                            <td style={{ fontSize: "0.68rem", color: "#aaaaaa" }}>
                              {fmt(r.created_at)}
                            </td>
                            <td>
                              <div style={{ display: "flex", gap: 8 }}>
                                <button
                                  className="adm-btn adm-btn-confirm"
                                  disabled={r.confirmed || r.cancelled || actionLoading === r.id + "-confirm"}
                                  onClick={() => confirmReservation(r.id)}
                                >
                                  {actionLoading === r.id + "-confirm" ? "…" : "Confirm"}
                                </button>
                                <button
                                  className="adm-btn adm-btn-cancel"
                                  disabled={r.cancelled || actionLoading === r.id + "-cancel"}
                                  onClick={() => cancelReservation(r.id)}
                                >
                                  {actionLoading === r.id + "-cancel" ? "…" : "Cancel"}
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
                      {m === "single" ? "Single Day" : m === "range" ? "Date Range" : "Whole Month"}
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
                        onChange={(e) => setBlockForm((f) => ({ ...f, property_name: e.target.value }))}
                      >
                        {PROPERTY_NAMES.map((n) => <option key={n} value={n}>{n}</option>)}
                      </select>
                    </div>

                    {blockMode === "single" && (
                      <div className="adm-form-field">
                        <label>Date</label>
                        <input
                          type="date"
                          value={blockForm.single_date}
                          min={new Date().toISOString().split("T")[0]}
                          onChange={(e) => setBlockForm((f) => ({ ...f, single_date: e.target.value }))}
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
                            onChange={(e) => setBlockForm((f) => ({ ...f, start_date: e.target.value }))}
                          />
                        </div>
                        <div className="adm-form-field">
                          <label>End Date</label>
                          <input
                            type="date"
                            value={blockForm.end_date}
                            min={blockForm.start_date || new Date().toISOString().split("T")[0]}
                            onChange={(e) => setBlockForm((f) => ({ ...f, end_date: e.target.value }))}
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
                          onChange={(e) => setBlockForm((f) => ({ ...f, month: e.target.value }))}
                        />
                      </div>
                    )}

                    <div className="adm-form-field">
                      <label>Reason</label>
                      <select
                        value={blockForm.reason}
                        onChange={(e) => setBlockForm((f) => ({ ...f, reason: e.target.value }))}
                        style={{ background: "#ffffff", border: "1px solid #e0e0e0", color: "#1a1a1a", fontFamily: "'Josefin Sans', sans-serif", fontSize: "0.8rem", padding: "10px 14px", outline: "none", minWidth: 160 }}
                      >
                        <option value="manual_block">Manual Block</option>
                        <option value="maintenance">Maintenance</option>
                        <option value="owner_stay">Owner Stay</option>
                      </select>
                    </div>

                    <button className="adm-btn adm-btn-save" type="submit" disabled={blockSaving} style={{ padding: "10px 24px", alignSelf: "flex-end" }}>
                      {blockSaving ? "Blocking…" : blockMode === "single" ? "Block Day" : blockMode === "range" ? "Block Range" : "Block Month"}
                    </button>
                  </div>
                  {blockError   && <div className="adm-form-msg error">{blockError}</div>}
                  {blockSuccess && <div className="adm-form-msg success">{blockSuccess}</div>}
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
                        onChange={(e) => setIcalForm((f) => ({ ...f, property_name: e.target.value }))}
                      >
                        {PROPERTY_NAMES.map((n) => <option key={n} value={n}>{n}</option>)}
                      </select>
                    </div>
                    <div className="adm-form-field" style={{ flex: 1, minWidth: 280 }}>
                      <label>Airbnb iCal URL (.ics)</label>
                      <input
                        type="url"
                        placeholder="https://www.airbnb.com/calendar/ical/…"
                        value={icalForm.ical_url}
                        onChange={(e) => setIcalForm((f) => ({ ...f, ical_url: e.target.value }))}
                        style={{ width: "100%" }}
                      />
                    </div>
                    <button
                      className="adm-btn adm-btn-save"
                      type="submit"
                      disabled={icalSyncing}
                      style={{ padding: "10px 24px", alignSelf: "flex-end", background: "#c9a84c", color: "#fff" }}
                    >
                      {icalSyncing ? "Syncing…" : "Sync Now"}
                    </button>
                  </div>
                  {icalError   && <div className="adm-form-msg error">{icalError}</div>}
                  {icalSuccess && <div className="adm-form-msg success">{icalSuccess}</div>}
                </form>

                {/* Saved iCal URLs */}
                {Object.keys(icalUrls).length > 0 && (
                  <div style={{ marginTop: 20 }}>
                    <div style={{ fontSize: "0.65rem", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "#9098a9", marginBottom: 10 }}>
                      Saved iCal URLs
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {Object.entries(icalUrls).map(([prop, url]) => (
                        <div key={prop} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: "#f9fafb", borderRadius: 8, border: "1px solid #eef0f4" }}>
                          <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "#1a1a2e", minWidth: 140 }}>{prop}</span>
                          <span style={{ fontSize: "0.7rem", color: "#6b7280", wordBreak: "break-all", flex: 1 }}>{url}</span>
                          <button
                            type="button"
                            className="adm-btn adm-btn-save"
                            style={{ padding: "6px 16px", whiteSpace: "nowrap", background: "#c9a84c" }}
                            disabled={icalSyncing}
                            onClick={async () => {
                              setIcalError(""); setIcalSuccess("");
                              setIcalSyncing(true);
                              try {
                                const r = await api("/blocked-dates", {
                                  method: "POST",
                                  body: JSON.stringify({ action: "sync-ical", property_name: prop, ical_url: url }),
                                });
                                const d = await r.json();
                                if (!r.ok) { setIcalError(d.error ?? "Sync failed."); return; }
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
                    {PROPERTY_NAMES.map((n) => <option key={n} value={n}>{n}</option>)}
                  </select>
                  <button className="adm-filter-btn" onClick={fetchBlockedDates}>↺ Refresh</button>
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
                          <td style={{ fontSize: "0.68rem", color: "#aaaaaa" }}>{fmt(b.created_at)}</td>
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

          {/* ── SEASONAL PRICING CALENDAR ─────────────────── */}
          {activeTab === "seasonal-pricing" && (() => {
            const daysInMonth  = new Date(calYear, calMonth + 1, 0).getDate();
            const firstDow     = new Date(calYear, calMonth, 1).getDay();
            const firstDowMon  = firstDow === 0 ? 6 : firstDow - 1; // Mon=0
            const monthLabel   = new Date(calYear, calMonth, 1).toLocaleString("en-GB", { month: "long", year: "numeric" });
            const todayStr     = new Date().toISOString().split("T")[0];
            const DAYS         = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

            const cells: Array<string | null> = [
              ...Array(firstDowMon).fill(null),
              ...Array.from({ length: daysInMonth }, (_, i) => calDateStr(calYear, calMonth, i + 1)),
            ];

            const prevMonth = () => { if (calMonth === 0) { setCalYear(y => y - 1); setCalMonth(11); } else setCalMonth(m => m - 1); };
            const nextMonth = () => { if (calMonth === 11) { setCalYear(y => y + 1); setCalMonth(0); } else setCalMonth(m => m + 1); };

            const getDayState = (dateStr: string) => {
              const dow = new Date(dateStr).getDay();
              const isWeekend = dow === 0 || dow === 6;
              const rule = calPriceForDate(dateStr);
              const selected =
                (calMode === "single" || calMode === "range") ? isInCalSelection(dateStr) :
                calMode === "weekends" ? isWeekendSelected(dateStr) :
                isFullMonthSelected(dateStr);
              return { isWeekend, rule, selected };
            };

            const selectionLabel = () => {
              if (calMode === "weekends") return `All Weekends in ${new Date(calYear, calMonth).toLocaleString("en-GB", { month: "long", year: "numeric" })}`;
              if (calMode === "fullmonth") return monthLabel;
              if (!calRangeStart) return null;
              const end = calRangeEnd ?? calRangeStart;
              if (calRangeStart === end) return fmt(calRangeStart);
              return `${fmt(calRangeStart)} – ${fmt(end)}`;
            };

            return (
              <>
                <style>{`
                  .cal-wrap { background:#fff; border:1px solid #eef0f4; border-radius:16px; padding:28px; box-shadow:0 1px 4px rgba(0,0,0,0.06); margin-bottom:24px; }
                  .cal-topbar { display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:14px; margin-bottom:22px; }
                  .cal-nav { display:flex; align-items:center; gap:10px; }
                  .cal-nav-btn { background:none; border:1.5px solid #e5e7eb; border-radius:8px; width:34px; height:34px; cursor:pointer; font-size:0.9rem; color:#6b7280; transition:all 0.15s; display:flex; align-items:center; justify-content:center; }
                  .cal-nav-btn:hover { border-color:#c9a84c; color:#c9a84c; }
                  .cal-month-label { font-family:'Playfair Display',serif; font-size:1.1rem; color:#1a1a2e; min-width:180px; text-align:center; }
                  .cal-mode-bar { display:flex; gap:6px; flex-wrap:wrap; }
                  .cal-mode-btn { padding:7px 16px; font-family:'Inter',sans-serif; font-size:0.7rem; font-weight:600; letter-spacing:0.04em; border:1.5px solid #e5e7eb; border-radius:8px; background:#fff; color:#9098a9; cursor:pointer; transition:all 0.15s; }
                  .cal-mode-btn:hover { border-color:#c9a84c; color:#c9a84c; }
                  .cal-mode-btn.active { background:#1a1a2e; color:#fff; border-color:#1a1a2e; }
                  .cal-grid { display:grid; grid-template-columns:repeat(7,1fr); gap:5px; }
                  .cal-header-cell { text-align:center; font-family:'Inter',sans-serif; font-size:0.6rem; font-weight:700; letter-spacing:0.1em; text-transform:uppercase; color:#9098a9; padding:8px 0; }
                  .cal-header-cell.weekend-col { color:#c9a84c; }
                  .cal-day { min-height:56px; border-radius:10px; display:flex; flex-direction:column; align-items:center; justify-content:center; cursor:pointer; border:1.5px solid transparent; transition:all 0.12s; background:#fafbfc; padding:4px 2px; user-select:none; }
                  .cal-day:hover { border-color:#c9a84c; background:#fffbf0; }
                  .cal-day.weekend-day { background:#fffdf5; }
                  .cal-day.has-rule { background:#fef9ee; border-color:#f0d882; }
                  .cal-day.in-range { background:#eef1ff; border-color:#c7cde8; }
                  .cal-day.selected { background:#1a1a2e !important; border-color:#1a1a2e !important; }
                  .cal-day.today .cal-day-num::after { content:''; display:block; width:4px; height:4px; background:#c9a84c; border-radius:50%; margin:2px auto 0; }
                  .cal-day-num { font-family:'Inter',sans-serif; font-size:0.8rem; font-weight:600; color:#374151; line-height:1; }
                  .cal-day.selected .cal-day-num { color:#fff; }
                  .cal-day.in-range .cal-day-num { color:#3730a3; }
                  .cal-day-price { font-size:0.58rem; font-weight:700; color:#c9a84c; margin-top:3px; letter-spacing:0.02em; }
                  .cal-day.selected .cal-day-price { color:#c9a84c; }
                  .cal-panel { background:#f5f6fa; border:1.5px solid #c9a84c; border-radius:12px; padding:20px 24px; margin-top:20px; }
                  .cal-panel-title { font-family:'Inter',sans-serif; font-size:0.62rem; font-weight:700; letter-spacing:0.1em; text-transform:uppercase; color:#9098a9; margin-bottom:14px; }
                  .cal-panel-sel { font-family:'Playfair Display',serif; font-size:1rem; color:#1a1a2e; margin-bottom:16px; }
                  .cal-panel-row { display:flex; gap:12px; flex-wrap:wrap; align-items:flex-end; }
                  .cal-panel-field { display:flex; flex-direction:column; gap:5px; }
                  .cal-panel-field label { font-family:'Inter',sans-serif; font-size:0.6rem; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; color:#9098a9; }
                  .cal-panel-field input { background:#fff; border:1.5px solid #e5e7eb; border-radius:8px; padding:9px 12px; font-family:'Inter',sans-serif; font-size:0.85rem; color:#1a1a2e; outline:none; transition:border-color 0.15s; min-width:140px; }
                  .cal-panel-field input:focus { border-color:#c9a84c; }
                  .cal-legend { display:flex; gap:16px; flex-wrap:wrap; margin-top:16px; }
                  .cal-legend-item { display:flex; align-items:center; gap:6px; font-family:'Inter',sans-serif; font-size:0.68rem; color:#9098a9; }
                  .cal-legend-dot { width:10px; height:10px; border-radius:3px; flex-shrink:0; }
                `}</style>

                {/* ── Toolbar ── */}
                <div className="cal-wrap">
                  <div className="cal-topbar">
                    <div style={{ display:"flex", alignItems:"center", gap:16, flexWrap:"wrap" }}>
                      <select
                        className="adm-select"
                        value={seasonalVilla}
                        onChange={(e) => { setSeasonalVilla(e.target.value); fetchSeasonalPricing(e.target.value); setCalRangeStart(null); setCalRangeEnd(null); }}
                      >
                        {VILLAS.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
                      </select>
                      <div className="cal-nav">
                        <button className="cal-nav-btn" onClick={prevMonth}>‹</button>
                        <div className="cal-month-label">{monthLabel}</div>
                        <button className="cal-nav-btn" onClick={nextMonth}>›</button>
                      </div>
                    </div>
                    <div className="cal-mode-bar">
                      {([
                        { key: "single",    label: "Single Day" },
                        { key: "range",     label: "Date Range" },
                        { key: "weekends",  label: "All Weekends" },
                        { key: "fullmonth", label: "Full Month" },
                      ] as const).map(({ key, label }) => (
                        <button
                          key={key}
                          className={`cal-mode-btn${calMode === key ? " active" : ""}`}
                          onClick={() => {
                            setCalMode(key); setCalRangeStart(null); setCalRangeEnd(null);
                            setCalError(""); setCalSuccess(""); setCalEditRule(null);
                            // Pre-fill price from first existing rule for weekends/fullmonth
                            if (key === "weekends") {
                              const wDates = weekendDatesInMonth(calYear, calMonth);
                              const existing = seasonalRules.find(r => wDates.includes(r.start_date.slice(0, 10)));
                              if (existing) {
                                const rate = rates[currency.code] ?? 1;
                                setCalPrice(String(Math.round(Number(existing.price_per_night) * rate * 100) / 100));
                                setCalLabel(existing.label);
                              } else { setCalPrice(""); setCalLabel(""); }
                            } else if (key === "fullmonth") {
                              const start = calDateStr(calYear, calMonth, 1);
                              const end   = calDateStr(calYear, calMonth, new Date(calYear, calMonth + 1, 0).getDate());
                              const existing = seasonalRules.find(r => r.start_date.slice(0, 10) === start && r.end_date.slice(0, 10) === end);
                              if (existing) {
                                const rate = rates[currency.code] ?? 1;
                                setCalPrice(String(Math.round(Number(existing.price_per_night) * rate * 100) / 100));
                                setCalLabel(existing.label);
                              }
                              else { setCalPrice(""); setCalLabel(""); }
                            } else {
                              setCalPrice(""); setCalLabel("");
                            }
                          }}
                        >{label}</button>
                      ))}
                    </div>
                  </div>

                  {/* ── Calendar grid ── */}
                  <div className="cal-grid">
                    {DAYS.map((d, i) => (
                      <div key={d} className={`cal-header-cell${i >= 5 ? " weekend-col" : ""}`}>{d}</div>
                    ))}
                    {cells.map((dateStr, idx) => {
                      if (!dateStr) return <div key={`blank-${idx}`} />;
                      const { isWeekend, rule, selected } = getDayState(dateStr);
                      const inRange = !selected && (
                        (calMode === "range" && isInCalSelection(dateStr)) ||
                        (calMode === "weekends" && isWeekendSelected(dateStr)) ||
                        (calMode === "fullmonth" && isFullMonthSelected(dateStr))
                      );
                      const cls = [
                        "cal-day",
                        isWeekend        ? "weekend-day" : "",
                        rule && !selected && !inRange ? "has-rule" : "",
                        inRange          ? "in-range"   : "",
                        selected         ? "selected"   : "",
                        dateStr === todayStr ? "today" : "",
                      ].filter(Boolean).join(" ");

                      return (
                        <div
                          key={dateStr}
                          className={cls}
                          onClick={() => handleCalDayClick(dateStr)}
                          onMouseEnter={() => calMode === "range" && calRangeStart && !calRangeEnd && setCalHover(dateStr)}
                          onMouseLeave={() => setCalHover(null)}
                          title={rule ? `${rule.label}: ${formatPrice(Number(rule.price_per_night))}/night` : ""}
                        >
                          <span className="cal-day-num">{Number(dateStr.split("-")[2])}</span>
                          {rule && <span className="cal-day-price">{abbrevPrice(Number(rule.price_per_night))}</span>}
                        </div>
                      );
                    })}
                  </div>

                  {/* ── Legend ── */}
                  <div className="cal-legend">
                    <div className="cal-legend-item"><div className="cal-legend-dot" style={{ background:"#fffdf5", border:"1.5px solid #f0d882" }} /> Weekend</div>
                    <div className="cal-legend-item"><div className="cal-legend-dot" style={{ background:"#fef9ee", border:"1.5px solid #f0d882" }} /> Has price rule</div>
                    <div className="cal-legend-item"><div className="cal-legend-dot" style={{ background:"#eef1ff", border:"1.5px solid #c7cde8" }} /> In selection</div>
                    <div className="cal-legend-item"><div className="cal-legend-dot" style={{ background:"#1a1a2e" }} /> Selected</div>
                  </div>

                  {/* ── Price panel ── */}
                  {panelVisible && (
                    <div className="cal-panel">
                      <div className="cal-panel-title">{calEditRule ? "Edit Price Rule" : "Set Price"}</div>
                      <div className="cal-panel-sel">📅 {selectionLabel()}</div>
                      <div className="cal-panel-row">
                        <div className="cal-panel-field">
                          <label>Label</label>
                          <input
                            type="text"
                            placeholder={
                              calMode === "weekends"  ? "Weekend Rate" :
                              calMode === "fullmonth" ? "Monthly Rate" : "e.g. High Season"
                            }
                            value={calLabel}
                            onChange={(e) => setCalLabel(e.target.value)}
                          />
                        </div>
                        <div className="cal-panel-field">
                          <label>Price / Night ({currency.code})</label>
                          <input
                            type="number"
                            min="1"
                            placeholder="e.g. 12000"
                            value={calPrice}
                            onChange={(e) => setCalPrice(e.target.value)}
                            autoFocus
                          />
                        </div>
                        <button
                          className="adm-btn adm-btn-save"
                          style={{ padding:"10px 24px", alignSelf:"flex-end", background:"#c9a84c" }}
                          disabled={calSaving}
                          onClick={saveCalendarRule}
                        >
                          {calSaving ? "Saving…" : calEditRule ? "Update Rule" : "Save Rule"}
                        </button>
                        {calEditRule && (
                          <button
                            className="adm-btn adm-btn-remove"
                            style={{ padding:"10px 18px", alignSelf:"flex-end" }}
                            onClick={() => deleteCalRule(calEditRule.id)}
                          >
                            Delete
                          </button>
                        )}
                        <button
                          className="adm-btn adm-btn-cancel"
                          style={{ padding:"10px 18px", alignSelf:"flex-end" }}
                          onClick={() => { setCalRangeStart(null); setCalRangeEnd(null); setCalPrice(""); setCalLabel(""); setCalError(""); setCalSuccess(""); setCalEditRule(null); }}
                        >
                          Clear
                        </button>
                      </div>
                      {calError   && <div className="adm-form-msg error"   style={{ marginTop:12 }}>{calError}</div>}
                      {calSuccess && <div className="adm-form-msg success" style={{ marginTop:12 }}>{calSuccess}</div>}
                    </div>
                  )}
                </div>

              </>
            );
          })()}

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
                        onChange={(e) => setUserForm((f) => ({ ...f, username: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="adm-form-field">
                      <label>Password (min 8 chars)</label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={userForm.password}
                        onChange={(e) => setUserForm((f) => ({ ...f, password: e.target.value }))}
                        required
                      />
                    </div>
                    <button className="adm-btn adm-btn-save" type="submit" disabled={userSaving} style={{ padding: "10px 24px", alignSelf: "flex-end" }}>
                      {userSaving ? "…" : "Create User"}
                    </button>
                  </div>
                  {userError   && <div className="adm-form-msg error">{userError}</div>}
                  {userSuccess && <div className="adm-form-msg success">{userSuccess}</div>}
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
