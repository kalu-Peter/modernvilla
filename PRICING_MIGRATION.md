# Pricing Tiers Migration Guide

## Overview

The pricing system has been refactored to support three pricing types instead of date-range based pricing:

- **Single Day**: Specific day pricing
- **Weekend**: All-weekend pricing
- **Yearly**: Base/annual pricing

## Database Migration

You need to run this SQL in Supabase to create the new `pricing_tiers` table:

```sql
-- Create new pricing_tiers table
CREATE TABLE IF NOT EXISTS pricing_tiers (
  id               SERIAL PRIMARY KEY,
  property_name    TEXT NOT NULL REFERENCES properties(name) ON DELETE CASCADE,
  tier_type        TEXT NOT NULL CHECK (tier_type IN ('single_day', 'weekend', 'yearly')),
  specific_date    DATE,
  base_price       NUMERIC(10,2) NOT NULL CHECK (base_price > 0),
  extra_person_fee NUMERIC(10,2),
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT pricing_single_day_unique UNIQUE (property_name, tier_type, specific_date),
  CONSTRAINT pricing_weekend_yearly_unique UNIQUE (property_name, tier_type) WHERE tier_type IN ('weekend', 'yearly'),
  CONSTRAINT single_day_needs_date CHECK ((tier_type = 'single_day' AND specific_date IS NOT NULL) OR tier_type != 'single_day'),
  CONSTRAINT non_single_day_no_date CHECK ((tier_type != 'single_day' AND specific_date IS NULL) OR tier_type = 'single_day')
);

CREATE INDEX IF NOT EXISTS idx_pricing_tiers_property
  ON pricing_tiers (property_name, tier_type);

CREATE INDEX IF NOT EXISTS idx_pricing_tiers_single_day
  ON pricing_tiers (property_name, specific_date) WHERE tier_type = 'single_day';
```

### Steps:

1. Go to Supabase Dashboard → SQL Editor
2. Create a new query
3. Copy and paste the SQL above
4. Click "Run"
5. Verify the table is created by checking Tables in the left sidebar

## Backend Changes

- Updated `PricingController.php` to support upsert operations on `pricing_tiers` table
- Supports POST/PUT requests with `property_name`, `tier_type`, `base_price`, `extra_person_fee`, and optional `specific_date`

## Frontend Changes

- Replaced calendar-based UI with simpler three-tier pricing management
- Each property can have up to 3 pricing tiers:
  - Single day pricing: Edit by specific date
  - Weekend pricing: Single price for all weekends
  - Yearly pricing: Base annual price

## API Endpoint

**POST/PUT** `/api/admin/seasonal-pricing`

Request body:

```json
{
  "property_name": "Shelter A",
  "tier_type": "yearly",
  "base_price": 100,
  "extra_person_fee": 15
}
```

For single_day:

```json
{
  "property_name": "Shelter A",
  "tier_type": "single_day",
  "specific_date": "2026-12-25",
  "base_price": 200,
  "extra_person_fee": 20
}
```

## Migration from Old Data (Optional)

If you want to migrate existing seasonal pricing data from the old `seasonal_pricing` table:

```sql
-- Example: Insert weekend rates from old data
INSERT INTO pricing_tiers (property_name, tier_type, base_price)
SELECT DISTINCT property_name, 'weekend', base_price
FROM seasonal_pricing
WHERE label ILIKE '%weekend%'
ON CONFLICT DO NOTHING;

-- Example: Insert yearly rates
INSERT INTO pricing_tiers (property_name, tier_type, base_price)
SELECT DISTINCT property_name, 'yearly', base_price
FROM seasonal_pricing
WHERE label ILIKE '%yearly%' OR label ILIKE '%annual%'
ON CONFLICT DO NOTHING;
```

## Notes

- The old `seasonal_pricing` table remains for backward compatibility
- New pricing uses the `pricing_tiers` table exclusively
- Each tier type is unique per property (can't have multiple weekend or yearly rates)
- Single day rates can have multiple entries (one per date)
