// src/services/auth.service.ts
import { supabase } from '../lib/supabase';
import { Session, User, AuthError } from '@supabase/supabase-js';
import { UserProfile, AuthResponse, SignUpMetadata, ProfileUpdateData } from '../types/auth';

export class AuthService {

  // Sign Up with profile creation
  async signUp(
    email: string,
    password: string,
    userData: SignUpMetadata,
  ) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.toLowerCase().trim(),
        password,
        options: {
          data: userData, // Store all metadata in auth user metadata
        },
      });

      if (error) throw error;

      // Create user profile in profiles table if user was created
      if (data.user && !data.user.email_confirmed_at) {
        console.log('User created, profile will be created after email confirmation');
      } else if (data.user) {
        await this.createUserProfile(data.user.id, {
          full_name: userData.full_name,
          phone: userData.phone,
          role: userData.role,
          email: data.user.email,
        });
      }

      return { data, error: null };
    } catch (error) {
      console.error('Auth service sign up error:', error);
      return { data: null, error: error as AuthError };
    }
  }

  // Sign In
  async signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password,
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Auth service sign in error:', error);
      return { data: null, error: error as AuthError };
    }
  }

  // Sign Out
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Auth service sign out error:', error);
      return { error: error as AuthError };
    }
  }

  // Get Current User
  async getCurrentUser() {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error) throw error;
      return { user, error: null };
    } catch (error) {
      console.error('Auth service get current user error:', error);
      return { user: null, error: error as AuthError };
    }
  }

  // Get Current Session
  async getCurrentSession() {
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
      if (error) throw error;
      return { session, error: null };
    } catch (error) {
      console.error('Auth service get session error:', error);
      return { session: null, error: error as AuthError };
    }
  }

  // Refresh Session
  async refreshSession() {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Auth service refresh session error:', error);
      return { data: null, error: error as AuthError };
    }
  }

  // Create User Profile - handled automatically by Supabase trigger
  async createUserProfile(userId: string, profileData: {
    full_name?: string;
    phone?: string;
    role?: 'landlord' | 'renter';
    email?: string | null;
  }) {
    // Profile creation is handled by the Supabase trigger function
    // This function is kept for compatibility but doesn't need to do anything
    console.log('User profile creation is handled by Supabase trigger for user:', userId);
    return { data: { id: userId, ...profileData }, error: null };
  }

  // Get User Profile
  async getUserProfile(userId: string): Promise<{ data: UserProfile | null; error: any }> {
    try {
      // Use the custom function to get complete user profile
      const { data: profileData, error } = await supabase.rpc('get_user_profile', {
        user_uuid: userId
      });

      if (error) throw error;

      if (!profileData) {
        return { data: null, error: new Error('Profile not found') };
      }

      // Combine user data with role information
      const profile = {
        ...profileData.user,
        role: profileData.role,
        roleData: profileData.role_data
      };

      return { data: profile, error: null };
    } catch (error) {
      console.error('Auth service get profile error:', error);
      return { data: null, error };
    }
  }

  // Update User Profile
  async updateUserProfile(userId: string, updates: {
    full_name?: string;
    phone?: string;
    profile_picture?: string;
    role?: 'landlord' | 'renter';
  }) {
    try {
      // Update users table (exclude role since it's not in the table)
      const userTableUpdates: Record<string, any> = {
        full_name: updates.full_name,
        phone: updates.phone,
        profile_picture: updates.profile_picture,
      };

      // Remove undefined values
      Object.keys(userTableUpdates).forEach(key => {
        if (userTableUpdates[key] === undefined) {
          delete userTableUpdates[key];
        }
      });

      let profileData = null;
      if (Object.keys(userTableUpdates).length > 0) {
        const { data, error: profileError } = await supabase
          .from('users')
          .update(userTableUpdates)
          .eq('id', userId)
          .select()
          .single();

        if (profileError) throw profileError;
        profileData = data;
      }

      // Update auth metadata for role and other metadata
      const authUpdates: any = {};
      if (updates.full_name) authUpdates.full_name = updates.full_name;
      if (updates.role) authUpdates.role = updates.role;
      if (updates.phone) authUpdates.phone = updates.phone;

      if (Object.keys(authUpdates).length > 0) {
        const { error: authError } = await supabase.auth.updateUser({
          data: authUpdates,
        });

        if (authError) {
          console.warn('Failed to update auth metadata:', authError);
        }
      }

      return { data: profileData, error: null };
    } catch (error) {
      console.error('Auth service update profile error:', error);
      return { data: null, error };
    }
  }

  // Reset Password
  async resetPassword(email: string) {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(
        email.toLowerCase().trim(),
        {
          redirectTo: `${window.location.origin}/reset-password`,
        }
      );
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Auth service reset password error:', error);
      return { data: null, error: error as AuthError };
    }
  }

  // Update Password
  async updatePassword(newPassword: string) {
    try {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Auth service update password error:', error);
      return { data: null, error: error as AuthError };
    }
  }

  // Check if user exists
  async checkUserExists(email: string): Promise<{ exists: boolean; error: any }> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email.toLowerCase().trim())
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" error
        throw error;
      }

      return { exists: !!data, error: null };
    } catch (error) {
      console.error('Auth service check user exists error:', error);
      return { exists: false, error };
    }
  }
}

// Export singleton instance
export const authService = new AuthService();
