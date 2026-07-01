-- Migration: replace monetary_fee with linen_fee (per-person bed linen & towel fee)
-- Run this once in phpMyAdmin on production.
-- monetary_fee was a flat fee; linen_fee is a per-person rate (default 12 EUR/person).

ALTER TABLE property_pricing
  ADD COLUMN IF NOT EXISTS linen_fee DECIMAL(10,2) NOT NULL DEFAULT 12
      CHECK (linen_fee >= 0) AFTER cleaning_fee;

ALTER TABLE property_pricing
  DROP COLUMN IF EXISTS monetary_fee;
