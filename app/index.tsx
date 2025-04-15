import { Redirect } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { View, ActivityIndicator } from 'react-native';

export default function Index() {
  try {
    console.log('Initializing app...');
    const { isLoggedIn, user } = useAuth();
    console.log('Auth state:', { isLoggedIn, user });
    
    // Redirect based on authentication status and user role
    if (isLoggedIn) {
      console.log('User is logged in');
      if (user?.role === 'landlord') {
        console.log('Redirecting to landlord tabs');
        return <Redirect href="/(landlord-tabs)" />;
      } else if (user?.role === 'renter') {
        console.log('Redirecting to renter tabs');
        return <Redirect href="/(renter-tabs)" />;
      }
      console.log('No role found for logged in user');
    } else {
      console.log('User is not logged in, redirecting to welcome');
    }
    
    return <Redirect href="/auth/welcome" />;
  } catch (error) {
    // If AuthProvider is not available yet, show a loading indicator
    console.error('Error in Index component:', error);
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#34568B" />
      </View>
    );
  }
} 