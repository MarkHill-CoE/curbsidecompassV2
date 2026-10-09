import React from 'react';
import { 
  Gauge, 
  Eye, 
  Sliders, 
  Car, 
  Warehouse, 
  Home, 
  Users, 
  CheckCircle, 
  AlertTriangle, 
  RotateCw
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
  drivewayCapacity?: number;
  householdCarsPerHome?: number;
  occupiedGaragesCount?: number;
  totalGarageSpacesCapacity?: number;
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
  drivewayCapacity = 1,
  householdCarsPerHome = 1.8,
  occupiedGaragesCount = 0,
  totalGarageSpacesCapacity = 12,
  policyNote,
  onSwitchToSimulation,
  onOpenManualSliders,
  onCurbsideDemandChange,
  onReshuffle
}) => {
  const { t } = useAppText();
  const layoutInfo = getStreetLayoutInfo(config.streetLayout);

  // Primary Metrics & Calculations
  const streetCap = Math.max(1, curbsideStallsCapacity || layoutInfo.curbsideCapacity || 12);
  const streetUsed = curbsideDemandCount;
  const streetFree = Math.max(0, streetCap - streetUsed);
  const streetPct = Math.round((streetUsed / streetCap) * 100);

  const garageCap = Math.max(1, totalGarageSpacesCapacity || (totalDwellings * (drivewayCapacity ?? 1)) || 12);
  const garageUsed = occupiedGaragesCount;
  const garageFree = Math.max(0, garageCap - garageUsed);
  const garagePct = Math.round((garageUsed / garageCap) * 100);

  const totalActiveVehiclesParked = streetUsed + garageUsed;

  // Status thresholds for Curbside Demand
  const isCritical = curbsidePct >= 130;
  const isStrained = curbsidePct >= 80 && curbsidePct < 130;

  const statusLabel = isCritical
    ? t('gauge_status_critical', 'Critical Overload')
    : isStrained
    ? t('gauge_status_strained', 'High Utilization')
    : t('gauge_status_healthy', 'Space Available');

  const statusColorClasses = isCritical
    ? {
        badge: 'bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-rose-950/30',
        text: 'text-rose-400',
        bar: 'bg-rose-500',
        glow: 'shadow-[0_0_10px_rgba(239,68,68,0.4)]'
      }
    : isStrained
    ? {
        badge: 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-amber-950/30',
        text: 'text-amber-400',
        bar: 'bg-amber-400',
        glow: 'shadow-[0_0_10px_rgba(245,158,11,0.4)]'
      }
    : {
        badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-emerald-950/30',
        text: 'text-emerald-400',
        bar: 'bg-emerald-400',
        glow: 'shadow-[0_0_10px_rgba(16,185,129,0.4)]'
      };

  // Speedometer Arc Gauge geometry
  const cx = 130;
  const cy = 110;
  const r = 78;
  const clampedPct = Math.min(200, Math.max(0, curbsidePct));
  // Needle angle from 180 (0%) to 360 (200%)
  const needleAngle = 180 + (clampedPct / 200) * 180;

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

  // Discrete capacity slots for Street
  const streetSlotsCount = Math.min(24, streetCap);
  const streetFilledSlots = Math.min(streetSlotsCount, Math.round((streetUsed / streetCap) * streetSlotsCount));

  // Discrete capacity slots for Garage
  const garageSlotsCount = Math.min(24, garageCap);
  const garageFilledSlots = Math.min(garageSlotsCount, Math.round((garageUsed / garageCap) * garageSlotsCount));

  return (
    <div
      id="detailed-static-screen-container"
      className="w-full h-full bg-[#0c1a2c] text-white flex flex-col justify-start [@media(orientation:portrait)_and_(max-width:1023px)]:justify-center p-1.5 sm:p-2.5 overflow-y-auto overscroll-contain select-none gap-1.5"
    >
      {/* 1. Compact Top Bar: Street Layout Typology & Mode Switchers (hidden in mobile vertical to center the primary gauge and parking components) */}
      <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-white/10 shrink-0 [@media(orientation:portrait)_and_(max-width:1023px)]:hidden">
        {/* Street Layout & Neighbourhood Callout */}
        <div className="flex items-center gap-1.5 min-w-0">
          <div className="p-1 rounded-md bg-[#004B8D] text-cyan-300 shrink-0">
            <Gauge className="w-3.5 h-3.5" />
          </div>
          <div className="flex items-center gap-1.5 min-w-0 truncate">
            <span className="font-extrabold text-white text-xs sm:text-sm truncate">
              Static View
            </span>
          </div>
        </div>

        {/* Action Controls: Live Sim & Manual Sliders */}
        <div className="flex items-center gap-1 shrink-0">
          {onReshuffle && (
            <button
              type="button"
              onClick={() => {
                triggerFeedback('button');
                onReshuffle();
              }}
              className="p-1 sm:px-2 sm:py-1 rounded-md bg-white/10 hover:bg-white/15 text-gray-300 hover:text-white transition-colors cursor-pointer text-[11px] flex items-center gap-1 min-h-[30px]"
              title={t('sim_reshuffle_title', 'Randomize Parking Distribution')}
            >
              <RotateCw className="w-3 h-3" />
              <span className="hidden md:inline">Reshuffle</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              triggerFeedback('button');
              onOpenManualSliders();
            }}
            className="p-1 sm:px-2 sm:py-1 rounded-md bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-400/40 transition-colors cursor-pointer text-[11px] font-bold flex items-center gap-1 min-h-[30px]"
            title={t('static_acc_assumptions_title', 'Customize Street Assumptions')}
          >
            <Sliders className="w-3 h-3 text-amber-300" />
            <span className="hidden sm:inline">Controls</span>
          </button>

          <button
            type="button"
            onClick={() => {
              triggerFeedback('button');
              onSwitchToSimulation();
            }}
            className="p-1 sm:px-2.5 sm:py-1 rounded-md bg-[#FFC72C] hover:bg-[#ffe066] active:bg-[#f5bc20] text-[#003566] transition-colors cursor-pointer text-[11px] font-black flex items-center gap-1 min-h-[30px] shadow-xs active:scale-95"
            title={t('static_header_live_sim_title', 'Switch to animated 2.5D simulation')}
          >
            <Eye className="w-3 h-3" />
            <span className="hidden xs:inline">{t('static_header_live_sim_btn', 'Live Sim')}</span>
          </button>
        </div>
      </div>

      {/* 2. Hero Section: Detailed Vector Arc Gauge & Curbside Demand vs Legal Capacity */}
      <div className="bg-[#0f233a] border border-white/10 rounded-xl p-1.5 sm:p-2.5 flex flex-row items-center justify-between [@media(orientation:portrait)_and_(max-width:1023px)]:justify-center gap-2 sm:gap-3.5 shadow-inner shrink-0 w-full max-w-md mx-auto">
        {/* Speedometer Arc Gauge */}
        <div className="flex items-center justify-center shrink-0">
          <svg
            viewBox="0 0 260 130"
            className="w-[100px] xs:w-[115px] sm:w-[135px] md:w-[145px] h-auto overflow-visible select-none shrink-0"
            aria-hidden="true"
          >
            {/* Background Arc */}
            <path
              d={`M ${p0.x} ${p0.y} A ${r} ${r} 0 0 1 ${p200.x} ${p200.y}`}
              fill="none"
              stroke="#172b44"
              strokeWidth="11"
              strokeLinecap="round"
            />

            {/* Balanced Zone (0 - 80%) */}
            <path
              d={`M ${p0.x} ${p0.y} A ${r} ${r} 0 0 1 ${p80.x} ${p80.y}`}
              fill="none"
              stroke="#10b981"
              strokeWidth="11"
              strokeLinecap="round"
            />

            {/* High Utilization Zone (80 - 130%) */}
            <path
              d={`M ${p80.x} ${p80.y} A ${r} ${r} 0 0 1 ${p130.x} ${p130.y}`}
              fill="none"
              stroke="#f59e0b"
              strokeWidth="11"
              strokeLinecap="round"
            />

            {/* Critical Overload Zone (130 - 200%) */}
            <path
              d={`M ${p130.x} ${p130.y} A ${r} ${r} 0 0 1 ${p200.x} ${p200.y}`}
              fill="none"
              stroke="#ef4444"
              strokeWidth="11"
              strokeLinecap="round"
            />

            {/* Scale Tick Labels */}
            {[
              { pct: 0, label: '0%' },
              { pct: 80, label: '80%' },
              { pct: 100, label: '100%' },
              { pct: 130, label: '130%' },
              { pct: 200, label: '200%' }
            ].map((tick) => {
              const rad = Math.PI + (tick.pct / 200) * Math.PI;
              const textR = r - 16;
              const tx = cx + textR * Math.cos(rad);
              const ty = cy + textR * Math.sin(rad);
              return (
                <text
                  key={tick.pct}
                  x={tx}
                  y={ty + 3}
                  textAnchor="middle"
                  fill="#94a3b8"
                  fontSize="7.5"
                  fontWeight="700"
                  fontFamily="monospace"
                >
                  {tick.label}
                </text>
              );
            })}

            {/* Needle Indicator */}
            <g
              style={{
                transform: `rotate(${needleAngle}deg)`,
                transformOrigin: `${cx}px ${cy}px`,
                transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
              }}
            >
              <line
                x1={cx - 7}
                y1={cy}
                x2={cx + r - 5}
                y2={cy}
                stroke="#ffffff"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <circle cx={cx + r - 8} cy={cy} r="2.5" fill="#FFC72C" />
            </g>

            {/* Center Pivot */}
            <circle cx={cx} cy={cy} r="5" fill="#004B8D" stroke="#ffffff" strokeWidth="1.5" />
            <circle cx={cx} cy={cy} r="2" fill="#FFC72C" />
          </svg>
        </div>

        {/* Primary Readout Callout */}
        <div className="flex-1 flex flex-col justify-center items-start text-left gap-0.5 sm:gap-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xl sm:text-2xl font-black text-white tracking-tight leading-none">
              {curbsidePct}%
            </span>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border uppercase tracking-wider ${statusColorClasses.badge}`}>
              Parking Demand
            </span>
            <span className="text-[10px] font-semibold text-slate-300 hidden xs:inline">
              ({statusLabel})
            </span>
          </div>

          {/* Cruising Vehicles Alert */}
          {circlingCarCount > 0 && (
            <div className="bg-amber-500/15 border border-amber-400/40 rounded-md px-1.5 py-0.5 flex items-center gap-1 text-[10px] font-bold text-amber-300 mt-0.5">
              <AlertTriangle className="w-3 h-3 text-amber-400 animate-pulse shrink-0" />
              <span>{circlingCarCount} Cruising</span>
            </div>
          )}
        </div>
      </div>

      {/* 3. Combined Parking Capacity: Street & Private/Garage LED Scales */}
      <div className="bg-[#0f233a] border border-white/10 rounded-xl p-1.5 sm:p-2.5 flex flex-col gap-1.5 sm:gap-2 shadow-inner shrink-0 w-full max-w-md mx-auto">
        {/* Street Parking LED Scale */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 min-w-0">
              <div className="p-1 rounded bg-sky-500/20 text-sky-400 shrink-0">
                <Car className="w-3.5 h-3.5" />
              </div>
              <span className="font-bold text-white truncate">
                Street Parking
              </span>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-[10px] text-slate-400">
                {streetFree > 0 ? `${streetFree} free` : '0 free'}
              </span>
              <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                streetPct >= 100
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  : streetPct >= 80
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
              }`}>
                {streetPct}%
              </span>
            </div>
          </div>

          {/* Discrete LED Segmented Bar for Street */}
          <div 
            className="grid gap-0.5 p-1 bg-[#081524] rounded-md border border-white/10"
            style={{ gridTemplateColumns: `repeat(${streetSlotsCount}, minmax(0, 1fr))` }}
          >
            {Array.from({ length: streetSlotsCount }).map((_, idx) => {
              const isFilled = idx < streetFilledSlots;
              return (
                <div
                  key={`street-slot-${idx}`}
                  className={`h-2.5 rounded-[2px] transition-all duration-200 ${
                    isFilled
                      ? streetPct >= 100
                        ? 'bg-rose-500 shadow-[0_0_5px_rgba(239,68,68,0.5)]'
                        : streetPct >= 80
                        ? 'bg-amber-400 shadow-[0_0_5px_rgba(245,158,11,0.5)]'
                        : 'bg-cyan-400 shadow-[0_0_5px_rgba(6,182,212,0.5)]'
                      : 'bg-[#16273b]'
                  }`}
                  title={`Street Stall ${idx + 1}: ${isFilled ? 'Occupied' : 'Free'}`}
                />
              );
            })}
          </div>
        </div>

        {/* Private / Garage Parking LED Scale */}
        <div className="flex flex-col gap-1 pt-1.5 border-t border-white/5">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 min-w-0">
              <div className="p-1 rounded bg-amber-500/20 text-amber-400 shrink-0">
                <Warehouse className="w-3.5 h-3.5" />
              </div>
              <span className="font-bold text-white truncate">
                Private / Garage Parking
              </span>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-[10px] text-slate-400">
                {garageFree > 0 ? `${garageFree} free` : 'FULL'}
              </span>
              <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                garagePct >= 100
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
              }`}>
                {garagePct >= 100 ? '100% FULL' : `${garagePct}%`}
              </span>
            </div>
          </div>

          {/* Discrete LED Segmented Bar for Garage */}
          <div 
            className="grid gap-0.5 p-1 bg-[#081524] rounded-md border border-white/10"
            style={{ gridTemplateColumns: `repeat(${garageSlotsCount}, minmax(0, 1fr))` }}
          >
            {Array.from({ length: garageSlotsCount }).map((_, idx) => {
              const isFilled = idx < garageFilledSlots;
              return (
                <div
                  key={`garage-slot-${idx}`}
                  className={`h-2.5 rounded-[2px] transition-all duration-200 ${
                    isFilled
                      ? garagePct >= 100
                        ? 'bg-rose-500 shadow-[0_0_5px_rgba(239,68,68,0.5)]'
                        : 'bg-emerald-400 shadow-[0_0_5px_rgba(16,185,129,0.5)]'
                      : 'bg-[#16273b]'
                  }`}
                  title={`Garage Space ${idx + 1}: ${isFilled ? 'Occupied' : 'Free'}`}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. High-Level KPIs Row (Block Overview) */}
      <div className="shrink-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
            Block Overview &bull; High-Level KPIs
          </span>
        </div>

        <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-6 gap-1.5">
          {/* KPI 1: Dwellings */}
          <div className="bg-[#112438] border border-white/10 rounded-lg p-1.5 flex flex-col justify-between">
            <span className="text-[9px] text-slate-400 font-semibold flex items-center gap-1">
              <Home className="w-3 h-3 text-indigo-400 shrink-0 [@media(orientation:landscape)_and_(max-height:540px)]:hidden" />
              Dwellings
            </span>
            <span className="text-sm sm:text-base font-black text-white mt-0.5">
              {totalDwellings}
            </span>
          </div>

          {/* KPI 2: Resident Vehicles */}
          <div className="bg-[#112438] border border-white/10 rounded-lg p-1.5 flex flex-col justify-between">
            <span className="text-[9px] text-slate-400 font-semibold flex items-center gap-1">
              <Car className="w-3 h-3 text-sky-400 shrink-0 [@media(orientation:landscape)_and_(max-height:540px)]:hidden" />
              Resident Cars
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-sm sm:text-base font-black text-white">
                {activeHouseholdCars}
              </span>
            </div>
          </div>

          {/* KPI 3: Visitor Vehicles */}
          <div className="bg-[#112438] border border-white/10 rounded-lg p-1.5 flex flex-col justify-between">
            <span className="text-[9px] text-slate-400 font-semibold flex items-center gap-1">
              <Users className="w-3 h-3 text-pink-400 shrink-0 [@media(orientation:landscape)_and_(max-height:540px)]:hidden" />
              Visitors
            </span>
            <span className="text-sm sm:text-base font-black text-white mt-0.5">
              {activeVisitorCars}
            </span>
          </div>

          {/* KPI 4: Street Stalls */}
          <div className="bg-[#112438] border border-white/10 rounded-lg p-1.5 flex flex-col justify-between">
            <span className="text-[9px] text-slate-400 font-semibold flex items-center gap-1">
              <Car className="w-3 h-3 text-cyan-400 shrink-0 [@media(orientation:landscape)_and_(max-height:540px)]:hidden" />
              Street Stalls
            </span>
            <span className="text-sm sm:text-base font-black text-white mt-0.5">
              {streetCap}
            </span>
          </div>

          {/* KPI 5: Garage Spaces */}
          <div className="bg-[#112438] border border-white/10 rounded-lg p-1.5 flex flex-col justify-between">
            <span className="text-[9px] text-slate-400 font-semibold flex items-center gap-1">
              <Warehouse className="w-3 h-3 text-amber-400 shrink-0 [@media(orientation:landscape)_and_(max-height:540px)]:hidden" />
              Garages
            </span>
            <span className="text-xs sm:text-sm font-bold text-white mt-0.5 truncate">
              {garageCap} Spaces
            </span>
          </div>

          {/* KPI 6: Total Parked */}
          <div className="bg-[#112438] border border-emerald-500/30 rounded-lg p-1.5 flex flex-col justify-between">
            <span className="text-[9px] text-emerald-300 font-semibold flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-emerald-400 shrink-0 [@media(orientation:landscape)_and_(max-height:540px)]:hidden" />
              Total Parked
            </span>
            <div className="flex flex-col mt-0.5">
              <span className="text-sm sm:text-base font-black text-emerald-400 leading-none">
                {totalActiveVehiclesParked}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
