-- DarRent App - SQL API Functions
-- This file implements the database functions required for the API documented in API_FUNCTIONS.md

-- ==========================================
-- Authentication Functions
-- ==========================================

-- Login function
CREATE OR REPLACE FUNCTION login(
  p_email TEXT,
  p_password TEXT
) RETURNS TABLE (
  id TEXT,
  email TEXT,
  full_name_en TEXT,
  full_name_ar TEXT,
  phone TEXT,
  profile_picture TEXT,
  status TEXT,
  role TEXT
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id, 
    u.email, 
    u.full_name_en, 
    u.full_name_ar, 
    u.phone, 
    u.profile_picture, 
    u.status,
    CASE 
      WHEN l.id IS NOT NULL THEN 'landlord'
      WHEN r.id IS NOT NULL THEN 'renter'
      ELSE 'unknown'
    END as role
  FROM users u
  LEFT JOIN landlords l ON u.id = l.user_id
  LEFT JOIN renters r ON u.id = r.user_id
  WHERE u.email = p_email 
  AND u.password = p_password; -- In a real app, use proper password hashing
END;
$$;

-- Register function
CREATE OR REPLACE FUNCTION register(
  p_full_name TEXT,
  p_email TEXT,
  p_phone TEXT,
  p_password TEXT,
  p_role TEXT,
  p_city TEXT,
  p_country TEXT
) RETURNS TEXT LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_user_id TEXT;
BEGIN
  -- Generate a new ID
  v_user_id := gen_random_uuid()::TEXT;
  
  -- Insert user
  INSERT INTO users (
    id, 
    email, 
    password, 
    full_name_en, 
    phone, 
    status, 
    registration_date
  ) VALUES (
    v_user_id, 
    p_email, 
    p_password, -- In a real app, use proper password hashing
    p_full_name, 
    p_phone, 
    'active', 
    NOW()
  );
  
  -- Create landlord or renter record
  IF p_role = 'landlord' THEN
    INSERT INTO landlords (id, user_id, verification_status_en) 
    VALUES (gen_random_uuid()::TEXT, v_user_id, 'pending');
  ELSIF p_role = 'renter' THEN
    INSERT INTO renters (id, user_id, preferred_location_en) 
    VALUES (gen_random_uuid()::TEXT, v_user_id, p_city);
  END IF;
  
  RETURN v_user_id;
END;
$$;

-- Reset password function
CREATE OR REPLACE FUNCTION reset_password(
  p_email TEXT
) RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  -- Check if user exists
  IF EXISTS (SELECT 1 FROM users WHERE email = p_email) THEN
    -- In a real app, this would send an email and create a token
    RETURN TRUE;
  ELSE
    RETURN FALSE;
  END IF;
END;
$$;

-- Verify reset token
CREATE OR REPLACE FUNCTION verify_reset_token(
  p_token TEXT
) RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  -- In a real app, this would validate the token
  RETURN TRUE;
END;
$$;

-- Set new password
CREATE OR REPLACE FUNCTION set_new_password(
  p_token TEXT,
  p_new_password TEXT
) RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  -- In a real app, this would verify the token and update the password
  -- UPDATE users SET password = p_new_password WHERE id = (Get ID from token);
  RETURN TRUE;
END;
$$;

-- ==========================================
-- User Management Functions
-- ==========================================

-- Get user profile
CREATE OR REPLACE FUNCTION get_user_profile(
  p_user_id TEXT
) RETURNS TABLE (
  id TEXT,
  email TEXT,
  full_name_en TEXT,
  full_name_ar TEXT,
  phone TEXT,
  profile_picture TEXT,
  status TEXT,
  rating FLOAT,
  role TEXT,
  verification_status TEXT,
  preferred_location TEXT
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id, 
    u.email, 
    u.full_name_en, 
    u.full_name_ar, 
    u.phone, 
    u.profile_picture, 
    u.status,
    u.rating,
    CASE 
      WHEN l.id IS NOT NULL THEN 'landlord'::TEXT
      WHEN r.id IS NOT NULL THEN 'renter'::TEXT
      ELSE 'unknown'::TEXT
    END as role,
    COALESCE(l.verification_status_en, 'N/A')::TEXT as verification_status,
    COALESCE(r.preferred_location_en, 'N/A')::TEXT as preferred_location
  FROM users u
  LEFT JOIN landlords l ON u.id = l.user_id
  LEFT JOIN renters r ON u.id = r.user_id
  WHERE u.id = p_user_id;
END;
$$;

-- Update user profile
CREATE OR REPLACE FUNCTION update_user_profile(
  p_user_id TEXT,
  p_full_name_en TEXT DEFAULT NULL,
  p_full_name_ar TEXT DEFAULT NULL,
  p_phone TEXT DEFAULT NULL,
  p_profile_picture TEXT DEFAULT NULL
) RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE users SET
    full_name_en = COALESCE(p_full_name_en, full_name_en),
    full_name_ar = COALESCE(p_full_name_ar, full_name_ar),
    phone = COALESCE(p_phone, phone),
    profile_picture = COALESCE(p_profile_picture, profile_picture)
  WHERE id = p_user_id;
  
  RETURN FOUND;
END;
$$;

-- Change password
CREATE OR REPLACE FUNCTION change_password(
  p_user_id TEXT,
  p_current_password TEXT,
  p_new_password TEXT
) RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM users WHERE id = p_user_id AND password = p_current_password) THEN
    UPDATE users SET password = p_new_password WHERE id = p_user_id;
    RETURN TRUE;
  ELSE
    RETURN FALSE;
  END IF;
END;
$$;

-- ==========================================
-- Property Management Functions
-- ==========================================

-- Get properties with filters
CREATE OR REPLACE FUNCTION get_properties(
  p_location TEXT DEFAULT NULL,
  p_min_price DECIMAL DEFAULT NULL,
  p_max_price DECIMAL DEFAULT NULL,
  p_bedrooms INT DEFAULT NULL,
  p_bathrooms INT DEFAULT NULL,
  p_status TEXT DEFAULT NULL
) RETURNS SETOF properties LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT p.*
  FROM properties p
  WHERE 
    (p_location IS NULL OR 
     p.city_en ILIKE '%' || p_location || '%' OR 
     p.city_ar ILIKE '%' || p_location || '%' OR
     p.area_en ILIKE '%' || p_location || '%' OR
     p.area_ar ILIKE '%' || p_location || '%')
    AND (p_min_price IS NULL OR p.rent_amount >= p_min_price)
    AND (p_max_price IS NULL OR p.rent_amount <= p_max_price)
    AND (p_bedrooms IS NULL OR p.number_of_rooms >= p_bedrooms)
    AND (p_bathrooms IS NULL OR p.number_of_rooms >= p_bathrooms) -- Assuming we add bathrooms to properties
    AND (p_status IS NULL OR p.status = p_status);
END;
$$;

-- Get property by ID
CREATE OR REPLACE FUNCTION get_property_by_id(
  p_property_id TEXT
) RETURNS SETOF properties LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT p.*
  FROM properties p
  WHERE p.id = p_property_id;
END;
$$;

-- Get properties owned by a landlord
CREATE OR REPLACE FUNCTION get_landlord_properties(
  p_landlord_id TEXT
) RETURNS SETOF properties LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT p.*
  FROM properties p
  WHERE p.owner_id = p_landlord_id;
END;
$$;

-- Get properties rented by a renter
CREATE OR REPLACE FUNCTION get_renter_properties(
  p_renter_id TEXT
) RETURNS TABLE (
  property_id TEXT,
  title_en TEXT,
  title_ar TEXT,
  description_en TEXT,
  description_ar TEXT,
  rent_amount DECIMAL,
  security_deposit DECIMAL,
  status TEXT,
  owner_id TEXT,
  city_en TEXT,
  city_ar TEXT,
  contract_id TEXT,
  start_date TIMESTAMP,
  end_date TIMESTAMP
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id as property_id,
    p.title_en,
    p.title_ar,
    p.description_en,
    p.description_ar,
    p.rent_amount,
    p.security_deposit,
    p.status,
    p.owner_id,
    p.city_en,
    p.city_ar,
    rc.id as contract_id,
    rc.start_date,
    rc.end_date
  FROM rental_contracts rc
  JOIN properties p ON rc.property_id = p.id
  WHERE rc.renter_id = p_renter_id
  AND rc.status IN ('active', 'pending');
END;
$$;

-- Add property
CREATE OR REPLACE FUNCTION add_property(
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
  p_longitude DECIMAL
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
    days_listed
  ) VALUES (
    v_property_id,
    p_title_en,
    p_title_ar,
    p_description_en,
    p_description_ar,
    p_rent_amount,
    p_security_deposit,
    'available',
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
    0
  );
  
  RETURN v_property_id;
END;
$$;

-- Update property
CREATE OR REPLACE FUNCTION update_property(
  p_property_id TEXT,
  p_title_en TEXT DEFAULT NULL,
  p_title_ar TEXT DEFAULT NULL,
  p_description_en TEXT DEFAULT NULL,
  p_description_ar TEXT DEFAULT NULL,
  p_rent_amount DECIMAL DEFAULT NULL,
  p_security_deposit DECIMAL DEFAULT NULL,
  p_status TEXT DEFAULT NULL,
  p_number_of_rooms INT DEFAULT NULL,
  p_square_footage INT DEFAULT NULL,
  p_property_type_en TEXT DEFAULT NULL,
  p_property_type_ar TEXT DEFAULT NULL,
  p_availability_date TIMESTAMP DEFAULT NULL,
  p_city_en TEXT DEFAULT NULL,
  p_city_ar TEXT DEFAULT NULL,
  p_area_en TEXT DEFAULT NULL,
  p_area_ar TEXT DEFAULT NULL,
  p_latitude DECIMAL DEFAULT NULL,
  p_longitude DECIMAL DEFAULT NULL
) RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE properties SET
    title_en = COALESCE(p_title_en, title_en),
    title_ar = COALESCE(p_title_ar, title_ar),
    description_en = COALESCE(p_description_en, description_en),
    description_ar = COALESCE(p_description_ar, description_ar),
    rent_amount = COALESCE(p_rent_amount, rent_amount),
    security_deposit = COALESCE(p_security_deposit, security_deposit),
    status = COALESCE(p_status, status),
    number_of_rooms = COALESCE(p_number_of_rooms, number_of_rooms),
    square_footage = COALESCE(p_square_footage, square_footage),
    property_type_en = COALESCE(p_property_type_en, property_type_en),
    property_type_ar = COALESCE(p_property_type_ar, property_type_ar),
    availability_date = COALESCE(p_availability_date, availability_date),
    city_en = COALESCE(p_city_en, city_en),
    city_ar = COALESCE(p_city_ar, city_ar),
    area_en = COALESCE(p_area_en, area_en),
    area_ar = COALESCE(p_area_ar, area_ar),
    latitude = COALESCE(p_latitude, latitude),
    longitude = COALESCE(p_longitude, longitude)
  WHERE id = p_property_id;
  
  RETURN FOUND;
END;
$$;

-- Delete property
CREATE OR REPLACE FUNCTION delete_property(
  p_property_id TEXT
) RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  -- First check if property is in use in any active contract
  IF EXISTS (
    SELECT 1 FROM rental_contracts 
    WHERE property_id = p_property_id 
    AND status = 'active'
  ) THEN
    RETURN FALSE; -- Property is in use
  END IF;

  -- Delete property images
  DELETE FROM property_images WHERE property_id = p_property_id;
  
  -- Delete property
  DELETE FROM properties WHERE id = p_property_id;
  
  RETURN FOUND;
END;
$$;

-- Create a saved_properties table to track favorites
CREATE TABLE IF NOT EXISTS saved_properties (
  id TEXT PRIMARY KEY,
  renter_id TEXT REFERENCES renters(id),
  property_id TEXT REFERENCES properties(id),
  saved_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(renter_id, property_id)
);

-- Save property to favorites
CREATE OR REPLACE FUNCTION save_property(
  p_renter_id TEXT,
  p_property_id TEXT
) RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO saved_properties (id, renter_id, property_id)
  VALUES (gen_random_uuid()::TEXT, p_renter_id, p_property_id)
  ON CONFLICT (renter_id, property_id) DO NOTHING;
  
  RETURN FOUND;
END;
$$;

-- Unsave property from favorites
CREATE OR REPLACE FUNCTION unsave_property(
  p_renter_id TEXT,
  p_property_id TEXT
) RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  DELETE FROM saved_properties 
  WHERE renter_id = p_renter_id AND property_id = p_property_id;
  
  RETURN FOUND;
END;
$$;

-- Get saved properties
CREATE OR REPLACE FUNCTION get_saved_properties(
  p_renter_id TEXT
) RETURNS SETOF properties LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT p.*
  FROM saved_properties sp
  JOIN properties p ON sp.property_id = p.id
  WHERE sp.renter_id = p_renter_id;
END;
$$;

-- ==========================================
-- Rental Requests Functions (Applications)
-- ==========================================

-- Get rent requests with filters
CREATE OR REPLACE FUNCTION get_rent_requests(
  p_property_id TEXT DEFAULT NULL,
  p_renter_id TEXT DEFAULT NULL,
  p_landlord_id TEXT DEFAULT NULL,
  p_status TEXT DEFAULT NULL
) RETURNS SETOF applications LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT a.*
  FROM applications a
  JOIN properties p ON a.property_id = p.id
  WHERE 
    (p_property_id IS NULL OR a.property_id = p_property_id)
    AND (p_renter_id IS NULL OR a.renter_id = p_renter_id)
    AND (p_landlord_id IS NULL OR p.owner_id = p_landlord_id)
    AND (p_status IS NULL OR a.status = p_status);
END;
$$;

-- Get rent request by ID
CREATE OR REPLACE FUNCTION get_rent_request_by_id(
  p_request_id TEXT
) RETURNS SETOF applications LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT a.*
  FROM applications a
  WHERE a.id = p_request_id;
END;
$$;

-- Send rent request
CREATE OR REPLACE FUNCTION send_rent_request(
  p_renter_id TEXT,
  p_property_id TEXT,
  p_has_id_card BOOLEAN,
  p_has_proof_of_income BOOLEAN,
  p_has_bank_statement BOOLEAN
) RETURNS TEXT LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_request_id TEXT;
  v_progress INT;
BEGIN
  -- Calculate progress based on submitted documents
  v_progress := 0;
  IF p_has_id_card THEN v_progress := v_progress + 33; END IF;
  IF p_has_proof_of_income THEN v_progress := v_progress + 33; END IF;
  IF p_has_bank_statement THEN v_progress := v_progress + 34; END IF;

  -- Generate a new ID
  v_request_id := gen_random_uuid()::TEXT;
  
  -- Insert application
  INSERT INTO applications (
    id,
    property_id,
    renter_id,
    status,
    created_at,
    id_card,
    proof_of_income,
    bank_statement,
    progress
  ) VALUES (
    v_request_id,
    p_property_id,
    p_renter_id,
    'pending',
    NOW(),
    p_has_id_card,
    p_has_proof_of_income,
    p_has_bank_statement,
    v_progress
  );
  
  -- Update property inquiries count
  UPDATE properties 
  SET inquiries = inquiries + 1
  WHERE id = p_property_id;
  
  RETURN v_request_id;
END;
$$;

-- Update rent request
CREATE OR REPLACE FUNCTION update_rent_request(
  p_request_id TEXT,
  p_has_id_card BOOLEAN DEFAULT NULL,
  p_has_proof_of_income BOOLEAN DEFAULT NULL,
  p_has_bank_statement BOOLEAN DEFAULT NULL
) RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_progress INT;
  v_id_card BOOLEAN;
  v_proof_of_income BOOLEAN;
  v_bank_statement BOOLEAN;
BEGIN
  -- Get current values
  SELECT 
    id_card, 
    proof_of_income, 
    bank_statement 
  INTO 
    v_id_card, 
    v_proof_of_income, 
    v_bank_statement
  FROM applications
  WHERE id = p_request_id;
  
  -- Apply new values if provided
  v_id_card := COALESCE(p_has_id_card, v_id_card);
  v_proof_of_income := COALESCE(p_has_proof_of_income, v_proof_of_income);
  v_bank_statement := COALESCE(p_has_bank_statement, v_bank_statement);
  
  -- Calculate new progress
  v_progress := 0;
  IF v_id_card THEN v_progress := v_progress + 33; END IF;
  IF v_proof_of_income THEN v_progress := v_progress + 33; END IF;
  IF v_bank_statement THEN v_progress := v_progress + 34; END IF;
  
  -- Update application
  UPDATE applications SET
    id_card = v_id_card,
    proof_of_income = v_proof_of_income,
    bank_statement = v_bank_statement,
    progress = v_progress
  WHERE id = p_request_id;
  
  RETURN FOUND;
END;
$$;

-- Update rent request status
CREATE OR REPLACE FUNCTION update_rent_request_status(
  p_request_id TEXT,
  p_status TEXT
) RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_property_id TEXT;
BEGIN
  -- Get the property ID
  SELECT property_id INTO v_property_id
  FROM applications
  WHERE id = p_request_id;
  
  -- Update application status
  UPDATE applications SET
    status = p_status
  WHERE id = p_request_id;
  
  -- If approved, update property status
  IF p_status = 'accepted' THEN
    UPDATE properties SET
      status = 'pending'
    WHERE id = v_property_id;
  END IF;
  
  RETURN FOUND;
END;
$$;

-- ==========================================
-- Contracts Functions
-- ==========================================

-- Get contracts with filters
CREATE OR REPLACE FUNCTION get_contracts(
  p_property_id TEXT DEFAULT NULL,
  p_renter_id TEXT DEFAULT NULL,
  p_landlord_id TEXT DEFAULT NULL,
  p_status TEXT DEFAULT NULL
) RETURNS SETOF rental_contracts LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT rc.*
  FROM rental_contracts rc
  JOIN properties p ON rc.property_id = p.id
  JOIN landlords l ON p.owner_id = l.id
  WHERE 
    (p_property_id IS NULL OR rc.property_id = p_property_id)
    AND (p_renter_id IS NULL OR rc.renter_id = p_renter_id)
    AND (p_landlord_id IS NULL OR l.id = p_landlord_id)
    AND (p_status IS NULL OR rc.status = p_status);
END;
$$;

-- Get contract by ID
CREATE OR REPLACE FUNCTION get_contract_by_id(
  p_contract_id TEXT
) RETURNS SETOF rental_contracts LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT rc.*
  FROM rental_contracts rc
  WHERE rc.id = p_contract_id;
END;
$$;

-- Get contract by property and renter
CREATE OR REPLACE FUNCTION get_contract_by_property(
  p_property_id TEXT,
  p_renter_id TEXT
) RETURNS SETOF rental_contracts LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT rc.*
  FROM rental_contracts rc
  WHERE rc.property_id = p_property_id
  AND rc.renter_id = p_renter_id
  AND rc.status IN ('active', 'pending')
  ORDER BY rc.created_at DESC
  LIMIT 1;
END;
$$;

-- Create contract
CREATE OR REPLACE FUNCTION create_contract(
  p_property_id TEXT,
  p_renter_id TEXT,
  p_start_date TIMESTAMP,
  p_end_date TIMESTAMP,
  p_monthly_rent DECIMAL,
  p_security_deposit DECIMAL,
  p_payment_due_day INT,
  p_status TEXT DEFAULT 'pending'
) RETURNS TEXT LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_contract_id TEXT;
BEGIN
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
    signed_document
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
    FALSE
  );
  
  -- If contract is active, update property status
  IF p_status = 'active' THEN
    UPDATE properties SET
      status = 'rented'
    WHERE id = p_property_id;
  END IF;
  
  RETURN v_contract_id;
END;
$$;

-- Update contract
CREATE OR REPLACE FUNCTION update_contract(
  p_contract_id TEXT,
  p_start_date TIMESTAMP DEFAULT NULL,
  p_end_date TIMESTAMP DEFAULT NULL,
  p_monthly_rent DECIMAL DEFAULT NULL,
  p_security_deposit DECIMAL DEFAULT NULL,
  p_payment_due_day INT DEFAULT NULL,
  p_status TEXT DEFAULT NULL,
  p_document_url TEXT DEFAULT NULL
) RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_property_id TEXT;
  v_status TEXT;
BEGIN
  -- Get current property ID and status
  SELECT property_id, status INTO v_property_id, v_status
  FROM rental_contracts
  WHERE id = p_contract_id;
  
  -- Update contract
  UPDATE rental_contracts SET
    start_date = COALESCE(p_start_date, start_date),
    end_date = COALESCE(p_end_date, end_date),
    monthly_rent = COALESCE(p_monthly_rent, monthly_rent),
    security_deposit = COALESCE(p_security_deposit, security_deposit),
    payment_due_day = COALESCE(p_payment_due_day, payment_due_day),
    status = COALESCE(p_status, status),
    document_url = COALESCE(p_document_url, document_url)
  WHERE id = p_contract_id;
  
  -- If status changed to active, update property status
  IF p_status IS NOT NULL AND p_status = 'active' AND v_status != 'active' THEN
    UPDATE properties SET
      status = 'rented'
    WHERE id = v_property_id;
  -- If status changed from active, update property status
  ELSIF p_status IS NOT NULL AND p_status != 'active' AND v_status = 'active' THEN
    UPDATE properties SET
      status = 'available'
    WHERE id = v_property_id;
  END IF;
  
  RETURN FOUND;
END;
$$;

-- Terminate contract
CREATE OR REPLACE FUNCTION terminate_contract(
  p_contract_id TEXT
) RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_property_id TEXT;
BEGIN
  -- Get property ID
  SELECT property_id INTO v_property_id
  FROM rental_contracts
  WHERE id = p_contract_id;
  
  -- Update contract status
  UPDATE rental_contracts SET
    status = 'terminated'
  WHERE id = p_contract_id;
  
  -- Update property status
  UPDATE properties SET
    status = 'available'
  WHERE id = v_property_id;
  
  RETURN FOUND;
END;
$$;

-- Extend contract
CREATE OR REPLACE FUNCTION extend_contract(
  p_contract_id TEXT,
  p_new_end_date TIMESTAMP
) RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE rental_contracts SET
    end_date = p_new_end_date
  WHERE id = p_contract_id;
  
  RETURN FOUND;
END;
$$;

-- Sign contract
CREATE OR REPLACE FUNCTION sign_contract(
  p_contract_id TEXT,
  p_user_id TEXT,
  p_signature_url TEXT
) RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  -- In a real app, would track both parties' signatures
  -- For simplicity, we just mark the contract as signed
  UPDATE rental_contracts SET
    signed_document = TRUE,
    document_url = p_signature_url
  WHERE id = p_contract_id;
  
  RETURN FOUND;
END;
$$;

-- ==========================================
-- Payments Functions
-- ==========================================

-- Get transactions with filters
CREATE OR REPLACE FUNCTION get_transactions(
  p_property_id TEXT DEFAULT NULL,
  p_renter_id TEXT DEFAULT NULL,
  p_landlord_id TEXT DEFAULT NULL,
  p_status TEXT DEFAULT NULL,
  p_type TEXT DEFAULT NULL
) RETURNS SETOF transactions LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT t.*
  FROM transactions t
  WHERE 
    (p_property_id IS NULL OR t.property_id = p_property_id)
    AND (p_renter_id IS NULL OR t.renter_id = p_renter_id)
    AND (p_landlord_id IS NULL OR t.landlord_id = p_landlord_id)
    AND (p_status IS NULL OR t.status = p_status)
    AND (p_type IS NULL OR t.type = p_type);
END;
$$;

-- Get transaction by ID
CREATE OR REPLACE FUNCTION get_transaction_by_id(
  p_transaction_id TEXT
) RETURNS SETOF transactions LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT t.*
  FROM transactions t
  WHERE t.id = p_transaction_id;
END;
$$;

-- Create transaction
CREATE OR REPLACE FUNCTION create_transaction(
  p_property_id TEXT,
  p_renter_id TEXT,
  p_landlord_id TEXT,
  p_amount DECIMAL,
  p_currency TEXT,
  p_type TEXT,
  p_due_date TIMESTAMP,
  p_description_en TEXT,
  p_description_ar TEXT DEFAULT NULL
) RETURNS TEXT LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_transaction_id TEXT;
BEGIN
  -- Generate a new ID
  v_transaction_id := gen_random_uuid()::TEXT;
  
  -- Insert transaction
  INSERT INTO transactions (
    id,
    property_id,
    renter_id,
    landlord_id,
    amount,
    currency,
    type,
    status,
    due_date,
    description_en,
    description_ar
  ) VALUES (
    v_transaction_id,
    p_property_id,
    p_renter_id,
    p_landlord_id,
    p_amount,
    p_currency,
    p_type,
    'pending',
    p_due_date,
    p_description_en,
    p_description_ar
  );
  
  RETURN v_transaction_id;
END;
$$;

-- Update transaction
CREATE OR REPLACE FUNCTION update_transaction(
  p_transaction_id TEXT,
  p_amount DECIMAL DEFAULT NULL,
  p_currency TEXT DEFAULT NULL,
  p_status TEXT DEFAULT NULL,
  p_due_date TIMESTAMP DEFAULT NULL,
  p_description_en TEXT DEFAULT NULL,
  p_description_ar TEXT DEFAULT NULL
) RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE transactions SET
    amount = COALESCE(p_amount, amount),
    currency = COALESCE(p_currency, currency),
    status = COALESCE(p_status, status),
    due_date = COALESCE(p_due_date, due_date),
    description_en = COALESCE(p_description_en, description_en),
    description_ar = COALESCE(p_description_ar, description_ar)
  WHERE id = p_transaction_id;
  
  RETURN FOUND;
END;
$$;

-- Process payment
CREATE OR REPLACE FUNCTION process_payment(
  p_transaction_id TEXT,
  p_amount DECIMAL,
  p_currency TEXT,
  p_method TEXT
) RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  -- Mark transaction as paid
  UPDATE transactions SET
    status = 'paid',
    paid_date = NOW()
  WHERE id = p_transaction_id;
  
  -- In a real app, would create payment record with payment method details
  
  RETURN FOUND;
END;
$$;

-- Get financial summary
CREATE OR REPLACE FUNCTION get_financial_summary(
  p_user_id TEXT
) RETURNS TABLE (
  total_revenue DECIMAL,
  received DECIMAL,
  pending DECIMAL,
  overdue DECIMAL
) LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_landlord_id TEXT;
  v_renter_id TEXT;
BEGIN
  -- Get landlord or renter ID
  SELECT id INTO v_landlord_id FROM landlords WHERE user_id = p_user_id;
  SELECT id INTO v_renter_id FROM renters WHERE user_id = p_user_id;
  
  IF v_landlord_id IS NOT NULL THEN
    -- Get landlord summary
    RETURN QUERY
    SELECT 
      SUM(amount) as total_revenue,
      SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) as received,
      SUM(CASE WHEN status = 'pending' AND due_date >= NOW() THEN amount ELSE 0 END) as pending,
      SUM(CASE WHEN status = 'pending' AND due_date < NOW() THEN amount ELSE 0 END) as overdue
    FROM transactions
    WHERE landlord_id = v_landlord_id;
  ELSIF v_renter_id IS NOT NULL THEN
    -- Get renter summary
    RETURN QUERY
    SELECT 
      SUM(amount) as total_revenue,
      SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) as received,
      SUM(CASE WHEN status = 'pending' AND due_date >= NOW() THEN amount ELSE 0 END) as pending,
      SUM(CASE WHEN status = 'pending' AND due_date < NOW() THEN amount ELSE 0 END) as overdue
    FROM transactions
    WHERE renter_id = v_renter_id;
  ELSE
    -- Return empty result
    RETURN QUERY
    SELECT 
      0::DECIMAL as total_revenue,
      0::DECIMAL as received,
      0::DECIMAL as pending,
      0::DECIMAL as overdue;
  END IF;
