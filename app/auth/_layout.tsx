import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';

export default function AuthLayout() {
  const { t } = useTranslation();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#fff' },
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
          headerShown: false,
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="register"
        options={{
          title: t('auth.createAccount'),
          headerShown: false,
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="forgot-password"
        options={{
          title: t('auth.forgotPassword'),
          headerShown: false,
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="reset-password"
        options={{
          title: t('auth.resetPassword'),
          headerShown: false,
          animation: 'slide_from_right',
        }}
      />
    </Stack>
  );
}
