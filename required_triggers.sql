-- DarRent - Required Database Triggers Implementation
-- This file contains all required triggers for property viewing requests, reviews, and contract management

-- ==========================================
-- Property Viewing Request Triggers
-- ==========================================

-- Trigger to update application status when a viewing is completed
CREATE OR REPLACE FUNCTION viewing_completion_trigger()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_application_id TEXT;
BEGIN
  -- Only fire when status changes to 'completed'
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    -- Find any pending application for this property and renter
    SELECT id INTO v_application_id
    FROM applications
    WHERE property_id = NEW.property_id 
    AND renter_id = NEW.renter_id
    AND status = 'accepted';
    
    -- Update the application progress
    IF v_application_id IS NOT NULL THEN
      UPDATE applications
      SET progress = progress + 10
      WHERE id = v_application_id;
    END IF;
    
    -- Update contract if it exists
    UPDATE rental_contracts
    SET viewing_completed = TRUE
    WHERE property_id = NEW.property_id 
    AND renter_id = NEW.renter_id
    AND status IN ('pending', 'draft');
    
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
        'Property Viewing Completed',
        'A viewing for your property "' || p.title_en || '" has been completed.',
        'property_viewing',
        NEW.id,
        FALSE
      FROM properties p
      JOIN landlords l ON p.owner_id = l.id
      JOIN users u ON l.user_id = u.id
      WHERE p.id = NEW.property_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger on property_viewing_requests table for viewing completion
DROP TRIGGER IF EXISTS viewing_completion ON property_viewing_requests;
CREATE TRIGGER viewing_completion
AFTER UPDATE ON property_viewing_requests
FOR EACH ROW
EXECUTE FUNCTION viewing_completion_trigger();

-- Trigger to validate viewing requests
CREATE OR REPLACE FUNCTION validate_viewing_request_trigger()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_property_available BOOLEAN;
  v_existing_request BOOLEAN;
BEGIN
  -- Check if property is available for viewings
  SELECT (status IN ('available', 'pending')) INTO v_property_available
  FROM properties
  WHERE id = NEW.property_id;
  
  IF NOT v_property_available THEN
    RAISE EXCEPTION 'Property is not available for viewings';
  END IF;
  
  -- Check if an active viewing request already exists
  SELECT EXISTS (
    SELECT 1 
    FROM property_viewing_requests
    WHERE property_id = NEW.property_id
    AND renter_id = NEW.renter_id
    AND status IN ('pending', 'scheduled')
  ) INTO v_existing_request;
  
  IF v_existing_request AND TG_OP = 'INSERT' THEN
    RAISE EXCEPTION 'An active viewing request already exists for this property';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger on property_viewing_requests table for validation
DROP TRIGGER IF EXISTS validate_viewing_request ON property_viewing_requests;
CREATE TRIGGER validate_viewing_request
BEFORE INSERT ON property_viewing_requests
FOR EACH ROW
EXECUTE FUNCTION validate_viewing_request_trigger();

-- ==========================================
-- Review System Triggers
-- ==========================================

-- Trigger to check review eligibility
CREATE OR REPLACE FUNCTION review_eligibility_trigger()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_contract_exists BOOLEAN;
  v_contract_completed BOOLEAN;
