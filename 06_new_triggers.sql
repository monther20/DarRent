-- DarRent - New Database Triggers
-- This file contains new trigger implementations required for the project

-- ==========================================
-- New Database Triggers
-- ==========================================

-- 1. Property Video Verification Trigger
CREATE OR REPLACE FUNCTION property_video_verification_trigger()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  -- When a video is added to a property
  IF TG_OP = 'INSERT' THEN
    -- If the video is marked as the main video, update property status
    IF NEW.is_main_video THEN
      UPDATE properties 
      SET 
        requires_video = FALSE,
        status = CASE 
          WHEN status = 'available' THEN 'pending_verification'
          ELSE status
        END
      WHERE id = NEW.property_id;
    END IF;
  
  -- When a video is verified
  ELSIF TG_OP = 'UPDATE' AND NEW.verified != OLD.verified THEN
    -- If the main video is verified, update property verified status
    IF NEW.is_main_video AND NEW.verified THEN
      UPDATE properties 
      SET 
        verified = TRUE,
        status = CASE 
          WHEN status = 'pending_verification' THEN 'available'
          ELSE status
        END
      WHERE id = NEW.property_id;
      
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
        ) 
        SELECT 
          gen_random_uuid()::TEXT,
          u.id,
          'Property Video Verified',
          'Your video for property "' || p.title_en || '" has been verified.',
          'property_video',
          NEW.id,
          FALSE
        FROM properties p
        JOIN landlords l ON p.owner_id = l.id
        JOIN users u ON l.user_id = u.id
        WHERE p.id = NEW.property_id;
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger on property_videos table
CREATE TRIGGER property_video_verification
AFTER INSERT OR UPDATE ON property_videos
FOR EACH ROW
EXECUTE FUNCTION property_video_verification_trigger();

-- 2. Contract Review Availability Trigger
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
CREATE TRIGGER contract_review_availability
AFTER UPDATE ON rental_contracts
FOR EACH ROW
EXECUTE FUNCTION contract_review_availability_trigger();

-- 3. Contract Comment Notification Trigger
CREATE OR REPLACE FUNCTION contract_comment_notification_trigger()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_contract_id TEXT;
  v_property_id TEXT;
  v_property_title TEXT;
  v_comment_user_id TEXT;
  v_comment_user_name TEXT;
  v_landlord_user_id TEXT;
  v_renter_user_id TEXT;
  v_notify_user_id TEXT;
BEGIN
  -- Only fire for new comments
  IF TG_OP = 'INSERT' THEN
    -- Get contract and property info
    SELECT 
      c.id,
      p.id,
      p.title_en,
      lu.id,
      ru.id,
      u.id,
      u.full_name_en
    INTO 
      v_contract_id,
      v_property_id,
      v_property_title,
      v_landlord_user_id,
      v_renter_user_id,
      v_comment_user_id,
      v_comment_user_name
    FROM rental_contracts c
    JOIN properties p ON c.property_id = p.id
    JOIN landlords l ON p.owner_id = l.id
    JOIN users lu ON l.user_id = lu.id
    JOIN renters r ON c.renter_id = r.id
    JOIN users ru ON r.user_id = ru.id
    JOIN users u ON NEW.user_id = u.id
    WHERE c.id = NEW.contract_id;
    
    -- Determine who to notify
    IF v_comment_user_id = v_landlord_user_id THEN
      v_notify_user_id := v_renter_user_id;
    ELSE
      v_notify_user_id := v_landlord_user_id;
    END IF;
    
    -- Create notification
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
        v_notify_user_id,
        'New Comment on Contract',
        v_comment_user_name || ' commented on contract for "' || v_property_title || '".',
        'contract_comment',
        NEW.id,
        FALSE
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger on contract_comments table
CREATE TRIGGER contract_comment_notification
AFTER INSERT ON contract_comments
FOR EACH ROW
EXECUTE FUNCTION contract_comment_notification_trigger();

-- 4. Property Viewing Request Notification Trigger
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
CREATE TRIGGER property_viewing_request_notification
AFTER UPDATE ON property_viewing_requests
FOR EACH ROW
EXECUTE FUNCTION property_viewing_request_notification_trigger();

-- ==========================================
-- Modified Database Triggers
-- ==========================================

