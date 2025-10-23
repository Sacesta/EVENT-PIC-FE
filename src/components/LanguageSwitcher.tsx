import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'he', name: 'עברית', flag: '🇮🇱' }
];

export const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (languageCode: string) => {
    console.log('🔀 Switching language to:', languageCode);
    i18n.changeLanguage(languageCode);

    // Update document direction for RTL languages
    const direction = languageCode === 'he' ? 'rtl' : 'ltr';
    console.log('🎯 Setting direction to:', direction, 'for language:', languageCode);
    document.documentElement.dir = direction;
    document.documentElement.lang = languageCode;

    // Persist direction preference
    localStorage.setItem('app-direction', direction);
    localStorage.setItem('app-language', languageCode);
    console.log('💾 Saved to localStorage - direction:', direction, 'language:', languageCode);
  };

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];
  
  // Get the next language to switch to
  const nextLanguage = languages.find(lang => lang.code !== i18n.language) || languages[0];

  const handleLanguageSwitch = () => {
    changeLanguage(nextLanguage.code);
  };

  return (
    <button
      aria-label={`Switch to ${nextLanguage.name}`}
      onClick={handleLanguageSwitch}
      className="p-2 rounded-lg transition-colors bg-muted hover:bg-muted/80 flex items-center gap-2"
      title={`Switch to ${nextLanguage.name}`}
    >
      <Globe className="w-4 h-4" />
      <span className="text-sm font-medium hidden sm:inline">
        {nextLanguage.flag}
      </span>
    </button>
  );
};