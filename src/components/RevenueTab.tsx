import React, { useCallback, useEffect, useState } from "react";
import { useCurrency } from "../context/CurrencyContext";
import type { RevenueSummary } from "../types";

export const RevenueTab: React.FC = () => {
  const { formatPrice } = useCurrency();
  const secret = sessionStorage.getItem("adminSecret") ?? "";

  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [summary, setSummary] = useState<RevenueSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchSummary = useCallback(async (selectedYear: number) => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(`/api/admin/revenue?year=${selectedYear}`, {
        headers: { "x-admin-secret": secret },
      });

      if (!res.ok) throw new Error("Failed to fetch revenue summary");

      const data = await res.json();
      setSummary(data.data as RevenueSummary);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error loading revenue");
    } finally {
      setLoading(false);
    }
  }, [secret]);

  useEffect(() => {
    fetchSummary(year);
  }, [year, fetchSummary]);

  const maxMonthlyRevenue = summary
    ? Math.max(1, ...summary.monthly.map((m) => m.revenue))
    : 1;

  const availableYears = summary?.available_years ?? [year];

  return (
    <div>
      <style>{`
        .rev-section { background: #fff; border: 1px solid #eef0f4; border-radius: 12px; padding: 24px; margin-bottom: 24px; }
        .rev-title { font-size: 1.1rem; font-weight: 700; color: #1a1a2e; margin-bottom: 16px; }
        .rev-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; margin-bottom: 24px; }
        .rev-card { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 16px 18px; }
        .rev-card-label { font-size: 0.75rem; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 6px; }
        .rev-card-value { font-size: 1.4rem; font-weight: 700; color: #1a1a2e; }
        .rev-select { padding: 10px 12px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 0.9rem; background: #fff; cursor: pointer; }
        .rev-table { width: 100%; border-collapse: collapse; margin-top: 8px; }
        .rev-table th { background: #f5f6fa; padding: 10px 12px; text-align: left; font-weight: 600; color: #333; border-bottom: 2px solid #e5e7eb; font-size: 0.85rem; }
        .rev-table td { padding: 10px 12px; border-bottom: 1px solid #e5e7eb; font-size: 0.9rem; }
        .rev-bar-track { background: #f0fdf4; border-radius: 6px; height: 10px; width: 100%; overflow: hidden; }
        .rev-bar-fill { background: #10b981; height: 100%; border-radius: 6px; }
        .rev-message { padding: 12px 16px; border-radius: 8px; margin-bottom: 16px; font-size: 0.85rem; }
        .rev-message.error { background: #fee2e2; color: #7f1d1d; border: 1px solid #fecaca; }
        .rev-loading { text-align: center; padding: 32px; color: #666; }
      `}</style>

      {error && <div className="rev-message error">{error}</div>}

      {/* Year Selector */}
      <div className="rev-section">
        <h3 className="rev-title">Select Year</h3>
        <select
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="rev-select"
        >
          {availableYears.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      {loading && !summary ? (
        <div className="rev-loading">Loading revenue data…</div>
      ) : summary ? (
        <>
          {/* Summary Cards */}
          <div className="rev-cards">
            <div className="rev-card">
              <div className="rev-card-label">{year} Revenue</div>
              <div className="rev-card-value">
                {formatPrice(summary.totals.selected_year_revenue)}
              </div>
            </div>
            <div className="rev-card">
              <div className="rev-card-label">{year} Bookings</div>
              <div className="rev-card-value">
                {summary.totals.selected_year_bookings}
              </div>
            </div>
            <div className="rev-card">
              <div className="rev-card-label">All-Time Revenue</div>
              <div className="rev-card-value">
                {formatPrice(summary.totals.all_time_revenue)}
              </div>
            </div>
            <div className="rev-card">
              <div className="rev-card-label">All-Time Bookings</div>
              <div className="rev-card-value">
                {summary.totals.all_time_bookings}
              </div>
            </div>
          </div>

          {/* Monthly Revenue Table */}
          <div className="rev-section">
            <h3 className="rev-title">📅 Monthly Revenue — {year}</h3>
            <table className="rev-table">
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Bookings</th>
                  <th>Revenue</th>
                  <th style={{ width: "30%" }}></th>
                </tr>
              </thead>
              <tbody>
                {summary.monthly.map((m) => (
                  <tr key={m.month}>
                    <td>{m.label}</td>
                    <td>{m.bookings_count}</td>
                    <td>{formatPrice(m.revenue)}</td>
                    <td>
                      <div className="rev-bar-track">
                        <div
                          className="rev-bar-fill"
                          style={{
                            width: `${(m.revenue / maxMonthlyRevenue) * 100}%`,
                          }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Revenue by Property */}
          <div className="rev-section">
            <h3 className="rev-title">🏠 Revenue by Property — {year}</h3>
            {summary.by_property.length === 0 ? (
              <p style={{ color: "#9ca3af", fontSize: "0.9rem" }}>
                No paid bookings for {year} yet.
              </p>
            ) : (
              <table className="rev-table">
                <thead>
                  <tr>
                    <th>Property</th>
                    <th>Bookings</th>
                    <th>Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.by_property.map((p) => (
                    <tr key={p.property_name}>
                      <td>{p.property_name}</td>
                      <td>{p.bookings_count}</td>
                      <td>{formatPrice(p.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Yearly Revenue Table */}
          <div className="rev-section">
            <h3 className="rev-title">📊 Yearly Revenue</h3>
            {summary.yearly.length === 0 ? (
              <p style={{ color: "#9ca3af", fontSize: "0.9rem" }}>
                No paid bookings recorded yet.
              </p>
            ) : (
              <table className="rev-table">
                <thead>
                  <tr>
                    <th>Year</th>
                    <th>Bookings</th>
                    <th>Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.yearly.map((y) => (
                    <tr key={y.year}>
                      <td>{y.year}</td>
                      <td>{y.bookings_count}</td>
                      <td>{formatPrice(y.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
};
