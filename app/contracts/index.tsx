import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { useTranslation } from 'react-i18next';
import { Link, router } from 'expo-router';
import api from '@/services/api';
import { RentalContract, Property, User } from '@/services/mockData';
import { formatDate } from '@/lib/utils';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

type ContractWithDetails = {
  contract: RentalContract;
  property: Property | null;
  renter?: User | null;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    backgroundColor: '#34568B',
    padding: 16,
    paddingTop: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    color: '#7F8C8D',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 12,
  },
  contractCard: {
    backgroundColor: 'white',
    margin: 16,
    marginBottom: 8,
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  propertyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 4,
  },
  contractDates: {
    color: '#7F8C8D',
    marginBottom: 8,
  },
  ownerRenterLine: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  ownerRenterLabel: {
    color: '#7F8C8D',
    marginRight: 4,
  },
  ownerRenterName: {
    color: '#2C3E50',
    fontWeight: '500',
  },
  statusLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  statusActive: {
    color: '#27AE60',
    fontWeight: '500',
  },
  statusPending: {
    color: '#F39C12',
    fontWeight: '500',
  },
  statusTerminated: {
    color: '#E74C3C',
    fontWeight: '500',
  },
  statusExpired: {
    color: '#7F8C8D',
    fontWeight: '500',
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewButtonText: {
    color: '#34568B',
    marginRight: 4,
    fontSize: 16,
  },
  createButton: {
    backgroundColor: '#E67E22',
    width: 56,
    height: 56,
    borderRadius: 28,
    position: 'absolute',
    bottom: 24,
    right: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 16,
    paddingBottom: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#F0F0F0',
  },
  filterButtonActive: {
    backgroundColor: '#34568B',
  },
  filterButtonText: {
    color: '#2C3E50',
  },
  filterButtonTextActive: {
    color: 'white',
  },
});

export default function ContractsScreen() {
  const { t } = useTranslation();
  const [contracts, setContracts] = useState<ContractWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<'landlord' | 'renter' | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'pending' | 'terminated' | 'expired'>(
    'all',
  );

  useEffect(() => {
    const loadContracts = async () => {
      try {
        // Get current user first to determine role
        const currentUser = await api.users.getCurrentUser();
        setUserRole(currentUser.role);

        let contractsList: RentalContract[] = [];

        // Get contracts based on user role
        if (currentUser.role === 'landlord') {
          contractsList = await api.contracts.getByLandlord(currentUser.id);
        } else if (currentUser.role === 'renter') {
          contractsList = await api.contracts.getByRenter(currentUser.id);
        }

        // Get property and renter/owner details for each contract
        const contractsWithDetails = await Promise.all(
          contractsList.map(async (contract) => {
            const property = await api.properties.getById(contract.propertyId);

            let renter = null;
            if (currentUser.role === 'landlord') {
              renter = await api.users.getById(contract.renterId);
            }

            return { contract, property, renter };
          }),
        );

        setContracts(contractsWithDetails);
      } catch (error) {
        console.error('Error loading contracts:', error);
      } finally {
        setLoading(false);
      }
    };

    loadContracts();
  }, []);

  const filteredContracts = contracts.filter(
    (item) => filter === 'all' || item.contract.status === filter,
  );

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'active':
        return styles.statusActive;
      case 'pending':
        return styles.statusPending;
      case 'terminated':
        return styles.statusTerminated;
      case 'expired':
        return styles.statusExpired;
      default:
        return {};
    }
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#34568B" />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="light" />
      <View style={styles.container}>
        <View style={styles.header}>
          <ThemedText style={styles.headerTitle} children={t('contracts.title')} />
        </View>

        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
            onPress={() => setFilter('all')}
          >
            <ThemedText
              style={[styles.filterButtonText, filter === 'all' && styles.filterButtonTextActive]}
              children={t('contracts.filters.all')}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'active' && styles.filterButtonActive]}
            onPress={() => setFilter('active')}
          >
            <ThemedText
              style={[
                styles.filterButtonText,
                filter === 'active' && styles.filterButtonTextActive,
              ]}
              children={t('contracts.filters.active')}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'pending' && styles.filterButtonActive]}
            onPress={() => setFilter('pending')}
          >
            <ThemedText
              style={[
                styles.filterButtonText,
                filter === 'pending' && styles.filterButtonTextActive,
              ]}
              children={t('contracts.filters.pending')}
            />
          </TouchableOpacity>
        </View>

        {filteredContracts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={48} color="#7F8C8D" />
            <ThemedText style={styles.emptyText} children={t('contracts.noContracts')} />
          </View>
        ) : (
          <FlatList
            data={filteredContracts}
            keyExtractor={(item: ContractWithDetails) => item.contract.id}
            renderItem={({ item }: { item: ContractWithDetails }) => (
              <TouchableOpacity
                style={styles.contractCard}
                onPress={() => router.push(`/contracts/${item.contract.id}`)}
              >
                <ThemedText style={styles.propertyTitle} children={item.property?.title} />
                <ThemedText
                  style={styles.contractDates}
                  children={`${formatDate(item.contract.startDate)} - ${formatDate(item.contract.endDate)}`}
                />

                {userRole === 'landlord' && item.renter && (
                  <View style={styles.ownerRenterLine}>
                    <ThemedText
                      style={styles.ownerRenterLabel}
                      children={`${t('contracts.tenant')}:`}
                    />
                    <ThemedText style={styles.ownerRenterName} children={item.renter.fullName} />
                  </View>
                )}

                <View style={styles.statusLine}>
                  <ThemedText
                    style={getStatusStyle(item.contract.status)}
                    children={t(`contracts.status.${item.contract.status}`)}
                  />

                  <View style={styles.viewButton}>
                    <ThemedText style={styles.viewButtonText} children={t('contracts.view')} />
                    <Ionicons name="chevron-forward" size={16} color="#34568B" />
                  </View>
                </View>
              </TouchableOpacity>
            )}
          />
        )}

        {userRole === 'landlord' && (
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => router.push('/contracts/create')}
          >
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
        )}
      </View>
    </>
  );
}
