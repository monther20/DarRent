-- DarRent App - Database Triggers
-- This file implements the database triggers required for automating workflows

-- ==========================================
-- Helper Functions for Triggers
-- ==========================================

-- Create a notifications table to store system notifications
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  title_en TEXT NOT NULL,
  title_ar TEXT,
  content_en TEXT NOT NULL,
  content_ar TEXT,
  type TEXT NOT NULL, -- 'payment', 'contract', 'maintenance', 'application', etc.
  related_id TEXT, -- ID of the related record (property, contract, etc.)
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Helper function to create notifications
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id TEXT,
  p_title_en TEXT,
  p_content_en TEXT,
  p_type TEXT,
  p_related_id TEXT,
  p_title_ar TEXT DEFAULT NULL,
  p_content_ar TEXT DEFAULT NULL
) RETURNS TEXT LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_notification_id TEXT;
BEGIN
  v_notification_id := gen_random_uuid()::TEXT;
  
  INSERT INTO notifications (
    id, user_id, title_en, title_ar, content_en, content_ar, type, related_id
  ) VALUES (
    v_notification_id, p_user_id, p_title_en, p_title_ar, p_content_en, p_content_ar, p_type, p_related_id
  );
  
  RETURN v_notification_id;
END;
$$;

-- ==========================================
-- Regular Table Triggers
-- ==========================================

-- 1. Property Status Update Trigger
CREATE OR REPLACE FUNCTION property_status_update_trigger()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  -- When a rental contract becomes active, update property status to 'rented'
  IF NEW.status = 'active' AND (OLD IS NULL OR OLD.status != 'active') THEN
    UPDATE properties SET status = 'rented' WHERE id = NEW.property_id;
  
  -- When a rental contract is terminated or expired, update property status to 'available'
  ELSIF (NEW.status = 'terminated' OR NEW.status = 'expired') AND OLD.status = 'active' THEN
    UPDATE properties SET status = 'available' WHERE id = NEW.property_id;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER property_status_update
AFTER INSERT OR UPDATE ON rental_contracts
FOR EACH ROW
EXECUTE FUNCTION property_status_update_trigger();

-- 2. Maintenance Request Status History Trigger
CREATE OR REPLACE FUNCTION maintenance_status_history_trigger()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  -- Only track status changes
  IF NEW.status != OLD.status THEN
    INSERT INTO maintenance_status_history (
      id,
      request_id,
      previous_status,
      new_status,
      changed_by,
      changed_at,
      notes_en
    ) VALUES (
      gen_random_uuid()::TEXT,
      NEW.id,
      OLD.status,
      NEW.status,
      'system', -- Consider adding a session variable to track who made the change
      NOW(),
      'Status changed automatically via trigger'
    );
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER maintenance_status_history
AFTER UPDATE ON maintenance_requests
FOR EACH ROW
WHEN (NEW.status IS DISTINCT FROM OLD.status)
EXECUTE FUNCTION maintenance_status_history_trigger();

-- 3. Transaction Status Change Trigger
CREATE OR REPLACE FUNCTION transaction_status_change_trigger()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_renter_user_id TEXT;
  v_landlord_user_id TEXT;
  v_property_title TEXT;
BEGIN
  -- Only proceed if status changed to 'paid'
  IF NEW.status = 'paid' AND OLD.status != 'paid' THEN
    -- Get user IDs for notifications
    SELECT u.id INTO v_renter_user_id
    FROM renters r
    JOIN users u ON r.user_id = u.id
    WHERE r.id = NEW.renter_id;
    
    SELECT u.id INTO v_landlord_user_id
    FROM landlords l
    JOIN users u ON l.user_id = u.id
    WHERE l.id = NEW.landlord_id;
    
    -- Get property title
    SELECT title_en INTO v_property_title
    FROM properties
    WHERE id = NEW.property_id;
    
    -- Create notifications for both parties
    PERFORM create_notification(
      v_renter_user_id,
      'Payment Confirmed',
      'Your payment of ' || NEW.amount || ' ' || NEW.currency || ' for ' || v_property_title || ' has been confirmed.',
      'payment',
      NEW.id
    );
    
    PERFORM create_notification(
      v_landlord_user_id,
      'Payment Received',
      'You have received a payment of ' || NEW.amount || ' ' || NEW.currency || ' for ' || v_property_title || '.',
      'payment',
      NEW.id
    );
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER transaction_status_change
AFTER UPDATE ON transactions
FOR EACH ROW
WHEN (NEW.status IS DISTINCT FROM OLD.status)
EXECUTE FUNCTION transaction_status_change_trigger();

