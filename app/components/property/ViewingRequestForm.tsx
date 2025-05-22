import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { arSA, enUS } from 'date-fns/locale';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from 'react-i18next';
import { Calendar } from 'react-native-calendars';

type ViewingRequestFormProps = {
  propertyId: string;
  propertyTitle: string;
  onSubmit: (dates: string[], notes: string) => void;
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
  
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [notes, setNotes] = useState<string>('');
  const [timePreference, setTimePreference] = useState<'morning' | 'afternoon' | 'evening' | null>(null);

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

  const handleDayPress = (day: {dateString: string}) => {
    const { dateString } = day;
    
    // Toggle date selection
    if (selectedDates.includes(dateString)) {
      setSelectedDates(selectedDates.filter(date => date !== dateString));
    } else {
      // Limit to 3 dates max
      if (selectedDates.length < 3) {
        setSelectedDates([...selectedDates, dateString]);
      } else {
        Alert.alert(
          t('maxDatesReached', { ns: 'viewings' }),
          t('maxDatesReachedDesc', { ns: 'viewings' })
        );
      }
    }
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
    if (selectedDates.length === 0) {
      Alert.alert(
        t('error', { ns: 'common' }),
        t('selectDateFirst', { ns: 'viewings' })
      );
      return;
    }
    
    // Convert dates to ISO strings with time preferences
    const datesWithTime = selectedDates.map(date => {
      const dateObj = new Date(date);
      
      // Set time based on preference
      if (timePreference === 'morning') {
        dateObj.setHours(10, 0, 0);
      } else if (timePreference === 'afternoon') {
        dateObj.setHours(14, 0, 0);
      } else if (timePreference === 'evening') {
        dateObj.setHours(18, 0, 0);
      } else {
        dateObj.setHours(12, 0, 0); // Default to noon
      }
      
      return dateObj.toISOString();
    });
    
    onSubmit(datesWithTime, notes);
  };
  
  const TimePreferenceButton = ({ title, value }: { title: string; value: 'morning' | 'afternoon' | 'evening' }) => (
    <TouchableOpacity
      style={[
        styles.timePreferenceButton,
        timePreference === value && styles.timePreferenceButtonActive
      ]}
      onPress={() => setTimePreference(value)}
    >
      <ThemedText style={[
        styles.timePreferenceText,
        timePreference === value && styles.timePreferenceTextActive
      ]}>
        {title}
      </ThemedText>
    </TouchableOpacity>
  );

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
            
            {selectedDates.map((date, index) => (
              <View key={index} style={styles.selectedDateItem}>
                <Ionicons name="calendar" size={18} color="#34568B" style={styles.dateIcon} />
                <ThemedText style={styles.selectedDateText}>
                  {formatDate(date)}
                </ThemedText>
                <TouchableOpacity
                  onPress={() => setSelectedDates(selectedDates.filter(d => d !== date))}
                  style={styles.removeButton}
                >
                  <Ionicons name="close-circle" size={20} color="#EB5757" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Time Preference Section */}
      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>
          {t('preferredTime', { ns: 'viewings' })}
        </ThemedText>
        
        <View style={styles.timePreferenceContainer}>
          <TimePreferenceButton title={t('morning', { ns: 'viewings' })} value="morning" />
          <TimePreferenceButton title={t('afternoon', { ns: 'viewings' })} value="afternoon" />
          <TimePreferenceButton title={t('evening', { ns: 'viewings' })} value="evening" />
        </View>
      </View>
      
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
  },
  removeButton: {
    padding: 4,
  },
  timePreferenceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timePreferenceButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
    marginHorizontal: 4,
    backgroundColor: '#FFFFFF',
  },
  timePreferenceButtonActive: {
    borderColor: '#34568B',
    backgroundColor: '#34568B',
  },
  timePreferenceText: {
    fontSize: 14,
    color: '#4F4F4F',
    fontWeight: '500',
  },
  timePreferenceTextActive: {
    color: '#FFFFFF',
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