import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from '@/components/Text';
import Colors from '@/constants/Colors';
import { useTranslation } from 'react-i18next';
import { MaintenanceRequest } from '@/services/mockData';

interface MaintenanceCardProps {
  title: string;
  requests: MaintenanceRequest[];
  onPress?: (id: string) => void;
}

export const MaintenanceCard: React.FC<MaintenanceCardProps> = ({ title, requests, onPress }) => {
  const { t } = useTranslation();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return Colors.light.warning;
      case 'scheduled':
        return Colors.light.info;
      case 'completed':
        return Colors.light.success;
      case 'cancelled':
        return Colors.light.error;
      default:
        return Colors.light.grey;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusLabel = (status: string) => {
    return t(`status.${status}`);
  };

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>
      {requests.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>{t('noRequests')}</Text>
        </View>
      ) : (
        requests.map((request) => (
          <TouchableOpacity
            key={request.id}
            style={styles.requestItem}
            onPress={() => onPress?.(request.id)}
          >
            <View style={styles.requestHeader}>
              <Text style={styles.requestTitle}>{request.title}</Text>
              <View
                style={[styles.statusBadge, { backgroundColor: getStatusColor(request.status) }]}
              >
                <Text style={styles.statusText}>{getStatusLabel(request.status)}</Text>
              </View>
            </View>
            <Text style={styles.requestDescription}>{request.description}</Text>
            <Text style={styles.requestDate}>{formatDate(request.createdAt)}</Text>
            {request.scheduledDate && (
              <Text style={styles.requestDate}>
                {t('scheduledFor')}: {formatDate(request.scheduledDate)}
              </Text>
            )}
            {request.completedDate && (
              <Text style={styles.requestDate}>
                {t('completedOn')}: {formatDate(request.completedDate)}
              </Text>
            )}
          </TouchableOpacity>
        ))
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
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
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: Colors.light.text,
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
  },
  emptyStateText: {
    fontSize: 16,
    color: Colors.light.grey,
  },
  requestItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  requestTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.light.text,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: '#fff',
  },
  requestDescription: {
    fontSize: 14,
    color: Colors.light.grey,
    marginBottom: 4,
  },
  requestDate: {
    fontSize: 12,
    color: Colors.light.grey,
  },
});
