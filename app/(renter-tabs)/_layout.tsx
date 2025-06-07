import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Slot, usePathname } from 'expo-router';
import { BottomNavBar } from '@/components/BottomNavBar';
import NotificationContainer from '@/app/components/NotificationContainer';

export default function RenterTabLayout() {
  const pathname = usePathname();
  // Optionally, hide the nav bar on certain screens if needed
  // const hideTabBar = ...;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Slot />
      </View>
      <NotificationContainer />
      <BottomNavBar userType="renter" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6F8',
  },
  content: {
    flex: 1,
  },
});
