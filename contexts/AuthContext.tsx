import React, { createContext, useContext, useEffect, useState } from 'react';
// import { supabase } from '../lib/supabase';
import { Session, User } from '@supabase/supabase-js';
import { mockAuth } from '../services/mockAuth.service';
import { mockUsers } from '../services/mockData';

// Extend the User type to include role
interface ExtendedUser extends User {
  role?: 'landlord' | 'renter' | 'unknown';
}

type AuthContextType = {
  user: ExtendedUser | null;
  session: Session | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, metadata: any) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    mockAuth.getSession().then(({ data: { session } }) => {
      console.log('Initial session:', session);
      setSession(session);

      const userEmail = session?.user?.email;
      if (session?.user && userEmail) {
        // Find the user in mock data to get their role
        const mockUser = mockUsers.find((u) => u.email.toLowerCase() === userEmail.toLowerCase());
        if (mockUser) {
          console.log('Found user in mock data during init:', mockUser.fullName, mockUser.role);
          // Create an extended user with role
          const extendedUser = {
            ...session.user,
            role: mockUser.role,
          } as ExtendedUser;
          setUser(extendedUser);
        } else {
          setUser(session.user as ExtendedUser);
        }
      } else {
        setUser(null);
      }

      setIsLoading(false);
    });

    // Since we're using mock auth, we don't need real-time auth state changes
    // but we'll keep the structure similar for easy switching back later
    return () => {
      // No cleanup needed for mock
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Attempting to sign in with:', { email });

      const { data, error } = await mockAuth.signIn(email, password);

      console.log('Mock auth sign in response:', {
        data: {
          user: data?.user,
          session: data?.session,
        },
        error,
      });

      if (error) {
        console.error('Sign in error:', error);
        return { error };
      }

      // Update local state
      setSession(data.session);

      // Add additional user data from mock users
      if (data.user) {
        const mockUser = mockUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
        if (mockUser) {
          console.log('Found matching mock user:', mockUser.fullName, mockUser.role);
          // Augment the user object with role information
          const extendedUser = {
            ...data.user,
            role: mockUser.role,
            fullName: mockUser.fullName,
          } as ExtendedUser;
          setUser(extendedUser);
        } else {
          setUser(data.user as ExtendedUser);
        }
      }

      return { error: null };
    } catch (error: any) {
      console.error('Sign in error:', error);
      return { error };
    }
  };

  const signUp = async (email: string, password: string, metadata: any) => {
    try {
      console.log('Attempting to sign up with:', { email, metadata });

      // For mock purposes, we'll just sign in since we don't handle registration
      // In a real implementation, you'd add the user to your mock data
      const { data, error } = await mockAuth.signIn(email, password);

      console.log('Mock sign up response:', {
        data: {
          user: data?.user,
          session: data?.session,
        },
        error,
      });

      if (error) {
        console.error('Sign up error:', error);
        return { error };
      }

      // Update local state
      setSession(data.session);

      // Add additional user data from mock users
      if (data.user) {
        const mockUser = mockUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
        if (mockUser) {
          console.log('Found matching mock user:', mockUser.fullName, mockUser.role);
          // Augment the user object with role information
          const extendedUser = {
            ...data.user,
            role: mockUser.role,
            fullName: mockUser.fullName,
          } as ExtendedUser;
          setUser(extendedUser);
        } else {
          setUser(data.user as ExtendedUser);
        }
      }

      return { error: null };
    } catch (error: any) {
      console.error('Sign up error:', error);
      return { error };
    }
  };

  const signOut = async () => {
    try {
      console.log('Attempting to sign out');

      const { error } = await mockAuth.signOut();
      if (error) throw error;

      console.log('Successfully signed out');

      // Clear local state
      setSession(null);
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
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
