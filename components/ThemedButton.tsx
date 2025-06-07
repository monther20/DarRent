import { TouchableOpacity, type TouchableOpacityProps, StyleSheet } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';
import React from 'react';
import Colors from '@/constants/Colors';
import { ThemedText } from './ThemedText';

type ColorKey = keyof typeof Colors.light;

type ThemedButtonProps = TouchableOpacityProps & {
  lightColor?: string;
  darkColor?: string;
  children?: React.ReactNode;
  style?: any;
  colorName?: ColorKey;
  textColorName?: ColorKey;
  title?: string;
};

export function ThemedButton({
  style,
  lightColor,
  darkColor,
  children,
  colorName = 'primary',
  textColorName = 'text',
  title,
  ...otherProps
}: ThemedButtonProps) {
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, colorName);
  const textColor = useThemeColor({}, textColorName);

  return (
    <TouchableOpacity style={[styles.button, { backgroundColor }, style]} {...otherProps}>
      {title ? (
        <ThemedText style={[styles.text, { color: textColor }]} colorName={textColorName}>
          {title}
        </ThemedText>
      ) : (
        children
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
});
