import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native'; // Alert import re-attempted
import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { format, parseISO } from 'date-fns';
import { arSA, enUS } from 'date-fns/locale';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from 'react-i18next';
import { Calendar, DateData } from 'react-native-calendars';
import { mockApi } from '@/app/services/mockApi';
import { TimeSlot } from '@/app/types'; // Corrected import path for TimeSlot

type ViewingRequestFormProps = {
  propertyId: string;
  propertyTitle: string;
  onSubmit: (preferredSlots: { date: string, timeSlotId: string }[], notes: string) => void;
  onCancel: () => void;
};

export const ViewingRequestForm = ({
  propertyId,
  propertyTitle,
  onSubmit,
  onCancel,
}: ViewingRequestFormProps) => {
  const { t } = useTranslation(['common', 'viewings']);
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  const locale = language === 'ar' ? arSA : enUS;
  
  const [selectedDates, setSelectedDates] = useState<string[]>([]); // Dates marked on calendar
  const [notes, setNotes] = useState<string>('');
  
  const [selectedDateForTimeSlots, setSelectedDateForTimeSlots] = useState<string | null>(null);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<TimeSlot[]>([]);
  const [isLoadingTimeSlots, setIsLoadingTimeSlots] = useState<boolean>(false);
  const [timeSlotsError, setTimeSlotsError] = useState<string | null>(null);
  const [selectedPreferredTimeSlots, setSelectedPreferredTimeSlots] = useState<{ date: string, timeSlotId: string }[]>([]);

  // Calculate the next 30 days for calendar
  const minDate = new Date().toISOString().split('T')[0];
  const maxDate = new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split('T')[0];
  
  // Format the markedDates object for the calendar
  const getMarkedDates = () => {
    const markedDates: {[key: string]: any} = {};
    
    // Mark selected dates
    selectedDates.forEach(date => {
      markedDates[date] = {
        selected: true,
        selectedColor: '#34568B',
      };
    });
    
    return markedDates;
  };

  const fetchTimeSlots = async (date: string) => {
    setIsLoadingTimeSlots(true);
    setTimeSlotsError(null);
    setAvailableTimeSlots([]);
    try {
      const slots = await mockApi.getAvailableTimeSlots(propertyId, date);
      setAvailableTimeSlots(slots);
    } catch (error) {
      console.error("Error fetching time slots:", error);
      setTimeSlotsError(t('errorFetchingTimeSlots', { ns: 'viewings' }));
    } finally {
      setIsLoadingTimeSlots(false);
    }
  };

  const handleDayPress = (day: DateData) => {
    const { dateString } = day;
    
    setSelectedDates(prevSelectedDates => {
      let newSelectedDates;
      if (prevSelectedDates.includes(dateString)) {
        newSelectedDates = prevSelectedDates.filter(date => date !== dateString);
        // If deselected, remove from preferred slots and clear current time slot view if it was this date
        setSelectedPreferredTimeSlots(prevSlots => prevSlots.filter(slot => slot.date !== dateString));
        if (selectedDateForTimeSlots === dateString) {
          setSelectedDateForTimeSlots(null);
          setAvailableTimeSlots([]);
        }
      } else {
        if (prevSelectedDates.length < 3) {
          newSelectedDates = [...prevSelectedDates, dateString];
          setSelectedDateForTimeSlots(dateString); // Set for fetching slots
          fetchTimeSlots(dateString);
        } else {
          // Alert.alert(
          //   t('maxDatesReached', { ns: 'viewings' }),
          //   t('maxDatesReachedDesc', { ns: 'viewings' })
          // );
          console.warn(t('maxDatesReached', { ns: 'viewings' }) + ": " + t('maxDatesReachedDesc', { ns: 'viewings' })); // Temporary console warning
          newSelectedDates = prevSelectedDates;
        }
      }
      return newSelectedDates;
    });
  };
  
  useEffect(() => {
    // If only one date is selected, automatically fetch its time slots
    // Or if selectedDateForTimeSlots is set explicitly
    if (selectedDateForTimeSlots) {
       // This is now handled in handleDayPress to avoid potential loops if selectedDates changes elsewhere
    } else if (selectedDates.length === 1 && !selectedDateForTimeSlots) {
      setSelectedDateForTimeSlots(selectedDates[0]);
      fetchTimeSlots(selectedDates[0]);
    } else if (selectedDates.length === 0) {
      setSelectedDateForTimeSlots(null);
      setAvailableTimeSlots([]);
    }
  }, [selectedDates, propertyId]);


  const handleTimeSlotSelect = (timeSlotId: string) => {
    if (!selectedDateForTimeSlots) return;

    setSelectedPreferredTimeSlots(prevSlots => {
      // Remove any existing slot for this date
      const otherSlots = prevSlots.filter(slot => slot.date !== selectedDateForTimeSlots);
      // Add the new one
      return [...otherSlots, { date: selectedDateForTimeSlots, timeSlotId }];
    });
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'EEEE, MMMM d, yyyy', { locale });
    } catch (e) {
      return dateString;
    }
  };

  const handleSubmit = () => {
    if (selectedPreferredTimeSlots.length === 0) {
      // Alert.alert(
      //   t('error', { ns: 'common' }),
      //   t('selectDateTimeFirst', { ns: 'viewings' }) // New translation key
      // );
      console.warn(t('error', { ns: 'common' }) + ": " + t('selectDateTimeFirst', { ns: 'viewings' })); // Temporary console warning
      return;
    }
    if (selectedPreferredTimeSlots.length !== selectedDates.length) {
      //  Alert.alert(
      //   t('error', { ns: 'common' }),
      //   t('selectTimeSlotForEachDate', { ns: 'viewings' }) // New translation key
      // );
      console.warn(t('error', { ns: 'common' }) + ": " + t('selectTimeSlotForEachDate', { ns: 'viewings' })); // Temporary console warning
      return;
    }
    onSubmit(selectedPreferredTimeSlots, notes);
  };

  const formatTime = (isoString: string) => {
    try {
      return format(parseISO(isoString), 'p', { locale }); // e.g., 9:00 AM
    } catch (e) {
      return 'Invalid time';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>{t('requestViewing', { ns: 'viewings' })}</ThemedText>
        <ThemedText style={styles.propertyTitle} numberOfLines={1}>
          {propertyTitle}
        </ThemedText>
      </View>

      {/* Date Selection Section */}
      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>
          {t('selectPreferredDates', { ns: 'viewings' })} 
          <ThemedText style={styles.sectionSubtitle}>
            ({t('selectUpTo3', { ns: 'viewings' })})
          </ThemedText>
        </ThemedText>
        
        <View style={styles.calendarContainer}>
          <Calendar
            minDate={minDate}
            maxDate={maxDate}
            markedDates={getMarkedDates()}
            onDayPress={handleDayPress}
            monthFormat={'MMMM yyyy'}
            hideExtraDays={true}
            firstDay={0}
            disableAllTouchEventsForDisabledDays={true}
            enableSwipeMonths={true}
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
              textMonthFontWeight: 'bold',
              textDayFontWeight: '300',
              textDayHeaderFontWeight: '500',
              textDayFontSize: 14,
              textMonthFontSize: 16,
              textDayHeaderFontSize: 14,
            }}
          />
        </View>
        
        {/* Selected Dates Display */}
        {selectedDates.length > 0 && (
          <View style={styles.selectedDatesContainer}>
            <ThemedText style={styles.selectedDatesTitle}>
              {t('yourSelectedDates', { ns: 'viewings' })}:
            </ThemedText>
            
            {selectedDates.map((dateString, index) => {
              const preferredSlot = selectedPreferredTimeSlots.find(ps => ps.date === dateString);
              const slotDetail = preferredSlot ? availableTimeSlots.find(ats => ats.id === preferredSlot.timeSlotId && ats.startTime.startsWith(dateString)) : null;
              // If availableTimeSlots got cleared (e.g. date deselected), slotDetail might be null even if preferredSlot exists.
              // We might need to persist slot details or refetch if showing old selections.
              // For now, let's assume availableTimeSlots is relevant for the selectedDateForTimeSlots.

              return (
                <View key={index} style={styles.selectedDateItem}>
                  <Ionicons name="calendar-outline" size={18} color="#34568B" style={styles.dateIcon} />
                  <View style={{ flex: 1 }}>
                    <ThemedText style={styles.selectedDateText}>
                      {formatDate(dateString)}
                    </ThemedText>
                    {preferredSlot && (
                       <ThemedText style={styles.selectedTimeText}>
                         {t('timeSlot', {ns: 'viewings'})}: {slotDetail ? `${formatTime(slotDetail.startTime)} - ${formatTime(slotDetail.endTime)}` : t('slotNotSelected', {ns: 'viewings'})}
                       </ThemedText>
                    )}
                  </View>
                  <TouchableOpacity
                    onPress={() => {
                      setSelectedDates(selectedDates.filter(d => d !== dateString));
                      setSelectedPreferredTimeSlots(prevSlots => prevSlots.filter(s => s.date !== dateString));
                      if (selectedDateForTimeSlots === dateString) {
                        setSelectedDateForTimeSlots(null);
                        setAvailableTimeSlots([]);
                      }
                    }}
                    style={styles.removeButton}
                  >
                    <Ionicons name="close-circle-outline" size={22} color="#EB5757" />
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        )}
      </View>

      {/* Time Slot Selection Section */}
      {selectedDateForTimeSlots && (
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>
            {t('availableTimeSlotsFor', { ns: 'viewings' })} {formatDate(selectedDateForTimeSlots)}
          </ThemedText>
          {isLoadingTimeSlots && <ActivityIndicator size="large" color="#34568B" />}
          {timeSlotsError && <ThemedText style={styles.errorText}>{timeSlotsError}</ThemedText>}
          {!isLoadingTimeSlots && !timeSlotsError && availableTimeSlots.length === 0 && (
            <ThemedText>{t('noAvailableSlots', { ns: 'viewings' })}</ThemedText>
          )}
          <View style={styles.timeSlotsContainer}>
            {availableTimeSlots.map(slot => {
              const isSelected = selectedPreferredTimeSlots.some(ps => ps.date === selectedDateForTimeSlots && ps.timeSlotId === slot.id);
              return (
                <TouchableOpacity
                  key={slot.id}
                  style={[
                    styles.timeSlotButton,
                    slot.isBooked && styles.timeSlotButtonBooked, // Should be filtered by API, but good for UI
                    isSelected && styles.timeSlotButtonActive,
                  ]}
                  onPress={() => !slot.isBooked && handleTimeSlotSelect(slot.id)}
                  disabled={slot.isBooked}
                >
                  <ThemedText style={[
                    styles.timeSlotText,
                    isSelected && styles.timeSlotTextActive,
                    slot.isBooked && styles.timeSlotTextBooked,
                  ]}>
                    {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                  </ThemedText>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}
      
      {/* Notes Section */}
      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>
          {t('additionalNotes', { ns: 'viewings' })}
        </ThemedText>
        
        <TextInput
          style={styles.notesInput}
          placeholder={t('enterAdditionalNotes', { ns: 'viewings' })}
          multiline
          numberOfLines={4}
          value={notes}
          onChangeText={setNotes}
          textAlignVertical="top"
          placeholderTextColor="#BDBDBD"
        />
      </View>
      
      {/* Buttons */}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
          <ThemedText style={styles.cancelButtonText}>{t('cancel', { ns: 'common' })}</ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <ThemedText style={styles.submitButtonText}>{t('requestViewing', { ns: 'viewings' })}</ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    backgroundColor: '#34568B',
    padding: 16,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  propertyTitle: {
    fontSize: 16,
    color: '#E0E0E0',
  },
  section: {
    padding: 16,
    marginTop: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    marginHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#34568B',
    marginBottom: 12,
  },
  sectionSubtitle: {
    fontWeight: '400',
    fontSize: 14,
    color: '#7F8FA4',
  },
  calendarContainer: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  selectedDatesContainer: {
    marginTop: 16,
  },
  selectedDatesTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2C3E50',
    marginBottom: 8,
  },
  selectedDateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F5F7FA',
    borderRadius: 8,
    marginBottom: 8,
  },
  dateIcon: {
    marginRight: 8,
  },
  selectedDateText: {
    flex: 1,
    fontSize: 14,
    color: '#2C3E50',
    fontWeight: '500',
  },
  selectedTimeText: {
    fontSize: 12,
    color: '#555',
    marginTop: 2,
  },
  removeButton: {
    padding: 4,
  },
  timeSlotsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  timeSlotButton: {
    backgroundColor: '#FFF',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
    minWidth: '48%', // Two columns
    marginBottom: 10,
  },
  timeSlotButtonActive: {
    borderColor: '#34568B',
    backgroundColor: '#E7EFFC', // Light blue for active
  },
  timeSlotButtonBooked: {
    backgroundColor: '#F0F0F0',
    borderColor: '#D0D0D0',
  },
  timeSlotText: {
    fontSize: 13,
    color: '#34568B',
    fontWeight: '500',
  },
  timeSlotTextActive: {
    color: '#34568B', // Keep text color consistent or make it darker
  },
  timeSlotTextBooked: {
    color: '#A0A0A0',
    textDecorationLine: 'line-through',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 10,
  },
  notesInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    height: 100,
    fontSize: 14,
    color: '#4F4F4F',
    backgroundColor: '#FFFFFF',
  },
  buttonsContainer: {
    flexDirection: 'row',
    padding: 16,
    marginVertical: 16,
    marginHorizontal: 16,
  },
  cancelButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BDBDBD',
    alignItems: 'center',
    marginRight: 8,
    backgroundColor: '#FFFFFF',
  },
  cancelButtonText: {
    color: '#4F4F4F',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#F2994A',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
}); 