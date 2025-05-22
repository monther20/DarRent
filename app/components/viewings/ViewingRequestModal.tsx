import React, { useState } from 'react';
import { View, Modal, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { arSA, enUS } from 'date-fns/locale';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from 'react-i18next';
import { Calendar } from 'react-native-calendars';

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

type ViewingRequestModalProps = {
  visible: boolean;
  request: ViewingRequest;
  onClose: () => void;
  onConfirm: (requestId: string, date: string, notes: string) => void;
  onReschedule: (requestId: string, date: string, notes: string) => void;
  onReject: (requestId: string) => void;
};

export const ViewingRequestModal = ({
  visible,
  request,
  onClose,
  onConfirm,
  onReschedule,
  onReject,
}: ViewingRequestModalProps) => {
  const { t } = useTranslation(['common', 'viewings']);
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  const locale = language === 'ar' ? arSA : enUS;

  const [selectedDate, setSelectedDate] = useState<string | null>(
    request?.preferredDates[0] ? new Date(request.preferredDates[0]).toISOString().split('T')[0] : null
  );
  const [notes, setNotes] = useState<string>('');
  const [showCalendar, setShowCalendar] = useState<boolean>(false);

  // Format the markedDates object for the calendar
  const getMarkedDates = () => {
    const markedDates: any = {};
    
    // Mark all preferred dates
    request?.preferredDates.forEach(date => {
      const dateKey = new Date(date).toISOString().split('T')[0];
      markedDates[dateKey] = {
        marked: true,
        dotColor: '#F2994A',
      };
    });
    
    // Mark selected date
    if (selectedDate) {
      markedDates[selectedDate] = {
        ...markedDates[selectedDate],
        selected: true,
        selectedColor: '#34568B',
      };
    }
    
    return markedDates;
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'EEEE, MMMM d, yyyy', { locale });
    } catch (e) {
      return dateString;
    }
  };

  const handleConfirm = () => {
    if (selectedDate) {
      onConfirm(request.id, selectedDate, notes);
    }
  };

  const handleReschedule = () => {
    if (selectedDate) {
      onReschedule(request.id, selectedDate, notes);
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
            <ThemedText style={styles.modalTitle}>{t('viewingRequest', { ns: 'viewings' })}</ThemedText>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#4F4F4F" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollView}>
            {/* Property Info */}
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>{t('property', { ns: 'common' })}</ThemedText>
              <ThemedText style={styles.propertyTitle}>{request.propertyTitle}</ThemedText>
            </View>

            {/* Renter Info */}
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>{t('renter', { ns: 'common' })}</ThemedText>
              <View style={styles.renterInfoRow}>
                <Ionicons name="person" size={18} color="#34568B" style={styles.infoIcon} />
                <ThemedText style={styles.infoText}>{request.renterName}</ThemedText>
              </View>
            </View>

            {/* Request Notes */}
            {request.notes && (
              <View style={styles.section}>
                <ThemedText style={styles.sectionTitle}>{t('renterNotes', { ns: 'viewings' })}</ThemedText>
                <View style={styles.notesBox}>
                  <ThemedText style={styles.notesText}>{request.notes}</ThemedText>
                </View>
              </View>
            )}

            {/* Preferred Dates */}
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>{t('preferredDates', { ns: 'viewings' })}</ThemedText>
              {request.preferredDates.map((date, index) => (
                <TouchableOpacity 
                  key={index} 
                  style={[
                    styles.dateItem,
                    selectedDate === new Date(date).toISOString().split('T')[0] && styles.selectedDateItem
                  ]}
                  onPress={() => {
                    setSelectedDate(new Date(date).toISOString().split('T')[0]);
                    setShowCalendar(false);
                  }}
                >
                  <Ionicons 
                    name="calendar" 
                    size={18} 
                    color={selectedDate === new Date(date).toISOString().split('T')[0] ? "#FFFFFF" : "#34568B"} 
                    style={styles.infoIcon} 
                  />
                  <ThemedText 
                    style={[
                      styles.dateText,
                      selectedDate === new Date(date).toISOString().split('T')[0] && styles.selectedDateText
                    ]}
                  >
                    {formatDate(date)}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>

            {/* Alternative Date Option */}
            <TouchableOpacity 
              style={styles.alternativeDateButton}
              onPress={() => setShowCalendar(!showCalendar)}
            >
              <Ionicons name={showCalendar ? "calendar" : "calendar-outline"} size={20} color="#34568B" />
              <ThemedText style={styles.alternativeDateText}>
                {showCalendar ? t('hideCalendar', { ns: 'viewings' }) : t('suggestAlternative', { ns: 'viewings' })}
              </ThemedText>
            </TouchableOpacity>

            {showCalendar && (
              <View style={styles.calendarContainer}>
                <Calendar
                  markedDates={getMarkedDates()}
                  onDayPress={(day) => {
                    setSelectedDate(day.dateString);
                  }}
                  monthFormat={'MMMM yyyy'}
                  hideExtraDays={true}
                  firstDay={0}
                  disableAllTouchEventsForDisabledDays={true}
                  enableSwipeMonths={true}
                  minDate={new Date().toISOString().split('T')[0]}
                  theme={{
                    backgroundColor: '#ffffff',
                    calendarBackground: '#ffffff',
                    textSectionTitleColor: '#34568B',
                    selectedDayBackgroundColor: '#34568B',
                    selectedDayTextColor: '#ffffff',
                    todayTextColor: '#F2994A',
                    dayTextColor: '#2d4150',
                    textDisabledColor: '#d9e1e8',
                    arrowColor: '#34568B',
                    monthTextColor: '#34568B',
                  }}
                />
              </View>
            )}

            {/* Notes to Renter */}
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>{t('notesToRenter', { ns: 'viewings' })}</ThemedText>
              <TextInput
                style={styles.notesInput}
                placeholder={t('enterNotes', { ns: 'viewings' })}
                multiline
                numberOfLines={4}
                value={notes}
                onChangeText={setNotes}
                textAlignVertical="top"
                placeholderTextColor="#BDBDBD"
              />
            </View>
          </ScrollView>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.rejectButton]}
              onPress={() => onReject(request.id)}
            >
              <ThemedText style={styles.rejectButtonText}>{t('reject', { ns: 'common' })}</ThemedText>
            </TouchableOpacity>
            
            {selectedDate && !request.preferredDates.find(d => new Date(d).toISOString().split('T')[0] === selectedDate) ? (
              <TouchableOpacity
                style={[styles.button, styles.rescheduleButton]}
                onPress={handleReschedule}
              >
                <ThemedText style={styles.confirmButtonText}>{t('suggestDate', { ns: 'viewings' })}</ThemedText>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.button, styles.confirmButton]}
                onPress={handleConfirm}
              >
                <ThemedText style={styles.confirmButtonText}>{t('confirm', { ns: 'common' })}</ThemedText>
              </TouchableOpacity>
            )}
          </View>
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
    maxHeight: '75%',
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
  renterInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
  dateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#F0F2F5',
  },
  selectedDateItem: {
    backgroundColor: '#34568B',
    borderColor: '#34568B',
  },
  dateText: {
    fontSize: 14,
    color: '#4F4F4F',
    flex: 1,
  },
  selectedDateText: {
    color: '#FFFFFF',
  },
  alternativeDateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: '#FFFFFF',
    marginVertical: 8,
  },
  alternativeDateText: {
    color: '#34568B',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  calendarContainer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginVertical: 8,
  },
  notesInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F0F2F5',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#4F4F4F',
    height: 100,
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F2F5',
  },
  button: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  rejectButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EB5757',
    marginRight: 8,
  },
  confirmButton: {
    backgroundColor: '#27AE60',
  },
  rescheduleButton: {
    backgroundColor: '#34568B',
  },
  rejectButtonText: {
    color: '#EB5757',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
}); 