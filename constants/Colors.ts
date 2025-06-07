/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#34568B'; // Primary blue
const tintColorDark = '#E67E22'; // Orange accent

export default {
  light: {
    text: '#2C3E50',
    background: '#F5F7FA',
    tint: tintColorLight,
    tabIconDefault: '#7F8C8D',
    tabIconSelected: tintColorLight,
    card: '#FFFFFF',
    border: '#E0E0E0',
    notification: '#FF3B30',
    primary: '#34568B',
    secondary: '#E67E22',
    accent: '#F39C12',
    success: '#27AE60',
    error: '#E74C3C',
    warning: '#F1C40F',
    info: '#3498DB',
    grey: '#7F8C8D',
    lightGrey: '#ECF0F1',
  },
  dark: {
    text: '#F5F7FA',
    background: '#2C3E50',
    tint: tintColorDark,
    tabIconDefault: '#95A5A6',
    tabIconSelected: tintColorDark,
    card: '#34495E',
    border: '#2C3E50',
    notification: '#FF453A',
    primary: '#3498DB',
    secondary: '#E67E22',
    accent: '#F39C12',
    success: '#2ECC71',
    error: '#E74C3C',
    warning: '#F1C40F',
    info: '#3498DB',
    grey: '#95A5A6',
    lightGrey: '#7F8C8D',
  },
};
