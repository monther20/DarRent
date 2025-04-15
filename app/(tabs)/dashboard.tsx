import React from 'react';
import { View, ScrollView, ScrollViewProps, StyleSheet } from 'react-native';
import { Text } from '@/components/Text';
import { router } from 'expo-router';
import { Image } from 'expo-image';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, StyledScrollView } from '@/components/styled';

// Re-export Pressable with proper styling support
const StyledPressable = Pressable as typeof Pressable;
const StyledHorizontalScrollView = ScrollView as React.ComponentType<ScrollViewProps & { horizontal?: boolean; showsHorizontalScrollIndicator?: boolean }>;

export default function DashboardScreen() {
  return (
    <StyledScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Hello, Ahmad</Text>
        <View style={styles.searchContainer}>
          <StyledPressable style={styles.searchButton}>
            <Text style={styles.searchText}>Search properties...</Text>
          </StyledPressable>
        </View>
      </View>

      {/* Current Rental */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Current Rental</Text>
        <StyledPressable 
          style={styles.rentalCard}
          onPress={() => router.push('/rental-details')}
        >
          <Image
            source={require('@/assets/images/garden-apt.jpg')}
            style={styles.rentalImage}
            contentFit="cover"
          />
          <View style={styles.rentalDetails}>
            <Text style={styles.rentalTitle}>Garden Apartment</Text>
            <Text style={styles.rentalPrice}>850 JOD/month</Text>
            <Text style={styles.rentalInfo}>Lease ends in 3 months</Text>
          </View>
          <View style={styles.paymentWarning}>
            <Text style={styles.warningText}>Next Payment: 850 JOD due in 5 days</Text>
          </View>
        </StyledPressable>
      </View>

      {/* Saved Properties */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Saved Properties</Text>
        <StyledHorizontalScrollView horizontal showsHorizontalScrollIndicator={false}>
          {[
            {
              id: 1,
              title: 'Luxury Apartment',
              price: '1,200',
              location: 'Abdoun',
              specs: '2 bed • 2 bath',
              image: require('@/assets/images/luxury-apt.jpg')
            },
            {
              id: 2,
              title: 'Downtown Studio',
              price: '650',
              location: 'Jabal Amman',
              specs: '1 bed • 1 bath',
              image: require('@/assets/images/studio-apt.jpg')
            }
          ].map((property) => (
            <View key={property.id}>
              <StyledPressable 
                style={styles.propertyCard}
                onPress={() => router.push(`/property/${property.id}`)}
              >
                <Image
                  source={property.image}
                  style={styles.propertyImage}
                  contentFit="cover"
                />
                <View style={styles.propertyDetails}>
                  <Text style={styles.propertyTitle}>{property.title}</Text>
                  <Text style={styles.propertyPrice}>{property.price} JOD/month</Text>
                  <Text style={styles.propertySpecs}>{property.specs}</Text>
                  <Text style={styles.propertyLocation}>{property.location}</Text>
                </View>
              </StyledPressable>
            </View>
          ))}
        </StyledHorizontalScrollView>
      </View>

      {/* Recent Applications */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Applications</Text>
        <StyledPressable 
          style={styles.applicationCard}
          onPress={() => router.push('/applications')}
        >
          <View style={styles.applicationContent}>
            <View>
              <Text style={styles.applicationTitle}>Modern Villa Application</Text>
              <Text style={styles.applicationStatus}>Status: Under Review</Text>
            </View>
            <StyledPressable 
              style={styles.trackButton}
              onPress={() => router.push('/applications/track')}
            >
              <Text style={styles.trackButtonText}>Track</Text>
            </StyledPressable>
          </View>
        </StyledPressable>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <StyledPressable 
          style={[styles.actionButton, styles.actionButtonLeft]}
          onPress={() => router.push('/payments')}
        >
          <Text style={styles.actionButtonText}>Pay Rent</Text>
        </StyledPressable>
        <StyledPressable 
          style={[styles.actionButton, styles.actionButtonMiddle]}
          onPress={() => router.push('/contact-owner')}
        >
          <Text style={styles.actionButtonText}>Contact Owner</Text>
        </StyledPressable>
        <StyledPressable 
          style={[styles.actionButton, styles.actionButtonRight]}
          onPress={() => router.push('/support')}
        >
          <Text style={styles.actionButtonText}>Support</Text>
        </StyledPressable>
      </View>
    </StyledScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    padding: 16,
    backgroundColor: '#34568B',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  searchContainer: {
    marginTop: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
  },
  searchButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  searchText: {
    color: 'white',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  rentalCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 2,
  },
  rentalImage: {
    width: '100%',
    height: 192,
  },
  rentalDetails: {
    padding: 16,
  },
  rentalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  rentalPrice: {
    color: '#34568B',
  },
  rentalInfo: {
    color: '#4B5563',
  },
  paymentWarning: {
    backgroundColor: '#FEF3C7',
    padding: 16,
  },
  warningText: {
    color: '#92400E',
  },
  propertyCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 2,
    marginRight: 16,
    width: 256,
  },
  propertyImage: {
    width: '100%',
    height: 128,
  },
  propertyDetails: {
    padding: 12,
  },
  propertyTitle: {
    fontWeight: '600',
  },
  propertyPrice: {
    color: '#34568B',
  },
  propertySpecs: {
    color: '#4B5563',
  },
  propertyLocation: {
    color: '#4B5563',
  },
  applicationCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 2,
  },
  applicationContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  applicationTitle: {
    fontWeight: '600',
  },
  applicationStatus: {
    color: '#4B5563',
  },
  trackButton: {
    backgroundColor: '#34568B',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
  trackButtonText: {
    color: 'white',
  },
  quickActions: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    backgroundColor: '#34568B',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 4,
    flex: 1,
  },
  actionButtonLeft: {
    marginRight: 8,
  },
  actionButtonMiddle: {
    marginHorizontal: 8,
  },
  actionButtonRight: {
    marginLeft: 8,
  },
  actionButtonText: {
    color: 'white',
    textAlign: 'center',
  },
}); 