/// <reference types="expo-router/types" />

declare module 'react-native' {
  interface ViewProps {
    children?: React.ReactNode;
    style?: any;
  }
  interface TextProps {
    children?: React.ReactNode;
    style?: any;
    numberOfLines?: number;
  }
  interface ImageProps {
    style?: any;
    source?: any;
    resizeMode?: string;
  }
  interface ScrollViewProps {
    children?: React.ReactNode;
    style?: any;
  }
  interface TouchableOpacityProps {
    children?: React.ReactNode;
    onPress?: (event?: any) => void;
    style?: any;
  }
  interface FlatListProps<T> {
    data: T[];
    renderItem: ({ item, index }: { item: T; index: number }) => React.ReactElement;
    keyExtractor?: (item: T, index: number) => string;
    style?: any;
    showsVerticalScrollIndicator?: boolean;
  }
  interface TextInputProps {
    style?: any;
    placeholder?: string;
    value?: string;
    onChangeText?: (text: string) => void;
    onSubmitEditing?: () => void;
  }
  interface SwitchProps {
    value?: boolean;
    onValueChange?: (value: boolean) => void;
    trackColor?: { false: string; true: string };
    thumbColor?: string;
  }

  export const View: React.ComponentType<ViewProps>;
  export const Text: React.ComponentType<TextProps>;
  export const Image: React.ComponentType<ImageProps>;
  export const ScrollView: React.ComponentType<ScrollViewProps>;
  export const TouchableOpacity: React.ComponentType<TouchableOpacityProps>;
  export const ActivityIndicator: React.ComponentType<any>;
  export const FlatList: React.ComponentType<FlatListProps<any>>;
  export const TextInput: React.ComponentType<TextInputProps>;
  export const Switch: React.ComponentType<SwitchProps>;
  export const StyleSheet: {
    create: <T extends Record<string, any>>(styles: T) => T;
  };
}
