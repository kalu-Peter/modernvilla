import React, { useCallback, useEffect, useState } from "react";
import { useCurrency } from "../context/CurrencyContext";

interface PricingOverride {
  override_date: string;
  price: number;
  reason: string | null;
}

interface BasePricing {
  weekday_price: number | null;
  weekend_price: number | null;
  extra_person_fee: number;
}

interface PropertyInfo {
  id: number;
  name: string;
  max_guests: number;
}

interface CalendarDay {
  date: string;
  day: number;
  isCurrentMonth: boolean;
  isWeekend: boolean;
  price: number | null;
  isOverride: boolean;
  reason?: string;
}

interface EditModalState {
  isOpen: boolean;
  date: string;
  price: string;
  reason: string;
  effectivePrice: number | null;
  isOverride: boolean;
}

interface BasePricingModalState {
  isOpen: boolean;
  weekdayPrice: string;
  weekendPrice: string;
  extraPersonFee: string;
}

const PricingCalendarTab: React.FC = () => {
  const { formatPrice, currency, rates } = useCurrency();
  const [properties, setProperties] = useState<PropertyInfo[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(
    null,
  );
  const [currentMonth, setCurrentMonth] = useState<Date>(() => new Date());
  const [basePricing, setBasePricing] = useState<BasePricing | null>(null);
  const [overrides, setOverrides] = useState<Record<string, PricingOverride>>(
    {},
  );
  const [, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">(
    "success",
  );

  const [editModal, setEditModal] = useState<EditModalState>({
    isOpen: false,
    date: "",
    price: "",
    reason: "",
    effectivePrice: null,
    isOverride: false,
  });

  const [basePricingModal, setBasePricingModal] =
    useState<BasePricingModalState>({
      isOpen: false,
      weekdayPrice: "",
      weekendPrice: "",
      extraPersonFee: "",
    });

  const secret = sessionStorage.getItem("adminSecret") ?? "";

  // ── Currency conversion: from selected currency to EUR ──────────────────
  const convertToEUR = (priceInSelectedCurrency: number): number => {
    if (currency.code === "EUR") return priceInSelectedCurrency;
    const rate = rates[currency.code] ?? 1;
    return priceInSelectedCurrency / rate;
  };

  // ── Fetch initial properties ────────────────────────────────────────────
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await fetch("/api/properties");
        if (response.ok) {
          const result = await response.json();
          const propertyList = result.data || result;
          setProperties(propertyList);
          if (propertyList.length > 0) {
            setSelectedPropertyId(propertyList[0].id);
          }
        } else {
          setMessage("Failed to fetch properties");
          setMessageType("error");
        }
      } catch (error) {
        console.error("Failed to fetch properties:", error);
        setMessage("Failed to fetch properties");
        setMessageType("error");
      }
    };
    fetchProperties();
  }, []);

  // ── Fetch calendar data ────────────────────────────────────────────────
  const fetchCalendarData = useCallback(
    async (propertyId: number, date: Date) => {
      if (!propertyId) return;

      setLoading(true);
      try {
        const month = date.toISOString().slice(0, 7); // YYYY-MM
        const response = await fetch(
          `/api/pricing/calendar?property_id=${propertyId}&month=${month}`,
        );

        if (response.ok) {
          const data = await response.json();
          setBasePricing(data.data.base_pricing);
          setOverrides(data.data.overrides || {});
        } else {
          const error = await response.json();
          setMessage(error.message || "Failed to fetch pricing data");
          setMessageType("error");
        }
      } catch (error) {
        console.error("Error fetching calendar:", error);
        setMessage("Error fetching pricing data");
        setMessageType("error");
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // ── Fetch data when property or month changes ────────────────────────
  useEffect(() => {
    if (selectedPropertyId) {
      fetchCalendarData(selectedPropertyId, currentMonth);
    }
  }, [selectedPropertyId, currentMonth, fetchCalendarData]);

  // ── Base pricing modal handlers ────────────────────────────────────
  const openBasePricingModal = () => {
    if (!basePricing) return;
    // Convert from EUR to selected currency for display
    const rate = rates[currency.code] ?? 1;
    setBasePricingModal({
      isOpen: true,
      weekdayPrice: (basePricing.weekday_price
        ? basePricing.weekday_price * rate
        : 0
      ).toFixed(2),
      weekendPrice: (basePricing.weekend_price
        ? basePricing.weekend_price * rate
        : 0
      ).toFixed(2),
      extraPersonFee: (basePricing.extra_person_fee
        ? basePricing.extra_person_fee * rate
        : 0
      ).toFixed(2),
    });
  };

  const closeBasePricingModal = () => {
    setBasePricingModal({
      isOpen: false,
      weekdayPrice: "",
      weekendPrice: "",
      extraPersonFee: "",
    });
  };

  const saveBasePricing = async () => {
    if (
      !selectedPropertyId ||
      !basePricingModal.weekdayPrice ||
      !basePricingModal.weekendPrice
    ) {
      setMessage("Weekday and weekend prices are required");
      setMessageType("error");
      return;
    }

    setSaving(true);
    try {
      const weekdayInEUR = convertToEUR(
        parseFloat(basePricingModal.weekdayPrice),
      );
      const weekendInEUR = convertToEUR(
        parseFloat(basePricingModal.weekendPrice),
      );
      const extraFeeInEUR = convertToEUR(
        parseFloat(basePricingModal.extraPersonFee) || 0,
      );

      const response = await fetch("/api/pricing/update_base", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-secret": secret,
        },
        body: JSON.stringify({
          property_id: selectedPropertyId,
          weekday_price: weekdayInEUR,
          weekend_price: weekendInEUR,
          extra_person_fee: extraFeeInEUR,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setBasePricing({
          weekday_price: data.data.weekday_price,
          weekend_price: data.data.weekend_price,
          extra_person_fee: data.data.extra_person_fee,
        });
        setMessage("Base pricing updated successfully");
        setMessageType("success");
        closeBasePricingModal();
      } else {
        const error = await response.json();
        setMessage(error.message || "Failed to save base pricing");
        setMessageType("error");
      }
    } catch (error) {
      console.error("Error saving base pricing:", error);
      setMessage("Error saving base pricing");
      setMessageType("error");
    } finally {
      setSaving(false);
    }
  };

  // ── Calculate effective price for a date ────────────────────────────
  const getEffectivePrice = (
    date: Date,
  ): { price: number | null; isOverride: boolean; reason?: string } => {
    const dateStr = date.toISOString().slice(0, 10);
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    // Check for override first
    if (overrides[dateStr]) {
      return {
        price: overrides[dateStr].price,
        isOverride: true,
        reason: overrides[dateStr].reason ?? undefined,
      };
    }

    // Use base pricing
    if (!basePricing) return { price: null, isOverride: false };

    const price = isWeekend
      ? basePricing.weekend_price
      : basePricing.weekday_price;
    return { price, isOverride: false };
  };

  // ── Generate calendar days ──────────────────────────────────────────
  const generateCalendarDays = (): CalendarDay[] => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days: CalendarDay[] = [];
    const current = new Date(startDate);

    while (current <= lastDay || days.length % 7 !== 0) {
      const dateStr = current.toISOString().slice(0, 10);
      const isCurrentMonth = current.getMonth() === month;
      const dayOfWeek = current.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const { price, isOverride, reason } = getEffectivePrice(current);

      days.push({
        date: dateStr,
        day: current.getDate(),
        isCurrentMonth,
        isWeekend,
        price,
        isOverride,
        reason,
      });

      current.setDate(current.getDate() + 1);
    }

    return days;
  };

  // ── Modal handlers ─────────────────────────────────────────────────
  const openEditModal = (day: CalendarDay) => {
    if (!day.isCurrentMonth) return;

    const currentPrice = day.price?.toString() || "";
    setEditModal({
      isOpen: true,
      date: day.date,
      price: currentPrice,
      reason: day.reason || "",
      effectivePrice: day.price,
      isOverride: day.isOverride,
    });
  };

  const closeEditModal = () => {
    setEditModal({
      isOpen: false,
      date: "",
      price: "",
      reason: "",
      effectivePrice: null,
      isOverride: false,
    });
  };

  // ── Save override ──────────────────────────────────────────────────
  const saveOverride = async () => {
    if (!selectedPropertyId || !editModal.price) {
      setMessage("Price is required");
      setMessageType("error");
      return;
    }

    setSaving(true);
    try {
      const priceInSelectedCurrency = parseFloat(editModal.price);
      const priceInEUR = convertToEUR(priceInSelectedCurrency);

      const response = await fetch("/api/pricing/save_override", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-secret": secret,
        },
        body: JSON.stringify({
          property_id: selectedPropertyId,
          override_date: editModal.date,
          price: priceInEUR,
          reason: editModal.reason || null,
        }),
      });

      if (response.ok) {
        setOverrides((prev) => ({
          ...prev,
          [editModal.date]: {
            override_date: editModal.date,
            price: parseFloat(editModal.price),
            reason: editModal.reason || null,
          },
        }));
        setMessage("Price saved successfully");
        setMessageType("success");
        closeEditModal();
      } else {
        const error = await response.json();
        setMessage(error.message || "Failed to save price");
        setMessageType("error");
      }
    } catch (error) {
      console.error("Error saving override:", error);
      setMessage("Error saving price");
      setMessageType("error");
    } finally {
      setSaving(false);
    }
  };

  // ── Delete override ────────────────────────────────────────────────
  const deleteOverride = async () => {
    if (!selectedPropertyId) return;

    setSaving(true);
    try {
      const response = await fetch("/api/pricing/delete_override", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "x-admin-secret": secret,
        },
        body: JSON.stringify({
          property_id: selectedPropertyId,
          override_date: editModal.date,
        }),
      });

      if (response.ok) {
        const newOverrides = { ...overrides };
        delete newOverrides[editModal.date];
        setOverrides(newOverrides);
        setMessage("Price override removed");
        setMessageType("success");
        closeEditModal();
      } else {
        const error = await response.json();
        setMessage(error.message || "Failed to delete override");
        setMessageType("error");
      }
    } catch (error) {
      console.error("Error deleting override:", error);
      setMessage("Error deleting override");
      setMessageType("error");
    } finally {
      setSaving(false);
    }
  };

  // ── Navigation handlers ────────────────────────────────────────────
  const goToPreviousMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() - 1);
    setCurrentMonth(newDate);
  };

  const goToNextMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() + 1);
    setCurrentMonth(newDate);
  };

  const goToToday = () => {
    setCurrentMonth(new Date());
  };

  const calendarDays = generateCalendarDays();
  const monthName = currentMonth.toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="pricing-calendar-container">
      <style>{`
        .pricing-calendar-container {
          padding: 24px;
        }

        .pricing-calendar-header {
          display: flex;
          align-items: center;
          gap: 20px;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }

        .pricing-calendar-property-selector {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .pricing-calendar-property-selector label {
          font-size: 0.85rem;
          font-weight: 600;
          color: #9098a9;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .pricing-calendar-property-selector select {
          padding: 10px 12px;
          border: 1.5px solid #e5e7eb;
          border-radius: 8px;
          font-size: 0.9rem;
          background: white;
          cursor: pointer;
          min-width: 200px;
          transition: border-color 0.15s;
        }

        .pricing-calendar-property-selector select:focus {
          outline: none;
          border-color: #c9a84c;
        }

        .pricing-calendar-nav {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .pricing-calendar-nav button {
          padding: 8px 14px;
          background: white;
          border: 1.5px solid #e5e7eb;
          border-radius: 8px;
          cursor: pointer;
          font-size: 0.85rem;
          font-weight: 600;
          color: #6b7280;
          transition: all 0.15s;
        }

        .pricing-calendar-nav button:hover {
          border-color: #c9a84c;
          color: #c9a84c;
        }

        .pricing-calendar-month-label {
          font-family: 'Playfair Display', serif;
          font-size: 1.2rem;
          color: #1a1a2e;
          min-width: 180px;
          text-align: center;
        }

        .pricing-calendar-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 8px;
          margin-bottom: 24px;
          background: white;
          padding: 16px;
          border-radius: 12px;
          border: 1px solid #eef0f4;
        }

        .pricing-calendar-weekday-header {
          text-align: center;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          color: #9098a9;
          padding: 8px 0;
          letter-spacing: 0.08em;
        }

        .pricing-calendar-day {
          min-height: 80px;
          border-radius: 10px;
          padding: 8px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          border: 1.5px solid #e5e7eb;
          background: #fafbfc;
          cursor: pointer;
          transition: all 0.12s;
          font-size: 0.85rem;
        }

        .pricing-calendar-day:hover:not(.not-current-month) {
          border-color: #c9a84c;
          background: #fffbf0;
        }

        .pricing-calendar-day.not-current-month {
          background: #f5f6fa;
          opacity: 0.5;
          cursor: default;
        }

        .pricing-calendar-day.weekend {
          background: #fffdf5;
        }

        .pricing-calendar-day.weekend:hover {
          background: #fffbf0;
        }

        .pricing-calendar-day.override {
          border-color: #f0d882;
          background: #fef9ee;
        }

        .pricing-calendar-day.override:hover {
          border-color: #c9a84c;
        }

        .pricing-calendar-day-number {
          font-weight: 700;
          color: #374151;
        }

        .pricing-calendar-day-price {
          font-weight: 600;
          color: #1a1a2e;
        }

        .pricing-calendar-day-label {
          font-size: 0.7rem;
          color: #9098a9;
          font-weight: 500;
        }

        .pricing-calendar-day.weekend .pricing-calendar-day-price {
          color: #dc2626;
        }

        .pricing-calendar-day.override .pricing-calendar-day-price {
          color: #c9a84c;
        }

        .pricing-message {
          padding: 12px 16px;
          border-radius: 8px;
          margin-bottom: 16px;
          font-size: 0.9rem;
          animation: slideIn 0.3s ease-out;
        }

        .pricing-message.success {
          background: #ecfdf5;
          color: #047857;
          border: 1px solid #d1fae5;
        }

        .pricing-message.error {
          background: #fef2f2;
          color: #dc2626;
          border: 1px solid #fee2e2;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .pricing-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          animation: fadeIn 0.2s ease-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .pricing-modal {
          background: white;
          border-radius: 12px;
          padding: 24px;
          max-width: 400px;
          width: 90%;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
          animation: slideUp 0.3s ease-out;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .pricing-modal-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.3rem;
          color: #1a1a2e;
          margin-bottom: 16px;
        }

        .pricing-modal-date {
          font-size: 0.85rem;
          color: #9098a9;
          margin-bottom: 16px;
        }

        .pricing-modal-info {
          background: #f5f6fa;
          padding: 12px;
          border-radius: 8px;
          margin-bottom: 16px;
          font-size: 0.85rem;
        }

        .pricing-modal-info-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
        }

        .pricing-modal-info-row:last-child {
          margin-bottom: 0;
        }

        .pricing-modal-form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 16px;
        }

        .pricing-modal-form-group label {
          font-size: 0.8rem;
          font-weight: 600;
          color: #9098a9;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .pricing-modal-form-group input {
          padding: 10px 12px;
          border: 1.5px solid #e5e7eb;
          border-radius: 8px;
          font-size: 0.9rem;
          transition: border-color 0.15s;
        }

        .pricing-modal-form-group input:focus {
          outline: none;
          border-color: #c9a84c;
        }

        .pricing-modal-actions {
          display: flex;
          gap: 10px;
          justify-content: flex-end;
        }

        .pricing-modal-btn {
          padding: 10px 16px;
          border: none;
          border-radius: 8px;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s;
        }

        .pricing-modal-btn-save {
          background: #c9a84c;
          color: white;
        }

        .pricing-modal-btn-save:hover:not(:disabled) {
          background: #b8941f;
        }

        .pricing-modal-btn-save:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .pricing-modal-btn-delete {
          background: #fee2e2;
          color: #dc2626;
        }

        .pricing-modal-btn-delete:hover:not(:disabled) {
          background: #fecaca;
        }

        .pricing-modal-btn-delete:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .pricing-modal-btn-cancel {
          background: #e5e7eb;
          color: #374151;
        }

        .pricing-modal-btn-cancel:hover {
          background: #d1d5db;
        }

        .pricing-base-pricing {
          background: white;
          padding: 16px;
          border-radius: 12px;
          border: 1px solid #eef0f4;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 16px;
        }

        .pricing-base-pricing-title {
          font-size: 0.85rem;
          font-weight: 600;
          color: #9098a9;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .pricing-base-pricing-values {
          display: flex;
          gap: 32px;
          align-items: center;
        }

        .pricing-base-pricing-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .pricing-base-pricing-label {
          font-size: 0.75rem;
          color: #9098a9;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }

        .pricing-base-pricing-price {
          font-size: 1.1rem;
          font-weight: 700;
          color: #1a1a2e;
        }

        .pricing-base-pricing-edit-btn {
          padding: 8px 16px;
          background: #c9a84c;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s;
          white-space: nowrap;
        }

        .pricing-base-pricing-edit-btn:hover {
          background: #b8941f;
        }

        .pricing-base-pricing-edit-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .pricing-legend {
          display: flex;
          gap: 24px;
          flex-wrap: wrap;
          margin-top: 24px;
          padding: 16px;
          background: #f5f6fa;
          border-radius: 8px;
          font-size: 0.85rem;
        }

        .pricing-legend-item {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .pricing-legend-color {
          width: 20px;
          height: 20px;
          border-radius: 4px;
          border: 1.5px solid #e5e7eb;
        }

        .pricing-legend-color.weekday {
          background: #fafbfc;
        }

        .pricing-legend-color.weekend {
          background: #fffdf5;
        }

        .pricing-legend-color.override {
          background: #fef9ee;
          border-color: #f0d882;
        }
      `}</style>

      {/* Header */}
      <div className="pricing-calendar-header">
        <div className="pricing-calendar-property-selector">
          <label>Property</label>
          <select
            value={selectedPropertyId || ""}
            onChange={(e) => setSelectedPropertyId(Number(e.target.value))}
          >
            <option value="">Select a property...</option>
            {properties.map((prop) => (
              <option key={prop.id} value={prop.id}>
                {prop.name}
              </option>
            ))}
          </select>
        </div>

        <div className="pricing-calendar-nav">
          <button onClick={goToPreviousMonth}>← Prev</button>
          <div className="pricing-calendar-month-label">{monthName}</div>
          <button onClick={goToNextMonth}>Next →</button>
          <button onClick={goToToday}>Today</button>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`pricing-message ${messageType}`}>{message}</div>
      )}

      {/* Base Pricing Display */}
      {selectedPropertyId && basePricing && (
        <div className="pricing-base-pricing">
          <div>
            <div className="pricing-base-pricing-title">Base Pricing</div>
            <div className="pricing-base-pricing-values">
              <div className="pricing-base-pricing-item">
                <div className="pricing-base-pricing-label">Weekday</div>
                <div className="pricing-base-pricing-price">
                  {basePricing.weekday_price
                    ? formatPrice(basePricing.weekday_price)
                    : "Not set"}
                </div>
              </div>
              <div className="pricing-base-pricing-item">
                <div className="pricing-base-pricing-label">Weekend</div>
                <div className="pricing-base-pricing-price">
                  {basePricing.weekend_price
                    ? formatPrice(basePricing.weekend_price)
                    : "Not set"}
                </div>
              </div>
            </div>
          </div>
          <button
            className="pricing-base-pricing-edit-btn"
            onClick={openBasePricingModal}
            disabled={saving}
          >
            Edit Base Prices
          </button>
        </div>
      )}

      {/* Calendar Grid */}
      {selectedPropertyId && basePricing && (
        <>
          <div className="pricing-calendar-grid">
            {weekDays.map((day) => (
              <div key={day} className="pricing-calendar-weekday-header">
                {day}
              </div>
            ))}

            {calendarDays.map((day) => (
              <div
                key={day.date}
                className={`pricing-calendar-day ${
                  !day.isCurrentMonth ? "not-current-month" : ""
                } ${day.isWeekend && day.isCurrentMonth ? "weekend" : ""} ${
                  day.isOverride ? "override" : ""
                }`}
                onClick={() => openEditModal(day)}
              >
                <div className="pricing-calendar-day-number">{day.day}</div>
                {day.price !== null && (
                  <>
                    <div className="pricing-calendar-day-price">
                      {formatPrice(day.price)}
                    </div>
                    {day.isOverride && (
                      <div className="pricing-calendar-day-label">Override</div>
                    )}
                    {day.isWeekend && !day.isOverride && (
                      <div className="pricing-calendar-day-label">Weekend</div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="pricing-legend">
            <div className="pricing-legend-item">
              <div className="pricing-legend-color weekday" />
              <span>Weekday Price</span>
            </div>
            <div className="pricing-legend-item">
              <div className="pricing-legend-color weekend" />
              <span>Weekend Price</span>
            </div>
            <div className="pricing-legend-item">
              <div className="pricing-legend-color override" />
              <span>Price Override</span>
            </div>
          </div>
        </>
      )}

      {/* Edit Modal */}
      {editModal.isOpen && (
        <div className="pricing-modal-overlay" onClick={closeEditModal}>
          <div className="pricing-modal" onClick={(e) => e.stopPropagation()}>
            <div className="pricing-modal-title">Edit Price</div>
            <div className="pricing-modal-date">
              {new Date(editModal.date).toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </div>

            <div className="pricing-modal-info">
              <div className="pricing-modal-info-row">
                <span>Current Price:</span>
                <strong>
                  {editModal.effectivePrice
                    ? formatPrice(editModal.effectivePrice)
                    : "No price"}
                </strong>
              </div>
              {editModal.isOverride && (
                <div className="pricing-modal-info-row">
                  <span>Override:</span>
                  <strong>Yes</strong>
                </div>
              )}
              <div className="pricing-modal-info-row">
                <span>
                  Enter price in:{" "}
                  <strong>
                    {currency.symbol} {currency.code}
                  </strong>
                </span>
              </div>
            </div>

            <div className="pricing-modal-form-group">
              <label>New Price ({currency.code})</label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={editModal.price}
                onChange={(e) =>
                  setEditModal({ ...editModal, price: e.target.value })
                }
                placeholder={`Enter price in ${currency.code}`}
              />
            </div>

            <div className="pricing-modal-form-group">
              <label>Reason (Optional)</label>
              <input
                type="text"
                value={editModal.reason}
                onChange={(e) =>
                  setEditModal({ ...editModal, reason: e.target.value })
                }
                placeholder="e.g., Holiday, Special Event"
              />
            </div>

            <div className="pricing-modal-actions">
              {editModal.isOverride && (
                <button
                  className="pricing-modal-btn pricing-modal-btn-delete"
                  onClick={deleteOverride}
                  disabled={saving}
                >
                  {saving ? "Deleting..." : "Remove Override"}
                </button>
              )}
              <button
                className="pricing-modal-btn pricing-modal-btn-cancel"
                onClick={closeEditModal}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                className="pricing-modal-btn pricing-modal-btn-save"
                onClick={saveOverride}
                disabled={saving || !editModal.price}
              >
                {saving ? "Saving..." : "Save Price"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Base Pricing Modal */}
      {basePricingModal.isOpen && (
        <div className="pricing-modal-overlay" onClick={closeBasePricingModal}>
          <div className="pricing-modal" onClick={(e) => e.stopPropagation()}>
            <div className="pricing-modal-title">Edit Base Pricing</div>
            <div className="pricing-modal-info">
              <div className="pricing-modal-info-row">
                <span>These prices apply to all dates unless overridden</span>
              </div>
              <div className="pricing-modal-info-row">
                <span>
                  Prices entered in:{" "}
                  <strong>
                    {currency.symbol} {currency.code}
                  </strong>
                </span>
              </div>
            </div>

            <div className="pricing-modal-form-group">
              <label>Weekday Price ({currency.code})</label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={basePricingModal.weekdayPrice}
                onChange={(e) =>
                  setBasePricingModal({
                    ...basePricingModal,
                    weekdayPrice: e.target.value,
                  })
                }
                placeholder={`Enter weekday price in ${currency.code}`}
              />
            </div>

            <div className="pricing-modal-form-group">
              <label>Weekend Price ({currency.code})</label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={basePricingModal.weekendPrice}
                onChange={(e) =>
                  setBasePricingModal({
                    ...basePricingModal,
                    weekendPrice: e.target.value,
                  })
                }
                placeholder={`Enter weekend price in ${currency.code}`}
              />
            </div>

            <div className="pricing-modal-form-group">
              <label>Extra Person Fee ({currency.code}) - Optional</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={basePricingModal.extraPersonFee}
                onChange={(e) =>
                  setBasePricingModal({
                    ...basePricingModal,
                    extraPersonFee: e.target.value,
                  })
                }
                placeholder={`Enter extra person fee in ${currency.code}`}
              />
            </div>

            <div className="pricing-modal-actions">
              <button
                className="pricing-modal-btn pricing-modal-btn-cancel"
                onClick={closeBasePricingModal}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                className="pricing-modal-btn pricing-modal-btn-save"
                onClick={saveBasePricing}
                disabled={
                  saving ||
                  !basePricingModal.weekdayPrice ||
                  !basePricingModal.weekendPrice
                }
              >
                {saving ? "Saving..." : "Save Prices"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PricingCalendarTab;
