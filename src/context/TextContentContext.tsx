import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import enTranslations from '../locales/en.json';
import tlTranslations from '../locales/tl.json';
import paTranslations from '../locales/pa.json';
import frTranslations from '../locales/fr.json';
import {
  getActiveSheetUrl,
  setActiveSheetUrl,
  getCachedTexts,
  applyTextsToData,
  fetchAndSyncTexts,
  syncFromCsvText,
  saveCachedTexts,
  clearCachedTexts
} from '../utils/textSync';

const defaultEnglish = enTranslations as Record<string, string>;
const defaultTagalog = tlTranslations as Record<string, string>;
const defaultPunjabi = paTranslations as Record<string, string>;
const defaultFrench = frTranslations as Record<string, string>;

export type SupportedLocale = 'en' | 'tl' | 'pa' | 'fr';

export interface LanguageDetectionResult {
  matched: SupportedLocale;
  source: 'url' | 'navigator_languages' | 'navigator_language' | 'document' | 'fallback';
  rawCandidate: string;
}

export type BrowserLocaleMatch = LanguageDetectionResult;

/**
 * Match a raw candidate language string to one of the 4 supported languages:
 * English ('en'), French ('fr'), Tagalog ('tl'), Punjabi ('pa').
 */
export function matchSupportedLanguage(candidate: string | null | undefined): SupportedLocale | null {
  if (!candidate || typeof candidate !== 'string') return null;
  const clean = candidate.trim().toLowerCase();
  if (!clean) return null;

  // Canadian French / French:
  // Match 'fr', 'fr-CA', 'fr-FR', 'fra', 'fre', 'french', 'francais', 'français'
  if (
    clean === 'fr' ||
    clean.startsWith('fr-') ||
    clean.startsWith('fr_') ||
    clean === 'fra' ||
    clean === 'fre' ||
    clean === 'french' ||
    clean === 'francais' ||
    clean === 'français'
  ) {
    return 'fr';
  }

  // Tagalog / Filipino:
  // Match 'tl', 'tl-PH', 'fil', 'fil-PH', 'tgl', 'tagalog', 'filipino', 'pilipino'
  if (
    clean === 'tl' ||
    clean.startsWith('tl-') ||
    clean.startsWith('tl_') ||
    clean === 'fil' ||
    clean.startsWith('fil-') ||
    clean.startsWith('fil_') ||
    clean === 'tgl' ||
    clean === 'tagalog' ||
    clean === 'filipino' ||
    clean === 'pilipino'
  ) {
    return 'tl';
  }

  // Punjabi:
  // Match 'pa', 'pa-IN', 'pa-PK', 'pa-Guru', 'pa-Arab', 'pan', 'punjabi', 'panjabi', 'gurmukhi'
  if (
    clean === 'pa' ||
    clean.startsWith('pa-') ||
    clean.startsWith('pa_') ||
    clean === 'pan' ||
    clean.startsWith('pan-') ||
    clean.startsWith('pan_') ||
    clean === 'punjabi' ||
    clean === 'panjabi' ||
    clean === 'gurmukhi'
  ) {
    return 'pa';
  }

  // English:
  // Match 'en', 'en-CA', 'en-US', 'en-GB', 'eng', 'english'
  if (
    clean === 'en' ||
    clean.startsWith('en-') ||
    clean.startsWith('en_') ||
    clean === 'eng' ||
    clean === 'english'
  ) {
    return 'en';
  }

  return null;
}

/**
 * Checks if a candidate language string matches French ('fr'), Tagalog ('tl'), or Punjabi ('pa').
 */
export function matchSpecialLanguage(candidate: string | null | undefined): 'fr' | 'tl' | 'pa' | null {
  if (!candidate || typeof candidate !== 'string') return null;
  const clean = candidate.trim().toLowerCase();
  const primary = clean.split('-')[0].split('_')[0];

  // French (Canadian French / Français)
  if (
    primary === 'fr' ||
    clean.startsWith('fr-') ||
    clean.startsWith('fr_') ||
    clean === 'fra' ||
    clean === 'fre' ||
    clean === 'french' ||
    clean === 'francais' ||
    clean === 'français'
  ) {
    return 'fr';
  }

  // Tagalog / Filipino
  if (
    primary === 'tl' ||
    primary === 'fil' ||
    clean.startsWith('tl-') ||
    clean.startsWith('tl_') ||
    clean.startsWith('fil-') ||
    clean.startsWith('fil_') ||
    clean === 'tgl' ||
    clean === 'tagalog' ||
    clean === 'filipino' ||
    clean === 'pilipino'
  ) {
    return 'tl';
  }

  // Punjabi (Gurmukhi)
  if (
    primary === 'pa' ||
    primary === 'pan' ||
    clean.startsWith('pa-') ||
    clean.startsWith('pa_') ||
    clean.startsWith('pan-') ||
    clean.startsWith('pan_') ||
    clean === 'punjabi' ||
    clean === 'panjabi' ||
    clean === 'gurmukhi'
  ) {
    return 'pa';
  }

  return null;
}

