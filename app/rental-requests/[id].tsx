import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { mockApi } from '../services/mockApi';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Loader, SuccessAnimation } from '@/app/components/animations';

export default function RentRequestDetails() {
  const { t } = useTranslation(['common', 'rental', 'property', 'propertyDetails']);
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const { language } = useLanguage();
  const isRTL = language === 'ar';

  const [rentRequest, setRentRequest] = useState<any>(null);
  const [property, setProperty] = useState<any>(null);
  const [renter, setRenter] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processingAction, setProcessingAction] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    async function fetchRequestData() {
      setLoading(true);
      try {
        // Fetch rent request details
        const request = await mockApi.getRentRequestById(id as string);
        setRentRequest(request);

        // Fetch property details
        const propertyData = await mockApi.getPropertyById(request.propertyId);
        setProperty(propertyData);

        // Fetch renter details
        const renterData = await mockApi.getUserById(request.renterId);
        setRenter(renterData);
      } catch (error) {
        console.error('Error fetching request details:', error);
        Alert.alert(
          t('error', { ns: 'common' }),
          t('errorLoadingRequest', { ns: 'propertyDetails' }),
        );
      } finally {
        setLoading(false);
      }
    }

    fetchRequestData();
  }, [id, t]);

  const handleAcceptRequest = async () => {
    setProcessingAction(true);
    try {
      // Check if contract already exists
      const existingContract = await mockApi.getContractByProperty(property.id, renter.id);

      if (existingContract) {
        // Send existing contract
        await mockApi.updateRentRequest(rentRequest.id, {
          ...rentRequest,
          status: 'accepted',
          contractId: existingContract.id,
          responseDate: new Date().toISOString(),
        });

        setSuccessMessage(t('requestAccepted', { ns: 'propertyDetails' }));
        setShowSuccess(true);

        // Navigate back after showing success animation
        setTimeout(() => {
          router.back();
        }, 2500);
      } else {
        // Redirect to create contract screen
        await mockApi.updateRentRequest(rentRequest.id, {
          ...rentRequest,
          status: 'accepted',
          responseDate: new Date().toISOString(),
        });

        router.push({
          pathname: `/contracts/create`,
          params: {
            propertyId: property.id,
            renterId: renter.id,
            requestId: rentRequest.id,
            months: rentRequest.months,
          },
        });
      }
    } catch (error) {
      console.error('Error accepting request:', error);
      Alert.alert(
        t('error', { ns: 'common' }),
        t('errorAcceptingRequest', { ns: 'propertyDetails' }),
      );
      setProcessingAction(false);
    }
  };

  const handleRejectRequest = async () => {
    Alert.alert(
      t('confirm', { ns: 'common' }),
      t('rejectRequestConfirm', { ns: 'propertyDetails' }),
      [
        { text: t('cancel', { ns: 'common' }) },
        {
          text: t('confirm', { ns: 'common' }),
          onPress: async () => {
            setProcessingAction(true);
            try {
              await mockApi.updateRentRequest(rentRequest.id, {
                ...rentRequest,
                status: 'rejected',
                responseDate: new Date().toISOString(),
              });

              setSuccessMessage(t('requestRejected', { ns: 'propertyDetails' }));
              setShowSuccess(true);

              // Navigate back after showing success animation
              setTimeout(() => {
                router.back();
              }, 2500);
            } catch (error) {
              console.error('Error rejecting request:', error);
              Alert.alert(
                t('error', { ns: 'common' }),
                t('errorRejectingRequest', { ns: 'propertyDetails' }),
              );
              setProcessingAction(false);
            }
          },
        },
      ],
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Loader size={120} />
      </SafeAreaView>
    );
  }

  if (showSuccess) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <SuccessAnimation message={successMessage} size={150} />
      </SafeAreaView>
    );
  }

  if (!rentRequest || !property || !renter) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>{t('requestNotFound', { ns: 'propertyDetails' })}</Text>
      </SafeAreaView>
    );
  }

  // Format date and time
  const requestDate = new Date(rentRequest.requestDate);
  const formattedDate = requestDate.toLocaleDateString(language, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const formattedTime = requestDate.toLocaleTimeString(language, {
    hour: '2-digit',
    minute: '2-digit',
  });

  const totalAmount = rentRequest.months * property.price;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={[styles.scrollView, isRTL && styles.rtlContainer]}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={[styles.backButton, isRTL ? styles.backButtonRTL : styles.backButtonLTR]}
            onPress={() => router.back()}
          >
            <Ionicons name={isRTL ? 'chevron-forward' : 'chevron-back'} size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {t('rentRequestDetails', { ns: 'propertyDetails' })}
          </Text>
        </View>

        {/* Request Status */}
        <View style={styles.statusContainer}>
          <View style={[styles.statusBadge, getStatusBadgeStyle(rentRequest.status)]}>
            <Text style={styles.statusText}>
              {t(`status.${rentRequest.status}`, { ns: 'propertyDetails' })}
            </Text>
          </View>
          <View style={styles.dateContainer}>
            <Text style={styles.dateLabel}>{t('requested', { ns: 'propertyDetails' })}</Text>
            <Text style={styles.dateValue}>
              {formattedDate} {formattedTime}
            </Text>
          </View>
        </View>

        {/* Property Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('propertyInfo', { ns: 'propertyDetails' })}</Text>
          <View style={styles.propertyCard}>
            <View style={styles.propertyHeader}>
              <Text style={styles.propertyTitle}>{property.title}</Text>
              <Text style={styles.propertyPrice}>
                {property.price} {property.currency}/{t('month', { ns: 'common' })}
              </Text>
            </View>
            <Text style={styles.propertyLocation}>
              {property.location.area}, {property.location.city}
            </Text>
            <View style={styles.propertyFeatures}>
              <View style={styles.featureItem}>
                <Ionicons name="bed-outline" size={18} color="#666" />
                <Text style={styles.featureText}>
                  {property.features.bedrooms} {t('bed', { ns: 'property' })}
                </Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="water-outline" size={18} color="#666" />
                <Text style={styles.featureText}>
                  {property.features.bathrooms} {t('bath', { ns: 'property' })}
                </Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="expand-outline" size={18} color="#666" />
                <Text style={styles.featureText}>{property.features.size} m²</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Renter Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('renterInfo', { ns: 'propertyDetails' })}</Text>
          <View style={styles.renterCard}>
            <View style={styles.renterHeader}>
              <Ionicons name="person-circle-outline" size={40} color="#34568B" />
              <View style={styles.renterDetails}>
                <Text style={styles.renterName}>{renter.fullName}</Text>
                <View style={styles.ratingContainer}>
                  <Ionicons name="star" size={16} color="#FFC107" />
                  <Text style={styles.ratingText}>{renter.rating || '4.5'}</Text>
                </View>
              </View>
            </View>
            <View style={styles.renterContact}>
              <View style={styles.contactItem}>
                <Ionicons name="mail-outline" size={18} color="#666" />
                <Text style={styles.contactText}>{renter.email}</Text>
              </View>
              <View style={styles.contactItem}>
                <Ionicons name="call-outline" size={18} color="#666" />
                <Text style={styles.contactText}>{renter.phoneNumber}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Request Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('requestDetails', { ns: 'propertyDetails' })}</Text>
          <View style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t('rentalPeriod', { ns: 'propertyDetails' })}</Text>
              <Text style={styles.detailValue}>
                {rentRequest.months} {t('months', { ns: 'propertyDetails' })}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t('monthlyRent', { ns: 'propertyDetails' })}</Text>
              <Text style={styles.detailValue}>
                {property.price} {property.currency}
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.detailRow}>
              <Text style={styles.totalLabel}>{t('totalAmount', { ns: 'propertyDetails' })}</Text>
              <Text style={styles.totalValue}>
                {totalAmount} {property.currency}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Actions */}
      {rentRequest.status === 'pending' && (
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.rejectButton]}
            onPress={handleRejectRequest}
            disabled={processingAction}
          >
            <Text style={styles.rejectButtonText}>{t('reject', { ns: 'common' })}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.acceptButton]}
            onPress={handleAcceptRequest}
            disabled={processingAction}
          >
            {processingAction ? (
              <Loader size={24} />
            ) : (
              <Text style={styles.acceptButtonText}>{t('accept', { ns: 'common' })}</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

// Function to get badge style based on status
function getStatusBadgeStyle(status: string) {
  switch (status) {
    case 'pending':
      return styles.statusPending;
    case 'accepted':
      return styles.statusAccepted;
    case 'rejected':
      return styles.statusRejected;
    default:
      return styles.statusPending;
  }
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
  scrollView: {
    flex: 1,
  },
  rtlContainer: {
    direction: 'rtl',
  },
  contentContainer: {
    paddingBottom: 100,
  },
  errorText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginTop: 50,
  },
  header: {
    backgroundColor: '#34568B',
    paddingTop: 16,
    paddingBottom: 16,
    paddingHorizontal: 16,
    alignItems: 'center',
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    top: 16,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  backButtonLTR: {
    left: 16,
  },
  backButtonRTL: {
    right: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  statusContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 8,
  },
  statusPending: {
    backgroundColor: '#FFC107',
  },
  statusAccepted: {
    backgroundColor: '#4CAF50',
  },
  statusRejected: {
    backgroundColor: '#F44336',
  },
  statusText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  dateContainer: {
    marginTop: 4,
  },
  dateLabel: {
    fontSize: 14,
    color: '#888',
  },
  dateValue: {
    fontSize: 14,
    color: '#333',
  },
  section: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#34568B',
  },
  propertyCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  propertyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  propertyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  propertyPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#34568B',
  },
  propertyLocation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  propertyFeatures: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureText: {
    marginLeft: 4,
    fontSize: 13,
    color: '#666',
  },
  renterCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  renterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  renterDetails: {
    marginLeft: 12,
  },
  renterName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#666',
  },
  renterContact: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 12,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  contactText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  detailsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#34568B',
  },
  actionsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  actionButton: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rejectButton: {
    backgroundColor: '#f0f0f0',
    marginRight: 8,
  },
  rejectButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F44336',
  },
  acceptButton: {
    backgroundColor: '#34568B',
  },
  acceptButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
