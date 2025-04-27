import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ScreenHeader } from '../components/ScreenHeader';
import { PropertyCard } from '@/components/PropertyCard';
import { router } from 'expo-router';
import { mockApi } from '../services/mockApi';
import { Property } from '../types';

export default function PropertiesScreen() {
  const [loading, setLoading] = useState(true);
  const [properties, setProperties] = useState<Property[]>([]);

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    setLoading(true);
    try {
      // TODO: Replace 'user1' with actual logged-in user ID
      const data = await mockApi.getLandlordProperties('user1');
      setProperties(data);
    } catch (error) {
      console.error('Error loading properties:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ScreenHeader title="Property" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#34568B" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScreenHeader title="Property" />
      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
      >
        <TouchableOpacity style={styles.addButton} onPress={() => router.push('/add-property')}>
          <ThemedText style={styles.addButtonText}>+ Add New Property</ThemedText>
        </TouchableOpacity>

        <View style={styles.sectionHeader}>
          <ThemedText style={styles.sectionTitle}>Your Properties ({properties.length})</ThemedText>
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
          />
        ))}
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
  addButton: {
    backgroundColor: '#E67E22',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
  },
}); 