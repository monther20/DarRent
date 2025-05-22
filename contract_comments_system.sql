-- DarRent - Contract Comments System
-- This file implements the database schema, triggers, and API functions for the contract comments system

-- ==========================================
-- Contract Comments Database Schema
-- ==========================================

-- Contract Comments Table
CREATE TABLE IF NOT EXISTS contract_comments (
  id TEXT PRIMARY KEY,
  contract_id TEXT REFERENCES rental_contracts(id) ON DELETE CASCADE,
  user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  comment_text_en TEXT,
  comment_text_ar TEXT,
  image_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  parent_comment_id TEXT REFERENCES contract_comments(id) ON DELETE SET NULL, -- for threaded comments
  is_issue BOOLEAN DEFAULT FALSE,                           -- flag to mark comments as issues requiring attention
  issue_resolved BOOLEAN DEFAULT FALSE,                     -- flag to mark issues as resolved
  issue_resolved_by TEXT REFERENCES users(id) ON DELETE SET NULL, -- who resolved the issue
  issue_resolved_at TIMESTAMP,                              -- when the issue was resolved
  issue_priority TEXT DEFAULT 'normal',                     -- 'low', 'normal', 'high', 'urgent'
  issue_category TEXT                                       -- category of the issue (e.g., 'maintenance', 'payment', 'noise', etc.)
);

-- Enhance Rental Contracts table with contract comments thread
ALTER TABLE rental_contracts
ADD COLUMN IF NOT EXISTS comment_thread_id TEXT;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_contract_comments_contract_id ON contract_comments(contract_id);
CREATE INDEX IF NOT EXISTS idx_contract_comments_user_id ON contract_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_contract_comments_parent_id ON contract_comments(parent_comment_id);
CREATE INDEX IF NOT EXISTS idx_contract_comments_is_issue ON contract_comments(is_issue);
CREATE INDEX IF NOT EXISTS idx_contract_comments_issue_resolved ON contract_comments(issue_resolved) WHERE is_issue = TRUE;

-- ==========================================
-- Contract Comments API Functions
-- ==========================================

-- Add comment to contract
CREATE OR REPLACE FUNCTION add_contract_comment(
  p_contract_id TEXT,
  p_user_id TEXT,
  p_comment_text_en TEXT,
  p_comment_text_ar TEXT DEFAULT NULL,
  p_image_url TEXT DEFAULT NULL,
  p_parent_comment_id TEXT DEFAULT NULL,
  p_is_issue BOOLEAN DEFAULT FALSE,
  p_issue_priority TEXT DEFAULT 'normal',
  p_issue_category TEXT DEFAULT NULL
) RETURNS TEXT LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_comment_id TEXT;
  v_property_id TEXT;
  v_property_title TEXT;
  v_landlord_id TEXT;
  v_landlord_user_id TEXT;
  v_renter_id TEXT;
  v_renter_user_id TEXT;
  v_commenter_name TEXT;
  v_other_user_id TEXT;
