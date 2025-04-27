import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type UserRole = 'landlord' | 'renter';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  profileImage: string | null;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  register: (userData: Omit<User, 'id' | 'profileImage'> & { password: string }) => Promise<boolean>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  updateProfile: (profileData: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // TODO: Implement actual login logic with your backend
      const mockUser: User = {
        id: '1',
        name: 'John Doe',
        email,
        phone: '+1234567890',
        profileImage: null,
        role: 'renter',
      };
      await AsyncStorage.setItem('user', JSON.stringify(mockUser));
      setUser(mockUser);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem('user');
    setUser(null);
  };

  const register = async (userData: Omit<User, 'id' | 'profileImage'> & { password: string }): Promise<boolean> => {
    try {
      // TODO: Implement actual registration logic with your backend
      const newUser: User = {
        id: '1',
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        profileImage: null,
        role: userData.role,
      };
      await AsyncStorage.setItem('user', JSON.stringify(newUser));
      setUser(newUser);
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    // TODO: Implement actual password change logic with your backend
    if (!user) throw new Error('User not logged in');
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  const updateProfile = async (profileData: Partial<User>) => {
    if (!user) throw new Error('User not logged in');
    const updatedUser = { ...user, ...profileData };
    await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
        register,
        changePassword,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext; 