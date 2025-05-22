import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { ThemedText } from './ThemedText';
import { router } from 'expo-router';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

interface PropertyCardProps {
  id: string;
  title: string;
  price: number;
  beds: number;
  baths: number;
  status: 'Available' | 'Rented' | 'Pending';
  image?: string;
  views?: number;
  inquiries?: number;
  daysListed?: number;
  videoVerified?: boolean | null; // null = no video, false = pending, true = verified
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  id,
  title,
  price,
  beds,
  baths,
  status,
  image,
  views = 0,
  inquiries = 0,
  daysListed = 0,
  videoVerified = null,
}) => {
  const { t } = useTranslation();
  
  const handlePress = () => {
    router.push({
      pathname: '/property/[id]',
      params: { id },
    });
  };

  const renderVerificationBadge = () => {
    if (videoVerified === null) return null;
    
    if (videoVerified === true) {
      return (
        <View style={[styles.badge, styles.verifiedBadge]}>
          <MaterialCommunityIcons name="video-check" size={14} color="white" />
          <ThemedText style={styles.badgeText}>{t('Verified')}</ThemedText>
        </View>
      );
    }
    
    return (
      <View style={[styles.badge, styles.pendingBadge]}>
        <MaterialCommunityIcons name="video-plus" size={14} color="white" />
        <ThemedText style={styles.badgeText}>{t('Pending')}</ThemedText>
      </View>
    );
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress}>
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: image || 'https://via.placeholder.com/300x200' }}
          style={styles.image}
          resizeMode="cover"
        />
        <View style={styles.statusBadge}>
          <ThemedText style={styles.statusText}>{status}</ThemedText>
        </View>
        {renderVerificationBadge()}
      </View>

      <View style={styles.content}>
        <ThemedText style={styles.title}>{title}</ThemedText>
        <ThemedText style={styles.price}>{price} JOD</ThemedText>

        <View style={styles.details}>
          <View style={styles.detailItem}>
            <MaterialIcons name="king-bed" size={18} color="#34568B" />
            <ThemedText style={styles.detailText}>{beds}</ThemedText>
          </View>
          <View style={styles.detailItem}>
            <MaterialIcons name="bathtub" size={18} color="#34568B" />
            <ThemedText style={styles.detailText}>{baths}</ThemedText>
          </View>
        </View>

        <View style={styles.stats}>
          <View style={styles.statItem}>
            <MaterialIcons name="remove-red-eye" size={16} color="#6B7280" />
            <ThemedText style={styles.statText}>{views} {t('views')}</ThemedText>
          </View>
          <View style={styles.statItem}>
            <MaterialIcons name="question-answer" size={16} color="#6B7280" />
            <ThemedText style={styles.statText}>{inquiries} {t('inquiries')}</ThemedText>
          </View>
          <View style={styles.statItem}>
            <MaterialIcons name="access-time" size={16} color="#6B7280" />
            <ThemedText style={styles.statText}>{daysListed} {t('days')}</ThemedText>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  imageContainer: {
    position: 'relative',
    height: 160,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  statusBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(52, 86, 139, 0.85)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  badge: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  verifiedBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.9)',
  },
  pendingBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.9)',
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  content: {
    padding: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  price: {
    fontSize: 18,
    fontWeight: '700',
    color: '#34568B',
    marginBottom: 8,
  },
  details: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  detailText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#4B5563',
  },
  stats: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 12,
    justifyContent: 'space-between',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#6B7280',
  },
}); 