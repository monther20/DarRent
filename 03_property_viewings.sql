-- DarRent - Property Viewing Management Functions
-- This file contains API functions for managing property viewing requests

-- ==========================================
-- Property Viewing Management Functions
-- ==========================================

-- Request property viewing
CREATE OR REPLACE FUNCTION request_property_viewing(
  p_renter_id TEXT,
  p_property_id TEXT,
  p_preferred_dates TEXT[],
  p_notes TEXT DEFAULT NULL
) RETURNS TEXT LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_request_id TEXT;
  v_property_owner TEXT;
  v_renter_user_id TEXT;
  v_property_title TEXT;
BEGIN
  -- Check if property exists
  SELECT title_en INTO v_property_title
  FROM properties
  WHERE id = p_property_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Property not found';
  END IF;
  
  -- Generate a new ID
  v_request_id := gen_random_uuid()::TEXT;
  
  -- Insert viewing request
  INSERT INTO property_viewing_requests (
    id,
    property_id,
    renter_id,
    requested_dates,
    renter_notes,
    status,
    created_at,
    updated_at
  ) VALUES (
    v_request_id,
    p_property_id,
    p_renter_id,
    p_preferred_dates,
    p_notes,
    'pending',
    NOW(),
    NOW()
  );
  
  -- Get property owner for notification
  SELECT u.id INTO v_property_owner
  FROM properties p
  JOIN landlords l ON p.owner_id = l.id
  JOIN users u ON l.user_id = u.id
  WHERE p.id = p_property_id;
  
  -- Get renter's user ID
  SELECT u.id INTO v_renter_user_id
  FROM renters r
  JOIN users u ON r.user_id = u.id
  WHERE r.id = p_renter_id;
  
  -- Create notifications (if notification table exists)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notifications') THEN
    -- For landlord
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
      v_property_owner,
      'New Property Viewing Request',
      'A renter has requested to view your property "' || v_property_title || '".',
      'viewing_request',
      v_request_id,
      FALSE
    );
    
    -- For renter
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
      'Property Viewing Request Submitted',
      'Your request to view property "' || v_property_title || '" has been submitted.',
      'viewing_request',
      v_request_id,
      FALSE
    );
  END IF;
  
  RETURN v_request_id;
END;
$$;