BEGIN
  -- For property reviews
  IF TG_TABLE_NAME = 'property_reviews' THEN
    -- Check if renter has a completed contract for this property
    SELECT 
      EXISTS (
        SELECT 1 FROM rental_contracts
        WHERE property_id = NEW.property_id
        AND renter_id = NEW.renter_id
      ),
      EXISTS (
        SELECT 1 FROM rental_contracts
        WHERE property_id = NEW.property_id
        AND renter_id = NEW.renter_id
        AND status IN ('completed', 'terminated', 'expired')
        AND end_date < NOW()
      )
    INTO v_contract_exists, v_contract_completed;
    
    IF NOT v_contract_exists THEN
      RAISE EXCEPTION 'Renter has not rented this property';
    ELSIF NOT v_contract_completed THEN
      RAISE EXCEPTION 'Contract must be completed before reviewing';
    END IF;
  
  -- For renter reviews
  ELSIF TG_TABLE_NAME = 'renter_reviews' THEN
    -- Check if landlord has a completed contract with this renter
    WITH property_info AS (
      SELECT p.id, p.owner_id 
      FROM properties p
      JOIN rental_contracts rc ON p.id = rc.property_id
      WHERE rc.renter_id = NEW.renter_id
      AND rc.status IN ('completed', 'terminated', 'expired')
      AND rc.end_date < NOW()
    )
    SELECT EXISTS (
      SELECT 1 FROM property_info
      WHERE owner_id = NEW.landlord_id
    ) INTO v_contract_completed;
    
    IF NOT v_contract_completed THEN
      RAISE EXCEPTION 'Landlord has not had a completed contract with this renter';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger on property_reviews table for eligibility checking
DROP TRIGGER IF EXISTS review_eligibility_property ON property_reviews;
CREATE TRIGGER review_eligibility_property
BEFORE INSERT ON property_reviews
FOR EACH ROW
EXECUTE FUNCTION review_eligibility_trigger();

-- Create trigger on renter_reviews table for eligibility checking
DROP TRIGGER IF EXISTS review_eligibility_renter ON renter_reviews;
CREATE TRIGGER review_eligibility_renter
BEFORE INSERT ON renter_reviews
FOR EACH ROW
EXECUTE FUNCTION review_eligibility_trigger();

-- Trigger to prevent duplicate reviews
CREATE OR REPLACE FUNCTION prevent_duplicate_reviews_trigger()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_review_exists BOOLEAN;
BEGIN
  -- For property reviews
  IF TG_TABLE_NAME = 'property_reviews' THEN
    -- Check if renter has already reviewed this property
    SELECT EXISTS (
      SELECT 1 FROM property_reviews
      WHERE property_id = NEW.property_id
      AND renter_id = NEW.renter_id
      AND id != NEW.id
    ) INTO v_review_exists;
    
  -- For renter reviews
  ELSIF TG_TABLE_NAME = 'renter_reviews' THEN
    -- Check if landlord has already reviewed this renter for this contract
    SELECT EXISTS (
      SELECT 1 FROM renter_reviews
      WHERE renter_id = NEW.renter_id
      AND landlord_id = NEW.landlord_id
      AND contract_id = NEW.contract_id
      AND id != NEW.id
    ) INTO v_review_exists;
  END IF;
  
  IF v_review_exists THEN
    RAISE EXCEPTION 'A review already exists';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger on property_reviews table to prevent duplicates
DROP TRIGGER IF EXISTS prevent_duplicate_property_reviews ON property_reviews;
CREATE TRIGGER prevent_duplicate_property_reviews
BEFORE INSERT OR UPDATE ON property_reviews
FOR EACH ROW
EXECUTE FUNCTION prevent_duplicate_reviews_trigger();

-- Create trigger on renter_reviews table to prevent duplicates
DROP TRIGGER IF EXISTS prevent_duplicate_renter_reviews ON renter_reviews;
CREATE TRIGGER prevent_duplicate_renter_reviews
BEFORE INSERT OR UPDATE ON renter_reviews
FOR EACH ROW
EXECUTE FUNCTION prevent_duplicate_reviews_trigger();

-- ==========================================
-- Contract Management Triggers
-- ==========================================

-- Trigger to validate contract creation
CREATE OR REPLACE FUNCTION validate_contract_trigger()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_application_accepted BOOLEAN;
  v_viewing_completed BOOLEAN;
  v_active_contract_exists BOOLEAN;
