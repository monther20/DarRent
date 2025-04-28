import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from '@/components/Text';
import { MenuButton } from '@/components/MenuButton';
import { router } from 'expo-router';

type DashboardHeaderProps = {
  userName?: string;
};

export function DashboardHeader({ userName }: DashboardHeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <Text style={styles.welcomeText}>Hello, {userName}</Text>
        <MenuButton position="right" />
      </View>
      <TouchableOpacity style={styles.searchBar} onPress={() => router.push('/search')}>
        <Text style={styles.searchText}>Search properties...</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: 16,
    backgroundColor: '#34568B',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  searchBar: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 12,
  },
  searchText: {
    color: 'white',
    fontSize: 16,
  },
});
