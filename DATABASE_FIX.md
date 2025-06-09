# Database Integration Fix

## Issue
The registration was throwing a "JSON Parse error: Unexpected end of input" because the authentication code was trying to manually insert into a `profiles` table, but the Supabase setup uses a `users` table with an automatic trigger function.

## Root Cause
- AuthContext was trying to manually create profiles in a `profiles` table
- But the Supabase setup has a trigger function that automatically inserts into `public.users` table
- This mismatch caused conflicts and JSON parsing errors

## Fix Applied

### 1. Updated AuthContext to Work with Trigger Function
**Before:**
```typescript
// Manually inserting into profiles table
const { error: profileError } = await supabase
  .from('profiles')
  .insert({
    id: data.user.id,
    full_name: metadata.full_name,
    role: metadata.role,
    email: data.user.email,
    phone: metadata.phone,
    created_at: new Date().toISOString(),
  });
```

**After:**
```typescript
// Let the trigger handle profile creation automatically
console.log('User profile will be created automatically by Supabase trigger');
```

### 2. Updated Profile Fetching to Use Correct Table
**Before:**
```typescript
// Querying profiles table
const { data: profile, error } = await supabase
  .from('profiles')
  .select('full_name, phone, role')
  .eq('id', userId)
  .single();
```

**After:**
```typescript
// Querying users table and getting role from auth metadata
const { data: profile, error } = await supabase
  .from('users')
  .select('full_name, phone, profile_picture, status')
  .eq('id', userId)
  .single();

// Get role from auth metadata since it's not in users table
const { data: { user } } = await supabase.auth.getUser();
const role = user?.user_metadata?.role || 'unknown';
```

### 3. Updated Auth Service Functions
- `getUserProfile()`: Now queries `users` table and gets role from auth metadata
- `updateUserProfile()`: Updates `users` table and auth metadata separately
- `createUserProfile()`: Simplified since trigger handles creation

## Database Schema Alignment

Your Supabase setup:
```sql
-- Users table
CREATE TABLE public.users (
  id UUID REFERENCES auth.users ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  phone TEXT,
  profile_picture TEXT,
  registration_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'active',
  PRIMARY KEY (id)
);

-- Trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (
    id, email, full_name, phone, profile_picture, registration_date, status
  )
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'profile_picture',
    NOW(),
    'active'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Key Changes Made

1. **Removed Manual Profile Creation**: No longer trying to manually insert profiles
2. **Updated Table References**: Changed from `profiles` to `users` table
3. **Role Handling**: Roles are stored in auth metadata, not database table
4. **Trigger Dependency**: Relies on Supabase trigger for automatic profile creation
5. **Error Prevention**: Eliminates the JSON parse error by avoiding table conflicts

## What This Fixes

✅ **Registration JSON Error**: Resolves "JSON Parse error: Unexpected end of input"
✅ **Profile Creation**: Automatic profile creation via trigger
✅ **Data Consistency**: Proper alignment with existing database schema
✅ **Role Management**: Roles stored in secure auth metadata
✅ **Update Operations**: Profile updates work with correct table structure

## Testing Registration Now

1. **Fill Registration Form**: Complete all required fields
2. **Submit Registration**: Should work without JSON errors
3. **Automatic Profile**: Profile created automatically by trigger
4. **Role Assignment**: Role stored in auth metadata
5. **Data Storage**: Basic profile data in `users` table

## Metadata Storage

The registration form data is now properly stored:
- **Basic Info**: `full_name`, `phone`, `email` in `users` table
- **Role**: Stored in `auth.users.raw_user_meta_data`
- **Extended Data**: Additional fields in auth metadata
- **Landlord Data**: Company info, license, bank details in metadata
- **Renter Data**: Preferences, budget, move-in date in metadata

The fix ensures proper integration with your existing Supabase trigger function while maintaining all the registration functionality. 