BEGIN
  -- Check if there's an accepted application
  SELECT EXISTS (
    SELECT 1 
    FROM applications
    WHERE property_id = NEW.property_id
    AND renter_id = NEW.renter_id
    AND status = 'accepted'
  ) INTO v_application_accepted;
  
  -- Check if there's a completed viewing
  SELECT EXISTS (
    SELECT 1 
    FROM property_viewing_requests
    WHERE property_id = NEW.property_id
    AND renter_id = NEW.renter_id
    AND status = 'completed'
  ) INTO v_viewing_completed;
  
  -- Check if there's an active contract
  SELECT EXISTS (
    SELECT 1 
    FROM rental_contracts
    WHERE property_id = NEW.property_id
    AND status = 'active'
    AND id != NEW.id
  ) INTO v_active_contract_exists;
  
  -- Apply validations
  IF NOT v_application_accepted AND NEW.status IN ('active', 'pending') THEN
    RAISE WARNING 'No accepted application exists for this property and renter';
  END IF;
  
  IF NOT v_viewing_completed AND NEW.status = 'active' THEN
    NEW.viewing_completed := FALSE;
    RAISE WARNING 'Property viewing has not been completed';
  ELSIF v_viewing_completed THEN
    NEW.viewing_completed := TRUE;
  END IF;
  
  IF v_active_contract_exists AND NEW.status = 'active' THEN
    RAISE EXCEPTION 'An active contract already exists for this property';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger on rental_contracts table for validation
DROP TRIGGER IF EXISTS validate_contract ON rental_contracts;
CREATE TRIGGER validate_contract
BEFORE INSERT OR UPDATE OF status ON rental_contracts
FOR EACH ROW
EXECUTE FUNCTION validate_contract_trigger();

-- Trigger for contract status changes
CREATE OR REPLACE FUNCTION contract_status_change_trigger()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  -- Only fire when status changes
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    -- When contract becomes active
    IF NEW.status = 'active' AND OLD.status != 'active' THEN
      -- Update property status to rented
      UPDATE properties 
      SET status = 'rented'
      WHERE id = NEW.property_id;
      
      -- Cancel any other pending applications for this property
      UPDATE applications
      SET status = 'rejected', 
          updated_at = NOW()
      WHERE property_id = NEW.property_id
      AND renter_id != NEW.renter_id
      AND status = 'pending';
    
    -- When contract ends (completed, terminated, expired)
    ELSIF NEW.status IN ('completed', 'terminated', 'expired') AND OLD.status = 'active' THEN
      -- Update property status based on verification
      UPDATE properties 
      SET status = CASE 
        WHEN verified THEN 'available'
        ELSE 'pending_verification'
      END
      WHERE id = NEW.property_id;
      
      -- Enable review opportunities - create notifications
      IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notifications') THEN
        -- Get user IDs
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
          'Review Opportunity Available',
          'You can now leave a review for your rental experience',
          'review_opportunity',
          NEW.id,
          FALSE
        FROM users u
        JOIN landlords l ON u.id = l.user_id
        JOIN properties p ON l.id = p.owner_id
        WHERE p.id = NEW.property_id
        
        UNION ALL
        
        SELECT 
          gen_random_uuid()::TEXT,
          u.id,
          'Review Opportunity Available',
          'You can now leave a review for your rental experience',
          'review_opportunity',
          NEW.id,
          FALSE
        FROM users u
        JOIN renters r ON u.id = r.user_id
        WHERE r.id = NEW.renter_id;
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger on rental_contracts table for status changes
DROP TRIGGER IF EXISTS contract_status_change ON rental_contracts;
CREATE TRIGGER contract_status_change
AFTER UPDATE OF status ON rental_contracts
FOR EACH ROW
EXECUTE FUNCTION contract_status_change_trigger();

-- Contract comment notification trigger
CREATE OR REPLACE FUNCTION contract_comment_trigger()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_landlord_user_id TEXT;
  v_renter_user_id TEXT;
  v_recipient_id TEXT;
  v_property_title TEXT;
