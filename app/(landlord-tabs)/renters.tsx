import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ScreenHeader } from '../components/ScreenHeader';
import { mockApi } from '../services/mockApi';
import { Tenant, Application, Stats } from '../types';
import { router } from 'expo-router';

export default function RentersScreen() {
  const [activeTab, setActiveTab] = useState('active');
  const [loading, setLoading] = useState(true);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [tenantsData, applicationsData, statsData] = await Promise.all([
        mockApi.getTenants('active'),
        mockApi.getApplications(),
        mockApi.getStats(),
      ]);
      setTenants(tenantsData);
      setApplications(applicationsData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateMonthsRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const months = (end.getFullYear() - now.getFullYear()) * 12 + 
                  (end.getMonth() - now.getMonth());
    return months;
  };

  const renderTenantCards = () => {
    return tenants.map((tenant) => (
      <View key={tenant.id} style={styles.tenantCard}>
        <View style={styles.tenantInfo}>
          <Image
            source={require('@/assets/images/avatar-placeholder.jpg')}
            style={styles.avatar}
          />
          <View>
            <ThemedText style={styles.tenantName}>{tenant.fullName}</ThemedText>
            <ThemedText style={styles.propertyName}>{tenant.propertyName}</ThemedText>
            <ThemedText style={styles.leaseInfo}>
              Lease ends in {calculateMonthsRemaining(tenant.leaseEnd)} months
            </ThemedText>
          </View>
        </View>
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.messageButton}
            onPress={() => router.push(`/messages/${tenant.id}`)}
          >
            <ThemedText style={styles.buttonText}>Message</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.detailsButton}
            onPress={() => router.push(`/tenants/${tenant.id}`)}
          >
            <ThemedText style={styles.buttonText}>View Details</ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    ));
  };

  const renderTabContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#34568B" />
        </View>
      );
    }

    switch (activeTab) {
      case 'active':
        return (
          <>
            {renderTenantCards()}
            {/* Quick Stats */}
            {stats && (
              <View style={styles.statsSection}>
                <ThemedText style={styles.statsTitle}>Quick Stats</ThemedText>
                <View style={styles.statsCard}>
                  <View style={styles.statItem}>
                    <ThemedText style={styles.statLabel}>Active Leases</ThemedText>
                    <ThemedText style={styles.statValue}>{stats.activeLeases}</ThemedText>
                  </View>
                  <View style={styles.statItem}>
                    <ThemedText style={styles.statLabel}>Expiring Soon</ThemedText>
                    <ThemedText style={styles.statValue}>{stats.expiringSoon}</ThemedText>
                  </View>
                  <View style={styles.statItem}>
                    <ThemedText style={styles.statLabel}>Avg. Rating</ThemedText>
                    <ThemedText style={styles.statValue}>{stats.averageRating}</ThemedText>
                  </View>
                </View>
              </View>
            )}
          </>
        );
      case 'applications':
        return (
          <View>
            {applications.map((application) => (
              <View key={application.id} style={styles.applicationCard}>
                <View>
                  <ThemedText style={styles.applicantName}>{application.applicantName}</ThemedText>
                  <ThemedText style={styles.propertyName}>{application.propertyName}</ThemedText>
                  <ThemedText style={styles.applicationDate}>
                    Applied on {new Date(application.applicationDate).toLocaleDateString()}
                  </ThemedText>
                </View>
                <TouchableOpacity 
                  style={styles.detailsButton}
                  onPress={() => router.push(`/applications/${application.id}`)}
                >
                  <ThemedText style={styles.buttonText}>Review</ThemedText>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        );
      case 'history':
        return <ThemedText style={styles.tabContent}>History view coming soon</ThemedText>;
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title="Renters" />
      
      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'active' && styles.activeTab]}
          onPress={() => setActiveTab('active')}
        >
          <ThemedText style={[styles.tabText, activeTab === 'active' && styles.activeTabText]}>
            Active ({tenants.length})
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'applications' && styles.activeTab]}
          onPress={() => setActiveTab('applications')}
        >
          <ThemedText style={[styles.tabText, activeTab === 'applications' && styles.activeTabText]}>
            Applications ({applications.length})
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'history' && styles.activeTab]}
          onPress={() => setActiveTab('history')}
        >
          <ThemedText style={[styles.tabText, activeTab === 'history' && styles.activeTabText]}>
            History
          </ThemedText>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {renderTabContent()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6F8',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#34568B',
  },
  tab: {
    padding: 16,
  },
  activeTab: {
    backgroundColor: '#F5F6F8',
  },
  tabText: {
    color: 'white',
    fontSize: 14,
  },
  activeTabText: {
    color: '#34568B',
    fontWeight: '600',
  },
  content: {
    padding: 16,
  },
  tenantCard: {
    backgroundColor: '#34568B',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  applicationCard: {
    backgroundColor: '#34568B',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tenantInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
    backgroundColor: '#ffffff20',
  },
  tenantName: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 4,
  },
  applicantName: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 4,
  },
  propertyName: {
    fontSize: 14,
    color: 'white',
    marginBottom: 4,
  },
  applicationDate: {
    fontSize: 12,
    color: 'white',
    opacity: 0.8,
  },
  leaseInfo: {
    fontSize: 12,
    color: 'white',
    opacity: 0.8,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  messageButton: {
    backgroundColor: '#E67E22',
    borderRadius: 4,
    paddingVertical: 8,
    paddingHorizontal: 16,
    flex: 1,
  },
  detailsButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    paddingVertical: 8,
    paddingHorizontal: 16,
    flex: 1,
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    textAlign: 'center',
  },
  statsSection: {
    marginTop: 24,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#34568B',
    marginBottom: 12,
  },
  statsCard: {
    backgroundColor: '#34568B',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: 'white',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
  },
  tabContent: {
    padding: 16,
    color: '#34568B',
  },
}); 