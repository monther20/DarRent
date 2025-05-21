-- DarRent - Review Management Functions
-- This file contains API functions for managing property and renter reviews

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
    review_date
  ) VALUES (
    v_review_id,
    p_property_id,
    p_renter_id,
    v_contract_id,
    p_rating,
    p_review_text_en,
    p_review_text_ar,
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
    review_date
  ) VALUES (
    v_review_id,
    p_renter_id,
    p_landlord_id,
    v_contract_id,
    p_rating,
    p_review_text_en,
    p_review_text_ar,
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