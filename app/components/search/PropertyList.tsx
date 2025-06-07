import React from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
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
}) => {
  const router = useRouter();

  const handlePropertyPress = (property: any) => {
    router.push({
      pathname: '/property/[id]',
      params: { id: property.id },
    });
  };

  return (
    <View style={[styles.list, styles.scrollContent]}>
      <ScrollView>
        {properties.map((property) => (
          <TouchableOpacity
            key={property.id}
            onPress={() => handlePropertyPress(property)}
            activeOpacity={0.7}
            style={styles.propertyPressable}
          >
            <PropertyCard
              property={property}
              t={t}
              getImageSource={getImageSource}
              onAdd={onAdd ? () => onAdd(property) : undefined}
            />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  list: { paddingHorizontal: 12 },
  scrollContent: { paddingBottom: 24 },
  propertyPressable: {
    marginBottom: 12,
  },
});