-- 1. Modified Property Status Update Trigger
CREATE OR REPLACE FUNCTION property_status_update_trigger_v2()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  -- When a rental contract becomes active, update property status to 'rented'
  IF NEW.status = 'active' AND (OLD IS NULL OR OLD.status != 'active') THEN
    -- Check if property has been viewed (if required)
    IF NEW.viewing_completed OR EXISTS (
      SELECT 1 FROM property_viewing_requests 
      WHERE property_id = NEW.property_id 
      AND renter_id = NEW.renter_id
      AND status = 'completed'
    ) THEN
      UPDATE properties SET status = 'rented' WHERE id = NEW.property_id;
    ELSE
      -- Require viewing before finalizing contract
      RAISE EXCEPTION 'Property must be viewed before contract can be activated';
    END IF;
  
  -- When a rental contract is terminated or expired, update property status to 'available'
  ELSIF (NEW.status = 'terminated' OR NEW.status = 'expired') AND OLD.status = 'active' THEN
    -- Check if property is verified before making available again
    UPDATE properties 
    SET status = CASE 
      WHEN verified THEN 'available'
      ELSE 'pending_verification'
    END
    WHERE id = NEW.property_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Drop old trigger and create new one
DROP TRIGGER IF EXISTS property_status_update ON rental_contracts;

CREATE TRIGGER property_status_update_v2
AFTER INSERT OR UPDATE ON rental_contracts
FOR EACH ROW
EXECUTE FUNCTION property_status_update_trigger_v2();

-- 2. Modified Contract Auto-Renewal Trigger
CREATE OR REPLACE FUNCTION contract_auto_renewal_job_v2()
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_contract record;
  v_landlord_user_id TEXT;
  v_renter_user_id TEXT;
  v_landlord_rating NUMERIC;
  v_renter_rating NUMERIC;
  v_min_rating NUMERIC := 3.0; -- Minimum acceptable rating for auto-renewal
BEGIN
  -- Find contracts set for auto-renewal that expire in the next 7 days
  FOR v_contract IN
    SELECT rc.* 
    FROM rental_contracts rc
    WHERE rc.status = 'active'
    AND rc.auto_renewal = TRUE
    AND rc.end_date BETWEEN NOW() AND (NOW() + INTERVAL '7 days')
  LOOP
    -- Get user IDs and ratings
    SELECT 
      lu.id, 
      ru.id,
      COALESCE(lu.average_rating, 5.0),
      COALESCE(ru.average_rating, 5.0)
    INTO 
      v_landlord_user_id,
      v_renter_user_id,
      v_landlord_rating,
      v_renter_rating
    FROM properties p
    JOIN landlords l ON p.owner_id = l.id
    JOIN users lu ON l.user_id = lu.id
    JOIN renters r ON v_contract.renter_id = r.id
    JOIN users ru ON r.user_id = ru.id
    WHERE p.id = v_contract.property_id;
    
    -- Only auto-renew if both parties have acceptable ratings
    IF v_landlord_rating >= v_min_rating AND v_renter_rating >= v_min_rating THEN
      -- Extend the contract by 12 months
      UPDATE rental_contracts
      SET 
        end_date = end_date + INTERVAL '12 months',
        updated_at = NOW()
      WHERE id = v_contract.id;
      
      -- Create notifications
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
          v_landlord_user_id,
          'Contract Auto-Renewed',
          'A rental contract has been automatically renewed for another year.',
          'contract',
          v_contract.id,
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
          'Contract Auto-Renewed',
          'Your rental contract has been automatically renewed for another year.',
          'contract',
          v_contract.id,
          FALSE
        );
      END IF;
    ELSE
      -- Create notifications that auto-renewal was skipped due to ratings
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
          v_landlord_user_id,
          'Auto-Renewal Skipped',
          'A contract was not automatically renewed due to rating requirements.',
          'contract',
          v_contract.id,
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
          'Auto-Renewal Skipped',
          'Your contract was not automatically renewed due to rating requirements.',
          'contract',
          v_contract.id,
          FALSE
        );
      END IF;
      
      -- Turn off auto-renewal for this contract
      UPDATE rental_contracts
      SET auto_renewal = FALSE
      WHERE id = v_contract.id;
    END IF;
  END LOOP;
END;
$$; 