-- DarRent Property Viewing Request Management System
-- This file implements the database schema, triggers, and API functions for managing property viewing requests

-- ==========================================
-- Schema Definition
-- ==========================================

-- Create property viewing requests table if it doesn't exist
CREATE TABLE IF NOT EXISTS property_viewing_requests (
  "id" text PRIMARY KEY,
  "property_id" text REFERENCES properties("id") ON DELETE CASCADE,
  "renter_id" text REFERENCES renters("id") ON DELETE CASCADE,
  "preferred_dates" JSONB NOT NULL, -- Array of preferred dates/times as ISO strings
  "confirmed_date" timestamp,
  "status" text DEFAULT 'pending', -- pending, accepted, rescheduled, rejected, cancelled, completed
  "renter_notes" text,
  "landlord_notes" text,
  "created_at" timestamp DEFAULT NOW(),
  "updated_at" timestamp DEFAULT NOW(),
  "feedback_rating" INTEGER, -- Renter's rating after viewing (1-5)
  "feedback_notes" text,     -- Renter's notes after viewing
  "special_requests" text,    -- Special requests for viewing (accessibility, etc.)
  "contact_preference" text,  -- Preferred contact method for coordination
  "cancellation_reason" text  -- Reason for cancellation if applicable
);

-- Update rental_contracts table if viewing_completed column doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='rental_contracts' AND column_name='viewing_completed') THEN
    ALTER TABLE rental_contracts ADD COLUMN viewing_completed BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_property_viewing_requests_property_id ON property_viewing_requests(property_id);
CREATE INDEX IF NOT EXISTS idx_property_viewing_requests_renter_id ON property_viewing_requests(renter_id);
CREATE INDEX IF NOT EXISTS idx_property_viewing_requests_status ON property_viewing_requests(status);

-- ==========================================
-- Drop existing functions before replacing them
-- ==========================================

-- Drop existing functions to avoid parameter name conflicts
DROP FUNCTION IF EXISTS request_property_viewing(TEXT, TEXT, JSONB, TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS get_property_viewing_requests(TEXT, TEXT, INTEGER, INTEGER);
DROP FUNCTION IF EXISTS get_renter_viewing_requests(TEXT, TEXT, INTEGER, INTEGER);
DROP FUNCTION IF EXISTS update_viewing_request(TEXT, TEXT, TIMESTAMP, TEXT);
DROP FUNCTION IF EXISTS add_viewing_feedback(TEXT, INTEGER, TEXT);
DROP FUNCTION IF EXISTS cancel_viewing_request(TEXT, TEXT);
DROP FUNCTION IF EXISTS get_viewing_request_by_id(TEXT);
DROP FUNCTION IF EXISTS get_landlord_upcoming_viewings(TEXT, INTEGER, INTEGER);
DROP FUNCTION IF EXISTS get_renter_upcoming_viewings(TEXT, INTEGER, INTEGER);
DROP FUNCTION IF EXISTS suggest_viewing_dates(TEXT, JSONB, TEXT);
DROP FUNCTION IF EXISTS property_has_active_viewing_requests(TEXT);
DROP FUNCTION IF EXISTS property_viewing_request_notification_trigger();
DROP FUNCTION IF EXISTS create_contract_with_viewing_check(TEXT, TEXT, TIMESTAMP, TIMESTAMP, DECIMAL, DECIMAL, INT, BOOLEAN, TEXT);
DROP FUNCTION IF EXISTS update_property_viewing_availability(TEXT, JSONB);
DROP FUNCTION IF EXISTS get_property_viewing_availability(TEXT);

-- ==========================================
-- Property Viewing Request API Functions
-- ==========================================

-- Request property viewing
CREATE OR REPLACE FUNCTION request_property_viewing(
  p_renter_id TEXT,
  p_property_id TEXT,
  p_preferred_dates JSONB, -- Array of preferred dates/times
  p_notes TEXT DEFAULT NULL,
  p_special_requests TEXT DEFAULT NULL,
  p_contact_preference TEXT DEFAULT 'app'
) RETURNS TEXT LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_request_id TEXT;
  v_landlord_user_id TEXT;
  v_renter_name TEXT;
  v_property_title TEXT;
  v_property_owner_id TEXT;
BEGIN
  -- Check if the property exists
  SELECT owner_id, title_en INTO v_property_owner_id, v_property_title
  FROM properties
  WHERE id = p_property_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Property not found';
  END IF;
  
  -- Check if the renter exists
  SELECT u.full_name_en INTO v_renter_name
  FROM renters r
  JOIN users u ON r.user_id = u.id
  WHERE r.id = p_renter_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Renter not found';
  END IF;
  
  -- Get landlord user ID for notification
  SELECT u.id INTO v_landlord_user_id
  FROM landlords l
  JOIN users u ON l.user_id = u.id
  WHERE l.id = v_property_owner_id;
  
  -- Generate a new ID
  v_request_id := gen_random_uuid()::TEXT;
  
  -- Insert viewing request
  INSERT INTO property_viewing_requests (
    id,
    property_id,
    renter_id,
    preferred_dates,
    status,
    renter_notes,
    special_requests,
    contact_preference,
    created_at,
    updated_at
  ) VALUES (
    v_request_id,
    p_property_id,
    p_renter_id,
    p_preferred_dates,
    'pending',
    p_notes,
    p_special_requests,
    p_contact_preference,
    NOW(),
    NOW()
  );
  
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
      v_landlord_user_id,
      'New Viewing Request',
      v_renter_name || ' has requested to view property "' || v_property_title || '".',
      'viewing_request',
      v_request_id,
      FALSE
    );
  END IF;
  
  RETURN v_request_id;
