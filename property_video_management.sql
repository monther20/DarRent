-- DarRent Property Video Management System
-- This file implements the database schema, triggers, and API functions for managing property videos

-- ==========================================
-- Schema Definition
-- ==========================================

-- Create property videos table if it doesn't exist
CREATE TABLE IF NOT EXISTS property_videos (
  "id" text PRIMARY KEY,
  "property_id" text REFERENCES properties("id") ON DELETE CASCADE,
  "video_url" text NOT NULL,
  "thumbnail_url" text,
  "description_en" text,
  "description_ar" text,
  "upload_date" timestamp DEFAULT NOW(),
  "is_main_video" boolean DEFAULT FALSE,
  "verified" boolean DEFAULT FALSE,
  "verification_date" timestamp,
  "verified_by" text,
  "video_duration" integer -- in seconds
);

-- Add necessary columns to the properties table if they don't exist
DO $$ 
BEGIN
  -- Add requires_video column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='properties' AND column_name='requires_video') THEN
    ALTER TABLE properties ADD COLUMN requires_video BOOLEAN DEFAULT TRUE;
  END IF;
  
  -- Add verified column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='properties' AND column_name='verified') THEN
    ALTER TABLE properties ADD COLUMN verified BOOLEAN DEFAULT FALSE;
  END IF;
  
  -- Add viewing_availability column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='properties' AND column_name='viewing_availability') THEN
    ALTER TABLE properties ADD COLUMN viewing_availability JSONB; -- Store available times as JSON
  END IF;
END $$;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_property_videos_property_id ON property_videos(property_id);
CREATE INDEX IF NOT EXISTS idx_property_videos_verified ON property_videos(verified);

-- ==========================================
-- Property Video API Functions
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
    SET 
      requires_video = FALSE,
      status = CASE 
        WHEN status = 'available' THEN 'pending_verification'
        ELSE status
      END
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
      verified = TRUE,
      status = CASE
        WHEN status = 'pending_verification' THEN 'available'
        ELSE status
      END
    WHERE id = v_property_id;
    
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
        p_video_id,
        FALSE
      FROM properties p
      JOIN landlords l ON p.owner_id = l.id
      JOIN users u ON l.user_id = u.id
      WHERE p.id = v_property_id;
    END IF;
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
    ),
    status = CASE
      WHEN EXISTS (SELECT 1 FROM property_videos WHERE id = p_video_id AND verified = TRUE) 
         AND status = 'pending_verification' THEN 'available'
      WHEN NOT EXISTS (SELECT 1 FROM property_videos WHERE id = p_video_id AND verified = TRUE) 
         AND status = 'available' THEN 'pending_verification'
      ELSE status
    END
  WHERE id = v_property_id;
  
  RETURN FOUND;
END;
$$;

-- Get properties requiring video verification (admin function)
CREATE OR REPLACE FUNCTION get_properties_requiring_verification(
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0
) RETURNS TABLE (
  property_id TEXT,
  title TEXT,
  owner_id TEXT,
  owner_name TEXT,
  upload_date TIMESTAMP,
  video_id TEXT,
  video_url TEXT,
  thumbnail_url TEXT
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id as property_id,
    p.title_en as title,
    p.owner_id,
    u.full_name_en as owner_name,
    pv.upload_date,
    pv.id as video_id,
    pv.video_url,
    pv.thumbnail_url
  FROM properties p
  JOIN landlords l ON p.owner_id = l.id
  JOIN users u ON l.user_id = u.id
  JOIN property_videos pv ON p.id = pv.property_id
  WHERE 
    pv.is_main_video = TRUE 
    AND pv.verified = FALSE
    AND (p.status = 'pending_verification' OR p.requires_video = FALSE)
  ORDER BY pv.upload_date ASC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

-- Function to update property video details
CREATE OR REPLACE FUNCTION update_property_video(
  p_video_id TEXT,
  p_description_en TEXT DEFAULT NULL,
  p_description_ar TEXT DEFAULT NULL,
  p_thumbnail_url TEXT DEFAULT NULL
) RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE property_videos SET
    description_en = COALESCE(p_description_en, description_en),
    description_ar = COALESCE(p_description_ar, description_ar),
    thumbnail_url = COALESCE(p_thumbnail_url, thumbnail_url)
  WHERE id = p_video_id;
  
  RETURN FOUND;
END;
$$;

-- Function to check if a property has verified videos
CREATE OR REPLACE FUNCTION property_has_verified_videos(
  p_property_id TEXT
) RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_has_verified BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 
    FROM property_videos 
    WHERE property_id = p_property_id 
    AND verified = TRUE
    AND is_main_video = TRUE
  ) INTO v_has_verified;
  
  RETURN v_has_verified;
