import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en.json';
import he from './locales/he.json';

const resources = {
  en: {
    translation: en
  },
  he: {
    translation: he
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: false,
    interpolation: {
      escapeValue: false
    },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage']
    }
  })
  .then(() => {
    // Set document direction based on detected language
    const currentLang = i18n.language;
    console.log('🌐 i18n initialized with language:', currentLang);
    if (currentLang === 'he') {
      document.documentElement.dir = 'rtl';
      document.documentElement.lang = 'he';
      console.log('✅ Set direction to RTL for Hebrew');
    } else {
      document.documentElement.dir = 'ltr';
      document.documentElement.lang = 'en';
      console.log('✅ Set direction to LTR for English');
    }
  });

// Listen for language changes and update direction
i18n.on('languageChanged', (lng) => {
  console.log('🔄 Language changed to:', lng);
  if (lng === 'he') {
    document.documentElement.dir = 'rtl';
    document.documentElement.lang = 'he';
    console.log('✅ Direction changed to RTL for Hebrew');
  } else {
    document.documentElement.dir = 'ltr';
    document.documentElement.lang = 'en';
    console.log('✅ Direction changed to LTR for English');
  }
});

export default i18n;
