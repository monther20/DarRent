# Supabase Setup Guide for DarRent Project

This guide will help you set up and connect Supabase to your React Native/Expo project. The steps are based on your existing SQL files and project structure.

## Prerequisites
- A Supabase account (if you don't have one, create it at https://supabase.com)
- Your project's Supabase URL and anon key

## Step 1: Database Schema Setup
1. Run the following SQL files in order in your Supabase SQL editor:
   ```
   01_users_data.sql
   02_properties_data.sql
   03_contracts_data.sql
   04_interactions_data.sql
   05_maintenance_data.sql
   06_api_functions.sql
   07_database_triggers.sql
   ```

2. Then run the enhancement files:
   ```
   01_schema_enhancements.sql
   02_property_videos.sql
   03_property_viewings.sql
   04_reviews.sql
   05_contract_comments.sql
   06_new_triggers.sql
   ```

3. Finally, run the system-specific files:
   ```
   property_viewing_management_fixed.sql
   property_video_management.sql
   review_system.sql
   contract_comments_system.sql
   required_triggers.sql
   ```

## Step 2: Environment Setup
1. Create a `.env` file in your project root
2. Add the following variables:
```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Step 3: Create Supabase Client
1. Create a new file at `lib/supabase.ts` with the following structure:
```typescript
import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
```

## Step 4: Authentication Setup
1. Configure authentication in Supabase dashboard:
   - Enable Email/Password authentication
   - Set up email templates for:
     - Confirmation emails
     - Password reset
     - Magic link login

2. Create auth hooks in `app/hooks/useAuth.ts` for:
   - Sign up
   - Sign in
   - Sign out
   - Password reset
   - Session management

## Step 5: Feature-Specific Setup

### Property Management
1. Set up storage buckets for:
   - Property images
   - Property videos
   - User profile pictures

2. Configure RLS policies for:
   - Property listings
   - Property viewings
   - Property videos

### Contract System
1. Set up RLS policies for:
   - Contract creation
   - Contract comments
   - Contract status updates

### Review System
1. Configure RLS policies for:
   - Review submission
   - Review updates
   - Review deletion

### Chat System
1. Enable real-time features for:
   - Chat messages
   - Notifications
   - Status updates

## Step 6: Testing
1. Test authentication flows:
   - User registration
   - User login
   - Password reset

2. Test property features:
   - Property listing creation
   - Property viewing scheduling
   - Property video upload

3. Test contract features:
   - Contract creation
   - Contract comments
   - Contract status updates

4. Test review system:
   - Review submission
   - Review updates
   - Review display

## Manual Steps Required
The following steps require manual intervention:

1. Creating a Supabase account and project
2. Getting your project URL and anon key
3. Running the SQL files in the correct order
4. Setting up environment variables
5. Configuring authentication providers
6. Setting up storage buckets
7. Configuring security policies

## Next Steps
After completing the setup, you can:
1. Implement the authentication flows in your app
2. Set up property management features
3. Implement the contract system
4. Set up the review system
5. Configure the chat system

Would you like to proceed with any specific step? Let me know which step you'd like to implement first, and I'll help you with the code and configuration. 