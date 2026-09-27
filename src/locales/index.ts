import enTranslations from './en.json';
import tlTranslations from './tl.json';
import paTranslations from './pa.json';
import frTranslations from './fr.json';

export const en = enTranslations as Record<string, string>;
export const tl = tlTranslations as Record<string, string>;
export const pa = paTranslations as Record<string, string>;
export const fr = frTranslations as Record<string, string>;

export const locales = {
  en,
  tl,
  pa,
  fr,
} as const;

export type SupportedLocale = keyof typeof locales;
export type TranslationKey = keyof typeof enTranslations;

export default en;

