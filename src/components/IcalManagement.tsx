import React, { useState } from "react";
import type { IcalSource } from "../types/availability";

interface IcalManagementProps {
  propertyId: number;
  sources: IcalSource[];
  onAddSource: (
    provider: "airbnb" | "booking" | "vrbo",
    url: string,
  ) => Promise<void>;
  onDeleteSource: (sourceId: number) => Promise<void>;
  onSync: (provider: "airbnb" | "booking" | "vrbo") => Promise<void>;
  isLoading?: boolean;
  isSyncing?: Record<string, boolean>;
}

export const IcalManagement: React.FC<IcalManagementProps> = ({
  propertyId,
  sources,
  onAddSource,
  onDeleteSource,
  onSync,
  isLoading = false,
  isSyncing = {},
}) => {
  const [newUrl, setNewUrl] = useState("");
  const [selectedProvider, setSelectedProvider] = useState<
    "airbnb" | "booking" | "vrbo"
  >("airbnb");
  const [expandedProvider, setExpandedProvider] = useState<string | null>(null);

  const handleAddSource = async () => {
    if (!newUrl.trim()) return;
    await onAddSource(selectedProvider, newUrl);
    setNewUrl("");
  };

  const providers = ["airbnb", "booking", "vrbo"] as const;

  return (
    <div style={{ marginTop: "40px" }}>
      <h3
        style={{
          fontSize: "1.1rem",
          fontWeight: 700,
          marginBottom: "20px",
          color: "#1a1a2e",
        }}
      >
        📅 iCal Calendar Integration
      </h3>

      {/* Add New iCal Source */}
      <div
        style={{
          backgroundColor: "#f9fafb",
          border: "1px solid #e5e7eb",
          borderRadius: "12px",
          padding: "20px",
          marginBottom: "24px",
        }}
      >
        <h4
          style={{
            fontSize: "0.95rem",
            fontWeight: 600,
            marginBottom: "14px",
            color: "#1a1a2e",
          }}
        >
          Add iCal Source
        </h4>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr auto",
            gap: "12px",
            alignItems: "flex-end",
          }}
        >
          <div>
            <label
              style={{
                display: "block",
                fontSize: "0.75rem",
                fontWeight: 700,
                marginBottom: "6px",
                color: "#6b7280",
              }}
            >
              Provider
            </label>
            <select
              value={selectedProvider}
              onChange={(e) => setSelectedProvider(e.target.value as any)}
              style={{
                width: "100%",
                padding: "10px",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                fontSize: "0.9rem",
              }}
            >
              <option value="airbnb">Airbnb</option>
              <option value="booking">Booking.com</option>
              <option value="vrbo">VRBO</option>
            </select>
          </div>
          <div style={{ gridColumn: "2 / 4" }}>
            <label
              style={{
                display: "block",
                fontSize: "0.75rem",
                fontWeight: 700,
                marginBottom: "6px",
                color: "#6b7280",
              }}
            >
              iCal URL
            </label>
            <input
              type="url"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder="https://..."
              style={{
                width: "100%",
                padding: "10px",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                fontSize: "0.9rem",
              }}
            />
          </div>
          <button
            onClick={handleAddSource}
            disabled={isLoading || !newUrl.trim()}
            style={{
              padding: "10px 16px",
              backgroundColor: "#1a1a2e",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              cursor: isLoading ? "not-allowed" : "pointer",
              fontWeight: 600,
              fontSize: "0.9rem",
              opacity: isLoading ? 0.6 : 1,
            }}
          >
            Add
          </button>
        </div>
      </div>

      {/* Existing iCal Sources */}
      <div style={{ display: "grid", gap: "12px" }}>
        {providers.map((provider) => {
          const source = sources.find((s) => s.provider === provider);
          const isSyncingProvider = isSyncing[provider] || false;

          return (
            <div
              key={provider}
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: "12px",
                overflow: "hidden",
                backgroundColor: "#fff",
              }}
            >
              <button
                onClick={() =>
                  setExpandedProvider(
                    expandedProvider === provider ? null : provider,
                  )
                }
                style={{
                  width: "100%",
                  padding: "16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  border: "none",
                  backgroundColor: source ? "#f0fdf4" : "#f9fafb",
                  cursor: "pointer",
                  fontSize: "0.95rem",
                  fontWeight: 600,
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "12px" }}
                >
                  <span>
                    {provider.charAt(0).toUpperCase() + provider.slice(1)}
                  </span>
                  {source && (
                    <span
                      style={{
                        fontSize: "0.75rem",
                        backgroundColor: "#10b981",
                        color: "#fff",
                        padding: "2px 8px",
                        borderRadius: "4px",
                      }}
                    >
                      Active
                    </span>
                  )}
                </div>
                <span style={{ color: "#9ca3af" }}>
                  {expandedProvider === provider ? "▲" : "▼"}
                </span>
              </button>

              {expandedProvider === provider && (
                <div
                  style={{
                    padding: "16px",
                    borderTop: "1px solid #e5e7eb",
                    backgroundColor: "#fafafa",
                  }}
                >
                  {source ? (
                    <>
                      <div
                        style={{ marginBottom: "12px", fontSize: "0.85rem" }}
                      >
                        <p style={{ color: "#6b7280", marginBottom: "4px" }}>
                          <strong>URL:</strong>{" "}
                          {source.ical_url.substring(0, 60)}...
                        </p>
                        {source.last_sync_at && (
                          <p style={{ color: "#6b7280" }}>
                            <strong>Last Sync:</strong>{" "}
                            {new Date(source.last_sync_at).toLocaleString()}
                          </p>
                        )}
                      </div>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          onClick={() => onSync(provider)}
                          disabled={isLoading || isSyncingProvider}
                          style={{
                            padding: "8px 14px",
                            backgroundColor: "#3b82f6",
                            color: "#fff",
                            border: "none",
                            borderRadius: "6px",
                            cursor: isSyncingProvider
                              ? "not-allowed"
                              : "pointer",
                            fontWeight: 600,
                            fontSize: "0.85rem",
                            opacity: isSyncingProvider ? 0.6 : 1,
                          }}
                        >
                          {isSyncingProvider ? "Syncing..." : "Sync Now"}
                        </button>
                        <button
                          onClick={() => onDeleteSource(source.id)}
                          disabled={isLoading}
                          style={{
                            padding: "8px 14px",
                            backgroundColor: "#ef4444",
                            color: "#fff",
                            border: "none",
                            borderRadius: "6px",
                            cursor: isLoading ? "not-allowed" : "pointer",
                            fontWeight: 600,
                            fontSize: "0.85rem",
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </>
                  ) : (
                    <p style={{ color: "#9ca3af", fontSize: "0.85rem" }}>
                      No iCal source configured for {provider}.
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
