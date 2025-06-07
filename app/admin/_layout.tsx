import React from 'react';
import { Stack } from 'expo-router';
import { ThemedText } from '@/components/ThemedText'; // Assuming ThemedText is used for headers
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext'; // For theming header

export default function AdminLayout() {
  const { isDarkMode } = useTheme();
  const headerBackgroundColor = isDarkMode ? '#1C1C1E' : '#FFFFFF';
  const headerTintColor = isDarkMode ? '#FFFFFF' : '#000000';

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: headerBackgroundColor,
        },
        headerTintColor: headerTintColor,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="index" // This will be the entry point for /admin
        options={{
          title: 'Admin Dashboard',
          headerRight: () => (
            <View style={styles.headerButtonsContainer}>
              <Link href="/admin/property-verification" asChild>
                <TouchableOpacity style={styles.headerButton}>
                  <ThemedText style={styles.headerButtonText}>Properties</ThemedText>
                </TouchableOpacity>
              </Link>
              <Link href="/admin/user-management" asChild>
                <TouchableOpacity style={styles.headerButton}>
                  <ThemedText style={styles.headerButtonText}>Users</ThemedText>
                </TouchableOpacity>
              </Link>
            </View>
          ),
        }}
      />
      <Stack.Screen
        name="user-management"
        options={{ title: 'User Management' }}
      />
      <Stack.Screen
        name="property-verification"
        options={{ title: 'Property Verification' }}
      />
      <Stack.Screen
        name="video-verification" // Assuming this screen also exists or will be added
        options={{ title: 'Video Verification' }}
      />
    </Stack>
  );
}

const styles = StyleSheet.create({
  headerButtonsContainer: {
    flexDirection: 'row',
  },
  headerButton: {
    marginLeft: 15, // Changed from marginRight to marginLeft for spacing between buttons
    paddingVertical: 5,
    paddingHorizontal: 10,
    // Add more styling if needed
  },
  headerButtonText: {
    fontSize: 16,
    // color: '#007AFF', // Consider using theme color
  },
});