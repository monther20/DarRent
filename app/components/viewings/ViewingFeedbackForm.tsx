import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

interface ViewingFeedbackFormProps {
  propertyId: string;
  propertyTitle: string;
  viewingId: string;
  onSubmit: (feedback: ViewingFeedback) => void;
  onClose: () => void;
}

export interface ViewingFeedback {
  propertyId: string;
  viewingId: string;
  overallRating: number;
  interestLevel: 'high' | 'medium' | 'low' | null;
  aspectRatings: {
    location: number;
    condition: number;
    layout: number;
    value: number;
    amenities: number;
  };
  notes: string;
  nextSteps: string[];
}

export const ViewingFeedbackForm = ({
  propertyId,
  propertyTitle,
  viewingId,
  onSubmit,
  onClose,
}: ViewingFeedbackFormProps) => {
  const { t } = useTranslation(['common', 'viewings']);

  const [feedback, setFeedback] = useState<ViewingFeedback>({
    propertyId,
    viewingId,
    overallRating: 0,
    interestLevel: null,
    aspectRatings: {
      location: 0,
      condition: 0,
      layout: 0,
      value: 0,
      amenities: 0,
    },
    notes: '',
    nextSteps: [],
  });

  const handleRatingChange = (rating: number) => {
    setFeedback(prev => ({ ...prev, overallRating: rating }));
  };

  const handleInterestLevelChange = (level: 'high' | 'medium' | 'low') => {
    setFeedback(prev => ({ ...prev, interestLevel: level }));
  };

  const handleAspectRatingChange = (aspect: keyof ViewingFeedback['aspectRatings'], rating: number) => {
    setFeedback(prev => ({
      ...prev,
      aspectRatings: {
        ...prev.aspectRatings,
        [aspect]: rating,
      }
    }));
  };

  const handleNextStepToggle = (step: string) => {
    setFeedback(prev => {
      if (prev.nextSteps.includes(step)) {
        return {
          ...prev,
          nextSteps: prev.nextSteps.filter(s => s !== step)
        };
      } else {
        return {
          ...prev,
          nextSteps: [...prev.nextSteps, step]
        };
      }
    });
  };

  const handleSubmit = () => {
    onSubmit(feedback);
  };

  const renderRatingStars = (
    currentRating: number,
    onRatingChange: (rating: number) => void
  ) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map(star => (
          <TouchableOpacity
            key={star}
            onPress={() => onRatingChange(star)}
          >
            <MaterialIcons
              name={star <= currentRating ? "star" : "star-border"}
              size={32}
              color={star <= currentRating ? "#F59E0B" : "#D1D5DB"}
              style={styles.starIcon}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderAspectRating = (
    aspect: keyof ViewingFeedback['aspectRatings'],
    label: string
  ) => {
    return (
      <View style={styles.aspectRating}>
        <ThemedText style={styles.aspectLabel}>{label}</ThemedText>
        <View style={styles.aspectStars}>
          {[1, 2, 3, 4, 5].map(star => (
            <TouchableOpacity
              key={star}
              onPress={() => handleAspectRatingChange(aspect, star)}
            >
              <MaterialIcons
                name={star <= feedback.aspectRatings[aspect] ? "star" : "star-border"}
                size={20}
                color={star <= feedback.aspectRatings[aspect] ? "#F59E0B" : "#D1D5DB"}
                style={styles.aspectStarIcon}
              />
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  // Next steps suggestions based on interest level
  const getNextStepsSuggestions = () => {
    const commonSteps = [
      t('Document property condition', { ns: 'viewings' }),
      t('Compare with other viewed properties', { ns: 'viewings' }),
    ];

    if (feedback.interestLevel === 'high') {
      return [
        ...commonSteps,
        t('Apply for this property', { ns: 'viewings' }),
        t('Request additional information', { ns: 'viewings' }),
        t('Schedule a second viewing', { ns: 'viewings' }),
      ];
    } else if (feedback.interestLevel === 'medium') {
      return [
        ...commonSteps,
        t('Request additional information', { ns: 'viewings' }),
        t('View more properties before deciding', { ns: 'viewings' }),
      ];
    } else if (feedback.interestLevel === 'low') {
      return [
        ...commonSteps,
        t('Continue property search elsewhere', { ns: 'viewings' }),
        t('Refine search criteria', { ns: 'viewings' }),
      ];
    }
    
    return commonSteps;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>{t('Viewing Feedback', { ns: 'viewings' })}</ThemedText>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.propertyInfoContainer}>
        <ThemedText style={styles.propertyTitle} numberOfLines={2}>
          {propertyTitle}
        </ThemedText>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Overall Rating */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>{t('Overall Impression', { ns: 'viewings' })}</ThemedText>
          <ThemedText style={styles.sectionDescription}>
            {t('How would you rate this property overall?', { ns: 'viewings' })}
          </ThemedText>
          {renderRatingStars(feedback.overallRating, handleRatingChange)}
          <ThemedText style={styles.ratingText}>
            {feedback.overallRating > 0
              ? `${feedback.overallRating}/5 ${
                  feedback.overallRating === 5
                    ? t('Excellent!', { ns: 'viewings' })
                    : feedback.overallRating >= 4
                    ? t('Very Good', { ns: 'viewings' })
                    : feedback.overallRating >= 3
                    ? t('Good', { ns: 'viewings' })
                    : feedback.overallRating >= 2
                    ? t('Fair', { ns: 'viewings' })
                    : t('Poor', { ns: 'viewings' })
                }`
              : t('Tap to rate', { ns: 'viewings' })}
          </ThemedText>
        </View>

        {/* Interest Level */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>{t('Interest Level', { ns: 'viewings' })}</ThemedText>
          <ThemedText style={styles.sectionDescription}>
            {t('How interested are you in renting this property?', { ns: 'viewings' })}
          </ThemedText>

          <View style={styles.interestLevelContainer}>
            <TouchableOpacity
              style={[
                styles.interestButton,
                feedback.interestLevel === 'high' && styles.interestButtonHigh,
              ]}
              onPress={() => handleInterestLevelChange('high')}
            >
              <Ionicons name="thumbs-up" size={24} color={feedback.interestLevel === 'high' ? '#FFFFFF' : '#10B981'} />
              <ThemedText style={[
                styles.interestButtonText,
                feedback.interestLevel === 'high' && styles.interestButtonTextSelected
              ]}>
                {t('Very Interested', { ns: 'viewings' })}
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.interestButton,
                feedback.interestLevel === 'medium' && styles.interestButtonMedium,
              ]}
              onPress={() => handleInterestLevelChange('medium')}
            >
              <Ionicons name="thumbs-up-outline" size={24} color={feedback.interestLevel === 'medium' ? '#FFFFFF' : '#F59E0B'} />
              <ThemedText style={[
                styles.interestButtonText,
                feedback.interestLevel === 'medium' && styles.interestButtonTextSelected
              ]}>
                {t('Somewhat Interested', { ns: 'viewings' })}
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.interestButton,
                feedback.interestLevel === 'low' && styles.interestButtonLow,
              ]}
              onPress={() => handleInterestLevelChange('low')}
            >
              <Ionicons name="thumbs-down" size={24} color={feedback.interestLevel === 'low' ? '#FFFFFF' : '#EF4444'} />
              <ThemedText style={[
                styles.interestButtonText,
                feedback.interestLevel === 'low' && styles.interestButtonTextSelected
              ]}>
                {t('Not Interested', { ns: 'viewings' })}
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>

        {/* Specific Aspects */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>{t('Property Aspects', { ns: 'viewings' })}</ThemedText>
          <ThemedText style={styles.sectionDescription}>
            {t('Rate specific aspects of this property', { ns: 'viewings' })}
          </ThemedText>

          {renderAspectRating('location', t('Location', { ns: 'viewings' }))}
          {renderAspectRating('condition', t('Property Condition', { ns: 'viewings' }))}
          {renderAspectRating('layout', t('Layout/Space', { ns: 'viewings' }))}
          {renderAspectRating('value', t('Value for Money', { ns: 'viewings' }))}
          {renderAspectRating('amenities', t('Amenities', { ns: 'viewings' }))}
        </View>

        {/* Notes */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>{t('Additional Notes', { ns: 'viewings' })}</ThemedText>
          <TextInput
            style={styles.notesInput}
            multiline
            placeholder={t('Add your notes about this property...', { ns: 'viewings' })}
            value={feedback.notes}
            onChangeText={(text) => setFeedback(prev => ({ ...prev, notes: text }))}
            textAlignVertical="top"
          />
        </View>

        {/* Next Steps */}
        {feedback.interestLevel && (
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>{t('Next Steps', { ns: 'viewings' })}</ThemedText>
            <ThemedText style={styles.sectionDescription}>
              {t('What would you like to do next?', { ns: 'viewings' })}
            </ThemedText>

            {getNextStepsSuggestions().map((step, index) => (
              <TouchableOpacity
                key={index}
                style={styles.nextStepItem}
                onPress={() => handleNextStepToggle(step)}
              >
                <MaterialIcons
                  name={feedback.nextSteps.includes(step) ? "check-box" : "check-box-outline-blank"}
                  size={24}
                  color={feedback.nextSteps.includes(step) ? "#34568B" : "#9CA3AF"}
                />
                <ThemedText style={styles.nextStepText}>{step}</ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
          <ThemedText style={styles.cancelButtonText}>{t('Cancel', { ns: 'common' })}</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.submitButton} 
          onPress={handleSubmit}
          disabled={feedback.overallRating === 0 || feedback.interestLevel === null}
        >
          <ThemedText style={styles.submitButtonText}>{t('Submit Feedback', { ns: 'viewings' })}</ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6F8',
  },
  header: {
    backgroundColor: '#34568B',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  closeButton: {
    padding: 4,
  },
  propertyInfoContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  propertyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#34568B',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#34568B',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 12,
  },
  starIcon: {
    marginHorizontal: 6,
  },
  ratingText: {
    textAlign: 'center',
    marginTop: 8,
    fontSize: 16,
    fontWeight: '500',
    color: '#4B5563',
  },
  interestLevelContainer: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  interestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  interestButtonHigh: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  interestButtonMedium: {
    backgroundColor: '#F59E0B',
    borderColor: '#F59E0B',
  },
  interestButtonLow: {
    backgroundColor: '#EF4444',
    borderColor: '#EF4444',
  },
  interestButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
    color: '#4B5563',
  },
  interestButtonTextSelected: {
    color: '#FFFFFF',
  },
  aspectRating: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  aspectLabel: {
    flex: 1,
    fontSize: 15,
    color: '#4B5563',
  },
  aspectStars: {
    flexDirection: 'row',
  },
  aspectStarIcon: {
    marginHorizontal: 2,
  },
  notesInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    minHeight: 100,
    fontSize: 15,
    color: '#4B5563',
  },
  nextStepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  nextStepText: {
    marginLeft: 10,
    fontSize: 15,
    color: '#4B5563',
  },
  footer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    marginRight: 8,
  },
  cancelButtonText: {
    color: '#4B5563',
    fontWeight: '600',
  },
  submitButton: {
    flex: 2,
    backgroundColor: '#34568B',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
}); 