END;
$$;

-- ==========================================
-- Maintenance Functions
-- ==========================================

-- Get maintenance requests with filters
CREATE OR REPLACE FUNCTION get_maintenance_requests(
  p_property_id TEXT DEFAULT NULL,
  p_renter_id TEXT DEFAULT NULL,
  p_status TEXT DEFAULT NULL
) RETURNS SETOF maintenance_requests LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT mr.*
  FROM maintenance_requests mr
  WHERE 
    (p_property_id IS NULL OR mr.property_id = p_property_id)
    AND (p_renter_id IS NULL OR mr.renter_id = p_renter_id)
    AND (p_status IS NULL OR mr.status = p_status);
END;
$$;

-- Get maintenance request by ID
CREATE OR REPLACE FUNCTION get_maintenance_request_by_id(
  p_request_id TEXT
) RETURNS SETOF maintenance_requests LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT mr.*
  FROM maintenance_requests mr
  WHERE mr.id = p_request_id;
END;
$$;

-- Create maintenance request
CREATE OR REPLACE FUNCTION create_maintenance_request(
  p_renter_id TEXT,
  p_property_id TEXT,
  p_title_en TEXT,
  p_title_ar TEXT,
  p_description_en TEXT,
  p_description_ar TEXT,
  p_location_en TEXT,
  p_location_ar TEXT,
  p_priority TEXT
) RETURNS TEXT LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_request_id TEXT;
BEGIN
  -- Generate a new ID
  v_request_id := gen_random_uuid()::TEXT;
  
  -- Insert maintenance request
  INSERT INTO maintenance_requests (
    id,
    renter_id,
    property_id,
    title_en,
    title_ar,
    description_en,
    description_ar,
    location_en,
    location_ar,
    status,
    priority,
    created_at,
    updated_at
  ) VALUES (
    v_request_id,
    p_renter_id,
    p_property_id,
    p_title_en,
    p_title_ar,
    p_description_en,
    p_description_ar,
    p_location_en,
    p_location_ar,
    'pending',
    p_priority,
    NOW(),
    NOW()
  );
  
  RETURN v_request_id;
