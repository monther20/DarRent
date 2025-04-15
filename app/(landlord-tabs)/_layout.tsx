import React from 'react';
import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useAuth } from '../../contexts/AuthContext';
import { RoleGuard } from '../../components/RoleGuard';
import { useLanguage } from '../../contexts/LanguageContext';
import { MenuButton } from '../../components/MenuButton';
import Colors from '../../constants/Colors';

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={24} style={{ marginBottom: -3 }} {...props} />;
}

export default function LandlordTabLayout() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { language } = useLanguage();
  const isRTL = language === 'ar';

  return (
    <RoleGuard allowedRoles={['landlord']}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors.light.tint,
          headerStyle: {
            backgroundColor: '#34568B',
          },
          headerTintColor: '#fff',
          tabBarStyle: {
            backgroundColor: '#fff',
            borderTopColor: '#e0e0e0',
          },
          ...(isRTL
            ? {
                headerLeft: () => <MenuButton position="left" />,
              }
            : {
                headerRight: () => <MenuButton position="right" />,
              }),
        }}>
        {/* Dashboard */}
        <Tabs.Screen
          name="index"
          options={{
            title: t('tabs.dashboard'),
            tabBarIcon: ({ color }: { color: string }) => <TabBarIcon name="dashboard" color={color} />,
          }}
        />

        {/* Financial Overview */}
        <Tabs.Screen
          name="financial"
          options={{
            title: t('tabs.financial'),
            tabBarIcon: ({ color }: { color: string }) => <TabBarIcon name="dollar" color={color} />,
          }}
        />

        {/* Properties Management */}
        <Tabs.Screen
          name="properties"
          options={{
            title: t('tabs.myProperties'),
            tabBarIcon: ({ color }: { color: string }) => <TabBarIcon name="building" color={color} />,
          }}
        />

        {/* Renters */}
        <Tabs.Screen
          name="renters"
          options={{
            title: t('tabs.renters'),
            tabBarIcon: ({ color }: { color: string }) => <TabBarIcon name="users" color={color} />,
          }}
        />
      </Tabs>
    </RoleGuard>
  );
} 