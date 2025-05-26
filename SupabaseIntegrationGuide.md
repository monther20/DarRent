# Supabase Integration Guide for DarRent Project

This guide provides a comprehensive walkthrough for integrating Supabase into the DarRent project. It covers client setup, secure key management, client initialization, and a practical example of integrating Supabase authentication.

## 1. Introduction to Supabase

Supabase is an open-source Firebase alternative. It provides a suite of tools to build backends quickly, including a PostgreSQL database, authentication, instant APIs, edge functions, real-time subscriptions, and storage.

For the DarRent project, Supabase can handle:
- User authentication (sign-up, sign-in, sign-out, password recovery)
- Database storage for properties, rental agreements, user profiles, reviews, etc.
- Real-time updates for new listings or messages.
- File storage for property images or user profile pictures.

## 2. Supabase Client Library

The project already utilizes the recommended Supabase client library for JavaScript/TypeScript applications:

- **`@supabase/supabase-js`**: Version `^2.49.4` is currently installed, as seen in your [`package.json`](package.json:27).

This library is suitable for React Native projects when paired with necessary polyfills and storage adapters, which are also correctly set up:
- `react-native-url-polyfill` (as seen in [`lib/supabase.ts`](lib/supabase.ts:1) and [`package.json`](package.json:76))
- `@react-native-async-storage/async-storage` (as seen in [`lib/supabase.ts`](lib/supabase.ts:3) and [`package.json`](package.json:18))

No changes are needed for the client library selection.

## 3. Secure Management of Supabase Credentials

Security is paramount when dealing with API keys and project URLs. The DarRent project correctly manages these credentials using environment variables.

**Supabase Project URL and Anon Key:**
- These are stored as `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`.
- The `EXPO_PUBLIC_` prefix makes them available in your Expo application's client-side code.
- **Best Practice:** These keys should be stored in an `.env` file at the root of your project. This file should be added to your `.gitignore` to prevent committing sensitive information to your repository.

Example `.env` file structure:
```env
EXPO_PUBLIC_SUPABASE_URL="your-supabase-project-url"
EXPO_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
```

The application accesses these variables in two ways:
1. Directly via `process.env` in [`lib/supabase.ts`](lib/supabase.ts:1):
   ```typescript
   const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
   const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;
   ```
2. Through a configuration file [`config/env.ts`](config/env.ts:1):
   ```typescript
   export const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
   export const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';
   ```
Both methods are valid. Using `process.env` directly in the Supabase client initialization is common.

**Important Note on Anon Key:** The "anon" key is safe to be used in client-side applications. It allows anonymous access to your database *according to the Row Level Security (RLS) policies you define* in your Supabase dashboard. Ensure RLS is enabled and properly configured for all your tables.

**Service Key:** For operations requiring administrative privileges (e.g., in a backend script or serverless function, not in the client app), you would use the `service_role` key. **NEVER expose the `service_role` key in your client-side application.**

## 4. Supabase Client Initialization

The Supabase client is already correctly initialized in [`lib/supabase.ts`](lib/supabase.ts:1). This setup is well-configured for a React Native environment.

Key aspects of the current initialization:
```typescript
import 'react-native-url-polyfill/auto'; // Polyfill for URL features
import AsyncStorage from '@react-native-async-storage/async-storage'; // For session persistence
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage, // Use AsyncStorage for storing session data
    autoRefreshToken: true, // Automatically refresh auth tokens
    persistSession: true, // Persist sessions across app restarts
    detectSessionInUrl: false, // Not typically used in React Native
  },
});
```
This `supabase` client instance can be imported and used throughout your application for interacting with Supabase services.

## 5. Integrating Supabase Authentication into `AuthContext`

The existing [`app/contexts/AuthContext.tsx`](app/contexts/AuthContext.tsx:1) uses mock authentication. We will now update it to use Supabase for user authentication.

**User Interface (`User` type):**
The current `User` interface in [`app/contexts/AuthContext.tsx`](app/contexts/AuthContext.tsx:6) is:
```typescript
interface User {
  id: string;
  name: string; // Supabase user object has `user_metadata` for custom fields like name
  email: string;
  phone: string; // Supabase user object has `phone`
  profileImage: string | null; // Custom, store in `user_metadata` or a separate table
  role: UserRole; // Custom, store in `user_metadata` or a separate table
}
```
Supabase's `User` object (from `supabase.auth.getUser()`) has a standard structure. Custom fields like `name`, `profileImage`, and `role` are typically stored in the `user_metadata` object within the Supabase user record or in a separate `profiles` table linked by user ID. For this guide, we'll assume `name`, `role`, and `profileImage` will be part of `user_metadata`.

**Updated `AuthContext.tsx`:**

Here's how you can modify [`app/contexts/AuthContext.tsx`](app/contexts/AuthContext.tsx:1) to integrate Supabase:

