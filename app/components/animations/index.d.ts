import { ViewStyle } from 'react-native';

export interface LoaderProps {
  style?: ViewStyle;
  size?: number;
}

export interface EmptyStateProps {
  style?: ViewStyle;
  message?: string;
  animationSize?: number;
  type?: 'noData' | 'noResults' | 'noSaved';
}

export interface SuccessAnimationProps {
  style?: ViewStyle;
  message?: string;
  onAnimationFinish?: () => void;
  size?: number;
}

export declare const Loader: React.FC<LoaderProps>;
export declare const EmptyState: React.FC<EmptyStateProps>;
export declare const SuccessAnimation: React.FC<SuccessAnimationProps>;
