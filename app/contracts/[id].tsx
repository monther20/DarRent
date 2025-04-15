import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
// @ts-ignore
import { Alert } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { useTranslation } from 'react-i18next';
import { router, useLocalSearchParams } from 'expo-router';
import api from '@/services/api';
import { RentalContract, Property, User } from '@/services/mockData';
import DateTimePicker from '@react-native-community/datetimepicker';
import { formatDate } from '@/lib/utils';
import { StatusBar } from 'expo-status-bar';

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
  headerStatus: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
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
    marginBottom: 12,
    color: '#2C3E50',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  infoLabel: {
    color: '#7F8C8D',
    flex: 1,
  },
  infoValue: {
    color: '#2C3E50',
    fontWeight: '500',
    flex: 2,
    textAlign: 'right',
  },
  button: {
    backgroundColor: '#34568B',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  terminateButton: {
    backgroundColor: '#E74C3C',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  datePickerContainer: {
    marginTop: 16,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default function ContractDetailsScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams();
  const [contract, setContract] = useState<RentalContract | null>(null);
  const [property, setProperty] = useState<Property | null>(null);
  const [renter, setRenter] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [newEndDate, setNewEndDate] = useState(new Date());

  useEffect(() => {
    const loadContractDetails = async () => {
      try {
        const contractData = await api.contracts.getById(id as string);
        if (contractData) {
          setContract(contractData);
          const [propertyData, renterData] = await Promise.all([
            api.properties.getById(contractData.propertyId),
            api.users.getById(contractData.renterId),
          ]);
          setProperty(propertyData);
          setRenter(renterData);
        }
      } catch (error) {
        console.error('Error loading contract details:', error);
        Alert.alert(t('contracts.error'), t('contracts.errorLoadingContract'));
      } finally {
        setLoading(false);
      }
    };

    loadContractDetails();
  }, [id, t]);

  const handleTerminateContract = async () => {
    Alert.alert(
      t('contracts.terminateTitle'),
      t('contracts.terminateMessage'),
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('common.confirm'),
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await api.contracts.terminateContract(id as string);
              if (result) {
                setContract(result);
                Alert.alert(t('contracts.success'), t('contracts.contractTerminated'));
              }
            } catch (error) {
              console.error('Error terminating contract:', error);
              Alert.alert(t('contracts.error'), t('contracts.errorTerminating'));
            }
          },
        },
      ]
    );
  };

  const handleShowDatePicker = () => {
    if (contract) {
      // Set initial date to 6 months after current end date
      const currentEndDate = new Date(contract.endDate);
      const suggestedNewEndDate = new Date(currentEndDate);
      suggestedNewEndDate.setMonth(suggestedNewEndDate.getMonth() + 6);
      setNewEndDate(suggestedNewEndDate);
      setShowDatePicker(true);
    }
  };

  const handleExtendContract = async () => {
    try {
      const result = await api.contracts.extendContract(
        id as string,
        newEndDate.toISOString()
      );
      if (result) {
        setContract(result);
        setShowDatePicker(false);
        Alert.alert(t('contracts.success'), t('contracts.contractExtended'));
      }
    } catch (error) {
      console.error('Error extending contract:', error);
      Alert.alert(t('contracts.error'), t('contracts.errorExtending'));
    }
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#34568B" />
      </View>
    );
  }

  if (!contract || !property || !renter) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ThemedText style={{ color: '#7F8C8D', fontSize: 16 }} children={t('contracts.notFound')} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="light" />
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ThemedText style={styles.backButtonText} children={`← ${t('common.back')}`} />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle} children={t('contracts.contractTitle', { property: property.title })} />
          <ThemedText style={styles.headerStatus} children={t(`contracts.status.${contract.status}`)} />
        </View>

        <View style={styles.card}>
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle} children={t('contracts.propertyDetails')} />
            <View style={styles.infoRow}>
              <ThemedText style={styles.infoLabel} children={t('contracts.property')} />
              <ThemedText style={styles.infoValue} children={property.title} />
            </View>
            <View style={styles.infoRow}>
              <ThemedText style={styles.infoLabel} children={t('contracts.location')} />
              <ThemedText style={styles.infoValue} children={`${property.location.area}, ${property.location.city}`} />
            </View>
            <View style={styles.infoRow}>
              <ThemedText style={styles.infoLabel} children={t('contracts.renter')} />
              <ThemedText style={styles.infoValue} children={renter.fullName} />
            </View>
          </View>

          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle} children={t('contracts.contractDetails')} />
            <View style={styles.infoRow}>
              <ThemedText style={styles.infoLabel} children={t('contracts.startDate')} />
              <ThemedText style={styles.infoValue} children={formatDate(contract.startDate)} />
            </View>
            <View style={styles.infoRow}>
              <ThemedText style={styles.infoLabel} children={t('contracts.endDate')} />
              <ThemedText style={styles.infoValue} children={formatDate(contract.endDate)} />
            </View>
            <View style={styles.infoRow}>
              <ThemedText style={styles.infoLabel} children={t('contracts.status')} />
              <ThemedText 
                style={[
                  styles.infoValue, 
                  { 
                    color: contract.status === 'active' ? '#27AE60' : 
                           contract.status === 'terminated' ? '#E74C3C' : 
                           contract.status === 'pending' ? '#F39C12' : '#7F8C8D' 
                  }
                ]}
                children={t(`contracts.status.${contract.status}`)}
              />
            </View>
            <View style={styles.infoRow}>
              <ThemedText style={styles.infoLabel} children={t('contracts.securityDeposit')} />
              <ThemedText style={styles.infoValue} children={`${contract.securityDeposit} ${property.currency}`} />
            </View>
            <View style={styles.infoRow}>
              <ThemedText style={styles.infoLabel} children={t('contracts.rentAmount')} />
              <ThemedText style={styles.infoValue} children={`${property.price} ${property.currency}/month`} />
            </View>
            <View style={styles.infoRow}>
              <ThemedText style={styles.infoLabel} children={t('contracts.createdAt')} />
              <ThemedText style={styles.infoValue} children={formatDate(contract.createdAt)} />
            </View>
          </View>

          {contract.status === 'active' && (
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle} children={t('contracts.actions')} />
              
              <TouchableOpacity 
                style={styles.button}
                onPress={handleShowDatePicker}
              >
                <ThemedText style={styles.buttonText} children={t('contracts.extendContract')} />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.button, styles.terminateButton]}
                onPress={handleTerminateContract}
              >
                <ThemedText style={styles.buttonText} children={t('contracts.terminateContract')} />
              </TouchableOpacity>
            </View>
          )}

          {showDatePicker && (
            <View style={styles.datePickerContainer}>
              <ThemedText style={styles.sectionTitle} children={t('contracts.selectNewEndDate')} />
              <DateTimePicker
                value={newEndDate}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  if (selectedDate) setNewEndDate(selectedDate);
                }}
                minimumDate={new Date()}
              />
              <TouchableOpacity 
                style={styles.button}
                onPress={handleExtendContract}
              >
                <ThemedText style={styles.buttonText} children={t('contracts.confirm')} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </>
  );
} 