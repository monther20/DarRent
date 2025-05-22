import React from 'react';
import { View, Modal, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { arSA, enUS } from 'date-fns/locale';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from 'react-i18next';

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

type ViewingDetailsModalProps = {
  visible: boolean;
  request: ViewingRequest;
  onClose: () => void;
  onMarkComplete: (requestId: string) => void;
};

export const ViewingDetailsModal = ({
  visible,
  request,
  onClose,
  onMarkComplete,
}: ViewingDetailsModalProps) => {
  const { t } = useTranslation(['common', 'viewings']);
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  const locale = language === 'ar' ? arSA : enUS;

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'EEEE, MMMM d, yyyy • h:mm a', { locale });
    } catch (e) {
      return dateString;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return '#27AE60'; // Green
      case 'completed':
        return '#2D9CDB'; // Blue
      default:
        return '#BDBDBD'; // Gray
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'checkmark-circle-outline';
      case 'completed':
        return 'checkmark-done-outline';
      default:
        return 'help-circle-outline';
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <View style={styles.modalHeader}>
            <ThemedText style={styles.modalTitle}>
              {request.status === 'confirmed' ? t('confirmedViewing', { ns: 'viewings' }) : t('completedViewing', { ns: 'viewings' })}
            </ThemedText>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#4F4F4F" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollView}>
            {/* Status Banner */}
            <View style={[styles.statusBanner, { backgroundColor: getStatusColor(request.status) }]}>
              <Ionicons name={getStatusIcon(request.status)} size={24} color="#FFFFFF" />
              <ThemedText style={styles.statusBannerText}>
                {request.status === 'confirmed' ? t('viewingConfirmed', { ns: 'viewings' }) : t('viewingCompleted', { ns: 'viewings' })}
              </ThemedText>
            </View>
            
            {/* Property Info */}
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>{t('property', { ns: 'common' })}</ThemedText>
              <ThemedText style={styles.propertyTitle}>{request.propertyTitle}</ThemedText>
            </View>

            {/* Renter Info */}
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>{t('renter', { ns: 'common' })}</ThemedText>
              <View style={styles.infoRow}>
                <Ionicons name="person" size={18} color="#34568B" style={styles.infoIcon} />
                <ThemedText style={styles.infoText}>{request.renterName}</ThemedText>
              </View>
            </View>

            {/* Date Info */}
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>{t('viewingDate', { ns: 'viewings' })}</ThemedText>
              <View style={styles.infoRow}>
                <Ionicons name="calendar" size={18} color="#34568B" style={styles.infoIcon} />
                <ThemedText style={styles.infoText}>
                  {request.confirmedDate ? formatDate(request.confirmedDate) : t('noDateConfirmed', { ns: 'viewings' })}
                </ThemedText>
              </View>
            </View>

            {/* Request Notes */}
            {request.notes && (
              <View style={styles.section}>
                <ThemedText style={styles.sectionTitle}>{t('notes', { ns: 'common' })}</ThemedText>
                <View style={styles.notesBox}>
                  <ThemedText style={styles.notesText}>{request.notes}</ThemedText>
                </View>
              </View>
            )}

            {/* Access Instructions */}
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>{t('accessInstructions', { ns: 'viewings' })}</ThemedText>
              <View style={styles.accessBox}>
                <View style={styles.infoRow}>
                  <Ionicons name="key-outline" size={18} color="#34568B" style={styles.infoIcon} />
                  <ThemedText style={styles.accessText}>{t('contactRenterBeforeViewing', { ns: 'viewings' })}</ThemedText>
                </View>
                <View style={styles.infoRow}>
                  <Ionicons name="call-outline" size={18} color="#34568B" style={styles.infoIcon} />
                  <ThemedText style={styles.accessText}>{t('exchangeContactInfo', { ns: 'viewings' })}</ThemedText>
                </View>
              </View>
            </View>

            {/* Checklist */}
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>{t('viewingChecklist', { ns: 'viewings' })}</ThemedText>
              <View style={styles.checklistContainer}>
                <View style={styles.checklistItem}>
                  <Ionicons name="checkmark-circle" size={18} color="#27AE60" style={styles.infoIcon} />
                  <ThemedText style={styles.checklistText}>{t('confirmIdentity', { ns: 'viewings' })}</ThemedText>
                </View>
                <View style={styles.checklistItem}>
                  <Ionicons name="checkmark-circle" size={18} color="#27AE60" style={styles.infoIcon} />
                  <ThemedText style={styles.checklistText}>{t('showAllRooms', { ns: 'viewings' })}</ThemedText>
                </View>
                <View style={styles.checklistItem}>
                  <Ionicons name="checkmark-circle" size={18} color="#27AE60" style={styles.infoIcon} />
                  <ThemedText style={styles.checklistText}>{t('discussAmenities', { ns: 'viewings' })}</ThemedText>
                </View>
                <View style={styles.checklistItem}>
                  <Ionicons name="checkmark-circle" size={18} color="#27AE60" style={styles.infoIcon} />
                  <ThemedText style={styles.checklistText}>{t('answerQuestions', { ns: 'viewings' })}</ThemedText>
                </View>
              </View>
            </View>
          </ScrollView>

          {request.status === 'confirmed' && (
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.markCompleteButton}
                onPress={() => onMarkComplete(request.id)}
              >
                <ThemedText style={styles.markCompleteButtonText}>{t('markAsCompleted', { ns: 'viewings' })}</ThemedText>
              </TouchableOpacity>
            </View>
          )}

          {request.status === 'completed' && (
            <View style={styles.completionBox}>
              <Ionicons name="checkmark-circle" size={20} color="#27AE60" />
              <ThemedText style={styles.completionText}>{t('viewingCompletedOn', { ns: 'viewings' })}</ThemedText>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    backgroundColor: '#F5F6F8',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    width: '100%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F2F5',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#34568B',
  },
  closeButton: {
    padding: 4,
  },
  scrollView: {
    maxHeight: '80%',
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: '#27AE60',
  },
  statusBannerText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  section: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    marginVertical: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 12,
  },
  propertyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#34568B',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoIcon: {
    marginRight: 8,
  },
  infoText: {
    fontSize: 16,
    color: '#4F4F4F',
  },
  notesBox: {
    backgroundColor: '#F9F9F9',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F0F2F5',
  },
  notesText: {
    fontSize: 14,
    color: '#4F4F4F',
    lineHeight: 20,
  },
  accessBox: {
    backgroundColor: '#F9F9F9',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F0F2F5',
  },
  accessText: {
    fontSize: 14,
    color: '#4F4F4F',
    flex: 1,
  },
  checklistContainer: {
    backgroundColor: '#F9F9F9',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F0F2F5',
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  checklistText: {
    fontSize: 14,
    color: '#4F4F4F',
    flex: 1,
  },
  buttonContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F2F5',
  },
  markCompleteButton: {
    backgroundColor: '#27AE60',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  markCompleteButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  completionBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#F0FFF4', // Light green
    borderTopWidth: 1,
    borderTopColor: '#F0F2F5',
  },
  completionText: {
    color: '#27AE60',
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 8,
  },
}); 