BEGIN
  -- Get user information
  SELECT 
    lu.id,
    ru.id,
    p.title_en
  INTO
    v_landlord_user_id,
    v_renter_user_id,
    v_property_title
  FROM rental_contracts rc
  JOIN properties p ON rc.property_id = p.id
  JOIN renters r ON rc.renter_id = r.id
  JOIN users ru ON r.user_id = ru.id
  JOIN landlords l ON p.owner_id = l.id
  JOIN users lu ON l.user_id = lu.id
  WHERE rc.id = NEW.contract_id;
  
  -- Determine notification recipient
  IF NEW.user_id = v_landlord_user_id THEN
    v_recipient_id := v_renter_user_id;
  ELSE
    v_recipient_id := v_landlord_user_id;
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
      v_recipient_id,
      CASE WHEN NEW.is_issue THEN 'New Issue Reported' ELSE 'New Contract Comment' END,
      CASE WHEN NEW.is_issue 
        THEN 'An issue has been reported for ' || v_property_title
        ELSE 'A new comment has been added to your contract for ' || v_property_title
      END,
      CASE WHEN NEW.is_issue THEN 'issue' ELSE 'comment' END,
      NEW.id,
      FALSE
    );
  END IF;
  
  -- If this is an issue, update contract comment thread status
  IF NEW.is_issue THEN
    UPDATE rental_contracts
    SET has_active_issues = TRUE
    WHERE id = NEW.contract_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger on contract_comments table for notifications
DROP TRIGGER IF EXISTS contract_comment_notification ON contract_comments;
CREATE TRIGGER contract_comment_notification
AFTER INSERT ON contract_comments
FOR EACH ROW
EXECUTE FUNCTION contract_comment_trigger();

-- Issue resolution trigger
CREATE OR REPLACE FUNCTION issue_resolution_trigger()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  -- Only fire when an issue is marked as resolved
  IF NEW.issue_resolved = TRUE AND (OLD.issue_resolved = FALSE OR OLD.issue_resolved IS NULL) THEN
    -- Check if there are any other unresolved issues for this contract
    IF NOT EXISTS (
      SELECT 1 
      FROM contract_comments
      WHERE contract_id = NEW.contract_id
      AND is_issue = TRUE
      AND issue_resolved = FALSE
      AND id != NEW.id
    ) THEN
      -- No other unresolved issues, update contract status
      UPDATE rental_contracts
      SET has_active_issues = FALSE
      WHERE id = NEW.contract_id;
    END IF;
    
    -- Create notification about resolution
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
        CASE 
          WHEN NEW.issue_resolved_by = lu.id THEN ru.id
          ELSE lu.id
        END,
        'Issue Resolved',
        'An issue for property "' || p.title_en || '" has been resolved',
        'issue_resolution',
        NEW.id,
        FALSE
      FROM rental_contracts rc
      JOIN properties p ON rc.property_id = p.id
      JOIN renters r ON rc.renter_id = r.id
      JOIN users ru ON r.user_id = ru.id
      JOIN landlords l ON p.owner_id = l.id
      JOIN users lu ON l.user_id = lu.id
      WHERE rc.id = NEW.contract_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger on contract_comments table for issue resolution
DROP TRIGGER IF EXISTS issue_resolution ON contract_comments;
CREATE TRIGGER issue_resolution
AFTER UPDATE OF issue_resolved ON contract_comments
FOR EACH ROW
EXECUTE FUNCTION issue_resolution_trigger();

-- ==========================================
-- Add has_active_issues column to rental_contracts if needed
-- ==========================================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'rental_contracts' AND column_name = 'has_active_issues'
    ) THEN
        ALTER TABLE rental_contracts ADD COLUMN has_active_issues BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- Update existing contracts with active issues
UPDATE rental_contracts
SET has_active_issues = (
  SELECT EXISTS (
    SELECT 1 
    FROM contract_comments
    WHERE contract_id = rental_contracts.id
    AND is_issue = TRUE
    AND (issue_resolved = FALSE OR issue_resolved IS NULL)
  )
); 