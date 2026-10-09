import React from 'react';
import { Car, Warehouse, Gauge, AlertCircle } from 'lucide-react';
import { triggerFeedback } from '../utils/feedback';
import { useAppText } from '../context/TextContentContext';

export interface LedBarIndicatorGaugeProps {
  curbsideDemandCount: number;
  curbsideStallsCapacity: number;
  occupiedGaragesCount: number;
  totalGarageSpacesCapacity: number;
  circlingCarCount?: number;
  compact?: boolean;
  onOpenMagnified?: () => void;
  className?: string;
  showTitle?: boolean;
}

// 10 Segment LED Color Scale from bottom (index 0 = low reserve) to top (index 9 = abundant space)
const LED_SEGMENTS = [
  { level: '10%',  color: '#ef4444', glow: 'rgba(239, 68, 68, 0.85)' },    // Segment 0: 10% (Low)
  { level: '20%',  color: '#f43f5e', glow: 'rgba(244, 63, 94, 0.85)' },   // Segment 1: 20%
  { level: '30%',  color: '#f97316', glow: 'rgba(249, 115, 22, 0.85)' },  // Segment 2: 30%
  { level: '40%',  color: '#fb923c', glow: 'rgba(251, 146, 60, 0.85)' },  // Segment 3: 40%
  { level: '50%',  color: '#f59e0b', glow: 'rgba(245, 158, 11, 0.85)' },  // Segment 4: 50% (Mid)
  { level: '60%',  color: '#eab308', glow: 'rgba(234, 179, 8, 0.85)' },   // Segment 5: 60%
  { level: '70%',  color: '#84cc16', glow: 'rgba(132, 204, 22, 0.85)' },  // Segment 6: 70%
  { level: '80%',  color: '#22c55e', glow: 'rgba(34, 197, 94, 0.85)' },   // Segment 7: 80% (Ample)
  { level: '90%',  color: '#10b981', glow: 'rgba(16, 185, 129, 0.85)' },  // Segment 8: 90%
  { level: '100%', color: '#06b6d4', glow: 'rgba(6, 182, 212, 0.95)' },   // Segment 9: 100% (Full availability)
];

