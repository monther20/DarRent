import React from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { mockApi } from '../services/mockApi'; // Import the mock API
import { AdminUserDisplay } from '../services/mockApi'; // Import the User type

// Define the User type based on mock data and requirements
// This is now AdminUserDisplay from mockApi.ts, keeping it here for reference if needed for local state
// interface User {
// id: string;
// name: string;
// email: string;
// role: string;
// status: string;
// }

const UserManagementScreen = () => {
  const [users, setUsers] = React.useState<AdminUserDisplay[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const fetchedUsers = await mockApi.getAllUsers();
        setUsers(fetchedUsers);
        setError(null);
      } catch (e) {
        setError('Failed to fetch users.');
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const renderUserItem = ({ item }: { item: AdminUserDisplay }) => (
    <View style={styles.userItem}>
      <ThemedText style={[styles.userName, styles.titleText]}>{item.name}</ThemedText>
      <ThemedText>Email: {item.email}</ThemedText>
      <ThemedText>Role: {item.role}</ThemedText>
      <ThemedText>Status: {item.status}</ThemedText>
    </View>
  );

  if (loading) {
    return (
      <ThemedView style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" />
        <ThemedText>Loading users...</ThemedText>
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={[styles.container, styles.centerContent]}>
        <ThemedText style={styles.errorText}>{error}</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={[styles.title, styles.titleText]}>User Management</ThemedText>
      <FlatList
        data={users}
        renderItem={renderUserItem}
        keyExtractor={(item: AdminUserDisplay) => item.id}
        style={styles.list}
        ListEmptyComponent={<ThemedText style={styles.centerContent}>No users found.</ThemedText>}
      />
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  errorText: {
    color: 'red', // Consider using theme color for errors
    textAlign: 'center',
  },
  title: {
    marginBottom: 16,
    textAlign: 'center',
  },
  titleText: { // Added to replicate title styling if needed
    fontSize: 20, // Example size, adjust as needed
    fontWeight: 'bold',
  },
  list: {
    flex: 1,
  },
  userItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc', // Consider using theme color
    marginBottom: 8,
  },
  userName: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
  },
});

export default UserManagementScreen;