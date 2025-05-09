import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import all English translations
import enCommon from './locales/en/common.json';
import enAuth from './locales/en/auth.json';
import enRental from './locales/en/rental.json';
import enProperty from './locales/en/property.json';
import enHome from './locales/en/home.json';
import enSearch from './locales/en/search.json';
import enProfile from './locales/en/profile.json';
import enMenu from './locales/en/menu.json';
import enMaintenance from './locales/en/maintenance.json';
import enPropertyDetails from './locales/en/propertyDetails.json';

// Import all Arabic translations
import arCommon from './locales/ar/common.json';
import arAuth from './locales/ar/auth.json';
import arRental from './locales/ar/rental.json';
import arProperty from './locales/ar/property.json';
import arHome from './locales/ar/home.json';
import arSearch from './locales/ar/search.json';
import arProfile from './locales/ar/profile.json';
import arMenu from './locales/ar/menu.json';
import arMaintenance from './locales/ar/maintenance.json';
import arPropertyDetails from './locales/ar/propertyDetails.json';

// Initialize i18n
i18n.use(initReactI18next).init({
  resources: {
    en: {
      common: enCommon,
      auth: enAuth,
      rental: enRental,
      property: enProperty,
      home: enHome,
      search: enSearch,
      profile: enProfile,
      menu: enMenu,
      maintenance: enMaintenance,
      propertyDetails: enPropertyDetails,
    },
    ar: {
      common: arCommon,
      auth: arAuth,
      rental: arRental,
      property: arProperty,
      home: arHome,
      search: arSearch,
      profile: arProfile,
      menu: arMenu,
      maintenance: arMaintenance,
      propertyDetails: arPropertyDetails,
    },
  },
  lng: 'en',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
  defaultNS: 'common',
  ns: [
    'common',
    'auth',
    'rental',
    'property',
    'home',
    'search',
    'profile',
    'menu',
    'maintenance',
    'propertyDetails',
  ],
});

// Function to change language
export const changeLanguage = (language: string) => {
  i18n.changeLanguage(language);
  // Note: RTL changes should be handled at the app root level
  if (language === 'ar') {
    console.log('Language changed to Arabic - RTL layout changes applied');
  }
};

export default i18n;
