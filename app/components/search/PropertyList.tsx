import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { PropertyCard } from './PropertyCard';

interface PropertyListProps {
  properties: any[];
  t: (key: string, defaultText?: string) => string;
  getImageSource: (image: string) => any;
  onAdd?: (property: any) => void;
}

export const PropertyList: React.FC<PropertyListProps> = ({
  properties,
  t,
  getImageSource,
  onAdd,
}) => (
  <View style={[styles.list, styles.scrollContent]}>
    <ScrollView>
      {properties.map((property) => (
        <PropertyCard
          key={property.id}
          property={property}
          t={t}
          getImageSource={getImageSource}
          onAdd={onAdd ? () => onAdd(property) : undefined}
        />
      ))}
    </ScrollView>
  </View>
);

const styles = StyleSheet.create({
  list: { paddingHorizontal: 12 },
  scrollContent: { paddingBottom: 24 },
});
