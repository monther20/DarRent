import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image, ImageSourcePropType } from 'react-native';
import { ThemedText } from './ThemedText';
import { router } from 'expo-router';

interface PropertyCardProps {
  id: string;
  title: string;
  price: number;
  beds: number;
  baths: number;
  status: 'Available' | 'Rented';
  image: ImageSourcePropType;
  views: number;
  inquiries: number;
  daysListed: number;
}

export function PropertyCard({
  id,
  title,
  price,
  beds,
  baths,
  status,
  image,
  views,
  inquiries,
  daysListed,
}: PropertyCardProps) {
  const getImageSource = (avatar: string) => {
    if (!avatar) return require('../assets/images/property-placeholder.jpg');
    if (avatar.startsWith('http')) return { uri: avatar };
    if (avatar.startsWith('/assets')) return require('../assets/images/property-placeholder.jpg');
    return { uri: avatar }; // fallback, but probably never reached
  };
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => router.push(`/property/${id}`)}
    >
      <View style={styles.contentContainer}>
        <Image source={getImageSource(image)} style={styles.image} />
        <View style={styles.details}>
          <ThemedText style={styles.title}>{title}</ThemedText>
          <ThemedText style={styles.price}>{price} JOD/month</ThemedText>
          <ThemedText style={styles.info}>
            {beds} bed • {baths} bath • {status}
          </ThemedText>
        </View>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <ThemedText style={styles.statLabel}>Views</ThemedText>
          <ThemedText style={styles.statValue}>{views}</ThemedText>
        </View>
        <View style={[styles.statItem, styles.statBorder]}>
          <ThemedText style={styles.statLabel}>Inquiries</ThemedText>
          <ThemedText style={styles.statValue}>{inquiries}</ThemedText>
        </View>
        <View style={styles.statItem}>
          <ThemedText style={styles.statLabel}>Days Listed</ThemedText>
          <ThemedText style={styles.statValue}>{daysListed}</ThemedText>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#34568B',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  contentContainer: {
    flexDirection: 'row',
    padding: 12,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  details: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  price: {
    fontSize: 15,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  info: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.8,
  },
  statsContainer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  statBorder: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  statLabel: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.8,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
}); 