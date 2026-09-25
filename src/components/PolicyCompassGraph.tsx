import React from 'react';
import { PersonaResult } from '../types';

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
  // Normalize X and Y to percentage for compass marker
  // totalX: negative = Taxpayer (Left), positive = User-Fee (Right)
  // totalY in survey scoring: negative = Regulated/Restrictive (Top / Q1 & Q2), positive = Open Access/Free (Bottom / Q3 & Q4)
  const clampedX = Math.max(-18, Math.min(18, totalX));
  const clampedY = Math.max(-18, Math.min(18, totalY));
  
  const rawLeftPct = 6 + ((clampedX + 18) / 36) * 88;
  // Invert Y so that negative totalY (Regulated) maps to upper half (bottom% > 50) and positive totalY (Open Access) maps to lower half (bottom% < 50)
  const rawBottomPct = 6 + ((18 - clampedY) / 36) * 88;

  // Strict quadrant alignment so the yellow target indicator always visibly matches and lands in persona.quadrant
  let markerLeftPct = rawLeftPct;
  let markerBottomPct = rawBottomPct;

  if (persona.quadrant === 'Q1') {
    // Quadrant 1: Top-Right (Regulated & User-Fee)
    markerLeftPct = Math.max(53, Math.min(94, rawLeftPct));
    markerBottomPct = Math.max(53, Math.min(94, rawBottomPct));
  } else if (persona.quadrant === 'Q2') {
    // Quadrant 2: Top-Left (Protective/Regulated & Taxpayer)
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
      {/* Top Outer Axis Label (Outside Graph, No Abbreviations) */}
      <div className="flex items-center justify-center gap-1 text-[11px] sm:text-xs md:text-sm font-black text-gray-800 uppercase tracking-tight pb-0.5 sm:pb-1 text-center flex-shrink-0">
        <span className="text-[#004B8D] text-[10px] sm:text-xs">▲</span>
        <span>Regulated Management</span>
      </div>

      {/* Horizontal Middle Row: Left Label + Square Graph + Right Label */}
      <div className="flex items-center justify-center w-full gap-1 sm:gap-2 md:gap-3 flex-grow min-h-0">
        {/* Left Outer Axis Label (Outside Graph, No Abbreviations) */}
        <div className="flex flex-col items-end justify-center text-right pr-0.5 sm:pr-1.5 w-16 sm:w-20 md:w-24 flex-shrink-0">
          <span className="text-[10px] sm:text-xs md:text-sm font-black text-gray-800 uppercase tracking-tighter sm:tracking-tight leading-tight flex items-center gap-0.5 sm:gap-1">
            <span className="text-[#004B8D] text-[10px] sm:text-xs">◀</span>
            <span>Taxpayer</span>
          </span>
          <span className="text-[9px] sm:text-[11px] md:text-xs font-bold text-gray-600 uppercase tracking-tighter sm:tracking-tight leading-tight">
            Funded
          </span>
        </div>

        {/* Center 2D Plane Graph (Square Container utilizing space) */}
        <div className="relative h-full max-h-[220px] [@media(orientation:landscape)_and_(max-height:540px)]:max-h-[140px] sm:max-h-[260px] md:max-h-[320px] aspect-square bg-slate-50 border-2 border-gray-300 rounded-lg sm:rounded-xl overflow-hidden shadow-inner flex-shrink-0">
          {/* Subtle 50% dashed reference grid lines */}
          <div className="absolute inset-x-0 top-1/4 h-[1px] border-b border-dashed border-gray-200 pointer-events-none" />
          <div className="absolute inset-x-0 top-3/4 h-[1px] border-b border-dashed border-gray-200 pointer-events-none" />
          <div className="absolute inset-y-0 left-1/4 w-[1px] border-r border-dashed border-gray-200 pointer-events-none" />
          <div className="absolute inset-y-0 left-3/4 w-[1px] border-r border-dashed border-gray-200 pointer-events-none" />

          {/* Quadrant 1: Top-Right (Regulated & User-Fee) */}
          <div
            className={`absolute top-0 right-0 w-1/2 h-1/2 border-l border-b border-gray-300 flex flex-col items-center justify-center p-0.5 sm:p-1 text-center transition-all ${
              persona.quadrant === 'Q1'
                ? 'bg-[#0081BC]/15 text-[#004B8D] ring-2 ring-inset ring-[#0081BC]/40 font-black'
                : 'text-gray-500 font-semibold hover:bg-gray-100/40'
            }`}
          >
            <span className="text-[10px] sm:text-xs md:text-sm font-bold leading-tight">Regulated</span>
            <span className="text-[8.5px] sm:text-[11px] md:text-xs opacity-80 font-medium block">User-Fee</span>
            {persona.quadrant === 'Q1' && (
              <span className="mt-0.5 text-[8px] sm:text-[10px] md:text-xs font-black uppercase px-1 sm:px-1.5 py-0.2 sm:py-0.5 bg-[#0081BC] text-white rounded-full shadow-2xs">
                Your Result
              </span>
            )}
          </div>

          {/* Quadrant 2: Top-Left (Protective & Taxpayer) */}
          <div
            className={`absolute top-0 left-0 w-1/2 h-1/2 border-r border-b border-gray-300 flex flex-col items-center justify-center p-0.5 sm:p-1 text-center transition-all ${
              persona.quadrant === 'Q2'
                ? 'bg-[#005087]/15 text-[#005087] ring-2 ring-inset ring-[#005087]/40 font-black'
                : 'text-gray-500 font-semibold hover:bg-gray-100/40'
            }`}
          >
            <span className="text-[10px] sm:text-xs md:text-sm font-bold leading-tight">Protective</span>
            <span className="text-[8.5px] sm:text-[11px] md:text-xs opacity-80 font-medium block">Taxpayer</span>
            {persona.quadrant === 'Q2' && (
              <span className="mt-0.5 text-[8px] sm:text-[10px] md:text-xs font-black uppercase px-1 sm:px-1.5 py-0.2 sm:py-0.5 bg-[#005087] text-white rounded-full shadow-2xs">
                Your Result
              </span>
            )}
          </div>

          {/* Quadrant 3: Bottom-Left (Free/Open & Taxpayer) */}
          <div
            className={`absolute bottom-0 left-0 w-1/2 h-1/2 border-r border-t border-gray-300 flex flex-col items-center justify-center p-0.5 sm:p-1 text-center transition-all ${
              persona.quadrant === 'Q3'
                ? 'bg-[#009A44]/15 text-[#007a36] ring-2 ring-inset ring-[#009A44]/40 font-black'
                : 'text-gray-500 font-semibold hover:bg-gray-100/40'
            }`}
          >
            <span className="text-[10px] sm:text-xs md:text-sm font-bold leading-tight">Free & Easy</span>
            <span className="text-[8.5px] sm:text-[11px] md:text-xs opacity-80 font-medium block">Open Access</span>
            {persona.quadrant === 'Q3' && (
              <span className="mt-0.5 text-[8px] sm:text-[10px] md:text-xs font-black uppercase px-1 sm:px-1.5 py-0.2 sm:py-0.5 bg-[#009A44] text-white rounded-full shadow-2xs">
                Your Result
              </span>
            )}
          </div>

          {/* Quadrant 4: Bottom-Right (Flat Rate & User-Fee) */}
          <div
            className={`absolute bottom-0 right-0 w-1/2 h-1/2 border-l border-t border-gray-300 flex flex-col items-center justify-center p-0.5 sm:p-1 text-center transition-all ${
              persona.quadrant === 'Q4'
                ? 'bg-[#FFC72C]/25 text-[#996500] ring-2 ring-inset ring-[#FFC72C]/50 font-black'
                : 'text-gray-500 font-semibold hover:bg-gray-100/40'
            }`}
          >
            <span className="text-[10px] sm:text-xs md:text-sm font-bold leading-tight">Flat Rate</span>
            <span className="text-[8.5px] sm:text-[11px] md:text-xs opacity-80 font-medium block">Simple Fee</span>
            {persona.quadrant === 'Q4' && (
              <span className="mt-0.5 text-[8px] sm:text-[10px] md:text-xs font-black uppercase px-1 sm:px-1.5 py-0.2 sm:py-0.5 bg-[#d49b00] text-white rounded-full shadow-2xs">
                Your Result
              </span>
            )}
          </div>

          {/* Bold Main Center Axis Lines */}
          <div className="absolute inset-x-0 top-1/2 h-[2px] bg-[#004B8D]/40 pointer-events-none -translate-y-1/2" />
          <div className="absolute inset-y-0 left-1/2 w-[2px] bg-[#004B8D]/40 pointer-events-none -translate-x-1/2" />

          {/* Center Origin Dot (0, 0) */}
          <div className="absolute top-1/2 left-1/2 w-2 h-2 rounded-full bg-[#004B8D]/60 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

          {/* Animated Live Point Marker */}
          <div
            className="absolute w-5 h-5 -translate-x-1/2 translate-y-1/2 z-20 pointer-events-none transition-all duration-700 ease-out flex items-center justify-center"
            style={{
              left: `${markerLeftPct}%`,
              bottom: `${markerBottomPct}%`
            }}
            title={`Your policy coordinate: X=${totalX > 0 ? `+${totalX}` : totalX}, Y=${totalY > 0 ? `+${totalY}` : totalY}`}
          >
            {/* Pulsing radar ring */}
            <span className="absolute inset-0 rounded-full bg-[#FFC72C] opacity-75 animate-ping" />
            {/* Core marker badge */}
            <div className="relative w-4 h-4 sm:w-4.5 sm:h-4.5 rounded-full border-2 border-[#004B8D] bg-[#FFC72C] shadow-md flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-[#004B8D]" />
            </div>
          </div>
        </div>

        {/* Right Outer Axis Label (Outside Graph, No Abbreviations) */}
        <div className="flex flex-col items-start justify-center text-left pl-0.5 sm:pl-1.5 w-16 sm:w-20 md:w-24 flex-shrink-0">
          <span className="text-[10px] sm:text-xs md:text-sm font-black text-gray-800 uppercase tracking-tighter sm:tracking-tight leading-tight flex items-center gap-0.5 sm:gap-1">
            <span>User-Fee</span>
            <span className="text-[#004B8D] text-[10px] sm:text-xs">▶</span>
          </span>
          <span className="text-[9px] sm:text-[11px] md:text-xs font-bold text-gray-600 uppercase tracking-tighter sm:tracking-tight leading-tight">
            Funded
          </span>
        </div>
      </div>

      {/* Bottom Outer Axis Label (Outside Graph, No Abbreviations) */}
      <div className="flex items-center justify-center gap-1 text-[11px] sm:text-xs md:text-sm font-black text-gray-800 uppercase tracking-tight pt-0.5 sm:pt-1 text-center flex-shrink-0">
        <span className="text-[#004B8D] text-[10px] sm:text-xs">▼</span>
        <span>Open Access</span>
      </div>
    </div>
  );
};

export const PolicyCompassGraph = React.memo(PolicyCompassGraphComponent);
