import * as SecureStore from 'expo-secure-store';
import { getLocales } from 'expo-localization';

export type AppLocale = 'fr' | 'en';

const STORAGE_KEY = 'app_locale';

/** Langue de l'appareil, repliée sur le français (langue par défaut du produit). */
export function deviceLocale(): AppLocale {
  return getLocales()[0]?.languageCode === 'en' ? 'en' : 'fr';
}

/** Langue choisie par l'utilisateur, ou celle de l'appareil si aucun choix. */
export async function getStoredLocale(): Promise<AppLocale> {
  const value = await SecureStore.getItemAsync(STORAGE_KEY);
  return value === 'en' || value === 'fr' ? value : deviceLocale();
}

export async function setStoredLocale(locale: AppLocale): Promise<void> {
  await SecureStore.setItemAsync(STORAGE_KEY, locale);
}
