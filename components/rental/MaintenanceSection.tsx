import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from '@/components/Text';
import { Ionicons } from '@expo/vector-icons';

interface MaintenanceRequest {
  id?: string;
  title: string;
  status: 'pending' | 'in_progress' | 'completed' | string;
  date?: string;
}

type MaintenanceSectionProps = {
  requests?: MaintenanceRequest[];
  request?: MaintenanceRequest;
  onNewRequest?: () => void;
};

export function MaintenanceSection({ requests, request, onNewRequest }: MaintenanceSectionProps) {
  const requestsToShow = requests || (request ? [request] : []);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return '#FFA500';
      case 'in_progress':
        return '#4CAF50';
      case 'completed':
        return '#808080';
      default:
        return '#34568B';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Maintenance Requests</Text>
        <TouchableOpacity onPress={onNewRequest} style={styles.addButton}>
          <Ionicons name="add-circle-outline" size={24} color="#34568B" />
          <Text style={styles.addButtonText}>New Request</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.requestsContainer}>
        {requestsToShow.map((req, index) => (
          <View key={req.id || index} style={styles.requestCard}>
            <View style={styles.requestInfo}>
              <Text style={styles.requestTitle}>{req.title}</Text>
              {req.date && <Text style={styles.requestDate}>{req.date}</Text>}
            </View>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(req.status) }]}>
              <Text style={styles.statusText}>
                {typeof req.status === 'string' ? req.status : req.status.replace('_', ' ')}
              </Text>
            </View>
          </View>
        ))}
        {requestsToShow.length === 0 && (
          <Text style={styles.emptyText}>No maintenance requests</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#34568B',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addButtonText: {
    color: '#34568B',
    fontSize: 14,
    fontWeight: '500',
  },
  requestsContainer: {
    gap: 12,
  },
  requestCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  requestInfo: {
    flex: 1,
  },
  requestTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  requestDate: {
    fontSize: 14,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 14,
    marginTop: 8,
  },
}); 