END;
$$;

-- Get property viewing requests (for landlord)
CREATE OR REPLACE FUNCTION get_property_viewing_requests(
  p_property_id TEXT,
  p_status TEXT DEFAULT NULL,
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0
) RETURNS TABLE (
  id TEXT,
  renter_id TEXT,
  renter_name TEXT,
  renter_avatar TEXT,
  preferred_dates JSONB,
  confirmed_date TIMESTAMP,
  status TEXT,
  renter_notes TEXT,
  landlord_notes TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  special_requests TEXT,
  contact_preference TEXT
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pvr.id,
    pvr.renter_id,
    u.full_name_en as renter_name,
    u.profile_picture as renter_avatar,
    pvr.preferred_dates,
    pvr.confirmed_date,
    pvr.status,
    pvr.renter_notes,
    pvr.landlord_notes,
    pvr.created_at,
    pvr.updated_at,
    pvr.special_requests,
    pvr.contact_preference
  FROM property_viewing_requests pvr
  JOIN renters r ON pvr.renter_id = r.id
  JOIN users u ON r.user_id = u.id
  WHERE 
    pvr.property_id = p_property_id
    AND (p_status IS NULL OR pvr.status = p_status)
  ORDER BY 
    CASE 
      WHEN pvr.status = 'pending' THEN 0
      WHEN pvr.status = 'accepted' THEN 1
      WHEN pvr.status = 'rescheduled' THEN 2
      ELSE 3
    END,
    pvr.confirmed_date,
    pvr.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

-- Get viewing requests (for renter)
CREATE OR REPLACE FUNCTION get_renter_viewing_requests(
  p_renter_id TEXT,
  p_status TEXT DEFAULT NULL,
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0
) RETURNS TABLE (
  id TEXT,
  property_id TEXT,
  property_title TEXT,
  property_image TEXT,
  preferred_dates JSONB,
  confirmed_date TIMESTAMP,
  status TEXT,
  renter_notes TEXT,
  landlord_notes TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pvr.id,
    pvr.property_id,
    p.title_en as property_title,
    (
      SELECT image_url 
      FROM property_images 
      WHERE property_id = p.id AND is_main_image = TRUE
      LIMIT 1
    ) as property_image,
    pvr.preferred_dates,
    pvr.confirmed_date,
    pvr.status,
    pvr.renter_notes,
    pvr.landlord_notes,
    pvr.created_at,
    pvr.updated_at
  FROM property_viewing_requests pvr
  JOIN properties p ON pvr.property_id = p.id
  WHERE 
    pvr.renter_id = p_renter_id
    AND (p_status IS NULL OR pvr.status = p_status)
  ORDER BY 
    CASE 
      WHEN pvr.status = 'pending' THEN 0
      WHEN pvr.status = 'accepted' THEN 1
      WHEN pvr.status = 'rescheduled' THEN 2
      ELSE 3
    END,
    pvr.confirmed_date,
    pvr.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

-- Update viewing request status
CREATE OR REPLACE FUNCTION update_viewing_request(
  p_request_id TEXT,
  p_status TEXT,
  p_confirmed_date TIMESTAMP DEFAULT NULL,
  p_landlord_notes TEXT DEFAULT NULL
) RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_renter_id TEXT;
  v_property_id TEXT;
  v_property_title TEXT;
  v_renter_user_id TEXT;
  v_current_status TEXT;
  v_status_action TEXT;
BEGIN
  -- Get request details
  SELECT 
    renter_id,
    property_id,
    status
  INTO 
    v_renter_id,
    v_property_id,
    v_current_status
  FROM property_viewing_requests
  WHERE id = p_request_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Viewing request not found';
  END IF;
  
  -- Get property title and renter user ID
  SELECT p.title_en, u.id INTO v_property_title, v_renter_user_id
  FROM properties p
  JOIN renters r ON v_renter_id = r.id
  JOIN users u ON r.user_id = u.id
  WHERE p.id = v_property_id;
  
  -- Set status action for notification message
  CASE p_status
    WHEN 'accepted' THEN v_status_action := 'accepted';
    WHEN 'rescheduled' THEN v_status_action := 'rescheduled';
    WHEN 'rejected' THEN v_status_action := 'rejected';
    WHEN 'completed' THEN v_status_action := 'marked as completed';
    ELSE v_status_action := 'updated';
  END CASE;
  
  -- Update viewing request
  UPDATE property_viewing_requests SET
    status = p_status,
    confirmed_date = COALESCE(p_confirmed_date, confirmed_date),
    landlord_notes = COALESCE(p_landlord_notes, landlord_notes),
    updated_at = NOW()
  WHERE id = p_request_id;
  
  -- If status changed to completed, update related contract if exists
  IF p_status = 'completed' AND v_current_status != 'completed' THEN
    UPDATE rental_contracts
    SET viewing_completed = TRUE
    WHERE property_id = v_property_id AND renter_id = v_renter_id
    AND status IN ('pending', 'active');
  END IF;
  
  -- Create notification for renter
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notifications') 
     AND p_status != v_current_status THEN
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
      'Viewing Request ' || initcap(v_status_action),
      'Your request to view property "' || v_property_title || '" has been ' || v_status_action || '.',
      'viewing_request',
      p_request_id,
      FALSE
    );
  END IF;
  
  RETURN FOUND;
END;
$$;

-- Add feedback after viewing
CREATE OR REPLACE FUNCTION add_viewing_feedback(
  p_request_id TEXT,
  p_rating INTEGER,
  p_notes TEXT DEFAULT NULL
) RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  -- Validate rating
  IF p_rating < 1 OR p_rating > 5 THEN
    RAISE EXCEPTION 'Rating must be between 1 and 5';
  END IF;
  
  -- Update viewing request with feedback
  UPDATE property_viewing_requests SET
    feedback_rating = p_rating,
    feedback_notes = p_notes,
    updated_at = NOW()
  WHERE id = p_request_id;
  
  RETURN FOUND;
END;
$$;

-- Cancel viewing request (by renter)
CREATE OR REPLACE FUNCTION cancel_viewing_request(
  p_request_id TEXT,
  p_cancellation_reason TEXT DEFAULT NULL
) RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_property_id TEXT;
  v_property_title TEXT;
  v_renter_id TEXT;
  v_renter_name TEXT;
BEGIN
  -- Get request details
  SELECT 
    pvr.property_id,
    pvr.renter_id,
    p.title_en,
    u.full_name_en
  INTO 
    v_property_id,
    v_renter_id,
    v_property_title,
    v_renter_name
  FROM property_viewing_requests pvr
  JOIN properties p ON pvr.property_id = p.id
  JOIN renters r ON pvr.renter_id = r.id
  JOIN users u ON r.user_id = u.id
  WHERE pvr.id = p_request_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Viewing request not found';
  END IF;
  
  -- Update viewing request
  UPDATE property_viewing_requests SET
    status = 'cancelled',
    cancellation_reason = p_cancellation_reason,
    updated_at = NOW()
  WHERE id = p_request_id;
  
  -- Create notification for landlord
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
      v_landlord_user_id,
      'Viewing Request Cancelled',
      v_renter_name || ' has cancelled their request to view property "' || v_property_title || '".',
      'viewing_request',
      p_request_id,
      FALSE
    );
  END IF;
  
  RETURN FOUND;
