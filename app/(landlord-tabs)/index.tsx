import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { useAuth } from '@/contexts/AuthContext';
import { ScreenHeader } from '../components/ScreenHeader';
import { router } from 'expo-router';

export default function DashboardScreen() {
  const { user } = useAuth();

  return (
    <View style={styles.container}>
      <ScreenHeader
        title={`Hello, ${user?.fullName}`}
      />

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statsCard}>
          <ThemedText style={styles.statsLabel}>Active Listings</ThemedText>
          <ThemedText style={styles.statsNumber}>12</ThemedText>
        </View>

        <View style={styles.statsCard}>
          <ThemedText style={styles.statsLabel}>Applications</ThemedText>
          <ThemedText style={styles.statsNumber}>5</ThemedText>
        </View>

        <View style={styles.statsCard}>
          <ThemedText style={styles.statsLabel}>Revenue</ThemedText>
          <ThemedText style={styles.statsNumber}>$5.2K</ThemedText>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Quick Actions</ThemedText>
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push('/properties/add')}
          >
            <ThemedText style={styles.actionButtonText}>Add Property</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push('/applications')}
          >
            <ThemedText style={styles.actionButtonText}>View Applications</ThemedText>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recent Activity */}
      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Recent Activity</ThemedText>
        <View style={styles.activityList}>
          <View style={styles.activityItem}>
            <ThemedText style={styles.activityText}>New application - Garden Apartment</ThemedText>
          </View>
          <View style={styles.activityItem}>
            <ThemedText style={styles.activityText}>Payment received - City View Condo</ThemedText>
          </View>
          <View style={styles.activityItem}>
            <ThemedText style={styles.activityText}>Maintenance - Mountain View Villa</ThemedText>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6F8',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statsCard: {
    flex: 1,
    backgroundColor: '#34568B',
    borderRadius: 8,
    padding: 16,
    alignItems: 'flex-start',
  },
  statsLabel: {
    fontSize: 14,
    color: 'white',
    marginBottom: 8,
  },
  statsNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#34568B',
    marginBottom: 12,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    backgroundColor: '#E67E22',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flex: 1,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  activityList: {
    backgroundColor: '#F0F2F5',
    borderRadius: 8,
    overflow: 'hidden',
  },
  activityItem: {
    backgroundColor: '#34568B',
    padding: 16,
    marginBottom: 1,
  },
  activityText: {
    color: 'white',
    fontSize: 14,
  },
}); 