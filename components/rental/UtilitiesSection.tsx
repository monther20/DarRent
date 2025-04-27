import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '@/components/Text';

interface Utility {
  id: string;
  type: string;
  amount: string;
  dueIn: string;
}

type UtilitiesSectionProps = {
  utilities: Utility[];
};

export function UtilitiesSection({ utilities }: UtilitiesSectionProps) {
  return (
    <View>
      <Text style={styles.sectionTitle}>Utilities And Bills</Text>
      <View style={styles.utilitiesContainer}>
        {utilities.map((utility) => (
          <View key={utility.id} style={styles.utilityCard}>
            <Text style={styles.utilityType}>{utility.type}</Text>
            <Text style={styles.utilityAmount}>{utility.amount}</Text>
            <Text style={styles.utilityDue}>Due in {utility.dueIn}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#34568B',
  },
  utilitiesContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  utilityCard: {
    flex: 1,
    backgroundColor: '#34568B',
    padding: 16,
    borderRadius: 12,
  },
  utilityType: {
    fontSize: 16,
    color: 'white',
    marginBottom: 4,
  },
  utilityAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  utilityDue: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
}); 