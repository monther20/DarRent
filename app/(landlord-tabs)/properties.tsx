import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ScreenHeader } from '../components/ScreenHeader';
import { PropertyCard } from '@/components/PropertyCard';
import { router } from 'expo-router';
import { mockApi } from '../services/mockApi';
import { Property } from '../types';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext'; // Corrected path

export default function PropertiesScreen() {
  const { t } = useTranslation(['common', 'properties']);
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [properties, setProperties] = useState<Property[]>([]);
  const [viewingRequests, setViewingRequests] = useState<number>(0);
  const [videoVerificationRequests, setVideoVerificationRequests] = useState<number>(0);

  useEffect(() => {
    loadProperties();
    loadViewingRequests();
    loadVideoVerificationRequests();
  }, [user]); // Add user as a dependency

  const loadProperties = async () => {
    setLoading(true);
    try {
      if (user && user.id) {
        const data = await mockApi.getLandlordProperties(user.id);
        setProperties(data);
      } else {
        console.error('User not logged in or user ID not available');
        setProperties([]); // Clear properties or handle as an error state
        // Optionally, show an alert or a message to the user
        Alert.alert(t('common:error'), t('properties:errorLoadingPropertiesNotLoggedIn'));
      }
    } catch (error) {
      console.error('Error loading properties:', error);
      Alert.alert(t('common:error'), t('properties:errorLoadingProperties'));
      setProperties([]); // Clear properties on error
    } finally {
      setLoading(false);
    }
  };

  const loadViewingRequests = async () => {
    try {
      // In the future this will use real API
      // This is just a mock count of viewing requests
      setViewingRequests(3);
    } catch (error) {
      console.error('Error loading viewing requests:', error);
    }
  };
  
  const loadVideoVerificationRequests = async () => {
    try {
      // Mock API for video verification requests
      // In the future this would be a real API call
      setVideoVerificationRequests(2);
    } catch (error) {
      console.error('Error loading video verification requests:', error);
    }
  };
  
  const getPropertyVerificationStatus = (property: Property) => {
    // Check if property has a video that's been verified
    if (property.videos && property.videos.length > 0) {
      return property.verified === true ? true : false; // verified or pending
    }
    return null; // no video
  };
  
  const handleVerificationStatusPress = () => {
    Alert.alert(
      t('Video Verification', { ns: 'properties' }),
      t('All properties require video verification before they can be rented. Upload a walkthrough video for each property to get verified.', { ns: 'properties' }),
      [{ text: t('OK', { ns: 'common' }) }]
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ScreenHeader title={t('property', { ns: 'common' })} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#34568B" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScreenHeader title={t('property', { ns: 'common' })} />
      <ScrollView style={styles.content}>
        <View style={styles.contentContainer}>
          <View style={styles.actionsRow}>
            <TouchableOpacity 
              style={styles.addButton} 
              onPress={() => router.push('/add-property')}
            >
              <ThemedText style={styles.addButtonText}>+ {t('addNewProperty', { ns: 'properties' })}</ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.viewingButton} 
              onPress={() => router.push('/viewing-calendar')}
            >
              <View style={styles.viewingButtonContent}>
                <Ionicons name="calendar" size={20} color="#FFFFFF" />
                <ThemedText style={styles.viewingButtonText}>{t('viewings', { ns: 'properties' })}</ThemedText>
              </View>
              {viewingRequests > 0 && (
                <View style={styles.badge}>
                  <ThemedText style={styles.badgeText}>{viewingRequests}</ThemedText>
                </View>
              )}
            </TouchableOpacity>
          </View>
          
          {/* Video Verification Status Bar - New */}
          <TouchableOpacity 
            style={styles.verificationBar}
            onPress={handleVerificationStatusPress}
          >
            <View style={styles.verificationIconContainer}>
              <MaterialCommunityIcons name="video-check" size={22} color="#FFFFFF" />
            </View>
            <View style={styles.verificationContent}>
              <ThemedText style={styles.verificationTitle}>{t('Video Verification', { ns: 'properties' })}</ThemedText>
              <ThemedText style={styles.verificationDesc}>
                {videoVerificationRequests > 0 
                  ? t('{{count}} properties awaiting verification', { count: videoVerificationRequests, ns: 'properties' }) 
                  : t('All properties verified', { ns: 'properties' })}
              </ThemedText>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>
              {t('yourProperties', { ns: 'properties' })} ({properties.length})
            </ThemedText>
          </View>

          {properties.map((property) => (
            <PropertyCard
              key={property.id}
              id={property.id}
              title={property.title}
              price={property.price}
              beds={property.features.bedrooms}
              baths={property.features.bathrooms}
              status={property.status === 'rented' ? 'Rented' : 'Available'}
              image={property.images[0]}
              views={property.views}
              inquiries={property.inquiries}
              daysListed={property.daysListed}
              videoVerified={getPropertyVerificationStatus(property)}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6F8',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  actionsRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  addButton: {
    flex: 1,
    backgroundColor: '#E67E22',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginRight: 8,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  viewingButton: {
    backgroundColor: '#34568B',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    width: 100,
    position: 'relative',
  },
  viewingButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewingButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#E74C3C',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
  },
  // New styles for video verification status bar
  verificationBar: {
    flexDirection: 'row',
    backgroundColor: '#34568B',
    borderRadius: 8,
    marginBottom: 16,
    padding: 12,
    alignItems: 'center',
  },
  verificationIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  verificationContent: {
    flex: 1,
  },
  verificationTitle: {
    color: 'white',
    fontWeight: '600',
    fontSize: 15,
  },
  verificationDesc: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 13,
  },
});
