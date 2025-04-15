import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import * as Device from 'expo-device';

export default function ModalScreen() {
  const isIOS = Device.osName === 'iOS';
  
  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>Modal</ThemedText>
      <ThemedText style={styles.text}>This is a modal screen</ThemedText>

      {/* Use a light status bar on iOS to account for the black space above the modal */}
      <StatusBar style={isIOS ? 'light' : 'auto'} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  text: {
    fontSize: 16,
    textAlign: 'center',
    marginHorizontal: 20,
  },
}); 