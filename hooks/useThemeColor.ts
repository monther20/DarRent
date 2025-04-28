/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

type ThemeProps = {
  light?: string;
  dark?: string;
};

type ColorScheme = 'light' | 'dark';

export function useThemeColor(
  props: ThemeProps,
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark,
) {
  const theme = useColorScheme() ?? 'light';
  const colorFromProps = props[theme as ColorScheme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return Colors[theme as ColorScheme][colorName];
  }
}
