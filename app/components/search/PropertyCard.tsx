import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

interface PropertyCardProps {
  property: any;
  onAdd?: () => void;
  t: (key: string, defaultText?: string) => string;
  getImageSource: (image: string) => any;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  onAdd,
  t,
  getImageSource,
}) => (
  <View style={styles.propertyCard}>
    <Image source={getImageSource(property.images[0])} style={styles.propertyImage} />
    <View style={{ flex: 1, marginLeft: 12 }}>
      <Text style={styles.propertyTitle}>{property.title}</Text>
      <Text style={styles.propertyPrice}>
        {property.price} {property.currency}/ {t('month', 'month')}
      </Text>
      <Text style={styles.propertyDetails}>
        {property.features.bedrooms} {t('property.bed')} • {property.features.bathrooms}{' '}
        {t('property.bath')} • {property.features.area}m²
      </Text>
      <Text style={styles.propertyLocation}>
        {property.location.area}, {property.location.city}
      </Text>
    </View>
    <TouchableOpacity style={styles.fabBtn} onPress={onAdd}>
      <Ionicons name="add" size={22} color="#fff" />
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  propertyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#34568B',
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  propertyImage: { width: 70, height: 70, borderRadius: 10, marginRight: 8 },
  propertyTitle: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  propertyPrice: { color: '#fff', fontSize: 15, marginTop: 2 },
  propertyDetails: { color: '#e0e6f7', fontSize: 13, marginTop: 2 },
  propertyLocation: { color: '#e0e6f7', fontSize: 13, marginTop: 2 },
  fabBtn: {
    backgroundColor: '#E67E22',
    borderRadius: 18,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
});
