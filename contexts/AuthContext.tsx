import React, { createContext, useState, useContext, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';
import api from '@/services/api';
import { User } from '@/services/mockData';

// Types
type UserRole = 'landlord' | 'renter';

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<boolean>;
  resetPassword: (token: string, newPassword: string) => Promise<boolean>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
  updateProfile: (userData: Partial<User>) => Promise<boolean>;
};

type RegisterData = {
  email: string;
  password: string;
  fullName: string;
  phone: string;
  role: UserRole;
};

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Storage keys
const AUTH_TOKEN_KEY = 'darrent_auth_token';
const USER_DATA_KEY = 'darrent_user_data';

// Auth provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check if user is already logged in on app load
  useEffect(() => {
    const loadStoredUser = async () => {
      try {
        const token = await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
        const userData = await SecureStore.getItemAsync(USER_DATA_KEY);

        if (token && userData) {
          setUser(JSON.parse(userData));
          setIsLoggedIn(true);
        }
      } catch (error) {
        console.error('Error loading stored authentication:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStoredUser();
  }, []);

  // Handle login
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // In a real app, you would call an API endpoint here
      // For this mock version, we'll find a matching user by email
      const matchedUser = await api.users.getLandlords().then((landlords) => {
        return landlords.find((u) => u.email.toLowerCase() === email.toLowerCase());
      });

      if (!matchedUser) {
        const renters = await api.users.getRenters();
        const renterUser = renters.find((u) => u.email.toLowerCase() === email.toLowerCase());
        if (renterUser) {
          // Store token and user data
          const mockToken = `mock_token_${Date.now()}`;
          await SecureStore.setItemAsync(AUTH_TOKEN_KEY, mockToken);
          await SecureStore.setItemAsync(USER_DATA_KEY, JSON.stringify(renterUser));

          setUser(renterUser);
          setIsLoggedIn(true);
          return true;
        }

        return false;
      }

      // In a real app, you would verify the password here
      // For mock purposes, we're just "logging in" without checking the password

      // Store token and user data
      const mockToken = `mock_token_${Date.now()}`;
      await SecureStore.setItemAsync(AUTH_TOKEN_KEY, mockToken);
      await SecureStore.setItemAsync(USER_DATA_KEY, JSON.stringify(matchedUser));

      setUser(matchedUser);
      setIsLoggedIn(true);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Handle registration
  const register = async (userData: RegisterData): Promise<boolean> => {
    try {
      setIsLoading(true);

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // In a real app, you would call an API endpoint here to create a new user
      // For this mock version, we'll just pretend to create a user

      // Create a mock new user
      const newUser: User = {
        id: `user_${Date.now()}`,
        fullName: userData.fullName,
        email: userData.email,
        phone: userData.phone,
        role: userData.role,
        location: {
          city: 'Amman',
          country: 'Jordan',
        },
        createdAt: new Date().toISOString(),
        properties: userData.role === 'landlord' ? [] : undefined,
        rentedProperties: userData.role === 'renter' ? [] : undefined,
      };

      // Store token and user data
      const mockToken = `mock_token_${Date.now()}`;
      await SecureStore.setItemAsync(AUTH_TOKEN_KEY, mockToken);
      await SecureStore.setItemAsync(USER_DATA_KEY, JSON.stringify(newUser));

      setUser(newUser);
      setIsLoggedIn(true);
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Handle logout
  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true);

      // Remove stored auth data
      await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
      await SecureStore.deleteItemAsync(USER_DATA_KEY);

      // Reset auth state
      setUser(null);
      setIsLoggedIn(false);

      // Navigate to login
      router.replace('/auth/login');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle forgot password request
  const forgotPassword = async (email: string): Promise<boolean> => {
    try {
      setIsLoading(true);

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // In a real app, you would call an API endpoint here to initiate password reset
      // For this mock version, we'll just pretend it worked

      return true;
    } catch (error) {
      console.error('Forgot password error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Handle password reset
  const resetPassword = async (token: string, newPassword: string): Promise<boolean> => {
    try {
      setIsLoading(true);

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // In a real app, you would call an API endpoint here to reset password
      // For this mock version, we'll just pretend it worked

      return true;
    } catch (error) {
      console.error('Reset password error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return true;
    } catch (error) {
      console.error('Error changing password:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (userData: Partial<User>): Promise<boolean> => {
    try {
      setIsLoading(true);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setUser((prevUser) => ({ ...prevUser, ...userData }) as User);
      return true;
    } catch (error) {
      console.error('Error updating profile:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    isLoading,
    isLoggedIn,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    changePassword,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
