import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Text, SafeAreaView, Alert, Platform } from 'react-native';
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
import { Loader } from '@/app/components/animations';
import type { Property } from '@/types';
import ImageViewing from 'react-native-image-viewing';
import { Ionicons } from '@expo/vector-icons';

export default function PropertyDetails() {
  const { t } = useTranslation(['common', 'property', 'propertyDetails']);
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const { language } = useLanguage();
  const isRTL = language === 'ar';

  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [showRentRequestModal, setShowRentRequestModal] = useState(false);
  const [isImageViewerVisible, setImageViewerVisible] = useState(false);
  const [imageViewerIndex, setImageViewerIndex] = useState(0);

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

  const handleSubmitRentRequest = async (months: number) => {
    setShowRentRequestModal(false);

    try {
      // Submit rent request using mock API
      await mockApi.sendRentRequest({
        renterId: user?.id as string,
        propertyId: property?.id as string,
        landlordId: property?.ownerId as string,
        months: months,
        requestDate: new Date().toISOString(),
        status: 'pending',
      });

      Alert.alert(t('success', { ns: 'common' }), t('rentRequestSent', { ns: 'propertyDetails' }), [
        { text: t('ok', { ns: 'common' }) },
      ]);
    } catch (error) {
      console.error('Error sending rent request:', error);
      Alert.alert(
        t('error', { ns: 'common' }),
        t('errorSendingRequest', { ns: 'propertyDetails' }),
      );
    }
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
});
