import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text } from '@/components/Text';
import { ScreenHeader } from '@/components/ScreenHeader';
import { MaintenanceCard } from '@/app/components/maintenance/MaintenanceCard';
import { useTranslation } from 'react-i18next';
import { mockApi } from '@/app/services/mockApi';
import { MaintenanceRequest } from '@/services/mockData';
import { useRouter } from 'expo-router';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';

export default function MaintenanceScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [activeRequests, setActiveRequests] = useState<MaintenanceRequest[]>([]);
  const [pastRequests, setPastRequests] = useState<MaintenanceRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const renterId = 'user3'; // This should come from your auth context

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const [active, past] = await Promise.all([
          mockApi.getActiveMaintenanceRequests(renterId),
          mockApi.getPastMaintenanceRequests(renterId),
        ]);
        setActiveRequests(active);
        setPastRequests(past);
      } catch (error) {
        console.error('Error fetching maintenance requests:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [renterId]);

  const handleRequestPress = (id: string) => {
    router.push(`/maintenance/${id}`);
  };

  const handleCreateRequest = () => {
    router.push('/maintenance/new');
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ScreenHeader title={t('title')} />
        <View style={styles.loadingContainer}>
          <Text>{t('loading', { ns: 'common' })}</Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <ScreenHeader title={t('title')} />

      <View style={styles.content}>
        <TouchableOpacity style={styles.createButton} onPress={handleCreateRequest}>
          <Ionicons name="add-circle-outline" size={24} color="white" />
          <Text style={styles.createButtonText}>{t('createRequest')}</Text>
        </TouchableOpacity>

        <View style={styles.marginTop}>
          <MaintenanceCard
            title={t('activeRequests')}
            requests={activeRequests}
            onPress={handleRequestPress}
          />
        </View>

        <View style={styles.marginTop}>
          <MaintenanceCard
            title={t('pastRequests')}
            requests={pastRequests}
            onPress={handleRequestPress}
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  content: {
    padding: 16,
  },
  marginTop: {
    marginTop: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  createButtonText: {
    color: 'white',
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
  },
});
