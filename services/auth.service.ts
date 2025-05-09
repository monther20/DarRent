// src/services/auth.service.ts
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../config/env';

export class AuthService {
  public supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }

  // Sign Up
  async signUp(
    email: string,
    password: string,
    userData: {
      full_name: string;
      phone?: string;
    },
  ) {
    try {
      const { data, error } = await this.supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData,
        },
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Sign In
  async signIn(email: string, password: string) {
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Sign Out
  async signOut() {
    try {
      const { error } = await this.supabase.auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error };
    }
  }

  // Get Current User
  async getCurrentUser() {
    try {
      const {
        data: { user },
        error,
      } = await this.supabase.auth.getUser();
      if (error) throw error;
      return { user, error: null };
    } catch (error) {
      return { user: null, error };
    }
  }

  // Get User Profile
  async getUserProfile(userId: string) {
    try {
      const { data, error } = await this.supabase.rpc('get_user_profile_with_role', {
        p_user_id: userId,
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Update User Profile
  async updateUserProfile(updates: {
    full_name?: string;
    phone?: string;
    profile_picture?: string;
  }) {
    try {
      const {
        data: { user },
        error: userError,
      } = await this.supabase.auth.getUser();
      if (userError) throw userError;

      // Update auth metadata
      const { data: authData, error: authError } = await this.supabase.auth.updateUser({
        data: updates,
      });

      if (authError) throw authError;

      // Update users table
      const { data: userData, error: updateError } = await this.supabase
        .from('users')
        .update(updates)
        .eq('id', user?.id)
        .select()
        .single();

      if (updateError) throw updateError;
      return { data: userData, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Reset Password
  async resetPassword(email: string) {
    try {
      const { data, error } = await this.supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Update Password
  async updatePassword(newPassword: string) {
    try {
      const { data, error } = await this.supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }
}
