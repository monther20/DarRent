-- DarRent - Review System Trigger Fix
-- This file fixes the review_added_trigger function with proper PostgreSQL UPDATE syntax

-- ==========================================
-- Fix review_added_trigger Function
-- ==========================================

-- Create or replace the review_added_trigger function with corrected syntax
CREATE OR REPLACE FUNCTION review_added_trigger()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  -- For property reviews, update the property's rating 
  IF TG_TABLE_NAME = 'property_reviews' THEN
    WITH ratings AS (
      SELECT AVG(rating) as avg_rating, COUNT(*) as count
      FROM property_reviews
      WHERE property_id = NEW.property_id AND visible = TRUE
    )
    UPDATE properties p
    SET 
      rating = r.avg_rating,
      review_count = r.count
    FROM ratings r
    WHERE p.id = NEW.property_id;
  
  -- For renter reviews, update the renter's rating
  ELSIF TG_TABLE_NAME = 'renter_reviews' THEN
    -- First, get the user_id for this renter
    WITH ratings AS (
      SELECT AVG(rating) as avg_rating, COUNT(*) as count
      FROM renter_reviews
      WHERE renter_id = NEW.renter_id AND visible = TRUE
    ),
    renter_user AS (
      SELECT user_id 
      FROM renters 
      WHERE id = NEW.renter_id
    )
    UPDATE users u
    SET 
      average_rating = r.avg_rating,
      review_count = r.count
    FROM ratings r, renter_user ru
    WHERE u.id = ru.user_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Drop and recreate the property_review_added trigger
DROP TRIGGER IF EXISTS property_review_added ON property_reviews;
CREATE TRIGGER property_review_added
AFTER INSERT ON property_reviews
FOR EACH ROW
EXECUTE FUNCTION review_added_trigger();

-- Drop and recreate the renter_review_added trigger
DROP TRIGGER IF EXISTS renter_review_added ON renter_reviews;
CREATE TRIGGER renter_review_added
AFTER INSERT ON renter_reviews
FOR EACH ROW
EXECUTE FUNCTION review_added_trigger();

-- ==========================================
-- Fix review_updated_trigger Function
-- ==========================================

-- Also fix the review_updated_trigger function with the same pattern
CREATE OR REPLACE FUNCTION review_updated_trigger()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  -- Only fire if rating or visibility has changed
  IF NEW.rating != OLD.rating OR NEW.visible != OLD.visible THEN
    -- For property reviews, update the property's rating 
    IF TG_TABLE_NAME = 'property_reviews' THEN
      WITH ratings AS (
        SELECT AVG(rating) as avg_rating, COUNT(*) as count
        FROM property_reviews
        WHERE property_id = NEW.property_id AND visible = TRUE
      )
      UPDATE properties p
      SET 
        rating = r.avg_rating,
        review_count = r.count
      FROM ratings r
      WHERE p.id = NEW.property_id;
    
    -- For renter reviews, update the renter's rating
    ELSIF TG_TABLE_NAME = 'renter_reviews' THEN
      -- First, get the user_id for this renter
      WITH ratings AS (
        SELECT AVG(rating) as avg_rating, COUNT(*) as count
        FROM renter_reviews
        WHERE renter_id = NEW.renter_id AND visible = TRUE
      ),
      renter_user AS (
        SELECT user_id 
        FROM renters 
        WHERE id = NEW.renter_id
      )
      UPDATE users u
      SET 
        average_rating = r.avg_rating,
        review_count = r.count
      FROM ratings r, renter_user ru
      WHERE u.id = ru.user_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Drop and recreate the property_review_updated trigger
DROP TRIGGER IF EXISTS property_review_updated ON property_reviews;
CREATE TRIGGER property_review_updated
AFTER UPDATE ON property_reviews
FOR EACH ROW
EXECUTE FUNCTION review_updated_trigger();

-- Drop and recreate the renter_review_updated trigger
DROP TRIGGER IF EXISTS renter_review_updated ON renter_reviews;
CREATE TRIGGER renter_review_updated
AFTER UPDATE ON renter_reviews
FOR EACH ROW
EXECUTE FUNCTION review_updated_trigger();

-- Log that this fix was applied
DO $$
BEGIN
  RAISE NOTICE 'Review system triggers fix applied successfully';
END;
$$; 