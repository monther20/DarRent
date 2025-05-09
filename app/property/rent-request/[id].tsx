import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { mockApi } from '../../services/mockApi';
import DateTimePicker from '@react-native-community/datetimepicker';
import Slider from '@react-native-community/slider';

export default function RentRequestScreen() {
  const { t } = useTranslation(['propertyDetails', 'common']);
  const { language } = useLanguage();
  const { user } = useAuth();
  const isRTL = language === 'ar';
  const { id } = useLocalSearchParams();

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [duration, setDuration] = useState(6); // Default 6 months
  const [startDate, setStartDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function fetchPropertyDetails() {
      try {
        setLoading(true);
        const propertyData = await mockApi.getPropertyById(id as string);
        setProperty(propertyData);
      } catch (error) {
        console.error('Error fetching property details:', error);
        Alert.alert('Error', 'Failed to load property details');
      } finally {
        setLoading(false);
      }
    }

    fetchPropertyDetails();
  }, [id]);

  const formatDate = (date) => {
    return date.toLocaleDateString(language === 'ar' ? 'ar-JO' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setStartDate(selectedDate);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    try {
      setSubmitting(true);

      // Create the rent request
      await mockApi.createRentRequest({
        propertyId: id as string,
        renterId: user.id,
        duration,
        startDate,
        message,
        status: 'pending',
        createdAt: new Date(),
      });

      // Navigate to success screen
      router.push('/property/rent-request/success');
    } catch (error) {
      console.error('Error submitting rent request:', error);
      Alert.alert('Error', 'Failed to submit rent request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#34568B" />
      </View>
    );
  }

  if (!property) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Property not found</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.container}>
        <Stack.Screen
          options={{
            headerShown: true,
            title: t('rentRequestForm.title', { ns: 'propertyDetails' }),
            headerStyle: {
              backgroundColor: '#34568B',
            },
            headerTintColor: '#fff',
          }}
        />

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Property Summary */}
          <View style={styles.propertySummary}>
            <Text style={styles.propertyName}>{property.title}</Text>
            <Text style={styles.propertyPrice}>
              {property.price} {property.currency}/{t('month', { ns: 'propertyDetails' })}
            </Text>
          </View>

          <Text style={styles.formSubtitle}>
            {t('rentRequestForm.subtitle', { ns: 'propertyDetails' })}
          </Text>

          {/* Rental Duration */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>
              {t('rentRequestForm.duration', { ns: 'propertyDetails' })}
            </Text>
            <View style={styles.sliderContainer}>
              <Slider
                style={styles.slider}
                minimumValue={1}
                maximumValue={24}
                step={1}
                value={duration}
                onValueChange={setDuration}
                minimumTrackTintColor="#34568B"
                maximumTrackTintColor="#d3d3d3"
                thumbTintColor="#34568B"
              />
              <Text style={styles.durationText}>
                {duration} {t('rentRequestForm.months', { ns: 'propertyDetails' })}
              </Text>
            </View>
          </View>

          {/* Start Date */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>
              {t('rentRequestForm.startDate', { ns: 'propertyDetails' })}
            </Text>
            <TouchableOpacity
              style={styles.datePickerButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.dateText}>{formatDate(startDate)}</Text>
              <Ionicons name="calendar-outline" size={20} color="#666" />
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={startDate}
                mode="date"
                display="default"
                onChange={handleDateChange}
                minimumDate={new Date()}
              />
            )}
          </View>

          {/* Message to Landlord */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>
              {t('rentRequestForm.message', { ns: 'propertyDetails' })}
            </Text>
            <TextInput
              style={[styles.messageInput, isRTL && { textAlign: 'right' }]}
              multiline
              numberOfLines={5}
              value={message}
              onChangeText={setMessage}
              placeholder={t('rentRequestForm.placeholder', { ns: 'propertyDetails' })}
              placeholderTextColor="#999"
              textAlignVertical="top"
            />
          </View>

          {/* Total Calculation (Optional, if needed) */}
          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>Estimated Total (for {duration} months):</Text>
            <Text style={styles.totalAmount}>
              {property.price * duration} {property.currency}
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => router.back()}
              disabled={submitting}
            >
              <Text style={styles.cancelButtonText}>
                {t('rentRequestForm.cancel', { ns: 'propertyDetails' })}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>
                  {t('rentRequestForm.submit', { ns: 'propertyDetails' })}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 16,
  },
  propertySummary: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#34568B',
  },
  propertyName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  propertyPrice: {
    fontSize: 16,
    color: '#34568B',
  },
  formSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  slider: {
    flex: 1,
    height: 40,
  },
  durationText: {
    width: 80,
    textAlign: 'right',
    fontSize: 16,
    color: '#34568B',
    fontWeight: '600',
  },
  datePickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  dateText: {
    fontSize: 16,
    color: '#333',
  },
  messageInput: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 16,
    color: '#333',
    minHeight: 120,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginVertical: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    marginBottom: 40,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    padding: 16,
    borderRadius: 8,
    marginRight: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  submitButton: {
    flex: 2,
    backgroundColor: '#34568B',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
