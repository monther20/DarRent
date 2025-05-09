import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { mockApi } from '../../services/mockApi';

export default function RentRequestDetailsScreen() {
  const { t } = useTranslation(['propertyDetails', 'common']);
  const { language } = useLanguage();
  const { user } = useAuth();
  const isRTL = language === 'ar';
  const { id } = useLocalSearchParams();

  const [rentRequest, setRentRequest] = useState(null);
  const [property, setProperty] = useState(null);
  const [renter, setRenter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [hasExistingContract, setHasExistingContract] = useState(false);

  useEffect(() => {
    async function fetchRequestDetails() {
      try {
        setLoading(true);

        // Fetch the rent request
        const requestData = await mockApi.getRentRequestById(id as string);
        setRentRequest(requestData);

        // Fetch associated property
        const propertyData = await mockApi.getPropertyById(requestData.propertyId);
        setProperty(propertyData);

        // Fetch renter information
        const renterData = await mockApi.getUserById(requestData.renterId);
        setRenter(renterData);

        // Check if there's an existing contract
        const contracts = await mockApi.getContractsByPropertyId(requestData.propertyId);
        setHasExistingContract(contracts.length > 0);
      } catch (error) {
        console.error('Error fetching request details:', error);
        Alert.alert('Error', 'Failed to load request details');
      } finally {
        setLoading(false);
      }
    }

    fetchRequestDetails();
  }, [id]);

  const handleAcceptRequest = async () => {
    try {
      setProcessing(true);

      // Update the rent request status to accepted
      await mockApi.updateRentRequestStatus(id as string, 'accepted');

      // Navigate to appropriate screen based on contract existence
      if (hasExistingContract) {
        router.push(`/contracts/send/${id}`);
      } else {
        router.push(`/contracts/create/${id}`);
      }
    } catch (error) {
      console.error('Error accepting request:', error);
      Alert.alert('Error', 'Failed to accept the request. Please try again.');
      setProcessing(false);
    }
  };

  const handleRejectRequest = async () => {
    Alert.alert('Reject Request', 'Are you sure you want to reject this rent request?', [
      {
        text: t('cancel', { ns: 'common' }),
        style: 'cancel',
      },
      {
        text: 'Reject',
        onPress: async () => {
          try {
            setProcessing(true);
            await mockApi.updateRentRequestStatus(id as string, 'rejected');
            router.back();
          } catch (error) {
            console.error('Error rejecting request:', error);
            Alert.alert('Error', 'Failed to reject the request. Please try again.');
            setProcessing(false);
          }
        },
        style: 'destructive',
      },
    ]);
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#34568B" />
      </View>
    );
  }

  if (!rentRequest || !property || !renter) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Request details not found</Text>
      </View>
    );
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString(language === 'ar' ? 'ar-JO' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Stack.Screen
        options={{
          headerShown: true,
          title: t('landlord.newRequest', { ns: 'propertyDetails' }),
          headerStyle: {
            backgroundColor: '#34568B',
          },
          headerTintColor: '#fff',
        }}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Property Summary */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('landlord.property', { ns: 'propertyDetails' })}</Text>
          <View style={styles.propertyRow}>
            <Image source={{ uri: property.images[0] }} style={styles.propertyImage} />
            <View style={styles.propertyInfo}>
              <Text style={styles.propertyName}>{property.title}</Text>
              <Text style={styles.propertyPrice}>
                {property.price} {property.currency}/{t('month', { ns: 'propertyDetails' })}
              </Text>
              <Text style={styles.propertyLocation}>
                {property.location.area}, {property.location.city}
              </Text>
            </View>
          </View>
        </View>

        {/* Renter Information */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('landlord.renter', { ns: 'propertyDetails' })}</Text>
          <View style={styles.renterInfo}>
            <View style={styles.renterAvatar}>
              <Text style={styles.renterInitials}>
                {renter.fullName
                  .split(' ')
                  .map((n) => n[0])
                  .join('')}
              </Text>
            </View>
            <View style={styles.renterDetails}>
              <Text style={styles.renterName}>{renter.fullName}</Text>
              <Text style={styles.renterEmail}>{renter.email}</Text>

              <View style={styles.ratingContainer}>
                <Text style={styles.ratingLabel}>
                  {t('landlord.rating', { ns: 'propertyDetails' })}:{' '}
                </Text>
                <View style={styles.stars}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Ionicons
                      key={star}
                      name={star <= (renter.rating || 0) ? 'star' : 'star-outline'}
                      size={16}
                      color="#F5B041"
                    />
                  ))}
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Request Details */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            {t('rentRequestForm.title', { ns: 'propertyDetails' })}
          </Text>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>
              {t('landlord.duration', { ns: 'propertyDetails' })}
            </Text>
            <Text style={styles.detailValue}>
              {rentRequest.duration} {t('rentRequestForm.months', { ns: 'propertyDetails' })}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>
              {t('rentRequestForm.startDate', { ns: 'propertyDetails' })}
            </Text>
            <Text style={styles.detailValue}>{formatDate(rentRequest.startDate)}</Text>
          </View>

          <View style={styles.messageContainer}>
            <Text style={styles.messageLabel}>
              {t('rentRequestForm.message', { ns: 'propertyDetails' })}
            </Text>
            <View style={styles.messageBox}>
              <Text style={styles.messageText}>{rentRequest.message || 'No message provided'}</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.rejectButton}
            onPress={handleRejectRequest}
            disabled={processing}
          >
            <Text style={styles.rejectButtonText}>
              {t('landlord.reject', { ns: 'propertyDetails' })}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.acceptButton}
            onPress={handleAcceptRequest}
            disabled={processing}
          >
            {processing ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.acceptButtonText}>
                {t('landlord.accept', { ns: 'propertyDetails' })}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#34568B',
    marginBottom: 12,
  },
  propertyRow: {
    flexDirection: 'row',
  },
  propertyImage: {
    width: 80,
    height: 80,
    borderRadius: 6,
  },
  propertyInfo: {
    flex: 1,
    marginLeft: 12,
  },
  propertyName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  propertyPrice: {
    fontSize: 15,
    color: '#34568B',
    marginBottom: 4,
  },
  propertyLocation: {
    fontSize: 14,
    color: '#666',
  },
  renterInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  renterAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#34568B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  renterInitials: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  renterDetails: {
    flex: 1,
    marginLeft: 12,
  },
  renterName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  renterEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingLabel: {
    fontSize: 14,
    color: '#666',
  },
  stars: {
    flexDirection: 'row',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailLabel: {
    fontSize: 15,
    color: '#666',
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  messageContainer: {
    marginTop: 12,
  },
  messageLabel: {
    fontSize: 15,
    color: '#666',
    marginBottom: 6,
  },
  messageBox: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#eee',
  },
  messageText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  rejectButton: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    padding: 16,
    borderRadius: 8,
    marginRight: 8,
    alignItems: 'center',
  },
  rejectButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  acceptButton: {
    flex: 2,
    backgroundColor: '#34568B',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  acceptButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
