import React from 'react';
import { PersonaResult } from '../types';
import { useAppText } from '../context/TextContentContext';

interface PolicyCompassGraphProps {
  persona: PersonaResult;
  totalX: number;
  totalY: number;
  className?: string;
}

const PolicyCompassGraphComponent: React.FC<PolicyCompassGraphProps> = ({
  persona,
  totalX,
  totalY,
  className = ''
}) => {
  const { t } = useAppText();
  // Convert the user's score to a percentage position on the compass grid
  // Horizontal (X axis): Left side represents Taxpayer-funded, Right side represents User-paid
  // Vertical (Y axis): Top half represents Regulated parking, Bottom half represents Open access
  const clampedX = Math.max(-18, Math.min(18, totalX));
  const clampedY = Math.max(-18, Math.min(18, totalY));
  
  const rawLeftPct = 6 + ((clampedX + 18) / 36) * 88;
  const rawBottomPct = 6 + ((18 - clampedY) / 36) * 88;

  // Make sure the target marker stays cleanly inside the correct visual quadrant
  let markerLeftPct = rawLeftPct;
  let markerBottomPct = rawBottomPct;

  if (persona.quadrant === 'Q1') {
    // Quadrant 1: Top-Right (Regulated & User-Paid)
    markerLeftPct = Math.max(53, Math.min(94, rawLeftPct));
    markerBottomPct = Math.max(53, Math.min(94, rawBottomPct));
  } else if (persona.quadrant === 'Q2') {
    // Quadrant 2: Top-Left (Regulated & Taxpayer-Funded)
    markerLeftPct = Math.max(6, Math.min(47, rawLeftPct));
    markerBottomPct = Math.max(53, Math.min(94, rawBottomPct));
  } else if (persona.quadrant === 'Q3') {
    // Quadrant 3: Bottom-Left (Free/Open Access & Taxpayer)
    markerLeftPct = Math.max(6, Math.min(47, rawLeftPct));
    markerBottomPct = Math.max(6, Math.min(47, rawBottomPct));
  } else if (persona.quadrant === 'Q4') {
    // Quadrant 4: Bottom-Right (Flat Rate/Open Access & User-Fee)
    markerLeftPct = Math.max(53, Math.min(94, rawLeftPct));
    markerBottomPct = Math.max(6, Math.min(47, rawBottomPct));
  }

  return (
    <div className={`flex flex-col items-center justify-center w-full h-full select-none ${className}`}>
      {/* Center 2D Plane Graph (Takes up 60% of the vertical mobile screen and vertical tablet screen) */}
      <div className="relative h-full w-full max-w-[420px] sm:max-w-none sm:aspect-square bg-slate-50 border-2 border-gray-300 rounded-xl sm:rounded-2xl overflow-hidden shadow-inner flex-shrink-0 max-h-[58dvh] sm:max-h-[60dvh]">
        {/* Subtle 50% dashed reference grid lines */}
        <div className="absolute inset-x-0 top-1/4 h-[1px] border-b border-dashed border-gray-200 pointer-events-none" />
        <div className="absolute inset-x-0 top-3/4 h-[1px] border-b border-dashed border-gray-200 pointer-events-none" />
        <div className="absolute inset-y-0 left-1/4 w-[1px] border-r border-dashed border-gray-200 pointer-events-none" />
        <div className="absolute inset-y-0 left-3/4 w-[1px] border-r border-dashed border-gray-200 pointer-events-none" />

        {/* Quadrant 1: Top-Right (Regulated & User-Fee) */}
        <div
          className={`absolute top-0 right-0 w-1/2 h-1/2 border-l border-b border-gray-300 flex flex-col items-center justify-center p-1 sm:p-2 text-center transition-all ${
            persona.quadrant === 'Q1'
              ? 'bg-[#0081BC]/15 text-[#004B8D] ring-2 ring-inset ring-[#0081BC]/40 font-black'
              : 'text-gray-500 font-semibold hover:bg-gray-100/40'
          }`}
        >
          {persona.quadrant === 'Q1' && (
            <span className="text-[9px] sm:text-xs md:text-sm font-black uppercase px-2 py-0.5 bg-[#0081BC] text-white rounded-full shadow-2xs mb-1">
              {t('compass_badge_your_result', 'Your Result')}
            </span>
          )}
          <span className={`text-[10px] sm:text-xs font-extrabold tracking-tight ${persona.quadrant === 'Q1' ? 'text-[#004B8D]' : 'text-gray-400'}`}>
            Permit Planner
          </span>
        </div>

        {/* Quadrant 2: Top-Left (Protective & Taxpayer) */}
        <div
          className={`absolute top-0 left-0 w-1/2 h-1/2 border-r border-b border-gray-300 flex flex-col items-center justify-center p-1 sm:p-2 text-center transition-all ${
            persona.quadrant === 'Q2'
              ? 'bg-[#005087]/15 text-[#005087] ring-2 ring-inset ring-[#005087]/40 font-black'
              : 'text-gray-500 font-semibold hover:bg-gray-100/40'
          }`}
        >
          {persona.quadrant === 'Q2' && (
            <span className="text-[9px] sm:text-xs md:text-sm font-black uppercase px-2 py-0.5 bg-[#005087] text-white rounded-full shadow-2xs mb-1">
              {t('compass_badge_your_result', 'Your Result')}
            </span>
          )}
          <span className={`text-[10px] sm:text-xs font-extrabold tracking-tight ${persona.quadrant === 'Q2' ? 'text-[#005087]' : 'text-gray-400'}`}>
            Community Coordinator
          </span>
        </div>

        {/* Quadrant 3: Bottom-Left (Free/Open & Taxpayer) */}
        <div
          className={`absolute bottom-0 left-0 w-1/2 h-1/2 border-r border-t border-gray-300 flex flex-col items-center justify-center p-1 sm:p-2 text-center transition-all ${
            persona.quadrant === 'Q3'
              ? 'bg-[#009A44]/15 text-[#007a36] ring-2 ring-inset ring-[#009A44]/40 font-black'
              : 'text-gray-500 font-semibold hover:bg-gray-100/40'
          }`}
        >
          {persona.quadrant === 'Q3' && (
            <span className="text-[9px] sm:text-xs md:text-sm font-black uppercase px-2 py-0.5 bg-[#009A44] text-white rounded-full shadow-2xs mb-1">
              {t('compass_badge_your_result', 'Your Result')}
            </span>
          )}
          <span className={`text-[10px] sm:text-xs font-extrabold tracking-tight ${persona.quadrant === 'Q3' ? 'text-[#007a36]' : 'text-gray-400'}`}>
            Community Cruiser
          </span>
        </div>

        {/* Quadrant 4: Bottom-Right (Flat Rate & User-Fee) */}
        <div
          className={`absolute bottom-0 right-0 w-1/2 h-1/2 border-l border-t border-gray-300 flex flex-col items-center justify-center p-1 sm:p-2 text-center transition-all ${
            persona.quadrant === 'Q4'
              ? 'bg-[#FFC72C]/25 text-[#996500] ring-2 ring-inset ring-[#FFC72C]/50 font-black'
              : 'text-gray-500 font-semibold hover:bg-gray-100/40'
          }`}
        >
          {persona.quadrant === 'Q4' && (
            <span className="text-[9px] sm:text-xs md:text-sm font-black uppercase px-2 py-0.5 bg-[#d49b00] text-white rounded-full shadow-2xs mb-1">
              {t('compass_badge_your_result', 'Your Result')}
            </span>
          )}
          <span className={`text-[10px] sm:text-xs font-extrabold tracking-tight ${persona.quadrant === 'Q4' ? 'text-[#996500]' : 'text-gray-400'}`}>
            Casual Cruiser
          </span>
        </div>

        {/* Bold Main Center Axis Lines */}
        <div className="absolute inset-x-0 top-1/2 h-[2px] bg-[#004B8D]/40 pointer-events-none -translate-y-1/2" />
        <div className="absolute inset-y-0 left-1/2 w-[2px] bg-[#004B8D]/40 pointer-events-none -translate-x-1/2" />

        {/* Center Origin Dot (0, 0) */}
        <div className="absolute top-1/2 left-1/2 w-2.5 h-2.5 rounded-full bg-[#004B8D]/60 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

        {/* Y-Axis Label: Centre Top just inside grid over top of the grid */}
        <div className="absolute top-1.5 sm:top-2.5 left-1/2 -translate-x-1/2 z-10 pointer-events-none flex items-center justify-center gap-1 px-2.5 py-0.5 sm:py-1 rounded-md bg-white/95 backdrop-blur-xs border border-gray-300 shadow-2xs">
          <span className="text-[#004B8D] text-[10px] sm:text-xs font-bold">▲</span>
          <span className="text-[10px] sm:text-xs md:text-sm font-black text-gray-900 uppercase tracking-tight whitespace-nowrap">
            {t('compass_top_axis_label', t('compass_top_axis', '▲ More Parking Rules').replace('▲', '').trim())}
          </span>
        </div>

        {/* Y-Axis Label: Centre Bottom just inside grid over bottom of the grid */}
        <div className="absolute bottom-1.5 sm:bottom-2.5 left-1/2 -translate-x-1/2 z-10 pointer-events-none flex items-center justify-center gap-1 px-2.5 py-0.5 sm:py-1 rounded-md bg-white/95 backdrop-blur-xs border border-gray-300 shadow-2xs">
          <span className="text-[#004B8D] text-[10px] sm:text-xs font-bold">▼</span>
          <span className="text-[10px] sm:text-xs md:text-sm font-black text-gray-900 uppercase tracking-tight whitespace-nowrap">
            {t('compass_bottom_axis_label', t('compass_bottom_axis', '▼ Fewer Parking Rules').replace('▼', '').trim())}
          </span>
        </div>

        {/* X-Axis Label: Just inside grid, aligned just above the X line (Left: Taxpayer Funded) */}
        <div className="absolute left-1.5 sm:left-2.5 bottom-1/2 mb-1 sm:mb-1.5 z-10 pointer-events-none flex items-center gap-1 px-2 py-0.5 sm:py-1 rounded-md bg-white/95 backdrop-blur-xs border border-gray-300 shadow-2xs">
          <span className="text-[#004B8D] text-[10px] sm:text-xs font-bold">◀</span>
          <span className="text-[9.5px] sm:text-xs md:text-sm font-black text-gray-900 uppercase tracking-tight whitespace-nowrap">
            {t('compass_left_axis_line1', '◀ Taxpayer').replace('◀', '').trim()} {t('compass_left_axis_line2', 'Funded')}
          </span>
        </div>

        {/* X-Axis Label: Just inside grid, aligned just above the X line (Right: User-Fee Funded) */}
        <div className="absolute right-1.5 sm:right-2.5 bottom-1/2 mb-1 sm:mb-1.5 z-10 pointer-events-none flex items-center gap-1 px-2 py-0.5 sm:py-1 rounded-md bg-white/95 backdrop-blur-xs border border-gray-300 shadow-2xs">
          <span className="text-[9.5px] sm:text-xs md:text-sm font-black text-gray-900 uppercase tracking-tight whitespace-nowrap">
            {t('compass_right_axis_line1', 'User-Fee')} {t('compass_right_axis_line2', 'Funded ▶').replace('▶', '').trim()}
          </span>
          <span className="text-[#004B8D] text-[10px] sm:text-xs font-bold">▶</span>
        </div>

        {/* Animated Live Point Marker */}
        <div
          className="absolute w-6 h-6 sm:w-7 sm:h-7 -translate-x-1/2 translate-y-1/2 z-20 pointer-events-none transition-all duration-700 ease-out flex items-center justify-center"
          style={{
            left: `${markerLeftPct}%`,
            bottom: `${markerBottomPct}%`
          }}
          title={`Your policy coordinate: X=${totalX > 0 ? `+${totalX}` : totalX}, Y=${totalY > 0 ? `+${totalY}` : totalY}`}
        >
          {/* Pulsing radar ring */}
          <span className="absolute inset-0 rounded-full bg-[#FFC72C] opacity-75 animate-ping" />
          {/* Core marker badge */}
          <div className="relative w-5 h-5 sm:w-5.5 sm:h-5.5 rounded-full border-2 border-[#004B8D] bg-[#FFC72C] shadow-md flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-[#004B8D]" />
          </div>
        </div>
      </div>
    </div>
  );
};

export const PolicyCompassGraph = React.memo(PolicyCompassGraphComponent);