BEGIN
  -- Check if contract exists
  SELECT 
    rc.property_id,
    p.title_en,
    l.id,
    lu.id,
    rc.renter_id,
    ru.id
  INTO 
    v_property_id,
    v_property_title,
    v_landlord_id,
    v_landlord_user_id,
    v_renter_id,
    v_renter_user_id
  FROM rental_contracts rc
  JOIN properties p ON rc.property_id = p.id
  JOIN landlords l ON p.owner_id = l.id
  JOIN users lu ON l.user_id = lu.id
  JOIN renters r ON rc.renter_id = r.id
  JOIN users ru ON r.user_id = ru.id
  WHERE rc.id = p_contract_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Contract not found';
  END IF;
  
  -- Check if user is either landlord or renter for this contract
  IF v_landlord_user_id != p_user_id AND v_renter_user_id != p_user_id THEN
    RAISE EXCEPTION 'Only landlord or renter can comment on this contract';
  END IF;
  
  -- Get commenter name
  SELECT full_name_en INTO v_commenter_name
  FROM users
  WHERE id = p_user_id;
  
  -- Set other user ID for notification
  IF p_user_id = v_landlord_user_id THEN
    v_other_user_id := v_renter_user_id;
  ELSE
    v_other_user_id := v_landlord_user_id;
  END IF;
  
  -- Generate a new ID
  v_comment_id := gen_random_uuid()::TEXT;
  
  -- Insert comment
  INSERT INTO contract_comments (
    id,
    contract_id,
    user_id,
    comment_text_en,
    comment_text_ar,
    image_url,
    created_at,
    updated_at,
    parent_comment_id,
    is_issue,
    issue_priority,
    issue_category
  ) VALUES (
    v_comment_id,
    p_contract_id,
    p_user_id,
    p_comment_text_en,
    p_comment_text_ar,
    p_image_url,
    NOW(),
    NOW(),
    p_parent_comment_id,
    p_is_issue,
    p_issue_priority,
    p_issue_category
  );
  
  -- Create notification for other party
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
      v_other_user_id,
      CASE 
        WHEN p_is_issue THEN 'New Contract Issue'
        ELSE 'New Contract Comment'
      END,
      CASE
        WHEN p_is_issue THEN v_commenter_name || ' reported an issue for "' || v_property_title || '"'
        ELSE v_commenter_name || ' commented on contract for "' || v_property_title || '"'
      END,
      CASE
        WHEN p_is_issue THEN 'contract_issue'
        ELSE 'contract_comment'
      END,
      v_comment_id,
      FALSE
    );
  END IF;
  
  RETURN v_comment_id;
END;
$$;

