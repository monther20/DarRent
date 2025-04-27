import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from '@/components/Text';
import { router } from 'expo-router';

type QuickAction = {
  id: string;
  title: string;
  path: string;
};

type QuickActionsProps = {
  actions: QuickAction[];
};

export function QuickActions({ actions }: QuickActionsProps) {
  return (
    <View style={styles.quickActions}>
      {actions.map((action) => (
        <TouchableOpacity
          key={action.id}
          style={styles.actionButton}
          onPress={() => router.push(action.path)}
        >
          <Text style={styles.actionButtonText}>{action.title}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  quickActions: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#34568B',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: 'white',
    fontWeight: '600',
  },
}); 