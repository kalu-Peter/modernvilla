-- Adds:
-- 1. property_pricing.deposit_amount — per-property security deposit (caution)
--    amount, separate from and much smaller than the rental total. Used when
--    an admin approves a reservation to create a Swikly Deposit request.
-- 2. reservations.swikly_request_id / swikly_link — correlates a reservation
--    with the Swikly deposit request created for it, so the admin dashboard
--    can re-show/re-send the payment link without recreating the request.
--
-- Safe to re-run — the ALTERs are guarded and the seed values only apply
-- to rows that don't already have a value set.

ALTER TABLE property_pricing
  ADD COLUMN IF NOT EXISTS deposit_amount DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (deposit_amount >= 0);

ALTER TABLE reservations
  ADD COLUMN IF NOT EXISTS swikly_request_id VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS swikly_link VARCHAR(500) NULL;

-- Seed test deposit values (admin-provided, 2026-06-28) — adjust later via
-- the Pricing Calendar admin UI once that's wired up for this field, or by
-- editing these rows directly.
UPDATE property_pricing SET deposit_amount = 150 WHERE property_id = 1; -- Shelter A
UPDATE property_pricing SET deposit_amount = 150 WHERE property_id = 2; -- Shelter B
UPDATE property_pricing SET deposit_amount = 300 WHERE property_id = 3; -- La Maison Modern
UPDATE property_pricing SET deposit_amount = 200 WHERE property_id = 4; -- La Refuge de la Martre
