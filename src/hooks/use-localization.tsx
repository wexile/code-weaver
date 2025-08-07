
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { translations, appLanguages } from '@/lib/locales';

type Language = keyof typeof translations;
type Translations = typeof translations.en;

interface LocalizationContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: Translations;
}

const LocalizationContext = createContext<LocalizationContextType | undefined>(undefined);

export function LocalizationProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    const storedLang = localStorage.getItem('app-language') as Language | null;
    const browserLang = typeof window !== 'undefined' ? window.navigator.language.split('-')[0] as Language : 'en';

    let initialLang: Language = 'en';
    if (storedLang && translations[storedLang]) {
        initialLang = storedLang;
    } else if (translations[browserLang]) {
        initialLang = browserLang;
    }

    setLanguageState(initialLang);
  }, []);

  const setLanguage = (newLanguage: Language) => {
    if (translations[newLanguage]) {
        setLanguageState(newLanguage);
        localStorage.setItem('app-language', newLanguage);
    }
  };

  const t = translations[language];

  return (
    <LocalizationContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LocalizationContext.Provider>
  );
}

export function useLocalization() {
  const context = useContext(LocalizationContext);
  if (context === undefined) {
    throw new Error('useLocalization must be used within a LocalizationProvider');
  }
  return context;
}