-- Get contract comments
CREATE OR REPLACE FUNCTION get_contract_comments(
  p_contract_id TEXT,
  p_include_resolved BOOLEAN DEFAULT TRUE,
  p_issues_only BOOLEAN DEFAULT FALSE,
  p_limit INTEGER DEFAULT 100,
  p_offset INTEGER DEFAULT 0
) RETURNS TABLE (
  id TEXT,
  user_id TEXT,
  user_name TEXT,
  user_role TEXT,
  user_avatar TEXT,
  comment_text_en TEXT,
  comment_text_ar TEXT,
  image_url TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  parent_comment_id TEXT,
  reply_count BIGINT,
  is_issue BOOLEAN,
  issue_resolved BOOLEAN,
  issue_priority TEXT,
  issue_category TEXT,
  resolver_id TEXT,
  resolver_name TEXT,
  resolved_at TIMESTAMP
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cc.id,
    cc.user_id,
    u.full_name_en as user_name,
    CASE 
      WHEN l.id IS NOT NULL THEN 'landlord'::TEXT
      WHEN r.id IS NOT NULL THEN 'renter'::TEXT
      ELSE 'other'::TEXT
    END as user_role,
    u.profile_picture as user_avatar,
    cc.comment_text_en,
    cc.comment_text_ar,
    cc.image_url,
    cc.created_at,
    cc.updated_at,
    cc.parent_comment_id,
    (
      SELECT COUNT(*) 
      FROM contract_comments cc2
      WHERE cc2.parent_comment_id = cc.id
    ) as reply_count,
    cc.is_issue,
    cc.issue_resolved,
    cc.issue_priority,
    cc.issue_category,
    cc.issue_resolved_by,
    ru.full_name_en as resolver_name,
    cc.issue_resolved_at
  FROM contract_comments cc
  JOIN users u ON cc.user_id = u.id
  LEFT JOIN landlords l ON u.id = l.user_id
  LEFT JOIN renters r ON u.id = r.user_id
  LEFT JOIN users ru ON cc.issue_resolved_by = ru.id
  WHERE 
    cc.contract_id = p_contract_id
    AND (p_include_resolved OR NOT cc.issue_resolved)
    AND (NOT p_issues_only OR cc.is_issue)
  ORDER BY 
    -- Top-level comments first, then replies
    COALESCE(cc.parent_comment_id, cc.id),
    CASE WHEN cc.parent_comment_id IS NULL THEN 0 ELSE 1 END,
    -- For issues, sort by priority and whether resolved
    CASE 
      WHEN cc.is_issue AND NOT cc.issue_resolved AND cc.issue_priority = 'urgent' THEN 0
      WHEN cc.is_issue AND NOT cc.issue_resolved AND cc.issue_priority = 'high' THEN 1
      WHEN cc.is_issue AND NOT cc.issue_resolved AND cc.issue_priority = 'normal' THEN 2
      WHEN cc.is_issue AND NOT cc.issue_resolved AND cc.issue_priority = 'low' THEN 3
      WHEN cc.is_issue AND cc.issue_resolved THEN 4
      ELSE 5
    END,
    cc.created_at ASC
  LIMIT p_limit OFFSET p_offset;
END;
$$;

-- Update contract comment
CREATE OR REPLACE FUNCTION update_contract_comment(
  p_comment_id TEXT,
  p_user_id TEXT,
  p_comment_text_en TEXT DEFAULT NULL,
  p_comment_text_ar TEXT DEFAULT NULL,
  p_is_issue BOOLEAN DEFAULT NULL,
  p_issue_priority TEXT DEFAULT NULL,
  p_issue_category TEXT DEFAULT NULL
) RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  -- Check if user is the comment owner
  IF NOT EXISTS (
    SELECT 1 FROM contract_comments
    WHERE id = p_comment_id AND user_id = p_user_id
  ) THEN
    RAISE EXCEPTION 'Only the comment owner can update this comment';
  END IF;
  
  -- Update comment
  UPDATE contract_comments SET
    comment_text_en = COALESCE(p_comment_text_en, comment_text_en),
    comment_text_ar = COALESCE(p_comment_text_ar, comment_text_ar),
    is_issue = COALESCE(p_is_issue, is_issue),
    issue_priority = COALESCE(p_issue_priority, issue_priority),
    issue_category = COALESCE(p_issue_category, issue_category),
    updated_at = NOW()
  WHERE id = p_comment_id;
  
  RETURN FOUND;
END;
$$;

-- Delete contract comment
CREATE OR REPLACE FUNCTION delete_contract_comment(
  p_comment_id TEXT,
  p_user_id TEXT
) RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_has_replies BOOLEAN;
BEGIN
  -- Check if user is the comment owner
  IF NOT EXISTS (
    SELECT 1 FROM contract_comments
    WHERE id = p_comment_id AND user_id = p_user_id
  ) THEN
    RAISE EXCEPTION 'Only the comment owner can delete this comment';
  END IF;
  
  -- Check if comment has replies
  SELECT EXISTS (
    SELECT 1 FROM contract_comments
    WHERE parent_comment_id = p_comment_id
  ) INTO v_has_replies;
  
  IF v_has_replies THEN
    -- If comment has replies, just blank out the text but keep the comment
    UPDATE contract_comments SET
      comment_text_en = '[Comment deleted]',
      comment_text_ar = '[تم حذف التعليق]',
      image_url = NULL,
      updated_at = NOW()
    WHERE id = p_comment_id;
  ELSE
    -- If no replies, delete the comment
    DELETE FROM contract_comments
    WHERE id = p_comment_id;
  END IF;
  
  RETURN FOUND;
END;
$$;

-- Mark contract issue as resolved
CREATE OR REPLACE FUNCTION mark_contract_issue_resolved(
  p_comment_id TEXT,
  p_user_id TEXT,
  p_resolution_text_en TEXT,
  p_resolution_text_ar TEXT DEFAULT NULL
) RETURNS TEXT LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_contract_id TEXT;
  v_property_id TEXT;
  v_property_title TEXT;
  v_comment_user_id TEXT;
  v_resolution_id TEXT;
  v_other_user_id TEXT;
  v_resolver_name TEXT;
BEGIN
  -- Get contract and user info
  SELECT 
    cc.contract_id,
    rc.property_id,
    p.title_en,
    cc.user_id
  INTO 
    v_contract_id,
    v_property_id,
    v_property_title,
    v_comment_user_id
  FROM contract_comments cc
  JOIN rental_contracts rc ON cc.contract_id = rc.id
  JOIN properties p ON rc.property_id = p.id
  WHERE cc.id = p_comment_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Comment not found';
  END IF;
  
  -- Check that this is an issue
  IF NOT EXISTS (
    SELECT 1 FROM contract_comments
    WHERE id = p_comment_id AND is_issue = TRUE
  ) THEN
    RAISE EXCEPTION 'This comment is not marked as an issue';
  END IF;
  
  -- Get resolver name
  SELECT full_name_en INTO v_resolver_name
  FROM users
  WHERE id = p_user_id;
  
  -- Generate new ID for resolution comment
  v_resolution_id := gen_random_uuid()::TEXT;
  
  -- Add resolution as a reply to the original issue
  INSERT INTO contract_comments (
    id,
    contract_id,
    user_id,
    comment_text_en,
    comment_text_ar,
    created_at,
    updated_at,
    parent_comment_id
  ) VALUES (
    v_resolution_id,
    v_contract_id,
    p_user_id,
    p_resolution_text_en,
    p_resolution_text_ar,
    NOW(),
    NOW(),
    p_comment_id
  );
  
  -- Mark the original issue as resolved
  UPDATE contract_comments SET
    issue_resolved = TRUE,
    issue_resolved_by = p_user_id,
    issue_resolved_at = NOW()
  WHERE id = p_comment_id;
  
  -- Create notification for issue reporter
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
      v_comment_user_id,
      'Issue Resolved',
      v_resolver_name || ' has resolved your issue on "' || v_property_title || '".',
      'issue_resolution',
      v_resolution_id,
      FALSE
    );
  END IF;
  
  RETURN v_resolution_id;
