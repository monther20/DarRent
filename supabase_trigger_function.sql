-- Drop existing trigger and function if they exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create the trigger function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  user_role text;
BEGIN
  -- Get the role from user metadata
  user_role := NEW.raw_user_meta_data->>'role';
  
  -- Insert into users table first
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

  -- Insert into role-specific table based on user role
  IF user_role = 'landlord' THEN
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
    
  ELSIF user_role = 'renter' THEN
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
  END IF;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error (you can customize this based on your logging needs)
    RAISE LOG 'Error in handle_new_user: %', SQLERRM;
    -- Re-raise the exception to prevent the user creation if there's an error
    RAISE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.users TO anon, authenticated;
GRANT ALL ON public.landlords TO anon, authenticated;
GRANT ALL ON public.renters TO anon, authenticated;

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.landlords ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.renters ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for users table
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid()::text = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid()::text = id);

-- Create RLS policies for landlords table
CREATE POLICY "Landlords can view own profile" ON public.landlords
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Landlords can update own profile" ON public.landlords
  FOR UPDATE USING (auth.uid()::text = user_id);

-- Create RLS policies for renters table
CREATE POLICY "Renters can view own profile" ON public.renters
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Renters can update own profile" ON public.renters
  FOR UPDATE USING (auth.uid()::text = user_id);

-- Optional: Create policies for viewing other users (for matching, reviews, etc.)
CREATE POLICY "Public profiles viewable by authenticated users" ON public.users
  FOR SELECT USING (
    auth.role() = 'authenticated' AND 
    status = 'active'
  );

CREATE POLICY "Landlord profiles viewable by authenticated users" ON public.landlords
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Renter profiles viewable by authenticated users" ON public.renters
  FOR SELECT USING (auth.role() = 'authenticated');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_status ON public.users(status);
CREATE INDEX IF NOT EXISTS idx_landlords_user_id ON public.landlords(user_id);
CREATE INDEX IF NOT EXISTS idx_renters_user_id ON public.renters(user_id);
CREATE INDEX IF NOT EXISTS idx_renters_budget ON public.renters(budget);
CREATE INDEX IF NOT EXISTS idx_renters_preferred_location_en ON public.renters(preferred_location_en);

-- Create a function to get user profile with role information
CREATE OR REPLACE FUNCTION public.get_user_profile(user_uuid uuid)
RETURNS json AS $$
DECLARE
  user_record record;
  role_record record;
  result json;
BEGIN
  -- Get basic user information
  SELECT * INTO user_record FROM public.users WHERE id = user_uuid::text;
  
  IF NOT FOUND THEN
    RETURN NULL;
  END IF;
  
  -- Check if user is a landlord
  SELECT * INTO role_record FROM public.landlords WHERE user_id = user_uuid::text;
  
  IF FOUND THEN
    result := json_build_object(
      'user', row_to_json(user_record),
      'role', 'landlord',
      'role_data', row_to_json(role_record)
    );
    RETURN result;
  END IF;
  
  -- Check if user is a renter
  SELECT * INTO role_record FROM public.renters WHERE user_id = user_uuid::text;
  
  IF FOUND THEN
    result := json_build_object(
      'user', row_to_json(user_record),
      'role', 'renter',
      'role_data', row_to_json(role_record)
    );
    RETURN result;
  END IF;
  
  -- User has no specific role
  result := json_build_object(
    'user', row_to_json(user_record),
    'role', 'unknown',
    'role_data', NULL
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.get_user_profile(uuid) TO authenticated; 