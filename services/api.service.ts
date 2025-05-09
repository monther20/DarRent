import { supabase } from '../lib/supabase';

// User role types
export type UserRole = 'landlord' | 'renter' | 'unknown';

// User profile types
export type UserProfile = {
  id: string;
  email: string;
  full_name_en?: string;
  full_name_ar?: string;
  phone?: string;
  profile_picture?: string;
  registration_date?: string;
  status?: string;
  rating?: number;
  role?: UserRole;
};

// Landlord profile type
export type LandlordProfile = {
  id: string;
  user_id: string;
  bank_account?: string;
  verification_status_en?: string;
  verification_status_ar?: string;
  rating?: number;
};

// Renter profile type
export type RenterProfile = {
  id: string;
  user_id: string;
  preferred_location_en?: string;
  preferred_location_ar?: string;
  budget?: number;
  rating?: number;
};

export class ApiService {
  // Determine user role (landlord, renter, or unknown)
  static async getUserRole(): Promise<{ role: UserRole; error: any }> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('No authenticated user');
      }

      // Check if user is a landlord
      const { data: landlordData, error: landlordError } = await supabase
        .from('landlords')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (landlordData) {
        return { role: 'landlord', error: null };
      }

      // Check if user is a renter
      const { data: renterData, error: renterError } = await supabase
        .from('renters')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (renterData) {
        return { role: 'renter', error: null };
      }

      // User exists but has no role yet
      return { role: 'unknown', error: null };
    } catch (error) {
      console.error('Error determining user role:', error);
      return { role: 'unknown', error };
    }
  }

  // Get complete user profile with role-specific data
  static async getCompleteUserProfile(): Promise<{ data: UserProfile | null; error: any }> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('No authenticated user');
      }

      // Get basic user info
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (userError) throw userError;

      // Determine user role
      const { role } = await this.getUserRole();

      let roleSpecificData = null;

      // Get role-specific data
      if (role === 'landlord') {
        const { data, error } = await supabase
          .from('landlords')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error) throw error;
        roleSpecificData = data;
      } else if (role === 'renter') {
        const { data, error } = await supabase
          .from('renters')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error) throw error;
        roleSpecificData = data;
      }

      // Combine the data
      const combinedData: UserProfile = {
        ...userData,
        role,
        ...roleSpecificData,
      };

      return { data: combinedData, error: null };
    } catch (error) {
      console.error('Error fetching complete user profile:', error);
      return { data: null, error };
    }
  }

  // Get landlord profile
  static async getLandlordProfile(): Promise<{ data: LandlordProfile | null; error: any }> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('No authenticated user');
      }

      const { data, error } = await supabase
        .from('landlords')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching landlord profile:', error);
      return { data: null, error };
    }
  }

  // Get renter profile
  static async getRenterProfile(): Promise<{ data: RenterProfile | null; error: any }> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('No authenticated user');
      }

      const { data, error } = await supabase
        .from('renters')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching renter profile:', error);
      return { data: null, error };
    }
  }

  // Create or update landlord profile
  static async updateLandlordProfile(
    updates: Partial<LandlordProfile>,
  ): Promise<{ data: LandlordProfile | null; error: any }> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('No authenticated user');
      }

      // Check if landlord profile exists
      const { data: existingProfile } = await supabase
        .from('landlords')
        .select('id')
        .eq('user_id', user.id)
        .single();

      let result;

      if (existingProfile) {
        // Update existing profile
        result = await supabase
          .from('landlords')
          .update(updates)
          .eq('user_id', user.id)
          .select()
          .single();
      } else {
        // Create new profile
        result = await supabase
          .from('landlords')
          .insert({ ...updates, user_id: user.id })
          .select()
          .single();
      }

      const { data, error } = result;
      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Error updating landlord profile:', error);
      return { data: null, error };
    }
  }

  // Create or update renter profile
  static async updateRenterProfile(
    updates: Partial<RenterProfile>,
  ): Promise<{ data: RenterProfile | null; error: any }> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('No authenticated user');
      }

      // Check if renter profile exists
      const { data: existingProfile } = await supabase
        .from('renters')
        .select('id')
        .eq('user_id', user.id)
        .single();

      let result;

      if (existingProfile) {
        // Update existing profile
        result = await supabase
          .from('renters')
          .update(updates)
          .eq('user_id', user.id)
          .select()
          .single();
      } else {
        // Create new profile
        result = await supabase
          .from('renters')
          .insert({ ...updates, user_id: user.id })
          .select()
          .single();
      }

      const { data, error } = result;
      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Error updating renter profile:', error);
      return { data: null, error };
    }
  }

  // Update basic user information
  static async updateUserInfo(updates: {
    full_name_en?: string;
    full_name_ar?: string;
    phone?: string;
    profile_picture?: string;
  }): Promise<{ data: any; error: any }> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('No authenticated user');
      }

      // Update user table
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error updating user info:', error);
      return { data: null, error };
    }
  }
}