-- 4. Message Read Status Trigger
CREATE OR REPLACE FUNCTION message_read_status_trigger()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  -- No need for complex logic here as the client will typically
  -- call the mark_messages_as_read function which handles multiple messages
  -- This trigger is mainly for individual message status changes
  RETURN NEW;
END;
$$;

CREATE TRIGGER message_read_status
AFTER UPDATE ON messages
FOR EACH ROW
WHEN (NEW.is_read = TRUE AND OLD.is_read = FALSE)
EXECUTE FUNCTION message_read_status_trigger();

-- 5. Property Views Increment Function
-- (Called explicitly by API, not a true trigger)
CREATE OR REPLACE FUNCTION increment_property_views(
  p_property_id TEXT
) RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE properties
  SET views = views + 1
  WHERE id = p_property_id;
  
  RETURN FOUND;
END;
$$;

-- ==========================================
-- Scheduled Triggers (requires pg_cron)
-- ==========================================

-- First, ensure pg_cron extension is available
-- Note: This may require superuser privileges and might not be available in all Supabase instances
-- CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 6. Auto Accept Rent Request (scheduled job)
CREATE OR REPLACE FUNCTION auto_accept_rent_requests_job()
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_request record;
  v_property_owner TEXT;
  v_renter_user_id TEXT;
BEGIN
  -- Find applications that have been pending for more than 3 days
  FOR v_request IN
    SELECT a.* 
    FROM applications a
    WHERE a.status = 'pending'
    AND a.created_at < (NOW() - INTERVAL '3 days')
  LOOP
    -- Get property owner ID for notification
    SELECT u.id INTO v_property_owner
    FROM properties p
    JOIN landlords l ON p.owner_id = l.id
    JOIN users u ON l.user_id = u.id
    WHERE p.id = v_request.property_id;
    
    -- Get renter's user ID
    SELECT u.id INTO v_renter_user_id
    FROM renters r
    JOIN users u ON r.user_id = u.id
    WHERE r.id = v_request.renter_id;
    
    -- Update application status
    UPDATE applications
    SET status = 'accepted'
    WHERE id = v_request.id;
    
    -- Create notifications
    PERFORM create_notification(
      v_property_owner,
      'Application Auto-Accepted',
      'A rental application for your property was automatically accepted after 3 days.',
      'application',
      v_request.id
    );
    
    PERFORM create_notification(
      v_renter_user_id,
      'Application Accepted',
      'Your rental application has been automatically accepted.',
      'application',
      v_request.id
    );
    
    -- Update property status
    UPDATE properties
    SET status = 'pending'
    WHERE id = v_request.property_id;
  END LOOP;
END;
$$;

-- 7. Rent Payment Reminder (scheduled job)
CREATE OR REPLACE FUNCTION rent_payment_reminder_job()
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_transaction record;
  v_renter_user_id TEXT;
BEGIN
  -- Find transactions due in the next 3 days
  FOR v_transaction IN
    SELECT t.* 
    FROM transactions t
    WHERE t.status = 'pending'
    AND t.due_date BETWEEN NOW() AND (NOW() + INTERVAL '3 days')
  LOOP
    -- Get renter's user ID
    SELECT u.id INTO v_renter_user_id
    FROM renters r
    JOIN users u ON r.user_id = u.id
    WHERE r.id = v_transaction.renter_id;
    
    -- Create notification
    PERFORM create_notification(
      v_renter_user_id,
      'Payment Reminder',
      'You have a payment of ' || v_transaction.amount || ' ' || v_transaction.currency || 
      ' due on ' || to_char(v_transaction.due_date, 'YYYY-MM-DD') || '.',
      'payment',
      v_transaction.id
    );
  END LOOP;
END;
$$;

-- 8. Contract Expiration Notification (scheduled job)
CREATE OR REPLACE FUNCTION contract_expiration_notification_job()
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_contract record;
  v_landlord_user_id TEXT;
  v_renter_user_id TEXT;
  v_days_until_expiry INTEGER;
