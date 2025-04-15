import React, { useState } from 'react';
import { View, ScrollView, ScrollViewProps, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from '@/components/Text';
import { router } from 'expo-router';
import { Image } from 'expo-image';
import MapView, { Marker } from 'react-native-maps';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyledTextInput, StyledScrollView } from '@/components/styled';

// Add horizontal scroll view with proper typing
const StyledHorizontalScrollView = ScrollView as React.ComponentType<ScrollViewProps & { horizontal?: boolean; showsHorizontalScrollIndicator?: boolean }>;

export default function SearchScreen() {
  const [activeFilter, setActiveFilter] = useState('price');
  const [showMap, setShowMap] = useState(false);

  const properties = [
    {
      id: 1,
      title: 'Modern Apartment',
      price: '950',
      location: 'Abdoun, Amman',
      specs: '2 bed • 1 bath • 120m²',
      coordinates: { latitude: 31.9539, longitude: 35.9106 },
      image: require('@/assets/images/modern-apt.jpg')
    },
    {
      id: 2,
      title: 'Luxury Villa',
      price: '1,800',
      location: 'Dabouq, Amman',
      specs: '4 bed • 3 bath • 300m²',
      coordinates: { latitude: 31.9639, longitude: 35.9006 },
      image: require('@/assets/images/luxury-villa.jpg')
    }
  ];

  return (
    <View style={styles.container}>
      {/* Search Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Find Your Home</Text>
        <View style={styles.searchContainer}>
          <StyledTextInput
            placeholder="Search by location..."
            style={styles.searchInput}
          />
        </View>
      </View>

      {/* Filters */}
      <StyledHorizontalScrollView 
        horizontal 
        style={styles.filtersContainer} 
        showsHorizontalScrollIndicator={false}
      >
        {['Price', 'Type', 'Rooms'].map((filter) => (
          <TouchableOpacity
            key={filter}
            onPress={() => setActiveFilter(filter.toLowerCase())}
            style={[
              styles.filterButton,
              activeFilter === filter.toLowerCase() ? styles.activeFilterButton : styles.inactiveFilterButton
            ]}
          >
            <Text
              style={[
                styles.filterText,
                activeFilter === filter.toLowerCase() ? styles.activeFilterText : styles.inactiveFilterText
              ]}
            >
              {filter}
            </Text>
          </TouchableOpacity>
        ))}
      </StyledHorizontalScrollView>

      {/* Map Toggle */}
      <TouchableOpacity
        onPress={() => setShowMap(!showMap)}
        style={styles.mapToggleButton}
      >
        <MaterialCommunityIcons
          name={showMap ? 'format-list-bulleted' : 'map'}
          size={24}
          color="#1e40af"
        />
      </TouchableOpacity>

      {showMap ? (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: 31.9539,
            longitude: 35.9106,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        >
          {properties.map((property) => (
            <Marker
              key={property.id}
              coordinate={property.coordinates}
              title={property.title}
              description={`${property.price} JOD/month`}
            />
          ))}
        </MapView>
      ) : (
        <StyledScrollView style={styles.propertiesContainer}>
          <Text style={styles.propertiesCount}>15 Properties Found</Text>
          {properties.map((property) => (
            <TouchableOpacity
              key={property.id}
              style={styles.propertyCard}
              onPress={() => router.push(`/property/${property.id}`)}
            >
              <Image
                source={property.image}
                style={styles.propertyImage}
                contentFit="cover"
              />
              <View style={styles.propertyDetails}>
                <View style={styles.propertyHeader}>
                  <Text style={styles.propertyTitle}>{property.title}</Text>
                  <TouchableOpacity style={styles.addButton}>
                    <MaterialCommunityIcons name="plus" size={24} color="#1e40af" />
                  </TouchableOpacity>
                </View>
                <Text style={styles.propertyPrice}>{property.price} JOD/month</Text>
                <Text style={styles.propertySpecs}>{property.specs}</Text>
                <Text style={styles.propertyLocation}>{property.location}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </StyledScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    padding: 16,
    backgroundColor: '#1e40af',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
  },
  searchContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
  },
  searchInput: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  filtersContainer: {
    padding: 16,
  },
  filterButton: {
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 9999,
    marginRight: 8,
  },
  activeFilterButton: {
    backgroundColor: '#1e40af',
  },
  inactiveFilterButton: {
    backgroundColor: '#dbeafe',
  },
  filterText: {
    fontSize: 14,
  },
  activeFilterText: {
    color: 'white',
  },
  inactiveFilterText: {
    color: '#1e40af',
  },
  mapToggleButton: {
    position: 'absolute',
    top: 128,
    right: 16,
    zIndex: 10,
    backgroundColor: 'white',
    padding: 8,
    borderRadius: 9999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  map: {
    flex: 1,
  },
  propertiesContainer: {
    flex: 1,
    padding: 16,
  },
  propertiesCount: {
    fontSize: 18,
    marginBottom: 8,
  },
  propertyCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    marginBottom: 16,
  },
  propertyImage: {
    width: '100%',
    height: 192,
  },
  propertyDetails: {
    padding: 16,
  },
  propertyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  propertyTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  addButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  propertyPrice: {
    color: '#1e40af',
  },
  propertySpecs: {
    color: '#4b5563',
  },
  propertyLocation: {
    color: '#4b5563',
  },
}); 