END;
$$;

-- Get contract issues (summary view for dashboard)
CREATE OR REPLACE FUNCTION get_contract_issues_summary(
  p_contract_id TEXT
) RETURNS TABLE (
  total_issue_count BIGINT,
  open_issue_count BIGINT,
  resolved_issue_count BIGINT,
  urgent_issue_count BIGINT,
  recent_issues JSON
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  WITH issue_counts AS (
    SELECT 
      COUNT(*) FILTER (WHERE is_issue = TRUE) as total,
      COUNT(*) FILTER (WHERE is_issue = TRUE AND NOT issue_resolved) as open_count,
      COUNT(*) FILTER (WHERE is_issue = TRUE AND issue_resolved) as resolved_count,
      COUNT(*) FILTER (WHERE is_issue = TRUE AND NOT issue_resolved AND issue_priority = 'urgent') as urgent_count
    FROM contract_comments
    WHERE contract_id = p_contract_id
  ),
  recent AS (
    SELECT 
      json_agg(
        json_build_object(
          'id', cc.id,
          'user_name', u.full_name_en,
          'comment_text', LEFT(cc.comment_text_en, 50) || CASE WHEN LENGTH(cc.comment_text_en) > 50 THEN '...' ELSE '' END,
          'priority', cc.issue_priority,
          'category', cc.issue_category,
          'resolved', cc.issue_resolved,
          'has_image', cc.image_url IS NOT NULL,
          'created_at', cc.created_at
        )
      ) as recent_issues
    FROM contract_comments cc
    JOIN users u ON cc.user_id = u.id
    WHERE cc.contract_id = p_contract_id 
      AND cc.is_issue = TRUE 
      AND cc.parent_comment_id IS NULL
    ORDER BY 
      CASE 
        WHEN NOT cc.issue_resolved AND cc.issue_priority = 'urgent' THEN 0
        WHEN NOT cc.issue_resolved AND cc.issue_priority = 'high' THEN 1
        WHEN NOT cc.issue_resolved AND cc.issue_priority = 'normal' THEN 2
        WHEN NOT cc.issue_resolved AND cc.issue_priority = 'low' THEN 3
        ELSE 4
      END,
      cc.created_at DESC
    LIMIT 5
  )
  SELECT 
    ic.total,
    ic.open_count,
    ic.resolved_count,
    ic.urgent_count,
    COALESCE(r.recent_issues, '[]'::JSON)
  FROM issue_counts ic
  CROSS JOIN recent r;
END;
$$;

-- Get all contracts with issue counts (for admin/dashboard views)
CREATE OR REPLACE FUNCTION get_contracts_with_issue_summary(
  p_landlord_id TEXT DEFAULT NULL,
  p_renter_id TEXT DEFAULT NULL,
  p_status TEXT DEFAULT NULL
) RETURNS TABLE (
  contract_id TEXT,
  property_id TEXT,
  property_title TEXT,
  landlord_id TEXT,
  landlord_name TEXT,
  renter_id TEXT,
  renter_name TEXT,
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  status TEXT,
  total_issues BIGINT,
  open_issues BIGINT,
  urgent_issues BIGINT
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT 
    rc.id as contract_id,
    p.id as property_id,
    p.title_en as property_title,
    l.id as landlord_id,
    lu.full_name_en as landlord_name,
    r.id as renter_id,
    ru.full_name_en as renter_name,
    rc.start_date,
    rc.end_date,
    rc.status,
    COUNT(cc.id) FILTER (WHERE cc.is_issue = TRUE) as total_issues,
    COUNT(cc.id) FILTER (WHERE cc.is_issue = TRUE AND NOT cc.issue_resolved) as open_issues,
    COUNT(cc.id) FILTER (WHERE cc.is_issue = TRUE AND NOT cc.issue_resolved AND cc.issue_priority = 'urgent') as urgent_issues
  FROM rental_contracts rc
  JOIN properties p ON rc.property_id = p.id
  JOIN landlords l ON p.owner_id = l.id
  JOIN users lu ON l.user_id = lu.id
  JOIN renters r ON rc.renter_id = r.id
  JOIN users ru ON r.user_id = ru.id
  LEFT JOIN contract_comments cc ON rc.id = cc.contract_id AND cc.parent_comment_id IS NULL
  WHERE 
    (p_landlord_id IS NULL OR l.id = p_landlord_id)
    AND (p_renter_id IS NULL OR r.id = p_renter_id)
    AND (p_status IS NULL OR rc.status = p_status)
  GROUP BY rc.id, p.id, p.title_en, l.id, lu.full_name_en, r.id, ru.full_name_en, rc.start_date, rc.end_date, rc.status
  ORDER BY 
    CASE 
      WHEN COUNT(cc.id) FILTER (WHERE cc.is_issue = TRUE AND NOT cc.issue_resolved AND cc.issue_priority = 'urgent') > 0 THEN 0
      WHEN COUNT(cc.id) FILTER (WHERE cc.is_issue = TRUE AND NOT cc.issue_resolved) > 0 THEN 1
      ELSE 2
    END,
    rc.updated_at DESC,
    rc.created_at DESC;
END;
$$;

-- ==========================================
-- Contract Comments Triggers
-- ==========================================

-- Trigger to update contract's updated_at field when comments are added
CREATE OR REPLACE FUNCTION contract_comment_added_trigger()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  -- Update the contract's updated_at timestamp
  UPDATE rental_contracts
  SET updated_at = NOW()
  WHERE id = NEW.contract_id;
  
  RETURN NEW;
END;
$$;

-- Create trigger for contract_comment_added_trigger
DROP TRIGGER IF EXISTS contract_comment_added ON contract_comments;
CREATE TRIGGER contract_comment_added
AFTER INSERT ON contract_comments
FOR EACH ROW
EXECUTE FUNCTION contract_comment_added_trigger();

-- Trigger for sending notifications when issues are added
CREATE OR REPLACE FUNCTION contract_issue_notification_trigger()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_contract_id TEXT;
  v_property_id TEXT;
  v_property_title TEXT;
  v_landlord_user_id TEXT;
  v_renter_user_id TEXT;
  v_commenter_name TEXT;
  v_notify_user_id TEXT;
BEGIN
  -- Only fire for new issues
  IF TG_OP = 'INSERT' AND NEW.is_issue = TRUE THEN
    -- Get contract and user info
    SELECT 
      rc.id,
      p.id,
      p.title_en,
      lu.id,
      ru.id,
      u.full_name_en
    INTO 
      v_contract_id,
      v_property_id,
      v_property_title,
      v_landlord_user_id,
      v_renter_user_id,
      v_commenter_name
    FROM rental_contracts rc
    JOIN properties p ON rc.property_id = p.id
    JOIN landlords l ON p.owner_id = l.id
    JOIN users lu ON l.user_id = lu.id
    JOIN renters r ON rc.renter_id = r.id
    JOIN users ru ON r.user_id = ru.id
    JOIN users u ON NEW.user_id = u.id
    WHERE rc.id = NEW.contract_id;
    
    -- Determine who to notify (notify other party)
    IF NEW.user_id = v_landlord_user_id THEN
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
        CASE 
          WHEN NEW.issue_priority = 'urgent' THEN 'URGENT: New Issue Reported'
          WHEN NEW.issue_priority = 'high' THEN 'High Priority: New Issue Reported'
          ELSE 'New Issue Reported'
        END,
        v_commenter_name || ' reported a ' || NEW.issue_priority || ' priority issue for "' || v_property_title || '"' || 
        CASE WHEN NEW.issue_category IS NOT NULL THEN ' (' || NEW.issue_category || ')' ELSE '' END,
        'contract_issue',
        NEW.id,
        FALSE
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for contract_issue_notification_trigger
DROP TRIGGER IF EXISTS contract_issue_notification ON contract_comments;
CREATE TRIGGER contract_issue_notification
AFTER INSERT ON contract_comments
FOR EACH ROW
EXECUTE FUNCTION contract_issue_notification_trigger();

-- Trigger for issue resolution status updates
CREATE OR REPLACE FUNCTION issue_resolution_trigger()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  -- Only fire when issue_resolved changes from FALSE to TRUE
  IF NEW.issue_resolved = TRUE AND (OLD.issue_resolved = FALSE OR OLD.issue_resolved IS NULL) THEN
    -- Update issue_resolved_at if not already set
    IF NEW.issue_resolved_at IS NULL THEN
      NEW.issue_resolved_at := NOW();
    END IF;
    
    -- Ensure issue_resolved_by is set if not already
    IF NEW.issue_resolved_by IS NULL THEN
      -- This assumes the update is done by a user directly
      -- In practice, you would need to pass the user_id doing the update
      RAISE EXCEPTION 'Issue resolver must be specified';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for issue_resolution_trigger
DROP TRIGGER IF EXISTS issue_resolution ON contract_comments;
CREATE TRIGGER issue_resolution
BEFORE UPDATE ON contract_comments
FOR EACH ROW
WHEN (NEW.is_issue = TRUE)
EXECUTE FUNCTION issue_resolution_trigger();

-- ==========================================
-- Sample Data for Contract Comments
-- ==========================================

-- Sample contract comments (can be commented out in production)
/*
-- Add some sample comments to contract1
INSERT INTO contract_comments (
  id, contract_id, user_id, comment_text_en, comment_text_ar, created_at, updated_at
) VALUES
('cc1', 'contract1', 'l1', 'Welcome to your new home! Please let me know if you have any questions.', 'مرحبًا بك في منزلك الجديد! يرجى إعلامي إذا كان لديك أي أسئلة.', NOW() - INTERVAL '30 days', NOW() - INTERVAL '30 days'),
('cc2', 'contract1', 'r1', 'Thank you! I am very happy with the apartment.', 'شكرًا لك! أنا سعيد جدًا بالشقة.', NOW() - INTERVAL '29 days', NOW() - INTERVAL '29 days');

-- Add a maintenance issue
INSERT INTO contract_comments (
  id, contract_id, user_id, comment_text_en, comment_text_ar, created_at, updated_at, is_issue, issue_priority, issue_category
) VALUES
('cc3', 'contract1', 'r1', 'The kitchen sink is leaking. Could you please send someone to fix it?', 'حوض المطبخ يسرب. هل يمكنك إرسال شخص ما لإصلاحه؟', NOW() - INTERVAL '20 days', NOW() - INTERVAL '20 days', TRUE, 'high', 'plumbing');

-- Add a response and resolution
INSERT INTO contract_comments (
  id, contract_id, user_id, comment_text_en, comment_text_ar, created_at, updated_at, parent_comment_id
) VALUES
('cc4', 'contract1', 'l1', 'I will send a plumber tomorrow between 10am and 12pm.', 'سأرسل سباكًا غدًا بين الساعة 10 صباحًا و 12 ظهرًا.', NOW() - INTERVAL '19 days', NOW() - INTERVAL '19 days', 'cc3');

-- Mark the issue as resolved
UPDATE contract_comments 
SET 
  issue_resolved = TRUE,
  issue_resolved_by = 'l1',
  issue_resolved_at = NOW() - INTERVAL '18 days'
WHERE id = 'cc3';

-- Add a response confirming the fix
INSERT INTO contract_comments (
  id, contract_id, user_id, comment_text_en, comment_text_ar, created_at, updated_at, parent_comment_id
) VALUES
('cc5', 'contract1', 'r1', 'The plumber came and fixed the sink. Thank you!', 'جاء السباك وأصلح الحوض. شكرًا لك!', NOW() - INTERVAL '18 days', NOW() - INTERVAL '18 days', 'cc3');
*/ 