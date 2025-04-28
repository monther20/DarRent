import { useState, useEffect } from 'react';
import { Appearance, ColorSchemeName } from 'react-native-appearance';

export const useColorScheme = (): ColorSchemeName => {
  const [colorScheme, setColorScheme] = useState<ColorSchemeName>(Appearance.getColorScheme());

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme: newColorScheme }) => {
      setColorScheme(newColorScheme);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return colorScheme;
};

export default useColorScheme;
