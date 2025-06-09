import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Session, AuthError } from '@supabase/supabase-js';
import { ExtendedUser, AuthContextType } from '../types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user profile data using the custom function
  const fetchUserProfile = async (userId: string, userEmail: string): Promise<ExtendedUser | null> => {
    try {
      // Use the custom function to get complete user profile with role data
      const { data: profileData, error } = await supabase.rpc('get_user_profile', {
        user_uuid: userId
      });

      if (error) {
        console.warn('Profile not found, user may be newly created:', error.message);
        // Fallback to auth metadata
        const { data: { user } } = await supabase.auth.getUser();
        const role = user?.user_metadata?.role || 'unknown';

        return {
          id: userId,
          email: userEmail,
          role: role,
        } as ExtendedUser;
      }

      if (!profileData) {
        console.warn('No profile data returned');
        return {
          id: userId,
          email: userEmail,
          role: 'unknown',
        } as ExtendedUser;
      }

      // Extract user data from the response
      const userData = profileData.user;
      const userRole = profileData.role;

      return {
        id: userId,
        email: userEmail,
        role: userRole,
        full_name: userData.full_name_en,
        phone: userData.phone,
        profile_picture: userData.profile_picture,
        // Include role-specific data
        roleData: profileData.role_data,
      } as ExtendedUser;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  };

  // Handle auth state changes
  const handleAuthStateChange = async (event: string, session: Session | null) => {
    console.log('Auth state changed:', event, session?.user?.email);

    setSession(session);

    if (session?.user) {
      const extendedUser = await fetchUserProfile(session.user.id, session.user.email || '');
      setUser(extendedUser);
    } else {
      setUser(null);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    // Get initial session
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Error getting initial session:', error);
          setIsLoading(false);
          return;
        }

        await handleAuthStateChange('INITIAL_SESSION', session);
      } catch (error) {
        console.error('Error initializing auth:', error);
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthStateChange);

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Attempting to sign in with:', { email });

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password,
      });

      if (error) {
        console.error('Sign in error:', error);
        return { error };
      }

      console.log('Successfully signed in:', data.user?.email);
      return { error: null };
    } catch (error: any) {
      console.error('Sign in error:', error);
      return { error };
    }
  };

  const signUp = async (email: string, password: string, metadata: any) => {
    try {
      console.log('Attempting to sign up with:', {
        email,
        metadata: JSON.stringify(metadata, null, 2),
        supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL?.substring(0, 20) + '...',
        hasAnonKey: !!process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
      });

      // Validate environment variables
      if (!process.env.EXPO_PUBLIC_SUPABASE_URL) {
        throw new Error('EXPO_PUBLIC_SUPABASE_URL is not configured');
      }
      if (!process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY) {
        throw new Error('EXPO_PUBLIC_SUPABASE_ANON_KEY is not configured');
      }

      // Clean up metadata to ensure it's JSON serializable
      const cleanMetadata = {
        full_name: metadata.full_name,
        role: metadata.role,
        phone: metadata.phone,
        fullNameAr: metadata.fullNameAr,
        ...(metadata.role === 'landlord' && {
          companyName: metadata.companyName,
          licenseNumber: metadata.licenseNumber,
          bankAccountDetails: metadata.bankAccountDetails,
          propertyAddress: metadata.propertyAddress,
        }),
        ...(metadata.role === 'renter' && {
          preferredLocationEn: metadata.preferredLocationEn,
          preferredLocationAr: metadata.preferredLocationAr,
          budget: metadata.budget,
          desiredMoveInDate: metadata.desiredMoveInDate,
        }),
      };

      console.log('Cleaned metadata:', JSON.stringify(cleanMetadata, null, 2));

      const { data, error } = await supabase.auth.signUp({
        email: email.toLowerCase().trim(),
        password,
        options: {
          data: cleanMetadata,
        },
      });

      if (error) {
        console.error('Sign up error:', error);
        console.error('Error details:', {
          name: error.name,
          message: error.message,
          status: error.status || 'unknown',
        });
        return { error };
      }

      // User profile creation is handled by Supabase trigger function
      // The trigger automatically inserts into public.users table using raw_user_meta_data
      console.log('User profile will be created automatically by Supabase trigger');

      console.log('Successfully signed up:', data.user?.email);
      return { error: null };
    } catch (error: any) {
      console.error('Sign up error:', error);
      return { error };
    }
  };

  const signOut = async () => {
    try {
      console.log('Attempting to sign out');

      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error('Sign out error:', error);
        return { error };
      }

      console.log('Successfully signed out');
      return { error: null };
    } catch (error: any) {
      console.error('Error signing out:', error);
      return { error };
    }
  };

  const refreshSession = async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();

      if (error) {
        console.error('Error refreshing session:', error);
        return;
      }

      console.log('Session refreshed successfully');
    } catch (error) {
      console.error('Error refreshing session:', error);
    }
  };

  const value = {
    user,
    session,
    isLoading,
    isLoggedIn: !!session,
    signIn,
    signUp,
    signOut,
    refreshSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