-- Get viewing requests (for landlord)
CREATE OR REPLACE FUNCTION get_property_viewing_requests(
  p_property_id TEXT
) RETURNS TABLE (
  id TEXT,
  renter_id TEXT,
  renter_name TEXT,
  renter_email TEXT,
  renter_phone TEXT,
  preferred_dates TEXT[],
  status TEXT,
  notes TEXT,
  created_at TIMESTAMP,
  confirmed_date TIMESTAMP
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pvr.id,
    pvr.renter_id,
    u.full_name_en as renter_name,
    u.email as renter_email,
    u.phone as renter_phone,
    pvr.requested_dates,
    pvr.status,
    pvr.renter_notes as notes,
    pvr.created_at,
    pvr.confirmed_date
  FROM property_viewing_requests pvr
  JOIN renters r ON pvr.renter_id = r.id
  JOIN users u ON r.user_id = u.id
  WHERE pvr.property_id = p_property_id
  ORDER BY 
    CASE 
      WHEN pvr.status = 'pending' THEN 0
      WHEN pvr.status = 'confirmed' THEN 1
      ELSE 2
    END, 
    pvr.created_at DESC;
END;
$$;

-- Get viewing requests (for renter)
CREATE OR REPLACE FUNCTION get_renter_viewing_requests(
  p_renter_id TEXT
) RETURNS TABLE (
  id TEXT,
  property_id TEXT,
  property_title TEXT,
  property_address TEXT,
  property_image TEXT,
  landlord_name TEXT,
  landlord_phone TEXT,
  preferred_dates TEXT[],
  status TEXT,
  landlord_notes TEXT,
  created_at TIMESTAMP,
  confirmed_date TIMESTAMP
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pvr.id,
    pvr.property_id,
    p.title_en as property_title,
    COALESCE(p.area_en, '') || ', ' || COALESCE(p.city_en, '') as property_address,
    (
      SELECT pi.image_url
      FROM property_images pi
      WHERE pi.property_id = p.id AND pi.is_main_image = TRUE
      LIMIT 1
    ) as property_image,
    lu.full_name_en as landlord_name,
    lu.phone as landlord_phone,
    pvr.requested_dates,
    pvr.status,
    pvr.landlord_notes,
    pvr.created_at,
    pvr.confirmed_date
  FROM property_viewing_requests pvr
  JOIN properties p ON pvr.property_id = p.id
  JOIN landlords l ON p.owner_id = l.id
  JOIN users lu ON l.user_id = lu.id
  WHERE pvr.renter_id = p_renter_id
  ORDER BY 
    CASE 
      WHEN pvr.status = 'confirmed' THEN 0
      WHEN pvr.status = 'pending' THEN 1
      ELSE 2
    END, 
    pvr.created_at DESC;
END;
$$;

-- Update viewing request status
CREATE OR REPLACE FUNCTION update_viewing_request(
  p_request_id TEXT,
  p_status TEXT,
  p_confirmed_date TIMESTAMP DEFAULT NULL,
  p_notes TEXT DEFAULT NULL
) RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_property_id TEXT;
  v_property_title TEXT;
  v_renter_id TEXT;
  v_renter_user_id TEXT;
  v_landlord_user_id TEXT;
BEGIN
  -- Get property and renter information
  SELECT 
    pvr.property_id,
    p.title_en,
    pvr.renter_id
  INTO 
    v_property_id,
    v_property_title,
    v_renter_id
  FROM property_viewing_requests pvr
  JOIN properties p ON pvr.property_id = p.id
  WHERE pvr.id = p_request_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Viewing request not found';
  END IF;
  
  -- Get user IDs for notifications
  SELECT u.id INTO v_renter_user_id
  FROM renters r
  JOIN users u ON r.user_id = u.id
  WHERE r.id = v_renter_id;
  
  SELECT u.id INTO v_landlord_user_id
  FROM properties p
  JOIN landlords l ON p.owner_id = l.id
  JOIN users u ON l.user_id = u.id
  WHERE p.id = v_property_id;
  
  -- Update viewing request
  UPDATE property_viewing_requests SET
    status = p_status,
    landlord_notes = COALESCE(p_notes, landlord_notes),
    updated_at = NOW(),
    confirmed_date = CASE 
      WHEN p_status = 'confirmed' THEN COALESCE(p_confirmed_date, NOW() + INTERVAL '1 day')
      ELSE confirmed_date
    END,
    completed_at = CASE
      WHEN p_status = 'completed' THEN NOW()
      ELSE completed_at
    END
  WHERE id = p_request_id;
  
  -- Create notifications
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notifications') THEN
    -- Notification for renter
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
      CASE 
        WHEN p_status = 'confirmed' THEN 'Property Viewing Confirmed'
        WHEN p_status = 'rejected' THEN 'Property Viewing Rejected'
        WHEN p_status = 'completed' THEN 'Property Viewing Marked as Completed'
        ELSE 'Property Viewing Status Updated'
      END,
      CASE 
        WHEN p_status = 'confirmed' THEN 'Your request to view "' || v_property_title || '" has been confirmed for ' || to_char(COALESCE(p_confirmed_date, NOW() + INTERVAL '1 day'), 'YYYY-MM-DD HH24:MI')
        WHEN p_status = 'rejected' THEN 'Your request to view "' || v_property_title || '" has been rejected.'
        WHEN p_status = 'completed' THEN 'Your viewing of "' || v_property_title || '" has been marked as completed.'
        ELSE 'The status of your viewing request for "' || v_property_title || '" has been updated to ' || p_status
      END,
      'viewing_request',
      p_request_id,
      FALSE
    );
    
    -- Only add landlord notification for completion
    IF p_status = 'completed' THEN
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
        'Property Viewing Completed',
        'A viewing for your property "' || v_property_title || '" has been marked as completed.',
        'viewing_request',
        p_request_id,
        FALSE
      );
    END IF;
  END IF;
  
  -- If viewing is completed, update contract if it exists
  IF p_status = 'completed' THEN
    UPDATE rental_contracts SET
      viewing_completed = TRUE
    WHERE 
      property_id = v_property_id
      AND renter_id = v_renter_id
      AND status IN ('pending', 'active');
  END IF;
  
  RETURN FOUND;
END;
$$;

-- Cancel viewing request (for renter)
CREATE OR REPLACE FUNCTION cancel_viewing_request(
  p_request_id TEXT,
  p_renter_id TEXT,
  p_cancel_reason TEXT DEFAULT NULL
) RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_property_id TEXT;
  v_property_title TEXT;
  v_landlord_user_id TEXT;
BEGIN
  -- Get property information
  SELECT 
    pvr.property_id,
    p.title_en
  INTO 
    v_property_id,
    v_property_title
  FROM property_viewing_requests pvr
  JOIN properties p ON pvr.property_id = p.id
  WHERE 
    pvr.id = p_request_id
    AND pvr.renter_id = p_renter_id
    AND pvr.status IN ('pending', 'confirmed');
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Viewing request not found or cannot be cancelled';
  END IF;
  
  -- Get landlord's user ID for notification
  SELECT u.id INTO v_landlord_user_id
  FROM properties p
  JOIN landlords l ON p.owner_id = l.id
  JOIN users u ON l.user_id = u.id
  WHERE p.id = v_property_id;
  
  -- Update viewing request
  UPDATE property_viewing_requests SET
    status = 'cancelled',
    renter_notes = CASE 
      WHEN p_cancel_reason IS NOT NULL THEN 
        COALESCE(renter_notes, '') || E'\n\nCancellation reason: ' || p_cancel_reason
      ELSE renter_notes
    END,
    updated_at = NOW()
  WHERE 
    id = p_request_id
    AND renter_id = p_renter_id;
  
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
      'A renter has cancelled their request to view your property "' || v_property_title || '".' || 
      CASE WHEN p_cancel_reason IS NOT NULL THEN E'\n\nReason: ' || p_cancel_reason ELSE '' END,
      'viewing_request',
      p_request_id,
      FALSE
    );
  END IF;
  
  RETURN FOUND;
END;
$$; 