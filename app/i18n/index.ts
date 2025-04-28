import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enMaintenance from './locales/en/maintenance.json';
import arMaintenance from './locales/ar/maintenance.json';

const resources = {
  en: {
    maintenance: enMaintenance,
  },
  ar: {
    maintenance: arMaintenance,
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: 'en', // default language
  fallbackLng: 'en',
  defaultNS: 'maintenance',
  ns: ['maintenance'],
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
