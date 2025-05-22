-- DarRent - Property Update Days Listed Fix
-- This file fixes the error with the update_days_listed function by ensuring the properties table has a created_at field

-- ==========================================
-- Add created_at to Properties Table
-- ==========================================

-- First, add the created_at column to properties table if it doesn't exist
ALTER TABLE properties ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();

-- Update existing properties without a created_at value
-- to have a created_at value equal to listing_date
UPDATE properties 
SET created_at = listing_date 
WHERE created_at IS NULL AND listing_date IS NOT NULL;

-- For any properties still without created_at, set to current time
UPDATE properties 
SET created_at = NOW() 
WHERE created_at IS NULL;

-- ==========================================
-- Fix or Create update_days_listed Function
-- ==========================================

-- Create a function that can properly set days_listed based on created_at
CREATE OR REPLACE FUNCTION update_days_listed()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  -- Calculate days_listed based on created_at field
  NEW.days_listed = EXTRACT(DAY FROM (NOW() - NEW.created_at))::INTEGER;
  RETURN NEW;
END;
$$;

-- Create the trigger if it doesn't exist
DROP TRIGGER IF EXISTS update_days_listed_trigger ON properties;
CREATE TRIGGER update_days_listed_trigger
BEFORE INSERT OR UPDATE ON properties
FOR EACH ROW
EXECUTE FUNCTION update_days_listed();

-- ==========================================
-- Update all existing properties
-- ==========================================

-- Update days_listed for all existing properties
UPDATE properties 
SET days_listed = EXTRACT(DAY FROM (NOW() - created_at))::INTEGER;

-- Log that this fix was applied
DO $$
BEGIN
  RAISE NOTICE 'Property days_listed fix applied successfully';
END;
$$; 