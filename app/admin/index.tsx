import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Link } from 'expo-router';
import { TouchableOpacity } from 'react-native-gesture-handler'; // For better touchable component

const AdminDashboardScreen = () => {
  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>Admin Dashboard</ThemedText>
      <ThemedText style={styles.subtitle}>Welcome to the admin control panel.</ThemedText>

      <Link href="/admin/user-management" asChild>
        <TouchableOpacity style={styles.button}>
          <ThemedText style={styles.buttonText}>Manage Users</ThemedText>
        </TouchableOpacity>
      </Link>

      <Link href="/admin/video-verification" asChild>
        <TouchableOpacity style={styles.button}>
          <ThemedText style={styles.buttonText}>Video Verifications</ThemedText>
        </TouchableOpacity>
      </Link>

      {/* Add more links or admin features here as needed */}
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'flex-start', // Align items to the top
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 30,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#007AFF', // Consider using theme color
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    marginBottom: 15,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF', // Consider using theme color for text on button
    fontSize: 16,
    fontWeight: '500',
  },
});

export default AdminDashboardScreen;