import React, { useState } from 'react';
import { Warehouse, X } from 'lucide-react';
import { triggerFeedback } from '../utils/feedback';
import { useAppText } from '../context/TextContentContext';

export interface GarageUsageHintBoxProps {
  curbsidePct: number;
  drivewayCapacity?: number;
  occupiedGaragesCount?: number;
  totalGarageSpacesCapacity?: number;
  onDrivewayCapacityChange?: (newCapacity: number) => void;
  onOpenControlSliders?: () => void;
  className?: string;
  variant?: 'floating' | 'inline';
}

export const GarageUsageHintBox: React.FC<GarageUsageHintBoxProps> = ({
  curbsidePct,
  drivewayCapacity = 1,
  onDrivewayCapacityChange,
  className = '',
  variant = 'floating'
}) => {
  const { t } = useAppText();
  const [isDismissed, setIsDismissed] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  const currentCap = drivewayCapacity ?? 1;

  // Requirement: Trigger if Curbside Utilization is above 80% and vehicles per garage is 1 or fewer.
  // Once the user interacts with the slider, keep it open until dismissed so they can adjust and see the immediate effect.
  const shouldShow = ((curbsidePct > 80 && drivewayCapacity <= 1) || hasInteracted) && !isDismissed;

  if (!shouldShow) return null;

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
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-[#FFC72C] border border-amber-400/30 leading-none">
                  {currentCap} {currentCap === 1 ? 'stall/home' : 'stalls/home'}
                </span>
              </div>
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

        {/* Narrative / Contextual Hint */}
        <p className="text-xs text-gray-200 leading-relaxed">
          Curbside demand is high at <span className="font-bold text-amber-300">{curbsidePct}%</span>. Increasing private garage usage shifts parking off-street to keep lanes clear.
        </p>

        {/* Garage Use Slider */}
        <div className="flex flex-col gap-1.5 pt-2 border-t border-white/10">
          <div className="flex items-center justify-between text-xs">
            <label htmlFor="inline-garage-slider" className="text-gray-200 font-bold flex items-center gap-1.5 cursor-pointer">
              <span>Garage Use Slider:</span>
            </label>
            <span className="font-mono font-black text-xs text-[#FFC72C] bg-amber-950/60 border border-amber-500/30 px-2 py-0.5 rounded">
              {currentCap} {currentCap === 1 ? 'stall / home' : 'stalls / home'}
            </span>
          </div>

          <input
            id="inline-garage-slider"
            type="range"
            min="0"
            max="3"
            step="1"
            value={currentCap}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              setHasInteracted(true);
              triggerFeedback('choice');
              onDrivewayCapacityChange?.(val);
            }}
            aria-label={t('drawer_sliders_driveway_aria', 'Private off-street parking stalls per home')}
            className="accent-[#FFC72C] cursor-pointer h-2 bg-gray-700 rounded-lg w-full"
          />

          <div className="flex items-center justify-between text-[10px] text-gray-400 font-medium">
            <span>0 (Street only)</span>
            <span>1 (Default)</span>
            <span>2</span>
            <span>3 (Max garage)</span>
          </div>
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
      {/* Header */}
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

      {/* Explainer / Prompt */}
      <p className="text-xs text-gray-200 leading-snug">
        Curbside is at <span className="font-bold text-amber-300">{curbsidePct}%</span>. Adjust private garage usage to shift cars off-street:
      </p>

      {/* Garage Use Slider: replaces link to controls and removed vehicles parked/space container */}
      <div className="flex flex-col gap-1.5 pt-2 border-t border-white/10">
        <div className="flex items-center justify-between text-xs">
          <label htmlFor="hint-garage-slider" className="text-gray-200 font-bold flex items-center gap-1.5 cursor-pointer">
            <span>Garage Use Slider:</span>
          </label>
          <span className="font-mono font-black text-xs text-[#FFC72C] bg-amber-950/60 border border-amber-500/30 px-2 py-0.5 rounded">
            {currentCap} {currentCap === 1 ? 'stall / home' : 'stalls / home'}
          </span>
        </div>

        <input
          id="hint-garage-slider"
          type="range"
          min="0"
          max="3"
          step="1"
          value={currentCap}
          onChange={(e) => {
            const val = parseInt(e.target.value, 10);
            setHasInteracted(true);
            triggerFeedback('choice');
            onDrivewayCapacityChange?.(val);
          }}
          aria-label={t('drawer_sliders_driveway_aria', 'Private off-street parking stalls per home')}
          className="accent-[#FFC72C] cursor-pointer h-2 bg-gray-700 rounded-lg w-full"
        />

        <div className="flex items-center justify-between text-[10px] text-gray-400 font-medium">
          <span>0 (Street only)</span>
          <span>1 (Default)</span>
          <span>2</span>
          <span>3 (Max garage)</span>
        </div>
      </div>
    </div>
  );
};
