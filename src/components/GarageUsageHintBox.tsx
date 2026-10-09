import React, { useState } from 'react';
import { Warehouse, Sliders, X } from 'lucide-react';
import { triggerFeedback } from '../utils/feedback';
import { useAppText } from '../context/TextContentContext';

interface GarageUsageHintBoxProps {
  curbsidePct: number;
  drivewayCapacity?: number;
  occupiedGaragesCount?: number;
  totalGarageSpacesCapacity?: number;
  onOpenControlSliders: () => void;
  className?: string;
  variant?: 'floating' | 'inline';
}

export const GarageUsageHintBox: React.FC<GarageUsageHintBoxProps> = ({
  curbsidePct,
  drivewayCapacity = 1,
  occupiedGaragesCount,
  totalGarageSpacesCapacity = 12,
  onOpenControlSliders,
  className = '',
  variant = 'floating'
}) => {
  const { t } = useAppText();
  const [isDismissed, setIsDismissed] = useState(false);

  // Requirement: If Curbside Utilization is above 80% and the number of vehicles per garage is 1 or fewer
  const shouldShow = curbsidePct > 80 && drivewayCapacity <= 1 && !isDismissed;

  if (!shouldShow) return null;

  const occupied = occupiedGaragesCount ?? (drivewayCapacity ? drivewayCapacity * 10 : 10);
  const totalCapacity = totalGarageSpacesCapacity || 12;
  const availableSpaces = Math.max(0, totalCapacity - occupied);
  const usagePct = Math.min(100, Math.round((occupied / Math.max(1, totalCapacity)) * 100));

  const handleOpenSliders = (e: React.MouseEvent) => {
    e.stopPropagation();
    triggerFeedback('button');
    onOpenControlSliders();
  };

  if (variant === 'inline') {
    return (
      <div
        id="garage-usage-hint-popup-inline"
        role="alert"
        aria-live="polite"
        className={`bg-[#0d2135] border-2 border-[#FFC72C] rounded-xl p-3 sm:p-4 text-white shadow-xl flex flex-col gap-2.5 sm:gap-3 animate-in fade-in duration-200 ${className}`}
      >
        {/* Header with Title and Dismiss */}
        <div className="flex items-center justify-between gap-2.5 pb-2 border-b border-white/10">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-1.5 rounded-lg bg-[#FFC72C]/20 text-[#FFC72C] shrink-0">
              <Warehouse className="w-4 h-4" />
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-sm font-bold text-white leading-tight">
                  {t('sim_garage_use_label', 'Private/Garage Use')}
                </h4>
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 leading-none">
                  {usagePct}% Utilized
                </span>
              </div>
              <span className="text-[11px] text-gray-300 font-medium mt-0.5">
                Vehicles parked / spaces available
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              triggerFeedback('button');
              setIsDismissed(true);
            }}
            aria-label="Dismiss hint"
            className="text-gray-400 hover:text-white p-1 rounded hover:bg-white/10 transition-colors cursor-pointer min-w-[28px] min-h-[28px] flex items-center justify-center shrink-0 -mr-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Measurement Grid: Vehicles Parked & Spaces Available */}
        <div className="grid grid-cols-2 gap-2 bg-[#142e47] p-2.5 rounded-lg border border-white/10">
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-300 font-semibold uppercase tracking-wider">
              Vehicles Parked
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-base sm:text-lg font-black text-[#4ade80]">
                {occupied}
              </span>
              <span className="text-[11px] text-gray-400 font-medium">
                / {totalCapacity} spaces
              </span>
            </div>
          </div>

          <div className="flex flex-col border-l border-white/10 pl-2.5">
            <span className="text-[10px] text-gray-300 font-semibold uppercase tracking-wider">
              Spaces Available
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-base sm:text-lg font-black text-[#FFC72C]">
                {availableSpaces}
              </span>
              <span className="text-[11px] text-gray-400 font-medium">
                free {availableSpaces === 1 ? 'stall' : 'stalls'}
              </span>
            </div>
          </div>
        </div>

        {/* Narrative / Contextual Hint */}
        <p className="text-xs text-gray-200 leading-relaxed">
          Curbside demand is high at <span className="font-bold text-amber-300">{curbsidePct}%</span>, while <span className="font-bold text-white">{availableSpaces}</span> private garage {availableSpaces === 1 ? 'space remains' : 'spaces remain'} available. Utilizing private garages shifts parking off-street to keep lanes clear.
        </p>

        {/* Action Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-2 border-t border-white/10 gap-2">
          <span className="text-xs text-gray-300 font-medium">
            Adjust garage allocation with control sliders:
          </span>
          <button
            type="button"
            onClick={handleOpenSliders}
            className="px-3.5 py-1.5 bg-[#FFC72C] hover:bg-[#ffe066] active:bg-[#f5bc20] text-[#004B8D] font-black rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5 shadow-md cursor-pointer active:scale-95 shrink-0"
            title="Open control sliders to adjust garage usage"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Control Sliders &rarr;</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      id="garage-usage-hint-popup"
      role="alert"
      aria-live="polite"
      onClick={(e) => e.stopPropagation()}
      className={`absolute z-30 max-w-[340px] w-[calc(100%-1.5rem)] sm:w-auto bg-[#0e263d]/95 backdrop-blur-md border-2 border-[#FFC72C] text-white p-3 rounded-xl shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-300 flex flex-col gap-2.5 ${className}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 text-[#FFC72C]">
          <div className="p-1 rounded-md bg-[#FFC72C]/20 shrink-0">
            <Warehouse className="w-4 h-4" />
          </div>
          <span className="text-[11px] uppercase font-black tracking-wider text-white">
            {t('sim_garage_use_label', 'Private/Garage Use')}
          </span>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            triggerFeedback('button');
            setIsDismissed(true);
          }}
          aria-label="Dismiss hint"
          className="text-gray-400 hover:text-white p-1 rounded hover:bg-white/10 transition-colors cursor-pointer min-w-[28px] min-h-[28px] flex items-center justify-center"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex items-center justify-between text-xs bg-[#142e47] p-2 rounded-lg border border-white/10">
        <span className="text-gray-300 text-[11px]">
          Vehicles parked / spaces:
        </span>
        <span className="font-bold text-white">
          <span className="text-[#4ade80]">{occupied}</span> / {totalCapacity} ({availableSpaces} free)
        </span>
      </div>

      <p className="text-xs text-gray-200 leading-snug">
        Curbside is at <span className="font-bold text-amber-300">{curbsidePct}%</span>. Would you like to increase private garage usage?
      </p>

      <div className="flex items-center justify-between pt-1 border-t border-white/10">
        <span className="text-[10px] text-gray-300 font-medium">
          {availableSpaces} spaces open
        </span>
        <button
          type="button"
          onClick={handleOpenSliders}
          className="text-xs font-bold text-[#FFC72C] hover:text-amber-200 underline inline-flex items-center gap-1.5 cursor-pointer transition-colors active:scale-95"
          title="Open control sliders"
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Control Sliders &rarr;</span>
        </button>
      </div>
    </div>
  );
};