END;
$$;

-- Update maintenance request
CREATE OR REPLACE FUNCTION update_maintenance_request(
  p_request_id TEXT,
  p_title_en TEXT DEFAULT NULL,
  p_title_ar TEXT DEFAULT NULL,
  p_description_en TEXT DEFAULT NULL,
  p_description_ar TEXT DEFAULT NULL,
  p_location_en TEXT DEFAULT NULL,
  p_location_ar TEXT DEFAULT NULL,
  p_priority TEXT DEFAULT NULL
) RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE maintenance_requests SET
    title_en = COALESCE(p_title_en, title_en),
    title_ar = COALESCE(p_title_ar, title_ar),
    description_en = COALESCE(p_description_en, description_en),
    description_ar = COALESCE(p_description_ar, description_ar),
    location_en = COALESCE(p_location_en, location_en),
    location_ar = COALESCE(p_location_ar, location_ar),
    priority = COALESCE(p_priority, priority),
    updated_at = NOW()
  WHERE id = p_request_id;
  
  RETURN FOUND;
END;
$$;

-- Schedule maintenance request
CREATE OR REPLACE FUNCTION schedule_maintenance_request(
  p_request_id TEXT,
  p_scheduled_date TEXT,
  p_changed_by TEXT
) RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  -- Get current status
  INSERT INTO maintenance_status_history (
    id,
    request_id,
    previous_status,
    new_status,
    changed_by,
    changed_at,
    notes_en
  ) 
  SELECT 
    gen_random_uuid()::TEXT,
    p_request_id,
    status,
    'scheduled',
    p_changed_by,
    NOW(),
    'Maintenance scheduled for ' || p_scheduled_date
  FROM maintenance_requests
  WHERE id = p_request_id;
  
  -- Update maintenance request
  UPDATE maintenance_requests SET
    status = 'scheduled',
    updated_at = NOW()
  WHERE id = p_request_id;
  
  RETURN FOUND;