export const LedBarIndicatorGauge: React.FC<LedBarIndicatorGaugeProps> = ({
  curbsideDemandCount,
  curbsideStallsCapacity,
  occupiedGaragesCount,
  totalGarageSpacesCapacity,
  circlingCarCount = 0,
  compact = false,
  onOpenMagnified,
  className = '',
  showTitle = true,
}) => {
  const { t } = useAppText();

  // Street parking calculations
  const streetCap = Math.max(1, curbsideStallsCapacity);
  const streetUsed = curbsideDemandCount;
  const streetAvail = Math.max(0, streetCap - streetUsed);
  const streetRatio = Math.min(1, Math.max(0, streetAvail / streetCap));
  const streetLitCount = streetAvail === 0 ? 0 : Math.max(1, Math.min(10, Math.round(streetRatio * 10)));
  const streetAvailPct = Math.round(streetRatio * 100);

  // Private / Garage parking calculations
  const garageCap = Math.max(1, totalGarageSpacesCapacity || 12);
  const garageUsed = occupiedGaragesCount;
  const garageAvail = Math.max(0, garageCap - garageUsed);
  const garageRatio = Math.min(1, Math.max(0, garageAvail / garageCap));
  const garageLitCount = garageAvail === 0 ? 0 : Math.max(1, Math.min(10, Math.round(garageRatio * 10)));
  const garageAvailPct = Math.round(garageRatio * 100);

  const handleClick = () => {
    if (onOpenMagnified) {
      triggerFeedback('button');
      onOpenMagnified();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (onOpenMagnified && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      triggerFeedback('button');
      onOpenMagnified();
    }
  };

  // Compact variant for HUD overlay in Neighborhood Simulation
  if (compact) {
    return (
      <div
        id="hud-led-bar-gauge"
        role="button"
        tabIndex={0}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        title={t('led_gauge_tooltip', 'LED Availability Gauge: Click for magnified parking analysis')}
        aria-label={t('led_gauge_aria', 'LED Parking Gauge: Street {sAvail} available, Garage {gAvail} available').replace('{sAvail}', String(streetAvail)).replace('{gAvail}', String(garageAvail))}
        className={`bg-[#0d2135]/95 backdrop-blur-md border border-[#0081BC]/50 hover:border-[#FFC72C]/80 hover:bg-[#132c45]/95 p-1.5 sm:p-2 rounded-lg shadow-xl flex flex-col items-center gap-1.5 cursor-pointer select-none active:scale-95 transition-all w-[116px] sm:w-[130px] group ${className}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between w-full text-[9px] sm:text-[10px] font-bold text-gray-200 border-b border-white/10 pb-0.5">
          <span className="flex items-center gap-1 truncate text-white">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            LED Space
          </span>
          <span className="text-[8px] text-cyan-300 font-mono font-black">
            Avail
          </span>
        </div>

        {/* Side-by-side Dual LED Bars */}
        <div className="grid grid-cols-2 gap-2 w-full px-0.5">
          {/* Channel 1: Street Parking */}
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-[8px] font-black uppercase text-sky-300 flex items-center gap-0.5">
              <Car className="w-2.5 h-2.5" />
              Street
            </span>

            {/* LED Ladder Stack (Top to Bottom: index 9 down to 0) */}
            <div className="flex flex-col gap-[2px] w-full p-1 bg-[#07131f] border border-white/10 rounded-[4px] shadow-inner">
              {Array.from({ length: 10 }).map((_, idx) => {
                const segIdx = 9 - idx; // 9 at top, 0 at bottom
                const isLit = segIdx < streetLitCount;
                const seg = LED_SEGMENTS[segIdx];
                return (
                  <div
                    key={`street-compact-seg-${segIdx}`}
                    style={{
                      backgroundColor: isLit ? seg.color : 'rgba(255, 255, 255, 0.05)',
                      boxShadow: isLit ? `0 0 4px ${seg.glow}, inset 0 1px 1px rgba(255,255,255,0.4)` : 'none',
                    }}
                    className={`h-[4px] sm:h-[4.5px] w-full rounded-[1px] transition-colors duration-200 ${
                      isLit ? 'opacity-100' : 'opacity-25'
                    }`}
                  />
                );
              })}
            </div>

            {/* Readout */}
            <div className="flex flex-col items-center leading-none mt-0.5">
              <span className={`text-[9px] font-black ${streetAvail > 0 ? 'text-[#34d399]' : 'text-rose-400'}`}>
                {streetAvail} Open
              </span>
              <span className="text-[7.5px] text-gray-400 font-medium">
                {streetUsed}/{streetCap} Used
              </span>
            </div>
          </div>

          {/* Channel 2: Private / Garage Use */}
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-[8px] font-black uppercase text-amber-300 flex items-center gap-0.5">
              <Warehouse className="w-2.5 h-2.5" />
              Garage
            </span>

            {/* LED Ladder Stack (Top to Bottom: index 9 down to 0) */}
            <div className="flex flex-col gap-[2px] w-full p-1 bg-[#07131f] border border-white/10 rounded-[4px] shadow-inner">
              {Array.from({ length: 10 }).map((_, idx) => {
                const segIdx = 9 - idx; // 9 at top, 0 at bottom
                const isLit = segIdx < garageLitCount;
                const seg = LED_SEGMENTS[segIdx];
                return (
                  <div
                    key={`garage-compact-seg-${segIdx}`}
                    style={{
                      backgroundColor: isLit ? seg.color : 'rgba(255, 255, 255, 0.05)',
                      boxShadow: isLit ? `0 0 4px ${seg.glow}, inset 0 1px 1px rgba(255,255,255,0.4)` : 'none',
                    }}
                    className={`h-[4px] sm:h-[4.5px] w-full rounded-[1px] transition-colors duration-200 ${
                      isLit ? 'opacity-100' : 'opacity-25'
                    }`}
                  />
                );
              })}
            </div>

            {/* Readout */}
            <div className="flex flex-col items-center leading-none mt-0.5">
              <span className={`text-[9px] font-black ${garageAvail > 0 ? 'text-[#34d399]' : 'text-rose-400'}`}>
                {garageAvail} Open
              </span>
              <span className="text-[7.5px] text-gray-400 font-medium">
                {garageUsed}/{garageCap} Used
              </span>
            </div>
          </div>
        </div>

        {/* Circling traffic alert if congested */}
        {circlingCarCount > 0 && (
          <div className="w-full pt-0.5 border-t border-white/10 flex items-center justify-center gap-1 text-[7.5px] font-bold text-amber-300">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span>{circlingCarCount} Cruising</span>
          </div>
        )}

        {/* Footer Hint */}
        <span className="text-[7.5px] text-gray-300 font-medium leading-none tracking-tight">
          Click for details &rarr;
        </span>
      </div>
    );
  }

  // Standard / Full-size instrument panel display
  return (
    <div
      id="led-bar-indicator-gauge-card"
      className={`bg-[#091929] border border-[#0081BC]/50 rounded-xl p-3 sm:p-4 text-white shadow-2xl flex flex-col gap-3 ${className}`}
    >
      {showTitle && (
        <div className="flex items-center justify-between pb-2 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#004B8D] text-cyan-300 shadow-inner">
              <Gauge className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-white leading-tight flex items-center gap-1.5">
                <span>LED Space Availability Gauge</span>
                <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              </h4>
              <p className="text-[10px] text-gray-300">
                Live side-by-side indicator: bars illuminate upward as space becomes available
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/60 border border-cyan-500/30 px-2 py-0.5 rounded uppercase tracking-wider font-bold">
            Real-Time
          </span>
        </div>
      )}

      {/* Side-by-Side Dual LED Channel Racks */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 bg-[#06121f] p-3 sm:p-4 rounded-xl border border-white/10 shadow-inner">
        {/* Channel 1: Street Parking Bar */}
        <div className="flex flex-col items-center bg-[#0d2238]/90 border border-white/10 p-2.5 sm:p-3 rounded-lg shadow-sm">
          {/* Channel Header */}
          <div className="flex items-center justify-between w-full mb-2">
            <span className="text-xs font-black uppercase tracking-wider text-sky-300 flex items-center gap-1.5">
              <Car className="w-3.5 h-3.5 text-sky-400" />
              Street Parking
            </span>
            <span className="text-[10px] font-mono font-bold text-gray-300">
              CH 1
            </span>
          </div>

          {/* LED Bar with Calibration Scale on the side */}
          <div className="flex items-center gap-2 sm:gap-3 w-full justify-center my-1">
            {/* Scale Percent Marks */}
            <div className="flex flex-col justify-between h-[120px] text-[8px] font-mono text-gray-400 text-right pr-0.5">
              <span>100%</span>
              <span>75%</span>
              <span>50%</span>
              <span>25%</span>
              <span>0%</span>
            </div>

            {/* LED Segment Bar */}
            <div className="flex flex-col gap-[3px] p-1.5 bg-[#050e18] border border-cyan-500/30 rounded-md shadow-2xl w-[50px] sm:w-[60px] h-[120px] justify-between">
              {Array.from({ length: 10 }).map((_, idx) => {
                const segIdx = 9 - idx; // Top = 9, Bottom = 0
                const isLit = segIdx < streetLitCount;
                const seg = LED_SEGMENTS[segIdx];
                return (
                  <div
                    key={`street-seg-${segIdx}`}
                    style={{
                      backgroundColor: isLit ? seg.color : 'rgba(255, 255, 255, 0.05)',
                      boxShadow: isLit
                        ? `0 0 6px ${seg.glow}, inset 0 1px 1px rgba(255,255,255,0.6)`
                        : 'inset 0 1px 1px rgba(0,0,0,0.5)',
                    }}
                    className={`h-[8px] w-full rounded-[2px] transition-all duration-200 border ${
                      isLit ? 'border-white/30 opacity-100' : 'border-white/5 opacity-20'
                    }`}
                    title={`Street Space Level: ${seg.level} Available`}
                  />
                );
              })}
            </div>
          </div>

          {/* Readout & Availability Status */}
          <div className="w-full mt-2 pt-2 border-t border-white/10 flex flex-col gap-0.5 text-center">
            <div className="flex items-baseline justify-center gap-1.5">
              <span className={`text-base sm:text-lg font-black ${streetAvail > 0 ? 'text-[#34d399]' : 'text-rose-400'}`}>
                {streetAvail}
              </span>
              <span className="text-[11px] font-bold text-gray-200">
                Spaces Available
              </span>
            </div>
            <div className="text-[10px] text-gray-300 font-medium">
              <span className="text-amber-300 font-bold">{streetUsed}</span> used of{' '}
              <span className="text-white font-bold">{streetCap}</span> legal stalls ({streetAvailPct}% free)
            </div>
            {streetAvail === 0 && (
              <span className="mt-1 inline-flex items-center justify-center gap-1 text-[9px] font-black text-rose-300 bg-rose-950/80 border border-rose-500/40 rounded py-0.5 px-1.5 animate-pulse">
                <AlertCircle className="w-3 h-3" />
                STREET AT CAPACITY
              </span>
            )}
          </div>
        </div>

        {/* Channel 2: Private / Garage Use Bar */}
        <div className="flex flex-col items-center bg-[#0d2238]/90 border border-white/10 p-2.5 sm:p-3 rounded-lg shadow-sm">
          {/* Channel Header */}
          <div className="flex items-center justify-between w-full mb-2">
            <span className="text-xs font-black uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
              <Warehouse className="w-3.5 h-3.5 text-amber-400" />
              Private / Garage
            </span>
            <span className="text-[10px] font-mono font-bold text-gray-300">
              CH 2
            </span>
          </div>

          {/* LED Bar with Calibration Scale on the side */}
          <div className="flex items-center gap-2 sm:gap-3 w-full justify-center my-1">
            {/* Scale Percent Marks */}
            <div className="flex flex-col justify-between h-[120px] text-[8px] font-mono text-gray-400 text-right pr-0.5">
              <span>100%</span>
              <span>75%</span>
              <span>50%</span>
              <span>25%</span>
              <span>0%</span>
            </div>

            {/* LED Segment Bar */}
            <div className="flex flex-col gap-[3px] p-1.5 bg-[#050e18] border border-amber-500/30 rounded-md shadow-2xl w-[50px] sm:w-[60px] h-[120px] justify-between">
              {Array.from({ length: 10 }).map((_, idx) => {
                const segIdx = 9 - idx; // Top = 9, Bottom = 0
                const isLit = segIdx < garageLitCount;
                const seg = LED_SEGMENTS[segIdx];
                return (
                  <div
                    key={`garage-seg-${segIdx}`}
                    style={{
                      backgroundColor: isLit ? seg.color : 'rgba(255, 255, 255, 0.05)',
                      boxShadow: isLit
                        ? `0 0 6px ${seg.glow}, inset 0 1px 1px rgba(255,255,255,0.6)`
                        : 'inset 0 1px 1px rgba(0,0,0,0.5)',
                    }}
                    className={`h-[8px] w-full rounded-[2px] transition-all duration-200 border ${
                      isLit ? 'border-white/30 opacity-100' : 'border-white/5 opacity-20'
                    }`}
                    title={`Garage Space Level: ${seg.level} Available`}
                  />
                );
              })}
            </div>
          </div>

          {/* Readout & Availability Status */}
          <div className="w-full mt-2 pt-2 border-t border-white/10 flex flex-col gap-0.5 text-center">
            <div className="flex items-baseline justify-center gap-1.5">
              <span className={`text-base sm:text-lg font-black ${garageAvail > 0 ? 'text-[#34d399]' : 'text-rose-400'}`}>
                {garageAvail}
              </span>
              <span className="text-[11px] font-bold text-gray-200">
                Spaces Available
              </span>
            </div>
            <div className="text-[10px] text-gray-300 font-medium">
              <span className="text-[#4ade80] font-bold">{garageUsed}</span> used of{' '}
              <span className="text-white font-bold">{garageCap}</span> private stalls ({garageAvailPct}% free)
            </div>
            {garageAvail === 0 && (
              <span className="mt-1 inline-flex items-center justify-center gap-1 text-[9px] font-black text-rose-300 bg-rose-950/80 border border-rose-500/40 rounded py-0.5 px-1.5 animate-pulse">
                <AlertCircle className="w-3 h-3" />
                GARAGES FULL
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Narrative Footer */}
      <div className="flex items-center justify-between text-[11px] text-gray-300 bg-[#0e2439] p-2 rounded-lg border border-white/10">
        <span className="flex items-center gap-1.5 font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm" />
          <span>More LEDs illuminated = greater parking space available</span>
        </span>
        <span className="font-mono text-cyan-300 text-[10px] font-semibold">
          Total: {streetAvail + garageAvail} Free Stalls
        </span>
      </div>
    </div>
  );
};
