import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  Text,
} from 'react-native';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from 'react-i18next';
import { mockApi } from '../services/mockApi';
import type { Property } from '@/types';
import Ionicons from '@expo/vector-icons/Ionicons';
import { mockMaintenanceRequests } from '../../services/mockData';

export default function RenterDashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { language } = useLanguage();
  const isRTL = language === 'ar';

  const [currentRental, setCurrentRental] = useState<Property | null>(null);
  const [savedProperties, setSavedProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [maintenance, setMaintenance] = useState([]);

  const getImageSource = (image: string) => {
    if (!image) return require('../../assets/images/property-placeholder.jpg');
    if (image.startsWith('http')) return { uri: image };
    if (image.startsWith('/assets')) return require('../../assets/images/property-placeholder.jpg');
    return { uri: image }; // fallback, but probably never reached
  };

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      if (user) {
        const rentals = await mockApi.getRenterProperties(user.id);
        setCurrentRental(rentals[0] || null);
        const saved = await mockApi.getSavedProperties(user.id);
        setSavedProperties(saved);
        // Fetch maintenance for current rental
        if (rentals[0]) {
          const maint = mockMaintenanceRequests.filter(
            (req) =>
              req.propertyId === rentals[0].id &&
              (req.status === 'pending' || req.status === 'scheduled'),
          );
          setMaintenance(maint);
        } else {
          setMaintenance([]);
        }
      }
      setLoading(false);
    }
    fetchData();
  }, [user]);

  if (loading) {
    return (
      <View
        style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}
      >
        <ActivityIndicator size="large" color="#34568B" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 80 }}>
      <ScreenHeader title={t('common.hello') + (user ? `, ${user.fullName}` : '')} />
      {/* Search Bar */}
      <View style={[styles.searchBarContainer, isRTL && { flexDirection: 'row-reverse' }]}>
        <View style={styles.searchBarWrapper}>
          {isRTL ? null : (
            <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
          )}
          <TextInput
            style={[styles.searchBar, isRTL && { textAlign: 'right', paddingRight: 36 }]}
            placeholder={t('search.searchByLocation')}
          />
          {isRTL ? (
            <Ionicons name="search" size={20} color="#888" style={styles.searchIconRTL} />
          ) : null}
        </View>
      </View>
      {/* Current Rental */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('rental.currentRental')}</Text>
        {currentRental ? (
          <View style={styles.currentRentalCard}>
            <View style={styles.currentRentalContent}>
              <Image
                source={getImageSource(currentRental.images[0])}
                style={styles.currentRentalImage}
              />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.currentRentalTitle}>{currentRental.title}</Text>
                <Text style={styles.currentRentalDetails}>
                  {currentRental.price} {currentRental.currency}/{t('month', 'month')}
                </Text>
                <Text style={styles.currentRentalDetails}>
                  {t('rental.leaseEnds')} {t('in', 'in')} 3 {t('tenant.months')}
                </Text>
              </View>
            </View>
            <View style={styles.nextPaymentBox}>
              <Text style={styles.nextPaymentText}>
                {t('rental.nextPayment')}: {currentRental.nextPayment?.amount} JOD{' '}
                {t('rental.dueIn')} {currentRental.nextPayment?.dueInDays} {t('rental.days')}
              </Text>
            </View>
          </View>
        ) : (
          <Text style={styles.noData}>{t('rental.noCurrentRental')}</Text>
        )}
      </View>
      {/* Upcoming Maintenance */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('maintenance.upcoming', 'Upcoming Maintenance')}</Text>
        {maintenance.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.maintenanceRow}
          >
            {maintenance.map((req) => (
              <View key={req.id} style={styles.maintenanceCard}>
                <Ionicons
                  name="construct"
                  size={28}
                  color="#34568B"
                  style={styles.maintenanceIcon}
                />
                <Text style={styles.maintenanceTitle} numberOfLines={1}>
                  {req.title}
                </Text>
                <View
                  style={[
                    styles.maintenanceBadge,
                    req.status === 'scheduled'
                      ? styles.maintenanceBadgeScheduled
                      : styles.maintenanceBadgePending,
                  ]}
                >
                  <Text style={styles.maintenanceBadgeText}>
                    {t(`maintenance.status.${req.status}`, req.status)}
                  </Text>
                </View>
                {req.scheduledDate && (
                  <Text style={styles.maintenanceDate}>
                    {t('maintenance.scheduled')}:{' '}
                    {new Date(req.scheduledDate).toLocaleDateString(language)}
                  </Text>
                )}
                <Text style={styles.maintenanceDesc} numberOfLines={2}>
                  {req.description}
                </Text>
              </View>
            ))}
          </ScrollView>
        ) : (
          <View style={styles.maintenanceEmpty}>
            <Ionicons
              name="checkmark-done-circle"
              size={32}
              color="#E67E22"
              style={{ marginBottom: 8 }}
            />
            <Text style={styles.maintenanceEmptyText}>
              {t('maintenance.noUpcoming', 'No upcoming maintenance requests')}
            </Text>
          </View>
        )}
        <TouchableOpacity style={styles.maintenanceRequestBtn}>
          <Ionicons name="add-circle" size={20} color="#fff" style={{ marginRight: 6 }} />
          <Text style={styles.maintenanceRequestBtnText}>
            {t('maintenance.request', 'Request Maintenance')}
          </Text>
        </TouchableOpacity>
      </View>
      {/* Saved Properties */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('property.savedProperties')}</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.savedPropertiesRow}
        >
          {savedProperties.length > 0 ? (
            savedProperties.map((property) => (
              <View key={property.id} style={styles.savedPropertyCard}>
                <Image
                  source={getImageSource(property.images[0])}
                  style={styles.savedPropertyImage}
                />
                <Text style={styles.savedPropertyTitle}>{property.title}</Text>
                <Text style={styles.savedPropertyDetails}>
                  {property.price} {property.currency}/ {t('month', 'month')}
                </Text>
                <Text style={styles.savedPropertyDetails}>
                  {property.features.bedrooms} {t('property.bed')} • {property.features.bathrooms}{' '}
                  {t('property.bath')}
                </Text>
                <Text style={styles.savedPropertyDetails}>{property.location.area}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.noData}>{t('home.noProperties')}</Text>
          )}
        </ScrollView>
      </View>
      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('home.quickActions')}</Text>
        <View style={[styles.quickActionsRow, isRTL && { flexDirection: 'row-reverse' }]}>
          <TouchableOpacity style={styles.quickActionButton} activeOpacity={0.85}>
            <Ionicons name="card" size={24} color="#fff" style={styles.quickActionIconVertical} />
            <Text style={styles.quickActionText}>{t('rental.payNow')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionButton} activeOpacity={0.85}>
            <Ionicons name="call" size={24} color="#fff" style={styles.quickActionIconVertical} />
            <Text style={styles.quickActionText}>{t('rental.contactOwner')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionButton} activeOpacity={0.85}>
            <Ionicons
              name="help-circle"
              size={24}
              color="#fff"
              style={styles.quickActionIconVertical}
            />
            <Text style={styles.quickActionText}>{t('rental.support')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  searchBarContainer: {
    padding: 16,
    backgroundColor: '#fff',
  },
  searchBarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  searchBar: {
    flex: 1,
    backgroundColor: 'transparent',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    paddingLeft: 36,
  },
  searchIcon: {
    position: 'absolute',
    left: 12,
    zIndex: 1,
  },
  searchIconRTL: {
    position: 'absolute',
    right: 12,
    zIndex: 1,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: '#34568B',
  },
  currentRentalCard: {
    backgroundColor: '#34568B',
    borderRadius: 16,
    padding: 14,
    marginBottom: 8,
  },
  currentRentalContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 0,
  },
  currentRentalImage: {
    width: 56,
    height: 56,
    borderRadius: 8,
    marginRight: 12,
  },
  currentRentalTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 2,
  },
  currentRentalDetails: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 2,
  },
  noData: {
    color: '#888',
    fontSize: 14,
    padding: 8,
  },
  nextPaymentBox: {
    backgroundColor: '#E67E22',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 12,
    alignSelf: 'stretch',
  },
  nextPaymentText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
    textAlign: 'center',
  },
  savedPropertiesRow: {
    flexDirection: 'row',
    paddingVertical: 2,
    paddingHorizontal: 2,
  },
  savedPropertyCard: {
    width: 160,
    backgroundColor: '#34568B',
    borderRadius: 12,
    padding: 8,
    marginRight: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  savedPropertyImage: {
    width: '100%',
    height: 80,
    borderRadius: 8,
    marginBottom: 6,
  },
  savedPropertyTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#fff',
  },
  savedPropertyDetails: {
    fontSize: 13,
    color: '#e0e6f7',
    marginTop: 2,
  },
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  quickActionButton: {
    flex: 1,
    maxWidth: 140,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E67E22',
    borderRadius: 24,
    paddingVertical: 14,
    marginHorizontal: 6,
    shadowColor: '#E67E22',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  quickActionIconVertical: {
    marginBottom: 6,
  },
  quickActionText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  maintenanceRow: {
    flexDirection: 'row',
    paddingVertical: 2,
    paddingHorizontal: 2,
  },
  maintenanceCard: {
    width: 180,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    marginRight: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    alignItems: 'flex-start',
  },
  maintenanceIcon: {
    marginBottom: 6,
  },
  maintenanceTitle: {
    fontWeight: 'bold',
    fontSize: 15,
    color: '#34568B',
    marginBottom: 2,
  },
  maintenanceBadge: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginBottom: 4,
    alignSelf: 'flex-start',
  },
  maintenanceBadgeScheduled: {
    backgroundColor: '#E67E22',
  },
  maintenanceBadgePending: {
    backgroundColor: '#F5B041',
  },
  maintenanceBadgeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  maintenanceDate: {
    fontSize: 12,
    color: '#888',
    marginBottom: 2,
  },
  maintenanceDesc: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },
  maintenanceEmpty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  maintenanceEmptyText: {
    color: '#888',
    fontSize: 14,
    marginTop: 2,
  },
  maintenanceRequestBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E67E22',
    borderRadius: 24,
    paddingVertical: 10,
    paddingHorizontal: 18,
    marginTop: 12,
    alignSelf: 'flex-start',
  },
  maintenanceRequestBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
});
