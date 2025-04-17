import React from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ScreenHeader } from '../components/ScreenHeader';
import { PropertyCard } from '@/components/PropertyCard';
import { router } from 'expo-router';

interface Property {
  id: string;
  title: string;
  price: number;
  beds: number;
  baths: number;
  status: 'Available' | 'Rented';
  image: any; // We'll use require() for local images
  views: number;
  inquiries: number;
  daysListed: number;
}

const mockProperties: Property[] = [
  {
    id: '1',
    title: 'Garden Apartment',
    price: 250,
    beds: 2,
    baths: 1,
    status: 'Available',
    image: require('@/assets/images/property-placeholder.jpg'),
    views: 245,
    inquiries: 12,
    daysListed: 15,
  },
  {
    id: '2',
    title: 'City View Condo',
    price: 275,
    beds: 3,
    baths: 2,
    status: 'Rented',
    image: require('@/assets/images/property-placeholder.jpg'),
    views: 180,
    inquiries: 8,
    daysListed: 30,
  },
];

export default function PropertiesScreen() {
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
          <ThemedText style={styles.sectionTitle}>Your Properties (2)</ThemedText>
        </View>

        {mockProperties.map((property) => (
          <PropertyCard key={property.id} {...property} />
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