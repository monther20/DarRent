import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Text } from '@/components/Text';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Slider } from '@miblanchard/react-native-slider';
import notificationService from '../services/notifications';

export default function QuietHoursScreen() {
  const { t } = useTranslation();
  const preferences = notificationService.getPreferences();
  const [startHour, setStartHour] = useState<number>(preferences.quietHoursStart);
  const [endHour, setEndHour] = useState<number>(preferences.quietHoursEnd);

  const formatHour = (hour: number) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 === 0 ? 12 : hour % 12;
    return `${displayHour}:00 ${period}`;
  };

  const handleSave = async () => {
    await notificationService.updatePreference('quietHoursStart', startHour);
    await notificationService.updatePreference('quietHoursEnd', endHour);
    router.back();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('Quiet Hours')}</Text>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>{t('Save')}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('Set Quiet Hours')}</Text>
          <Text style={styles.sectionDescription}>
            {t('Push notifications will be silenced during these hours')}
          </Text>

          <View style={styles.card}>
            {/* Start Time */}
            <View style={styles.timeSection}>
              <View style={styles.timeLabelContainer}>
                <MaterialCommunityIcons name="moon-waning-crescent" size={24} color="#3B82F6" />
                <Text style={styles.timeLabel}>{t('Start Time')}</Text>
              </View>
              <Text style={styles.timeValue}>{formatHour(startHour)}</Text>
              <Slider
                value={startHour}
                minimumValue={0}
                maximumValue={23}
                step={1}
                onValueChange={(values) => setStartHour(values[0] as number)}
                trackStyle={styles.sliderTrack}
                thumbStyle={styles.sliderThumb}
                minimumTrackTintColor="#3B82F6"
                maximumTrackTintColor="#D1D5DB"
              />
            </View>

            {/* End Time */}
            <View style={styles.timeSection}>
              <View style={styles.timeLabelContainer}>
                <MaterialCommunityIcons name="white-balance-sunny" size={24} color="#F59E0B" />
                <Text style={styles.timeLabel}>{t('End Time')}</Text>
              </View>
              <Text style={styles.timeValue}>{formatHour(endHour)}</Text>
              <Slider
                value={endHour}
                minimumValue={0}
                maximumValue={23}
                step={1}
                onValueChange={(values) => setEndHour(values[0] as number)}
                trackStyle={styles.sliderTrack}
                thumbStyle={styles.sliderThumb}
                minimumTrackTintColor="#3B82F6"
                maximumTrackTintColor="#D1D5DB"
              />
            </View>
          </View>

          <View style={styles.summaryCard}>
            <MaterialCommunityIcons name="information-outline" size={24} color="#3B82F6" />
            <Text style={styles.summaryText}>
              {t('Push notifications will be silenced from')} {formatHour(startHour)} {t('to')}{' '}
              {formatHour(endHour)}
              {startHour > endHour
                ? t(', spanning overnight.')
                : '.'}
            </Text>
          </View>

          <View style={styles.noteCard}>
            <Text style={styles.noteText}>
              {t('Note: Critical notifications like security alerts may still be delivered during quiet hours.')}
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#1E40AF',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  saveButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 16,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    marginBottom: 16,
  },
  timeSection: {
    marginBottom: 24,
  },
  timeLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  timeLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  timeValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  sliderTrack: {
    height: 8,
    borderRadius: 4,
  },
  sliderThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#3B82F6',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  summaryCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: '#1E3A8A',
    lineHeight: 20,
  },
  noteCard: {
    backgroundColor: '#FFFBEB',
    borderRadius: 8,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  noteText: {
    fontSize: 14,
    color: '#92400E',
    lineHeight: 20,
  },
}); 