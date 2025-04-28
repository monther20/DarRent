import React from 'react';
import { View, Text } from 'react-native';
import { useSettings } from '../context/SettingsContext';
import { useTranslation } from 'react-i18next';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import SliderComponent from '@react-native-community/slider';

const Slider = SliderComponent as React.ComponentType<any>;

const TextSizeScreen = () => {
  const { t } = useTranslation();
  const { textSize, setTextSize } = useSettings();
  const router = useRouter();

  const handleTextSizeChange = async (value: number) => {
    await setTextSize(value);
  };

  return (
    <View className="flex-1 bg-white dark:bg-gray-900 p-4">
      <View className="mb-8">
        <Text className="text-lg font-medium text-gray-800 dark:text-gray-100 mb-2">
          {t('settings.textSize')}
        </Text>
        <Text className="text-sm text-gray-500 dark:text-gray-400">
          {t('settings.textSizeDescription')}
        </Text>
      </View>

      <View className="flex-row items-center justify-between mb-4">
        <MaterialIcons name="format-size" size={24} className="text-gray-600 dark:text-gray-300" />
        <Slider
          style={{ flex: 1, marginHorizontal: 16 }}
          minimumValue={0.8}
          maximumValue={1.2}
          step={0.1}
          value={textSize}
          onValueChange={handleTextSizeChange}
          minimumTrackTintColor="#34568B"
          maximumTrackTintColor="#d1d5db"
          thumbTintColor="#34568B"
        />
        <Text className="text-base text-gray-800 dark:text-gray-100">
          {Math.round(textSize * 100)}%
        </Text>
      </View>

      <View className="mt-8">
        <Text className="text-base text-gray-800 dark:text-gray-100 mb-2">
          {t('settings.preview')}
        </Text>
        <View className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <Text style={{ fontSize: 16 * textSize }} className="text-gray-800 dark:text-gray-100">
            {t('settings.previewText')}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default TextSizeScreen;