END;
$$;

-- Complete maintenance request
CREATE OR REPLACE FUNCTION complete_maintenance_request(
  p_request_id TEXT,
  p_changed_by TEXT
) RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  -- Record status change
  INSERT INTO maintenance_status_history (
    id,
    request_id,
    previous_status,
    new_status,
    changed_by,
    changed_at,
    notes_en
  ) 
  SELECT 
    gen_random_uuid()::TEXT,
    p_request_id,
    status,
    'completed',
    p_changed_by,
    NOW(),
    'Maintenance completed'
  FROM maintenance_requests
  WHERE id = p_request_id;
  
  -- Update maintenance request
  UPDATE maintenance_requests SET
    status = 'completed',
    updated_at = NOW(),
    completed_at = NOW()
  WHERE id = p_request_id;
  
  RETURN FOUND;
END;
$$;

-- Cancel maintenance request
CREATE OR REPLACE FUNCTION cancel_maintenance_request(
  p_request_id TEXT,
  p_changed_by TEXT
) RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  -- Record status change
  INSERT INTO maintenance_status_history (
    id,
    request_id,
    previous_status,
    new_status,
    changed_by,
    changed_at,
    notes_en
  ) 
  SELECT 
    gen_random_uuid()::TEXT,
    p_request_id,
    status,
    'cancelled',
    p_changed_by,
    NOW(),
    'Maintenance request cancelled'
  FROM maintenance_requests
  WHERE id = p_request_id;
  
  -- Update maintenance request
  UPDATE maintenance_requests SET
    status = 'cancelled',
    updated_at = NOW()
  WHERE id = p_request_id;
  
  RETURN FOUND;
