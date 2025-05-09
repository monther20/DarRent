-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    new_user_id UUID;
BEGIN
    -- Insert into users table
    INSERT INTO public.users (
        id,
        email,
        full_name,
        phone_number,
        role,
        created_at,
        updated_at
    ) VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'phone_number', ''),
        COALESCE(NEW.raw_user_meta_data->>'role', 'renter'),
        NOW(),
        NOW()
    )
    RETURNING id INTO new_user_id;

    -- If user is a landlord, create landlord record
    IF NEW.raw_user_meta_data->>'role' = 'landlord' THEN
        INSERT INTO public.landlords (
            user_id,
            company_name,
            license_number,
            created_at,
            updated_at
        ) VALUES (
            new_user_id,
            COALESCE(NEW.raw_user_meta_data->>'company_name', ''),
            COALESCE(NEW.raw_user_meta_data->>'license_number', ''),
            NOW(),
            NOW()
        );
    END IF;

    -- If user is a renter, create renter record
    IF NEW.raw_user_meta_data->>'role' = 'renter' THEN
        INSERT INTO public.renters (
            user_id,
            employment_status,
            income,
            created_at,
            updated_at
        ) VALUES (
            new_user_id,
            COALESCE(NEW.raw_user_meta_data->>'employment_status', ''),
            COALESCE((NEW.raw_user_meta_data->>'income')::numeric, 0),
            NOW(),
            NOW()
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create user records
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Function to handle user deletion
CREATE OR REPLACE FUNCTION public.handle_user_deletion()
RETURNS TRIGGER AS $$
BEGIN
    -- Delete from users table (this will cascade to landlords and renters)
    DELETE FROM public.users WHERE id = OLD.id;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to handle user deletion
CREATE OR REPLACE TRIGGER on_auth_user_deleted
    AFTER DELETE ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_user_deletion();

-- Function to handle user updates
CREATE OR REPLACE FUNCTION public.handle_user_update()
RETURNS TRIGGER AS $$
BEGIN
    -- Update users table
    UPDATE public.users
    SET 
        email = NEW.email,
        full_name = COALESCE(NEW.raw_user_meta_data->>'full_name', users.full_name),
        phone_number = COALESCE(NEW.raw_user_meta_data->>'phone_number', users.phone_number),
        role = COALESCE(NEW.raw_user_meta_data->>'role', users.role),
        updated_at = NOW()
    WHERE id = NEW.id;

    -- Update landlord record if exists
    IF NEW.raw_user_meta_data->>'role' = 'landlord' THEN
        UPDATE public.landlords
        SET 
            company_name = COALESCE(NEW.raw_user_meta_data->>'company_name', landlords.company_name),
            license_number = COALESCE(NEW.raw_user_meta_data->>'license_number', landlords.license_number),
            updated_at = NOW()
        WHERE user_id = NEW.id;
    END IF;

    -- Update renter record if exists
    IF NEW.raw_user_meta_data->>'role' = 'renter' THEN
        UPDATE public.renters
        SET 
            employment_status = COALESCE(NEW.raw_user_meta_data->>'employment_status', renters.employment_status),
            income = COALESCE((NEW.raw_user_meta_data->>'income')::numeric, renters.income),
            updated_at = NOW()
        WHERE user_id = NEW.id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to handle user updates
CREATE OR REPLACE TRIGGER on_auth_user_updated
    AFTER UPDATE ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_user_update(); 