BEGIN
  -- Find contracts expiring in the next 30 days
  FOR v_contract IN
    SELECT rc.* 
    FROM rental_contracts rc
    WHERE rc.status = 'active'
    AND rc.end_date BETWEEN NOW() AND (NOW() + INTERVAL '30 days')
  LOOP
    -- Calculate days until expiry
    v_days_until_expiry := EXTRACT(DAY FROM (v_contract.end_date - NOW()));
    
    -- Get landlord's user ID
    SELECT u.id INTO v_landlord_user_id
    FROM properties p
    JOIN landlords l ON p.owner_id = l.id
    JOIN users u ON l.user_id = u.id
    WHERE p.id = v_contract.property_id;
    
    -- Get renter's user ID
    SELECT u.id INTO v_renter_user_id
    FROM renters r
    JOIN users u ON r.user_id = u.id
    WHERE r.id = v_contract.renter_id;
    
    -- Create notifications
    PERFORM create_notification(
      v_landlord_user_id,
      'Contract Expiring Soon',
      'A rental contract is expiring in ' || v_days_until_expiry || ' days.',
      'contract',
      v_contract.id
    );
    
    PERFORM create_notification(
      v_renter_user_id,
      'Contract Expiring Soon',
      'Your rental contract is expiring in ' || v_days_until_expiry || ' days.',
      'contract',
      v_contract.id
    );
  END LOOP;
END;
$$;

-- 9. Maintenance Follow-Up (scheduled job)
CREATE OR REPLACE FUNCTION maintenance_follow_up_job()
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_request record;
  v_renter_user_id TEXT;
BEGIN
  -- Find maintenance requests completed 3 days ago
  FOR v_request IN
    SELECT mr.* 
    FROM maintenance_requests mr
    WHERE mr.status = 'completed'
    AND mr.completed_at::DATE = (NOW() - INTERVAL '3 days')::DATE
  LOOP
    -- Get renter's user ID
    SELECT u.id INTO v_renter_user_id
    FROM renters r
    JOIN users u ON r.user_id = u.id
    WHERE r.id = v_request.renter_id;
    
    -- Create notification
    PERFORM create_notification(
      v_renter_user_id,
      'Maintenance Follow-Up',
      'How was the maintenance work on "' || v_request.title_en || '"? Please provide feedback.',
      'maintenance',
      v_request.id
    );
  END LOOP;
END;
$$;

-- 10. Days Listed Counter Update (scheduled job)
CREATE OR REPLACE FUNCTION update_days_listed_job()
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  -- Update days_listed for all available properties
  UPDATE properties
  SET days_listed = days_listed + 1
  WHERE status = 'available';
END;
$$;

-- 11. Contract Auto-Renewal (scheduled job)
CREATE OR REPLACE FUNCTION contract_auto_renewal_job()
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_contract record;
  v_landlord_user_id TEXT;
  v_renter_user_id TEXT;
BEGIN
  -- Find contracts set for auto-renewal that expire in the next 7 days
  -- NOTE: We need to add an auto_renewal column to the rental_contracts table!
  FOR v_contract IN
    SELECT rc.* 
    FROM rental_contracts rc
    WHERE rc.status = 'active'
    -- Assuming we add an auto_renewal column to the table
    -- AND rc.auto_renewal = TRUE
    AND rc.end_date BETWEEN NOW() AND (NOW() + INTERVAL '7 days')
  LOOP
    -- Extend the contract by 12 months (or the original duration)
    UPDATE rental_contracts
    SET 
      end_date = end_date + INTERVAL '12 months',
      updated_at = NOW()
    WHERE id = v_contract.id;
    
    -- Get landlord's user ID
    SELECT u.id INTO v_landlord_user_id
    FROM properties p
    JOIN landlords l ON p.owner_id = l.id
    JOIN users u ON l.user_id = u.id
    WHERE p.id = v_contract.property_id;
    
    -- Get renter's user ID
    SELECT u.id INTO v_renter_user_id
    FROM renters r
    JOIN users u ON r.user_id = u.id
    WHERE r.id = v_contract.renter_id;
    
    -- Create notifications
    PERFORM create_notification(
      v_landlord_user_id,
      'Contract Auto-Renewed',
      'A rental contract has been automatically renewed for another year.',
      'contract',
      v_contract.id
    );
    
    PERFORM create_notification(
      v_renter_user_id,
      'Contract Auto-Renewed',
      'Your rental contract has been automatically renewed for another year.',
      'contract',
      v_contract.id
    );
  END LOOP;
END;
$$;

-- ==========================================
-- Scheduling the Jobs (requires pg_cron)
-- ==========================================

