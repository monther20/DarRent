import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/auth.service';

export function useMockUserData() {
  const { user, session } = useAuth();
  const [userRole, setUserRole] = useState<'landlord' | 'renter' | 'unknown'>('unknown');
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    async function fetchUserData() {
      if (!user) {
        console.log('No user in auth context, setting role to unknown');
        setUserRole('unknown');
        setUserData(null);
        setIsLoading(false);
        return;
      }

      try {
        console.log('Fetching user data for', user.email);

        // Fetch user profile from Supabase profiles table
        const { data: profile, error } = await authService.getUserProfile(user.id);

        if (profile) {
          console.log('Found user profile:', profile.role, profile.full_name);
          setUserRole(profile.role || 'unknown');
          setUserData(profile);
        } else {
          // Check for saved role in localStorage as fallback for development
          let dynamicRole: 'landlord' | 'renter' | 'unknown' = user.role || 'unknown';

          if (typeof localStorage !== 'undefined' && user.email) {
            const savedRole = localStorage.getItem(`userRole:${user.email}`);
            if (savedRole === 'landlord' || savedRole === 'renter') {
              dynamicRole = savedRole;
            }
          }

          console.log('User profile not found, using fallback role:', dynamicRole);
          setUserRole(dynamicRole);
          setUserData({
            id: user.id,
            email: user.email,
            full_name: user.full_name,
            role: dynamicRole
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

    setIsLoading(true);
    fetchUserData();
  }, [user]);

  return {
    userRole,
    userData,
    isLoading,
    isAuthenticated: !!user,
    isLandlord: userRole === 'landlord',
    isRenter: userRole === 'renter',
  };
}
