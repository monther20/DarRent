import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Localization resources
import enTranslation from './en.json';
import arTranslation from './ar.json';

// Initialize i18n
i18n.use(initReactI18next).init({
  resources: {
    en: {
      translation: enTranslation,
    },
    ar: {
      translation: arTranslation,
    },
  },
  lng: 'en',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

// Function to change language
export const changeLanguage = (language: string) => {
  i18n.changeLanguage(language);
  // Note: RTL changes should be handled at the app root level
  if (language === 'ar') {
    console.warn('Language changed to Arabic - RTL layout changes may require app restart');
  }
};

export default i18n;
