import React, { useState, useCallback, useEffect } from "react";
import { SHELTERS } from "../types";
import { SHELTER_TO_PROPERTY_ID } from "../utils/pricing";
import { AvailabilityCalendar } from "./AvailabilityCalendar";
import { BlockDateModal } from "./BlockDateModal";
import { IcalManagement } from "./IcalManagement";
import { AvailabilityLegend } from "./AvailabilityLegend";
import type {
  PropertyBlock,
  IcalSource,
  ImportedCalendarEvent,
  CalendarReservation,
  BlockFormData,
  AvailabilityCalendarData,
} from "../types/availability";

export const AvailabilityTab: React.FC = () => {
  const [selectedProperty, setSelectedProperty] = useState<string>(
    SHELTERS[0]?.id || "",
  );
  const [selectedPropertyId, setSelectedPropertyId] = useState<number>(1);

  const [blocks, setBlocks] = useState<PropertyBlock[]>([]);
  const [icalSources, setIcalSources] = useState<IcalSource[]>([]);
  const [importedEvents, setImportedEvents] = useState<ImportedCalendarEvent[]>(
    [],
  );
  const [reservations, setReservations] = useState<CalendarReservation[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedBlock, setSelectedBlock] = useState<PropertyBlock>();

  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState<Record<string, boolean>>({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch calendar data
  const fetchCalendarData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const propertyId =
        SHELTER_TO_PROPERTY_ID[selectedProperty] || selectedPropertyId;

      const res = await fetch(
        `/api/availability/calendar?property_id=${propertyId}`,
      );

      if (!res.ok) throw new Error("Failed to fetch calendar data");

      const data = await res.json();
      const calendarData = (data.data ?? {}) as Partial<AvailabilityCalendarData>;

      // Array.isArray (not just `|| []`) — a falsy fallback doesn't catch
      // a non-array truthy value (e.g. an object), which would still crash
      // every .filter()/.find() these get passed into downstream.
      setBlocks(Array.isArray(calendarData.blocks) ? calendarData.blocks : []);
      setIcalSources(Array.isArray(calendarData.ical_sources) ? calendarData.ical_sources : []);
      setImportedEvents(Array.isArray(calendarData.imported_events) ? calendarData.imported_events : []);
      setReservations(Array.isArray(calendarData.reservations) ? calendarData.reservations : []);
      setSelectedPropertyId(propertyId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error loading calendar");
    } finally {
      setLoading(false);
    }
  }, [selectedProperty, selectedPropertyId]);

  useEffect(() => {
    fetchCalendarData();
  }, [fetchCalendarData]);

  // Handle date click
  const handleDateClick = (date: string, block?: PropertyBlock) => {
    setSelectedDate(date);
    setSelectedBlock(block);
    setIsModalOpen(true);
  };

  // Handle block save
  const handleBlockSave = async (
    data: BlockFormData & { blockId?: number },
  ) => {
    try {
      setLoading(true);
      setError("");

      if (data.blockId) {
        // Update existing block
        const res = await fetch(`/api/availability/update_block`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: data.blockId,
            start_date: data.startDate,
            end_date: data.endDate,
            block_type: data.blockType,
            notes: data.notes,
          }),
        });

        if (!res.ok) throw new Error("Failed to update block");
      } else {
        // Create new block
        const res = await fetch(`/api/availability/create_block`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            property_id: selectedPropertyId,
            start_date: data.startDate,
            end_date: data.endDate,
            block_type: data.blockType,
            notes: data.notes,
          }),
        });

        if (!res.ok) throw new Error("Failed to create block");
      }

      setSuccess("Block saved successfully");
      setIsModalOpen(false);
      await fetchCalendarData();

      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error saving block");
    } finally {
      setLoading(false);
    }
  };

  // Handle delete block
  const handleDeleteBlock = async () => {
    if (!selectedBlock) return;

    if (!window.confirm("Are you sure you want to delete this block?")) return;

    try {
      setLoading(true);
      setError("");

      const res = await fetch(
        `/api/availability/delete_block?id=${selectedBlock.id}`,
        {
          method: "DELETE",
        },
      );

      if (!res.ok) throw new Error("Failed to delete block");

      setSuccess("Block deleted successfully");
      setIsModalOpen(false);
      await fetchCalendarData();

      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error deleting block");
    } finally {
      setLoading(false);
    }
  };

  // Handle add iCal source
  const handleAddIcal = async (
    provider: "airbnb" | "booking" | "vrbo",
    url: string,
  ) => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(`/api/availability/save_ical`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          property_id: selectedPropertyId,
          provider,
          ical_url: url,
        }),
      });

      if (!res.ok) throw new Error("Failed to save iCal source");

      setSuccess("iCal source added successfully");
      await fetchCalendarData();

      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error saving iCal source");
    } finally {
      setLoading(false);
    }
  };

  // Handle delete iCal source
  const handleDeleteIcal = async (sourceId: number) => {
    if (!window.confirm("Delete this iCal source?")) return;

    try {
      setLoading(true);
      setError("");

      const res = await fetch(`/api/availability/delete_ical?id=${sourceId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete iCal source");

      setSuccess("iCal source deleted successfully");
      await fetchCalendarData();

      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error deleting iCal source",
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle sync iCal
  const handleSyncIcal = async (provider: "airbnb" | "booking" | "vrbo") => {
    try {
      setSyncing((prev) => ({ ...prev, [provider]: true }));
      setError("");

      const res = await fetch(`/api/availability/sync_airbnb`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          property_id: selectedPropertyId,
          provider,
        }),
      });

      if (!res.ok) throw new Error("Failed to sync calendar");

      const result = await res.json();
      setSuccess(`Synced ${result.data.events_count} events from ${provider}`);
      await fetchCalendarData();

      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error syncing calendar");
    } finally {
      setSyncing((prev) => ({ ...prev, [provider]: false }));
    }
  };

  return (
    <div>
      <style>{`
        .avail-section { background: #fff; border: 1px solid #eef0f4; border-radius: 12px; padding: 24px; margin-bottom: 24px; }
        .avail-title { font-size: 1.1rem; font-weight: 700; color: #1a1a2e; margin-bottom: 16px; }
        .avail-select { padding: 10px 12px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 0.9rem; background: #fff; cursor: pointer; }
        .avail-message { padding: 12px 16px; border-radius: 8px; margin-bottom: 16px; font-size: 0.85rem; font-family: 'Inter', sans-serif; }
        .avail-message.error { background: #fee2e2; color: #7f1d1d; border: 1px solid #fecaca; }
        .avail-message.success { background: #d1fae5; color: #065f46; border: 1px solid #a7f3d0; }
      `}</style>

      {/* Messages */}
      {error && <div className="avail-message error">{error}</div>}
      {success && <div className="avail-message success">{success}</div>}

      {/* Property Selector */}
      <div className="avail-section">
        <h3 className="avail-title">Select Property</h3>
        <select
          value={selectedProperty}
          onChange={(e) => setSelectedProperty(e.target.value)}
          className="avail-select"
        >
          {SHELTERS.filter((s) => !s.openingSoon).map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      {/* Legend */}
      <div className="avail-section">
        <AvailabilityLegend />
      </div>

      {/* Calendar */}
      <div className="avail-section">
        <h3 className="avail-title">📅 Monthly Calendar</h3>
        <AvailabilityCalendar
          propertyId={selectedPropertyId}
          blocks={blocks}
          events={importedEvents}
          reservations={reservations}
          onDateClick={handleDateClick}
          isLoading={loading}
        />
      </div>

      {/* iCal Management */}
      <div className="avail-section">
        <IcalManagement
          propertyId={selectedPropertyId}
          sources={icalSources}
          onAddSource={handleAddIcal}
          onDeleteSource={handleDeleteIcal}
          onSync={handleSyncIcal}
          isLoading={loading}
          isSyncing={syncing}
        />
      </div>

      {/* Block Date Modal */}
      <BlockDateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleBlockSave}
        selectedDate={selectedDate}
        existingBlock={selectedBlock}
        isLoading={loading}
      />

      {/* Delete Block Button (shown when editing) */}
      {isModalOpen && selectedBlock && (
        <div
          style={{
            position: "fixed",
            bottom: "30px",
            right: "30px",
            zIndex: 52,
          }}
        >
          <button
            onClick={handleDeleteBlock}
            disabled={loading}
            style={{
              padding: "12px 20px",
              backgroundColor: "#ef4444",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              cursor: loading ? "not-allowed" : "pointer",
              fontWeight: 600,
              fontSize: "0.9rem",
              opacity: loading ? 0.6 : 1,
            }}
          >
            Delete Block
          </button>
        </div>
      )}
    </div>
  );
};
