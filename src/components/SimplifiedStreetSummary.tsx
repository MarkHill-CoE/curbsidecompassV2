import React, { useState } from 'react';
import { 
  Home, 
  Sliders, 
  Eye, 
  ChevronDown, 
  ChevronUp, 
  AlertTriangle, 
  CheckCircle2
} from 'lucide-react';
import { SimulationConfig } from '../types';
import { triggerFeedback } from '../utils/feedback';
import { QuestionTradeoffOutcome } from '../data/surveyData';
import { useAppText } from '../context/TextContentContext';
import { getStreetLayoutInfo } from '../data/edmontonNeighbourhoods';

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
  const { t } = useAppText();
  // Accordion open/close state (only Private & Off-Street Parking remains expandable)
  const [openAccordion, setOpenAccordion] = useState<'offstreet' | null>(null);

  const toggleAccordion = (tab: 'offstreet') => {
    triggerFeedback('button');
    setOpenAccordion((prev) => (prev === tab ? null : tab));
  };

  // Determine coloured box indicator styling & concise status label
  const getStatusIndicator = () => {
    if (curbsidePct >= 105) {
      return {
        label: t('static_status_overcrowded_label', 'OVERCROWDED'),
        badgeBg: 'bg-red-600 text-white border-red-700 shadow-red-900/30',
        sliderColor: 'accent-red-500',
        barColor: 'bg-red-500',
        textColor: 'text-red-400',
        shortDesc: t('static_status_overcrowded_desc', 'Demand exceeds legal curbside capacity. Vehicles circle for spots.'),
        icon: AlertTriangle
      };
    }
    if (curbsidePct >= 86) {
      return {
        label: t('static_status_near_capacity_label', 'NEAR CAPACITY'),
        badgeBg: 'bg-amber-500 text-black border-amber-600 font-black shadow-amber-900/30',
        sliderColor: 'accent-amber-400',
        barColor: 'bg-amber-400',
        textColor: 'text-amber-300',
        shortDesc: t('static_status_near_capacity_desc', 'Curbside nearly full. Limited turnover for visitors and couriers.'),
        icon: AlertTriangle
      };
    }
    return {
      label: t('static_status_balanced_label', 'BALANCED AVAILABILITY'),
      badgeBg: 'bg-emerald-600 text-white border-emerald-700 shadow-emerald-900/30',
      sliderColor: 'accent-emerald-400',
      barColor: 'bg-emerald-500',
      textColor: 'text-emerald-300',
      shortDesc: t('static_status_balanced_desc', 'Optimal street parking with open spots for visitors and delivery vans.'),
      icon: CheckCircle2
    };
  };

  const status = getStatusIndicator();
  const StatusIcon = status.icon;

  // Off-street calculations
  const occupiedGarages = Math.min(12, Math.max(0, Math.round(activeHouseholdCars * 0.5)));
  const vacantGarages = Math.max(0, 12 - occupiedGarages);

  return (
    <div className="w-full h-full bg-[#112438] text-white flex flex-col justify-start p-2.5 sm:p-4 overflow-y-auto overscroll-contain select-none gap-2 sm:gap-2.5">
      {/* 1. Header Bar: Compact & Minimal */}
      <div className="flex items-center justify-between gap-1.5 sm:gap-2 pb-1.5 sm:pb-2 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          <h2 className="text-xs sm:text-sm md:text-base font-black tracking-tight text-white uppercase truncate">
            {t('static_header_title', 'Curbside Street Stalls Overview')}
          </h2>
        </div>

        {/* Quick link to toggle live sim */}
        <button
          type="button"
          onClick={() => {
            triggerFeedback('button');
            onSwitchToSimulation();
          }}
          className="text-xs font-bold text-[#FFC72C] hover:text-white flex items-center gap-1 px-2 sm:px-2.5 py-1 bg-white/10 hover:bg-white/15 rounded-md transition-all cursor-pointer shrink-0 min-h-[36px]"
          title={t('static_header_live_sim_title', 'Switch to animated 2.5D simulation')}
        >
          <Eye className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{t('static_header_live_sim_btn', 'Live Simulation')}</span>
        </button>
      </div>

      {/* Street Layout & Neighbourhood Typology Callout */}
      {(() => {
        const layoutInfo = getStreetLayoutInfo(config.streetLayout);
        return (
          <div className="flex items-center justify-between px-2.5 py-1.5 bg-[#193A5A]/80 border border-[#0081BC]/40 rounded-lg text-xs shrink-0 shadow-xs">
            <div className="flex items-center gap-1.5 min-w-0 truncate">
              <span className="text-sm leading-none shrink-0" role="img" aria-label={layoutInfo.title}>{layoutInfo.icon}</span>
              <span className="font-extrabold text-white text-xs truncate">{layoutInfo.title}</span>
              {config.neighbourhoodName && (
                <span className="text-emerald-300 font-semibold truncate text-[11px]">
                  • {config.neighbourhoodName}
                </span>
              )}
            </div>
            <span className="text-[10px] font-black px-2 py-0.5 rounded bg-white/10 text-gray-200 border border-white/15 shrink-0 font-mono">
              {curbsideStallsCapacity} Stalls
            </span>
          </div>
        );
      })()}

      {/* 2. Primary High-Priority Indicators Card */}
      <div className="bg-[#193A5A]/95 border border-[#0081BC]/50 rounded-xl p-2.5 sm:p-3.5 shadow-lg flex flex-col gap-2 sm:gap-2.5 shrink-0">
        {/* ROW A: Coloured Box Indicator & Occupancy % */}
        <div className="flex items-center justify-between gap-1.5 sm:gap-2 flex-wrap">
          {/* Prioritized Coloured Box Indicator */}
          <div className={`flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg border-2 font-black text-xs sm:text-sm tracking-wide shadow-md ${status.badgeBg}`}>
            <StatusIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span>{status.label}</span>
          </div>

          {/* Occupancy Percentage & Stalls Counter */}
          <div className="text-right">
            <span className="text-lg sm:text-2xl font-black text-white tracking-tight">
              {curbsidePct}%
            </span>
            <span className="text-[10px] sm:text-xs text-gray-300 block font-medium">
              {curbsideDemandCount} {t('static_stalls_occupied_of', 'of')} {curbsideStallsCapacity} {t('static_stalls_occupied_suffix', 'stalls occupied')}
            </span>
          </div>
        </div>

        {/* ROW B: Curbside Occupancy Slider */}
        <div className="flex flex-col gap-1 pt-0.5 sm:pt-1">
          <div className="flex justify-between items-center text-[11px] sm:text-xs text-gray-300 font-semibold">
            <span>{t('static_slider_label', 'Curbside Occupancy Slider:')}</span>
            <span className="font-mono text-[#FFC72C]">
              {curbsideDemandCount} {t('static_slider_cars_unit', 'cars')} / {curbsideStallsCapacity} {t('static_slider_cap_unit', 'capacity')}
            </span>
          </div>

          <div className="relative flex items-center w-full">
            <input
              type="range"
              min="0"
              max={Math.max(20, Math.round(curbsideStallsCapacity * 1.5))}
              step="1"
              value={curbsideDemandCount}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                if (onCurbsideDemandChange) {
                  onCurbsideDemandChange(val);
                }
              }}
              className={`w-full h-3 bg-black/50 rounded-lg appearance-none cursor-pointer border border-white/20 transition-all touch-manipulation ${status.sliderColor}`}
              aria-label={t('static_slider_aria_label', 'Curbside parking occupancy slider')}
            />
          </div>

          {/* Target calibration tick markers */}
          <div className="flex justify-between items-center text-[9px] sm:text-[10px] text-gray-400 font-mono px-0.5">
            <span>{t('static_tick_0', '0 Stalls')}</span>
            <span className="text-emerald-400 font-bold">{t('static_tick_ideal', 'Ideal (85% Target)')}</span>
            <span className="text-gray-300">{curbsideStallsCapacity} {t('static_tick_max', 'Max Stalls')}</span>
            <span className="text-red-400 font-bold">{Math.round(curbsideStallsCapacity * 1.5)} {t('static_tick_overload', 'Overload')}</span>
          </div>
        </div>

        {/* ROW C: Summary Text Box */}
        <div className="bg-black/35 border border-white/10 rounded-lg p-2 sm:p-2.5 text-[11px] sm:text-xs text-gray-200 leading-relaxed">
          <p className="font-medium">
            <strong className="text-white">{t('static_summary_prefix', 'Summary: ')}</strong>
            {status.shortDesc}{' '}
            {curbsideDemandCount < curbsideStallsCapacity ? (
              <span className="text-emerald-300 font-semibold ml-1">
                {curbsideStallsCapacity - curbsideDemandCount} {t('static_summary_open_suffix', 'curbside spot(s) currently open.')}
              </span>
            ) : (
              <span className="text-red-300 font-semibold ml-1">
                {curbsideDemandCount - curbsideStallsCapacity} {t('static_summary_over_suffix', 'vehicle(s) over physical stall capacity.')}
              </span>
            )}
          </p>
        </div>

        {/* ROW E: Number of Vehicles Circling for Parking */}
        <div className={`flex items-center gap-2 p-1.5 sm:p-2 rounded-lg border text-xs font-bold transition-all ${
          circlingCarCount > 0 
            ? 'bg-amber-500/20 border-amber-500/50 text-amber-200' 
            : 'bg-emerald-500/15 border-emerald-500/40 text-emerald-200'
        }`}>
          <div className={`w-2 h-2 rounded-full shrink-0 ${circlingCarCount > 0 ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`} />
          <span className="text-xs sm:text-sm">
            {circlingCarCount > 0 
              ? `🚗 ${circlingCarCount} ${circlingCarCount === 1 ? t('static_circling_single', 'vehicle') : t('static_circling_plural', 'vehicles')} ${t('static_circling_active', 'circling looking for parking')}` 
              : `🚗 ${t('static_circling_none', '0 vehicles circling (street traffic flowing freely)')}`}
          </span>
        </div>
      </div>

      {/* 3. Expandable Accordion Tabs for Secondary Containers */}
      <div className="flex flex-col gap-1.5 sm:gap-2 pt-0.5 sm:pt-1 shrink-0">
        {/* Accordion Item 1: Private & Off Street Parking */}
        <div className="border border-white/15 rounded-lg overflow-hidden bg-[#162e47]">
          <button
            type="button"
            onClick={() => toggleAccordion('offstreet')}
            className="w-full flex items-center justify-between p-2 sm:p-2.5 text-xs font-bold text-white hover:bg-white/5 transition-colors cursor-pointer select-none min-h-[38px] sm:min-h-[44px]"
            aria-expanded={openAccordion === 'offstreet'}
          >
            <div className="flex items-center gap-1.5 sm:gap-2 truncate">
              <Home className="w-4 h-4 text-[#FFC72C] shrink-0" />
              <span className="truncate">{t('static_acc_offstreet_title', 'Private & Off-Street Parking')}</span>
              <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-gray-300 font-mono shrink-0">
                {occupiedGarages}/12 {t('static_acc_offstreet_garages_full', 'Garages Full')}
              </span>
            </div>
            {openAccordion === 'offstreet' ? (
              <ChevronUp className="w-4 h-4 text-gray-300 shrink-0" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-300 shrink-0" />
            )}
          </button>

          {openAccordion === 'offstreet' && (
            <div className="p-2.5 sm:p-3 pt-0 border-t border-white/10 text-xs animate-in fade-in duration-150">
              <div className="grid grid-cols-2 gap-1.5 sm:gap-2 mt-2">
                <div className="bg-black/30 p-2 rounded border border-white/5">
                  <span className="text-gray-400 text-[10px] block uppercase font-bold">{t('static_acc_garages_label', 'Rear Garages')}</span>
                  <span className="font-bold text-white text-xs">{occupiedGarages} {t('static_acc_garages_occupied', 'occupied')} • {vacantGarages} {t('static_acc_garages_vacant', 'vacant')}</span>
                </div>
                <div className="bg-black/30 p-2 rounded border border-white/5">
                  <span className="text-gray-400 text-[10px] block uppercase font-bold">{t('static_acc_cars_label', 'Household Cars')}</span>
                  <span className="font-bold text-white text-xs">{activeHouseholdCars} {t('static_acc_cars_suffix', 'total cars')}</span>
                </div>
                <div className="bg-black/30 p-2 rounded border border-white/5">
                  <span className="text-gray-400 text-[10px] block uppercase font-bold">{t('static_acc_visitors_label', 'Visitor Cars')}</span>
                  <span className="font-bold text-white text-xs">{activeVisitorCars} {t('static_acc_visitors_suffix', 'vehicles')}</span>
                </div>
                <div className="bg-black/30 p-2 rounded border border-white/5">
                  <span className="text-gray-400 text-[10px] block uppercase font-bold">{t('static_acc_deliveries_label', 'Weekly Deliveries')}</span>
                  <span className="font-bold text-white text-xs">{totalWeeklyDeliveries} {t('static_acc_deliveries_suffix', 'courier visits')}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Direct Button: Customize Street Assumptions in Live Simulation */}
        <button
          type="button"
          onClick={() => {
            triggerFeedback('button');
            onSwitchToSimulation();
            onOpenManualSliders();
          }}
          className="w-full flex items-center justify-center gap-2 p-2 sm:p-2.5 text-xs sm:text-sm font-bold text-white bg-[#0081BC] hover:bg-[#006ca0] active:scale-[0.99] rounded-lg transition-all cursor-pointer shadow-sm border border-[#0099dd] min-h-[40px] sm:min-h-[44px]"
          title={t('static_btn_customize_livesim_title', 'Switch directly to live simulation and customize street assumptions')}
        >
          <Sliders className="w-4 h-4 text-[#FFC72C]" />
          <span>{t('static_acc_assumptions_title', 'Customize Street Assumptions')}</span>
        </button>

        {/* Direct Button: Switch to Live Simulation */}
        <button
          type="button"
          onClick={() => {
            triggerFeedback('button');
            onSwitchToSimulation();
          }}
          className="w-full flex items-center justify-center gap-2 p-2.5 sm:p-3 text-xs sm:text-sm font-black text-[#193A5A] bg-[#FFC72C] hover:bg-[#ffe066] active:scale-[0.99] rounded-lg transition-all cursor-pointer shadow-md border border-[#e6b325] min-h-[44px] sm:min-h-[48px]"
          title={t('static_btn_switch_livesim_title', 'Switch directly to the live 2.5D street simulation')}
        >
          <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-[#193A5A]" />
          <span>{t('static_btn_switch_livesim', 'Switch to Live Simulation')}</span>
        </button>
      </div>
    </div>
  );
};