/**
 * Inspects browser language preferences in order of user preference.
 * Returns 'fr', 'pa', 'tl' if the browser preference is French, Punjabi, or Tagalog.
 * If English is preferred or no special language is found, returns null (to default to English).
 */
export function getBrowserSpecialLanguagePreference(): 'fr' | 'tl' | 'pa' | null {
  if (typeof navigator === 'undefined') return null;

  const candidateList: string[] = [];
  if (Array.isArray(navigator.languages) && navigator.languages.length > 0) {
    candidateList.push(...navigator.languages);
  }
  if (navigator.language) {
    candidateList.push(navigator.language);
  }

  const legacyNav = navigator as unknown as { userLanguage?: string; browserLanguage?: string };
  if (legacyNav.userLanguage) candidateList.push(legacyNav.userLanguage);
  if (legacyNav.browserLanguage) candidateList.push(legacyNav.browserLanguage);

  for (const raw of candidateList) {
    if (!raw || typeof raw !== 'string') continue;
    const clean = raw.trim().toLowerCase();
    const primary = clean.split('-')[0].split('_')[0];

    // If English is encountered first in user's browser preferences, they prefer English
    if (primary === 'en' || clean.startsWith('en-') || clean === 'eng' || clean === 'english') {
      return null;
    }

    const special = matchSpecialLanguage(raw);
    if (special) {
      return special;
    }
  }

  return null;
}

/**
 * Determines the active app language:
 * Defaults to English ('en') UNLESS the user's browser language preference is French, Punjabi, or Tagalog.
 * Also supports optional URL parameter override (?lang=fr, ?lang=pa, ?lang=tl, ?lang=en) for direct sharing or testing.
 */
export function detectMatchingLanguage(): LanguageDetectionResult {
  // 1. Check URL query parameters (?lang=..., ?locale=...) for explicit links or testing
  if (typeof window !== 'undefined' && window.location) {
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const urlCandidate = searchParams.get('lang') || searchParams.get('locale') || searchParams.get('language');
      if (urlCandidate) {
        const special = matchSpecialLanguage(urlCandidate);
        if (special) {
          return { matched: special, source: 'url', rawCandidate: urlCandidate };
        }
        if (urlCandidate.toLowerCase().startsWith('en')) {
          return { matched: 'en', source: 'url', rawCandidate: urlCandidate };
        }
      }
    } catch {
      // ignore URL parsing error
    }
  }

  // 2. Check browser preference language (French, Punjabi, Tagalog)
  const browserSpecial = getBrowserSpecialLanguagePreference();
  if (browserSpecial) {
    return {
      matched: browserSpecial,
      source: 'navigator_languages',
      rawCandidate: typeof navigator !== 'undefined' ? (navigator.language || 'browser') : 'browser'
    };
  }

  // 3. App default: English
  return { matched: 'en', source: 'fallback', rawCandidate: 'default:en' };
}

export const detectBrowserLanguage = detectMatchingLanguage;

interface TextContentContextValue {
  t: (key: string, fallback?: string) => string;
  language: SupportedLocale;
  setLanguage: (lang: SupportedLocale, isManual?: boolean) => void;
  browserMatch: BrowserLocaleMatch | null;
  isBrowserMatched: boolean;
  isManualOverride: boolean;
  resetToBrowserLanguage: () => void;
  sheetUrl: string;
  setSheetUrl: (url: string) => void;
  syncStatus: 'idle' | 'loading' | 'synced' | 'error';
  itemCount: number;
  lastSynced: string | null;
  errorMessage: string | null;
  syncNow: (customUrl?: string) => Promise<boolean>;
  applyDirectCsv: (csvContent: string) => boolean;
  resetToDefaults: () => void;
  isCustomActive: boolean;
  customTexts: Record<string, string>;
  updateTextItem: (key: string, newText: string) => void;
  updateMultipleTexts: (updatedMap: Record<string, string>) => void;
}

