import React, { useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { RoleSelection } from '../../components/auth/RoleSelection';
import { useUserData } from '../../hooks/useUserData';
import { useRouter } from 'expo-router';
import { ActivityIndicator } from 'react-native';

export default function SelectRoleScreen() {
  const { userRole, loading, isAuthenticated } = useUserData();
  const router = useRouter();

  useEffect(() => {
    // Redirect if user already has a role
    if (!loading && isAuthenticated) {
      if (userRole === 'landlord') {
        router.replace('/landlord/dashboard');
      } else if (userRole === 'renter') {
        router.replace('/renter/dashboard');
      }
      // If role is 'unknown', we'll show the role selection UI
    } else if (!loading && !isAuthenticated) {
      // Redirect to login if not authenticated
      router.replace('/auth/login');
    }
  }, [userRole, loading, isAuthenticated]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#34568B" />
      </View>
    );
  }

  // Only show role selection if authenticated but no role yet
  if (isAuthenticated && userRole === 'unknown') {
    return (
      <View style={styles.container}>
        <Text style={styles.header}>Welcome!</Text>
        <RoleSelection />
      </View>
    );
  }

  // Return empty view while redirecting
  return <View style={styles.container} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#34568B',
    textAlign: 'center',
    marginTop: 40,
    marginBottom: 20,
  },
});
