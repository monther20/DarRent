import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TextInput,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';
import { Text } from '@/components/Text';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useTranslation } from 'react-i18next';
import { mockApi } from '@/app/services/mockApi';
import { useRouter } from 'expo-router';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';

// Predefined maintenance types and their specific issues
const MAINTENANCE_TYPES = {
  plumbing: {
    icon: 'water',
    issues: [
      { id: 'leaking_faucet', title: 'leakingFaucet', description: 'leakingFaucetDesc' },
      { id: 'clogged_drain', title: 'cloggedDrain', description: 'cloggedDrainDesc' },
      { id: 'water_heater', title: 'waterHeater', description: 'waterHeaterDesc' },
      { id: 'toilet_issues', title: 'toiletIssues', description: 'toiletIssuesDesc' },
    ],
  },
  electrical: {
    icon: 'flash',
    issues: [
      { id: 'power_outlet', title: 'powerOutlet', description: 'powerOutletDesc' },
      { id: 'lighting', title: 'lighting', description: 'lightingDesc' },
      { id: 'appliance', title: 'appliance', description: 'applianceDesc' },
      { id: 'circuit_breaker', title: 'circuitBreaker', description: 'circuitBreakerDesc' },
    ],
  },
  hvac: {
    icon: 'thermometer',
    issues: [
      { id: 'ac_not_cooling', title: 'acNotCooling', description: 'acNotCoolingDesc' },
      { id: 'heating_issue', title: 'heatingIssue', description: 'heatingIssueDesc' },
      { id: 'thermostat', title: 'thermostat', description: 'thermostatDesc' },
      { id: 'strange_noise', title: 'strangeNoise', description: 'strangeNoiseDesc' },
    ],
  },
  structural: {
    icon: 'home',
    issues: [
      { id: 'wall_damage', title: 'wallDamage', description: 'wallDamageDesc' },
      { id: 'floor_damage', title: 'floorDamage', description: 'floorDamageDesc' },
      { id: 'window_issue', title: 'windowIssue', description: 'windowIssueDesc' },
      { id: 'door_issue', title: 'doorIssue', description: 'doorIssueDesc' },
    ],
  },
  appliances: {
    icon: 'restaurant',
    issues: [
      { id: 'refrigerator', title: 'refrigerator', description: 'refrigeratorDesc' },
      { id: 'stove_oven', title: 'stoveOven', description: 'stoveOvenDesc' },
      { id: 'dishwasher', title: 'dishwasher', description: 'dishwasherDesc' },
      { id: 'washer_dryer', title: 'washerDryer', description: 'washerDryerDesc' },
    ],
  },
};

export default function NewMaintenanceRequestScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const scrollViewRef = useRef<typeof ScrollView>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedIssue, setSelectedIssue] = useState<{
    id: string;
    title: string;
    description: string;
  } | null>(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const renterId = 'user3'; // This should come from your auth context
  const propertyId = 'prop2'; // This should come from your context or route params

  const handleTypeSelect = (type: string) => {
    setSelectedType(type);
    setSelectedIssue(null);
  };

  const handleIssueSelect = (issue: { id: string; title: string; description: string }) => {
    setSelectedIssue(issue);
    // Scroll to the bottom after a short delay to ensure the notes field is rendered
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleSubmit = async () => {
    if (!selectedIssue) return;

    setLoading(true);
    try {
      await mockApi.createMaintenanceRequest({
        title: t(`maintenanceIssues.${selectedIssue.title}`),
        description:
          t(`maintenanceIssues.${selectedIssue.description}`) +
          (notes ? `\n\nNotes: ${notes}` : ''),
        status: 'pending',
        propertyId,
        renterId,
      });
      router.replace('/maintenance');
    } catch (error) {
      console.error('Error creating maintenance request:', error);
      // Using console.error instead of Alert since Alert is not available
      console.error(t('error'), t('createRequestError'));
    } finally {
      setLoading(false);
    }
  };

  const renderMaintenanceTypes = () => {
    return Object.entries(MAINTENANCE_TYPES).map(([type, data]) => (
      <TouchableOpacity
        key={type}
        style={[styles.typeButton, selectedType === type && styles.selectedTypeButton]}
        onPress={() => handleTypeSelect(type)}
        disabled={loading}
      >
        <Ionicons
          name={data.icon as any}
          size={24}
          color={selectedType === type ? 'white' : '#2C3E50'}
        />
        <Text
          style={[styles.typeButtonText, selectedType === type && styles.selectedTypeButtonText]}
        >
          {t(`maintenanceTypes.${type}`)}
        </Text>
      </TouchableOpacity>
    ));
  };

  const renderIssueButtons = () => {
    if (!selectedType) return null;

    return MAINTENANCE_TYPES[selectedType as keyof typeof MAINTENANCE_TYPES].issues.map((issue) => (
      <TouchableOpacity
        key={issue.id}
        style={[styles.issueButton, selectedIssue?.id === issue.id && styles.selectedIssueButton]}
        onPress={() => handleIssueSelect(issue)}
        disabled={loading}
      >
        <Text
          style={[
            styles.issueButtonText,
            selectedIssue?.id === issue.id && styles.selectedIssueButtonText,
          ]}
        >
          {t(`maintenanceIssues.${issue.title}`)}
        </Text>
      </TouchableOpacity>
    ));
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title={t('createRequest')} />

      <ScrollView ref={scrollViewRef} style={styles.scrollView}>
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>{t('selectMaintenanceType')}</Text>
          <View style={styles.typeGrid}>{renderMaintenanceTypes()}</View>

          {selectedType && (
            <>
              <Text style={[styles.sectionTitle, styles.marginTop]}>{t('selectIssue')}</Text>
              <View style={styles.issueList}>{renderIssueButtons()}</View>
            </>
          )}

          {selectedIssue && (
            <View style={styles.notesContainer}>
              <Text style={styles.sectionTitle}>{t('additionalNotes')}</Text>
              <TextInput
                style={styles.notesInput}
                placeholder={t('notesPlaceholder')}
                placeholderTextColor="#999"
                value={notes}
                onChangeText={setNotes}
              />
            </View>
          )}
        </View>
      </ScrollView>

      {selectedIssue && (
        <View style={styles.submitContainer}>
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.submitButtonText}>{loading ? t('submitting') : t('submit')}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 100, // Add padding to account for the submit button
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 16,
  },
  marginTop: {
    marginTop: 24,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  typeButton: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  selectedTypeButton: {
    backgroundColor: '#4CAF50',
  },
  typeButtonText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '500',
    color: '#2C3E50',
    textAlign: 'center',
  },
  selectedTypeButtonText: {
    color: '#FFFFFF',
  },
  issueList: {
    gap: 12,
  },
  issueButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  selectedIssueButton: {
    backgroundColor: '#4CAF50',
  },
  issueButtonText: {
    fontSize: 16,
    color: '#2C3E50',
  },
  selectedIssueButtonText: {
    color: '#FFFFFF',
  },
  notesContainer: {
    marginTop: 24,
  },
  notesInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    minHeight: 100,
    fontSize: 16,
    color: '#2C3E50',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  submitContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#A5D6A7',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
