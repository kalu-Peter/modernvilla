-- Add beds column if it doesn't exist
ALTER TABLE properties ADD COLUMN IF NOT EXISTS beds INT;

-- Update all properties with correct guest counts and beds
UPDATE properties SET max_guests = 8, beds = 7 WHERE name = 'Shelter A';
UPDATE properties SET max_guests = 8, beds = 7 WHERE name = 'Shelter B';
UPDATE properties SET max_guests = 15, beds = 13 WHERE name = 'La Maison Modern';
UPDATE properties SET max_guests = 15, beds = 14 WHERE name = 'La Refuge de la Martre';

-- Verify the updates
SELECT id, name, max_guests, bedrooms, beds, bathrooms FROM properties ORDER BY name;
