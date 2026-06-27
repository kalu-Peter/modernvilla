import React from "react";
import { BLOCK_LABELS, BLOCK_COLORS } from "../types/availability";

export const AvailabilityLegend: React.FC = () => {
  const statuses = [
    "available",
    "reserved",
    "synced",
    "manual",
    "airbnb",
    "booking",
    "maintenance",
  ] as const;

  return (
    <div
      style={{
        display: "flex",
        gap: "20px",
        flexWrap: "wrap",
        padding: "20px 0",
        borderBottom: "1px solid #e5e7eb",
      }}
    >
      {statuses.map((status) => (
        <div
          key={status}
          style={{ display: "flex", alignItems: "center", gap: "8px" }}
        >
          <div
            style={{
              width: "16px",
              height: "16px",
              borderRadius: "4px",
              backgroundColor: BLOCK_COLORS[status],
            }}
          />
          <span
            style={{ fontSize: "0.75rem", fontWeight: 600, color: "#6b7280" }}
          >
            {BLOCK_LABELS[status]}
          </span>
        </div>
      ))}
    </div>
  );
};
