import { TextInput, type TextInputProps, StyleSheet } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';
import React from 'react';
import Colors from '@/constants/Colors';

type ColorKey = keyof typeof Colors.light;

type ThemedInputProps = TextInputProps & {
  lightColor?: string;
  darkColor?: string;
  style?: any;
  colorName?: ColorKey;
  placeholderColorName?: ColorKey;
  borderColorName?: ColorKey;
};

export function ThemedInput({
  style,
  lightColor,
  darkColor,
  colorName = 'card',
  placeholderColorName = 'grey',
  borderColorName = 'border',
  ...otherProps
}: ThemedInputProps) {
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, colorName);
  const placeholderColor = useThemeColor({}, placeholderColorName);
  const borderColor = useThemeColor({}, borderColorName);
  const textColor = useThemeColor({}, 'text');

  return (
    <TextInput
      style={[
        styles.input,
        {
          backgroundColor,
          borderColor,
          color: textColor,
        },
        style,
      ]}
      placeholderTextColor={placeholderColor}
      {...otherProps}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
  },
});
