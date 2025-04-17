import React from 'react';
import { TextInput, View, TextInputProps, TouchableOpacity, StyleSheet } from 'react-native';
import { ThemedText } from './ThemedText';
import FontAwesome from '@expo/vector-icons/FontAwesome';

type KeyboardType = 'default' | 'email-address' | 'numeric' | 'phone-pad' | 'number-pad' | 'decimal-pad' | 'url' | 'web-search';
type AutoCapitalize = 'none' | 'sentences' | 'words' | 'characters';
type AutoComplete = 'email' | 'password' | 'username' | 'off';

export type InputFieldProps = TextInputProps & {
  label: string;
  error?: string;
  icon?: string;
  iconRight?: string;
  onIconRightPress?: () => void;
  isRTL?: boolean;
  keyboardType?: KeyboardType;
  autoCapitalize?: AutoCapitalize;
  autoComplete?: AutoComplete;
  onBlur?: () => void;
  secureTextEntry?: boolean;
};

export function InputField({
  label,
  error,
  icon,
  iconRight,
  onIconRightPress,
  isRTL = false,
  style,
  ...props
}: InputFieldProps) {
  return (
    <View style={styles.container}>
      <ThemedText style={styles.label}>{label}</ThemedText>
      <View style={styles.inputContainer}>
        <TextInput
          style={[
            styles.input,
            {
              paddingLeft: icon ? 45 : 16,
              paddingRight: iconRight ? 45 : 16,
              borderColor: error ? '#EF4444' : '#D1D5DB',
              textAlign: isRTL ? 'right' : 'left',
            },
            style
          ]}
          {...props}
        />
        
        {icon && (
          <View style={[
            styles.iconContainer,
            isRTL ? styles.iconRight : styles.iconLeft
          ]}>
            <FontAwesome name={icon as any} size={18} color="#7F8C8D" />
          </View>
        )}
        
        {iconRight && onIconRightPress && (
          <TouchableOpacity 
            style={[
              styles.iconContainer,
              isRTL ? styles.iconLeft : styles.iconRight
            ]}
            onPress={onIconRightPress}
          >
            <FontAwesome name={iconRight as any} size={18} color="#7F8C8D" />
          </TouchableOpacity>
        )}
      </View>
      
      {error && (
        <ThemedText style={styles.error}>{error}</ThemedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    color: '#34568B',
    marginBottom: 8,
  },
  inputContainer: {
    position: 'relative',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    backgroundColor: '#F9FAFB',
    fontSize: 16,
  },
  iconContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  iconLeft: {
    left: 15,
  },
  iconRight: {
    right: 15,
  },
  error: {
    color: '#EF4444',
    marginTop: 4,
  },
}); 