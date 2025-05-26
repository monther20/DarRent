import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert, Button } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { mockApi } from '../services/mockApi';
import type { RentRequest, Property } from '../types';
import { useAuth } from '../contexts/AuthContext'; // Adjusted path
import { useLanguage } from '../../contexts/LanguageContext'; // Corrected path

export default function RentRequestDetailsScreen() {
  const { t } = useTranslation(['propertyDetails', 'common']);
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const { language } = useLanguage();
  const isRTL = language === 'ar';

  const [request, setRequest] = useState<RentRequest | null>(null);
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (id && typeof id === 'string') {
      fetchRequestDetails(id);
    } else {
      setError(t('requestNotFound', { ns: 'propertyDetails' }));
      setLoading(false);
    }
  }, [id, t]);

  const fetchRequestDetails = async (requestId: string) => {
    setLoading(true);
    setError(null);
    try {
      const rentRequestData = await mockApi.getRentRequestById(requestId);
      if (rentRequestData) {
        setRequest(rentRequestData);
        const propertyData = await mockApi.getPropertyById(rentRequestData.propertyId);
        setProperty(propertyData);
      } else {
        setError(t('requestNotFound', { ns: 'propertyDetails' }));
      }
    } catch (err) {
      console.error('Error fetching rent request details:', err);
      setError(t('errorLoadingRequest', { ns: 'propertyDetails' }));
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRequestStatus = async (newStatus: 'accepted' | 'rejected') => {
    if (!id || typeof id !== 'string' || !request) return;

    setIsSubmitting(true);
    try {
      await mockApi.updateRentRequestStatus(id, newStatus);
      Alert.alert(
        t('common:success'),
        t('propertyDetails:requestStatusUpdated', { status: t(`propertyDetails:status.${newStatus}`) })
      );
      fetchRequestDetails(id); // Refetch to update UI
    } catch (err) {
      console.error('Error updating rent request status:', err);
      Alert.alert(t('common:error'), t('propertyDetails:errorUpdatingStatus'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#34568B" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!request || !property) {
    return (
      <View style={styles.centered}>
        <Text>{t('requestNotFound', { ns: 'propertyDetails' })}</Text>
      </View>
    );
  }

  const detailItem = (label: string, value?: string | number) => (
    <View style={[styles.detailItem, isRTL && styles.detailItemRTL]}>
      <Text style={styles.detailLabel}>{label}:</Text>
      <Text style={styles.detailValue}>{value || '-'}</Text>
    </View>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={[styles.title, isRTL && styles.titleRTL]}>
        {t('rentRequestDetails', { ns: 'propertyDetails' })}
      </Text>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, isRTL && styles.sectionTitleRTL]}>
          {t('propertyInfo', { ns: 'propertyDetails' })}
        </Text>
        {detailItem(t('property', { ns: 'propertyDetails' }), property.title)}
        {detailItem(t('location', { ns: 'propertyDetails' }), `${property.location.area}, ${property.location.city}`)}
        {detailItem(t('price', { ns: 'propertyDetails' }), `${property.price} ${property.currency}/${t('month', { ns: 'common' })}`)}
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, isRTL && styles.sectionTitleRTL]}>
          {t('requestDetails', { ns: 'propertyDetails' })}
        </Text>
        {detailItem(t('requested', { ns: 'propertyDetails' }), new Date(request.requestDate).toLocaleDateString())}
        {detailItem(t('rentalPeriod', { ns: 'propertyDetails' }), `${request.months} ${t('months', { ns: 'propertyDetails' })}`)}
        {detailItem(t('status.title', { ns: 'common', defaultValue: 'Status' }), t(`status.${request.status}`, { ns: 'propertyDetails', defaultValue: request.status }))}
        {request.message && detailItem(t('message', { ns: 'propertyDetails.rentRequestForm', defaultValue: 'Message' }), request.message)}
        {request.responseDate && detailItem(t('responseDate', { ns: 'propertyDetails', defaultValue: 'Response Date' }), new Date(request.responseDate).toLocaleDateString())}
      </View>

      {/* Action Buttons */}
      {user && request && (
        <View style={styles.actionsContainer}>
          {user.role === 'landlord' && request.status === 'pending' && (
            <>
              <View style={styles.buttonWrapper}>
                <Button
                  title={t('propertyDetails:actions.accept', 'Accept')}
                  onPress={() => handleUpdateRequestStatus('accepted')}
                  disabled={isSubmitting}
                  color="#4CAF50"
                />
              </View>
              <View style={styles.buttonWrapper}>
                <Button
                  title={t('propertyDetails:actions.reject', 'Reject')}
                  onPress={() => handleUpdateRequestStatus('rejected')}
                  disabled={isSubmitting}
                  color="#F44336"
                />
              </View>
            </>
          )}
          {user.role === 'renter' && request.status === 'pending' && (
            <View style={styles.buttonWrapperFull}>
              <Button
                title={t('propertyDetails:actions.cancelRequest', 'Cancel Request')}
                onPress={() => handleUpdateRequestStatus('rejected')} // Renters cancelling effectively "rejects" their own request
                disabled={isSubmitting}
                color="#FF9800"
              />
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  contentContainer: {
    padding: 20,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#34568B',
    marginBottom: 20,
    textAlign: 'left',
  },
  titleRTL: {
    textAlign: 'right',
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    textAlign: 'left',
  },
  sectionTitleRTL: {
    textAlign: 'right',
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  detailItemRTL: {
    flexDirection: 'row-reverse',
  },
  detailLabel: {
    fontSize: 16,
    color: '#555555',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 16,
    color: '#333333',
    textAlign: 'right',
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
  },
  actionsContainer: {
    marginTop: 20,
    paddingHorizontal: 10, // Match section padding
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  buttonWrapper: {
    marginVertical: 5,
  },
  buttonWrapperFull: {
    marginVertical: 5,
  },
});
