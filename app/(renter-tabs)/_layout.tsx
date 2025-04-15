import React from 'react';
import { Drawer } from 'expo-router/drawer';
import { useTranslation } from 'react-i18next';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useLanguage } from '@/contexts/LanguageContext';
import Colors from '@/constants/Colors';

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={24} style={{ marginBottom: -3 }} {...props} />;
}

export default function RenterTabLayout() {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const isRTL = language === 'ar';

  return (
    <Drawer
      screenOptions={{
        drawerPosition: isRTL ? 'right' : 'left',
        drawerStyle: {
          backgroundColor: '#fff',
          width: '80%',
        },
        headerShown: false,
      }}>
      <Drawer.Screen
        name="index"
        options={{
          drawerLabel: t('tabs.dashboard'),
          drawerIcon: ({ color }) => <TabBarIcon name="dashboard" color={color} />,
        }}
      />
      <Drawer.Screen
        name="rentals"
        options={{
          drawerLabel: t('tabs.myRentals'),
          drawerIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
        }}
      />
      <Drawer.Screen
        name="payments"
        options={{
          drawerLabel: t('tabs.payments'),
          drawerIcon: ({ color }) => <TabBarIcon name="credit-card" color={color} />,
        }}
      />
      <Drawer.Screen
        name="maintenance"
        options={{
          drawerLabel: t('tabs.maintenance'),
          drawerIcon: ({ color }) => <TabBarIcon name="wrench" color={color} />,
        }}
      />
      <Drawer.Screen
        name="chat"
        options={{
          drawerLabel: t('menu.messages'),
          drawerIcon: ({ color }) => <TabBarIcon name="comments" color={color} />,
        }}
      />
      <Drawer.Screen
        name="settings"
        options={{
          drawerLabel: t('menu.settings'),
          drawerIcon: ({ color }) => <TabBarIcon name="cog" color={color} />,
        }}
      />
    </Drawer>
  );
} 