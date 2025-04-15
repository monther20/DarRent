import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native';
// @ts-ignore
import { Alert, Platform } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import api from '@/services/api';
import { Property, User } from '@/services/mockData';
import DateTimePicker from '@react-native-community/datetimepicker';
import { StatusBar } from 'expo-status-bar';
import { Picker } from '@react-native-picker/picker';
import { RoleGuard } from '@/components/RoleGuard';

// Add type declarations to fix TypeScript errors
declare module 'react-native' {
  interface TextInputProps {
    keyboardType?: string;
  }
  
  interface TouchableOpacityProps {
    disabled?: boolean;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    backgroundColor: '#34568B',
    padding: 16,
    paddingTop: 40,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 8,
  },
  backButton: {
    marginBottom: 8,
  },
  backButtonText: {
    color: 'white',
  },
  card: {
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#2C3E50',
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    color: '#7F8C8D',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F5F7FA',
    padding: 12,
    borderRadius: 8,
    color: '#2C3E50',
    fontSize: 16,
  },
  pickerContainer: {
    backgroundColor: '#F5F7FA',
    borderRadius: 8,
    marginBottom: 16,
  },
  datePickerButton: {
    backgroundColor: '#F5F7FA',
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    color: '#2C3E50',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#34568B',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default function CreateContractScreen() {
  const { t } = useTranslation();
  const [properties, setProperties] = useState<Property[]>([]);
  const [renters, setRenters] = useState<User[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<string>('');
  const [selectedRenter, setSelectedRenter] = useState<string>('');
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>((() => {
    const date = new Date();
    date.setFullYear(date.getFullYear() + 1);
    return date;
  })());
  const [securityDeposit, setSecurityDeposit] = useState<string>('');
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [propertiesData, rentersData] = await Promise.all([
          api.properties.getByOwner((await api.users.getCurrentUser()).id),
          api.users.getRenters(),
        ]);
        
        // Filter to only available properties
        const availableProperties = propertiesData.filter(p => p.status === 'available');
        setProperties(availableProperties);
        setRenters(rentersData);
        
        if (availableProperties.length > 0) {
          setSelectedProperty(availableProperties[0].id);
          setSecurityDeposit(availableProperties[0].price.toString());
        }
        
        if (rentersData.length > 0) {
          setSelectedRenter(rentersData[0].id);
        }
      } catch (error) {
        console.error('Error loading data:', error);
        Alert.alert(t('contracts.error'), t('contracts.errorLoadingData'));
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [t]);

  const handlePropertyChange = (propertyId: string) => {
    setSelectedProperty(propertyId);
    const property = properties.find(p => p.id === propertyId);
    if (property) {
      setSecurityDeposit(property.price.toString());
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleCreateContract = async () => {
    if (!selectedProperty || !selectedRenter || !startDate || !endDate || !securityDeposit) {
      Alert.alert(t('contracts.error'), t('contracts.fillAllFields'));
      return;
    }

    if (startDate >= endDate) {
      Alert.alert(t('contracts.error'), t('contracts.endDateMustBeAfterStartDate'));
      return;
    }

    if (parseFloat(securityDeposit) <= 0) {
      Alert.alert(t('contracts.error'), t('contracts.invalidSecurityDeposit'));
      return;
    }

    setSubmitting(true);

    try {
      const result = await api.contracts.createContract({
        propertyId: selectedProperty,
        renterId: selectedRenter,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        status: 'pending',
        securityDeposit: parseFloat(securityDeposit),
        documents: {
          signed: false
        }
      });

      Alert.alert(
        t('contracts.success'),
        t('contracts.contractCreated'),
        [
          {
            text: t('common.ok'),
            onPress: () => router.push('/contracts'),
          },
        ]
      );
    } catch (error) {
      console.error('Error creating contract:', error);
      Alert.alert(t('contracts.error'), t('contracts.errorCreatingContract'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#34568B" />
      </View>
    );
  }

  if (properties.length === 0) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: 20 }]}>
        <ThemedText style={{ textAlign: 'center', marginBottom: 16 }} children={t('contracts.noPropertiesAvailable')} />
        <TouchableOpacity 
          style={styles.button}
          onPress={() => router.push('/properties')}
        >
          <ThemedText style={styles.buttonText} children={t('contracts.goToProperties')} />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <RoleGuard allowedRoles={['landlord']} children={
      <>
        <StatusBar style="light" />
        <ScrollView style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <ThemedText style={styles.backButtonText} children={`← ${t('common.back')}`} />
            </TouchableOpacity>
            <ThemedText style={styles.headerTitle} children={t('contracts.createNew')} />
          </View>

          <View style={styles.card}>
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle} children={t('contracts.propertyDetails')} />
              
              <View style={styles.inputContainer}>
                <ThemedText style={styles.label} children={t('contracts.selectProperty')} />
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={selectedProperty}
                    onValueChange={(itemValue) => handlePropertyChange(itemValue)}
                  >
                    {properties.map((property) => (
                      <Picker.Item 
                        label={`${property.title} - ${property.price} ${property.currency}/month`} 
                        value={property.id} 
                      />
                    ))}
                  </Picker>
                </View>
              </View>

              <View style={styles.inputContainer}>
                <ThemedText style={styles.label} children={t('contracts.selectRenter')} />
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={selectedRenter}
                    onValueChange={(itemValue) => setSelectedRenter(itemValue)}
                  >
                    {renters.map((renter) => (
                      <Picker.Item 
                        label={renter.fullName} 
                        value={renter.id} 
                      />
                    ))}
                  </Picker>
                </View>
              </View>
            </View>

            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle} children={t('contracts.contractTerms')} />
              
              <View style={styles.inputContainer}>
                <ThemedText style={styles.label} children={t('contracts.startDate')} />
                <TouchableOpacity 
                  style={styles.datePickerButton}
                  onPress={() => setShowStartDatePicker(true)}
                >
                  <ThemedText style={styles.dateText} children={formatDate(startDate)} />
                </TouchableOpacity>
                {showStartDatePicker && (
                  <DateTimePicker
                    value={startDate}
                    mode="date"
                    display="default"
                    onChange={(event, selectedDate) => {
                      setShowStartDatePicker(Platform.OS === 'ios');
                      if (selectedDate) {
                        setStartDate(selectedDate);
                      }
                    }}
                    minimumDate={new Date()}
                  />
                )}
              </View>

              <View style={styles.inputContainer}>
                <ThemedText style={styles.label} children={t('contracts.endDate')} />
                <TouchableOpacity 
                  style={styles.datePickerButton}
                  onPress={() => setShowEndDatePicker(true)}
                >
                  <ThemedText style={styles.dateText} children={formatDate(endDate)} />
                </TouchableOpacity>
                {showEndDatePicker && (
                  <DateTimePicker
                    value={endDate}
                    mode="date"
                    display="default"
                    onChange={(event, selectedDate) => {
                      setShowEndDatePicker(Platform.OS === 'ios');
                      if (selectedDate) {
                        setEndDate(selectedDate);
                      }
                    }}
                    minimumDate={new Date(startDate.getTime() + 86400000)} // 1 day after start date
                  />
                )}
              </View>

              <View style={styles.inputContainer}>
                <ThemedText style={styles.label} children={t('contracts.securityDeposit')} />
                <TextInput
                  style={styles.input}
                  value={securityDeposit}
                  onChangeText={setSecurityDeposit}
                  keyboardType={"numeric" as any}
                  placeholder={t('contracts.enterAmount')}
                />
              </View>
            </View>

            <TouchableOpacity 
              style={styles.button}
              onPress={handleCreateContract}
              disabled={submitting as any}
            >
              {submitting ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <ThemedText style={styles.buttonText} children={t('contracts.createContract')} />
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </>
    } />
  );
} 