import { useThemeColor } from '@/hooks/useThemeColor';
import React from 'react';
import Colors from '@/constants/Colors';
import { MaterialIcons } from '@expo/vector-icons';

type ColorKey = keyof typeof Colors.light;

type ThemedIconProps = {
  name: React.ComponentProps<typeof MaterialIcons>['name'];
  size?: number;
  lightColor?: string;
  darkColor?: string;
  colorName?: ColorKey;
  style?: any;
};

export function ThemedIcon({ 
  name, 
  size = 24, 
  lightColor, 
  darkColor, 
  colorName = 'text',
  style 
}: ThemedIconProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, colorName);

  return (
    <MaterialIcons
      name={name}
      size={size}
      color={color}
      style={style}
    />
  );
} 