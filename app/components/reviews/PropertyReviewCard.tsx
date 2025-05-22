import React, { useState } from 'react';
import { View, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/contexts/LanguageContext';
import StarRating from '@/app/components/StarRating';
import { PropertyReview } from '@/app/types';

interface PropertyReviewCardProps {
  review: PropertyReview;
  isExpanded?: boolean;
  onRespond?: () => void;
  showLandlordInfo?: boolean;
}

export const PropertyReviewCard = ({
  review,
  isExpanded = false,
  onRespond,
  showLandlordInfo = false,
}: PropertyReviewCardProps) => {
  const { t } = useTranslation(['common', 'reviews']);
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  const [expanded, setExpanded] = useState(isExpanded);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(
      language === 'ar' ? 'ar-SA' : 'en-US',
      {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }
    );
  };

  const toggleExpand = () => {
    setExpanded(!expanded);
  };

  const getAvatarSource = (avatar?: string) => {
    if (!avatar) return require('../../../assets/images/avatar-placeholder.jpg');
    if (avatar.startsWith('http')) return { uri: avatar };
    return require('../../../assets/images/avatar-placeholder.jpg'); // Fallback
  };

  return (
    <View style={styles.container}>
      {/* Review Header */}
      <View style={styles.header}>
        <View style={styles.reviewerInfo}>
          <Image 
            source={getAvatarSource(review.reviewerAvatar)} 
            style={styles.avatar}
          />
          <View>
            <ThemedText style={styles.reviewerName}>
              {review.reviewerName}
            </ThemedText>
            <ThemedText style={styles.reviewDate}>
              {formatDate(review.createdAt)}
            </ThemedText>
          </View>
        </View>
        
        <View style={styles.ratingContainer}>
          <StarRating 
            rating={review.overallRating} 
            size={18} 
            readOnly 
          />
          <ThemedText style={styles.ratingText}>
            {review.overallRating.toFixed(1)}
          </ThemedText>
        </View>
      </View>

      {/* Property Info (if showing) */}
      {showLandlordInfo && (
        <View style={styles.propertyInfo}>
          <Ionicons name="person-outline" size={16} color="#34568B" />
          <ThemedText style={styles.propertyName}>
            {t('propertyBy', { ns: 'reviews' })} {/* Property by [Landlord Name] */}
          </ThemedText>
        </View>
      )}

      {/* Review Text */}
      <ThemedText 
        style={styles.reviewText}
        numberOfLines={expanded ? undefined : 3}
      >
        {review.reviewText}
      </ThemedText>

      {/* Would Rent Again */}
      <View style={styles.rentAgainContainer}>
        <Ionicons 
          name={review.wouldRentAgain ? "checkmark-circle" : "close-circle"} 
          size={20} 
          color={review.wouldRentAgain ? "#27AE60" : "#EB5757"} 
        />
        <ThemedText style={[
          styles.rentAgainText,
          { color: review.wouldRentAgain ? "#27AE60" : "#EB5757" }
        ]}>
          {review.wouldRentAgain 
            ? t('wouldRentAgain', { ns: 'reviews' }) 
            : t('wouldNotRentAgain', { ns: 'reviews' })}
        </ThemedText>
      </View>

      {/* Expand/Collapse Button */}
      {review.reviewText.length > 150 && (
        <TouchableOpacity 
          onPress={toggleExpand}
          style={styles.expandButton}
        >
          <ThemedText style={styles.expandButtonText}>
            {expanded 
              ? t('showLess', { ns: 'common' }) 
              : t('viewMore', { ns: 'reviews' })}
          </ThemedText>
          <Ionicons 
            name={expanded ? "chevron-up" : "chevron-down"} 
            size={16} 
            color="#34568B" 
          />
        </TouchableOpacity>
      )}

      {/* Expanded Content */}
      {expanded && (
        <View style={styles.expandedContent}>
          {/* Category Ratings */}
          <View style={styles.categoryRatings}>
            <ThemedText style={styles.sectionTitle}>
              {t('categoryRatings', { ns: 'reviews' })}
            </ThemedText>
            
            {Object.entries(review.categoryRatings).map(([category, rating]) => (
              <View key={category} style={styles.categoryRow}>
                <ThemedText style={styles.categoryName}>
                  {t(`${category}Rating`, { ns: 'reviews' })}
                </ThemedText>
                <StarRating rating={rating} size={16} readOnly />
              </View>
            ))}
          </View>

          {/* Images */}
          {review.images.length > 0 && (
            <View style={styles.imagesContainer}>
              <ThemedText style={styles.sectionTitle}>
                {t('propertyPhotos', { ns: 'reviews' })}
              </ThemedText>
              <View style={styles.imagesGrid}>
                {review.images.map((uri, index) => (
                  <Image
                    key={index}
                    source={{ uri }}
                    style={styles.reviewImage}
                  />
                ))}
              </View>
            </View>
          )}

          {/* Landlord Response */}
          {review.response && (
            <View style={styles.responseContainer}>
              <View style={styles.responseHeader}>
                <ThemedText style={styles.responseTitle}>
                  {t('responded', { ns: 'reviews' })}
                </ThemedText>
                <ThemedText style={styles.responseDate}>
                  {formatDate(review.response.createdAt)}
                </ThemedText>
              </View>
              <ThemedText style={styles.responseText}>
                {review.response.text}
              </ThemedText>
            </View>
          )}

          {/* Respond Button (if applicable) */}
          {!review.response && onRespond && (
            <TouchableOpacity
              style={styles.respondButton}
              onPress={onRespond}
            >
              <Ionicons name="chatbox-outline" size={18} color="#FFFFFF" />
              <ThemedText style={styles.respondButtonText}>
                {t('respondToReview', { ns: 'reviews' })}
              </ThemedText>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  reviewerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: '#F0F0F0',
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
  },
  reviewDate: {
    fontSize: 12,
    color: '#7F8FA4',
    marginTop: 2,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F2994A',
    marginLeft: 6,
  },
  propertyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  propertyName: {
    fontSize: 12,
    color: '#34568B',
    marginLeft: 6,
  },
  reviewText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#4F4F4F',
    marginBottom: 12,
  },
  rentAgainContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rentAgainText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  expandButtonText: {
    fontSize: 14,
    color: '#34568B',
    marginRight: 4,
  },
  expandedContent: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  categoryRatings: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 8,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  categoryName: {
    fontSize: 13,
    color: '#4F4F4F',
  },
  imagesContainer: {
    marginBottom: 16,
  },
  imagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  reviewImage: {
    width: '31%',
    aspectRatio: 1,
    margin: '1%',
    borderRadius: 4,
  },
  responseContainer: {
    backgroundColor: '#F5F7FA',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  responseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  responseTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#34568B',
  },
  responseDate: {
    fontSize: 12,
    color: '#7F8FA4',
  },
  responseText: {
    fontSize: 13,
    lineHeight: 18,
    color: '#4F4F4F',
  },
  respondButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#34568B',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginTop: 16,
  },
  respondButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
}); 