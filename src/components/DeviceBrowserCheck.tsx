import React, { useState, useEffect } from 'react';
import { RotateCw, Smartphone, AlertTriangle, CheckCircle2, X } from 'lucide-react';
import { useAppText } from '../context/TextContentContext';
import { checkBrowserCompatibility, BrowserCompatibilityResult } from '../utils/browserCheck';

interface DeviceBrowserCheckProps {
  onBlockStateChange?: (isBlocking: boolean) => void;
  onAutoSwitchSimplifiedMode?: () => void;
}

export const DeviceBrowserCheck: React.FC<DeviceBrowserCheckProps> = ({
  onBlockStateChange,
  onAutoSwitchSimplifiedMode
}) => {
  const { t } = useAppText();
  const [compat, setCompat] = useState<BrowserCompatibilityResult>(() => checkBrowserCompatibility());
  const [landscapeDismissed, setLandscapeDismissed] = useState<boolean>(() => {
    try {
      return typeof window !== 'undefined' && sessionStorage.getItem('curbside_compass_landscape_dismissed') === 'true';
    } catch {
      return false;
    }
  });
  const [canvasNoticeDismissed, setCanvasNoticeDismissed] = useState<boolean>(false);
  const [storageNoticeDismissed, setStorageNoticeDismissed] = useState<boolean>(false);

  // Initial and dynamic environment check
  useEffect(() => {
    const runCheck = () => {
      const result = checkBrowserCompatibility();
      setCompat(result);

      // Auto-switch to simplified mode if canvas is not supported
      if (!result.hasCanvas && onAutoSwitchSimplifiedMode) {
        onAutoSwitchSimplifiedMode();
      }
    };

    runCheck();

    window.addEventListener('resize', runCheck);
    window.addEventListener('orientationchange', runCheck);

    return () => {
      window.removeEventListener('resize', runCheck);
      window.removeEventListener('orientationchange', runCheck);
    };
  }, [onAutoSwitchSimplifiedMode]);

  const handleDismissLandscape = () => {
    setLandscapeDismissed(true);
    try {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('curbside_compass_landscape_dismissed', 'true');
      }
    } catch {
      // ignore
    }
    onBlockStateChange?.(false);
  };

  // Synchronize blocking state with parent so the start screen / onboarding modal doesn't open over the advisory
  const isLandscapeBlocking = compat.isMobileLandscape && !landscapeDismissed;

  useEffect(() => {
    onBlockStateChange?.(isLandscapeBlocking);
  }, [isLandscapeBlocking, onBlockStateChange]);

  // 1. Mobile Horizontal Landscape Priority Advisory (Blocks start screen until rotated or dismissed)
  if (isLandscapeBlocking) {
    return (
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="rotate-notice-title"
        aria-describedby="rotate-notice-desc"
        className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#002B49]/98 text-white p-3 sm:p-6 backdrop-blur-md select-none animate-in fade-in duration-200 overflow-y-auto"
      >
        <div className="max-w-md w-full flex flex-col items-center text-center my-auto">
          {/* Safe Mobility Logo */}
          <div className="flex items-center gap-2 mb-2 sm:mb-3">
            <img
              src="/SafeMobility_Compass.png"
              alt="SafeMobility Compass"
              className="w-7 h-7 sm:w-8 sm:h-8 object-contain drop-shadow-md"
            />
            <span className="text-xs font-black tracking-widest uppercase text-white/80">
              City of Edmonton · Curbside Compass
            </span>
          </div>

          {/* Animated Phone Rotation Graphic */}
          <div className="relative my-1.5 sm:my-3 flex items-center justify-center w-24 h-24 sm:w-32 sm:h-32">
            <div className="absolute inset-0 rounded-full bg-[#004B8D]/40 border border-[#0081BC]/30 animate-pulse" />

            {/* Rotating Phone Icon with smooth CSS keyframe animation */}
            <div className="relative flex items-center justify-center animate-[rotatePhone_2.6s_ease-in-out_infinite]">
              <Smartphone className="w-14 h-14 sm:w-20 sm:h-20 text-[#FFC72C] drop-shadow-[0_0_12px_rgba(255,199,44,0.4)]" />
            </div>

            {/* Curved rotation indicator badge */}
            <div className="absolute -bottom-1 bg-[#004B8D] border border-[#FFC72C]/40 text-[#FFC72C] text-[10px] font-black px-2 py-0.5 rounded-full shadow-md flex items-center gap-1">
              <RotateCw className="w-3 h-3 animate-spin [animation-duration:3s]" />
              <span>90°</span>
            </div>
          </div>

          {/* Headline */}
          <h2
            id="rotate-notice-title"
            className="text-base sm:text-xl font-black text-white tracking-tight mt-1 mb-1 flex items-center justify-center gap-2"
          >
            <span>{t('rotate_screen_title', 'Please Rotate to Vertical (Portrait)')}</span>
          </h2>

          {/* Instructions Description */}
          <p
            id="rotate-notice-desc"
            className="text-xs sm:text-sm text-blue-100/90 leading-snug max-w-sm mb-3 sm:mb-4 px-2"
          >
            {t(
              'rotate_screen_desc',
              'Curbside Compass is designed for vertical portrait view on mobile phones to experience the live neighborhood simulation and answer survey questions clearly.'
            )}
          </p>

          {/* Action Controls */}
          <div className="flex flex-col sm:flex-row items-center gap-2 w-full max-w-xs justify-center">
            <button
              type="button"
              onClick={handleDismissLandscape}
              className="w-full sm:w-auto text-xs sm:text-sm font-bold text-white bg-white/20 hover:bg-white/30 active:bg-white/40 border-2 border-white/50 py-2 sm:py-2.5 px-4 sm:px-6 rounded-xl cursor-pointer transition-all active:scale-95 shadow-md flex items-center justify-center gap-2 min-h-[44px]"
            >
              <span>{t('rotate_screen_continue_anyway', 'Continue in Horizontal view anyway')}</span>
            </button>
          </div>
        </div>

        {/* Embedded CSS animation for phone rotation */}
        <style>{`
          @keyframes rotatePhone {
            0% {
              transform: rotate(-90deg) scale(0.95);
            }
            35% {
              transform: rotate(-90deg) scale(0.95);
            }
            65% {
              transform: rotate(0deg) scale(1.05);
            }
            85% {
              transform: rotate(0deg) scale(1);
            }
            100% {
              transform: rotate(0deg) scale(1);
            }
          }
        `}</style>
      </div>
    );
  }

  // 2. Non-blocking Browser Capability Fallbacks (Rendered as accessible floating banners if issues are found)
  return (
    <>
      {/* Canvas Unsupported Advisory Banner */}
      {!compat.hasCanvas && !canvasNoticeDismissed && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-2 left-2 right-2 sm:left-auto sm:right-4 z-40 max-w-md bg-amber-500 text-slate-950 p-3 rounded-xl shadow-xl border-2 border-amber-600 flex items-start gap-2.5 animate-in slide-in-from-top-2 duration-200"
        >
          <AlertTriangle className="w-5 h-5 text-slate-950 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs sm:text-sm">
            <strong className="block font-bold">
              {t('compat_canvas_switched_title', 'Accessible Mode Active')}
            </strong>
            <p className="mt-0.5 leading-snug">
              {t(
                'compat_canvas_switched_desc',
                'Your browser does not support 2.5D canvas graphics. Curbside Compass has automatically enabled Accessible Street Summary mode.'
              )}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setCanvasNoticeDismissed(true)}
            className="p-1 text-slate-900 hover:text-black rounded transition-colors cursor-pointer"
            aria-label="Dismiss canvas notice"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Storage Disabled / Private Mode Advisory Banner */}
      {!compat.hasStorage && !storageNoticeDismissed && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-14 left-2 right-2 sm:left-auto sm:right-4 z-40 max-w-md bg-blue-900 text-white p-3 rounded-xl shadow-xl border-2 border-blue-700 flex items-start gap-2.5 animate-in slide-in-from-top-2 duration-200"
        >
          <CheckCircle2 className="w-5 h-5 text-[#FFC72C] shrink-0 mt-0.5" />
          <div className="flex-1 text-xs">
            <strong className="block font-bold text-[#FFC72C]">
              {t('compat_storage_private_title', 'Private Session Active')}
            </strong>
            <p className="mt-0.5 text-blue-100 leading-snug">
              {t(
                'compat_storage_private_desc',
                'Browser storage is disabled. Your responses will be kept during this session, but will not be saved if you refresh or close this tab.'
              )}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setStorageNoticeDismissed(true)}
            className="p-1 text-white/80 hover:text-white rounded transition-colors cursor-pointer"
            aria-label="Dismiss storage notice"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </>
  );
};
