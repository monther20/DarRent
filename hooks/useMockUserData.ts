import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { mockUsers } from '../services/mockData';

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
        // In a real app, we would fetch this from an API
        // For now, we'll use our mock data
        const mockUser = mockUsers.find((u) => u.id === user.id || u.email === user.email);

        if (mockUser) {
          console.log('Found user in mock data:', mockUser.role, mockUser.fullName);
          setUserRole(mockUser.role);
          setUserData(mockUser);
        } else {
          // If user exists in auth but not in our data, default to unknown
          console.log('User not found in mock data, defaulting to unknown role');
          setUserRole('unknown');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setUserRole('unknown');
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
