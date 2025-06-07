import { useState, useEffect } from 'react';
import {
  ApiService,
  UserProfile,
  LandlordProfile,
  RenterProfile,
  UserRole,
} from '../services/api.service';
import { useAuth } from '../contexts/AuthContext';
import { mockUsers } from '../services/mockData';

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
        // In a real app, we would fetch this from an API
        // For now, we'll use our mock data
        const mockUser = mockUsers.find((u) => u.id === user.id || u.email === user.email);

        if (mockUser) {
          setUserRole(mockUser.role);
          setUserData(mockUser);
        } else {
          // If user exists in auth but not in our data, default to unknown
          setUserRole('unknown');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setUserRole('unknown');
      } finally {
        setIsLoading(false);
      }
    }

    fetchUserData();
  }, [user]);

  // Update user basic info
  const updateUserInfo = async (updates: {
    full_name_en?: string;
    full_name_ar?: string;
    phone?: string;
    profile_picture?: string;
  }) => {
    try {
      setIsLoading(true);
      const { data, error } = await ApiService.updateUserInfo(updates);

      if (error) throw error;

      // Refresh complete profile after update
      const { data: updatedProfile, error: profileError } =
        await ApiService.getCompleteUserProfile();

      if (profileError) throw profileError;

      setUserData(updatedProfile);
      return { data, error: null };
    } catch (err: any) {
      console.error('Error updating user info:', err);
      setUserData(null);
      setUserRole('unknown');
      return { data: null, error: err };
    } finally {
      setIsLoading(false);
    }
  };

  // Update or create landlord profile
  const updateLandlordProfile = async (updates: Partial<LandlordProfile>) => {
    try {
      setIsLoading(true);
      const { data, error } = await ApiService.updateLandlordProfile(updates);

      if (error) throw error;

      // Refresh complete profile after update
      const { data: updatedProfile, error: profileError } =
        await ApiService.getCompleteUserProfile();

      if (profileError) throw profileError;

      setUserRole('landlord');
      setUserData(updatedProfile);
      return { data, error: null };
    } catch (err: any) {
      console.error('Error updating landlord profile:', err);
      setUserData(null);
      setUserRole('unknown');
      return { data: null, error: err };
    } finally {
      setIsLoading(false);
    }
  };

  // Update or create renter profile
  const updateRenterProfile = async (updates: Partial<RenterProfile>) => {
    try {
      setIsLoading(true);
      const { data, error } = await ApiService.updateRenterProfile(updates);

      if (error) throw error;

      // Refresh complete profile after update
      const { data: updatedProfile, error: profileError } =
        await ApiService.getCompleteUserProfile();

      if (profileError) throw profileError;

      setUserRole('renter');
      setUserData(updatedProfile);
      return { data, error: null };
    } catch (err: any) {
      console.error('Error updating renter profile:', err);
      setUserData(null);
      setUserRole('unknown');
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
