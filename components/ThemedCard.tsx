import { View, type ViewProps, StyleSheet } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';
import React from 'react';
import Colors from '@/constants/Colors';

type ColorKey = keyof typeof Colors.light;

type ThemedCardProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
  children?: React.ReactNode;
  style?: any;
  colorName?: ColorKey;
  borderColorName?: ColorKey;
};

export function ThemedCard({
  style,
  lightColor,
  darkColor,
  children,
  colorName = 'card',
  borderColorName = 'border',
  ...otherProps
}: ThemedCardProps) {
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, colorName);
  const borderColor = useThemeColor({}, borderColorName);

  return (
    <View style={[styles.card, { backgroundColor, borderColor }, style]} {...otherProps}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});
