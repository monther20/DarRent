import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  SafeAreaView,
  Modal,
} from 'react-native';
// @ts-ignore
import { ThemedText } from '@/components/ThemedText';
import { useTranslation } from 'react-i18next';
import { router, useLocalSearchParams } from 'expo-router';
import api from '@/services/api';
import { RentalContract, Property, User } from '@/services/mockData';
import DateTimePicker from '@react-native-community/datetimepicker';
import { formatDate } from '@/lib/utils';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { mockApi } from '../services/mockApi';
import Ionicons from '@expo/vector-icons/Ionicons';

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
  statusActive: {
    backgroundColor: '#4CAF50',
  },
  statusRejected: {
    backgroundColor: '#F44336',
  },
  statusTerminated: {
    backgroundColor: '#F44336',
  },
  statusExpired: {
    backgroundColor: '#9E9E9E',
  },
  statusChangesRequested: {
    backgroundColor: '#2196F3',
  },
  statusChangesAccepted: {
    backgroundColor: '#4CAF50',
  },
  statusChangesRejected: {
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
  contractParty: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  contractPartyLabel: {
    fontSize: 14,
    color: '#666',
  },
  contractPartyValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    textAlign: 'right',
  },
  termsText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  downloadButton: {
    backgroundColor: '#34568B',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginTop: 24,
    padding: 12,
    borderRadius: 8,
  },
  downloadIcon: {
    marginRight: 8,
  },
  downloadButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
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
    marginHorizontal: 4,
  },
  rejectButton: {
    backgroundColor: '#f0f0f0',
  },
  rejectButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F44336',
  },
  acceptButton: {
    backgroundColor: '#34568B',
  },
  acceptButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  changeButton: {
    backgroundColor: '#E0E0E0',
  },
  changeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2196F3',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#34568B',
  },
  modalCloseButton: {
    padding: 4,
  },
  modalBody: {
    padding: 16,
  },
  modalLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333',
  },
  changesInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 150,
    textAlignVertical: 'top',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    marginRight: 8,
    alignItems: 'center',
  },
  modalCancelButtonText: {
    color: '#666',
    fontWeight: 'bold',
  },
  modalSubmitButton: {
    flex: 2,
    backgroundColor: '#34568B',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalSubmitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default function ContractDetailsScreen() {
  const { t } = useTranslation(['common', 'rental', 'property', 'propertyDetails', 'contracts']);
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  const userIsLandlord = user?.role === 'landlord';

  const [contract, setContract] = useState<RentalContract | null>(null);
  const [property, setProperty] = useState<Property | null>(null);
  const [landlord, setLandlord] = useState<User | null>(null);
  const [renter, setRenter] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingAction, setProcessingAction] = useState(false);
  const [showChangesModal, setShowChangesModal] = useState(false);
  const [requestedChanges, setRequestedChanges] = useState('');

  useEffect(() => {
    const loadContractDetails = async () => {
      try {
        const contractData = await api.contracts.getById(id as string);
        if (contractData) {
          setContract(contractData);
          const [propertyData, landlordData, renterData] = await Promise.all([
            api.properties.getById(contractData.propertyId),
            api.users.getById(contractData.landlordId),
            api.users.getById(contractData.renterId),
          ]);
          setProperty(propertyData);
          setLandlord(landlordData);
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

  const handleAcceptContract = async () => {
    if (!user) return;

    // Only renters can accept contracts
    if (userIsLandlord) return;

    setProcessingAction(true);
    try {
      await api.contracts.updateContract(id as string, {
        ...contract,
        status: 'active',
        acceptedAt: new Date().toISOString(),
      });

      // Refresh contract data
      const updatedContract = await api.contracts.getById(id as string);
      setContract(updatedContract);

      Alert.alert(t('common.success'), t('propertyDetails.contractAccepted'));
    } catch (error) {
      console.error('Error accepting contract:', error);
      Alert.alert(t('common.error'), t('propertyDetails.errorAcceptingContract'));
    } finally {
      setProcessingAction(false);
    }
  };

  const handleRejectContract = async () => {
    if (!user) return;

    // Only renters can reject contracts
    if (userIsLandlord) return;

    Alert.alert(t('common.confirm'), t('propertyDetails.rejectContractConfirm'), [
      { text: t('common.cancel') },
      {
        text: t('common.confirm'),
        onPress: async () => {
          setProcessingAction(true);
          try {
            await api.contracts.updateContract(id as string, {
              ...contract,
              status: 'rejected',
              rejectedAt: new Date().toISOString(),
            });

            // Refresh contract data
            const updatedContract = await api.contracts.getById(id as string);
            setContract(updatedContract);

            Alert.alert(t('common.success'), t('propertyDetails.contractRejected'));
          } catch (error) {
            console.error('Error rejecting contract:', error);
            Alert.alert(t('common.error'), t('propertyDetails.errorRejectingContract'));
          } finally {
            setProcessingAction(false);
          }
        },
      },
    ]);
  };

  const handleRequestChanges = async () => {
    if (requestedChanges.trim() === '') {
      Alert.alert(t('common.error'), t('propertyDetails.enterChanges'));
      return;
    }

    setShowChangesModal(false);
    setProcessingAction(true);

    try {
      await api.contracts.updateContract(id as string, {
        ...contract,
        status: 'changes_requested',
        requestedChanges: requestedChanges,
        requestedChangesAt: new Date().toISOString(),
      });

      // Refresh contract data
      const updatedContract = await api.contracts.getById(id as string);
      setContract(updatedContract);

      Alert.alert(t('common.success'), t('propertyDetails.contractChangesRequested'));
    } catch (error) {
      console.error('Error requesting changes:', error);
      Alert.alert(t('common.error'), t('propertyDetails.errorRequestingChanges'));
    } finally {
      setProcessingAction(false);
    }
  };

  // For landlords accepting/rejecting requested changes
  const handleTerminateContract = async () => {
    Alert.alert(t('contracts.terminateTitle'), t('contracts.terminateMessage'), [
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
    ]);
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
      const result = await api.contracts.extendContract(id as string, newEndDate.toISOString());
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
          <ThemedText
            style={styles.headerTitle}
            children={t('contracts.contractTitle', { property: property.title })}
          />
          <ThemedText
            style={styles.headerStatus}
            children={t(`contracts.status.${contract.status}`)}
          />
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
              <ThemedText
                style={styles.infoValue}
                children={`${property.location.area}, ${property.location.city}`}
              />
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
                    color:
                      contract.status === 'active'
                        ? '#27AE60'
                        : contract.status === 'terminated'
                          ? '#E74C3C'
                          : contract.status === 'pending'
                            ? '#F39C12'
                            : '#7F8C8D',
                  },
                ]}
                children={t(`contracts.status.${contract.status}`)}
              />
            </View>
            <View style={styles.infoRow}>
              <ThemedText style={styles.infoLabel} children={t('contracts.securityDeposit')} />
              <ThemedText
                style={styles.infoValue}
                children={`${contract.securityDeposit} ${property.currency}`}
              />
            </View>
            <View style={styles.infoRow}>
              <ThemedText style={styles.infoLabel} children={t('contracts.rentAmount')} />
              <ThemedText
                style={styles.infoValue}
                children={`${property.price} ${property.currency}/month`}
              />
            </View>
            <View style={styles.infoRow}>
              <ThemedText style={styles.infoLabel} children={t('contracts.createdAt')} />
              <ThemedText style={styles.infoValue} children={formatDate(contract.createdAt)} />
            </View>
          </View>

          {contract.status === 'active' && (
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle} children={t('contracts.actions')} />

              <TouchableOpacity style={styles.button} onPress={handleShowDatePicker}>
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
              <TouchableOpacity style={styles.button} onPress={handleExtendContract}>
                <ThemedText style={styles.buttonText} children={t('contracts.confirm')} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </>
  );
}
