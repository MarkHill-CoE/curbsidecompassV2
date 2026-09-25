import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  getActiveSheetUrl,
  setActiveSheetUrl,
  getCachedTexts,
  applyTextsToData,
  fetchAndSyncTexts,
  syncFromCsvText,
  clearCachedTexts
} from '../utils/textSync';

interface TextContentContextValue {
  t: (key: string, fallback: string) => string;
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

  const resetToDefaults = useCallback(() => {
    clearCachedTexts();
    setTexts({});
    setItemCount(0);
    setSyncStatus('idle');
    setLastSynced(null);
    setErrorMessage(null);
    const defaultUrl = getActiveSheetUrl();
    setSheetUrlState(defaultUrl);
    // Fetch default URL texts
    if (defaultUrl) {
      setSyncStatus('loading');
      fetchAndSyncTexts(defaultUrl).then((res) => {
        if (res.success) {
          setTexts(res.texts);
          setItemCount(res.itemCount);
          setSyncStatus('synced');
        }
      });
    }
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

  const t = useCallback((key: string, fallback: string): string => {
    if (texts[key] !== undefined && texts[key].trim() !== '') {
      return texts[key];
    }
    return fallback;
  }, [texts]);

  const isCustomActive = Boolean(itemCount > 0);

  const value = useMemo<TextContentContextValue>(() => ({
    t,
    sheetUrl,
    setSheetUrl,
    syncStatus,
    itemCount,
    lastSynced,
    errorMessage,
    syncNow,
    applyDirectCsv,
    resetToDefaults,
    isCustomActive
  }), [
    t,
    sheetUrl,
    setSheetUrl,
    syncStatus,
    itemCount,
    lastSynced,
    errorMessage,
    syncNow,
    applyDirectCsv,
    resetToDefaults,
    isCustomActive
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
