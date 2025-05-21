-- DarRent - Property Video Management Functions
-- This file contains API functions for managing property videos

-- ==========================================
-- Property Video Management Functions
-- ==========================================

-- Add video to property
CREATE OR REPLACE FUNCTION add_property_video(
  p_property_id TEXT,
  p_video_url TEXT,
  p_description_en TEXT,
  p_description_ar TEXT DEFAULT NULL,
  p_thumbnail_url TEXT DEFAULT NULL,
  p_is_main_video BOOLEAN DEFAULT FALSE,
  p_duration INTEGER DEFAULT NULL
) RETURNS TEXT LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_video_id TEXT;
  v_landlord_id TEXT;
  v_property_owner_id TEXT;
  v_user_id TEXT;
BEGIN
  -- Check if user is the property owner
  SELECT owner_id INTO v_property_owner_id FROM properties WHERE id = p_property_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Property not found';
  END IF;
  
  -- Generate a new ID
  v_video_id := gen_random_uuid()::TEXT;
  
  -- If this is the main video, unset any existing main videos
  IF p_is_main_video THEN
    UPDATE property_videos 
    SET is_main_video = FALSE 
    WHERE property_id = p_property_id AND is_main_video = TRUE;
  END IF;
  
  -- Insert video
  INSERT INTO property_videos (
    id,
    property_id,
    video_url,
    thumbnail_url,
    description_en,
    description_ar,
    is_main_video,
    video_duration
  ) VALUES (
    v_video_id,
    p_property_id,
    p_video_url,
    p_thumbnail_url,
    p_description_en,
    p_description_ar,
    p_is_main_video,
    p_duration
  );
  
  -- Check if property should be marked as having a video
  IF p_is_main_video THEN
    UPDATE properties 
    SET requires_video = FALSE 
    WHERE id = p_property_id;
  END IF;
  
  RETURN v_video_id;
END;
$$;

-- Get property videos
CREATE OR REPLACE FUNCTION get_property_videos(
  p_property_id TEXT
) RETURNS TABLE (
  id TEXT,
  video_url TEXT,
  thumbnail_url TEXT,
  description_en TEXT,
  description_ar TEXT,
  upload_date TIMESTAMP,
  is_main_video BOOLEAN,
  verified BOOLEAN,
  verification_date TIMESTAMP,
  verified_by TEXT,
  video_duration INTEGER
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pv.id,
    pv.video_url,
    pv.thumbnail_url,
    pv.description_en,
    pv.description_ar,
    pv.upload_date,
    pv.is_main_video,
    pv.verified,
    pv.verification_date,
    pv.verified_by,
    pv.video_duration
  FROM property_videos pv
  WHERE pv.property_id = p_property_id
  ORDER BY pv.is_main_video DESC, pv.upload_date DESC;
END;
$$;

-- Verify property video (admin function)
CREATE OR REPLACE FUNCTION verify_property_video(
  p_video_id TEXT,
  p_verified BOOLEAN,
  p_verified_by TEXT
) RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_property_id TEXT;
BEGIN
  -- Get the property ID
  SELECT property_id INTO v_property_id
  FROM property_videos
  WHERE id = p_video_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Video not found';
  END IF;
  
  -- Update video verification status
  UPDATE property_videos SET
    verified = p_verified,
    verification_date = NOW(),
    verified_by = p_verified_by
  WHERE id = p_video_id;
  
  -- If this is the main video and it's verified, mark property as verified
  IF p_verified AND EXISTS (
    SELECT 1 FROM property_videos
    WHERE id = p_video_id AND is_main_video = TRUE
  ) THEN
    UPDATE properties SET
      verified = TRUE
    WHERE id = v_property_id;
  END IF;
  
  RETURN FOUND;
END;
$$;

-- Delete property video
CREATE OR REPLACE FUNCTION delete_property_video(
  p_video_id TEXT
) RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_property_id TEXT;
  v_is_main_video BOOLEAN;
BEGIN
  -- Get property ID and check if it's the main video
  SELECT 
    property_id, 
    is_main_video 
  INTO 
    v_property_id, 
    v_is_main_video
  FROM property_videos
  WHERE id = p_video_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Video not found';
  END IF;
  
  -- Delete the video
  DELETE FROM property_videos
  WHERE id = p_video_id;
  
  -- If this was the main video, check if there are other videos to promote to main
  IF v_is_main_video THEN
    -- Select the newest video and make it the main video
    UPDATE property_videos SET
      is_main_video = TRUE
    WHERE id = (
      SELECT id
      FROM property_videos
      WHERE property_id = v_property_id
      ORDER BY upload_date DESC
      LIMIT 1
    );
    
    -- If no videos are left, mark the property as needing a video
    IF NOT FOUND THEN
      UPDATE properties SET
        requires_video = TRUE,
        verified = FALSE
      WHERE id = v_property_id;
    END IF;
  END IF;
  
  RETURN FOUND;
END;
$$;

-- Set main property video
CREATE OR REPLACE FUNCTION set_main_property_video(
  p_video_id TEXT
) RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_property_id TEXT;
BEGIN
  -- Get the property ID
  SELECT property_id INTO v_property_id
  FROM property_videos
  WHERE id = p_video_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Video not found';
  END IF;
  
  -- Unset any existing main videos
  UPDATE property_videos SET
    is_main_video = FALSE
  WHERE property_id = v_property_id
  AND is_main_video = TRUE;
  
  -- Set the new main video
  UPDATE property_videos SET
    is_main_video = TRUE
  WHERE id = p_video_id;
  
  -- Check if this video is verified, and update property status if needed
  UPDATE properties SET
    requires_video = FALSE,
    verified = EXISTS (
      SELECT 1 
      FROM property_videos 
      WHERE id = p_video_id 
      AND verified = TRUE
    )
  WHERE id = v_property_id;
  
  RETURN FOUND;
END;
$$; 