import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CheckboxProps {
  checked: boolean;
  onPress: () => void;
  size?: number;
}

export default function Checkbox({ checked, onPress, size = 20 }: CheckboxProps) {
  return (
    <TouchableOpacity
      style={[styles.container, { width: size, height: size }, checked && styles.checked]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {checked && <Ionicons name="checkmark" size={size - 4} color="white" />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 2,
    borderColor: '#34568B',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checked: {
    backgroundColor: '#34568B',
  },
});
