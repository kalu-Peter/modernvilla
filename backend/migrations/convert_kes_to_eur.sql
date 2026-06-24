-- One-time conversion of existing price data from KES to EUR.
-- The app used to convert admin-entered EUR prices to KES (at a fixed
-- 130 KES/EUR rate) before saving. The app now saves EUR directly, so any
-- rows entered before this change need to be divided by 130 to read
-- correctly going forward.
--
-- Run this once against the Supabase/Postgres database, after deploying
-- the EUR-based frontend/backend changes. Safe to re-run only if you
-- haven't re-entered prices in EUR yet (running it twice will halve
-- already-correct values).

BEGIN;

UPDATE property_pricing
SET weekday_price = ROUND(weekday_price / 130, 2),
    weekend_price = ROUND(weekend_price / 130, 2),
    extra_person_fee = ROUND(extra_person_fee / 130, 2);

UPDATE pricing_overrides
SET price = ROUND(price / 130, 2);

UPDATE reservations
SET total_price = ROUND(total_price / 130, 2);

COMMIT;
