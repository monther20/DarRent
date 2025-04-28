import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CheckboxProps {
  checked: boolean;
  onPress: () => void;
}

export default function Checkbox({ checked, onPress }: CheckboxProps) {
  return (
    <TouchableOpacity style={[styles.checkbox, checked && styles.checked]} onPress={onPress}>
      {checked && <Ionicons name="checkmark" size={16} color="white" />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#34568B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checked: {
    backgroundColor: '#34568B',
    borderColor: '#34568B',
  },
});
