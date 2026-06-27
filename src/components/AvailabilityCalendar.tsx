import React, { useState, useMemo } from "react";
import type {
  PropertyBlock,
  ImportedCalendarEvent,
  CalendarReservation,
  CalendarDay,
} from "../types/availability";
import { BLOCK_COLORS } from "../types/availability";

interface AvailabilityCalendarProps {
  propertyId: number;
  blocks: PropertyBlock[];
  events: ImportedCalendarEvent[];
  reservations: CalendarReservation[];
  onDateClick: (date: string, block?: PropertyBlock) => void;
  onDateRangeSelect?: (startDate: string, endDate: string) => void;
  isLoading?: boolean;
}

export const AvailabilityCalendar: React.FC<AvailabilityCalendarProps> = ({
  blocks,
  events,
  reservations,
  onDateClick,
  isLoading = false,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [, setSelectedDate] = useState<string | null>(null);

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // Get first day of month and number of days
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    // Add previous month days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    const days: CalendarDay[] = [];

    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonthLastDay - i);
      days.push(createCalendarDay(date, false, blocks, events, reservations));
    }

    // Add current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      days.push(createCalendarDay(date, true, blocks, events, reservations));
    }

    // Add next month days
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(year, month + 1, i);
      days.push(createCalendarDay(date, false, blocks, events, reservations));
    }

    return days;
  }, [currentDate, blocks, events, reservations]);

  return (
    <div>
      {/* Navigation */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "24px",
          padding: "16px",
          backgroundColor: "#f9fafb",
          borderRadius: "12px",
        }}
      >
        <button
          onClick={() =>
            setCurrentDate(
              new Date(currentDate.getFullYear(), currentDate.getMonth() - 1),
            )
          }
          style={{
            padding: "8px 14px",
            backgroundColor: "#e5e7eb",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          ← Previous
        </button>

        <h2
          style={{
            fontSize: "1.3rem",
            fontWeight: 700,
            color: "#1a1a2e",
            margin: 0,
          }}
        >
          {currentDate.toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          })}
        </h2>

        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={() => setCurrentDate(new Date())}
            style={{
              padding: "8px 14px",
              backgroundColor: "#c9a84c",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Today
          </button>
          <button
            onClick={() =>
              setCurrentDate(
                new Date(currentDate.getFullYear(), currentDate.getMonth() + 1),
              )
            }
            style={{
              padding: "8px 14px",
              backgroundColor: "#e5e7eb",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Next →
          </button>
        </div>
      </div>

      {/* Day headers */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: "2px",
          backgroundColor: "#e5e7eb",
          padding: "2px",
          borderRadius: "8px",
          overflow: "hidden",
          marginBottom: "2px",
        }}
      >
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div
            key={day}
            style={{
              padding: "12px",
              backgroundColor: "#f9fafb",
              textAlign: "center",
              fontWeight: 700,
              fontSize: "0.8rem",
              color: "#6b7280",
            }}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: "2px",
          backgroundColor: "#e5e7eb",
          padding: "2px",
          borderRadius: "8px",
          overflow: "hidden",
        }}
      >
        {calendarDays.map((day) => (
          <button
            key={day.date}
            onClick={() => {
              setSelectedDate(day.date);
              onDateClick(day.date, day.block);
            }}
            style={{
              padding: "12px",
              backgroundColor: day.isCurrentMonth
                ? day.status === "available"
                  ? "#fff"
                  : BLOCK_COLORS[day.status]
                : "#f3f4f6",
              border: day.isToday ? "2px solid #c9a84c" : "1px solid #e5e7eb",
              cursor: day.isCurrentMonth ? "pointer" : "default",
              opacity: day.isCurrentMonth ? 1 : 0.5,
              minHeight: "80px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-start",
              alignItems: "center",
              position: "relative",
              transition: "all 0.2s",
              overflow: "hidden",
            }}
            onMouseEnter={(e) => {
              if (day.isCurrentMonth) {
                (e.currentTarget as HTMLElement).style.boxShadow =
                  "0 4px 12px rgba(0, 0, 0, 0.1)";
                (e.currentTarget as HTMLElement).style.transform =
                  "translateY(-2px)";
              }
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.boxShadow = "none";
              (e.currentTarget as HTMLElement).style.transform =
                "translateY(0)";
            }}
          >
            {/* Day number */}
            <span
              style={{
                fontSize: "0.9rem",
                fontWeight: 600,
                color: day.isCurrentMonth ? "#1a1a2e" : "#9ca3af",
                marginBottom: "4px",
              }}
            >
              {day.dayOfMonth}
            </span>

            {/* Status indicator */}
            {day.status !== "available" && (
              <span
                style={{
                  fontSize: "0.65rem",
                  fontWeight: 700,
                  color: day.status === "maintenance" ? "#1a1a2e" : "#fff",
                  backgroundColor: "rgba(0, 0, 0, 0.1)",
                  padding: "2px 6px",
                  borderRadius: "3px",
                  marginTop: "auto",
                }}
              >
                {day.status === "reserved" && day.reservation
                  ? day.reservation.name
                  : day.status === "synced" && day.event
                    ? day.event.source_provider.charAt(0).toUpperCase() +
                      day.event.source_provider.slice(1)
                    : day.status.charAt(0).toUpperCase() + day.status.slice(1)}
              </span>
            )}
          </button>
        ))}
      </div>

      {isLoading && (
        <div style={{ textAlign: "center", padding: "20px", color: "#9ca3af" }}>
          Loading calendar...
        </div>
      )}
    </div>
  );
};

