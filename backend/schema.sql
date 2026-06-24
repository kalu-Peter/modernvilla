-- ============================================================
-- Alsace Hideaways – PostgreSQL Schema
-- Run this in the Supabase SQL editor
-- ============================================================

-- 1. PROPERTIES (reference list)
CREATE TABLE IF NOT EXISTS properties (
  id            SERIAL PRIMARY KEY,
  name          TEXT NOT NULL UNIQUE,
  description   TEXT,
  max_guests    INT  NOT NULL DEFAULT 12,
  bedrooms      INT,
  beds          INT,
  bathrooms     INT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO properties (name, description, max_guests, bedrooms, beds, bathrooms) VALUES
  ('Shelter A',             'Premium 3-bedroom rental unit in Griesheim-près-Molsheim, ideal for extended stays. 8 guests max.',                  8, 3, 7, 1),
  ('Shelter B',             'The Agaves Refuge - Charming 3-bedroom cottage in Griesheim-près-Molsheim with fenced garden. 8 guests max.',     8, 3, 7, 1),
  ('La Maison Modern',      'Beautiful modern 5-bedroom house with underfloor heating in Griesheim-près-Molsheim. 15 guests max.',           15, 5, 13, 2),
  ('La Refuge de la Martre','Charming renovated farmhouse with 6 bedrooms in Griesheim-près-Molsheim. 15 guests max.',                      15, 6, 14, 2)
ON CONFLICT (name) DO NOTHING;


-- 2. PROPERTY PRICING (base weekday/weekend rates per property)
CREATE TABLE IF NOT EXISTS property_pricing (
    property_id INTEGER PRIMARY KEY
        REFERENCES properties(id) ON DELETE CASCADE,

    weekday_price NUMERIC(10,2) NOT NULL
        CHECK (weekday_price > 0),

    weekend_price NUMERIC(10,2) NOT NULL
        CHECK (weekend_price > 0),

    extra_person_fee NUMERIC(10,2) NOT NULL DEFAULT 0
        CHECK (extra_person_fee >= 0),

    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- 3. RESERVATIONS
CREATE TABLE IF NOT EXISTS reservations (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_name  TEXT NOT NULL REFERENCES properties(name),
  guests         INT  NOT NULL CHECK (guests >= 1),
  checkin        DATE NOT NULL,
  checkout       DATE NOT NULL,
  name           TEXT NOT NULL,
  phone          TEXT NOT NULL,
  email          TEXT NOT NULL,
  total_price    NUMERIC(10,2) NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'pending'
                   CHECK (payment_status IN ('pending','paid','failed')),
  confirmed      BOOLEAN NOT NULL DEFAULT FALSE,
  cancelled      BOOLEAN NOT NULL DEFAULT FALSE,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT checkout_after_checkin CHECK (checkout > checkin)
);

CREATE INDEX IF NOT EXISTS idx_reservations_property_dates
  ON reservations (property_name, checkin, checkout);


-- 4. BLOCKED DATES
CREATE TABLE IF NOT EXISTS blocked_dates (
  id            SERIAL PRIMARY KEY,
  property_name TEXT NOT NULL REFERENCES properties(name),
  blocked_date  DATE NOT NULL,
  reason        TEXT NOT NULL DEFAULT 'manual_block'
                  CHECK (reason IN ('maintenance','manual_block')),
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (property_name, blocked_date)
);

CREATE INDEX IF NOT EXISTS idx_blocked_dates_property
  ON blocked_dates (property_name, blocked_date);


-- 5. PRICING OVERRIDES (date-specific price overrides)
CREATE TABLE IF NOT EXISTS pricing_overrides (
    property_id INTEGER NOT NULL
        REFERENCES properties(id) ON DELETE CASCADE,

    override_date DATE NOT NULL,

    price NUMERIC(10,2) NOT NULL
        CHECK (price > 0),

    reason VARCHAR(255),

    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (property_id, override_date)
);

CREATE INDEX IF NOT EXISTS idx_pricing_overrides_property
  ON pricing_overrides (property_id, override_date);


-- 6. ADMIN USERS (username/password login for the admin panel)
CREATE TABLE IF NOT EXISTS admin_users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username      TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default admin user
-- Username: admin
-- Password: admin123 (bcrypt hash - change this in production!)
INSERT INTO admin_users (username, password_hash) VALUES
  ('admin', '$2y$10$YOixf7yqsz7sStoeckQH2OPST9/PgBkqquzi.Ee8KwFVF87.s6nm')
ON CONFLICT (username) DO NOTHING;


-- 7. PROPERTY BLOCKS (date blocking for manual, airbnb, booking, maintenance)
CREATE TABLE IF NOT EXISTS property_blocks (
  id               BIGSERIAL PRIMARY KEY,
  property_id      INTEGER NOT NULL
                   REFERENCES properties(id) ON DELETE CASCADE,
  start_date       DATE NOT NULL,
  end_date         DATE NOT NULL,
  block_type       VARCHAR(50) NOT NULL
                   CHECK (block_type IN ('manual', 'airbnb', 'booking', 'maintenance')),
  source_reference VARCHAR(255),
  notes            TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT end_after_start CHECK (end_date >= start_date),
  CONSTRAINT valid_block_range CHECK (end_date - start_date <= 730) -- max 2 years
);

CREATE INDEX IF NOT EXISTS idx_property_blocks_property_dates
  ON property_blocks (property_id, start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_property_blocks_type
  ON property_blocks (property_id, block_type);


-- 8. PROPERTY ICAL SOURCES (iCal feed URLs for syncing)
CREATE TABLE IF NOT EXISTS property_ical_sources (
  id               BIGSERIAL PRIMARY KEY,
  property_id      INTEGER NOT NULL
                   REFERENCES properties(id) ON DELETE CASCADE,
  provider         VARCHAR(50) NOT NULL
                   CHECK (provider IN ('airbnb', 'booking', 'vrbo')),
  ical_url         TEXT NOT NULL,
  last_sync_at     TIMESTAMPTZ,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_provider_per_property UNIQUE (property_id, provider)
);

CREATE INDEX IF NOT EXISTS idx_property_ical_sources_property
  ON property_ical_sources (property_id);


-- 9. IMPORTED CALENDAR EVENTS (events parsed from synced iCal feeds)
CREATE TABLE IF NOT EXISTS imported_calendar_events (
  id               BIGSERIAL PRIMARY KEY,
  property_id      INTEGER NOT NULL
                   REFERENCES properties(id) ON DELETE CASCADE,
  external_uid     VARCHAR(255) NOT NULL,
  source_provider  VARCHAR(50) NOT NULL
                   CHECK (source_provider IN ('airbnb', 'booking', 'vrbo')),
  start_date       DATE NOT NULL,
  end_date         DATE NOT NULL,
  summary          TEXT,
  last_seen_at     TIMESTAMPTZ DEFAULT NOW(),
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT end_after_start CHECK (end_date >= start_date),
  CONSTRAINT unique_external_event UNIQUE (external_uid, property_id, source_provider)
);

CREATE INDEX IF NOT EXISTS idx_imported_calendar_events_property_dates
  ON imported_calendar_events (property_id, start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_imported_calendar_events_provider
  ON imported_calendar_events (property_id, source_provider);

