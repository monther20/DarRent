import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
  Image
} from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/contexts/LanguageContext';
import StarRating from '../../components/StarRating';
import * as ImagePicker from 'expo-image-picker';
import { mockApi } from '@/app/services/mockApi';

// Rating categories for detailed renter evaluation
const RATING_CATEGORIES = [
  { id: 'payment', key: 'paymentPunctuality' },
  { id: 'cleanliness', key: 'propertyMaintenance' },
  { id: 'communication', key: 'communication' },
  { id: 'rules', key: 'rulesAdherence' },
  { id: 'neighbors', key: 'neighborRelations' },
];

interface RenterReviewFormProps {
  contractId: string;
  renterId: string;
  renterName: string;
  propertyId: string;
  propertyName: string;
  leaseEnd: string;
  onSubmit: () => void;
  onCancel: () => void;
}

export const RenterReviewForm = ({
  contractId,
  renterId,
  renterName,
  propertyId,
  propertyName,
  leaseEnd,
  onSubmit,
  onCancel,
}: RenterReviewFormProps) => {
  const { t } = useTranslation(['common', 'reviews']);
  const { language } = useLanguage();
  const isRTL = language === 'ar';

  // State for form data
  const [overallRating, setOverallRating] = useState<number>(0);
  const [categoryRatings, setCategoryRatings] = useState<Record<string, number>>({});
  const [reviewText, setReviewText] = useState<string>('');
  const [wouldRentAgain, setWouldRentAgain] = useState<boolean | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [showPolicy, setShowPolicy] = useState<boolean>(false);

  // Initialize category ratings
  useEffect(() => {
    const initialRatings: Record<string, number> = {};
    RATING_CATEGORIES.forEach(category => {
      initialRatings[category.id] = 0;
    });
    setCategoryRatings(initialRatings);
  }, []);

  const updateCategoryRating = (category: string, rating: number) => {
    setCategoryRatings(prev => ({
      ...prev,
      [category]: rating
    }));
    
    // Recalculate overall rating based on category averages
    const updatedRatings = { ...categoryRatings, [category]: rating };
    const totalRating = Object.values(updatedRatings).reduce((sum, val) => sum + val, 0);
    const avgRating = totalRating / Object.keys(updatedRatings).length;
    setOverallRating(Math.round(avgRating));
  };

  const pickImage = async () => {
    if (images.length >= 5) {
      Alert.alert(
        t('imageLimit', { ns: 'reviews' }),
        t('maxImagesReached', { ns: 'reviews' })
      );
      return;
    }

    // Request permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert(
        t('permissionRequired', { ns: 'reviews' }),
        t('imagePermissionDenied', { ns: 'reviews' })
      );
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImages([...images, result.assets[0].uri]);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert(t('error', { ns: 'common' }), t('imageUploadFailed', { ns: 'reviews' }));
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const validateForm = (): boolean => {
    if (overallRating === 0) {
      Alert.alert(
        t('incomplete', { ns: 'reviews' }),
        t('overallRatingRequired', { ns: 'reviews' })
      );
      return false;
    }

    const hasZeroRating = Object.values(categoryRatings).some(rating => rating === 0);
    if (hasZeroRating) {
      Alert.alert(
        t('incomplete', { ns: 'reviews' }),
        t('allCategoriesRequired', { ns: 'reviews' })
      );
      return false;
    }

    if (reviewText.trim().length < 10) {
      Alert.alert(
        t('incomplete', { ns: 'reviews' }),
        t('reviewTextRequired', { ns: 'reviews' })
      );
      return false;
    }

    if (wouldRentAgain === null) {
      Alert.alert(
        t('incomplete', { ns: 'reviews' }),
        t('wouldRentAgainRequired', { ns: 'reviews' })
      );
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // In a real implementation, upload images to storage and get URLs
      const imageUrls = [...images]; // Mock - in real implementation would be uploaded URLs

      // Submit review to API
      await mockApi.submitRenterReview({
        contractId,
        renterId,
        propertyId,
        overallRating,
        categoryRatings,
        reviewText,
        wouldRentAgain,
        images: imageUrls,
        createdAt: new Date().toISOString()
      });

      Alert.alert(
        t('success', { ns: 'common' }),
        t('reviewSubmitted', { ns: 'reviews' }),
        [{ text: t('ok', { ns: 'common' }), onPress: onSubmit }]
      );
    } catch (error) {
      console.error("Error submitting review:", error);
      Alert.alert(
        t('error', { ns: 'common' }), 
        t('reviewSubmissionFailed', { ns: 'reviews' })
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>{t('reviewRenter', { ns: 'reviews' })}</ThemedText>
        <ThemedText style={styles.subtitle}>
          {renterName} - {propertyName}
        </ThemedText>
      </View>

      {/* Contract Information */}
      <View style={styles.contractInfo}>
        <ThemedText style={styles.sectionTitle}>{t('contractInfo', { ns: 'reviews' })}</ThemedText>
        <View style={styles.infoRow}>
          <ThemedText style={styles.infoLabel}>{t('property', { ns: 'reviews' })}:</ThemedText>
          <ThemedText style={styles.infoValue}>{propertyName}</ThemedText>
        </View>
        <View style={styles.infoRow}>
          <ThemedText style={styles.infoLabel}>{t('renter', { ns: 'reviews' })}:</ThemedText>
          <ThemedText style={styles.infoValue}>{renterName}</ThemedText>
        </View>
        <View style={styles.infoRow}>
          <ThemedText style={styles.infoLabel}>{t('leaseEnd', { ns: 'reviews' })}:</ThemedText>
          <ThemedText style={styles.infoValue}>
            {new Date(leaseEnd).toLocaleDateString()}
          </ThemedText>
        </View>
      </View>

      {/* Overall Rating */}
      <View style={styles.ratingSection}>
        <ThemedText style={styles.sectionTitle}>{t('overallRating', { ns: 'reviews' })}</ThemedText>
        <View style={styles.overallRatingContainer}>
          <StarRating
            rating={overallRating}
            onChange={setOverallRating}
            size={36}
            maxStars={5}
            color="#F2994A"
          />
          <ThemedText style={styles.ratingLabel}>
            {overallRating > 0
              ? t(`rating${overallRating}`, { ns: 'reviews' })
              : t('selectRating', { ns: 'reviews' })}
          </ThemedText>
        </View>
      </View>

      {/* Category Ratings */}
      <View style={styles.ratingSection}>
        <ThemedText style={styles.sectionTitle}>{t('categoryRatings', { ns: 'reviews' })}</ThemedText>
        
        {RATING_CATEGORIES.map((category) => (
          <View key={category.id} style={styles.categoryRatingRow}>
            <ThemedText style={styles.categoryLabel}>
              {t(category.key, { ns: 'reviews' })}
            </ThemedText>
            <StarRating
              rating={categoryRatings[category.id] || 0}
              onChange={(rating) => updateCategoryRating(category.id, rating)}
              size={24}
              maxStars={5}
              color="#F2994A"
            />
          </View>
        ))}
      </View>

      {/* Review Text */}
      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>{t('writtenReview', { ns: 'reviews' })}</ThemedText>
        <TextInput
          style={styles.reviewInput}
          placeholder={t('reviewPlaceholder', { ns: 'reviews' })}
          multiline
          numberOfLines={5}
          textAlignVertical="top"
          value={reviewText}
          onChangeText={setReviewText}
          placeholderTextColor="#BDBDBD"
        />
        <ThemedText style={styles.charCount}>
          {reviewText.length}/500 {t('characters', { ns: 'reviews' })}
        </ThemedText>
      </View>

      {/* Would Rent Again */}
      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>{t('wouldRentAgain', { ns: 'reviews' })}</ThemedText>
        <View style={styles.rentAgainButtons}>
          <TouchableOpacity
            style={[
              styles.rentAgainButton,
              wouldRentAgain === true && styles.rentAgainButtonActive,
              wouldRentAgain === true && styles.rentAgainButtonYes
            ]}
            onPress={() => setWouldRentAgain(true)}
          >
            <Ionicons 
              name={wouldRentAgain === true ? "checkmark-circle" : "checkmark-circle-outline"} 
              size={24} 
              color={wouldRentAgain === true ? "#FFFFFF" : "#34568B"}
            />
            <ThemedText style={[
              styles.rentAgainButtonText,
              wouldRentAgain === true && styles.rentAgainButtonTextActive
            ]}>
              {t('yes', { ns: 'common' })}
            </ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.rentAgainButton,
              wouldRentAgain === false && styles.rentAgainButtonActive,
              wouldRentAgain === false && styles.rentAgainButtonNo
            ]}
            onPress={() => setWouldRentAgain(false)}
          >
            <Ionicons 
              name={wouldRentAgain === false ? "close-circle" : "close-circle-outline"} 
              size={24} 
              color={wouldRentAgain === false ? "#FFFFFF" : "#34568B"}
            />
            <ThemedText style={[
              styles.rentAgainButtonText,
              wouldRentAgain === false && styles.rentAgainButtonTextActive
            ]}>
              {t('no', { ns: 'common' })}
            </ThemedText>
          </TouchableOpacity>
        </View>
      </View>

      {/* Photo Upload */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <ThemedText style={styles.sectionTitle}>{t('uploadPhotos', { ns: 'reviews' })}</ThemedText>
          <ThemedText style={styles.sectionSubtitle}>
            ({t('optional', { ns: 'common' })})
          </ThemedText>
        </View>
        
        <ThemedText style={styles.photoDescription}>
          {t('photoDescription', { ns: 'reviews' })}
        </ThemedText>
        
        <View style={styles.photoGrid}>
          {images.map((uri, index) => (
            <View key={index} style={styles.photoContainer}>
              <Image source={{ uri }} style={styles.photo} />
              <TouchableOpacity 
                style={styles.removePhotoButton}
                onPress={() => removeImage(index)}
              >
                <Ionicons name="close-circle" size={24} color="#EB5757" />
              </TouchableOpacity>
            </View>
          ))}
          
          {images.length < 5 && (
            <TouchableOpacity style={styles.addPhotoButton} onPress={pickImage}>
              <Ionicons name="camera" size={24} color="#34568B" />
              <ThemedText style={styles.addPhotoText}>
                {t('addPhoto', { ns: 'reviews' })}
              </ThemedText>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Review Policy */}
      <TouchableOpacity
        style={styles.policyButton}
        onPress={() => setShowPolicy(!showPolicy)}
      >
        <ThemedText style={styles.policyButtonText}>
          {showPolicy
            ? t('hideReviewPolicy', { ns: 'reviews' })
            : t('viewReviewPolicy', { ns: 'reviews' })}
        </ThemedText>
        <Ionicons
          name={showPolicy ? "chevron-up" : "chevron-down"}
          size={18}
          color="#34568B"
        />
      </TouchableOpacity>
      
      {showPolicy && (
        <View style={styles.policyContainer}>
          <ThemedText style={styles.policyTitle}>{t('reviewPolicy', { ns: 'reviews' })}</ThemedText>
          <ThemedText style={styles.policyText}>
            {t('reviewPolicyText1', { ns: 'reviews' })}
          </ThemedText>
          <ThemedText style={styles.policyText}>
            {t('reviewPolicyText2', { ns: 'reviews' })}
          </ThemedText>
          <ThemedText style={styles.policyText}>
            {t('reviewPolicyText3', { ns: 'reviews' })}
          </ThemedText>
        </View>
      )}

      {/* Buttons */}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity 
          style={styles.cancelButton}
          onPress={onCancel}
          disabled={loading}
        >
          <ThemedText style={styles.cancelButtonText}>
            {t('cancel', { ns: 'common' })}
          </ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <ThemedText style={styles.submitButtonText}>
              {t('submitReview', { ns: 'reviews' })}
            </ThemedText>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    padding: 16,
    backgroundColor: '#34568B',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  contractInfo: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    margin: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoLabel: {
    fontWeight: '600',
    width: '40%',
    color: '#4F4F4F',
  },
  infoValue: {
    flex: 1,
    color: '#2C3E50',
  },
  section: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    margin: 16,
    marginTop: 0,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  ratingSection: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    margin: 16,
    marginTop: 0,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#34568B',
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionSubtitle: {
    marginLeft: 8,
    fontSize: 14,
    color: '#7F8FA4',
  },
  overallRatingContainer: {
    alignItems: 'center',
    marginVertical: 8,
  },
  ratingLabel: {
    marginTop: 8,
    fontSize: 16,
    color: '#2C3E50',
    fontWeight: '500',
  },
  categoryRatingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  categoryLabel: {
    flex: 1,
    fontSize: 14,
    color: '#4F4F4F',
  },
  reviewInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    height: 120,
    fontSize: 14,
    color: '#4F4F4F',
    backgroundColor: '#FFFFFF',
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    color: '#7F8FA4',
    alignSelf: 'flex-end',
    marginTop: 8,
  },
  rentAgainButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rentAgainButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    marginHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  rentAgainButtonActive: {
    borderWidth: 0,
  },
  rentAgainButtonYes: {
    backgroundColor: '#27AE60',
  },
  rentAgainButtonNo: {
    backgroundColor: '#EB5757',
  },
  rentAgainButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
    color: '#34568B',
  },
  rentAgainButtonTextActive: {
    color: '#FFFFFF',
  },
  photoDescription: {
    fontSize: 14,
    color: '#7F8FA4',
    marginBottom: 12,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  photoContainer: {
    width: '31%',
    aspectRatio: 1,
    margin: '1%',
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  removePhotoButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 12,
  },
  addPhotoButton: {
    width: '31%',
    aspectRatio: 1,
    margin: '1%',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  addPhotoText: {
    marginTop: 8,
    fontSize: 12,
    color: '#34568B',
  },
  policyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    marginHorizontal: 16,
  },
  policyButtonText: {
    fontSize: 14,
    color: '#34568B',
    marginRight: 8,
  },
  policyContainer: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    marginHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  policyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 8,
  },
  policyText: {
    fontSize: 14,
    color: '#4F4F4F',
    marginBottom: 8,
    lineHeight: 20,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    margin: 16,
    marginTop: 32,
    paddingBottom: 32,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    marginRight: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#4F4F4F',
  },
  submitButton: {
    flex: 1,
    paddingVertical: 12,
    marginLeft: 8,
    borderRadius: 8,
    backgroundColor: '#34568B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
  },
}); 