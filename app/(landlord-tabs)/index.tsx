import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { useAuth } from '@/contexts/AuthContext';
import { ScreenHeader } from '../components/ScreenHeader';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

export default function DashboardScreen() {
  const { user } = useAuth();

  return (
    <ScrollView style={styles.container}>
      <ScreenHeader
        title={`Hello, ${user?.fullName}`}
      />

      {/* Welcome Card */}
      <View style={styles.welcomeCard}>
        <View style={styles.welcomeContent}>
          <ThemedText style={styles.welcomeTitle}>Welcome Back!</ThemedText>
          <ThemedText style={styles.welcomeSubtitle}>Manage your properties efficiently</ThemedText>
        </View>
        <Image 
          source={require('@/assets/images/dashboard-illustration.png')}
          style={styles.welcomeImage}
        />
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statsCard}>
          <View style={styles.statsIconContainer}>
            <MaterialIcons name="home" size={28} color="#34568B" />
          </View>
          <View style={styles.statsTextContainer}>
            <ThemedText style={styles.statsLabel}>Active Listings</ThemedText>
            <ThemedText style={styles.statsNumber}>12</ThemedText>
          </View>
        </View>

        <View style={styles.statsCard}>
          <View style={styles.statsIconContainer}>
            <MaterialIcons name="assignment" size={28} color="#34568B" />
          </View>
          <View style={styles.statsTextContainer}>
            <ThemedText style={styles.statsLabel}>Applications</ThemedText>
            <ThemedText style={styles.statsNumber}>5</ThemedText>
          </View>
        </View>

        <View style={styles.statsCard}>
          <View style={styles.statsIconContainer}>
            <MaterialIcons name="attach-money" size={28} color="#34568B" />
          </View>
          <View style={styles.statsTextContainer}>
            <ThemedText style={styles.statsLabel}>Revenue</ThemedText>
            <ThemedText style={styles.statsNumber}>$5.2K</ThemedText>
          </View>
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
            <MaterialIcons name="add-circle" size={24} color="white" />
            <ThemedText style={styles.actionButtonText}>Add Property</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push('/applications')}
          >
            <MaterialIcons name="assignment" size={24} color="white" />
            <ThemedText style={styles.actionButtonText}>View Applications</ThemedText>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recent Activity */}
      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Recent Activity</ThemedText>
        <View style={styles.activityList}>
          <View style={styles.activityItem}>
            <MaterialIcons name="assignment" size={20} color="white" />
            <ThemedText style={styles.activityText}>New application - Garden Apartment</ThemedText>
          </View>
          <View style={styles.activityItem}>
            <MaterialIcons name="payment" size={20} color="white" />
            <ThemedText style={styles.activityText}>Payment received - City View Condo</ThemedText>
          </View>
          <View style={styles.activityItem}>
            <MaterialIcons name="build" size={20} color="white" />
            <ThemedText style={styles.activityText}>Maintenance - Mountain View Villa</ThemedText>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6F8',
  },
  welcomeCard: {
    backgroundColor: '#34568B',
    borderRadius: 16,
    margin: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  welcomeContent: {
    flex: 1,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: 'white',
    opacity: 0.8,
  },
  welcomeImage: {
    width: 100,
    height: 100,
    marginLeft: 16,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
    backgroundColor: '#e4e4e4',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 12,
  },
  statsCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 10,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    minWidth: 90,
  },
  statsIconContainer: {
    backgroundColor: '#F0F2F5',
    borderRadius: 50,
    padding: 10,
    marginBottom: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsTextContainer: {
    alignItems: 'center',
  },
  statsLabel: {
    fontSize: 13,
    color: '#666',
    marginBottom: 2,
  },
  statsNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#34568B',
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
    borderRadius: 12,
    padding: 16,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  activityList: {
    backgroundColor: '#34568B',
    borderRadius: 12,
    overflow: 'hidden',
  },
  activityItem: {
    backgroundColor: '#34568B',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  activityText: {
    color: 'white',
    fontSize: 14,
    flex: 1,
  },
}); 