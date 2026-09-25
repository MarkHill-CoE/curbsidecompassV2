import React, { useEffect } from 'react';
import { Gauge, Sliders, Car, AlertTriangle, CheckCircle, Info, X } from 'lucide-react';
import { triggerFeedback } from '../utils/feedback';

interface MagnifiedGaugeDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  curbsidePct: number;
  curbsideDemandCount: number;
  curbsideStallsCapacity: number;
  circlingCarCount: number;
  activeHouseholdCars: number;
  activeVisitorCars: number;
  totalDwellings: number;
  onOpenManualSliders?: () => void;
}

export const MagnifiedGaugeDrawer: React.FC<MagnifiedGaugeDrawerProps> = ({
  isOpen,
  onClose,
  curbsidePct,
  curbsideDemandCount,
  curbsideStallsCapacity,
  circlingCarCount,
  activeHouseholdCars,
  activeVisitorCars,
  totalDwellings,
  onOpenManualSliders
}) => {
  // Listen for Escape key to close the drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
        document.getElementById('hud-gauge-widget')?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Gauge calculations
  const cx = 150;
  const cy = 135;
  const r = 100;
  const clampedPct = Math.min(200, Math.max(0, curbsidePct));
  // Angle in degrees from 180 (0%) to 360 (200%)
  const needleAngle = 180 + (clampedPct / 200) * 180;

  // Status determinations
  const isCritical = curbsidePct >= 130;
  const isStrained = curbsidePct >= 80 && curbsidePct < 130;
  const isHealthy = curbsidePct < 80;

  const statusLabel = isCritical
    ? 'Critical Overload'
    : isStrained
    ? 'High Utilization'
    : 'Space Available';

  const statusBadgeColor = isCritical
    ? 'bg-[#E8552D]/20 text-[#ff7043] border-[#E8552D]'
    : isStrained
    ? 'bg-[#FFC72C]/20 text-[#FFC72C] border-[#FFC72C]'
    : 'bg-[#009A44]/20 text-[#4ade80] border-[#009A44]';

  // Arc path helper
  const getArcCoords = (pct: number) => {
    const rad = Math.PI + (pct / 200) * Math.PI;
    return {
      x: cx + r * Math.cos(rad),
      y: cy + r * Math.sin(rad)
    };
  };

  const p0 = getArcCoords(0);
  const p80 = getArcCoords(80);
  const p130 = getArcCoords(130);
  const p200 = getArcCoords(200);

  // Tick marks
  const tickPcts = [0, 50, 100, 150, 200];
  const ticks = tickPcts.map((pct) => {
    const rad = Math.PI + (pct / 200) * Math.PI;
    const innerR = r - 12;
    const outerR = r + 2;
    const textR = r - 22;
    return {
      pct,
      x1: cx + innerR * Math.cos(rad),
      y1: cy + innerR * Math.sin(rad),
      x2: cx + outerR * Math.cos(rad),
      y2: cy + outerR * Math.sin(rad),
      tx: cx + textR * Math.cos(rad),
      ty: cy + textR * Math.sin(rad)
    };
  });

  const availableStalls = Math.max(0, curbsideStallsCapacity - curbsideDemandCount);
  const deficitStalls = Math.max(0, curbsideDemandCount - curbsideStallsCapacity);

  return (
    <div
      id="magnified-gauge-overlay-container"
      className="fixed inset-0 z-50 bg-[#07131e]/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-hidden select-none animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          triggerFeedback('button');
          onClose();
        }
      }}
    >
      <div
        id="magnified-gauge-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="magnified-gauge-title"
        className="relative bg-[#11283f]/95 border-2 border-[#0081BC] p-2.5 sm:p-4 rounded-xl shadow-2xl w-full max-w-md md:max-w-2xl [@media(orientation:landscape)]:max-w-2xl [@media(orientation:landscape)_and_(max-height:500px)]:max-w-xl mx-auto my-auto flex flex-col gap-2 sm:gap-3 text-white max-h-[96dvh] [@media(max-height:500px)]:max-h-[98dvh] overflow-y-auto"
      >
        {/* Header - Compact to preserve vertical room */}
        <div className="flex items-center justify-between pb-1.5 sm:pb-2 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-1 sm:p-1.5 rounded-lg bg-[#004B8D] text-[#FFC72C] shrink-0">
              <Gauge className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h3 id="magnified-gauge-title" className="font-bold text-white text-xs sm:text-sm md:text-base leading-none">
                Curbside Parking Demand Gauge
              </h3>
              <span className="text-[9px] sm:text-[10px] text-gray-300">Live street utilization & capacity analysis</span>
            </div>
          </div>
          <button
            type="button"
            aria-label="Close magnified parking gauge"
            onClick={() => {
              triggerFeedback('button');
              onClose();
            }}
            className="text-gray-300 hover:text-white flex items-center justify-center min-w-[36px] min-h-[36px] sm:min-w-[44px] sm:min-h-[44px] font-bold text-lg cursor-pointer active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFC72C] rounded hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Responsive Body: Stacks vertically on mobile portrait, side-by-side in landscape and tablet/desktop to keep all content strictly above the fold */}
        <div className="grid grid-cols-1 md:grid-cols-2 [@media(orientation:landscape)]:grid-cols-2 gap-2 sm:gap-3.5 items-center">
          {/* Column 1: Magnified Vector Dial Gauge */}
          <div className="flex flex-col items-center justify-center bg-[#0d2135] p-2 sm:p-3 rounded-xl border border-white/10 shadow-inner">
            <svg
              viewBox="0 0 300 155"
              className="w-full max-w-[210px] sm:max-w-[240px] md:max-w-[260px] [@media(orientation:landscape)_and_(max-height:500px)]:max-w-[165px] h-auto overflow-visible select-none"
              aria-hidden="true"
            >
              {/* Background track */}
              <path
                d={`M ${p0.x} ${p0.y} A ${r} ${r} 0 0 1 ${p200.x} ${p200.y}`}
                fill="none"
                stroke="#1e3a58"
                strokeWidth="14"
                strokeLinecap="round"
              />

              {/* Green Zone (0% - 80%) */}
              <path
                d={`M ${p0.x} ${p0.y} A ${r} ${r} 0 0 1 ${p80.x} ${p80.y}`}
                fill="none"
                stroke="#009A44"
                strokeWidth="14"
                strokeLinecap="round"
              />

              {/* Yellow Zone (80% - 130%) */}
              <path
                d={`M ${p80.x} ${p80.y} A ${r} ${r} 0 0 1 ${p130.x} ${p130.y}`}
                fill="none"
                stroke="#FFC72C"
                strokeWidth="14"
              />

              {/* Red Zone (130% - 200%+) */}
              <path
                d={`M ${p130.x} ${p130.y} A ${r} ${r} 0 0 1 ${p200.x} ${p200.y}`}
                fill="none"
                stroke="#E8552D"
                strokeWidth="14"
                strokeLinecap="round"
              />

              {/* Tick Marks and Labels */}
              {ticks.map((t) => (
                <g key={t.pct}>
                  <line
                    x1={t.x1}
                    y1={t.y1}
                    x2={t.x2}
                    y2={t.y2}
                    stroke="#ffffff"
                    strokeWidth="1.5"
                    opacity="0.8"
                  />
                  <text
                    x={t.tx}
                    y={t.ty + 3}
                    textAnchor="middle"
                    fill="#94a3b8"
                    fontSize="9"
                    fontWeight="bold"
                  >
                    {t.pct}%
                  </text>
                </g>
              ))}

              {/* Needle */}
              <g
                style={{
                  transform: `rotate(${needleAngle}deg)`,
                  transformOrigin: `${cx}px ${cy}px`,
                  transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
                }}
              >
                {/* Needle Body */}
                <line
                  x1={cx - 10}
                  y1={cy}
                  x2={cx + r - 8}
                  y2={cy}
                  stroke="#ffffff"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
                <line
                  x1={cx + r - 22}
                  y1={cy}
                  x2={cx + r - 8}
                  y2={cy}
                  stroke="#FFC72C"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
              </g>

              {/* Pivot Pin */}
              <circle cx={cx} cy={cy} r="7" fill="#FFC72C" stroke="#ffffff" strokeWidth="2" />
              <circle cx={cx} cy={cy} r="2.5" fill="#11283f" />
            </svg>

            {/* Central Readout */}
            <div className="flex flex-col items-center -mt-3 sm:-mt-4">
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {curbsidePct}%
                </span>
                <span className={`text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${statusBadgeColor}`}>
                  {statusLabel}
                </span>
              </div>
              <p className="text-[11px] sm:text-xs font-semibold text-gray-200 mt-0.5 text-center">
                <span className="text-[#FFC72C] font-bold">{curbsideDemandCount}</span> of{' '}
                <span className="text-white font-bold">{curbsideStallsCapacity}</span> Legal Curbside Stalls Occupied
              </p>
            </div>
          </div>

          {/* Column 2: Breakdown Metrics, Planning Note & Actions */}
          <div className="flex flex-col justify-between gap-1.5 sm:gap-2">
            {/* Detailed Metrics Breakdown */}
            <div className="grid grid-cols-2 gap-1.5 text-xs">
              <div className="bg-[#193A5A]/80 border border-white/10 rounded-lg p-1.5 sm:p-2 flex flex-col">
                <span className="text-gray-300 text-[9px] sm:text-[10px] font-medium flex items-center gap-1">
                  <Car className="w-3 h-3 text-[#0081BC] shrink-0" /> Curb Availability
                </span>
                <span className={`font-bold text-xs sm:text-sm mt-0.5 leading-tight ${availableStalls > 0 ? 'text-[#4ade80]' : 'text-[#ff7043]'}`}>
                  {availableStalls > 0 ? `${availableStalls} Stalls Free` : `Deficit: ${deficitStalls} Cars`}
                </span>
              </div>

              <div className="bg-[#193A5A]/80 border border-white/10 rounded-lg p-1.5 sm:p-2 flex flex-col">
                <span className="text-gray-300 text-[9px] sm:text-[10px] font-medium flex items-center gap-1">
                  <AlertTriangle className={`w-3 h-3 shrink-0 ${circlingCarCount > 0 ? 'text-[#FFC72C]' : 'text-[#4ade80]'}`} /> Circling Cars
                </span>
                <span className={`font-bold text-xs sm:text-sm mt-0.5 leading-tight ${circlingCarCount > 0 ? 'text-[#FFC72C]' : 'text-[#4ade80]'}`}>
                  {circlingCarCount > 0 ? `${circlingCarCount} Cruising` : '0 (Smooth)'}
                </span>
              </div>

              <div className="bg-[#193A5A]/80 border border-white/10 rounded-lg p-1.5 sm:p-2 flex flex-col">
                <span className="text-gray-300 text-[9px] sm:text-[10px] font-medium">Homes on Block</span>
                <span className="font-bold text-xs sm:text-sm text-white mt-0.5 leading-tight">{totalDwellings} Dwellings</span>
              </div>

              <div className="bg-[#193A5A]/80 border border-white/10 rounded-lg p-1.5 sm:p-2 flex flex-col">
                <span className="text-gray-300 text-[9px] sm:text-[10px] font-medium">Active Demand</span>
                <span className="font-bold text-[11px] sm:text-xs text-[#FFC72C] mt-0.5 leading-tight">
                  {activeHouseholdCars} Res • {activeVisitorCars} Vis
                </span>
              </div>
            </div>

            {/* Planning Insight */}
            <div className="bg-[#0c1f31] border border-[#0081BC]/40 rounded-lg p-2 sm:p-2.5 text-[16pt] text-gray-200 flex items-start gap-2.5 leading-snug">
              <Info className="w-5 h-5 sm:w-6 sm:h-6 text-[#FFC72C] shrink-0 mt-0.5" />
              <div>
                {isHealthy && (
                  <p>
                    <strong className="text-white">Curbside Balanced:</strong> Space is available. Residents, visitors, and deliveries park easily without cruising.
                  </p>
                )}
                {isStrained && (
                  <p>
                    <strong className="text-white">Approaching Capacity:</strong> Curb reaches ~85% occupancy. Minor cruising occurs during peak demand periods.
                  </p>
                )}
                {isCritical && (
                  <p>
                    <strong className="text-white">Severe Curb Deficit:</strong> Vehicle demand exceeds legal spaces. Circling traffic causes blockages and emissions.
                  </p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-0.5">
              {onOpenManualSliders && (
                <button
                  type="button"
                  onClick={() => {
                    triggerFeedback('button');
                    onOpenManualSliders();
                  }}
                  className="flex-1 py-1.5 sm:py-2 px-2.5 bg-[#004B8D] hover:bg-[#003566] text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer text-xs min-h-[38px] active:scale-95"
                >
                  <Sliders className="w-3.5 h-3.5 text-[#FFC72C]" />
                  Adjust Sliders
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  triggerFeedback('button');
                  onClose();
                }}
                className="flex-1 py-1.5 sm:py-2 px-2.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer text-xs min-h-[38px] active:scale-95"
              >
                <CheckCircle className="w-3.5 h-3.5 text-[#4ade80]" />
                Back to Parking Survey
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
