import React from 'react';
import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useAuth } from '@/contexts/AuthContext';
import { RoleGuard } from '../components/RoleGuard';

import Colors from '../../constants/Colors';

// Default tab navigator configuration
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={24} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const colorScheme = 'light'; // Just use light theme for now
  const isLandlord = user?.role === 'landlord';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.light.tint,
        headerStyle: {
          backgroundColor: '#34568B', // Primary color
        },
        headerTintColor: '#fff',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopColor: '#e0e0e0',
        },
      }}>
      {/* Home Tab - Shared but with different content */}
      <Tabs.Screen
        name="index"
        options={{
          title: t('tabs.home'),
          tabBarIcon: ({ color }: { color: string }) => <TabBarIcon name="home" color={color} />,
        }}
      />

      {/* Properties Tab - Different views for landlord/renter */}
      {isLandlord ? (
        <>
          <Tabs.Screen
            name="properties"
            options={{
              title: t('tabs.myProperties'),
              tabBarIcon: ({ color }: { color: string }) => <TabBarIcon name="building" color={color} />,
            }}
          />
          <Tabs.Screen
            name="financial"
            options={{
              title: t('tabs.financial'),
              tabBarIcon: ({ color }: { color: string }) => <TabBarIcon name="dollar" color={color} />,
            }}
          />
        </>
      ) : (
        <>
          <Tabs.Screen
            name="explore"
            options={{
              title: t('tabs.findProperties'),
              tabBarIcon: ({ color }: { color: string }) => <TabBarIcon name="search" color={color} />,
            }}
          />
          <Tabs.Screen
            name="current-rental"
            options={{
              title: t('tabs.currentRental'),
              tabBarIcon: ({ color }: { color: string }) => <TabBarIcon name="home" color={color} />,
            }}
          />
        </>
      )}

      {/* Applications Tab - Landlord Only */}
      {isLandlord && (
        <Tabs.Screen
          name="applications"
          options={{
            title: t('tabs.applications'),
            tabBarIcon: ({ color }: { color: string }) => <TabBarIcon name="file-text" color={color} />,
          }}
        />
      )}

      {/* Tenants Tab - Landlord Only */}
      {isLandlord && (
        <Tabs.Screen
          name="tenants"
          options={{
            title: t('tabs.tenants'),
            tabBarIcon: ({ color }: { color: string }) => <TabBarIcon name="users" color={color} />,
          }}
        />
      )}

      {/* Applications Tab - Renter Only */}
      {!isLandlord && (
        <Tabs.Screen
          name="my-applications"
          options={{
            title: t('tabs.myApplications'),
            tabBarIcon: ({ color }: { color: string }) => <TabBarIcon name="file-text" color={color} />,
          }}
        />
      )}

      {/* Messages Tab - Shared */}
      <Tabs.Screen
        name="messages"
        options={{
          title: t('tabs.messages'),
          tabBarIcon: ({ color }: { color: string }) => <TabBarIcon name="comments" color={color} />,
        }}
      />

      {/* Profile Tab - Shared */}
      <Tabs.Screen
        name="profile"
        options={{
          title: t('tabs.profile'),
          tabBarIcon: ({ color }: { color: string }) => <TabBarIcon name="user" color={color} />,
        }}
      />
    </Tabs>
  );
}