```typescript
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabase'; // Adjust path if necessary
// AsyncStorage is no longer directly needed here for session management, Supabase client handles it.

type UserRole = 'landlord' | 'renter';

// Updated User interface to align with Supabase and custom metadata
interface User {
  id: string;
  email?: string; // Supabase user email
  phone?: string; // Supabase user phone
  name?: string; // From user_metadata
  profileImage?: string | null; // From user_metadata
  role?: UserRole; // From user_metadata
  // Add any other fields you expect from Supabase user object or user_metadata
}

interface AuthContextType {
  user: User | null;
  session: Session | null; // Expose Supabase session
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: any }>;
  logout: () => Promise<void>;
  register: (
    userData: { email: string; password: string; name: string; phone: string; role: UserRole }
  ) => Promise<{ success: boolean; error?: any; user?: User | null }>;
  // changePassword and updateProfile will also use Supabase
  changePassword: (newPassword: string) => Promise<{ success: boolean; error?: any }>;
  updateProfile: (profileData: { name?: string; phone?: string; profileImage?: string }) => Promise<{ success: boolean; error?: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        setSession(currentSession);
        if (currentSession?.user) {
          setUser(mapSupabaseUserToAppUser(currentSession.user));
        }
      } catch (error) {
        console.error('Error fetching session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        setSession(newSession);
        if (newSession?.user) {
          setUser(mapSupabaseUserToAppUser(newSession.user));
        } else {
          setUser(null);
        }
        setIsLoading(false);
      }
    );

    return () => {
      authListener?.unsubscribe();
    };
  }, []);

  const mapSupabaseUserToAppUser = (supabaseUser: SupabaseUser): User => {
    return {
      id: supabaseUser.id,
      email: supabaseUser.email,
      phone: supabaseUser.phone,
      name: supabaseUser.user_metadata?.name,
      profileImage: supabaseUser.user_metadata?.profileImage,
      role: supabaseUser.user_metadata?.role as UserRole,
    };
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      if (data.user) setUser(mapSupabaseUserToAppUser(data.user));
      setSession(data.session);
      return { success: true };
    } catch (error: any) {
      console.error('Login error:', error);
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: { email: string; password: string; name: string; phone: string; role: UserRole }) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: { // This data is stored in user_metadata
            name: userData.name,
            phone: userData.phone,
            role: userData.role,
            profileImage: null, // Default profile image or handle separately
          },
        },
      });
      if (error) throw error;
      // Note: Supabase might require email confirmation. 
      // If so, data.user might be null until confirmed.
      // The onAuthStateChange listener will handle setting the user once confirmed and logged in.
      if (data.user) {
         const appUser = mapSupabaseUserToAppUser(data.user);
         setUser(appUser);
         setSession(data.session);
         return { success: true, user: appUser };
      }
      return { success: true, user: null }; // Indicate success, user might need to confirm email
    } catch (error: any) {
      console.error('Registration error:', error);
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      setSession(null);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const changePassword = async (newPassword: string) => {
    setIsLoading(true);
    try {
      if (!session?.user) throw new Error('User not logged in');
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      console.error('Change password error:', error);
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (profileData: { name?: string; phone?: string; profileImage?: string }) => {
    setIsLoading(true);
    try {
      if (!session?.user) throw new Error('User not logged in');
      const { data, error } = await supabase.auth.updateUser({
        data: profileData, // Updates user_metadata
      });
      if (error) throw error;
      if (data.user) setUser(mapSupabaseUserToAppUser(data.user));
      return { success: true };
    } catch (error: any) {
      console.error('Update profile error:', error);
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        login,
        logout,
        register,
        changePassword,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Default export is not typically needed if you export AuthProvider and useAuth
// export default AuthContext; 
```

**Key changes and considerations for `AuthContext.tsx`:**
- **Import `supabase`**: The initialized Supabase client from [`lib/supabase.ts`](lib/supabase.ts:1).
- **Session Management**: Supabase client handles session persistence using `AsyncStorage` (as configured). The `AuthContext` now listens to `onAuthStateChange` to reactively update the user state.
- **`mapSupabaseUserToAppUser`**: A helper function to transform the Supabase user object (which might include `user_metadata`) into your application's `User` type.
- **`login` function**: Uses `supabase.auth.signInWithPassword()`.
- **`register` function**: Uses `supabase.auth.signUp()`.
    - `options.data`: Used to store custom user attributes like `name`, `role`, `phone` in `auth.users.user_metadata`.
    - **Email Confirmation**: By default, Supabase sends a confirmation email for new sign-ups. You'll need to handle this flow in your UI (e.g., inform the user to check their email). The user won't be fully logged in until confirmed.
- **`logout` function**: Uses `supabase.auth.signOut()`.
- **`changePassword` function**: Uses `supabase.auth.updateUser({ password: newPassword })`. This requires the user to be logged in.
- **`updateProfile` function**: Uses `supabase.auth.updateUser({ data: profileData })` to update fields in `user_metadata`.
- **Error Handling**: The functions now return `{ success: boolean, error?: any }` to allow UI components to react to outcomes.
- **Loading State**: `isLoading` is managed during auth operations.

