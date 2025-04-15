import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';

export default function AuthLayout() {
  const { t } = useTranslation();
  
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#34568B',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerBackTitleVisible: false,
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="welcome"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="login"
        options={{
          title: t('auth.login'),
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="register"
        options={{
          title: t('auth.createAccount'),
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="forgot-password"
        options={{
          title: t('auth.forgotPassword'),
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="reset-password"
        options={{
          title: t('auth.resetPassword'),
          animation: 'slide_from_right',
        }}
      />
    </Stack>
  );
} 