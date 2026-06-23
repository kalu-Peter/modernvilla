-- ============================================================
-- Modern Shelter – PostgreSQL Schema
-- Run this in the Supabase SQL editor
-- ============================================================

-- 1. PROPERTIES (reference list)
CREATE TABLE IF NOT EXISTS properties (
  id            SERIAL PRIMARY KEY,
  name          TEXT NOT NULL UNIQUE,
  description   TEXT,
  max_guests    INT  NOT NULL DEFAULT 12,
  bedrooms      INT,
  bathrooms     INT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO properties (name, description, max_guests, bedrooms, bathrooms) VALUES
  ('Shelter A',             'Premium 3-bedroom rental unit in Griesheim-près-Molsheim, ideal for extended stays. 8 guests max.',                  8, 3, 1),
  ('Shelter B',             'The Agaves Refuge - Charming 3-bedroom cottage in Griesheim-près-Molsheim with fenced garden. 7 guests max.',     7, 3, 1),
  ('La Maison Modern',      'Beautiful modern 5-bedroom house with underfloor heating in Griesheim-près-Molsheim. 15 guests max.',           15, 5, 2),
  ('La Refuge de la Martre','Charming renovated farmhouse with 6 bedrooms in Griesheim-près-Molsheim. 15 guests max.',                      15, 6, 2)
ON CONFLICT (name) DO NOTHING;


-- 2. PRICING (per-property, per-night base price)
CREATE TABLE IF NOT EXISTS pricing (
  id            SERIAL PRIMARY KEY,
  property_name TEXT NOT NULL REFERENCES properties(name) ON DELETE CASCADE,
  base_guests   INT  NOT NULL,
  base_price    NUMERIC(10,2) NOT NULL,
  extra_person_fee NUMERIC(10,2),
  CONSTRAINT unique_property_pricing UNIQUE (property_name)
);

-- Base pricing: up to base_guests included, extra person fee applies beyond that
INSERT INTO pricing (property_name, base_guests, base_price, extra_person_fee) VALUES
  ('Shelter A',             6,  76,  15),
  ('Shelter B',             6,  76,  15),
  ('La Maison Modern',      6, 235,  15),
  ('La Refuge de la Martre',6, 195,  15)
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


-- 5. SEASONAL PRICING (date-range price overrides per property)
CREATE TABLE IF NOT EXISTS seasonal_pricing (
  id               SERIAL PRIMARY KEY,
  property_name    TEXT NOT NULL REFERENCES properties(name) ON DELETE CASCADE,
  label            TEXT NOT NULL DEFAULT 'Custom Rate',
  start_date       DATE NOT NULL,
  end_date         DATE NOT NULL,
  base_price       NUMERIC(10,2) NOT NULL CHECK (base_price > 0),
  extra_person_fee NUMERIC(10,2),
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT seasonal_end_after_start CHECK (end_date >= start_date)
);

CREATE INDEX IF NOT EXISTS idx_seasonal_pricing_property_dates
  ON seasonal_pricing (property_name, start_date, end_date);


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
