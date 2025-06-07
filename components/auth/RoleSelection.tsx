import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useUserData } from '../../hooks/useUserData';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export function RoleSelection() {
  const [selectedRole, setSelectedRole] = useState<'landlord' | 'renter' | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { updateLandlordProfile, updateRenterProfile, userRole } = useUserData();
  const router = useRouter();

  const handleRoleSelection = async () => {
    if (!selectedRole) {
      setError('Please select a role');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      if (selectedRole === 'landlord') {
        await updateLandlordProfile({});
        router.replace('/landlord/dashboard');
      } else {
        await updateRenterProfile({});
        router.replace('/renter/dashboard');
      }
    } catch (err: any) {
      console.error('Error setting user role:', err);
      setError(err.message || 'Failed to set user role. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select your role</Text>
      <Text style={styles.subtitle}>Choose how you want to use our app</Text>

      {error && <Text style={styles.error}>{error}</Text>}

      <View style={styles.rolesContainer}>
        <TouchableOpacity
          style={[styles.roleCard, selectedRole === 'landlord' && styles.selectedRole]}
          onPress={() => setSelectedRole('landlord')}
          disabled={loading}
        >
          <MaterialCommunityIcons
            name="home-city"
            size={50}
            color={selectedRole === 'landlord' ? '#34568B' : '#666'}
          />
          <Text style={styles.roleName}>Landlord</Text>
          <Text style={styles.roleDescription}>I want to rent out my properties</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.roleCard, selectedRole === 'renter' && styles.selectedRole]}
          onPress={() => setSelectedRole('renter')}
          disabled={loading}
        >
          <MaterialCommunityIcons
            name="home-search"
            size={50}
            color={selectedRole === 'renter' ? '#34568B' : '#666'}
          />
          <Text style={styles.roleName}>Renter</Text>
          <Text style={styles.roleDescription}>I'm looking for a place to rent</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[
          styles.continueButton,
          !selectedRole || loading ? styles.disabledButton : styles.enabledButton,
        ]}
        onPress={handleRoleSelection}
        disabled={!selectedRole || loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text style={styles.buttonText}>Continue</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#34568B',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  rolesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  roleCard: {
    width: '48%',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#f5f5f5',
  },
  selectedRole: {
    borderColor: '#34568B',
    backgroundColor: '#f0f4fa',
  },
  roleName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 4,
    color: '#333',
  },
  roleDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  continueButton: {
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  enabledButton: {
    backgroundColor: '#34568B',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  error: {
    color: '#ff3b30',
    marginBottom: 15,
    textAlign: 'center',
  },
});
