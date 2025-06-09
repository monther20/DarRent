-- Debug version of the trigger function with detailed error logging
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  user_role text;
  error_context text;
BEGIN
  -- Get the role from user metadata
  user_role := NEW.raw_user_meta_data->>'role';
  
  -- Log the incoming data for debugging
  RAISE LOG 'Starting handle_new_user for user: %, role: %', NEW.id, user_role;
  RAISE LOG 'Metadata: %', NEW.raw_user_meta_data;
  
  BEGIN
    -- Insert into users table first
    RAISE LOG 'Attempting to insert into users table';
    INSERT INTO public.users (
      id,
      email,
      full_name_en,
      full_name_ar,
      phone,
      profile_picture,
      registration_date,
      status,
      rating,
      identity_verified,
      average_rating,
      review_count
    )
    VALUES (
      NEW.id,
      NEW.email,
      NEW.raw_user_meta_data->>'full_name_en',
      NEW.raw_user_meta_data->>'full_name_ar',
      NEW.raw_user_meta_data->>'phone',
      NEW.raw_user_meta_data->>'profile_picture',
      NOW(),
      'active',
      0.0,
      false,
      0.0,
      0
    );
    
    RAISE LOG 'Successfully inserted into users table';
    
  EXCEPTION
    WHEN OTHERS THEN
      error_context := 'Error inserting into users table: ' || SQLERRM;
      RAISE LOG '%', error_context;
      RAISE EXCEPTION '%', error_context;
  END;

  -- Insert into role-specific table based on user role
  IF user_role = 'landlord' THEN
    BEGIN
      RAISE LOG 'Attempting to insert into landlords table';
      INSERT INTO public.landlords (
        id,
        user_id,
        bank_account,
        verification_status_en,
        verification_status_ar,
        rating
      )
      VALUES (
        gen_random_uuid()::text,
        NEW.id,
        NEW.raw_user_meta_data->>'bank_account',
        'pending',
        'في الانتظار',
        0.0
      );
      RAISE LOG 'Successfully inserted into landlords table';
      
    EXCEPTION
      WHEN OTHERS THEN
        error_context := 'Error inserting into landlords table: ' || SQLERRM;
        RAISE LOG '%', error_context;
        RAISE EXCEPTION '%', error_context;
    END;
    
  ELSIF user_role = 'renter' THEN
    BEGIN
      RAISE LOG 'Attempting to insert into renters table';
      INSERT INTO public.renters (
        id,
        user_id,
        preferred_location_en,
        preferred_location_ar,
        budget,
        rating
      )
      VALUES (
        gen_random_uuid()::text,
        NEW.id,
        NEW.raw_user_meta_data->>'preferred_location_en',
        NEW.raw_user_meta_data->>'preferred_location_ar',
        CASE 
          WHEN NEW.raw_user_meta_data->>'budget' IS NOT NULL 
          THEN (NEW.raw_user_meta_data->>'budget')::numeric 
          ELSE NULL 
        END,
        0.0
      );
      RAISE LOG 'Successfully inserted into renters table';
      
    EXCEPTION
      WHEN OTHERS THEN
        error_context := 'Error inserting into renters table: ' || SQLERRM;
        RAISE LOG '%', error_context;
        RAISE EXCEPTION '%', error_context;
    END;
    
  ELSE
    RAISE LOG 'Unknown or missing role: %', user_role;
  END IF;

  RAISE LOG 'handle_new_user completed successfully for user: %', NEW.id;
  RETURN NEW;
  
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error with full context
    RAISE LOG 'Fatal error in handle_new_user: %', SQLERRM;
    -- Re-raise the exception to prevent the user creation
    RAISE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Also create a simple test function to check table structure
CREATE OR REPLACE FUNCTION public.test_table_structure()
RETURNS text AS $$
DECLARE
  result text := '';
BEGIN
  -- Test if we can insert a dummy record into users
  BEGIN
    INSERT INTO public.users (id, email, status) 
    VALUES ('test-user-123', 'test@test.com', 'active');
    
    DELETE FROM public.users WHERE id = 'test-user-123';
    result := result || 'Users table: OK. ';
  EXCEPTION
    WHEN OTHERS THEN
      result := result || 'Users table ERROR: ' || SQLERRM || '. ';
  END;
  
  -- Test landlords table
  BEGIN
    INSERT INTO public.landlords (id, user_id) 
    VALUES ('test-landlord-123', 'non-existent-user');
    
    DELETE FROM public.landlords WHERE id = 'test-landlord-123';
    result := result || 'Landlords table: OK. ';
  EXCEPTION
    WHEN OTHERS THEN
      result := result || 'Landlords table ERROR: ' || SQLERRM || '. ';
  END;
  
  -- Test renters table
  BEGIN
    INSERT INTO public.renters (id, user_id) 
    VALUES ('test-renter-123', 'non-existent-user');
    
    DELETE FROM public.renters WHERE id = 'test-renter-123';
    result := result || 'Renters table: OK. ';
  EXCEPTION
    WHEN OTHERS THEN
      result := result || 'Renters table ERROR: ' || SQLERRM || '. ';
  END;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 