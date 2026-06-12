import { I18n } from 'i18n-js';
import fr from './fr.json';
import en from './en.json';
import type { AppLocale } from './locale';

export const i18n = new I18n({ fr, en });
i18n.enableFallback = true;
i18n.defaultLocale = 'fr';
i18n.locale = 'fr';

/** Forme du dictionnaire (fr fait foi ; en doit être un miroir). */
export type Dictionary = typeof fr;

export const dictionaries: Record<AppLocale, Dictionary> = { fr, en: en as Dictionary };