/*
-- Schedule daily jobs (if pg_cron is available)
SELECT cron.schedule('0 0 * * *', 'SELECT auto_accept_rent_requests_job()');
SELECT cron.schedule('0 9 * * *', 'SELECT rent_payment_reminder_job()');
SELECT cron.schedule('0 10 * * *', 'SELECT contract_expiration_notification_job()');
SELECT cron.schedule('0 11 * * *', 'SELECT maintenance_follow_up_job()');
SELECT cron.schedule('0 1 * * *', 'SELECT update_days_listed_job()');
SELECT cron.schedule('0 2 * * *', 'SELECT contract_auto_renewal_job()');
*/

-- ==========================================
-- Implementing Scheduled Jobs without pg_cron
-- ==========================================

-- Alternative approach if pg_cron isn't available:
-- 1. Create a table to track when jobs were last run
CREATE TABLE IF NOT EXISTS scheduled_job_log (
  job_name TEXT PRIMARY KEY,
  last_run_at TIMESTAMP DEFAULT NULL,
  next_run_at TIMESTAMP DEFAULT NULL
);

-- 2. Insert initial records for jobs
INSERT INTO scheduled_job_log (job_name, next_run_at)
VALUES 
  ('auto_accept_rent_requests', NOW()),
  ('rent_payment_reminder', NOW()),
  ('contract_expiration_notification', NOW()),
  ('maintenance_follow_up', NOW()),
  ('update_days_listed', NOW()),
  ('contract_auto_renewal', NOW())
ON CONFLICT (job_name) DO NOTHING;

-- 3. Create a function to run jobs if they're due
CREATE OR REPLACE FUNCTION run_scheduled_jobs()
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  -- Auto accept rent requests
  IF EXISTS (SELECT 1 FROM scheduled_job_log WHERE job_name = 'auto_accept_rent_requests' AND next_run_at <= NOW()) THEN
    PERFORM auto_accept_rent_requests_job();
    
    UPDATE scheduled_job_log 
    SET last_run_at = NOW(), next_run_at = NOW() + INTERVAL '1 day'
    WHERE job_name = 'auto_accept_rent_requests';
  END IF;
  
  -- Rent payment reminder
  IF EXISTS (SELECT 1 FROM scheduled_job_log WHERE job_name = 'rent_payment_reminder' AND next_run_at <= NOW()) THEN
    PERFORM rent_payment_reminder_job();
    
    UPDATE scheduled_job_log 
    SET last_run_at = NOW(), next_run_at = NOW() + INTERVAL '1 day'
    WHERE job_name = 'rent_payment_reminder';
  END IF;
  
  -- Contract expiration notification
  IF EXISTS (SELECT 1 FROM scheduled_job_log WHERE job_name = 'contract_expiration_notification' AND next_run_at <= NOW()) THEN
    PERFORM contract_expiration_notification_job();
    
    UPDATE scheduled_job_log 
    SET last_run_at = NOW(), next_run_at = NOW() + INTERVAL '1 day'
    WHERE job_name = 'contract_expiration_notification';
  END IF;
  
  -- Maintenance follow up
  IF EXISTS (SELECT 1 FROM scheduled_job_log WHERE job_name = 'maintenance_follow_up' AND next_run_at <= NOW()) THEN
    PERFORM maintenance_follow_up_job();
    
    UPDATE scheduled_job_log 
    SET last_run_at = NOW(), next_run_at = NOW() + INTERVAL '1 day'
    WHERE job_name = 'maintenance_follow_up';
  END IF;
  
  -- Update days listed
  IF EXISTS (SELECT 1 FROM scheduled_job_log WHERE job_name = 'update_days_listed' AND next_run_at <= NOW()) THEN
    PERFORM update_days_listed_job();
    
    UPDATE scheduled_job_log 
    SET last_run_at = NOW(), next_run_at = NOW() + INTERVAL '1 day'
    WHERE job_name = 'update_days_listed';
  END IF;
  
  -- Contract auto renewal
  IF EXISTS (SELECT 1 FROM scheduled_job_log WHERE job_name = 'contract_auto_renewal' AND next_run_at <= NOW()) THEN
    PERFORM contract_auto_renewal_job();
    
    UPDATE scheduled_job_log 
    SET last_run_at = NOW(), next_run_at = NOW() + INTERVAL '1 day'
    WHERE job_name = 'contract_auto_renewal';
  END IF;
END;
$$;

-- This function can be called by an external scheduler or REST hook
-- Such as a daily cron job from a cloud service that calls an endpoint that triggers this function 