import { mockUsers } from './mockData';
import { Session } from '@supabase/supabase-js';

// Mock authentication service for development
export class MockAuthService {
  // Store the current user session
  private currentSession: {
    user: any;
    session: Session | null;
  } | null = null;

  constructor() {
    // Try to restore session from localStorage if available
    if (typeof localStorage !== 'undefined') {
      try {
        const savedSession = localStorage.getItem('mockAuthSession');
        if (savedSession) {
          this.currentSession = JSON.parse(savedSession);
          console.log('Restored mock auth session for:', this.currentSession?.user?.email);
        }
      } catch (error) {
        console.error('Error restoring mock auth session:', error);
      }
    }
  }

  // Sign in
  async signIn(email: string, password: string) {
    try {
      // Simple validation
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      // Find user in mock data (in a real app, we'd check the password hash)
      const user = mockUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());

      // For demo purposes, any password will work with existing emails
      if (!user) {
        throw new Error('User not found');
      }

      // Create a mock session
      this.currentSession = {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          user_metadata: {
            full_name: user.fullName,
            role: user.role,
          },
        },
        session: {
          access_token: 'mock-token',
          refresh_token: 'mock-refresh-token',
          expires_at: Date.now() + 3600000, // 1 hour from now
          user: {
            id: user.id,
            email: user.email,
            role: user.role,
            user_metadata: {
              full_name: user.fullName,
              role: user.role,
            },
          },
        } as unknown as Session,
      };

      // Save session to localStorage if available
      if (typeof localStorage !== 'undefined') {
        try {
          localStorage.setItem('mockAuthSession', JSON.stringify(this.currentSession));
        } catch (error) {
          console.error('Error saving mock auth session:', error);
        }
      }

      return { data: this.currentSession, error: null };
    } catch (error: any) {
      return { data: null, error: { message: error.message } };
    }
  }

  // Sign out
  async signOut() {
    this.currentSession = null;

    // Clear local storage session if available
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.removeItem('mockAuthSession');
      } catch (error) {
        console.error('Error clearing mock auth session:', error);
      }
    }

    return { error: null };
  }

  // Get current session
  async getSession() {
    return { data: { session: this.currentSession?.session || null }, error: null };
  }

  // Get current user
  async getUser() {
    return { data: { user: this.currentSession?.user || null }, error: null };
  }
}

export const mockAuth = new MockAuthService();
