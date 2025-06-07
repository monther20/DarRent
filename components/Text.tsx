import React from 'react';
import { Text as RNText, TextProps, StyleSheet } from 'react-native';

interface Props extends TextProps {
  variant?: 'default' | 'heading' | 'subheading' | 'caption';
}

export function Text({ variant = 'default', style, children, ...props }: Props) {
  return (
    <RNText style={[styles[variant], style]} {...props}>
      {children}
    </RNText>
  );
}

const styles = StyleSheet.create({
  default: {
    color: '#111827', // text-gray-900
    fontSize: 16,
  },
  heading: {
    color: '#111827',
    fontSize: 24,
    fontWeight: 'bold',
  },
  subheading: {
    color: '#111827',
    fontSize: 18,
    fontWeight: '600',
  },
  caption: {
    color: '#6B7280', // text-gray-500
    fontSize: 14,
  },
});
