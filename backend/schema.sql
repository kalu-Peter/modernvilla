-- ============================================================
-- Crocodile Villas – Supabase PostgreSQL Schema
-- Run this in the Supabase SQL editor
-- ============================================================

-- 1. PROPERTIES (reference list)
CREATE TABLE IF NOT EXISTS properties (
  id            SERIAL PRIMARY KEY,
  name          TEXT NOT NULL UNIQUE,
  description   TEXT,
  max_guests    INT  NOT NULL DEFAULT 12,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO properties (name, description, max_guests) VALUES
  ('Blue Villa',           'Oceanview villa with private pool',     8),
  ('Green Villa',          'Garden retreat with forest views',      8),
  ('Gold Lodge',           'Luxury lodge with premium amenities',  21),
  ('Blue Baobab Apartment','Cosy apartment near the baobab grove',  4)
ON CONFLICT (name) DO NOTHING;


-- 2. PRICING (per-property, per-guest-range, per-night in Ksh)
CREATE TABLE IF NOT EXISTS pricing (
  id            SERIAL PRIMARY KEY,
  property_name TEXT NOT NULL REFERENCES properties(name) ON DELETE CASCADE,
  min_guests    INT  NOT NULL,
  max_guests    INT  NOT NULL,
  price         NUMERIC(10,2) NOT NULL,
  CONSTRAINT pricing_range_check CHECK (min_guests <= max_guests)
);

-- Ksh 6,000 per guest per night for all properties
INSERT INTO pricing (property_name, min_guests, max_guests, price) VALUES
  ('Blue Villa',            1,  8,  6000),
  ('Green Villa',           1,  8,  6000),
  ('Gold Lodge',            1, 21,  6000),
  ('Blue Baobab Apartment', 1,  4,  6000)
ON CONFLICT DO NOTHING;


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


-- 5. SEASONAL PRICING (date-range price overrides per villa)
CREATE TABLE IF NOT EXISTS seasonal_pricing (
  id               SERIAL PRIMARY KEY,
  villa_id         TEXT NOT NULL,
  label            TEXT NOT NULL DEFAULT 'Custom Rate',
  start_date       DATE NOT NULL,
  end_date         DATE NOT NULL,
  price_per_night  NUMERIC(10,2) NOT NULL CHECK (price_per_night > 0),
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT seasonal_end_after_start CHECK (end_date >= start_date)
);

CREATE INDEX IF NOT EXISTS idx_seasonal_pricing_villa_dates
  ON seasonal_pricing (villa_id, start_date, end_date);


-- 6. ADMIN USERS (username/password login for the admin panel)
CREATE TABLE IF NOT EXISTS admin_users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username      TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);


-- ── Additional properties (Mango & Paradise) ─────────────────────────────────
INSERT INTO properties (name, description, max_guests) VALUES
  ('Mango Villa',           'Spacious mango park villa',              8),
  ('Mango Villa 1st Floor', 'Upper-floor unit in the mango park',     4),
  ('Paradise Villa',        'Premium beachside paradise villa',       8)
ON CONFLICT (name) DO NOTHING;

INSERT INTO pricing (property_name, min_guests, max_guests, price) VALUES
  ('Mango Villa',           1, 8, 6000),
  ('Mango Villa 1st Floor', 1, 4, 6000),
  ('Paradise Villa',        1, 8, 6000)
ON CONFLICT DO NOTHING;
