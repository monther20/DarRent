# Authentication System Documentation

## Overview

This application now uses **real Supabase authentication** instead of the previous mock authentication system. The implementation provides secure user authentication, session management, and user profile handling.

## Key Components

### 1. AuthContext (`contexts/AuthContext.tsx`)
The main authentication context that provides:
- User authentication state
- Session management
- Authentication methods (signIn, signUp, signOut)
- Automatic token refresh
- Session persistence using AsyncStorage

### 2. AuthService (`services/auth.service.ts`)
A comprehensive service class that handles:
- User registration with profile creation
- Sign in/out operations
- Session management and refresh
- User profile CRUD operations
- Password reset functionality
- Error handling and logging

### 3. Authentication Types (`types/auth.ts`)
Centralized type definitions for:
- ExtendedUser interface
- UserProfile interface
- AuthContextType
- Authentication response types

## Features Implemented

### ✅ Real Authentication
- **Supabase Auth Integration**: Uses `@supabase/supabase-js` for real authentication
- **Email/Password Authentication**: Secure sign-in and sign-up
- **Session Persistence**: Automatic session restoration on app restart
- **Token Refresh**: Automatic token refresh to maintain sessions

### ✅ User Profile Management
- **Profile Creation**: Automatic profile creation in `profiles` table on sign-up
- **Role-Based Access**: Support for 'landlord', 'renter', and 'unknown' roles
- **Profile Updates**: Update user information and profile data
- **Profile Sync**: Synchronization between auth metadata and database profiles

### ✅ Security Features
- **Secure Storage**: Uses AsyncStorage for secure session storage
- **Input Validation**: Email normalization and input sanitization
- **Error Handling**: Comprehensive error handling with proper logging
- **Session Security**: Proper session invalidation on sign-out

### ✅ Developer Experience
- **TypeScript Support**: Full type safety with comprehensive interfaces
- **Error Logging**: Detailed console logging for debugging
- **Consistent API**: Standardized response format across all auth operations
- **Fallback Handling**: Graceful handling of missing profiles or network issues

## Migration from Mock Auth

### What Was Removed
- ✅ `services/mockAuth.service.ts` - Mock authentication service
- ✅ Mock user data dependencies in authentication
- ✅ LocalStorage-based session simulation
- ✅ Hardcoded user roles from mock data

### What Was Added
- ✅ Real Supabase authentication integration
- ✅ Database-backed user profiles
- ✅ Automatic session management
- ✅ Comprehensive error handling
- ✅ Type-safe authentication interfaces

## Usage Examples

### Sign In
```typescript
const { signIn } = useAuth();

const handleSignIn = async () => {
  const { error } = await signIn(email, password);
  if (error) {
    console.error('Sign in failed:', error.message);
  }
};
```

### Sign Up
```typescript
const { signUp } = useAuth();

const handleSignUp = async () => {
  const { error } = await signUp(email, password, {
    full_name: 'John Doe',
    role: 'renter'
  });
  if (error) {
    console.error('Sign up failed:', error.message);
  }
};
```

### Profile Updates
```typescript
import { authService } from '../services/auth.service';

const updateProfile = async () => {
  const { data, error } = await authService.updateUserProfile(userId, {
    full_name: 'New Name',
    phone: '+1234567890',
    role: 'landlord'
  });
};
```

## Database Schema Requirements

The authentication system works with a `users` table and Supabase trigger function:

### Users Table:
```sql
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
```

### Trigger Function:
```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (
    id,
    email,
    full_name,
    phone,
    profile_picture,
    registration_date,
    status
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

-- Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
```

Note: User roles are stored in Supabase auth metadata, not in the users table.

## Environment Variables

Ensure these environment variables are set:

```bash
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Error Handling

The system implements comprehensive error handling:

- **Network errors**: Graceful handling of connection issues
- **Authentication errors**: Clear error messages for invalid credentials
- **Profile errors**: Fallback to basic user info if profile is missing
- **Session errors**: Automatic retry and refresh mechanisms

## Session Management

- **Automatic Refresh**: Sessions are automatically refreshed before expiration
- **Persistent Storage**: Sessions persist across app restarts
- **Real-time Updates**: Auth state changes are propagated immediately
- **Secure Cleanup**: Proper cleanup on sign-out and errors

## Security Considerations

- Email addresses are normalized (lowercase, trimmed)
- Passwords are handled securely by Supabase
- Sessions are stored securely using AsyncStorage
- Row Level Security (RLS) protects user data
- Input validation prevents common attacks

## Troubleshooting

### Common Issues

1. **Profile not found**: 
   - Check if profiles table exists
   - Verify RLS policies are correct
   - Ensure profile creation triggers are working

2. **Session not persisting**:
   - Check AsyncStorage permissions
   - Verify Supabase client configuration
   - Check network connectivity

3. **Role not updating**:
   - Verify profile table updates
   - Check auth metadata sync
   - Refresh the session after updates

### Debug Logging

The system includes comprehensive logging. Check console for:
- Authentication state changes
- Profile fetch operations
- Error messages with context
- Session management events

## Next Steps

Consider implementing:
- Social authentication (Google, Apple)
- Two-factor authentication
- Email verification flows
- Advanced role management
- Audit logging for security events 