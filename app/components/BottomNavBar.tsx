import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { usePathname, router } from 'expo-router';

type TabIconName = 'home-outline' | 'home' | 'business-outline' | 'business' | 
                  'people-outline' | 'people' | 'wallet-outline' | 'wallet';

interface TabItem {
  name: string;
  icon: TabIconName;
  activeIcon: TabIconName;
  path: string;
}

export function BottomNavBar() {
  const pathname = usePathname();

  const tabs: TabItem[] = [
    {
      name: 'Home',
      icon: 'home-outline',
      activeIcon: 'home',
      path: '/',
    },
    {
      name: 'Properties',
      icon: 'business-outline',
      activeIcon: 'business',
      path: '/properties',
    },
    {
      name: 'Renters',
      icon: 'people-outline',
      activeIcon: 'people',
      path: '/renters',
    },
    {
      name: 'Financial',
      icon: 'wallet-outline',
      activeIcon: 'wallet',
      path: '/financial',
    },
  ];

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = pathname === tab.path;
        return (
          <TouchableOpacity
            key={tab.name}
            style={styles.tab}
            onPress={() => router.push(tab.path)}
          >
            <Ionicons
              name={isActive ? tab.activeIcon : tab.icon}
              size={24}
              color={isActive ? '#E67E22' : 'white'}
            />
            <ThemedText style={[
              styles.label,
              isActive && styles.activeLabel
            ]}>
              {tab.name}
            </ThemedText>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#34568B',
    paddingBottom: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  label: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
  },
  activeLabel: {
    color: '#E67E22',
  },
}); 