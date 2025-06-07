import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Text } from '@/components/Text';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useTranslation } from 'react-i18next';
import { mockApi } from '@/app/services/mockApi';
import { useLocalSearchParams } from 'expo-router';
import { MaintenanceRequest } from '@/services/mockData';

export default function MaintenanceRequestDetailsScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [request, setRequest] = useState<MaintenanceRequest | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequest = async () => {
      try {
        const requests = await mockApi.getMaintenanceRequests('user3'); // This should use auth context
        const foundRequest = requests.find((r) => r.id === id);
        setRequest(foundRequest || null);
      } catch (error) {
        console.error('Error fetching maintenance request:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRequest();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ScreenHeader title={t('requestDetails')} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
        </View>
      </View>
    );
  }

  if (!request) {
    return (
      <View style={styles.container}>
        <ScreenHeader title={t('requestDetails')} />
        <View style={styles.content}>
          <Text style={styles.errorText}>{t('requestNotFound')}</Text>
        </View>
      </View>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return '#F1C40F';
      case 'scheduled':
        return '#3498DB';
      case 'completed':
        return '#2ECC71';
      case 'cancelled':
        return '#E74C3C';
      default:
        return '#95A5A6';
    }
  };

  return (
    <ScrollView style={styles.container}>
      <ScreenHeader title={t('requestDetails')} />

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.label}>{t('requestTitle')}</Text>
          <Text style={styles.value}>{request.title}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>{t('description')}</Text>
          <Text style={styles.value}>{request.description}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>{t('statusLabel')}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(request.status) }]}>
            <Text style={styles.statusText}>{t(`status.${request.status}`)}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>{t('createdAt')}</Text>
          <Text style={styles.value}>{formatDate(request.createdAt)}</Text>
        </View>

        {request.scheduledDate && (
          <View style={styles.section}>
            <Text style={styles.label}>{t('scheduledDate')}</Text>
            <Text style={styles.value}>{formatDate(request.scheduledDate)}</Text>
          </View>
        )}

        {request.completedDate && (
          <View style={styles.section}>
            <Text style={styles.label}>{t('completedDate')}</Text>
            <Text style={styles.value}>{formatDate(request.completedDate)}</Text>
          </View>
        )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
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
  label: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: '#2C3E50',
  },
  errorText: {
    fontSize: 16,
    color: '#E74C3C',
    textAlign: 'center',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
});
