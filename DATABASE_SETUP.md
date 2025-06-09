# Database Setup Guide

## Overview
This guide explains the three-table database structure for user registration and management:
- `users` - Main user information
- `landlords` - Landlord-specific data  
- `renters` - Renter-specific data

## Database Structure

### 1. Users Table (Main Table)
```sql
CREATE TABLE public.users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name_en TEXT,
  full_name_ar TEXT,
  phone TEXT,
  profile_picture TEXT,
  registration_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'active',
  rating FLOAT8 DEFAULT 0.0,
  identity_verified BOOLEAN DEFAULT FALSE,
  verification_document TEXT,
  average_rating NUMERIC DEFAULT 0.0,
  review_count INT4 DEFAULT 0
);
```

### 2. Landlords Table
```sql
CREATE TABLE public.landlords (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  bank_account TEXT,
  verification_status_en TEXT DEFAULT 'pending',
  verification_status_ar TEXT DEFAULT 'في الانتظار',
  rating FLOAT8 DEFAULT 0.0
);
```

### 3. Renters Table
```sql
CREATE TABLE public.renters (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  preferred_location_en TEXT,
  preferred_location_ar TEXT,
  budget NUMERIC,
  rating FLOAT8 DEFAULT 0.0
);
```

## Installation Steps

### Step 1: Run the SQL Trigger Function
Copy and paste the entire content of `supabase_trigger_function.sql` into your Supabase SQL Editor and run it. This will:
- Create the trigger function `handle_new_user()`
- Set up the trigger on `auth.users`
- Create Row Level Security policies
- Add performance indexes
- Create the `get_user_profile()` helper function

### Step 2: Verify Table Structure
Make sure your tables match the structure shown in the images you provided. The trigger function expects these exact column names.

### Step 3: Test Registration
Try registering a new user to verify the system works correctly.

## How Registration Works

### Registration Flow
1. **User fills registration form** with personal info and role-specific data
2. **Frontend calls AuthContext.signUp()** with metadata
3. **Supabase Auth creates user** in `auth.users` table
4. **Trigger function automatically fires**:
   - Inserts user data into `public.users`
   - Based on role, inserts into `landlords` or `renters` table
   - Links tables via foreign key relationships

### Data Mapping

#### For Landlords:
```javascript
// Form data
const metadata = {
  full_name_en: "John Doe",
  full_name_ar: "جون دو", 
  phone: "+1234567890",
  role: "landlord",
  bank_account: "IBAN123456789",
  company_name: "John's Properties",
  license_number: "LIC123",
  property_address: "123 Main St"
}
```

#### For Renters:
```javascript
// Form data  
const metadata = {
  full_name_en: "Jane Smith",
  full_name_ar: "جين سميث",
  phone: "+1234567890", 
  role: "renter",
  preferred_location_en: "Downtown",
  preferred_location_ar: "وسط المدينة",
  budget: 1500,
  desired_move_in_date: "2024-01-01"
}
```

## Database Relationships

```
auth.users (Supabase Auth)
    ↓ (triggers)
public.users (Main user data)
    ↓ (FK: user_id)
    ├── public.landlords (Landlord-specific data)
    └── public.renters (Renter-specific data)
```

## Key Features

### Automatic Profile Creation
- No manual profile creation needed
- Trigger handles all database insertions
- Maintains referential integrity

### Role-Based Data Storage
- Common data in `users` table
- Role-specific data in separate tables
- Clean separation of concerns

### Security
- Row Level Security (RLS) enabled
- Users can only access their own data
- Authenticated users can view public profiles

### Helper Functions
- `get_user_profile(uuid)` - Returns complete user profile with role data
- Combines data from multiple tables in single call
- Returns JSON with user, role, and role-specific data

## Usage Examples

### Getting User Profile
```typescript
const { data: profile } = await supabase.rpc('get_user_profile', {
  user_uuid: userId
});

// Returns:
{
  user: { /* user table data */ },
  role: "landlord",
  role_data: { /* landlord table data */ }
}
```

### Updating Profiles
```typescript
// Update main user data
await supabase
  .from('users')
  .update({ full_name_en: 'New Name' })
  .eq('id', userId);

// Update role-specific data
await supabase
  .from('landlords')
  .update({ bank_account: 'NEW_IBAN' })
  .eq('user_id', userId);
```

## Error Handling

The trigger function includes comprehensive error handling:
- Logs errors for debugging
- Prevents incomplete user creation
- Maintains database consistency
- Rolls back on failures

## Performance Considerations

- Indexes on frequently queried columns
- Efficient foreign key relationships
- Single RPC call for complete profiles
- Optimized for read operations

## Troubleshooting

### Common Issues

1. **Registration fails**: Check if all required fields are provided
2. **Profile not found**: Ensure trigger function is properly installed
3. **Permission errors**: Verify RLS policies are correctly set up
4. **Role data missing**: Check if user metadata contains valid role

### Debug Queries

```sql
-- Check if user exists in all tables
SELECT 
  u.id, u.email, u.full_name_en,
  CASE 
    WHEN l.user_id IS NOT NULL THEN 'landlord'
    WHEN r.user_id IS NOT NULL THEN 'renter'
    ELSE 'unknown'
  END as role
FROM users u
LEFT JOIN landlords l ON u.id = l.user_id  
LEFT JOIN renters r ON u.id = r.user_id
WHERE u.email = 'user@example.com';
```

This setup provides a robust, scalable foundation for user management with clear role separation and excellent performance characteristics. 