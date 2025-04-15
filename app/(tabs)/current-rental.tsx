import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import api from '@/services/api';
import { Property, RentalContract } from '@/services/mockData';
import { RoleGuard } from '@/components/RoleGuard';
import { formatDate } from '@/lib/utils';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  propertyCard: {
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
  propertyImage: {
    width: '100%',
    height: 200,
  },
  propertyInfo: {
    padding: 16,
  },
  propertyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
  },
  propertyPrice: {
    fontSize: 18,
    color: '#34568B',
    marginBottom: 8,
  },
  propertyLease: {
    color: '#7F8C8D',
    marginBottom: 16,
  },
  section: {
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 8,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#2C3E50',
  },
  paymentBox: {
    backgroundColor: '#34568B',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  paymentTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  paymentAmount: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  paymentDue: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  payButton: {
    backgroundColor: '#E67E22',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  payButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  utilityBox: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  utilityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  utilityLabel: {
    color: '#2C3E50',
    fontSize: 16,
  },
  utilityAmount: {
    color: '#34568B',
    fontSize: 16,
    fontWeight: '600',
  },
  utilityDue: {
    color: '#7F8C8D',
    fontSize: 14,
    marginTop: 4,
  },
  maintenanceBox: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  maintenanceStatus: {
    color: '#E67E22',
    marginTop: 4,
  },
  actionButton: {
    backgroundColor: '#E67E22',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  actionsRow: {
    flexDirection: 'row',
    marginHorizontal: 12,
    marginBottom: 16,
  },
});

export default function CurrentRentalScreen() {
  const { t } = useTranslation();
  const [currentRental, setCurrentRental] = useState<Property | null>(null);
  const [contract, setContract] = useState<RentalContract | null>(null);

  useEffect(() => {
    const loadCurrentRental = async () => {
      try {
        const currentUser = await api.users.getCurrentUser();
        const rentedProperties = await api.properties.getByRenter(currentUser.id);
        if (rentedProperties.length > 0) {
          setCurrentRental(rentedProperties[0]);
          
          // Load contract for this property
          const contracts = await api.contracts.getByRenter(currentUser.id);
          const propertyContract = contracts.find(c => c.propertyId === rentedProperties[0].id);
          if (propertyContract) {
            setContract(propertyContract);
          }
        }
      } catch (error) {
        console.error('Error loading current rental:', error);
      }
    };

    loadCurrentRental();
  }, []);

  if (!currentRental) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ThemedText style={{ color: '#7F8C8D', fontSize: 16 }} children={t('rental.noCurrentRental')} />
      </View>
    );
  }

  return (
    <RoleGuard allowedRoles={['renter']} children={
      <ScrollView style={styles.container}>
        <View style={styles.propertyCard}>
          <Image
            source={require('@/assets/images/apartment.jpg')}
            style={styles.propertyImage}
            resizeMode="cover"
          />
          <View style={styles.propertyInfo}>
            <ThemedText style={styles.propertyTitle} children={currentRental.title} />
            <ThemedText style={styles.propertyPrice} children={`${currentRental.price} ${currentRental.currency}/month`} />
            <ThemedText style={styles.propertyLease} children={
              contract 
                ? `${t('rental.leaseEnds')}: ${formatDate(contract.endDate)}`
                : t('rental.noLeaseInfo')
            } />
            
            {contract && (
              <TouchableOpacity 
                style={{marginTop: 8}}
                onPress={() => router.push(`/contracts/${contract.id}`)}
              >
                <ThemedText style={{color: '#34568B'}} children={t('rental.viewContract')} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle} children={t('rental.nextPayment')} />
          <View style={styles.paymentBox}>
            <ThemedText style={styles.paymentTitle} children={t('rental.mayRent')} />
            <ThemedText style={styles.paymentAmount} children={`${currentRental.price} ${currentRental.currency}`} />
            <ThemedText style={styles.paymentDue} children={t('rental.dueInDays', { days: 5 })} />
            <TouchableOpacity style={styles.payButton}>
              <ThemedText style={styles.payButtonText} children={t('rental.payNow')} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle} children={t('rental.utilitiesAndBills')} />
          <View style={styles.utilityBox}>
            <View style={styles.utilityRow}>
              <ThemedText style={styles.utilityLabel} children={t('rental.electricity')} />
              <ThemedText style={styles.utilityAmount} children="45 JOD" />
            </View>
            <ThemedText style={styles.utilityDue} children={t('rental.dueInDays', { days: 10 })} />
          </View>
          <View style={styles.utilityBox}>
            <View style={styles.utilityRow}>
              <ThemedText style={styles.utilityLabel} children={t('rental.water')} />
              <ThemedText style={styles.utilityAmount} children="25 JOD" />
            </View>
            <ThemedText style={styles.utilityDue} children={t('rental.dueInDays', { days: 15 })} />
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle} children={t('rental.maintenanceRequests')} />
          <View style={styles.maintenanceBox}>
            <ThemedText style={styles.utilityLabel} children={t('rental.acMaintenance')} />
            <ThemedText style={styles.maintenanceStatus} children={t('rental.scheduledForTomorrow')} />
          </View>
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.actionButton}>
            <ThemedText style={styles.actionButtonText} children={t('rental.messageOwner')} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <ThemedText style={styles.actionButtonText} children={t('rental.reportIssue')} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <ThemedText style={styles.actionButtonText} children={t('rental.viewLease')} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    } />
  );
} 