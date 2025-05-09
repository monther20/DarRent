import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { mockApi } from '../services/mockApi';
import DateTimePicker from '@react-native-community/datetimepicker';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Loader, SuccessAnimation } from '@/app/components/animations';

export default function CreateContract() {
  const { t } = useTranslation(['common', 'rental', 'property', 'propertyDetails', 'contracts']);
  const params = useLocalSearchParams();
  const { propertyId, renterId, requestId, months } = params;
  const { user } = useAuth();
  const { language } = useLanguage();
  const isRTL = language === 'ar';

  const [property, setProperty] = useState<any>(null);
  const [renter, setRenter] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Contract form data
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() + (months ? parseInt(months as string, 10) : 6));
    return date;
  });
  const [securityDeposit, setSecurityDeposit] = useState('');
  const [additionalTerms, setAdditionalTerms] = useState('');

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        if (propertyId) {
          const propertyData = await mockApi.getPropertyById(propertyId as string);
          setProperty(propertyData);
        }

        if (renterId) {
          const renterData = await mockApi.getUserById(renterId as string);
          setRenter(renterData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        Alert.alert(t('error', { ns: 'common' }), t('errorLoadingData', { ns: 'propertyDetails' }));
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [propertyId, renterId, t]);

  const onStartDateChange = (event: any, selectedDate?: Date) => {
    setShowStartDatePicker(false);
    if (selectedDate) {
      setStartDate(selectedDate);

      // If end date is earlier than new start date, update end date
      if (endDate < selectedDate) {
        const newEndDate = new Date(selectedDate);
        newEndDate.setMonth(newEndDate.getMonth() + (months ? parseInt(months as string, 10) : 6));
        setEndDate(newEndDate);
      }
    }
  };

  const onEndDateChange = (event: any, selectedDate?: Date) => {
    setShowEndDatePicker(false);
    if (selectedDate) {
      setEndDate(selectedDate);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString(language, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleSubmit = async () => {
    // Validation
    if (!startDate || !endDate || !securityDeposit) {
      Alert.alert(t('error', { ns: 'common' }), t('fillAllFields', { ns: 'propertyDetails' }));
      return;
    }

    if (endDate <= startDate) {
      Alert.alert(
        t('error', { ns: 'common' }),
        t('endDateMustBeAfterStartDate', { ns: 'contracts' }),
      );
      return;
    }

    const depositAmount = parseFloat(securityDeposit);
    if (isNaN(depositAmount) || depositAmount <= 0) {
      Alert.alert(t('error', { ns: 'common' }), t('invalidSecurityDeposit', { ns: 'contracts' }));
      return;
    }

    setSubmitting(true);
    try {
      // Create the contract
      const contract = await mockApi.createContract({
        propertyId: propertyId as string,
        renterId: renterId as string,
        landlordId: user?.id as string,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        securityDeposit: depositAmount,
        rentAmount: property.price,
        currency: property.currency,
        additionalTerms: additionalTerms,
        status: 'pending',
        createdAt: new Date().toISOString(),
      });

      // If this contract is created from a rent request, update the request
      if (requestId) {
        await mockApi.updateRentRequest(requestId as string, {
          status: 'accepted',
          contractId: contract.id,
          responseDate: new Date().toISOString(),
        });
      }

      setShowSuccess(true);

      // Navigate after showing success animation
      setTimeout(() => {
        if (requestId) {
          router.replace('/rental-requests');
        } else {
          router.replace('/contracts');
        }
      }, 2500);
    } catch (error) {
      console.error('Error creating contract:', error);
      Alert.alert(t('error', { ns: 'common' }), t('errorCreatingContract', { ns: 'contracts' }));
      setSubmitting(false);
    }
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
        <SuccessAnimation message={t('contractCreated', { ns: 'contracts' })} size={150} />
      </SafeAreaView>
    );
  }

  if (!property || !renter) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>{t('errorLoadingData', { ns: 'propertyDetails' })}</Text>
      </SafeAreaView>
    );
  }

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
          <Text style={styles.headerTitle}>{t('createContract', { ns: 'contracts' })}</Text>
        </View>

        {/* Property Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('propertyDetails', { ns: 'contracts' })}</Text>
          <View style={styles.detailCard}>
            <Text style={styles.propertyTitle}>{property.title}</Text>
            <Text style={styles.propertyDetail}>
              {property.location.area}, {property.location.city}
            </Text>
            <View style={styles.propertyFeatures}>
              <Text style={styles.propertyDetail}>
                {property.features.bedrooms} {t('bed', { ns: 'property' })} •
                {property.features.bathrooms} {t('bath', { ns: 'property' })} •
                {property.features.size} m²
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.pricingDetail}>
              <Text style={styles.detailLabel}>{t('rentAmount', { ns: 'contracts' })}</Text>
              <Text style={styles.detailValue}>
                {property.price} {property.currency}/{t('month', { ns: 'common' })}
              </Text>
            </View>
          </View>
        </View>

        {/* Renter Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('renterInfo', { ns: 'propertyDetails' })}</Text>
          <View style={styles.detailCard}>
            <Text style={styles.renterName}>{renter.fullName}</Text>
            <Text style={styles.renterDetail}>{renter.email}</Text>
            <Text style={styles.renterDetail}>{renter.phoneNumber}</Text>
          </View>
        </View>

        {/* Contract Details Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('contractDetails', { ns: 'contracts' })}</Text>
          <View style={styles.formCard}>
            {/* Start Date Field */}
            <View style={styles.formField}>
              <Text style={styles.formLabel}>{t('startDate', { ns: 'contracts' })}</Text>
              <TouchableOpacity
                style={styles.dateInput}
                onPress={() => setShowStartDatePicker(true)}
              >
                <Text style={styles.dateText}>{formatDate(startDate)}</Text>
                <Ionicons name="calendar-outline" size={20} color="#666" />
              </TouchableOpacity>
              {showStartDatePicker && (
                <DateTimePicker
                  value={startDate}
                  mode="date"
                  display="default"
                  onChange={onStartDateChange}
                  minimumDate={new Date()}
                />
              )}
            </View>

            {/* End Date Field */}
            <View style={styles.formField}>
              <Text style={styles.formLabel}>{t('endDate', { ns: 'contracts' })}</Text>
              <TouchableOpacity style={styles.dateInput} onPress={() => setShowEndDatePicker(true)}>
                <Text style={styles.dateText}>{formatDate(endDate)}</Text>
                <Ionicons name="calendar-outline" size={20} color="#666" />
              </TouchableOpacity>
              {showEndDatePicker && (
                <DateTimePicker
                  value={endDate}
                  mode="date"
                  display="default"
                  onChange={onEndDateChange}
                  minimumDate={new Date(startDate.getTime() + 86400000)} // min is one day after start date
                />
              )}
            </View>

            {/* Security Deposit Field */}
            <View style={styles.formField}>
              <Text style={styles.formLabel}>{t('securityDeposit', { ns: 'contracts' })}</Text>
              <View style={styles.currencyInput}>
                <TextInput
                  style={styles.depositInput}
                  value={securityDeposit}
                  onChangeText={setSecurityDeposit}
                  keyboardType="numeric"
                  placeholder={t('enterAmount', { ns: 'contracts' })}
                />
                <Text style={styles.currencyText}>{property.currency}</Text>
              </View>
            </View>

            {/* Additional Terms Field */}
            <View style={styles.formField}>
              <Text style={styles.formLabel}>{t('additionalTerms', { ns: 'contracts' })}</Text>
              <TextInput
                style={styles.termsInput}
                value={additionalTerms}
                onChangeText={setAdditionalTerms}
                multiline={true}
                numberOfLines={4}
                placeholder={t('additionalTermsPlaceholder', { ns: 'contracts' })}
                textAlignVertical="top"
              />
            </View>
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={submitting}>
          {submitting ? (
            <Loader size={24} />
          ) : (
            <Text style={styles.submitButtonText}>{t('createContract', { ns: 'contracts' })}</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  rtlContainer: {
    direction: 'rtl',
  },
  contentContainer: {
    paddingBottom: 40,
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
  detailCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  propertyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  propertyDetail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  propertyFeatures: {
    marginTop: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 12,
  },
  pricingDetail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
  },
  detailValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#34568B',
  },
  renterName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  renterDetail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  formField: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  dateInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  dateText: {
    fontSize: 16,
    color: '#333',
  },
  currencyInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
  },
  depositInput: {
    flex: 1,
    fontSize: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  currencyText: {
    fontSize: 16,
    color: '#666',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#f0f0f0',
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
  },
  termsInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    minHeight: 100,
  },
  submitButton: {
    backgroundColor: '#34568B',
    borderRadius: 8,
    paddingVertical: 14,
    marginHorizontal: 16,
    marginTop: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});
