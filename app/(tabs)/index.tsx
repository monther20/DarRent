import React, { useEffect, useState } from 'react';
import { ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet, Image, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { ThemedText } from '@/components/ThemedText';
import { useAuth } from '@/contexts/AuthContext';
import { Text } from '../../components/Text';
import api from '@/services/api';
import { formatCurrency } from '../../utils/currency';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    backgroundColor: '#34568B',
    padding: 16,
  },
  headerText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  statBox: {
    backgroundColor: '#34568B',
    borderRadius: 8,
    padding: 16,
    flex: 1,
    alignItems: 'center',
  },
  statBoxLeft: {
    marginRight: 8,
  },
  statBoxMiddle: {
    marginHorizontal: 8,
  },
  statBoxRight: {
    marginLeft: 8,
  },
  statValue: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  statLabel: {
    color: 'white',
  },
  sectionContainer: {
    padding: 16,
  },
  sectionTitle: {
    color: '#2C3E50',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  whiteBox: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  button: {
    backgroundColor: '#E67E22',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  buttonText: {
    color: 'white',
  },
  activityItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ECF0F1',
  },
  activityText: {
    color: '#2C3E50',
  },
  floatButton: {
    backgroundColor: '#E67E22',
    width: 56,
    height: 56,
    borderRadius: 28,
    position: 'absolute',
    bottom: 16,
    right: 16,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  // Additional styles for the index tab
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 2,
  },
  statValueText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#34568B',
  },
  statLabelText: {
    color: '#4B5563',
  },
  quickActionsContainer: {
    padding: 16,
  },
  quickActionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  quickActionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  quickActionButton: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginRight: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  quickActionText: {
    marginLeft: 8,
    color: '#34568B',
  },
  recentActivityContainer: {
    padding: 16,
  },
  recentActivityTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  recentActivityCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 2,
  },
  activityItemContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  activityItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityItemText: {
    marginLeft: 8,
    flex: 1,
  },
  activityItemDate: {
    color: '#6B7280',
    fontSize: 14,
  },
});

export default function LandlordDashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    activeListings: 0,
    applications: 0,
    revenue: 0,
  });
  const [recentActivity, setRecentActivity] = useState<Array<{
    id: string;
    type: 'application' | 'payment' | 'maintenance';
    title: string;
    timestamp: Date;
  }>>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      if (!user) return;

      // Load properties
      const properties = await api.properties.getByOwner(user.id);
      
      // Load applications
      const applications = await api.applications.getByLandlord(user.id);
      
      // Load financial data
      const financial = await api.transactions.getFinancialSummary(user.id);

      setStats({
        activeListings: properties.length,
        applications: applications.length,
        revenue: financial.totalRevenue,
      });

      // Load recent activity
      const activity = await api.activity.getLandlordActivity(user.id);
      setRecentActivity(activity);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#34568B" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.scrollView}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>
          {t('dashboard.welcome', { name: user?.fullName })}
        </Text>
      </View>

      {/* Stats Overview */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValueText}>{stats.activeListings}</Text>
          <Text style={styles.statLabelText}>{t('dashboard.activeListings')}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValueText}>{stats.applications}</Text>
          <Text style={styles.statLabelText}>{t('dashboard.applications')}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValueText}>
            {formatCurrency(stats.revenue)}
          </Text>
          <Text style={styles.statLabelText}>{t('dashboard.revenue')}</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActionsContainer}>
        <Text style={styles.quickActionsTitle}>{t('dashboard.quickActions')}</Text>
        <View style={styles.quickActionsRow}>
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => router.push('/properties/new')}
          >
            <FontAwesome name="plus" size={16} color="#34568B" />
            <Text style={styles.quickActionText}>{t('properties.addNew')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => router.push('/applications')}
          >
            <FontAwesome name="file-text" size={16} color="#34568B" />
            <Text style={styles.quickActionText}>{t('applications.view')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recent Activity */}
      <View style={styles.recentActivityContainer}>
        <Text style={styles.recentActivityTitle}>{t('dashboard.recentActivity')}</Text>
        <View style={styles.recentActivityCard}>
          {recentActivity.map((activity) => (
            <View key={activity.id} style={styles.activityItemContainer}>
              <View style={styles.activityItemRow}>
                <FontAwesome
                  name={
                    activity.type === 'application'
                      ? 'file-text'
                      : activity.type === 'payment'
                      ? 'dollar'
                      : 'wrench'
                  }
                  size={16}
                  color="#34568B"
                />
                <Text style={styles.activityItemText}>{activity.title}</Text>
                <Text style={styles.activityItemDate}>
                  {new Date(activity.timestamp).toLocaleDateString()}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
