import { useState, useEffect } from 'react';
import {
  ApiService,
  UserProfile,
  LandlordProfile,
  RenterProfile,
  UserRole,
} from '../services/api.service';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/auth.service';

export function useUserData() {
  const { user, session } = useAuth();
  const [userRole, setUserRole] = useState<'landlord' | 'renter' | 'unknown'>('unknown');
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    async function fetchUserData() {
      if (!user) {
        setUserRole('unknown');
        setUserData(null);
        setIsLoading(false);
        return;
      }

      try {
        // Fetch user profile from Supabase profiles table
        const { data: profile, error } = await authService.getUserProfile(user.id);

        if (error) {
          console.warn('Profile not found, user may need to complete profile setup:', error);
          // Use basic user info from auth
          setUserRole(user.role || 'unknown');
          setUserData({
            id: user.id,
            email: user.email,
            full_name: user.full_name,
            role: user.role || 'unknown',
          });
        } else if (profile) {
          setUserRole(profile.role || 'unknown');
          setUserData(profile);
        } else {
          // Fallback to user auth data
          setUserRole(user.role || 'unknown');
          setUserData({
            id: user.id,
            email: user.email,
            full_name: user.full_name,
            role: user.role || 'unknown',
          });
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setUserRole('unknown');
        setUserData(null);
      } finally {
        setIsLoading(false);
      }
    }

    fetchUserData();
  }, [user]);

  // Update user basic info
  const updateUserInfo = async (updates: {
    full_name?: string;
    phone?: string;
    profile_picture?: string;
  }) => {
    try {
      setIsLoading(true);

      if (!user) {
        throw new Error('User not authenticated');
      }

      // Update user profile using auth service
      const { data, error } = await authService.updateUserProfile(user.id, updates);

      if (error) throw error;

      // Update local state
      setUserData((prev: any) => ({ ...prev, ...updates }));

      return { data, error: null };
    } catch (err: any) {
      console.error('Error updating user info:', err);
      return { data: null, error: err };
    } finally {
      setIsLoading(false);
    }
  };

  // Update or create landlord profile
  const updateLandlordProfile = async (updates: Partial<LandlordProfile>) => {
    try {
      setIsLoading(true);

      if (!user) {
        throw new Error('User not authenticated');
      }

      // Update role to landlord and other profile data
      const profileUpdates = {
        ...updates,
        role: 'landlord' as const,
      };

      const { data, error } = await authService.updateUserProfile(user.id, profileUpdates);

      if (error) throw error;

      // Update local state
      setUserRole('landlord');
      setUserData((prev: any) => ({ ...prev, ...profileUpdates }));

      return { data, error: null };
    } catch (err: any) {
      console.error('Error updating landlord profile:', err);
      return { data: null, error: err };
    } finally {
      setIsLoading(false);
    }
  };

  // Update or create renter profile
  const updateRenterProfile = async (updates: Partial<RenterProfile>) => {
    try {
      setIsLoading(true);

      if (!user) {
        throw new Error('User not authenticated');
      }

      // Update role to renter and other profile data
      const profileUpdates = {
        ...updates,
        role: 'renter' as const,
      };

      const { data, error } = await authService.updateUserProfile(user.id, profileUpdates);

      if (error) throw error;

      // Update local state
      setUserRole('renter');
      setUserData((prev: any) => ({ ...prev, ...profileUpdates }));

      return { data, error: null };
    } catch (err: any) {
      console.error('Error updating renter profile:', err);
      return { data: null, error: err };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    userRole,
    userData,
    isLoading,
    updateUserInfo,
    updateLandlordProfile,
    updateRenterProfile,
    isAuthenticated: !!user,
    isLandlord: userRole === 'landlord',
    isRenter: userRole === 'renter',
  };
}
