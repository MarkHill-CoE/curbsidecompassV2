/**
 * Device and Browser Compatibility Verification Utility
 * Checks canvas support, storage support, and mobile device orientation
 * before displaying the start screen or launching the simulation.
 */

export interface BrowserCompatibilityResult {
  hasCanvas: boolean;
  hasStorage: boolean;
  isMobileLandscape: boolean;
  isTouchDevice: boolean;
  viewportWidth: number;
  viewportHeight: number;
}

export function checkBrowserCompatibility(): BrowserCompatibilityResult {
  let hasCanvas = false;
  try {
    if (typeof document !== 'undefined') {
      const canvas = document.createElement('canvas');
      hasCanvas = Boolean(canvas && canvas.getContext && canvas.getContext('2d'));
    }
  } catch {
    hasCanvas = false;
  }

  let hasStorage = false;
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const testKey = '__cc_compat_test__';
      window.localStorage.setItem(testKey, '1');
      window.localStorage.removeItem(testKey);
      hasStorage = true;
    }
  } catch {
    hasStorage = false;
  }

  const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1024;
  const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 768;
  const isTouchDevice = typeof window !== 'undefined' 
    ? ('ontouchstart' in window || (typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0)) 
    : false;
  const isLandscape = viewportWidth > viewportHeight;
  const isShortHeight = viewportHeight <= 550;
  const isMobileLandscape = isLandscape && (isShortHeight || (isTouchDevice && viewportWidth <= 960 && viewportHeight <= 600));

  return {
    hasCanvas,
    hasStorage,
    isMobileLandscape,
    isTouchDevice,
    viewportWidth,
    viewportHeight
  };
}

// In-memory fallback for private browsing or restricted environments where localStorage throws SecurityError
const memoryStore = new Map<string, string>();

export const safeStorage = {
  getItem: (key: string): string | null => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(key);
      }
    } catch {
      // Fall through to memoryStore
    }
    return memoryStore.get(key) || null;
  },

  setItem: (key: string, value: string): void => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
        return;
      }
    } catch {
      // Fall through to memoryStore
    }
    memoryStore.set(key, value);
  },

  removeItem: (key: string): void => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
        return;
      }
    } catch {
      // Fall through to memoryStore
    }
    memoryStore.delete(key);
  }
};
