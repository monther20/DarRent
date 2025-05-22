import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Text, SafeAreaView, Alert, Platform, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { mockApi } from '../services/mockApi';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { PropertyGallery } from '@/app/components/property/PropertyGallery';
import { PropertyHeader } from '@/app/components/property/PropertyHeader';
import { PropertyInformation } from '@/app/components/property/PropertyInformation';
import { PropertyActionButtons } from '@/app/components/property/PropertyActionButtons';
import { RentRequestModal } from '@/app/components/property/RentRequestModal';
import { ViewingRequestModal } from '@/app/components/property/ViewingRequestModal';
import { Loader } from '@/app/components/animations';
import { PropertyReviewCard } from '@/app/components/reviews/PropertyReviewCard';
import type { Property, PropertyReview } from '@/types';
import ImageViewing from 'react-native-image-viewing';
import { Ionicons } from '@expo/vector-icons';

export default function PropertyDetails() {
  const { t } = useTranslation(['common', 'property', 'propertyDetails', 'viewings', 'reviews']);
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const { language } = useLanguage();
  const isRTL = language === 'ar';

  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [showRentRequestModal, setShowRentRequestModal] = useState(false);
  const [showViewingRequestModal, setShowViewingRequestModal] = useState(false);
  const [isImageViewerVisible, setImageViewerVisible] = useState(false);
  const [imageViewerIndex, setImageViewerIndex] = useState(0);
  const [propertyReviews, setPropertyReviews] = useState<PropertyReview[]>([]);

  useEffect(() => {
    async function fetchProperty() {
      setLoading(true);
      try {
        // Fetch the property details
        const propertyData = await mockApi.getPropertyById(id as string);
        setProperty(propertyData);

        // Check if the user has saved this property
        if (user) {
          const savedProperties = await mockApi.getSavedProperties(user.id);
          setIsSaved(savedProperties.some((p) => p.id === propertyData.id));
        }
        
        // Fetch property reviews
        const reviews = await mockApi.getPropertyReviews(id as string);
        setPropertyReviews(reviews);
      } catch (error) {
        console.error('Error fetching property:', error);
        Alert.alert(t('error', { ns: 'common' }), t('propertyNotFound', { ns: 'propertyDetails' }));
      } finally {
        setLoading(false);
      }
    }

    fetchProperty();
  }, [id, user, t]);

  const handleSaveProperty = async () => {
    if (!user) {
      Alert.alert(t('notice', { ns: 'common' }), t('loginToSave', { ns: 'propertyDetails' }), [
        { text: t('cancel', { ns: 'common' }) },
        { text: t('login', { ns: 'common' }), onPress: () => router.push('/login') },
      ]);
      return;
    }

    try {
      if (isSaved) {
        await mockApi.unsaveProperty(user.id, property?.id as string);
      } else {
        await mockApi.saveProperty(user.id, property?.id as string);
      }
      setIsSaved(!isSaved);

      Alert.alert(
        t('success', { ns: 'common' }),
        isSaved
          ? t('propertyUnsaved', { ns: 'propertyDetails' })
          : t('propertySaved', { ns: 'propertyDetails' }),
      );
    } catch (error) {
      console.error('Error saving property:', error);
      Alert.alert(
        t('error', { ns: 'common' }),
        t('errorSavingProperty', { ns: 'propertyDetails' }),
      );
    }
  };

  const handleSendRentRequest = () => {
    if (!user) {
      Alert.alert(t('notice', { ns: 'common' }), t('loginToRent', { ns: 'propertyDetails' }), [
        { text: t('cancel', { ns: 'common' }) },
        { text: t('login', { ns: 'common' }), onPress: () => router.push('/login') },
      ]);
      return;
    }

    // Check if property is available
    if (property?.status !== 'available') {
      Alert.alert(
        t('notice', { ns: 'common' }),
        t('propertyNotAvailable', { ns: 'propertyDetails' }),
      );
      return;
    }

    setShowRentRequestModal(true);
  };

  const handleRequestViewing = () => {
    if (!user) {
      Alert.alert(t('notice', { ns: 'common' }), t('loginToViewProperty', { ns: 'viewings' }), [
        { text: t('cancel', { ns: 'common' }) },
        { text: t('login', { ns: 'common' }), onPress: () => router.push('/login') },
      ]);
      return;
    }

    // Check if property is available
    if (property?.status !== 'available') {
      Alert.alert(
        t('notice', { ns: 'common' }),
        t('propertyNotAvailable', { ns: 'propertyDetails' }),
      );
      return;
    }

    setShowViewingRequestModal(true);
  };

  const handleSubmitRentRequest = async (months: number) => {
    setShowRentRequestModal(false);

    try {
      // Submit rent request using mock API
      const newRequest = await mockApi.sendRentRequest({
        renterId: user?.id as string,
        propertyId: property?.id as string,
        landlordId: property?.ownerId as string,
        months: months,
        requestDate: new Date().toISOString(),
        status: 'pending',
      });

      // Directly navigate to contract review for testing
      router.push({
        pathname: '/(renter-tabs)/ContractReview',
        params: {
          propertyId: newRequest.propertyId,
          requestId: newRequest.id,
        },
      });

      // Optionally, you can comment out the alert below
      // Alert.alert(t('success', { ns: 'common' }), t('rentRequestSent', { ns: 'propertyDetails' }), [
      //   { text: t('ok', { ns: 'common' }) },
      // ]);
    } catch (error) {
      console.error('Error sending rent request:', error);
      Alert.alert(
        t('error', { ns: 'common' }),
        t('errorSendingRequest', { ns: 'propertyDetails' }),
      );
    }
  };

  const handleSubmitViewingRequest = async (dates: string[], notes: string) => {
    setShowViewingRequestModal(false);

    try {
      // In a real implementation, this would send the request to the backend
      // For now, we're just showing a success message
      
      // Mock API call to send viewing request
      // TODO: Implement actual API call once backend is ready
      // await mockApi.sendViewingRequest({
      //   renterId: user?.id as string,
      //   propertyId: property?.id as string,
      //   landlordId: property?.ownerId as string,
      //   preferredDates: dates,
      //   notes: notes,
      //   status: 'pending',
      //   createdAt: new Date().toISOString(),
      // });

      Alert.alert(
        t('success', { ns: 'common' }), 
        t('viewingRequestSent', { ns: 'viewings' }),
        [{ text: t('ok', { ns: 'common' }) }]
      );
    } catch (error) {
      console.error('Error sending viewing request:', error);
      Alert.alert(
        t('error', { ns: 'common' }),
        t('errorSendingViewingRequest', { ns: 'viewings' }),
      );
    }
  };

  // Calculate average rating from reviews
  const getAverageRating = () => {
    if (propertyReviews.length === 0) return 0;
    const sum = propertyReviews.reduce((acc, review) => acc + review.overallRating, 0);
    return (sum / propertyReviews.length).toFixed(1);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Loader size={120} />
      </SafeAreaView>
    );
  }

  if (!property) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>{t('propertyNotFound', { ns: 'propertyDetails' })}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerWrapper}>
        <PropertyHeader
          title={property.title}
          location={`${property.location.area}, ${property.location.city}`}
          onBack={() => router.back()}
          isRTL={isRTL}
        />
      </View>

      <ScrollView
        style={[styles.scrollView, isRTL && styles.rtlContainer]}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.galleryShadowWrapper}>
          <PropertyGallery
            images={property.images}
            onImagePress={(index) => {
              setImageViewerIndex(index);
              setImageViewerVisible(true);
            }}
          />
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoAccentBar} />
          <View style={styles.infoCardContent}>
            <View style={styles.infoHeaderRow}>
              <View style={styles.statusBadgeAvailable}>
                <Text style={styles.statusBadgeText}>
                  {t('availableNow', { ns: 'propertyDetails' })}
                </Text>
              </View>
              <Text style={styles.priceText}>
                {property.price} {property.currency}/
                <Text style={styles.monthText}>{t('month', { ns: 'common' })}</Text>
              </Text>
            </View>
            <Text style={styles.infoDescription}>{property.description}</Text>
            <View style={styles.featuresRow}>
              <View style={styles.featureItem}>
                <Ionicons name="bed-outline" size={20} color="#34568B" />
                <Text style={styles.featureText}>
                  {property.features.bedrooms} {t('bed', { ns: 'property' })}
                </Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="water-outline" size={20} color="#34568B" />
                <Text style={styles.featureText}>
                  {property.features.bathrooms} {t('bath', { ns: 'property' })}
                </Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="expand-outline" size={20} color="#34568B" />
                <Text style={styles.featureText}>{property.features.size} m²</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.viewingButton]} 
            onPress={handleRequestViewing}
          >
            <Ionicons name="calendar-outline" size={20} color="#FFFFFF" style={styles.actionButtonIcon} />
            <Text style={styles.actionButtonText}>
              {t('requestViewing', { ns: 'viewings' })}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.rentButton]} 
            onPress={handleSendRentRequest}
          >
            <Ionicons name="home-outline" size={20} color="#FFFFFF" style={styles.actionButtonIcon} />
            <Text style={styles.actionButtonText}>
              {t('rentNow', { ns: 'propertyDetails' })}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Reviews Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="star-outline" size={20} color="#F2994A" />{' '}
            {t('reviews', { ns: 'reviews' })}
          </Text>
          
          {propertyReviews.length > 0 ? (
            <View>
              <View style={styles.reviewsSummary}>
                <View style={styles.ratingCircle}>
                  <Text style={styles.averageRating}>{getAverageRating()}</Text>
                </View>
                <Text style={styles.reviewCount}>
                  {propertyReviews.length} {propertyReviews.length === 1 
                    ? t('review', { ns: 'reviews' }) 
                    : t('reviews', { ns: 'reviews' })}
                </Text>
              </View>
              
              {/* Show first review only, with button to see more */}
              <PropertyReviewCard
                review={propertyReviews[0]}
                isExpanded={false}
              />
              
              {propertyReviews.length > 1 && (
                <TouchableOpacity 
                  style={styles.showAllReviewsButton}
                  onPress={() => router.push({
                    pathname: '/(renter-tabs)/property-reviews',
                    params: { propertyId: property.id }
                  })}
                >
                  <Text style={styles.showAllReviewsText}>
                    {t('viewAllReviews', { ns: 'reviews' })} ({propertyReviews.length})
                  </Text>
                  <Ionicons 
                    name={isRTL ? "chevron-back" : "chevron-forward"} 
                    size={16} 
                    color="#34568B" 
                  />
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <View style={styles.noReviewsContainer}>
              <Text style={styles.noReviewsText}>{t('noReviewsYet', { ns: 'reviews' })}</Text>
            </View>
          )}
        </View>

        {/* Amenities Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="list-outline" size={20} color="#F2994A" />{' '}
            {t('amenities', { ns: 'propertyDetails' })}
          </Text>
          <View style={styles.amenitiesGrid}>
            {(property.features.amenities || []).map((amenity: string, index: number) => (
              <View key={index} style={styles.amenityItem}>
                <Ionicons name="checkmark-circle-outline" size={20} color="#34568B" />
                <Text style={styles.amenityText}>{amenity}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Location Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="location-outline" size={20} color="#F2994A" />{' '}
            {t('location', { ns: 'propertyDetails' })}
          </Text>
          <View style={styles.locationBox}>
            <Ionicons name="location-outline" size={24} color="#34568B" />
            <Text style={styles.locationText}>
              {property.location.area}, {property.location.city}
            </Text>
          </View>
          <Text style={styles.locationDetails}>
            {property.location.details ||
              t('locationSharedAfterBooking', { ns: 'propertyDetails' })}
          </Text>
        </View>

        {/* Rules Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="alert-circle-outline" size={20} color="#F2994A" />{' '}
            {t('rules', { ns: 'propertyDetails' })}
          </Text>
          {(property.rules || []).map((rule: string, index: number) => (
            <View key={index} style={styles.ruleItem}>
              <Ionicons name="information-circle-outline" size={20} color="#34568B" />
              <Text style={styles.ruleText}>{rule}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <PropertyActionButtons
        onSave={handleSaveProperty}
        onRentRequest={handleSendRentRequest}
        isSaved={isSaved}
        isAvailable={property.status === 'available'}
        isRTL={isRTL}
      />

      <RentRequestModal
        visible={showRentRequestModal}
        onClose={() => setShowRentRequestModal(false)}
        onSubmit={handleSubmitRentRequest}
        propertyPrice={property.price}
        propertyCurrency={property.currency}
        isRTL={isRTL}
      />

      <ViewingRequestModal
        visible={showViewingRequestModal}
        propertyId={property.id}
        propertyTitle={property.title}
        onClose={() => setShowViewingRequestModal(false)}
        onSubmit={handleSubmitViewingRequest}
      />

      <ImageViewing
        images={property.images.map((uri: string) => ({ uri }))}
        imageIndex={imageViewerIndex}
        visible={isImageViewerVisible}
        onRequestClose={() => setImageViewerVisible(false)}
        backgroundColor="#000"
        swipeToCloseEnabled
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
  },
  headerWrapper: {
    backgroundColor: '#34568B',
    paddingBottom: 0,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
      },
      android: { elevation: 6 },
    }),
    zIndex: 2,
  },
  galleryShadowWrapper: {
    marginTop: 12,
    // marginHorizontal: 16,
    borderRadius: 18,
    backgroundColor: '#fff',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: { elevation: 4 },
    }),
    overflow: 'hidden',
    zIndex: 1,
  },
  infoCard: {
    marginTop: 20,
    marginHorizontal: 16,
    borderRadius: 18,
    backgroundColor: '#fff',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: { elevation: 2 },
    }),
    marginBottom: 16,
    overflow: 'hidden',
  },
  infoAccentBar: {
    height: 6,
    backgroundColor: '#F2994A',
    width: '100%',
  },
  infoCardContent: {
    padding: 18,
  },
  infoHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  statusBadgeAvailable: {
    backgroundColor: '#F2994A',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusBadgeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  priceText: {
    color: '#34568B',
    fontWeight: 'bold',
    fontSize: 22,
  },
  monthText: {
    fontSize: 14,
    color: '#34568B',
    fontWeight: '400',
  },
  infoDescription: {
    fontSize: 16,
    color: '#333',
    marginBottom: 14,
    marginTop: 2,
    lineHeight: 22,
  },
  featuresRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#34568B',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  rtlContainer: {
    direction: 'rtl',
  },
  contentContainer: {
    paddingBottom: 120,
  },
  errorText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginTop: 50,
  },
  section: {
    marginTop: 20,
    marginHorizontal: 16,
    padding: 18,
    borderRadius: 18,
    backgroundColor: '#fff',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: { elevation: 2 },
    }),
  },
  sectionTitle: {
    color: '#34568B',
    fontWeight: 'bold',
    fontSize: 22,
    marginBottom: 10,
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  amenityText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#34568B',
    fontWeight: '600',
  },
  locationBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#34568B',
    fontWeight: '600',
  },
  locationDetails: {
    fontSize: 14,
    color: '#333',
    marginTop: 8,
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ruleText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#34568B',
    fontWeight: '600',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    marginTop: 4,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: { elevation: 3 },
    }),
  },
  viewingButton: {
    backgroundColor: '#34568B',
    marginRight: 8,
  },
  rentButton: {
    backgroundColor: '#F2994A',
  },
  actionButtonIcon: {
    marginRight: 6,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  // New styles for reviews section
  reviewsSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  ratingCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F2994A',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  averageRating: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 20,
  },
  reviewCount: {
    fontSize: 16,
    color: '#4F4F4F',
  },
  showAllReviewsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    paddingVertical: 8,
    backgroundColor: '#F5F7FA',
    borderRadius: 8,
  },
  showAllReviewsText: {
    color: '#34568B',
    fontSize: 14,
    fontWeight: '500',
    marginRight: 4,
  },
  noReviewsContainer: {
    alignItems: 'center',
    padding: 20,
  },
  noReviewsText: {
    fontSize: 14,
    color: '#7F8FA4',
  },
});
