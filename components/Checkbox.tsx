import React from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native'; // Added View
import { Ionicons } from '@expo/vector-icons';

interface CheckboxProps {
  checked: boolean;
  onPress: () => void;
}

export default function Checkbox({ checked, onPress }: CheckboxProps) {
  return (
    <TouchableOpacity testID="checkbox-touchable" style={[styles.checkbox, checked && styles.checked]} onPress={onPress}>
      {checked && (
        <View testID="checkmark-icon-container">
          <Ionicons name="checkmark" size={16} color="white" />
        </View>
      )}
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
