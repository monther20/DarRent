import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ScreenHeader } from '../components/ScreenHeader';
import { mockApi } from '../services/mockApi';
import { Tenant, Application, Stats, RenterReviewStatus } from '../types';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { RenterReviewModal } from '@/app/components/reviews/RenterReviewModal';

export default function RentersScreen() {
  const { t } = useTranslation(['common', 'reviews']);
  const [activeTab, setActiveTab] = useState('active');
  const [loading, setLoading] = useState(true);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [reviewFilter, setReviewFilter] = useState('all'); // 'all', 'reviewed', 'unreviewed'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [tenantsData, applicationsData, statsData] = await Promise.all([
        mockApi.getTenants(activeTab === 'active' ? 'active' : undefined),
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

  const getAvatarSource = (avatar: string) => {
    if (!avatar) return require('../../assets/images/avatar-placeholder.jpg');
    if (avatar.startsWith('http')) return { uri: avatar };
    if (avatar.startsWith('/assets')) return require('../../assets/images/avatar-placeholder.jpg');
    return { uri: avatar }; // fallback, but probably never reached
  };

  const calculateMonthsRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const months = (end.getFullYear() - now.getFullYear()) * 12 + (end.getMonth() - now.getMonth());
    return months;
  };

  const calculateDaysUntilReviewExpiry = (endDate: string, reviewStatus: RenterReviewStatus) => {
    // If already reviewed, return null
    if (reviewStatus === 'reviewed') return null;

    const leaseEnd = new Date(endDate);
    const reviewDeadline = new Date(leaseEnd);
    reviewDeadline.setDate(reviewDeadline.getDate() + 30); // 30 days after lease end
    
    const now = new Date();
    const diffTime = reviewDeadline.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays > 0 ? diffDays : 0;
  };

  const isEligibleForReview = (endDate: string) => {
    const leaseEndDate = new Date(endDate);
    const currentDate = new Date();
    return leaseEndDate <= currentDate;
  };
  
  const getReviewStatusIndicator = (tenant: Tenant) => {
    if (tenant.reviewStatus === 'reviewed') {
      return (
        <View style={styles.reviewedBadge}>
          <Ionicons name="checkmark-circle" size={14} color="#FFFFFF" />
          <ThemedText style={styles.reviewedBadgeText}>{t('reviewed', { ns: 'reviews' })}</ThemedText>
        </View>
      );
    } 
    
    // Check if eligible for review
    if (!isEligibleForReview(tenant.leaseEnd)) {
      return (
        <View style={styles.upcomingBadge}>
          <Ionicons name="time-outline" size={14} color="#FFFFFF" />
          <ThemedText style={styles.upcomingBadgeText}>{t('active', { ns: 'common' })}</ThemedText>
        </View>
      );
    }
    
    const daysLeft = calculateDaysUntilReviewExpiry(tenant.leaseEnd, tenant.reviewStatus);
    
    if (daysLeft === 0) {
      return (
        <View style={styles.expiredBadge}>
          <Ionicons name="alert-circle" size={14} color="#FFFFFF" />
          <ThemedText style={styles.expiredBadgeText}>{t('reviewExpired', { ns: 'reviews' })}</ThemedText>
        </View>
      );
    }
    
    return (
      <View style={styles.pendingBadge}>
        <Ionicons name="star-outline" size={14} color="#FFFFFF" />
        <ThemedText style={styles.pendingBadgeText}>
          {daysLeft} {t('daysLeft', { ns: 'reviews' })}
        </ThemedText>
      </View>
    );
  };

  const handleReviewTenant = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setShowReviewModal(true);
  };

  const handleSubmitReview = () => {
    setShowReviewModal(false);
    // Update the tenant's review status in the local state
    if (selectedTenant) {
      setTenants(
        tenants.map(tenant => 
          tenant.id === selectedTenant.id 
            ? { ...tenant, reviewStatus: 'reviewed' as RenterReviewStatus } 
            : tenant
        )
      );
    }
    setSelectedTenant(null);
  };

  const filterTenants = () => {
    let filtered = tenants;
    
    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(tenant => 
        tenant.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tenant.propertyName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply review filter (only for history tab)
    if (activeTab === 'history' && reviewFilter !== 'all') {
      filtered = filtered.filter(tenant => 
        reviewFilter === 'reviewed' 
          ? tenant.reviewStatus === 'reviewed' 
          : tenant.reviewStatus === 'unreviewed'
      );
    }
    
    return filtered;
  };
  
  const renderTenantCards = () => {
    const filteredTenants = filterTenants();
    
    if (filteredTenants.length === 0) {
      return (
        <View style={styles.emptyStateContainer}>
          <Ionicons name="people-outline" size={48} color="#BDBDBD" />
          <ThemedText style={styles.emptyStateText}>
            {searchQuery 
              ? t('noRentersMatchSearch', { ns: 'common' })
              : t('noRentersFound', { ns: 'common' })}
          </ThemedText>
        </View>
      );
    }
    
    return filteredTenants.map((tenant) => (
      <View key={tenant.id} style={styles.tenantCard}>
        <View style={styles.tenantInfo}>
          <Image source={getAvatarSource(tenant.avatar)} style={styles.avatar} />
          <View style={styles.tenantDetails}>
            <ThemedText style={styles.tenantName}>{tenant.fullName}</ThemedText>
            <ThemedText style={styles.propertyName}>{tenant.propertyName}</ThemedText>
            <ThemedText style={styles.leaseInfo}>
              {activeTab === 'active' 
                ? `${t('leaseEndsIn', { ns: 'common' })} ${calculateMonthsRemaining(tenant.leaseEnd)} ${t('months', { ns: 'common' })}`
                : `${t('leaseEnded', { ns: 'common' })} ${new Date(tenant.leaseEnd).toLocaleDateString()}`}
            </ThemedText>
          </View>
          
          {/* Review Status Indicator */}
          {activeTab === 'history' && getReviewStatusIndicator(tenant)}
        </View>
        
        <View style={styles.actionButtons}>
          {activeTab === 'history' && tenant.reviewStatus !== 'reviewed' && isEligibleForReview(tenant.leaseEnd) && (
            <TouchableOpacity
              style={styles.reviewButton}
              onPress={() => handleReviewTenant(tenant)}
            >
              <Ionicons name="star-outline" size={18} color="#FFFFFF" style={styles.buttonIcon} />
              <ThemedText style={styles.buttonText}>
                {t('writeReview', { ns: 'reviews' })}
              </ThemedText>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            style={styles.messageButton}
            onPress={() => router.push(`/messages/${tenant.id}`)}
          >
            <Ionicons name="chatbubble-outline" size={18} color="#FFFFFF" style={styles.buttonIcon} />
            <ThemedText style={styles.buttonText}>{t('message', { ns: 'common' })}</ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.detailsButton}
            onPress={() => router.push(`/tenants/${tenant.id}`)}
          >
            <Ionicons name="eye-outline" size={18} color="#FFFFFF" style={styles.buttonIcon} />
            <ThemedText style={styles.buttonText}>{t('details', { ns: 'common' })}</ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    ));
  };

  const renderSearchAndFilters = () => {
    return (
      <View style={styles.filtersContainer}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#7F8FA4" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder={t('searchRenters', { ns: 'common' })}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#7F8FA4"
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#7F8FA4" />
            </TouchableOpacity>
          ) : null}
        </View>
        
        {/* Filter Buttons (only show in history tab) */}
        {activeTab === 'history' && (
          <View style={styles.filterButtons}>
            <TouchableOpacity
              style={[
                styles.filterButton,
                reviewFilter === 'all' && styles.filterButtonActive
              ]}
              onPress={() => setReviewFilter('all')}
            >
              <ThemedText style={[
                styles.filterButtonText,
                reviewFilter === 'all' && styles.filterButtonTextActive
              ]}>
                {t('filterAll', { ns: 'reviews' })}
              </ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.filterButton,
                reviewFilter === 'reviewed' && styles.filterButtonActive
              ]}
              onPress={() => setReviewFilter('reviewed')}
            >
              <ThemedText style={[
                styles.filterButtonText,
                reviewFilter === 'reviewed' && styles.filterButtonTextActive
              ]}>
                {t('filterReviewed', { ns: 'reviews' })}
              </ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.filterButton,
                reviewFilter === 'unreviewed' && styles.filterButtonActive
              ]}
              onPress={() => setReviewFilter('unreviewed')}
            >
              <ThemedText style={[
                styles.filterButtonText,
                reviewFilter === 'unreviewed' && styles.filterButtonTextActive
              ]}>
                {t('filterUnreviewed', { ns: 'reviews' })}
              </ThemedText>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
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
            {renderSearchAndFilters()}
            {renderTenantCards()}
            {/* Quick Stats */}
            {stats && (
              <View style={styles.statsSection}>
                <ThemedText style={styles.statsTitle}>{t('quickStats', { ns: 'common' })}</ThemedText>
                <View style={styles.statsCard}>
                  <View style={styles.statItem}>
                    <ThemedText style={styles.statLabel}>{t('activeLeases', { ns: 'common' })}</ThemedText>
                    <ThemedText style={styles.statValue}>{stats.activeLeases}</ThemedText>
                  </View>
                  <View style={styles.statItem}>
                    <ThemedText style={styles.statLabel}>{t('expiringSoon', { ns: 'common' })}</ThemedText>
                    <ThemedText style={styles.statValue}>{stats.expiringSoon}</ThemedText>
                  </View>
                  <View style={styles.statItem}>
                    <ThemedText style={styles.statLabel}>{t('averageRating', { ns: 'reviews' })}</ThemedText>
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
                    {t('appliedOn', { ns: 'common' })} {new Date(application.applicationDate).toLocaleDateString()}
                  </ThemedText>
                </View>
                <TouchableOpacity
                  style={styles.reviewApplicationButton}
                  onPress={() => router.push(`/applications/${application.id}`)}
                >
                  <ThemedText style={styles.reviewButtonText}>{t('review', { ns: 'common' })}</ThemedText>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        );
      case 'history':
        return (
          <>
            {renderSearchAndFilters()}
            {renderTenantCards()}
          </>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title={t('renters', { ns: 'common' })} />

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'active' && styles.activeTab]}
          onPress={() => setActiveTab('active')}
        >
          <ThemedText style={[styles.tabText, activeTab === 'active' && styles.activeTabText]}>
            {t('active', { ns: 'common' })} ({tenants.filter(t => !isEligibleForReview(t.leaseEnd)).length})
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'applications' && styles.activeTab]}
          onPress={() => setActiveTab('applications')}
        >
          <ThemedText
            style={[styles.tabText, activeTab === 'applications' && styles.activeTabText]}
          >
            {t('applications', { ns: 'common' })} ({applications.length})
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'history' && styles.activeTab]}
          onPress={() => setActiveTab('history')}
        >
          <ThemedText style={[styles.tabText, activeTab === 'history' && styles.activeTabText]}>
            {t('history', { ns: 'common' })}
          </ThemedText>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>{renderTabContent()}</ScrollView>

      {/* Renter Review Modal */}
      {selectedTenant && (
        <RenterReviewModal
          visible={showReviewModal}
          onClose={() => setShowReviewModal(false)}
          onSubmit={handleSubmitReview}
          contractId={`contract-${selectedTenant.id}`}
          renterId={selectedTenant.id}
          renterName={selectedTenant.fullName}
          propertyId={selectedTenant.propertyId}
          propertyName={selectedTenant.propertyName}
          leaseEnd={selectedTenant.leaseEnd}
        />
      )}
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
  tenantDetails: {
    flex: 1,
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
    paddingHorizontal: 12,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailsButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewButton: {
    backgroundColor: '#27AE60',
    borderRadius: 4,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    textAlign: 'center',
  },
  buttonIcon: {
    marginRight: 6,
  },
  reviewApplicationButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  reviewButtonText: {
    color: 'white',
    fontSize: 14,
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
  reviewedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#27AE60',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginLeft: 'auto',
  },
  reviewedBadgeText: {
    color: 'white',
    fontSize: 12,
    marginLeft: 4,
  },
  pendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2994A',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginLeft: 'auto',
  },
  pendingBadgeText: {
    color: 'white',
    fontSize: 12,
    marginLeft: 4,
  },
  expiredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EB5757',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginLeft: 'auto',
  },
  expiredBadgeText: {
    color: 'white',
    fontSize: 12,
    marginLeft: 4,
  },
  upcomingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2F80ED',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginLeft: 'auto',
  },
  upcomingBadgeText: {
    color: 'white',
    fontSize: 12,
    marginLeft: 4,
  },
  filtersContainer: {
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    padding: 0,
  },
  filterButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  filterButton: {
    flex: 1,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 4,
    borderRadius: 4,
  },
  filterButtonActive: {
    backgroundColor: '#34568B',
  },
  filterButtonText: {
    color: '#7F8FA4',
    fontSize: 12,
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },
  emptyStateContainer: {
    alignItems: 'center',
    padding: 32,
  },
  emptyStateText: {
    marginTop: 16,
    fontSize: 14,
    color: '#7F8FA4',
    textAlign: 'center',
  }
});
