import React from 'react';
import { Text, TextProps } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

interface ThemedTextProps extends TextProps {
  children: React.ReactNode;
}

export const ThemedText: React.FC<ThemedTextProps> = ({ style, children, ...props }) => {
  const { isDarkMode } = useTheme();
  
  return (
    <Text
      style={[
        { color: isDarkMode ? '#FFFFFF' : '#000000' },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
};
