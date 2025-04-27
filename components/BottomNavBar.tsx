import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { usePathname, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/Text';

type TabItem = {
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  activeIcon: keyof typeof Ionicons.glyphMap;
  path: string;
};

type UserType = 'landlord' | 'renter';

type BottomNavBarProps = {
  userType: UserType;
};

export function BottomNavBar({ userType }: BottomNavBarProps) {
  const pathname = usePathname();

  const landlordTabs: TabItem[] = [
    {
      name: 'Home',
      icon: 'home-outline',
      activeIcon: 'home',
      path: '/(landlord-tabs)',
    },
    {
      name: 'Properties',
      icon: 'business-outline',
      activeIcon: 'business',
      path: '/(landlord-tabs)/properties',
    },
    {
      name: 'Renters',
      icon: 'people-outline',
      activeIcon: 'people',
      path: '/(landlord-tabs)/renters',
    },
    {
      name: 'Settings',
      icon: 'settings-outline',
      activeIcon: 'settings',
      path: '/(landlord-tabs)/settings',
    },
  ];

  const renterTabs: TabItem[] = [
    {
      name: 'Home',
      icon: 'home-outline',
      activeIcon: 'home',
      path: '/(renter-tabs)',
    },
    {
      name: 'Search',
      icon: 'search-outline',
      activeIcon: 'search',
      path: '/(renter-tabs)/search',
    },
    {
      name: 'My Rental',
      icon: 'business-outline',
      activeIcon: 'business',
      path: '/(renter-tabs)/rental',
    },
    {
      name: 'Settings',
      icon: 'settings-outline',
      activeIcon: 'settings',
      path: '/(renter-tabs)/settings',
    },
  ];

  const tabs = userType === 'landlord' ? landlordTabs : renterTabs;
  const basePath = userType === 'landlord' ? '/(landlord-tabs)' : '/(renter-tabs)';

  const isTabActive = (tabPath: string) => {
    if (tabPath === basePath) {
      return pathname === basePath || pathname === `${basePath}/index`;
    }
    return pathname.startsWith(tabPath);
  };

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = isTabActive(tab.path);
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
            <Text style={[
              styles.label,
              isActive && styles.activeLabel
            ]}>
              {tab.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 60,
    backgroundColor: '#34568B',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    color: 'white',
    marginTop: 4,
  },
  activeLabel: {
    color: '#E67E22',
  },
}); 