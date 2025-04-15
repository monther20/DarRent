import React from 'react';
import { View, Text } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { router } from 'expo-router';

type RoleGuardProps = {
  children: React.ReactNode;
  allowedRoles: string[];
};

export const RoleGuard: React.FC<RoleGuardProps> = ({ children, allowedRoles }) => {
  const { user } = useAuth();

  if (!user) {
    router.replace('/auth/login');
    return null;
  }

  if (!allowedRoles.includes(user.role)) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>You don't have permission to access this page.</Text>
      </View>
    );
  }

  return <>{children}</>;
}; 