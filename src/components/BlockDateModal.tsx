import React, { useState } from "react";
import type { PropertyBlock, BlockFormData, BlockType } from "../types/availability";
import { BLOCK_LABELS } from "../types/availability";

interface BlockDateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: BlockFormData & { blockId?: number }) => Promise<void>;
  selectedDate: string;
  existingBlock?: PropertyBlock;
  isLoading?: boolean;
}

export const BlockDateModal: React.FC<BlockDateModalProps> = ({
  isOpen,
  onClose,
  onSave,
  selectedDate,
  existingBlock,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<BlockFormData>({
    startDate: existingBlock?.start_date || selectedDate,
    endDate: existingBlock?.end_date || selectedDate,
    blockType: (existingBlock?.block_type || "manual") as BlockType,
    notes: existingBlock?.notes || "",
  });

  const handleSave = async () => {
    await onSave({
      ...formData,
      blockId: existingBlock?.id,
    });
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          zIndex: 50,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        onClick={onClose}
      />
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          backgroundColor: "#fff",
          borderRadius: "12px",
          padding: "28px",
          zIndex: 51,
          width: "90%",
          maxWidth: "500px",
          boxShadow: "0 20px 25px rgba(0, 0, 0, 0.15)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3
          style={{
            fontSize: "1.25rem",
            fontWeight: 700,
            marginBottom: "20px",
            color: "#1a1a2e",
          }}
        >
          {existingBlock ? "Edit Date Block" : "Block Dates"}
        </h3>

        {existingBlock && (
          <div
            style={{
              backgroundColor: "#f3f4f6",
              padding: "12px",
              borderRadius: "8px",
              marginBottom: "20px",
              fontSize: "0.85rem",
            }}
          >
            <strong>Current Status:</strong>{" "}
            {BLOCK_LABELS[existingBlock.block_type]}
            {existingBlock.source_reference &&
              ` (${existingBlock.source_reference})`}
          </div>
        )}

        <div style={{ display: "grid", gap: "16px", marginBottom: "20px" }}>
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
              Start Date
            </label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) =>
                setFormData({ ...formData, startDate: e.target.value })
              }
              style={{
                width: "100%",
                padding: "10px",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                fontSize: "0.9rem",
              }}
            />
          </div>

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
              End Date
            </label>
            <input
              type="date"
              value={formData.endDate}
              onChange={(e) =>
                setFormData({ ...formData, endDate: e.target.value })
              }
              style={{
                width: "100%",
                padding: "10px",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                fontSize: "0.9rem",
              }}
            />
          </div>

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
              Block Type
            </label>
            <select
              value={formData.blockType}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  blockType: e.target.value as BlockType,
                })
              }
              disabled={
                !!existingBlock && existingBlock.block_type !== "manual"
              }
              style={{
                width: "100%",
                padding: "10px",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                fontSize: "0.9rem",
              }}
            >
              <option value="manual">Manual Block</option>
              <option value="maintenance">Maintenance</option>
            </select>
            {existingBlock && existingBlock.block_type !== "manual" && (
              <p
                style={{
                  fontSize: "0.75rem",
                  color: "#9ca3af",
                  marginTop: "4px",
                }}
              >
                Cannot change type of {BLOCK_LABELS[existingBlock.block_type]}
              </p>
            )}
          </div>

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
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              placeholder="Optional notes..."
              style={{
                width: "100%",
                padding: "10px",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                fontSize: "0.9rem",
                minHeight: "80px",
                fontFamily: "inherit",
              }}
            />
          </div>
        </div>

        <div
          style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}
        >
          <button
            onClick={onClose}
            disabled={isLoading}
            style={{
              padding: "10px 20px",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              backgroundColor: "#f9fafb",
              color: "#1a1a2e",
              cursor: "pointer",
              fontSize: "0.9rem",
              fontWeight: 600,
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading}
            style={{
              padding: "10px 20px",
              border: "none",
              borderRadius: "8px",
              backgroundColor: "#1a1a2e",
              color: "#fff",
              cursor: isLoading ? "not-allowed" : "pointer",
              fontSize: "0.9rem",
              fontWeight: 600,
              opacity: isLoading ? 0.6 : 1,
            }}
          >
            {isLoading
              ? "Saving..."
              : existingBlock
                ? "Update Block"
                : "Create Block"}
          </button>
        </div>
      </div>
    </>
  );
};
