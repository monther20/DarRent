import { ScrollView, TouchableOpacity, TextInput, ScrollViewProps, TextInputProps } from 'react-native';
import React from 'react';

type StyledScrollViewProps = ScrollViewProps;

type StyledTextInputProps = TextInputProps;

export const StyledScrollView: React.FC<StyledScrollViewProps> = (props) => {
  return <ScrollView {...props} />;
};

export const Pressable = TouchableOpacity;

export const StyledTextInput: React.FC<StyledTextInputProps> = (props) => {
  return <TextInput {...props} />;
}; 