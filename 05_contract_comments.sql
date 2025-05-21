-- DarRent - Contract Comments Management Functions
-- This file contains API functions for managing contract comments

-- ==========================================
-- Contract Comments Management Functions
-- ==========================================

-- Add comment to contract
CREATE OR REPLACE FUNCTION add_contract_comment(
  p_contract_id TEXT,
  p_user_id TEXT,
  p_comment_text_en TEXT,
  p_comment_text_ar TEXT DEFAULT NULL,
  p_image_url TEXT DEFAULT NULL,
  p_parent_comment_id TEXT DEFAULT NULL
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
    parent_comment_id
  ) VALUES (
    v_comment_id,
    p_contract_id,
    p_user_id,
    p_comment_text_en,
    p_comment_text_ar,
    p_image_url,
    NOW(),
    NOW(),
    p_parent_comment_id
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
      'New Contract Comment',
      v_commenter_name || ' commented on contract for "' || v_property_title || '"',
      'contract_comment',
      v_comment_id,
      FALSE
    );
  END IF;
  
  RETURN v_comment_id;
END;
$$;

-- Get contract comments
CREATE OR REPLACE FUNCTION get_contract_comments(
  p_contract_id TEXT
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
  reply_count BIGINT
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
    ) as reply_count
  FROM contract_comments cc
  JOIN users u ON cc.user_id = u.id
  LEFT JOIN landlords l ON u.id = l.user_id
  LEFT JOIN renters r ON u.id = r.user_id
  WHERE 
    cc.contract_id = p_contract_id
  ORDER BY 
    COALESCE(cc.parent_comment_id, cc.id),
    CASE WHEN cc.parent_comment_id IS NULL THEN 0 ELSE 1 END,
    cc.created_at ASC;
END;
$$;

-- Update contract comment
CREATE OR REPLACE FUNCTION update_contract_comment(
  p_comment_id TEXT,
  p_user_id TEXT,
  p_comment_text_en TEXT DEFAULT NULL,
  p_comment_text_ar TEXT DEFAULT NULL
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

-- Get contract issues (summary view for dashboard)
CREATE OR REPLACE FUNCTION get_contract_issues_summary(
  p_contract_id TEXT
) RETURNS TABLE (
  issue_count BIGINT,
  recent_issues JSON,
  unresolved_count BIGINT
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as issue_count,
    (
      SELECT json_agg(
        json_build_object(
          'id', cc.id,
          'user_name', u.full_name_en,
          'comment_text', LEFT(cc.comment_text_en, 50) || CASE WHEN LENGTH(cc.comment_text_en) > 50 THEN '...' ELSE '' END,
          'has_image', cc.image_url IS NOT NULL,
          'created_at', cc.created_at
        )
      )
      FROM contract_comments cc
      JOIN users u ON cc.user_id = u.id
      WHERE cc.contract_id = p_contract_id AND cc.parent_comment_id IS NULL
      ORDER BY cc.created_at DESC
      LIMIT 3
    ) as recent_issues,
    COUNT(*) FILTER (WHERE cc.parent_comment_id IS NULL AND NOT EXISTS (
      SELECT 1 FROM contract_comments cc2
      WHERE cc2.parent_comment_id = cc.id
    )) as unresolved_count
  FROM contract_comments cc
  WHERE cc.contract_id = p_contract_id;
END;
$$;

-- Mark issue as resolved
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
  
  -- Get resolver name
  SELECT full_name_en INTO v_resolver_name
  FROM users
  WHERE id = p_user_id;
  
  -- Generate new ID for resolution comment
  v_resolution_id := gen_random_uuid()::TEXT;
  
  -- Add resolution as a reply to the original comment
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
  
  -- Create notification for original commenter
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