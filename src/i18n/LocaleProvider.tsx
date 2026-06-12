import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { i18n, dictionaries, type Dictionary } from './i18n';
import { getStoredLocale, setStoredLocale, type AppLocale } from './locale';

interface LocaleContextValue {
  locale: AppLocale;
  setLocale: (locale: AppLocale) => void;
  /** Traduit une clé plate (avec interpolation %{var}). */
  t: (key: string, options?: Record<string, unknown>) => string;
  /** Dictionnaire de la langue active, pour le contenu structuré (listes). */
  dict: Dictionary;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<AppLocale>('fr');

  useEffect(() => {
    getStoredLocale().then((stored) => {
      i18n.locale = stored;
      setLocaleState(stored);
    });
  }, []);

  const setLocale = useCallback((next: AppLocale) => {
    i18n.locale = next;
    setLocaleState(next);
    void setStoredLocale(next);
  }, []);

  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      setLocale,
      t: (key, options) => i18n.t(key, options),
      dict: dictionaries[locale],
    }),
    [locale, setLocale]
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useT(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error('useT doit être utilisé dans LocaleProvider');
  return ctx;
}
