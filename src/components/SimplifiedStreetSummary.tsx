import React, { useState } from 'react';
import { 
  Home, 
  Sliders, 
  Eye, 
  ChevronDown, 
  ChevronUp, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles
} from 'lucide-react';
import { SimulationConfig } from '../types';
import { triggerFeedback } from '../utils/feedback';
import { QuestionTradeoffOutcome } from '../data/surveyData';

interface SimplifiedStreetSummaryProps {
  config: SimulationConfig;
  curbsidePct: number;
  curbsideDemandCount: number;
  curbsideStallsCapacity: number;
  circlingCarCount: number;
  activeHouseholdCars: number;
  activeVisitorCars: number;
  totalDwellings: number;
  totalWeeklyDeliveries: number;
  tradeoffOutcome?: QuestionTradeoffOutcome;
  currentStep?: number;
  policyNote?: string;
  onSwitchToSimulation: () => void;
  onOpenMagnifiedGauge: () => void;
  onOpenManualSliders: () => void;
  onCurbsideDemandChange?: (newDemand: number) => void;
  onReshuffle?: () => void;
}

export const SimplifiedStreetSummary: React.FC<SimplifiedStreetSummaryProps> = ({
  config,
  curbsidePct,
  curbsideDemandCount,
  curbsideStallsCapacity,
  circlingCarCount,
  activeHouseholdCars,
  activeVisitorCars,
  totalDwellings,
  totalWeeklyDeliveries,
  tradeoffOutcome,
  currentStep = 0,
  policyNote,
  onSwitchToSimulation,
  onOpenMagnifiedGauge,
  onOpenManualSliders,
  onCurbsideDemandChange,
}) => {
  // Accordion open/close state
  const [openAccordion, setOpenAccordion] = useState<'offstreet' | 'assumptions' | null>(null);

  const toggleAccordion = (tab: 'offstreet' | 'assumptions') => {
    triggerFeedback('button');
    setOpenAccordion((prev) => (prev === tab ? null : tab));
  };

  // Determine coloured box indicator styling & concise status label
  const getStatusIndicator = () => {
    if (curbsidePct >= 105) {
      return {
        label: 'OVERCROWDED',
        badgeBg: 'bg-red-600 text-white border-red-700 shadow-red-900/30',
        sliderColor: 'accent-red-500',
        barColor: 'bg-red-500',
        textColor: 'text-red-400',
        shortDesc: 'Demand exceeds legal curbside capacity. Vehicles circle for spots.',
        icon: AlertTriangle
      };
    }
    if (curbsidePct >= 86) {
      return {
        label: 'NEAR CAPACITY',
        badgeBg: 'bg-amber-500 text-black border-amber-600 font-black shadow-amber-900/30',
        sliderColor: 'accent-amber-400',
        barColor: 'bg-amber-400',
        textColor: 'text-amber-300',
        shortDesc: 'Curbside nearly full. Limited turnover for visitors and couriers.',
        icon: AlertTriangle
      };
    }
    return {
      label: 'BALANCED AVAILABILITY',
      badgeBg: 'bg-emerald-600 text-white border-emerald-700 shadow-emerald-900/30',
      sliderColor: 'accent-emerald-400',
      barColor: 'bg-emerald-500',
      textColor: 'text-emerald-300',
      shortDesc: 'Optimal street parking with open spots for visitors and delivery vans.',
      icon: CheckCircle2
    };
  };

  const status = getStatusIndicator();
  const StatusIcon = status.icon;

  // Off-street calculations
  const occupiedGarages = Math.min(12, Math.max(0, Math.round(activeHouseholdCars * 0.5)));
  const vacantGarages = Math.max(0, 12 - occupiedGarages);

  return (
    <div className="w-full h-full bg-[#112438] text-white flex flex-col justify-start p-3 sm:p-4 overflow-y-auto select-none gap-2.5">
      {/* 1. Header Bar: Compact & Minimal */}
      <div className="flex items-center justify-between gap-2 pb-2 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          <h2 className="text-sm sm:text-base font-black tracking-tight text-white uppercase">
            Curbside Street Stalls Overview
          </h2>
          <span className="text-[11px] text-gray-300 bg-white/10 px-2 py-0.5 rounded font-mono">
            12-Home Block
          </span>
        </div>

        {/* Quick link to toggle live sim */}
        <button
          type="button"
          onClick={() => {
            triggerFeedback('button');
            onSwitchToSimulation();
          }}
          className="text-xs font-bold text-[#FFC72C] hover:text-white flex items-center gap-1 px-2.5 py-1 bg-white/10 hover:bg-white/15 rounded-md transition-all cursor-pointer"
          title="Switch to animated 2.5D simulation"
        >
          <Eye className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Live Simulation</span>
        </button>
      </div>

      {/* 2. Primary High-Priority Indicators Card */}
      <div className="bg-[#193A5A]/95 border border-[#0081BC]/50 rounded-xl p-3 sm:p-3.5 shadow-lg flex flex-col gap-2.5 shrink-0">
        {/* ROW A: Coloured Box Indicator & Occupancy % */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          {/* Prioritized Coloured Box Indicator */}
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-2 font-black text-xs sm:text-sm tracking-wide shadow-md ${status.badgeBg}`}>
            <StatusIcon className="w-4 h-4 shrink-0" />
            <span>{status.label}</span>
          </div>

          {/* Occupancy Percentage & Stalls Counter */}
          <div className="text-right">
            <span className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {curbsidePct}%
            </span>
            <span className="text-xs text-gray-300 block font-medium">
              {curbsideDemandCount} of {curbsideStallsCapacity} stalls occupied
            </span>
          </div>
        </div>

        {/* ROW B: Curbside Occupancy Slider */}
        <div className="flex flex-col gap-1 pt-1">
          <div className="flex justify-between items-center text-xs text-gray-300 font-semibold">
            <span>Curbside Occupancy Slider:</span>
            <span className="font-mono text-[#FFC72C]">
              {curbsideDemandCount} cars / {curbsideStallsCapacity} capacity
            </span>
          </div>

          <div className="relative flex items-center w-full">
            <input
              type="range"
              min="0"
              max="24"
              step="1"
              value={curbsideDemandCount}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                if (onCurbsideDemandChange) {
                  onCurbsideDemandChange(val);
                }
              }}
              className={`w-full h-3 bg-black/50 rounded-lg appearance-none cursor-pointer border border-white/20 transition-all ${status.sliderColor}`}
              aria-label="Curbside parking occupancy slider"
            />
          </div>

          {/* Target calibration tick markers */}
          <div className="flex justify-between items-center text-[10px] text-gray-400 font-mono px-0.5">
            <span>0 Stalls</span>
            <span className="text-emerald-400 font-bold">Ideal (85% Target)</span>
            <span className="text-gray-300">16 Max Stalls</span>
            <span className="text-red-400 font-bold">24 Overload</span>
          </div>
        </div>

        {/* ROW C: Summary Text Box */}
        <div className="bg-black/35 border border-white/10 rounded-lg p-2.5 text-xs text-gray-200 leading-relaxed">
          <p className="font-medium">
            <strong className="text-white">Summary: </strong>
            {status.shortDesc}
            {curbsideDemandCount < curbsideStallsCapacity ? (
              <span className="text-emerald-300 font-semibold ml-1">
                {curbsideStallsCapacity - curbsideDemandCount} curbside spot(s) currently open.
              </span>
            ) : (
              <span className="text-red-300 font-semibold ml-1">
                {curbsideDemandCount - curbsideStallsCapacity} vehicle(s) over physical stall capacity.
              </span>
            )}
          </p>
        </div>

        {/* ROW D: Number of Vehicles Circling for Parking */}
        <div className={`flex items-center gap-2 p-2 rounded-lg border text-xs font-bold transition-all ${
          circlingCarCount > 0 
            ? 'bg-amber-500/20 border-amber-500/50 text-amber-200' 
            : 'bg-emerald-500/15 border-emerald-500/40 text-emerald-200'
        }`}>
          <div className={`w-2 h-2 rounded-full shrink-0 ${circlingCarCount > 0 ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`} />
          <span className="text-sm">
            {circlingCarCount > 0 
              ? `🚗 ${circlingCarCount} ${circlingCarCount === 1 ? 'vehicle' : 'vehicles'} circling looking for parking` 
              : '🚗 0 vehicles circling (street traffic flowing freely)'}
          </span>
        </div>

        {/* ROW E: Answer Choice Impact Text (Live Tradeoff Response) */}
        <div className="bg-gradient-to-r from-[#004B8D]/60 to-[#0081BC]/40 border-2 border-[#0081BC]/60 rounded-lg p-2.5 text-xs">
          <div className="flex items-center justify-between gap-1 mb-1">
            <span className="text-[11px] font-black uppercase tracking-wider text-[#FFC72C] flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              Answer Choice Impact & Trade-Off
            </span>
            {tradeoffOutcome?.deltaStallsText && (
              <span className={`text-[11px] font-black px-2 py-0.5 rounded ${
                (tradeoffOutcome.deltaStallsValue ?? 0) > 0 
                  ? 'bg-amber-500/30 text-amber-200 border border-amber-400/40' 
                  : (tradeoffOutcome.deltaStallsValue ?? 0) < 0 
                  ? 'bg-emerald-500/30 text-emerald-200 border border-emerald-400/40'
                  : 'bg-blue-500/30 text-blue-200 border border-blue-400/40'
              }`}>
                {tradeoffOutcome.deltaStallsText}
              </span>
            )}
          </div>

          {tradeoffOutcome?.hasAnswer ? (
            <div className="space-y-1">
              <p className="text-white font-bold text-xs sm:text-[13px] leading-snug">
                {tradeoffOutcome.selectedOptionLabel}
              </p>
              <p className="text-gray-200 text-[11px] sm:text-xs leading-relaxed">
                <strong>Trade-off: </strong>{tradeoffOutcome.tradeoffRationale}
              </p>
              <p className="text-blue-200 text-[11px] font-medium">
                {tradeoffOutcome.curbsideImpactSummary}
              </p>
            </div>
          ) : (
            <p className="text-gray-300 text-[11px] sm:text-xs italic leading-relaxed">
              {policyNote || `Select an option on Question ${currentStep + 1} to calculate its live impact on curbside stalls and street trade-offs.`}
            </p>
          )}
        </div>
      </div>

      {/* 3. Expandable Accordion Tabs for Secondary Containers */}
      <div className="flex flex-col gap-2 pt-1 shrink-0">
        {/* Accordion Item 1: Private & Off Street Parking */}
        <div className="border border-white/15 rounded-lg overflow-hidden bg-[#162e47]">
          <button
            type="button"
            onClick={() => toggleAccordion('offstreet')}
            className="w-full flex items-center justify-between p-2.5 text-xs font-bold text-white hover:bg-white/5 transition-colors cursor-pointer select-none"
            aria-expanded={openAccordion === 'offstreet'}
          >
            <div className="flex items-center gap-2">
              <Home className="w-4 h-4 text-[#FFC72C]" />
              <span>Private & Off-Street Parking</span>
              <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-gray-300 font-mono">
                {occupiedGarages}/12 Garages Full
              </span>
            </div>
            {openAccordion === 'offstreet' ? (
              <ChevronUp className="w-4 h-4 text-gray-300" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-300" />
            )}
          </button>

          {openAccordion === 'offstreet' && (
            <div className="p-3 pt-0 border-t border-white/10 text-xs animate-in fade-in duration-150">
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div className="bg-black/30 p-2 rounded border border-white/5">
                  <span className="text-gray-400 text-[10px] block uppercase font-bold">Rear Garages</span>
                  <span className="font-bold text-white text-xs">{occupiedGarages} occupied • {vacantGarages} vacant</span>
                </div>
                <div className="bg-black/30 p-2 rounded border border-white/5">
                  <span className="text-gray-400 text-[10px] block uppercase font-bold">Household Cars</span>
                  <span className="font-bold text-white text-xs">{activeHouseholdCars} total cars</span>
                </div>
                <div className="bg-black/30 p-2 rounded border border-white/5">
                  <span className="text-gray-400 text-[10px] block uppercase font-bold">Visitor Cars</span>
                  <span className="font-bold text-white text-xs">{activeVisitorCars} vehicles</span>
                </div>
                <div className="bg-black/30 p-2 rounded border border-white/5">
                  <span className="text-gray-400 text-[10px] block uppercase font-bold">Weekly Deliveries</span>
                  <span className="font-bold text-white text-xs">{totalWeeklyDeliveries} courier visits</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Accordion Item 2: Customize Street Assumptions */}
        <div className="border border-white/15 rounded-lg overflow-hidden bg-[#162e47]">
          <button
            type="button"
            onClick={() => toggleAccordion('assumptions')}
            className="w-full flex items-center justify-between p-2.5 text-xs font-bold text-white hover:bg-white/5 transition-colors cursor-pointer select-none"
            aria-expanded={openAccordion === 'assumptions'}
          >
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#FFC72C]" />
              <span>Customize Street Assumptions</span>
            </div>
            {openAccordion === 'assumptions' ? (
              <ChevronUp className="w-4 h-4 text-gray-300" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-300" />
            )}
          </button>

          {openAccordion === 'assumptions' && (
            <div className="p-3 pt-0 border-t border-white/10 text-xs animate-in fade-in duration-150">
              <p className="text-gray-300 text-xs my-2">
                Manually adjust dwellings, household cars per home, and delivery frequency.
              </p>
              <button
                type="button"
                onClick={() => {
                  triggerFeedback('button');
                  onOpenManualSliders();
                }}
                className="w-full flex items-center justify-center gap-1.5 text-xs font-bold text-white bg-[#0081BC] hover:bg-[#006ca0] py-2 rounded-lg transition-all cursor-pointer shadow-sm"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Open Manual Sliders Panel</span>
              </button>
            </div>
          )}
        </div>

        {/* Direct Button: Switch to Live Simulation */}
        <button
          type="button"
          onClick={() => {
            triggerFeedback('button');
            onSwitchToSimulation();
          }}
          className="w-full flex items-center justify-center gap-2 p-3 text-xs sm:text-sm font-black text-[#193A5A] bg-[#FFC72C] hover:bg-[#ffe066] active:scale-[0.99] rounded-lg transition-all cursor-pointer shadow-md border border-[#e6b325]"
          title="Switch directly to the live 2.5D street simulation"
        >
          <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-[#193A5A]" />
          <span>Switch to Live Simulation</span>
        </button>
      </div>
    </div>
  );
};
