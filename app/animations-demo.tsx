import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { EmptyStateExample } from './components/EmptyStateExample';

export default function AnimationsDemo() {
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Animations Demo' }} />
      <EmptyStateExample />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
