-- DarRent - Review System Table Fix
-- This file adds the created_at column to the property_reviews and renter_reviews tables
-- if they already exist in the database

-- ==========================================
-- Add created_at to Review Tables
-- ==========================================

-- Add created_at column to property_reviews table if it exists but doesn't have the column
ALTER TABLE IF EXISTS property_reviews 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();

-- Add created_at column to renter_reviews table if it exists but doesn't have the column
ALTER TABLE IF EXISTS renter_reviews 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();

-- Update existing reviews without a created_at value
-- to have a created_at value equal to review_date
UPDATE property_reviews 
SET created_at = review_date 
WHERE created_at IS NULL AND review_date IS NOT NULL;

UPDATE renter_reviews 
SET created_at = review_date 
WHERE created_at IS NULL AND review_date IS NOT NULL;

-- For any reviews still without created_at, set to current time
UPDATE property_reviews 
SET created_at = NOW() 
WHERE created_at IS NULL;

UPDATE renter_reviews 
SET created_at = NOW() 
WHERE created_at IS NULL;

-- Log that this fix was applied
DO $$
BEGIN
  RAISE NOTICE 'Review system tables fix applied successfully';
END;
$$; 