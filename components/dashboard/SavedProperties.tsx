import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image, FlatList } from 'react-native';
import { Text } from '@/components/Text';
import { router } from 'expo-router';

export interface SavedProperty {
  id: string;
  title: string;
  price: string;
  details: string;
  location: string;
  image: any;
  path: string;
}

type SavedPropertiesProps = {
  properties: SavedProperty[];
};

export function SavedProperties({ properties }: SavedPropertiesProps) {
  const renderProperty = ({ item }: { item: SavedProperty }) => (
    <TouchableOpacity style={styles.propertyCard} onPress={() => router.push(item.path)}>
      <Image source={item.image} style={styles.propertyImage} />
      <View style={styles.propertyInfo}>
        <Text style={styles.propertyTitle}>{item.title}</Text>
        <Text style={styles.propertyPrice}>{item.price}</Text>
        <Text style={styles.propertyDetails}>{item.details}</Text>
        <Text style={styles.propertyLocation}>{item.location}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View>
      <Text style={styles.sectionTitle}>Saved Properties</Text>
      <FlatList
        data={properties}
        renderItem={renderProperty}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.propertiesRow}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#34568B',
    paddingHorizontal: 16,
  },
  propertiesRow: {
    paddingHorizontal: 16,
    gap: 16,
  },
  propertyCard: {
    width: 280,
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  propertyImage: {
    width: '100%',
    height: 160,
    resizeMode: 'cover',
  },
  propertyInfo: {
    padding: 12,
  },
  propertyTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  propertyPrice: {
    fontSize: 14,
    color: '#34568B',
    marginBottom: 4,
  },
  propertyDetails: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  propertyLocation: {
    fontSize: 12,
    color: '#666',
  },
});