END;
$$;

-- ==========================================
-- Chat Functions
-- ==========================================

-- Get conversations
CREATE OR REPLACE FUNCTION get_conversations(
  p_user_id TEXT
) RETURNS TABLE (
  participant_id TEXT,
  participant_name TEXT,
  participant_avatar TEXT,
  last_message TEXT,
  last_message_date TIMESTAMP,
  unread_count BIGINT
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  WITH conversations AS (
    SELECT DISTINCT
      CASE 
        WHEN sender_id = p_user_id THEN receiver_id
        ELSE sender_id
      END as participant_id
    FROM messages
    WHERE sender_id = p_user_id OR receiver_id = p_user_id
  ),
  last_messages AS (
    SELECT 
      CASE 
        WHEN sender_id = p_user_id THEN receiver_id
        ELSE sender_id
      END as participant_id,
      content_en as message,
      timestamp,
      ROW_NUMBER() OVER (
        PARTITION BY 
          CASE 
            WHEN sender_id = p_user_id THEN receiver_id
            ELSE sender_id
          END
        ORDER BY timestamp DESC
      ) as rn
    FROM messages
    WHERE sender_id = p_user_id OR receiver_id = p_user_id
  ),
  unread_counts AS (
    SELECT 
      sender_id,
      COUNT(*) as unread
    FROM messages
    WHERE 
      receiver_id = p_user_id
      AND is_read = FALSE
    GROUP BY sender_id
  )
  SELECT 
    c.participant_id,
    u.full_name_en as participant_name,
    u.profile_picture as participant_avatar,
    lm.message as last_message,
    lm.timestamp as last_message_date,
    COALESCE(uc.unread, 0) as unread_count
  FROM conversations c
  JOIN users u ON c.participant_id = u.id
  JOIN last_messages lm ON c.participant_id = lm.participant_id AND lm.rn = 1
  LEFT JOIN unread_counts uc ON c.participant_id = uc.sender_id;
END;
$$;

-- Get messages
CREATE OR REPLACE FUNCTION get_messages(
  p_user_id TEXT,
  p_participant_id TEXT,
  p_limit INT DEFAULT 20,
  p_offset INT DEFAULT 0
) RETURNS SETOF messages LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT m.*
  FROM messages m
  WHERE 
    (m.sender_id = p_user_id AND m.receiver_id = p_participant_id)
    OR (m.sender_id = p_participant_id AND m.receiver_id = p_user_id)
  ORDER BY m.timestamp DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

-- Send message
CREATE OR REPLACE FUNCTION send_message(
  p_sender_id TEXT,
  p_receiver_id TEXT,
  p_content_en TEXT,
  p_content_ar TEXT DEFAULT NULL,
  p_property_id TEXT DEFAULT NULL
) RETURNS TEXT LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_message_id TEXT;
BEGIN
  -- Generate a new ID
  v_message_id := gen_random_uuid()::TEXT;
  
  -- Insert message
  INSERT INTO messages (
    id,
    sender_id,
    receiver_id,
    content_en,
    content_ar,
    timestamp,
    is_read,
    property_id
  ) VALUES (
    v_message_id,
    p_sender_id,
    p_receiver_id,
    p_content_en,
    p_content_ar,
    NOW(),
    FALSE,
    p_property_id
  );
  
  RETURN v_message_id;
END;
$$;

-- Mark messages as read
CREATE OR REPLACE FUNCTION mark_messages_as_read(
  p_user_id TEXT,
  p_sender_id TEXT
) RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE messages SET
    is_read = TRUE
  WHERE 
    receiver_id = p_user_id
    AND sender_id = p_sender_id
    AND is_read = FALSE;
  
  RETURN FOUND;
END;
$$;

-- ==========================================
-- Dashboard Functions
-- ==========================================

-- Get landlord dashboard
CREATE OR REPLACE FUNCTION get_landlord_dashboard(
  p_landlord_id TEXT
) RETURNS TABLE (
  property_count BIGINT,
  occupancy_rate NUMERIC,
  renter_count BIGINT,
  total_revenue DECIMAL,
  recent_activity JSON
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  WITH property_stats AS (
    SELECT 
      COUNT(*) as property_count,
      COUNT(CASE WHEN status = 'rented' THEN 1 END)::NUMERIC / 
        NULLIF(COUNT(*)::NUMERIC, 0) * 100 as occupancy_rate
    FROM properties
    WHERE owner_id = p_landlord_id
  ),
  renter_stats AS (
    SELECT 
      COUNT(DISTINCT rc.renter_id) as renter_count
    FROM rental_contracts rc
    JOIN properties p ON rc.property_id = p.id
    WHERE p.owner_id = p_landlord_id
    AND rc.status = 'active'
  ),
  revenue_stats AS (
    SELECT 
      SUM(amount) as total_revenue
    FROM transactions
    WHERE landlord_id = p_landlord_id
    AND status = 'paid'
  ),
  recent_activities AS (
    (SELECT 
      id,
      'application' as type,
      'New application received' as title,
      created_at as timestamp
    FROM applications a
    JOIN properties p ON a.property_id = p.id
    WHERE p.owner_id = p_landlord_id
    ORDER BY created_at DESC
    LIMIT 3)
    UNION ALL
    (SELECT 
      id,
      'payment' as type,
      'Payment received' as title,
      paid_date as timestamp
    FROM transactions
    WHERE landlord_id = p_landlord_id
    AND status = 'paid'
    AND paid_date IS NOT NULL
    ORDER BY paid_date DESC
    LIMIT 3)
    UNION ALL
    (SELECT 
      id,
      'maintenance' as type,
      'Maintenance request submitted' as title,
      created_at as timestamp
    FROM maintenance_requests mr
    JOIN properties p ON mr.property_id = p.id
    WHERE p.owner_id = p_landlord_id
    ORDER BY created_at DESC
    LIMIT 3)
    ORDER BY timestamp DESC
    LIMIT 5
  )
  SELECT 
    ps.property_count,
    ps.occupancy_rate,
    rs.renter_count,
    COALESCE(rev.total_revenue, 0),
    COALESCE(
      (SELECT json_agg(ra) FROM recent_activities ra),
      '[]'::JSON
    ) as recent_activity
  FROM property_stats ps
  CROSS JOIN renter_stats rs
  CROSS JOIN revenue_stats rev;
END;
$$;

-- Get renter dashboard
CREATE OR REPLACE FUNCTION get_renter_dashboard(
  p_renter_id TEXT
) RETURNS TABLE (
  current_rental JSON,
  maintenance_requests JSON,
  saved_properties JSON,
  next_payment JSON
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  WITH current_rental AS (
    SELECT 
      json_build_object(
        'property_id', p.id,
        'title', p.title_en,
        'address', p.area_en || ', ' || p.city_en,
        'rent', p.rent_amount,
        'contract_start', rc.start_date,
        'contract_end', rc.end_date,
        'landlord_name', u.full_name_en,
        'landlord_phone', u.phone
      ) as property_data
    FROM rental_contracts rc
    JOIN properties p ON rc.property_id = p.id
    JOIN landlords l ON p.owner_id = l.id
    JOIN users u ON l.user_id = u.id
    WHERE rc.renter_id = p_renter_id
    AND rc.status = 'active'
    ORDER BY rc.start_date DESC
    LIMIT 1
  ),
  maintenance AS (
    SELECT 
      json_agg(
        json_build_object(
          'id', mr.id,
          'title', mr.title_en,
          'status', mr.status,
          'priority', mr.priority,
          'created_at', mr.created_at
        )
      ) as maintenance_data
    FROM maintenance_requests mr
    WHERE mr.renter_id = p_renter_id
    AND mr.status IN ('pending', 'scheduled')
    ORDER BY 
      CASE 
        WHEN mr.priority = 'high' THEN 1
        WHEN mr.priority = 'medium' THEN 2
        ELSE 3
      END,
      mr.created_at DESC
    LIMIT 5
  ),
  saved AS (
    SELECT 
      json_agg(
        json_build_object(
          'id', p.id,
          'title', p.title_en,
          'city', p.city_en,
          'rent', p.rent_amount,
          'rooms', p.number_of_rooms,
          'image', (
            SELECT image_url
            FROM property_images
            WHERE property_id = p.id
            AND is_main_image = TRUE
            LIMIT 1
          )
        )
      ) as saved_data
    FROM saved_properties sp
    JOIN properties p ON sp.property_id = p.id
    WHERE sp.renter_id = p_renter_id
    LIMIT 3
  ),
  next_payment AS (
    SELECT 
      json_build_object(
        'amount', t.amount,
        'currency', t.currency,
        'due_date', t.due_date,
        'due_in_days', EXTRACT(DAY FROM (t.due_date - NOW()))
      ) as payment_data
    FROM transactions t
    WHERE t.renter_id = p_renter_id
    AND t.status = 'pending'
    AND t.due_date > NOW()
    ORDER BY t.due_date ASC
    LIMIT 1
  )
  SELECT 
    COALESCE((SELECT property_data FROM current_rental), NULL::JSON),
    COALESCE((SELECT maintenance_data FROM maintenance), '[]'::JSON),
    COALESCE((SELECT saved_data FROM saved), '[]'::JSON),
    COALESCE((SELECT payment_data FROM next_payment), NULL::JSON);
END;
$$;

-- ==========================================
-- Settings Functions
-- ==========================================

-- Create user_settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_settings (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  notification_email BOOLEAN DEFAULT TRUE,
  notification_push BOOLEAN DEFAULT TRUE,
  notification_sms BOOLEAN DEFAULT FALSE,
  notification_new_requests BOOLEAN DEFAULT TRUE,
  notification_payments BOOLEAN DEFAULT TRUE,
  notification_maintenance BOOLEAN DEFAULT TRUE,
  notification_messages BOOLEAN DEFAULT TRUE,
  language TEXT DEFAULT 'en',
  theme TEXT DEFAULT 'light',
  text_size TEXT DEFAULT 'medium'
);

-- Update notification settings
CREATE OR REPLACE FUNCTION update_notification_settings(
  p_user_id TEXT,
  p_email BOOLEAN,
  p_push BOOLEAN,
  p_sms BOOLEAN,
  p_new_requests BOOLEAN,
  p_payments BOOLEAN,
  p_maintenance BOOLEAN,
  p_messages BOOLEAN
) RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO user_settings (
    id,
    user_id,
    notification_email,
    notification_push,
    notification_sms,
    notification_new_requests,
    notification_payments,
    notification_maintenance,
    notification_messages
  ) VALUES (
    gen_random_uuid()::TEXT,
    p_user_id,
    p_email,
    p_push,
    p_sms,
    p_new_requests,
    p_payments,
    p_maintenance,
    p_messages
  )
  ON CONFLICT (user_id) DO UPDATE SET
    notification_email = p_email,
    notification_push = p_push,
    notification_sms = p_sms,
    notification_new_requests = p_new_requests,
    notification_payments = p_payments,
    notification_maintenance = p_maintenance,
    notification_messages = p_messages;
  
  RETURN FOUND;
END;
$$;

-- Update language
CREATE OR REPLACE FUNCTION update_language(
  p_user_id TEXT,
  p_language TEXT
) RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO user_settings (
    id,
    user_id,
    language
  ) VALUES (
    gen_random_uuid()::TEXT,
    p_user_id,
    p_language
  )
  ON CONFLICT (user_id) DO UPDATE SET
    language = p_language;
  
  RETURN FOUND;
END;
$$;

-- Update theme
CREATE OR REPLACE FUNCTION update_theme(
  p_user_id TEXT,
  p_theme TEXT
) RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO user_settings (
    id,
    user_id,
    theme
  ) VALUES (
    gen_random_uuid()::TEXT,
    p_user_id,
    p_theme
  )
  ON CONFLICT (user_id) DO UPDATE SET
    theme = p_theme;
  
  RETURN FOUND;
END;
$$;

-- Update text size
CREATE OR REPLACE FUNCTION update_text_size(
  p_user_id TEXT,
  p_text_size TEXT
) RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO user_settings (
    id,
    user_id,
    text_size
  ) VALUES (
    gen_random_uuid()::TEXT,
    p_user_id,
    p_text_size
  )
  ON CONFLICT (user_id) DO UPDATE SET
    text_size = p_text_size;
  
  RETURN FOUND;
END;
$$;

-- ==========================================
-- Trigger Functions
-- ==========================================

-- Trigger function for automatically accepting rent requests after delay
CREATE OR REPLACE FUNCTION trigger_auto_accept_rent_request(
  p_request_id TEXT,
  p_delay_ms INT DEFAULT 259200000 -- 3 days in milliseconds
) RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  -- This would be implemented with pg_cron or similar extension in a real app
  -- For now, we just demonstrate the interface
  NULL;
END;
$$;

-- Trigger function for sending rent payment reminders
CREATE OR REPLACE FUNCTION trigger_rent_payment_reminder(
  p_days_before_due INT DEFAULT 3
) RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  -- This would be implemented with pg_cron or similar extension in a real app
  -- For now, we just demonstrate the interface
  NULL;
END;
$$;

-- Trigger function for sending contract expiration notifications
CREATE OR REPLACE FUNCTION trigger_contract_expiration_notification(
  p_days_before_expiry INT DEFAULT 30
) RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  -- This would be implemented with pg_cron or similar extension in a real app
  -- For now, we just demonstrate the interface
  NULL;
END;
$$;

-- Trigger function for sending maintenance follow-up messages
CREATE OR REPLACE FUNCTION trigger_maintenance_follow_up(
  p_days_after_completion INT DEFAULT 3
) RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  -- This would be implemented with pg_cron or similar extension in a real app
  -- For now, we just demonstrate the interface
  NULL;
END;
$$;

-- Trigger function for updating property status
CREATE OR REPLACE FUNCTION trigger_property_status_update(
  p_property_id TEXT,
  p_status TEXT
) RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE properties SET
    status = p_status
  WHERE id = p_property_id;
END;
$$;

-- Trigger function for automatically renewing contracts
CREATE OR REPLACE FUNCTION trigger_contract_auto_renewal(
  p_contract_id TEXT,
  p_new_duration_months INT DEFAULT 12
) RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_end_date TIMESTAMP;
  v_new_end_date TIMESTAMP;
BEGIN
  -- Get current end date
  SELECT end_date INTO v_end_date
  FROM rental_contracts
  WHERE id = p_contract_id;
  
  -- Calculate new end date
  v_new_end_date := v_end_date + (p_new_duration_months || ' months')::INTERVAL;
  
  -- Update contract
  UPDATE rental_contracts SET
    end_date = v_new_end_date
  WHERE id = p_contract_id;
END;
$$; 