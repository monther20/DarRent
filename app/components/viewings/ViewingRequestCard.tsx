import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { arSA, enUS } from 'date-fns/locale';
import { useLanguage } from '@/contexts/LanguageContext';
import { ViewingPreparationModal } from './ViewingPreparationModal';
import { ViewingFeedbackModal } from './ViewingFeedbackModal';
import { ViewingFeedback } from './ViewingFeedbackForm';

type ViewingRequest = {
  id: string;
  renterId: string;
  renterName: string;
  propertyId: string;
  propertyTitle: string;
  preferredDates: string[];
  status: 'pending' | 'confirmed' | 'rejected' | 'completed';
  notes?: string;
  createdAt: string;
  confirmedDate?: string;
};

type ViewingRequestCardProps = {
  request: ViewingRequest;
  onPress: () => void;
  onFeedbackSubmit?: (feedback: ViewingFeedback) => void;
};

export const ViewingRequestCard = ({ request, onPress, onFeedbackSubmit }: ViewingRequestCardProps) => {
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  const locale = language === 'ar' ? arSA : enUS;
  
  const [showPreparation, setShowPreparation] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return '#F2994A'; // Orange
      case 'confirmed':
        return '#27AE60'; // Green
      case 'completed':
        return '#2D9CDB'; // Blue
      case 'rejected':
        return '#EB5757'; // Red
      default:
        return '#BDBDBD'; // Gray
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return 'time-outline';
      case 'confirmed':
        return 'checkmark-circle-outline';
      case 'completed':
        return 'checkmark-done-outline';
      case 'rejected':
        return 'close-circle-outline';
      default:
        return 'help-circle-outline';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'confirmed':
        return 'Confirmed';
      case 'completed':
        return 'Completed';
      case 'rejected':
        return 'Rejected';
      default:
        return 'Unknown';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'E, MMM d, yyyy • h:mm a', { locale });
    } catch (e) {
      return dateString;
    }
  };
  
  const handleFeedbackSubmit = (feedback: ViewingFeedback) => {
    if (onFeedbackSubmit) {
      onFeedbackSubmit(feedback);
    }
    setShowFeedback(false);
  };

  return (
    <>
      <TouchableOpacity style={styles.container} onPress={onPress}>
        <View style={styles.topRow}>
          <View style={[styles.propertyInfo, isRTL && styles.rtlRow]}>
            <Image 
              source={{ uri: 'https://via.placeholder.com/60' }} 
              style={styles.propertyImage}
            />
            <View style={styles.propertyTextContainer}>
              <ThemedText style={styles.propertyTitle} numberOfLines={1}>
                {request.propertyTitle}
              </ThemedText>
              <View style={[styles.statusContainer, isRTL && styles.rtlRow]}>
                <Ionicons 
                  name={getStatusIcon(request.status)}
                  size={14} 
                  color={getStatusColor(request.status)}
                  style={isRTL ? { marginLeft: 4 } : { marginRight: 4 }}
                />
                <ThemedText style={[styles.statusText, { color: getStatusColor(request.status) }]}>
                  {getStatusText(request.status)}
                </ThemedText>
              </View>
            </View>
          </View>
          
          <Ionicons name={isRTL ? "chevron-back" : "chevron-forward"} size={20} color="#BDBDBD" />
        </View>

        <View style={styles.divider} />
        
        <View style={[styles.renterInfoContainer, isRTL && styles.rtlRow]}>
          <Ionicons name="person-outline" size={18} color="#34568B" style={styles.infoIcon} />
          <ThemedText style={styles.infoText}>{request.renterName}</ThemedText>
        </View>
        
        {request.status === 'confirmed' && request.confirmedDate ? (
          <View style={[styles.dateInfoContainer, isRTL && styles.rtlRow]}>
            <Ionicons name="calendar-outline" size={18} color="#27AE60" style={styles.infoIcon} />
            <ThemedText style={styles.infoText}>
              {formatDate(request.confirmedDate)}
            </ThemedText>
          </View>
        ) : (
          <View style={[styles.dateInfoContainer, isRTL && styles.rtlRow]}>
            <Ionicons name="calendar-outline" size={18} color="#F2994A" style={styles.infoIcon} />
            <ThemedText style={styles.infoText}>
              {request.preferredDates.length > 1 
                ? `${request.preferredDates.length} preferred dates` 
                : formatDate(request.preferredDates[0])}
            </ThemedText>
          </View>
        )}
        
        {request.notes && (
          <View style={[styles.notesContainer, isRTL && styles.rtlRow]}>
            <Ionicons name="chatbubble-outline" size={18} color="#34568B" style={styles.infoIcon} />
            <ThemedText style={styles.notesText} numberOfLines={2}>
              {request.notes}
            </ThemedText>
          </View>
        )}
        
        {request.status === 'confirmed' && (
          <View style={styles.actionsContainer}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.prepareButton]}
              onPress={() => setShowPreparation(true)}
            >
              <Ionicons name="list-outline" size={18} color="#FFFFFF" style={styles.actionIcon} />
              <ThemedText style={styles.actionText}>Prepare</ThemedText>
            </TouchableOpacity>
            
            {onFeedbackSubmit && (
              <TouchableOpacity 
                style={[styles.actionButton, styles.feedbackButton]}
                onPress={() => setShowFeedback(true)}
              >
                <Ionicons name="star-outline" size={18} color="#FFFFFF" style={styles.actionIcon} />
                <ThemedText style={styles.actionText}>Feedback</ThemedText>
              </TouchableOpacity>
            )}
          </View>
        )}
      </TouchableOpacity>
      
      <ViewingPreparationModal
        visible={showPreparation}
        propertyId={request.propertyId}
        propertyTitle={request.propertyTitle}
        onClose={() => setShowPreparation(false)}
      />
      
      {onFeedbackSubmit && (
        <ViewingFeedbackModal
          visible={showFeedback}
          propertyId={request.propertyId}
          propertyTitle={request.propertyTitle}
          viewingId={request.id}
          onClose={() => setShowFeedback(false)}
          onSubmit={handleFeedbackSubmit}
        />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  propertyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  propertyImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  propertyTextContainer: {
    flex: 1,
  },
  propertyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#34568B',
    marginBottom: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F2F5',
    marginVertical: 12,
  },
  renterInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  dateInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  notesContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  infoIcon: {
    marginRight: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#4F4F4F',
  },
  notesText: {
    fontSize: 14,
    color: '#4F4F4F',
    flex: 1,
  },
  rtlRow: {
    flexDirection: 'row-reverse',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    flex: 1,
    marginHorizontal: 4,
  },
  prepareButton: {
    backgroundColor: '#34568B',
  },
  feedbackButton: {
    backgroundColor: '#F2994A',
  },
  actionIcon: {
    marginRight: 6,
  },
  actionText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
}); 