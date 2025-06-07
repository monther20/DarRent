import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import Ionicons from '@expo/vector-icons/Ionicons';

interface PropertyHeaderProps {
  title: string;
  location: string;
  onBack: () => void;
  isRTL: boolean;
}

export const PropertyHeader: React.FC<PropertyHeaderProps> = ({
  title,
  location,
  onBack,
  isRTL,
}) => {
  const { t } = useTranslation(['propertyDetails']);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.backButton, isRTL ? styles.backButtonRTL : styles.backButtonLTR]}
        onPress={onBack}
      >
        <Ionicons name={isRTL ? 'chevron-forward' : 'chevron-back'} size={24} color="#fff" />
      </TouchableOpacity>

      <View style={[styles.titleContainer, isRTL && styles.titleContainerRTL]}>
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>
        <View style={[styles.locationContainer, isRTL && styles.locationContainerRTL]}>
          <Ionicons name="location-outline" size={16} color="#fff" style={styles.locationIcon} />
          <Text style={styles.location}>{location}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#34568B',
    paddingTop: 8,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  backButton: {
    position: 'absolute',
    top: 8,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonLTR: {
    left: 16,
  },
  backButtonRTL: {
    right: 16,
  },
  titleContainer: {
    marginTop: 40,
    alignItems: 'flex-start',
  },
  titleContainerRTL: {
    alignItems: 'flex-end',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationContainerRTL: {
    flexDirection: 'row-reverse',
  },
  locationIcon: {
    marginRight: 4,
  },
  location: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
});
