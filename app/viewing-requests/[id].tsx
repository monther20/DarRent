import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator, Text as RNText, TouchableOpacity } from 'react-native'; // Added TouchableOpacity
import { useLocalSearchParams, router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { mockApi } from '@/app/services/mockApi';
import { ViewingRequest, Property, User } from '@/app/types';
import { useAuth } from '@/contexts/AuthContext';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { ThemedButton } from '@/components/ThemedButton';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { enUS, arSA } from 'date-fns/locale';
import { useLanguage } from '@/contexts/LanguageContext';

export default function ViewingRequestDetailsScreen() {
  const { t } = useTranslation(['common', 'viewings', 'propertyDetails']);
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const { language } = useLanguage();
  const locale = language === 'ar' ? arSA : enUS;
  const isRTL = language === 'ar';

  const [request, setRequest] = useState<ViewingRequest | null>(null);
  const [property, setProperty] = useState<Property | null>(null);
  const [requester, setRequester] = useState<User | null>(null);
  const [landlord, setLandlord] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRequestDetails = async () => {
      if (!id) {
        setError(t('requestIdMissing', { ns: 'viewings' }));
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const fetchedRequest = await mockApi.getViewingRequestById(id as string);
        if (!fetchedRequest) {
          setError(t('viewingRequestNotFound', { ns: 'viewings' }));
          setRequest(null);
          setProperty(null);
          setLoading(false);
          return;
        }
        setRequest(fetchedRequest);

        const fetchedProperty = await mockApi.getPropertyById(fetchedRequest.propertyId);
        setProperty(fetchedProperty);
        
        // In a real app, you'd fetch user details by ID
        // For mock, we might need to enhance mockApi or assume user details are part of request/property
        // For now, let's assume we can get basic info or show IDs
        // const fetchedRequester = await mockApi.getUserById(fetchedRequest.renterId);
        // const fetchedLandlord = await mockApi.getUserById(fetchedRequest.landlordId);
        // setRequester(fetchedRequester);
        // setLandlord(fetchedLandlord);

      } catch (e) {
        console.error("Error fetching viewing request details:", e);
        setError(t('errorFetchingRequest', { ns: 'viewings' }));
      } finally {
        setLoading(false);
      }
    };

    fetchRequestDetails();
  }, [id, t]);

  const handleCancelRequest = async () => {
    if (!request || !user) return;
    // Add confirmation alert here if Alert was working
    console.log("Attempting to cancel request:", request.id); 
    try {
        const updatedRequest = await mockApi.updateViewingRequestStatus(request.id, 'cancelled', 'Cancelled by user.', user.id);
        if (updatedRequest) {
            setRequest(updatedRequest);
            // Add success alert/toast here
            console.log("Request cancelled successfully");
        } else {
            // Add error alert/toast here
             console.error("Failed to cancel request: API returned null");
        }
    } catch (e) {
        console.error("Error cancelling request:", e);
        // Add error alert/toast here
    }
  };
  
  const handleUpdateStatus = async (newStatus: 'confirmed' | 'rejected') => {
    if (!request || !user || user.id !== request.landlordId) return;
    // Add confirmation alert here
    console.log(`Attempting to update status to ${newStatus} for request:`, request.id);
    try {
        const reason = newStatus === 'rejected' ? 'Rejected by landlord' : undefined;
        const updatedRequest = await mockApi.updateViewingRequestStatus(request.id, newStatus, reason, user.id);
        if (updatedRequest) {
            setRequest(updatedRequest);
            // Add success alert/toast here
            console.log(`Request status updated to ${newStatus}`);
        } else {
            // Add error alert/toast here
            console.error("Failed to update status: API returned null");
        }
    } catch (e) {
        console.error("Error updating status:", e);
        // Add error alert/toast here
    }
  };


  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'PPPp', { locale }); // e.g., Sep 20, 2023, 2:00 PM
    } catch (e) {
      return dateString;
    }
  };
  
  const formatShortDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'PP', { locale }); // e.g., Sep 20, 2023
    } catch (e) {
      return dateString;
    }
  };

  const formatTime = (isoString: string) => {
    try {
      return format(new Date(isoString), 'p', { locale }); // e.g., 9:00 AM
    } catch (e) {
      return 'Invalid time';
    }
  };


  if (loading) {
    return <View style={styles.centered}><ActivityIndicator size="large" /></View>;
  }

  if (error) {
    return <View style={styles.centered}><ThemedText style={styles.errorText}>{error}</ThemedText></View>;
  }

  if (!request || !property) {
    return <View style={styles.centered}><ThemedText>{t('viewingRequestNotFound', { ns: 'viewings' })}</ThemedText></View>;
  }

  const canCancel = user && (user.id === request.renterId || user.id === request.landlordId) && (request.status === 'pending' || request.status === 'confirmed');
  const isLandlord = user && user.id === request.landlordId;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <ThemedView style={styles.card}>
        <ThemedText style={styles.title}>{t('viewingRequestDetails', { ns: 'viewings' })}</ThemedText>
        
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>{t('property', { ns: 'common' })}</ThemedText>
          <TouchableOpacity onPress={() => router.push(`/property/${property.id}`)}>
            <ThemedText style={styles.propertyTitle}>{property.title}</ThemedText>
          </TouchableOpacity>
          <ThemedText>{property.location.area}, {property.location.city}</ThemedText>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>{t('status', { ns: 'common' })}</ThemedText>
          <ThemedText style={[styles.statusText, styles[`status${request.status.charAt(0).toUpperCase() + request.status.slice(1)}` as keyof typeof styles]]}>
            {t(`status.${request.status}`, { ns: 'viewings' })}
          </ThemedText>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>{t('requestedBy', { ns: 'viewings' })}</ThemedText>
          <ThemedText>ID: {request.renterId} {/* Replace with actual name if available */}</ThemedText>
        </View>
        
        {isLandlord && (
           <View style={styles.section}>
             <ThemedText style={styles.sectionTitle}>{t('landlord', { ns: 'common' })}</ThemedText>
             <ThemedText>ID: {request.landlordId} {/* Replace with actual name if available */}</ThemedText>
           </View>
        )}

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>{t('requestedDatesAndTimes', { ns: 'viewings' })}</ThemedText>
          {request.preferredTimeSlots.map((slot: { date: string, timeSlotId: string }, index: number) => {
            // This assumes mockApi.getAvailableTimeSlots returns slots that can be found by ID
            // For a robust solution, the slot details (startTime, endTime) should ideally be stored with the request
            // or fetched alongside. For now, we'll try to display what we can.
            return (
              <View key={index} style={styles.slotItem}>
                <Ionicons name="calendar-outline" size={18} color="#555" style={{marginRight: 5}}/>
                <ThemedText>
                  {formatShortDate(slot.date)} - {t('slotId', {ns: 'viewings'})}: {slot.timeSlotId}
                  {/* Ideally: {formatTime(slotDetail.startTime)} - {formatTime(slotDetail.endTime)} */}
                </ThemedText>
              </View>
            );
          })}
           {request.requestedDates.length === 0 && request.preferredTimeSlots.length === 0 && (
            <ThemedText>{t('noPreferredTimesSpecified', { ns: 'viewings' })}</ThemedText>
          )}
        </View>

        {request.notes && (
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>{t('notes', { ns: 'common' })}</ThemedText>
            <ThemedText>{request.notes}</ThemedText>
          </View>
        )}

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>{t('requestDate', { ns: 'viewings' })}</ThemedText>
          <ThemedText>{formatDate(request.requestDate)}</ThemedText>
        </View>

        {request.responseDate && (
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>{t('responseDate', { ns: 'viewings' })}</ThemedText>
            <ThemedText>{formatDate(request.responseDate)}</ThemedText>
          </View>
        )}
        
        {request.status === 'rejected' && request.rejectionReason && (
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>{t('rejectionReason', { ns: 'viewings' })}</ThemedText>
            <ThemedText>{request.rejectionReason}</ThemedText>
          </View>
        )}

        {request.status === 'cancelled' && request.cancellationReason && (
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>{t('cancellationReason', { ns: 'viewings' })}</ThemedText>
            <ThemedText>{request.cancellationReason}</ThemedText>
          </View>
        )}
      </ThemedView>

      {canCancel && (
        <ThemedButton
          title={t('cancelRequest', { ns: 'viewings' })}
          onPress={handleCancelRequest}
          style={[styles.actionButton, styles.cancelButton]}
          // variant="danger" // Removed variant
        />
      )}

      {isLandlord && request.status === 'pending' && (
        <View style={styles.landlordActions}>
          <ThemedButton
            title={t('confirmRequest', { ns: 'viewings' })}
            onPress={() => handleUpdateStatus('confirmed')}
            style={[styles.actionButton, styles.confirmButton]}
            // variant="success" // Removed variant
          />
          <ThemedButton
            title={t('rejectRequest', { ns: 'viewings' })}
            onPress={() => handleUpdateStatus('rejected')}
            style={[styles.actionButton, styles.rejectButton]}
            // variant="warning" // Removed variant
          />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6F8',
  },
  contentContainer: {
    padding: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  section: {
    marginBottom: 18,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A5568', // Tailwind gray-700
    marginBottom: 8,
  },
  propertyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2B6CB0', // Tailwind blue-600
    textDecorationLine: 'underline',
    marginBottom: 4,
  },
  statusText: {
    fontSize: 16,
    fontWeight: 'bold',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    overflow: 'hidden', // For borderRadius to work with background color on Text
    alignSelf: 'flex-start', // So background doesn't span full width
  },
  statusPending: {
    color: '#D69E2E', // Tailwind yellow-600
    backgroundColor: '#FEFCBF', // Tailwind yellow-100
  },
  statusConfirmed: {
    color: '#38A169', // Tailwind green-600
    backgroundColor: '#C6F6D5', // Tailwind green-100
  },
  statusRejected: {
    color: '#E53E3E', // Tailwind red-600
    backgroundColor: '#FED7D7', // Tailwind red-100
  },
  statusCancelled: {
    color: '#718096', // Tailwind gray-600
    backgroundColor: '#E2E8F0', // Tailwind gray-200
  },
  statusCompleted: {
    color: '#2B6CB0', // Tailwind blue-600
    backgroundColor: '#BEE3F8', // Tailwind blue-100
  },
  slotItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  actionButton: {
    marginTop: 10,
    paddingVertical: 12,
  },
  cancelButton: {
    backgroundColor: '#E53E3E', // Example danger color for cancel button
    // Add other styling for cancel button if ThemedButton doesn't handle text color
  },
  confirmButton: {
    backgroundColor: '#38A169', // Example success color for confirm button
    marginHorizontal: 5,
    flex: 1,
  },
  rejectButton: {
    backgroundColor: '#D69E2E', // Example warning color for reject button
    marginHorizontal: 5,
    flex: 1,
  },
  landlordActions: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
});