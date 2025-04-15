import React, { useEffect, useState } from 'react';
import { View, ScrollView, TouchableOpacity, ActivityIndicator, Image, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useAuth } from '@/contexts/AuthContext';
import { Text } from '../../components/Text';
import { RoleGuard } from '../../components/RoleGuard';
import api from '@/services/api';
import { Property } from '@/services/mockData';

export default function PropertiesScreen() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [properties, setProperties] = useState<Property[]>([]);

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    try {
      setLoading(true);
      if (!user) return;

      const userProperties = await api.properties.getByOwner(user.id);
      setProperties(userProperties);
    } catch (error) {
      console.error('Error loading properties:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#34568B" />
      </View>
    );
  }

  return (
    <RoleGuard allowedRoles={['landlord']} children={
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            {t('properties.yourProperties')} ({properties.length})
          </Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push('/properties/new')}
          >
            <FontAwesome name="plus" size={20} color="white" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView}>
          {properties.map((property) => (
            <TouchableOpacity
              key={property.id}
              style={styles.propertyCard}
              onPress={() => router.push(`/properties/${property.id}`)}
            >
              <Image
                source={{ uri: property.images[0] }}
                style={styles.propertyImage}
                resizeMode="cover"
              />
              <View style={styles.propertyDetails}>
                <Text style={styles.propertyTitle}>
                  {property.title}
                </Text>
                <Text style={styles.propertyPrice}>
                  {property.price} JOD/month
                </Text>
                <View style={styles.featuresContainer}>
                  <View style={styles.featureItem}>
                    <FontAwesome name="bed" size={14} color="#666" />
                    <Text style={styles.featureText}>
                      {property.features.bedrooms} {t('properties.beds')}
                    </Text>
                  </View>
                  <View style={styles.featureItem}>
                    <FontAwesome name="bath" size={14} color="#666" />
                    <Text style={styles.featureText}>
                      {property.features.bathrooms} {t('properties.baths')}
                    </Text>
                  </View>
                  <View style={styles.featureItem}>
                    <FontAwesome name="square" size={14} color="#666" />
                    <Text style={styles.featureText}>
                      {property.features.area}m²
                    </Text>
                  </View>
                </View>

                {/* Stats */}
                <View style={styles.statsContainer}>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>
                      {property.views}
                    </Text>
                    <Text style={styles.statLabel}>{t('properties.views')}</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>
                      {property.inquiries}
                    </Text>
                    <Text style={styles.statLabel}>{t('properties.inquiries')}</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>
                      {property.daysListed}
                    </Text>
                    <Text style={styles.statLabel}>{t('properties.daysListed')}</Text>
                  </View>
                </View>

                {/* Status */}
                <View style={styles.statusContainer}>
                  <View
                    style={[
                      styles.statusBadge,
                      property.status === 'available' && styles.statusAvailable,
                      property.status === 'rented' && styles.statusRented,
                      property.status === 'pending' && styles.statusPending,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        property.status === 'available' && styles.statusTextAvailable,
                        property.status === 'rented' && styles.statusTextRented,
                        property.status === 'pending' && styles.statusTextPending,
                      ]}
                    >
                      {t(`properties.status.${property.status}`)}
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    } />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#34568B',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  addButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    padding: 8,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  propertyCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 2,
    marginBottom: 16,
    overflow: 'hidden',
  },
  propertyImage: {
    width: '100%',
    height: 192,
  },
  propertyDetails: {
    padding: 16,
  },
  propertyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  propertyPrice: {
    color: '#4B5563',
    marginBottom: 8,
  },
  featuresContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  featureText: {
    marginLeft: 4,
    color: '#4B5563',
  },
  statsContainer: {
    flexDirection: 'row',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#34568B',
  },
  statLabel: {
    color: '#4B5563',
  },
  statusContainer: {
    marginTop: 16,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  statusAvailable: {
    backgroundColor: '#D1FAE5',
  },
  statusRented: {
    backgroundColor: '#DBEAFE',
  },
  statusPending: {
    backgroundColor: '#FEF3C7',
  },
  statusText: {
    fontSize: 14,
  },
  statusTextAvailable: {
    color: '#065F46',
  },
  statusTextRented: {
    color: '#1E40AF',
  },
  statusTextPending: {
    color: '#92400E',
  },
}); 