END;
$$;

-- ==========================================
-- Property Video Triggers
-- ==========================================

-- Property Video Verification Trigger
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
DROP TRIGGER IF EXISTS property_video_verification ON property_videos;
CREATE TRIGGER property_video_verification
AFTER INSERT OR UPDATE ON property_videos
FOR EACH ROW
EXECUTE FUNCTION property_video_verification_trigger();

-- Property Listing Status Check Trigger (prevents listing without video)
CREATE OR REPLACE FUNCTION property_listing_status_check_trigger()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  -- When property status is changed to 'available'
  IF NEW.status = 'available' AND OLD.status != 'available' THEN
    -- Check if property has a verified main video
    IF NOT EXISTS (
      SELECT 1 
      FROM property_videos 
      WHERE property_id = NEW.id 
      AND is_main_video = TRUE 
      AND verified = TRUE
    ) THEN
      -- If no verified main video, set status to pending_verification
      NEW.status := 'pending_verification';
      
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
          'Video Verification Required',
          'Your property "' || NEW.title_en || '" requires a verified video before it can be listed.',
          'property_status',
          NEW.id,
          FALSE
        FROM landlords l
        JOIN users u ON l.user_id = u.id
        WHERE l.id = NEW.owner_id;
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger on properties table
DROP TRIGGER IF EXISTS property_listing_status_check ON properties;
CREATE TRIGGER property_listing_status_check
BEFORE UPDATE ON properties
FOR EACH ROW
EXECUTE FUNCTION property_listing_status_check_trigger();

-- ==========================================
-- API function for Property Listing with Video Requirements
-- ==========================================

-- Enhanced add_property function that considers video requirements
CREATE OR REPLACE FUNCTION add_property_with_video_requirement(
  p_title_en TEXT,
  p_title_ar TEXT,
  p_description_en TEXT,
  p_description_ar TEXT,
  p_rent_amount DECIMAL,
  p_security_deposit DECIMAL,
  p_number_of_rooms INT,
  p_square_footage INT,
  p_property_type_en TEXT,
  p_property_type_ar TEXT,
  p_availability_date TIMESTAMP,
  p_owner_id TEXT,
  p_city_en TEXT,
  p_city_ar TEXT,
  p_area_en TEXT,
  p_area_ar TEXT,
  p_latitude DECIMAL,
  p_longitude DECIMAL,
  p_requires_video BOOLEAN DEFAULT TRUE,
  p_viewing_availability JSONB DEFAULT NULL
) RETURNS TEXT LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_property_id TEXT;
BEGIN
  -- Generate a new ID
  v_property_id := gen_random_uuid()::TEXT;
  
  -- Insert property
  INSERT INTO properties (
    id, 
    title_en,
    title_ar,
    description_en,
    description_ar,
    rent_amount,
    security_deposit,
    status,
    listing_date,
    number_of_rooms,
    square_footage,
    property_type_en,
    property_type_ar,
    availability_date,
    owner_id,
    city_en,
    city_ar,
    area_en,
    area_ar,
    latitude,
    longitude,
    views,
    inquiries,
    days_listed,
    requires_video,
    verified,
    viewing_availability
  ) VALUES (
    v_property_id,
    p_title_en,
    p_title_ar,
    p_description_en,
    p_description_ar,
    p_rent_amount,
    p_security_deposit,
    'pending_verification',
    NOW(),
    p_number_of_rooms,
    p_square_footage,
    p_property_type_en,
    p_property_type_ar,
    p_availability_date,
    p_owner_id,
    p_city_en,
    p_city_ar,
    p_area_en,
    p_area_ar,
    p_latitude,
    p_longitude,
    0,
    0,
    0,
    p_requires_video,
    FALSE,
    p_viewing_availability
  );
  
  RETURN v_property_id;
END;
$$; 