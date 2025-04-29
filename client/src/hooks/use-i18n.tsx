import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import enTranslations from '@/translations/en';
import arTranslations from '@/translations/ar';

type TranslationsType = typeof enTranslations;
type LanguageType = 'en' | 'ar';

type I18nContextType = {
  t: (key: string, params?: Record<string, string | number>) => string;
  language: LanguageType;
  setLanguage: (lang: LanguageType) => void;
  isRtl: boolean;
};

const I18nContext = createContext<I18nContextType | null>(null);

export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<LanguageType>('en');
  const [translations, setTranslations] = useState<TranslationsType>(enTranslations);
  const [isRtl, setIsRtl] = useState(false);

  useEffect(() => {
    // Set translations based on selected language
    if (language === 'ar') {
      setTranslations(arTranslations);
      setIsRtl(true);
      document.documentElement.setAttribute('dir', 'rtl');
    } else {
      setTranslations(enTranslations);
      setIsRtl(false);
      document.documentElement.setAttribute('dir', 'ltr');
    }
  }, [language]);

  const t = (key: string, params?: Record<string, string | number>): string => {
    const keys = key.split('.');
    let result: any = translations;

    for (const k of keys) {
      if (!result[k]) {
        console.warn(`Translation key "${key}" not found.`);
        return key;
      }
      result = result[k];
    }

    if (typeof result !== 'string') {
      console.warn(`Translation key "${key}" is not a string.`);
      return key;
    }

    if (params) {
      return Object.entries(params).reduce((str, [key, value]) => {
        return str.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value));
      }, result);
    }

    return result;
  };

  return (
    <I18nContext.Provider value={{ t, language, setLanguage, isRtl }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};
