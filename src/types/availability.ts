// Availability & Date Blocking Types

export type BlockType = 'manual' | 'airbnb' | 'booking' | 'maintenance';

export interface PropertyBlock {
  id: number;
  property_id: number;
  start_date: string; // YYYY-MM-DD
  end_date: string; // YYYY-MM-DD
  block_type: BlockType;
  source_reference?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface IcalSource {
  id: number;
  property_id: number;
  provider: 'airbnb' | 'booking' | 'vrbo';
  ical_url: string;
  last_sync_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ImportedCalendarEvent {
  id: number;
  property_id: number;
  external_uid: string;
  source_provider: 'airbnb' | 'booking' | 'vrbo';
  start_date: string; // YYYY-MM-DD
  end_date: string; // YYYY-MM-DD
  summary?: string;
  last_seen_at: string;
  created_at: string;
  updated_at: string;
}

// A confirmed (non-cancelled) reservation, as returned for the admin
// calendar — guest contact info (email/phone) is intentionally omitted,
// the calendar only needs to show that a date is taken and by whom.
export interface CalendarReservation {
  id: string;
  property_id: number;
  checkin: string; // YYYY-MM-DD
  checkout: string; // YYYY-MM-DD
  name: string;
  guests: number;
  payment_status: 'pending' | 'paid' | 'failed';
}

export type DayStatus =
  | 'available'
  | 'manual'
  | 'airbnb'
  | 'booking'
  | 'maintenance'
  | 'reserved'
  | 'synced';

export interface CalendarDay {
  date: string; // YYYY-MM-DD
  dayOfMonth: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  status: DayStatus;
  block?: PropertyBlock;
  event?: ImportedCalendarEvent;
  reservation?: CalendarReservation;
}

export interface AvailabilityCalendarData {
  blocks: PropertyBlock[];
  ical_sources: IcalSource[];
  imported_events: ImportedCalendarEvent[];
  reservations: CalendarReservation[];
}

export interface BlockFormData {
  startDate: string;
  endDate: string;
  blockType: BlockType;
  notes: string;
}

export const BLOCK_COLORS: Record<DayStatus, string> = {
  available: '#10b981', // Green
  manual: '#ef4444', // Red
  airbnb: '#a855f7', // Purple
  booking: '#7f1d1d', // Dark Red
  maintenance: '#6b7280', // Gray
  reserved: '#2563eb', // Blue — confirmed booking on this site
  synced: '#06b6d4', // Cyan — taken according to a synced external calendar
};

export const BLOCK_LABELS: Record<DayStatus, string> = {
  available: 'Available',
  manual: 'Manual Block',
  airbnb: 'Airbnb Block',
  booking: 'Booking Block',
  maintenance: 'Maintenance Block',
  reserved: 'Reserved',
  synced: 'Synced (external)',
};
