-- Adds cleaning_fee and monetary_fee as real, per-property columns on
-- property_pricing, instead of the hardcoded values that used to live in
-- AvailabilityController::getFeesForProperty() / PricingController's copy
-- of the same method.
--
-- Run this once against an existing MySQL "shelter" database that was
-- created before these columns existed (fresh installs get them directly
-- from schema.sql). Safe to re-run — the ALTERs are guarded.

ALTER TABLE property_pricing
  ADD COLUMN IF NOT EXISTS cleaning_fee DECIMAL(10,2) NOT NULL DEFAULT 40 CHECK (cleaning_fee >= 0),
  ADD COLUMN IF NOT EXISTS monetary_fee DECIMAL(10,2) NOT NULL DEFAULT 40 CHECK (monetary_fee >= 0);

-- Backfill with the exact values that were previously hardcoded, so
-- behavior doesn't change for properties that already have a pricing row.
UPDATE property_pricing SET cleaning_fee = 80, monetary_fee = 80 WHERE property_id IN (1, 2); -- Shelter A, Shelter B
UPDATE property_pricing SET cleaning_fee = 40, monetary_fee = 40 WHERE property_id IN (3, 4); -- La Maison Modern, La Refuge de la Martre