END;
$$;

-- Get viewing request by ID
CREATE OR REPLACE FUNCTION get_viewing_request_by_id(
  p_request_id TEXT
) RETURNS TABLE (
  id TEXT,
  property_id TEXT,
  property_title TEXT,
  property_address TEXT,
  property_image TEXT,
  renter_id TEXT,
  renter_name TEXT,
  renter_avatar TEXT,
  preferred_dates JSONB,
  confirmed_date TIMESTAMP,
  status TEXT,
  renter_notes TEXT,
  landlord_notes TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  feedback_rating INTEGER,
  feedback_notes TEXT,
  special_requests TEXT,
  contact_preference TEXT,
  cancellation_reason TEXT
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pvr.id,
    pvr.property_id,
    p.title_en as property_title,
    p.area_en || ', ' || p.city_en as property_address,
    (
      SELECT image_url 
      FROM property_images 
      WHERE property_id = p.id AND is_main_image = TRUE
      LIMIT 1
    ) as property_image,
    pvr.renter_id,
    u.full_name_en as renter_name,
    u.profile_picture as renter_avatar,
    pvr.preferred_dates,
    pvr.confirmed_date,
    pvr.status,
    pvr.renter_notes,
    pvr.landlord_notes,
    pvr.created_at,
    pvr.updated_at,
    pvr.feedback_rating,
    pvr.feedback_notes,
    pvr.special_requests,
    pvr.contact_preference,
    pvr.cancellation_reason
  FROM property_viewing_requests pvr
  JOIN properties p ON pvr.property_id = p.id
  JOIN renters r ON pvr.renter_id = r.id
  JOIN users u ON r.user_id = u.id
  WHERE pvr.id = p_request_id;
END;
$$;

-- Get upcoming viewings for a landlord
CREATE OR REPLACE FUNCTION get_landlord_upcoming_viewings(
  p_landlord_id TEXT,
  p_limit INTEGER DEFAULT 5,
  p_offset INTEGER DEFAULT 0
) RETURNS TABLE (
  request_id TEXT,
  property_id TEXT,
  property_title TEXT,
  renter_id TEXT,
  renter_name TEXT,
  viewing_date TIMESTAMP,
  status TEXT
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pvr.id as request_id,
    pvr.property_id,
    p.title_en as property_title,
    pvr.renter_id,
    u.full_name_en as renter_name,
    pvr.confirmed_date as viewing_date,
    pvr.status
  FROM property_viewing_requests pvr
  JOIN properties p ON pvr.property_id = p.id
  JOIN renters r ON pvr.renter_id = r.id
  JOIN users u ON r.user_id = u.id
  WHERE 
    p.owner_id = p_landlord_id
    AND pvr.status = 'accepted'
    AND pvr.confirmed_date >= NOW()
    AND pvr.confirmed_date <= (NOW() + INTERVAL '7 days')
  ORDER BY pvr.confirmed_date ASC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

-- Get upcoming viewings for a renter
CREATE OR REPLACE FUNCTION get_renter_upcoming_viewings(
  p_renter_id TEXT,
  p_limit INTEGER DEFAULT 5,
  p_offset INTEGER DEFAULT 0
) RETURNS TABLE (
  request_id TEXT,
  property_id TEXT,
  property_title TEXT,
  viewing_date TIMESTAMP,
  status TEXT
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pvr.id as request_id,
    pvr.property_id,
    p.title_en as property_title,
    pvr.confirmed_date as viewing_date,
    pvr.status
  FROM property_viewing_requests pvr
  JOIN properties p ON pvr.property_id = p.id
  WHERE 
    pvr.renter_id = p_renter_id
    AND pvr.status = 'accepted'
    AND pvr.confirmed_date >= NOW()
    AND pvr.confirmed_date <= (NOW() + INTERVAL '7 days')
  ORDER BY pvr.confirmed_date ASC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

-- Suggest alternative dates for viewing
CREATE OR REPLACE FUNCTION suggest_viewing_dates(
  p_request_id TEXT,
  p_suggested_dates JSONB,
  p_notes TEXT DEFAULT NULL
) RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_renter_user_id TEXT;
  v_property_id TEXT;
  v_property_title TEXT;
BEGIN
  -- Get request details
  SELECT 
    pvr.property_id,
    p.title_en,
    u.id
  INTO 
    v_property_id,
    v_property_title,
    v_renter_user_id
  FROM property_viewing_requests pvr
  JOIN properties p ON pvr.property_id = p.id
  JOIN renters r ON pvr.renter_id = r.id
  JOIN users u ON r.user_id = u.id
  WHERE pvr.id = p_request_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Viewing request not found';
  END IF;
  
  -- Update viewing request
  UPDATE property_viewing_requests SET
    status = 'rescheduled',
    preferred_dates = p_suggested_dates,
    landlord_notes = COALESCE(p_notes, landlord_notes),
    updated_at = NOW()
  WHERE id = p_request_id;
  
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
      'Alternative Viewing Dates Suggested',
      'The landlord has suggested alternative dates to view property "' || v_property_title || '".',
      'viewing_request',
      p_request_id,
      FALSE
    );
  END IF;
  
  RETURN FOUND;
END;
$$;

-- Check if property has active viewing requests
CREATE OR REPLACE FUNCTION property_has_active_viewing_requests(
  p_property_id TEXT
) RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_has_requests BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 
    FROM property_viewing_requests 
    WHERE 
      property_id = p_property_id 
      AND status IN ('pending', 'accepted', 'rescheduled')
  ) INTO v_has_requests;
  
  RETURN v_has_requests;
END;
$$;

-- ==========================================
-- Property Viewing Request Triggers
-- ==========================================

-- Property Viewing Request Notification Trigger
CREATE OR REPLACE FUNCTION property_viewing_request_notification_trigger()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_property_id TEXT;
  v_property_title TEXT;
  v_landlord_user_id TEXT;
  v_renter_user_id TEXT;
  v_contract_exists BOOLEAN;
BEGIN
  -- Get property and user info
  SELECT 
    p.id,
    p.title_en,
    lu.id,
    ru.id,
    EXISTS (
      SELECT 1 FROM rental_contracts rc 
      WHERE rc.property_id = p.id AND rc.renter_id = NEW.renter_id
    )
  INTO 
    v_property_id,
    v_property_title,
    v_landlord_user_id,
    v_renter_user_id,
    v_contract_exists
  FROM properties p
  JOIN landlords l ON p.owner_id = l.id
  JOIN users lu ON l.user_id = lu.id
  JOIN renters r ON NEW.renter_id = r.id
  JOIN users ru ON r.user_id = ru.id
  WHERE p.id = NEW.property_id;
  
  -- When a viewing request status changes to completed
  IF TG_OP = 'UPDATE' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    -- If a contract exists, update it to mark viewing as completed
    IF v_contract_exists THEN
      UPDATE rental_contracts
      SET viewing_completed = TRUE
      WHERE property_id = v_property_id AND renter_id = NEW.renter_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger on property_viewing_requests table
DROP TRIGGER IF EXISTS property_viewing_request_notification ON property_viewing_requests;
CREATE TRIGGER property_viewing_request_notification
AFTER UPDATE ON property_viewing_requests
FOR EACH ROW
EXECUTE FUNCTION property_viewing_request_notification_trigger();

-- ==========================================
-- Integration with Contract Management
-- ==========================================

-- Modified function to check viewing status before creating contract
CREATE OR REPLACE FUNCTION create_contract_with_viewing_check(
  p_property_id TEXT,
  p_renter_id TEXT,
  p_start_date TIMESTAMP,
  p_end_date TIMESTAMP,
  p_monthly_rent DECIMAL,
  p_security_deposit DECIMAL,
  p_payment_due_day INT,
  p_require_viewing BOOLEAN DEFAULT TRUE,
  p_status TEXT DEFAULT 'pending'
) RETURNS TEXT LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_contract_id TEXT;
  v_viewing_completed BOOLEAN;
BEGIN
  -- Check if property viewing has been completed
  SELECT EXISTS (
    SELECT 1 
    FROM property_viewing_requests 
    WHERE 
      property_id = p_property_id 
      AND renter_id = p_renter_id
      AND status = 'completed'
  ) INTO v_viewing_completed;
  
  -- If viewing is required but not completed, raise exception
  IF p_require_viewing AND NOT v_viewing_completed THEN
    RAISE EXCEPTION 'Property viewing must be completed before creating contract';
  END IF;
  
  -- Generate a new ID
  v_contract_id := gen_random_uuid()::TEXT;
  
  -- Insert contract
  INSERT INTO rental_contracts (
    id,
    property_id,
    renter_id,
    start_date,
    end_date,
    monthly_rent,
    security_deposit,
    status,
    payment_due_day,
    created_at,
    signed_document,
    viewing_completed
  ) VALUES (
    v_contract_id,
    p_property_id,
    p_renter_id,
    p_start_date,
    p_end_date,
    p_monthly_rent,
    p_security_deposit,
    p_status,
    p_payment_due_day,
    NOW(),
    FALSE,
    v_viewing_completed
  );
  
  -- If contract is active, update property status
  IF p_status = 'active' AND NOT p_require_viewing THEN
    UPDATE properties SET
      status = 'rented'
    WHERE id = p_property_id;
  END IF;
  
  RETURN v_contract_id;
END;
$$;

-- ==========================================
-- API function for Availability Management
-- ==========================================

-- Update property viewing availability
CREATE OR REPLACE FUNCTION update_property_viewing_availability(
  p_property_id TEXT,
  p_viewing_availability JSONB
) RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE properties SET
    viewing_availability = p_viewing_availability
  WHERE id = p_property_id;
  
  RETURN FOUND;
END;
$$;

-- Get property viewing availability
CREATE OR REPLACE FUNCTION get_property_viewing_availability(
  p_property_id TEXT
) RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_availability JSONB;
BEGIN
  SELECT viewing_availability INTO v_availability
  FROM properties
  WHERE id = p_property_id;
  
  RETURN COALESCE(v_availability, '[]'::JSONB);
END;
$$; 