**To apply these changes:**
1.  Replace the content of your existing [`app/contexts/AuthContext.tsx`](app/contexts/AuthContext.tsx:1) with the code provided above.
2.  Ensure the path to `../../lib/supabase` is correct based on your file structure.
3.  In your Supabase project settings (Authentication > Providers), ensure Email/Password authentication is enabled.
4.  Configure email templates in Supabase (Authentication > Email Templates) if you want to customize the confirmation, password reset emails, etc.

## 6. Other Core Supabase Operations (CRUD, Real-time)

Once authentication is set up, you can interact with your Supabase database.

### a. CRUD Operations

Supabase provides a simple API for Create, Read, Update, and Delete (CRUD) operations on your PostgreSQL database.

**Example: Fetching Properties**
Assuming you have a `properties` table:

```typescript
import { supabase } from '../../lib/supabase'; // or your path

interface Property {
  id: string;
  title: string;
  address: string;
  rent: number;
  // ... other fields
}

async function fetchProperties(): Promise<Property[]> {
  const { data, error } = await supabase
    .from('properties')
    .select('*'); // Selects all columns

  if (error) {
    console.error('Error fetching properties:', error);
    return [];
  }
  return data as Property[];
}

// Example: Fetching properties for a specific landlord (assuming a user_id column)
async function fetchLandlordProperties(userId: string): Promise<Property[]> {
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('user_id', userId); // Filter by user_id

  if (error) {
    console.error('Error fetching landlord properties:', error);
    return [];
  }
  return data as Property[];
}
```

**Example: Creating a new Property**

```typescript
async function createProperty(propertyData: Omit<Property, 'id'>, userId: string): Promise<Property | null> {
  const { data, error } = await supabase
    .from('properties')
    .insert([{ ...propertyData, user_id: userId }]) // Ensure user_id is set if required by RLS
    .select()
    .single(); // Returns the created record

  if (error) {
    console.error('Error creating property:', error);
    return null;
  }
  return data as Property;
}
```

**Row Level Security (RLS):**
- **CRITICAL**: Enable RLS on all tables that contain sensitive or user-specific data.
- Define policies to control who can access or modify data. For example:
    - Users can only see their own profile data.
    - Landlords can only create/update/delete their own properties.
    - Authenticated users can view all (or filtered) properties.

### b. Real-time Data Handling

Supabase allows you to subscribe to database changes in real-time.

**Example: Listening for new properties**

```typescript
import { supabase } from '../../lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

let propertyChannel: RealtimeChannel | null = null;

function subscribeToNewProperties(callback: (newProperty: Property) => void) {
  propertyChannel = supabase
    .channel('public:properties') // Unique channel name
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'properties' },
      (payload) => {
        console.log('New property added:', payload.new);
        callback(payload.new as Property);
      }
    )
    .subscribe((status, err) => {
      if (status === 'SUBSCRIBED') {
        console.log('Subscribed to new properties!');
      }
      if (err) {
        console.error('Error subscribing to properties:', err);
      }
    });
}

function unsubscribeFromProperties() {
  if (propertyChannel) {
    supabase.removeChannel(propertyChannel);
    propertyChannel = null;
    console.log('Unsubscribed from properties');
  }
}

// Usage in a React component:
// useEffect(() => {
//   subscribeToNewProperties((newProperty) => {
//     // Update your component's state with the new property
//   });
//   return () => {
//     unsubscribeFromProperties();
//   };
// }, []);
```
- Ensure your table has "Enable Realtime" toggled on in the Supabase dashboard (Database > Replication).

## 7. Best Practices and Next Steps

- **Row Level Security (RLS)**: Re-emphasizing, RLS is crucial. Spend time defining robust policies for all your tables.
- **Error Handling**: Implement comprehensive error handling in your UI to inform users of any issues during Supabase operations.
- **Data Validation**: Validate data on the client-side before sending it to Supabase, and consider server-side validation using database constraints or Edge Functions.
- **User Experience for Auth**:
    - Provide clear feedback during login, registration (e.g., "Check your email to confirm account").
    - Implement password reset functionality using `supabase.auth.resetPasswordForEmail()`.
    - Consider social logins (Google, Apple, etc.) supported by Supabase for easier onboarding.
- **State Management**: For complex applications, integrate Supabase calls with your existing state management solution (like Zustand, Redux, or React Query/TanStack Query) for caching, optimistic updates, etc. React Query is particularly well-suited for managing server state.
- **Testing**: Write tests for your authentication flow and data interaction logic.
- **Supabase Documentation**: Refer to the official [Supabase documentation](https://supabase.com/docs) for detailed information on all features.

This guide provides a solid foundation for integrating Supabase into the DarRent project. By following these steps and best practices, you can build a secure and scalable backend for your application.