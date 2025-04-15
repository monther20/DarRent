import 'react-native';

declare module 'react-native' {
  interface TextInputProps {
    type?: string;
    placeholderTextColor?: string;
  }
} 