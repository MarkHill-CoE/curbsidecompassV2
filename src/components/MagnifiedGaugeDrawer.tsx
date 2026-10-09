import React, { useEffect } from 'react';
import { 
  Gauge, 
  Sliders, 
  Car, 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  X, 
  Home, 
  Warehouse, 
  Users, 
  ArrowRight
} from 'lucide-react';
import { triggerFeedback } from '../utils/feedback';
import { useAppText } from '../context/TextContentContext';

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
  householdCarsPerHome?: number;
  drivewayCapacity?: number;
  occupiedGaragesCount?: number;
  totalGarageSpacesCapacity?: number;
  onDrivewayCapacityChange?: (newCapacity: number) => void;
  onOpenManualSliders?: () => void;
  onSwitchToStaticView?: () => void;
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
  householdCarsPerHome = 1.8,
  drivewayCapacity = 1,
  occupiedGaragesCount = 0,
  totalGarageSpacesCapacity = 12,
  onDrivewayCapacityChange,
  onOpenManualSliders,
  onSwitchToStaticView
}) => {
  const { t } = useAppText();

  // Escape key handler to close the modal
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

  // Primary Metrics & Calculations
  const streetCap = Math.max(1, curbsideStallsCapacity || 12);
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
  const isHealthy = curbsidePct < 80;

  const statusLabel = isCritical
    ? t('gauge_status_critical', 'Critical Overload')
    : isStrained
    ? t('gauge_status_strained', 'High Utilization')
    : t('gauge_status_healthy', 'Space Available');

  const statusColorClasses = isCritical
    ? {
        badge: 'bg-rose-500/15 text-rose-300 border-rose-500/40',
        text: 'text-rose-400',
        bar: 'bg-rose-500'
      }
    : isStrained
    ? {
        badge: 'bg-amber-500/15 text-amber-300 border-amber-500/40',
        text: 'text-amber-400',
        bar: 'bg-amber-400'
      }
    : {
        badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40',
        text: 'text-emerald-400',
        bar: 'bg-emerald-400'
      };

  // Modern Vector Arc Gauge parameters
  const cx = 150;
  const cy = 125;
  const r = 90;
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

  // Discrete capacity slots for Street (up to 12)
  const streetSlotsCount = Math.min(24, streetCap);
  const streetFilledSlots = Math.min(streetSlotsCount, Math.round((streetUsed / streetCap) * streetSlotsCount));

  // Discrete capacity slots for Garage (up to 12)
  const garageSlotsCount = Math.min(24, garageCap);
  const garageFilledSlots = Math.min(garageSlotsCount, Math.round((garageUsed / garageCap) * garageSlotsCount));

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
        className="relative bg-[#0c1929] border border-[#1e3a5f] p-4 sm:p-6 rounded-2xl shadow-2xl w-full max-w-4xl mx-auto my-auto flex flex-col gap-4 text-white max-h-[96dvh] [@media(max-height:500px)]:max-h-[98dvh] overflow-y-auto"
      >
        {/* Top Header / Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#004B8D] text-cyan-300 shadow-inner">
              <Gauge className="w-5 h-5" />
            </div>
            <div>
              <h3 id="magnified-gauge-title" className="font-bold text-white text-base sm:text-lg leading-none tracking-tight">
                {t('gauge_drawer_title', 'Curbside Parking Demand Gauge')}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {t('gauge_drawer_subtitle', 'Live street simulation variables')}
              </p>
            </div>
          </div>

          <button
            type="button"
            aria-label={t('drawer_gauge_close_aria', 'Close magnified parking gauge')}
            onClick={() => {
              triggerFeedback('button');
              onClose();
            }}
            className="text-slate-400 hover:text-white flex items-center justify-center w-9 h-9 rounded-lg hover:bg-white/10 transition-colors cursor-pointer active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Hero Section: Primary Overall Status Gauge Banner */}
        <div className="bg-[#0f233a] border border-white/10 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-inner">
          {/* Vector Arc Speedometer */}
          <div className="flex items-center justify-center shrink-0">
            <svg
              viewBox="0 0 300 145"
              className="w-[210px] sm:w-[240px] h-auto overflow-visible select-none"
              aria-hidden="true"
            >
              {/* Background Arc */}
              <path
                d={`M ${p0.x} ${p0.y} A ${r} ${r} 0 0 1 ${p200.x} ${p200.y}`}
                fill="none"
                stroke="#172b44"
                strokeWidth="12"
                strokeLinecap="round"
              />

              {/* Balanced Zone (0 - 80%) */}
              <path
                d={`M ${p0.x} ${p0.y} A ${r} ${r} 0 0 1 ${p80.x} ${p80.y}`}
                fill="none"
                stroke="#10b981"
                strokeWidth="12"
                strokeLinecap="round"
              />

              {/* High Utilization Zone (80 - 130%) */}
              <path
                d={`M ${p80.x} ${p80.y} A ${r} ${r} 0 0 1 ${p130.x} ${p130.y}`}
                fill="none"
                stroke="#f59e0b"
                strokeWidth="12"
                strokeLinecap="round"
              />

              {/* Critical Overload Zone (130 - 200%) */}
              <path
                d={`M ${p130.x} ${p130.y} A ${r} ${r} 0 0 1 ${p200.x} ${p200.y}`}
                fill="none"
                stroke="#ef4444"
                strokeWidth="12"
                strokeLinecap="round"
              />

              {/* Scale Tick Labels */}
              {[
                { pct: 0, label: '0%' },
                { pct: 80, label: '80%' },
                { pct: 100, label: '100%' },
                { pct: 130, label: '130%' },
                { pct: 200, label: '200%' },
              ].map((tick) => {
                const rad = Math.PI + (tick.pct / 200) * Math.PI;
                const textR = r - 18;
                const tx = cx + textR * Math.cos(rad);
                const ty = cy + textR * Math.sin(rad);
                return (
                  <text
                    key={tick.pct}
                    x={tx}
                    y={ty + 3}
                    textAnchor="middle"
                    fill="#94a3b8"
                    fontSize="8.5"
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
                  x1={cx - 8}
                  y1={cy}
                  x2={cx + r - 6}
                  y2={cy}
                  stroke="#ffffff"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <circle cx={cx + r - 10} cy={cy} r="3" fill="#FFC72C" />
              </g>

              {/* Center Pivot */}
              <circle cx={cx} cy={cy} r="6" fill="#004B8D" stroke="#ffffff" strokeWidth="2" />
              <circle cx={cx} cy={cy} r="2.5" fill="#FFC72C" />
            </svg>
          </div>

          {/* Primary Status Readout Callout */}
          <div className="flex-1 flex flex-col justify-center items-center md:items-start text-center md:text-left gap-1.5">
            <div className="flex items-center gap-2.5 flex-wrap justify-center md:justify-start">
              <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                {curbsidePct}%
              </span>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full border uppercase tracking-wider ${statusColorClasses.badge}`}>
                Parking Demand
              </span>
            </div>
          </div>

          {/* Circling traffic badge if active */}
          {circlingCarCount > 0 && (
            <div className="bg-amber-500/10 border border-amber-400/30 rounded-lg p-2.5 flex items-center gap-2 text-xs font-bold text-amber-300 shrink-0">
              <AlertTriangle className="w-4 h-4 text-amber-400 animate-pulse" />
              <span>{circlingCarCount} Cruising Vehicles</span>
            </div>
          )}
        </div>

        {/* Dedicated Dual Breakdown (Street vs. Private/Garage) - Directly below Curbside Demand vs Legal Capacity */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4 items-stretch">
          {/* Panel A: Street Parking */}
          <div className="bg-[#0f233a] border border-white/10 rounded-xl p-4 flex flex-col justify-between gap-3 shadow-inner">
            {/* Panel Header */}
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-sky-500/20 text-sky-400">
                  <Car className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="font-bold text-white text-sm">
                    Street Parking
                  </h5>
                </div>
              </div>

              <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-md border ${
                streetPct >= 100
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                  : streetPct >= 80
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
              }`}>
                {streetPct}% Occupied
              </span>
            </div>

            {/* Core Numerical Callout */}
            <div className="grid grid-cols-2 gap-2 text-center py-1">
              <div className="bg-[#0b1b2d] p-2.5 rounded-lg border border-white/5">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Occupied</span>
                <div className="text-xl sm:text-2xl font-black text-white mt-0.5">
                  <span className={streetPct >= 80 ? 'text-amber-400' : 'text-white'}>{streetUsed}</span>
                  <span className="text-xs text-slate-400 font-normal"> / {streetCap}</span>
                </div>
              </div>
              <div className="bg-[#0b1b2d] p-2.5 rounded-lg border border-white/5">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Free Available</span>
                <div className={`text-xl sm:text-2xl font-black mt-0.5 ${streetFree > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {streetFree}
                  <span className="text-xs text-slate-400 font-normal"> stalls</span>
                </div>
              </div>
            </div>

            {/* Modern Discrete Segmented Capacity Bar */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                <span>0 Stalls</span>
                <span>Capacity: {streetCap} Stalls</span>
              </div>

              <div className="grid grid-cols-12 gap-1 p-1.5 bg-[#081524] rounded-lg border border-white/10">
                {Array.from({ length: streetSlotsCount }).map((_, idx) => {
                  const isFilled = idx < streetFilledSlots;
                  return (
                    <div
                      key={`street-slot-${idx}`}
                      className={`h-3 rounded-[2px] transition-all duration-200 ${
                        isFilled
                          ? streetPct >= 100
                            ? 'bg-rose-500 shadow-[0_0_6px_rgba(239,68,68,0.5)]'
                            : streetPct >= 80
                            ? 'bg-amber-400 shadow-[0_0_6px_rgba(245,158,11,0.5)]'
                            : 'bg-cyan-400 shadow-[0_0_6px_rgba(6,182,212,0.5)]'
                          : 'bg-[#16273b]'
                      }`}
                      title={`Stall ${idx + 1}: ${isFilled ? 'Occupied' : 'Free'}`}
                    />
                  );
                })}
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-400 mt-0.5">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span>{streetUsed} Occupied ({streetPct}%)</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#16273b] border border-slate-600" />
                  <span>{streetFree} Free ({100 - streetPct}%)</span>
                </span>
              </div>
            </div>
          </div>

          {/* Panel B: Private / Garage Parking */}
          <div className="bg-[#0f233a] border border-white/10 rounded-xl p-4 flex flex-col justify-between gap-3 shadow-inner">
            {/* Panel Header */}
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
                  <Warehouse className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="font-bold text-white text-sm">
                    Private / Garage Parking
                  </h5>
                </div>
              </div>

              <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-md border ${
                garagePct >= 100
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
              }`}>
                {garagePct >= 100 ? '100% FULL' : `${garagePct}% Occupied`}
              </span>
            </div>

            {/* Core Numerical Callout */}
            <div className="grid grid-cols-2 gap-2 text-center py-1">
              <div className="bg-[#0b1b2d] p-2.5 rounded-lg border border-white/5">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Occupied</span>
                <div className="text-xl sm:text-2xl font-black text-white mt-0.5">
                  <span className={garagePct >= 100 ? 'text-rose-400' : 'text-white'}>{garageUsed}</span>
                  <span className="text-xs text-slate-400 font-normal"> / {garageCap}</span>
                </div>
              </div>
              <div className="bg-[#0b1b2d] p-2.5 rounded-lg border border-white/5">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Free Available</span>
                <div className={`text-xl sm:text-2xl font-black mt-0.5 ${garageFree > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {garageFree}
                  <span className="text-xs text-slate-400 font-normal"> {garageFree === 0 ? '(FULL)' : 'spaces'}</span>
                </div>
              </div>
            </div>

            {/* Modern Discrete Segmented Capacity Bar */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                <span>0 Spaces</span>
                <span>Capacity: {garageCap} Spaces</span>
              </div>

              <div className="grid grid-cols-12 gap-1 p-1.5 bg-[#081524] rounded-lg border border-white/10">
                {Array.from({ length: garageSlotsCount }).map((_, idx) => {
                  const isFilled = idx < garageFilledSlots;
                  return (
                    <div
                      key={`garage-slot-${idx}`}
                      className={`h-3 rounded-[2px] transition-all duration-200 ${
                        isFilled
                          ? garagePct >= 100
                            ? 'bg-rose-500 shadow-[0_0_6px_rgba(239,68,68,0.5)]'
                            : 'bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.5)]'
                          : 'bg-[#16273b]'
                      }`}
                      title={`Garage Space ${idx + 1}: ${isFilled ? 'Occupied' : 'Free'}`}
                    />
                  );
                })}
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-400 mt-0.5">
                <span className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${garagePct >= 100 ? 'bg-rose-500' : 'bg-emerald-400'}`} />
                  <span>{garageUsed} Occupied ({garagePct}%)</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#16273b] border border-slate-600" />
                  <span>{garageFree} Free ({100 - garagePct}%)</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* High-Level KPI Summary Grid (Block Overview) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] uppercase font-bold tracking-wider text-slate-400">
              Block Overview &bull; High-Level KPIs
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-2.5">
            {/* KPI 1: Total Dwellings */}
            <div className="bg-[#112438] border border-white/10 rounded-xl p-2.5 flex flex-col justify-between">
              <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1.5">
                <Home className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                Total Dwellings
              </span>
              <span className="text-base sm:text-lg font-black text-white mt-1">
                {totalDwellings}
              </span>
            </div>

            {/* KPI 2: Resident Vehicles */}
            <div className="bg-[#112438] border border-white/10 rounded-xl p-2.5 flex flex-col justify-between">
              <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1.5">
                <Car className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                Resident Vehicles
              </span>
              <span className="text-base sm:text-lg font-black text-white mt-1">
                {activeHouseholdCars}
              </span>
            </div>

            {/* KPI 3: Visitor Vehicles */}
            <div className="bg-[#112438] border border-white/10 rounded-xl p-2.5 flex flex-col justify-between">
              <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                Visitor Vehicles
              </span>
              <span className="text-base sm:text-lg font-black text-white mt-1">
                {activeVisitorCars}
              </span>
            </div>

            {/* KPI 4: Street Parking Stalls */}
            <div className="bg-[#112438] border border-white/10 rounded-xl p-2.5 flex flex-col justify-between">
              <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1.5">
                <Car className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                Street Stalls
              </span>
              <span className="text-base sm:text-lg font-black text-white mt-1">
                {streetCap}
              </span>
            </div>

            {/* KPI 5: Garage Parking Spaces */}
            <div className="bg-[#112438] border border-white/10 rounded-xl p-2.5 flex flex-col justify-between">
              <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1.5">
                <Warehouse className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                Garage Spaces
              </span>
              <span className="text-xs sm:text-sm font-bold text-white mt-1 truncate" title={`${drivewayCapacity === 1 ? '1 Space' : `${drivewayCapacity} Spaces`} / Garage`}>
                {drivewayCapacity === 1 ? '1 Space / Garage' : `${drivewayCapacity} Spaces / Garage`}
              </span>
            </div>

            {/* KPI 6: Total Active Vehicles Parked */}
            <div className="bg-[#112438] border border-emerald-500/30 rounded-xl p-2.5 flex flex-col justify-between">
              <span className="text-[10px] text-emerald-300 font-semibold flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                Total Parked
              </span>
              <div className="flex flex-col mt-0.5">
                <span className="text-base sm:text-lg font-black text-emerald-400 leading-tight">
                  {totalActiveVehiclesParked}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Action & Status Panel */}
        <div className="bg-[#0f233a] border border-white/10 rounded-xl p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-inner">
          {/* Informational Callout */}
          <div className="flex items-start gap-2.5 text-xs text-slate-300 leading-relaxed flex-1">
            <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p>
                <strong className="text-white">Approaching Capacity:</strong> Curb reaches ~85% occupancy. Minor cruising occurs during peak demand periods.
              </p>
            </div>
          </div>

          {/* Interactive Action Button */}
          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
            {onOpenManualSliders && (
              <button
                type="button"
                onClick={() => {
                  triggerFeedback('button');
                  onOpenManualSliders();
                }}
                className="w-full sm:w-auto py-2.5 px-4 bg-[#FFC72C] hover:bg-[#ffe066] active:bg-[#f5bc20] text-[#003566] font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer text-xs shadow-lg active:scale-95"
              >
                <Sliders className="w-4 h-4 text-[#003566]" />
                <span>Control Sliders &rarr;</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                triggerFeedback('button');
                onClose();
              }}
              className="w-full sm:w-auto py-2.5 px-4 bg-white/10 hover:bg-white/15 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer text-xs border border-white/10 active:scale-95"
            >
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>Done</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
