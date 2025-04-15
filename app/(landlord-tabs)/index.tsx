import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text } from '@/components/Text';
import { useAuth } from '@/contexts/AuthContext';
import Colors from '@/constants/Colors';

export default function LandlordDashboard() {
  const { user } = useAuth();

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Welcome, {user?.fullName}</Text>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <View style={[styles.statBox, styles.statBoxLeft]}>
          <Text style={styles.statValue}>{user?.properties?.length || 0}</Text>
          <Text style={styles.statLabel}>Properties</Text>
        </View>
        <View style={[styles.statBox, styles.statBoxMiddle]}>
          <Text style={styles.statValue}>0</Text>
          <Text style={styles.statLabel}>Active Rentals</Text>
        </View>
        <View style={[styles.statBox, styles.statBoxRight]}>
          <Text style={styles.statValue}>$0</Text>
          <Text style={styles.statLabel}>Monthly Income</Text>
        </View>
      </View>

      {/* Content Sections */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <View style={styles.card}>
          <Text>No recent activity</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    backgroundColor: Colors.light.primary,
    padding: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    justifyContent: 'space-between',
  },
  statBox: {
    backgroundColor: Colors.light.primary,
    borderRadius: 8,
    padding: 16,
    flex: 1,
    alignItems: 'center',
  },
  statBoxLeft: {
    marginRight: 8,
  },
  statBoxMiddle: {
    marginHorizontal: 4,
  },
  statBoxRight: {
    marginLeft: 8,
  },
  statValue: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    color: '#fff',
    fontSize: 12,
    marginTop: 4,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: Colors.light.text,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
}); 