const TextContentContext = createContext<TextContentContextValue | undefined>(undefined);

export const TextContentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [texts, setTexts] = useState<Record<string, string>>(() => {
    const cached = getCachedTexts();
    if (Object.keys(cached).length > 0) {
      applyTextsToData(cached);
    }
    return cached;
  });

  const [sheetUrl, setSheetUrlState] = useState<string>(() => getActiveSheetUrl());
  const [syncStatus, setSyncStatus] = useState<'idle' | 'loading' | 'synced' | 'error'>('idle');
  const [itemCount, setItemCount] = useState<number>(() => Object.keys(texts).length);
  const [lastSynced, setLastSynced] = useState<string | null>(() => {
    try {
      return localStorage.getItem('curbside_compass_last_sync_time');
    } catch {
      return null;
    }
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const setSheetUrl = useCallback((url: string) => {
    setSheetUrlState(url);
    setActiveSheetUrl(url);
  }, []);

  const syncNow = useCallback(async (customUrl?: string): Promise<boolean> => {
    const target = (customUrl !== undefined ? customUrl : sheetUrl).trim();
    if (customUrl !== undefined) {
      setSheetUrl(customUrl);
    }

    if (!target) {
      setErrorMessage('Please provide a Google Sheets URL or CSV endpoint');
      setSyncStatus('error');
      return false;
    }

    setSyncStatus('loading');
    setErrorMessage(null);

    const result = await fetchAndSyncTexts(target);

    if (result.success) {
      setTexts(result.texts);
      setItemCount(result.itemCount);
      setSyncStatus('synced');
      const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setLastSynced(now);
      return true;
    } else {
      setSyncStatus('error');
      setErrorMessage(result.error || 'Failed to sync with spreadsheet');
      return false;
    }
  }, [sheetUrl, setSheetUrl]);

  const applyDirectCsv = useCallback((csvContent: string): boolean => {
    setSyncStatus('loading');
    setErrorMessage(null);

    const result = syncFromCsvText(csvContent);
    if (result.success) {
      applyTextsToData(result.texts);
      saveCachedTexts(result.texts);
      setTexts(result.texts);
      setItemCount(result.itemCount);
      setSyncStatus('synced');
      const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setLastSynced(now);
      return true;
    } else {
      setSyncStatus('error');
      setErrorMessage(result.error || 'Failed to parse CSV text');
      return false;
    }
  }, []);

  const updateTextItem = useCallback((key: string, newText: string) => {
    setTexts((prev) => {
      const updated = { ...prev };
      if (newText.trim() === '') {
        delete updated[key];
      } else {
        updated[key] = newText;
      }
      applyTextsToData(updated);
      saveCachedTexts(updated);
      setItemCount(Object.keys(updated).length);
      const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setLastSynced(now);
      setSyncStatus('synced');
      return updated;
    });
  }, []);

  const updateMultipleTexts = useCallback((updatedMap: Record<string, string>) => {
    setTexts((prev) => {
      const updated = { ...prev, ...updatedMap };
      applyTextsToData(updated);
      saveCachedTexts(updated);
      setItemCount(Object.keys(updated).length);
      const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setLastSynced(now);
      setSyncStatus('synced');
      return updated;
    });
  }, []);

  const resetToDefaults = useCallback(() => {
    clearCachedTexts();
    setTexts({});
    setItemCount(0);
    setSyncStatus('idle');
    setLastSynced(null);
    setErrorMessage(null);
  }, []);

  // Initial load: fetch live text from active sheet URL
  useEffect(() => {
    const activeUrl = getActiveSheetUrl();
    if (activeUrl) {
      setSheetUrlState(activeUrl);
      setSyncStatus('loading');
      fetchAndSyncTexts(activeUrl)
        .then((res) => {
          if (res.success) {
            setTexts(res.texts);
            setItemCount(res.itemCount);
            setSyncStatus('synced');
            const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            setLastSynced(nowTime);
            try {
              localStorage.setItem('curbside_compass_last_sync_time', nowTime);
            } catch {
              // ignore
            }
          } else {
            setSyncStatus('idle');
            if (res.error) {
              setErrorMessage(res.error);
            }
          }
        })
        .catch(() => {
          setSyncStatus('idle');
        });
    }
  }, []);

  const [browserMatch, setBrowserMatch] = useState<BrowserLocaleMatch>(() => detectMatchingLanguage());
  const [isManualOverride, setIsManualOverride] = useState<boolean>(false);

  const [language, setLanguageState] = useState<SupportedLocale>(() => {
    // Default to English unless browser preference is French, Punjabi, or Tagalog (or specified via URL param)
    const detected = detectMatchingLanguage();
    return detected.matched;
  });

  // Sync document HTML lang attribute whenever language changes
  useEffect(() => {
    if (typeof document !== 'undefined' && document.documentElement) {
      document.documentElement.lang = language;
    }
  }, [language]);

  // Listen to browser language preference changes (e.g., user changes language settings in browser)
  useEffect(() => {
    const handleEnvironmentLanguageChange = () => {
      const detected = detectMatchingLanguage();
      setBrowserMatch(detected);
      setLanguageState(detected.matched);
    };

    window.addEventListener('languagechange', handleEnvironmentLanguageChange);
    window.addEventListener('popstate', handleEnvironmentLanguageChange);
    return () => {
      window.removeEventListener('languagechange', handleEnvironmentLanguageChange);
      window.removeEventListener('popstate', handleEnvironmentLanguageChange);
    };
  }, []);

  const setLanguage = useCallback((lang: SupportedLocale, isManual = true) => {
    setLanguageState(lang);
    if (isManual) {
      setIsManualOverride(true);
      try {
        localStorage.setItem('curbside_compass_language', lang);
      } catch {
        // ignore
      }
    }
  }, []);

  const resetToBrowserLanguage = useCallback(() => {
    try {
      localStorage.removeItem('curbside_compass_language');
    } catch {
      // ignore
    }
    setIsManualOverride(false);
    const detected = detectMatchingLanguage();
    setBrowserMatch(detected);
    setLanguageState(detected.matched);
  }, []);

  const isBrowserMatched = Boolean(
    browserMatch && browserMatch.matched === language
  );

  const t = useCallback((key: string, fallback?: string): string => {
    // When using a non-English locale, the corresponding locale JSON takes precedence
    if (language === 'fr') {
      if (defaultFrench[key] !== undefined && defaultFrench[key].trim() !== '') {
        return defaultFrench[key];
      }
    }
    if (language === 'tl') {
      if (defaultTagalog[key] !== undefined && defaultTagalog[key].trim() !== '') {
        return defaultTagalog[key];
      }
    }
    if (language === 'pa') {
      if (defaultPunjabi[key] !== undefined && defaultPunjabi[key].trim() !== '') {
        return defaultPunjabi[key];
      }
    }
    // For English or fallback, custom synced spreadsheet texts take precedence over default English
    if (texts[key] !== undefined && texts[key].trim() !== '') {
      return texts[key];
    }
    if (defaultEnglish[key] !== undefined && defaultEnglish[key].trim() !== '') {
      return defaultEnglish[key];
    }
    return fallback !== undefined ? fallback : key;
  }, [texts, language]);

  const isCustomActive = Boolean(itemCount > 0);

  const value = useMemo<TextContentContextValue>(() => ({
    t,
    language,
    setLanguage,
    browserMatch,
    isBrowserMatched,
    isManualOverride,
    resetToBrowserLanguage,
    sheetUrl,
    setSheetUrl,
    syncStatus,
    itemCount,
    lastSynced,
    errorMessage,
    syncNow,
    applyDirectCsv,
    resetToDefaults,
    isCustomActive,
    customTexts: texts,
    updateTextItem,
    updateMultipleTexts
  }), [
    t,
    language,
    setLanguage,
    browserMatch,
    isBrowserMatched,
    isManualOverride,
    resetToBrowserLanguage,
    sheetUrl,
    setSheetUrl,
    syncStatus,
    itemCount,
    lastSynced,
    errorMessage,
    syncNow,
    applyDirectCsv,
    resetToDefaults,
    isCustomActive,
    texts,
    updateTextItem,
    updateMultipleTexts
  ]);

  return (
    <TextContentContext.Provider value={value}>
      {children}
    </TextContentContext.Provider>
  );
};

export const useAppText = (): TextContentContextValue => {
  const context = useContext(TextContentContext);
  if (!context) {
    throw new Error('useAppText must be used within a TextContentProvider');
  }
  return context;
};
