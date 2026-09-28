import React, { useState, useEffect } from 'react';
import { RotateCw, Smartphone, ArrowRight } from 'lucide-react';
import { useAppText } from '../context/TextContentContext';

interface RotateDeviceNoticeProps {
  onDismissOverride?: () => void;
}

export const RotateDeviceNotice: React.FC<RotateDeviceNoticeProps> = ({ onDismissOverride }) => {
  const { t } = useAppText();
  const [isLandscapeMobile, setIsLandscapeMobile] = useState<boolean>(false);
  const [dismissed, setDismissed] = useState<boolean>(false);

  useEffect(() => {
    // Check if the current viewport is a mobile landscape screen (landscape orientation with height <= 540px)
    const checkOrientation = () => {
      const isLandscape = window.innerWidth > window.innerHeight;
      const isShortHeight = window.innerHeight <= 550;
      // Primary check: landscape + short vertical height typical of phones held horizontally
      const match = isLandscape && isShortHeight;
      setIsLandscapeMobile(match);

      // Reset dismissed state whenever user rotates back to portrait, so rotating to landscape prompts again
      if (!isLandscape) {
        setDismissed(false);
      }
    };

    checkOrientation();

    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  if (!isLandscapeMobile || dismissed) {
    return null;
  }

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="rotate-notice-title"
      aria-describedby="rotate-notice-desc"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#002B49]/98 text-white p-4 sm:p-6 backdrop-blur-md select-none animate-in fade-in duration-200"
    >
      <div className="max-w-md w-full flex flex-col items-center text-center">
        {/* Safe Mobility Logo */}
        <div className="flex items-center gap-2 mb-3">
          <img
            src="/SafeMobility_Compass.png"
            alt="SafeMobility Compass"
            className="w-8 h-8 object-contain drop-shadow-md"
          />
          <span className="text-xs font-black tracking-widest uppercase text-white/80">
            City of Edmonton · Curbside Compass
          </span>
        </div>

        {/* Animated Phone Rotation Graphic */}
        <div className="relative my-2 sm:my-3 flex items-center justify-center w-28 h-28 sm:w-32 sm:h-32">
          {/* Subtle glowing ring background */}
          <div className="absolute inset-0 rounded-full bg-[#004B8D]/40 border border-[#0081BC]/30 animate-pulse" />

          {/* Rotating Phone Icon with smooth CSS keyframe animation */}
          <div className="relative flex items-center justify-center animate-[rotatePhone_2.6s_ease-in-out_infinite]">
            <Smartphone className="w-16 h-16 sm:w-20 sm:h-20 text-[#FFC72C] drop-shadow-[0_0_12px_rgba(255,199,44,0.4)]" />
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
          className="text-lg sm:text-xl font-black text-white tracking-tight mt-1 mb-1.5 flex items-center justify-center gap-2"
        >
          <span>{t('rotate_screen_title', 'Please Rotate to Vertical (Portrait)')}</span>
        </h2>

        {/* Instructions Description */}
        <p
          id="rotate-notice-desc"
          className="text-xs sm:text-sm text-blue-100/90 leading-snug max-w-sm mb-4 px-2"
        >
          {t(
            'rotate_screen_desc',
            'Curbside Compass is designed for vertical portrait view on mobile phones to experience the live neighborhood simulation and answer survey questions clearly.'
          )}
        </p>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setDismissed(true);
              onDismissOverride?.();
            }}
            className="text-[11px] font-semibold text-gray-300 hover:text-white underline underline-offset-2 py-1.5 px-3 rounded cursor-pointer transition-colors active:scale-95"
          >
            {t('rotate_screen_continue_anyway', 'Continue in Horizontal view anyway')}
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
};