// Formats using local calendar fields — date.toISOString() converts to UTC
// first, which shifts the date back a day in timezones ahead of UTC (e.g.
// France), making cells/clicks/block-matching resolve to the wrong date.
function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Helper function to create a calendar day
function createCalendarDay(
  date: Date,
  isCurrentMonth: boolean,
  blocks: PropertyBlock[],
  events: ImportedCalendarEvent[],
  reservations: CalendarReservation[],
): CalendarDay {
  const dateStr = formatLocalDate(date);
  const today = formatLocalDate(new Date());

  // Priority (most specific/certain first): a confirmed reservation on this
  // site outranks everything else, then manual blocks (an admin's explicit,
  // deliberate call), then a synced external-calendar event (automatic,
  // could be stale since the last sync).
  const reservation = reservations.find((r) =>
    isDateInRange(dateStr, r.checkin, r.checkout),
  );
  const bookingBlock = blocks.find(
    (b) =>
      b.block_type === "booking" &&
      isDateInRange(dateStr, b.start_date, b.end_date),
  );
  const airbnbBlock = blocks.find(
    (b) =>
      b.block_type === "airbnb" &&
      isDateInRange(dateStr, b.start_date, b.end_date),
  );
  const manualBlock = blocks.find(
    (b) =>
      b.block_type === "manual" &&
      isDateInRange(dateStr, b.start_date, b.end_date),
  );
  const maintenanceBlock = blocks.find(
    (b) =>
      b.block_type === "maintenance" &&
      isDateInRange(dateStr, b.start_date, b.end_date),
  );
  const event = events.find((e) =>
    isDateInRange(dateStr, e.start_date, e.end_date),
  );

  if (reservation) {
    return {
      date: dateStr,
      dayOfMonth: date.getDate(),
      isCurrentMonth,
      isToday: dateStr === today,
      status: "reserved",
      reservation,
    };
  }

  if (bookingBlock) {
    return {
      date: dateStr,
      dayOfMonth: date.getDate(),
      isCurrentMonth,
      isToday: dateStr === today,
      status: "booking",
      block: bookingBlock,
    };
  }

  if (airbnbBlock) {
    return {
      date: dateStr,
      dayOfMonth: date.getDate(),
      isCurrentMonth,
      isToday: dateStr === today,
      status: "airbnb",
      block: airbnbBlock,
    };
  }

  if (manualBlock) {
    return {
      date: dateStr,
      dayOfMonth: date.getDate(),
      isCurrentMonth,
      isToday: dateStr === today,
      status: "manual",
      block: manualBlock,
    };
  }

  if (maintenanceBlock) {
    return {
      date: dateStr,
      dayOfMonth: date.getDate(),
      isCurrentMonth,
      isToday: dateStr === today,
      status: "maintenance",
      block: maintenanceBlock,
    };
  }

  if (event) {
    return {
      date: dateStr,
      dayOfMonth: date.getDate(),
      isCurrentMonth,
      isToday: dateStr === today,
      status: "synced",
      event,
    };
  }

  return {
    date: dateStr,
    dayOfMonth: date.getDate(),
    isCurrentMonth,
    isToday: dateStr === today,
    status: "available",
  };
}

function isDateInRange(
  date: string,
  startDate: string,
  endDate: string,
): boolean {
  return date >= startDate && date < endDate;
}
