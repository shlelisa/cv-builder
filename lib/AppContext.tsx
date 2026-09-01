'use client';

import React, { createContext, useCallback, useContext, useEffect, useState, useSyncExternalStore } from 'react';
import { LanguageCode } from '@/types';
import { getTranslation, Translations } from '@/lib/translations';

type Theme = 'light' | 'dark';

interface AppContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: Translations;
  theme: Theme;
  toggleTheme: () => void;
}

const AppContext = createContext<AppContextType>({
  language: 'en',
  setLanguage: () => {},
  t: getTranslation('en'),
  theme: 'light',
  toggleTheme: () => {},
});

export const useApp = () => useContext(AppContext);

const LANGUAGE_STORAGE_KEY = 'cv-builder-language';
const THEME_STORAGE_KEY = 'cv-builder-theme';

function readStoredValue<T extends string>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const value = localStorage.getItem(key);
    return value ? (value as T) : fallback;
  } catch {
    return fallback;
  }
}

function noopSubscribe() {
  return () => {};
}

function useStored<T extends string>(key: string, fallback: T) {
  const [version, setVersion] = useState(0);

  const getSnapshot = useCallback(() => {
    void version;
    return readStoredValue<T>(key, fallback);
  }, [key, fallback, version]);

  const getServerSnapshot = useCallback(() => fallback, [fallback]);

  const value = useSyncExternalStore(noopSubscribe, getSnapshot, getServerSnapshot);

  const setValue = useCallback(
    (v: T) => {
      try {
        localStorage.setItem(key, v);
      } catch {
        // storage unavailable
      }
      setVersion((x) => x + 1);
    },
    [key]
  );

  return [value, setValue] as const;
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setStoredLanguage] = useStored<LanguageCode>(LANGUAGE_STORAGE_KEY, 'en');
  const [theme, setStoredTheme] = useStored<Theme>(THEME_STORAGE_KEY, 'light');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const setLanguage = (lang: LanguageCode) => {
    setStoredLanguage(lang);
  };

  const toggleTheme = () => {
    setStoredTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        t: getTranslation(language),
        theme,
        toggleTheme,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};