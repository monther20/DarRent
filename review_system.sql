-- DarRent - Complete Review System Implementation
-- This file implements the database schema and functions for the property and renter review systems

-- ==========================================
-- Review System Database Schema
-- ==========================================

-- Property Reviews Table
CREATE TABLE IF NOT EXISTS property_reviews (
  id TEXT PRIMARY KEY,
  property_id TEXT REFERENCES properties(id) ON DELETE CASCADE,
  renter_id TEXT REFERENCES renters(id) ON DELETE SET NULL,
  contract_id TEXT REFERENCES rental_contracts(id) ON DELETE SET NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review_text_en TEXT,
  review_text_ar TEXT,
  review_date TIMESTAMP DEFAULT NOW(),
  visible BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Renter Reviews Table
CREATE TABLE IF NOT EXISTS renter_reviews (
  id TEXT PRIMARY KEY,
  renter_id TEXT REFERENCES renters(id) ON DELETE CASCADE,
  landlord_id TEXT REFERENCES landlords(id) ON DELETE SET NULL,
  contract_id TEXT REFERENCES rental_contracts(id) ON DELETE SET NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review_text_en TEXT,
  review_text_ar TEXT,
  review_date TIMESTAMP DEFAULT NOW(),
  visible BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Add rating and review count columns to properties and users tables if they don't exist
ALTER TABLE properties
ADD COLUMN IF NOT EXISTS rating NUMERIC DEFAULT NULL,
ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0;

ALTER TABLE users
ADD COLUMN IF NOT EXISTS average_rating NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_property_reviews_property_id ON property_reviews(property_id);
CREATE INDEX IF NOT EXISTS idx_property_reviews_renter_id ON property_reviews(renter_id);
CREATE INDEX IF NOT EXISTS idx_property_reviews_contract_id ON property_reviews(contract_id);
CREATE INDEX IF NOT EXISTS idx_property_reviews_rating ON property_reviews(rating);
CREATE INDEX IF NOT EXISTS idx_property_reviews_visible ON property_reviews(visible);

CREATE INDEX IF NOT EXISTS idx_renter_reviews_renter_id ON renter_reviews(renter_id);
CREATE INDEX IF NOT EXISTS idx_renter_reviews_landlord_id ON renter_reviews(landlord_id);
CREATE INDEX IF NOT EXISTS idx_renter_reviews_contract_id ON renter_reviews(contract_id);
CREATE INDEX IF NOT EXISTS idx_renter_reviews_rating ON renter_reviews(rating);
CREATE INDEX IF NOT EXISTS idx_renter_reviews_visible ON renter_reviews(visible);

-- ==========================================
-- Review Management Functions
-- ==========================================

-- Add property review (by renter)
CREATE OR REPLACE FUNCTION add_property_review(
  p_property_id TEXT,
  p_renter_id TEXT,
  p_rating INT,
  p_review_text_en TEXT,
  p_review_text_ar TEXT DEFAULT NULL
) RETURNS TEXT LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_review_id TEXT;
  v_contract_id TEXT;
  v_property_owner_id TEXT;
  v_property_owner_user_id TEXT;
  v_renter_user_id TEXT;
  v_property_title TEXT;
BEGIN
  -- Check if renter has rented this property
  SELECT id INTO v_contract_id
  FROM rental_contracts
  WHERE 
    property_id = p_property_id
    AND renter_id = p_renter_id
    AND status IN ('completed', 'terminated', 'expired')
    AND end_date < NOW();
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Renter cannot review a property they have not rented or whose contract is not yet complete';
  END IF;
  
  -- Check if renter has already reviewed this property
  IF EXISTS (
    SELECT 1 FROM property_reviews
    WHERE property_id = p_property_id AND renter_id = p_renter_id
  ) THEN
    RAISE EXCEPTION 'Renter has already reviewed this property';
  END IF;
  
  -- Get property title and owner info for notification
  SELECT 
    p.title_en,
    p.owner_id
  INTO 
    v_property_title,
    v_property_owner_id
  FROM properties p
  WHERE p.id = p_property_id;
  
  -- Get user IDs for notifications
  SELECT u.id INTO v_property_owner_user_id
  FROM landlords l
  JOIN users u ON l.user_id = u.id
  WHERE l.id = v_property_owner_id;
  
  SELECT u.id INTO v_renter_user_id
  FROM renters r
  JOIN users u ON r.user_id = u.id
  WHERE r.id = p_renter_id;
  
  -- Generate a new ID
  v_review_id := gen_random_uuid()::TEXT;
  
  -- Insert review
  INSERT INTO property_reviews (
    id,
    property_id,
    renter_id,
    contract_id,
    rating,
    review_text_en,
    review_text_ar,
    review_date,
    created_at
  ) VALUES (
    v_review_id,
    p_property_id,
    p_renter_id,
    v_contract_id,
    p_rating,
    p_review_text_en,
    p_review_text_ar,
    NOW(),
    NOW()
  );
  
  -- Update property average rating
  WITH ratings AS (
    SELECT AVG(rating) as avg_rating, COUNT(*) as count
    FROM property_reviews
    WHERE property_id = p_property_id AND visible = TRUE
  )
  UPDATE properties p
  SET 
    rating = r.avg_rating,
    review_count = r.count
  FROM ratings r
  WHERE p.id = p_property_id;
  
  -- Create notification for property owner
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notifications') THEN
    INSERT INTO notifications (
      id,
      user_id,
      title_en,
      content_en,
      type,
      related_id,
      is_read
    ) VALUES (
      gen_random_uuid()::TEXT,
      v_property_owner_user_id,
      'New Property Review',
      'A renter has left a ' || p_rating || '-star review for your property "' || v_property_title || '".',
      'property_review',
      v_review_id,
      FALSE
    );
  END IF;
  
  RETURN v_review_id;
END;
$$;

-- Add renter review (by landlord)
CREATE OR REPLACE FUNCTION add_renter_review(
  p_renter_id TEXT,
  p_landlord_id TEXT,
  p_rating INT,
  p_review_text_en TEXT,
  p_review_text_ar TEXT DEFAULT NULL
) RETURNS TEXT LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_review_id TEXT;
  v_contract_id TEXT;
  v_renter_user_id TEXT;
  v_renter_name TEXT;
BEGIN
  -- Check if landlord has rented to this renter
  SELECT rc.id INTO v_contract_id
  FROM rental_contracts rc
  JOIN properties p ON rc.property_id = p.id
  WHERE 
    rc.renter_id = p_renter_id
    AND p.owner_id = p_landlord_id
    AND rc.status IN ('completed', 'terminated', 'expired')
    AND rc.end_date < NOW();
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Landlord cannot review a renter they have not rented to or whose contract is not yet complete';
  END IF;
  
  -- Check if landlord has already reviewed this renter for this contract
  IF EXISTS (
    SELECT 1 FROM renter_reviews
    WHERE renter_id = p_renter_id AND landlord_id = p_landlord_id AND contract_id = v_contract_id
  ) THEN
    RAISE EXCEPTION 'Landlord has already reviewed this renter for this contract';
  END IF;
  
  -- Get renter info for notification
  SELECT u.id, u.full_name_en INTO v_renter_user_id, v_renter_name
  FROM renters r
  JOIN users u ON r.user_id = u.id
  WHERE r.id = p_renter_id;
  
  -- Generate a new ID
  v_review_id := gen_random_uuid()::TEXT;
  
  -- Insert review
  INSERT INTO renter_reviews (
    id,
    renter_id,
    landlord_id,
    contract_id,
    rating,
    review_text_en,
    review_text_ar,
    review_date,
    created_at
  ) VALUES (
    v_review_id,
    p_renter_id,
    p_landlord_id,
    v_contract_id,
    p_rating,
    p_review_text_en,
    p_review_text_ar,
    NOW(),
    NOW()
  );
  
  -- Update renter average rating
  WITH ratings AS (
    SELECT AVG(rating) as avg_rating, COUNT(*) as count
    FROM renter_reviews
    WHERE renter_id = p_renter_id AND visible = TRUE
  )
  UPDATE users u
  SET 
    average_rating = r.avg_rating,
    review_count = r.count
  FROM ratings r
  JOIN renters rn ON u.id = rn.user_id
  WHERE rn.id = p_renter_id;
  
  -- Create notification for renter
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notifications') THEN
    INSERT INTO notifications (
      id,
      user_id,
      title_en,
      content_en,
      type,
      related_id,
      is_read
    ) VALUES (
      gen_random_uuid()::TEXT,
      v_renter_user_id,
      'New Renter Review',
      'A landlord has left you a ' || p_rating || '-star review.',
      'renter_review',
      v_review_id,
      FALSE
    );
  END IF;
  
  RETURN v_review_id;
END;
$$;

-- Get property reviews
CREATE OR REPLACE FUNCTION get_property_reviews(
  p_property_id TEXT
) RETURNS TABLE (
  id TEXT,
  renter_id TEXT,
  renter_name TEXT,
  renter_avatar TEXT,
  rating INT,
  review_text_en TEXT,
  review_text_ar TEXT,
  review_date TIMESTAMP
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pr.id,
    pr.renter_id,
    u.full_name_en as renter_name,
    u.profile_picture as renter_avatar,
    pr.rating,
    pr.review_text_en,
    pr.review_text_ar,
    pr.review_date
  FROM property_reviews pr
  JOIN renters r ON pr.renter_id = r.id
  JOIN users u ON r.user_id = u.id
  WHERE 
    pr.property_id = p_property_id
    AND pr.visible = TRUE
  ORDER BY pr.review_date DESC;
END;
$$;

-- Get renter reviews
CREATE OR REPLACE FUNCTION get_renter_reviews(
  p_renter_id TEXT
) RETURNS TABLE (
  id TEXT,
  landlord_id TEXT,
  landlord_name TEXT,
  landlord_avatar TEXT,
  rating INT,
  review_text_en TEXT,
  review_text_ar TEXT,
  review_date TIMESTAMP
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT 
    rr.id,
    rr.landlord_id,
    u.full_name_en as landlord_name,
    u.profile_picture as landlord_avatar,
    rr.rating,
    rr.review_text_en,
    rr.review_text_ar,
    rr.review_date
  FROM renter_reviews rr
  JOIN landlords l ON rr.landlord_id = l.id
  JOIN users u ON l.user_id = u.id
  WHERE 
    rr.renter_id = p_renter_id
    AND rr.visible = TRUE
  ORDER BY rr.review_date DESC;
END;
$$;

-- Get properties eligible for review (by renter)
CREATE OR REPLACE FUNCTION get_renter_reviewable_properties(
  p_renter_id TEXT
) RETURNS TABLE (
  property_id TEXT,
  property_title TEXT,
  contract_id TEXT,
  contract_end_date TIMESTAMP,
  days_since_end INT,
  already_reviewed BOOLEAN
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id as property_id,
    p.title_en as property_title,
    rc.id as contract_id,
    rc.end_date as contract_end_date,
    EXTRACT(DAY FROM (NOW() - rc.end_date))::INT as days_since_end,
    EXISTS (
      SELECT 1 
      FROM property_reviews pr 
      WHERE 
        pr.property_id = p.id 
        AND pr.renter_id = p_renter_id
    ) as already_reviewed
  FROM rental_contracts rc
  JOIN properties p ON rc.property_id = p.id
  WHERE 
    rc.renter_id = p_renter_id
    AND rc.status IN ('completed', 'terminated', 'expired')
    AND rc.end_date < NOW()
    AND rc.end_date > (NOW() - INTERVAL '90 days') -- Allow reviews within 90 days
  ORDER BY rc.end_date DESC;
END;
$$;

-- Get renters eligible for review (by landlord)
CREATE OR REPLACE FUNCTION get_landlord_reviewable_renters(
  p_landlord_id TEXT
) RETURNS TABLE (
  renter_id TEXT,
  renter_name TEXT,
  property_id TEXT,
  property_title TEXT,
  contract_id TEXT,
  contract_end_date TIMESTAMP,
  days_since_end INT,
  already_reviewed BOOLEAN
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT 
    rc.renter_id,
    u.full_name_en as renter_name,
    p.id as property_id,
    p.title_en as property_title,
    rc.id as contract_id,
    rc.end_date as contract_end_date,
    EXTRACT(DAY FROM (NOW() - rc.end_date))::INT as days_since_end,
    EXISTS (
      SELECT 1 
      FROM renter_reviews rr 
      WHERE 
        rr.renter_id = rc.renter_id 
        AND rr.landlord_id = p_landlord_id
        AND rr.contract_id = rc.id
    ) as already_reviewed
  FROM rental_contracts rc
  JOIN properties p ON rc.property_id = p.id
  JOIN renters r ON rc.renter_id = r.id
  JOIN users u ON r.user_id = u.id
  WHERE 
    p.owner_id = p_landlord_id
    AND rc.status IN ('completed', 'terminated', 'expired')
    AND rc.end_date < NOW()
    AND rc.end_date > (NOW() - INTERVAL '90 days') -- Allow reviews within 90 days
  ORDER BY rc.end_date DESC;
END;
$$;

-- Hide/show property review (admin function)
CREATE OR REPLACE FUNCTION toggle_property_review_visibility(
  p_review_id TEXT,
  p_visible BOOLEAN
) RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_property_id TEXT;
BEGIN
  -- Get the property ID
  SELECT property_id INTO v_property_id
  FROM property_reviews
  WHERE id = p_review_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Review not found';
  END IF;
  
  -- Update review visibility
  UPDATE property_reviews SET
    visible = p_visible
  WHERE id = p_review_id;
  
  -- Update property average rating
  WITH ratings AS (
    SELECT AVG(rating) as avg_rating, COUNT(*) as count
    FROM property_reviews
    WHERE property_id = v_property_id AND visible = TRUE
  )
  UPDATE properties p
  SET 
    rating = r.avg_rating,
    review_count = r.count
  FROM ratings r
  WHERE p.id = v_property_id;
  
  RETURN FOUND;
END;
$$;

-- Hide/show renter review (admin function)
CREATE OR REPLACE FUNCTION toggle_renter_review_visibility(
  p_review_id TEXT,
  p_visible BOOLEAN
) RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_renter_id TEXT;
BEGIN
  -- Get the renter ID
  SELECT renter_id INTO v_renter_id
  FROM renter_reviews
  WHERE id = p_review_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Review not found';
  END IF;
  
  -- Update review visibility
  UPDATE renter_reviews SET
    visible = p_visible
  WHERE id = p_review_id;
  
  -- Update renter average rating
  WITH ratings AS (
    SELECT AVG(rating) as avg_rating, COUNT(*) as count
    FROM renter_reviews
    WHERE renter_id = v_renter_id AND visible = TRUE
  )
  UPDATE users u
  SET 
    average_rating = r.avg_rating,
    review_count = r.count
  FROM ratings r
  JOIN renters rn ON u.id = rn.user_id
  WHERE rn.id = v_renter_id;
  
  RETURN FOUND;
END;
$$;

-- Get property review statistics
CREATE OR REPLACE FUNCTION get_property_review_statistics(
  p_property_id TEXT
) RETURNS TABLE (
  average_rating NUMERIC,
  review_count INTEGER,
  rating_distribution JSON
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(AVG(pr.rating), 0) as average_rating,
    COUNT(pr.id) as review_count,
    json_build_object(
      '1', COUNT(CASE WHEN pr.rating = 1 THEN 1 END),
      '2', COUNT(CASE WHEN pr.rating = 2 THEN 1 END),
      '3', COUNT(CASE WHEN pr.rating = 3 THEN 1 END),
      '4', COUNT(CASE WHEN pr.rating = 4 THEN 1 END),
      '5', COUNT(CASE WHEN pr.rating = 5 THEN 1 END)
    ) as rating_distribution
  FROM property_reviews pr
  WHERE pr.property_id = p_property_id AND pr.visible = TRUE;
END;
$$;

-- Get renter review statistics
CREATE OR REPLACE FUNCTION get_renter_review_statistics(
  p_renter_id TEXT
) RETURNS TABLE (
  average_rating NUMERIC,
  review_count INTEGER,
  rating_distribution JSON
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(AVG(rr.rating), 0) as average_rating,
    COUNT(rr.id) as review_count,
    json_build_object(
      '1', COUNT(CASE WHEN rr.rating = 1 THEN 1 END),
      '2', COUNT(CASE WHEN rr.rating = 2 THEN 1 END),
      '3', COUNT(CASE WHEN rr.rating = 3 THEN 1 END),
      '4', COUNT(CASE WHEN rr.rating = 4 THEN 1 END),
      '5', COUNT(CASE WHEN rr.rating = 5 THEN 1 END)
    ) as rating_distribution
  FROM renter_reviews rr
  WHERE rr.renter_id = p_renter_id AND rr.visible = TRUE;
END;
$$;

-- Edit property review
CREATE OR REPLACE FUNCTION edit_property_review(
  p_review_id TEXT,
  p_rating INT DEFAULT NULL,
  p_review_text_en TEXT DEFAULT NULL,
  p_review_text_ar TEXT DEFAULT NULL
) RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_property_id TEXT;
BEGIN
  -- Get the property ID
  SELECT property_id INTO v_property_id
  FROM property_reviews
  WHERE id = p_review_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Review not found';
  END IF;
  
  -- Update the review
  UPDATE property_reviews SET
    rating = COALESCE(p_rating, rating),
    review_text_en = COALESCE(p_review_text_en, review_text_en),
    review_text_ar = COALESCE(p_review_text_ar, review_text_ar),
    review_date = NOW() -- Update the review date
  WHERE id = p_review_id;
  
  -- Update property average rating
  WITH ratings AS (
    SELECT AVG(rating) as avg_rating, COUNT(*) as count
    FROM property_reviews
    WHERE property_id = v_property_id AND visible = TRUE
  )
  UPDATE properties p
  SET 
    rating = r.avg_rating,
    review_count = r.count
  FROM ratings r
  WHERE p.id = v_property_id;
  
  RETURN FOUND;
END;
$$;

-- Edit renter review
CREATE OR REPLACE FUNCTION edit_renter_review(
  p_review_id TEXT,
  p_rating INT DEFAULT NULL,
  p_review_text_en TEXT DEFAULT NULL,
  p_review_text_ar TEXT DEFAULT NULL
) RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_renter_id TEXT;
BEGIN
  -- Get the renter ID
  SELECT renter_id INTO v_renter_id
  FROM renter_reviews
  WHERE id = p_review_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Review not found';
  END IF;
  
  -- Update the review
  UPDATE renter_reviews SET
    rating = COALESCE(p_rating, rating),
    review_text_en = COALESCE(p_review_text_en, review_text_en),
    review_text_ar = COALESCE(p_review_text_ar, review_text_ar),
    review_date = NOW() -- Update the review date
  WHERE id = p_review_id;
  
  -- Update renter average rating
  WITH ratings AS (
    SELECT AVG(rating) as avg_rating, COUNT(*) as count
    FROM renter_reviews
    WHERE renter_id = v_renter_id AND visible = TRUE
  )
  UPDATE users u
  SET 
    average_rating = r.avg_rating,
    review_count = r.count
  FROM ratings r
  JOIN renters rn ON u.id = rn.user_id
  WHERE rn.id = v_renter_id;
  
  RETURN FOUND;
END;
$$;

-- ==========================================
-- Review System Triggers
-- ==========================================

-- Contract Review Availability Trigger
CREATE OR REPLACE FUNCTION contract_review_availability_trigger()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  -- Only fire when contract status changes to completed, terminated, or expired
  IF NEW.status IN ('completed', 'terminated', 'expired') AND OLD.status NOT IN ('completed', 'terminated', 'expired') THEN
    -- Create notifications for both parties if notification table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notifications') THEN
      -- Get user IDs
      WITH users_info AS (
        SELECT 
          p.title_en as property_title,
          lu.id as landlord_user_id,
          ru.id as renter_user_id
        FROM properties p
        JOIN landlords l ON p.owner_id = l.id
        JOIN users lu ON l.user_id = lu.id
        JOIN renters r ON r.id = NEW.renter_id
        JOIN users ru ON r.user_id = ru.id
        WHERE p.id = NEW.property_id
      )
      
      -- Insert notifications
      INSERT INTO notifications (id, user_id, title_en, content_en, type, related_id, is_read)
      SELECT 
        gen_random_uuid()::TEXT,
        landlord_user_id,
        'Review Opportunity Available',
        'You can now review your renter for "' || property_title || '".',
        'review_opportunity',
        NEW.id,
        FALSE
      FROM users_info
      UNION ALL
      SELECT 
        gen_random_uuid()::TEXT,
        renter_user_id,
        'Review Opportunity Available',
        'You can now review property "' || property_title || '".',
        'review_opportunity',
        NEW.id,
        FALSE
      FROM users_info;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger on rental_contracts table
DROP TRIGGER IF EXISTS contract_review_availability ON rental_contracts;
CREATE TRIGGER contract_review_availability
AFTER UPDATE ON rental_contracts
FOR EACH ROW
EXECUTE FUNCTION contract_review_availability_trigger();

-- Review Added Trigger (updates statistics when a review is added)
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
    WITH ratings AS (
      SELECT AVG(rating) as avg_rating, COUNT(*) as count
      FROM renter_reviews
      WHERE renter_id = NEW.renter_id AND visible = TRUE
    )
    UPDATE users u
    SET 
      average_rating = r.avg_rating,
      review_count = r.count
    FROM ratings r
    JOIN renters rn ON u.id = rn.user_id
    WHERE rn.id = NEW.renter_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create triggers for review_added_trigger
DROP TRIGGER IF EXISTS property_review_added ON property_reviews;
CREATE TRIGGER property_review_added
AFTER INSERT ON property_reviews
FOR EACH ROW
EXECUTE FUNCTION review_added_trigger();

DROP TRIGGER IF EXISTS renter_review_added ON renter_reviews;
CREATE TRIGGER renter_review_added
AFTER INSERT ON renter_reviews
FOR EACH ROW
EXECUTE FUNCTION review_added_trigger();

-- Review Updated Trigger (updates statistics when a review is updated)
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
      WITH ratings AS (
        SELECT AVG(rating) as avg_rating, COUNT(*) as count
        FROM renter_reviews
        WHERE renter_id = NEW.renter_id AND visible = TRUE
      )
      UPDATE users u
      SET 
        average_rating = r.avg_rating,
        review_count = r.count
      FROM ratings r
      JOIN renters rn ON u.id = rn.user_id
      WHERE rn.id = NEW.renter_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create triggers for review_updated_trigger
DROP TRIGGER IF EXISTS property_review_updated ON property_reviews;
CREATE TRIGGER property_review_updated
AFTER UPDATE ON property_reviews
FOR EACH ROW
EXECUTE FUNCTION review_updated_trigger();

DROP TRIGGER IF EXISTS renter_review_updated ON renter_reviews;
CREATE TRIGGER renter_review_updated
AFTER UPDATE ON renter_reviews
FOR EACH ROW
EXECUTE FUNCTION review_updated_trigger(); 