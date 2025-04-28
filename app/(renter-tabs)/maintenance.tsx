import React from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from '@/components/Text';
import Colors from '@/constants/Colors';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { ScreenHeader } from '@/components/ScreenHeader';

export default function MaintenanceScreen() {
  return (
    <ScrollView style={styles.container}>
      <ScreenHeader title="Maintenance" />

      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Active Requests</Text>
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No active maintenance requests</Text>
          </View>
        </View>

        <View style={[styles.card, styles.marginTop]}>
          <Text style={styles.cardTitle}>Past Requests</Text>
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No past maintenance requests</Text>
          </View>
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
  header: {
    backgroundColor: Colors.light.primary,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.secondary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addButtonText: {
    color: '#fff',
    marginLeft: 8,
  },
  content: {
    padding: 16,
  },
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
  marginTop: {
    marginTop: 16,
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
});
