import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/contexts/LanguageContext';
import { ThemedText } from '@/components/ThemedText';
import { mockApi } from '@/app/services/mockApi';
import { useAuth } from '@/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { PropertyReviewCard } from '@/app/components/reviews/PropertyReviewCard';
import { PropertyReviewModal } from '@/app/components/reviews/PropertyReviewModal';
import { Property, PropertyReview } from '@/app/types';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

export default function PropertyReviews() {
  const { t } = useTranslation(['common', 'reviews']);
  const { language } = useLanguage();
  const { user } = useAuth();
  const isRTL = language === 'ar';

  const [loading, setLoading] = useState(true);
  const [propertiesEligibleForReview, setPropertiesEligibleForReview] = useState<Property[]>([]);
  const [propertyReviews, setPropertyReviews] = useState<PropertyReview[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'pending' | 'completed'>('pending');

  useEffect(() => {
    if (!user) return;
    
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch properties eligible for review
        const eligibleProperties = await mockApi.getPropertiesEligibleForReview(user.id);
        setPropertiesEligibleForReview(eligibleProperties);

        // Fetch already submitted reviews
        const reviews: PropertyReview[] = [];
        for (const property of eligibleProperties) {
          const propertyReviews = await mockApi.getPropertyReviews(property.id);
          reviews.push(...propertyReviews);
        }
        setPropertyReviews(reviews);
      } catch (error) {
        console.error('Error fetching property review data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleReviewSubmit = () => {
    setShowReviewModal(false);
    // Refresh data after submitting a review
    if (user) {
      mockApi.getPropertiesEligibleForReview(user.id).then(setPropertiesEligibleForReview);
    }
  };

  const handleWriteReview = (property: Property) => {
    setSelectedProperty(property);
    setShowReviewModal(true);
  };

  const calculateDaysLeft = (leaseEndDate: string) => {
    const endDate = new Date(leaseEndDate);
    const reviewDeadline = new Date(endDate);
    reviewDeadline.setDate(reviewDeadline.getDate() + 30); // 30 days to review
    
    const today = new Date();
    const daysLeft = Math.ceil((reviewDeadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    return daysLeft > 0 ? daysLeft : 0;
  };

  // Filter properties that have not been reviewed yet
  const pendingReviews = propertiesEligibleForReview.filter(property => 
    !propertyReviews.some(review => review.propertyId === property.id)
  );

  // Get properties that have been reviewed
  const completedReviews = propertyReviews;

  const renderPendingItem = ({ item }: { item: Property }) => {
    const daysLeft = calculateDaysLeft(item.updatedAt); // Using updatedAt as a proxy for lease end date
    const isExpired = daysLeft <= 0;

    return (
      <View style={styles.pendingReviewCard}>
        <View style={styles.pendingReviewHeader}>
          <ThemedText style={styles.propertyName}>{item.title}</ThemedText>
          <View style={[
            styles.statusBadge,
            isExpired ? styles.expiredBadge : styles.pendingBadge
          ]}>
            <ThemedText style={styles.statusText}>
              {isExpired 
                ? t('reviewExpired', { ns: 'reviews' })
                : `${daysLeft} ${t('daysLeft', { ns: 'reviews' })}`
              }
            </ThemedText>
          </View>
        </View>
        
        <View style={styles.propertyDetails}>
          <Ionicons name="location-outline" size={16} color="#7F8FA4" />
          <ThemedText style={styles.propertyLocation}>
            {item.location.area}, {item.location.city}
          </ThemedText>
        </View>
        
        <TouchableOpacity 
          style={[
            styles.writeReviewButton,
            isExpired && styles.disabledButton
          ]}
          onPress={() => !isExpired && handleWriteReview(item)}
          disabled={isExpired}
        >
          <Ionicons name="star-outline" size={18} color={isExpired ? "#BDBDBD" : "#FFFFFF"} />
          <ThemedText style={[
            styles.writeReviewText,
            isExpired && styles.disabledText
          ]}>
            {t('writeReview', { ns: 'reviews' })}
          </ThemedText>
        </TouchableOpacity>
      </View>
    );
  };

  const renderCompletedItem = ({ item }: { item: PropertyReview }) => (
    <PropertyReviewCard 
      review={item}
      showLandlordInfo={true}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="star-outline" size={60} color="#BDBDBD" />
      <ThemedText style={styles.emptyStateText}>
        {activeTab === 'pending' 
          ? t('noPropertiesToReview', { ns: 'reviews' }) 
          : t('noReviewsYet', { ns: 'reviews' })}
      </ThemedText>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons 
            name={isRTL ? "chevron-forward" : "chevron-back"} 
            size={24} 
            color="#FFFFFF" 
          />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>
          {t('reviewProperty', { ns: 'reviews' })}
        </ThemedText>
      </View>

      <View style={styles.tabsContainer}>
        <TouchableOpacity 
          style={[
            styles.tab, 
            activeTab === 'pending' && styles.activeTab
          ]}
          onPress={() => setActiveTab('pending')}
        >
          <ThemedText style={[
            styles.tabText,
            activeTab === 'pending' && styles.activeTabText
          ]}>
            {t('pendingPropertyReviews', { ns: 'reviews' })}
          </ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.tab, 
            activeTab === 'completed' && styles.activeTab
          ]}
          onPress={() => setActiveTab('completed')}
        >
          <ThemedText style={[
            styles.tabText,
            activeTab === 'completed' && styles.activeTabText
          ]}>
            {t('reviewedProperties', { ns: 'reviews' })}
          </ThemedText>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#34568B" />
        </View>
      ) : (
        <FlatList
          data={activeTab === 'pending' ? pendingReviews : completedReviews}
          renderItem={activeTab === 'pending' ? renderPendingItem : renderCompletedItem}
          keyExtractor={(item) => activeTab === 'pending' ? item.id : (item as PropertyReview).id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmptyState}
        />
      )}

      {selectedProperty && (
        <PropertyReviewModal
          visible={showReviewModal}
          onClose={() => setShowReviewModal(false)}
          onSubmit={handleReviewSubmit}
          contractId="mock-contract-id" // In a real app, you would get the actual contract ID
          propertyId={selectedProperty.id}
          propertyName={selectedProperty.title}
          landlordId={selectedProperty.ownerId}
          landlordName="Landlord Name" // In a real app, you would get the actual landlord name
          leaseEnd={selectedProperty.updatedAt} // Using updatedAt as a proxy for lease end date
        />
      )}

      <View style={styles.infoContainer}>
        <Ionicons name="information-circle-outline" size={20} color="#7F8FA4" />
        <ThemedText style={styles.infoText}>
          {t('reviewTimeWindow', { ns: 'reviews' })}
        </ThemedText>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    backgroundColor: '#34568B',
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#34568B',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#7F8FA4',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
    paddingBottom: 80,
  },
  pendingReviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  pendingReviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  propertyName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  pendingBadge: {
    backgroundColor: '#F2994A',
  },
  expiredBadge: {
    backgroundColor: '#EB5757',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  propertyDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  propertyLocation: {
    fontSize: 14,
    color: '#7F8FA4',
    marginLeft: 6,
  },
  writeReviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#34568B',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  disabledButton: {
    backgroundColor: '#F0F0F0',
  },
  writeReviewText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  disabledText: {
    color: '#BDBDBD',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#7F8FA4',
    textAlign: 'center',
    marginTop: 16,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  infoText: {
    fontSize: 12,
    color: '#7F8FA4',
    marginLeft: 8,
    flex: 1,
  },
}); 