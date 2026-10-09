import React, { useEffect, useState } from 'react';
import { Gauge, Sliders, Car, AlertTriangle, CheckCircle, Info, X, Home, Warehouse, Users } from 'lucide-react';
import { triggerFeedback } from '../utils/feedback';
import { useAppText } from '../context/TextContentContext';
import { GarageUsageHintBox } from './GarageUsageHintBox';
import { LedBarIndicatorGauge } from './LedBarIndicatorGauge';

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
  householdCarsPerHome = 2.0,
  drivewayCapacity = 1,
  occupiedGaragesCount = 0,
  totalGarageSpacesCapacity = 12,
  onOpenManualSliders
}) => {
  const { t } = useAppText();
  const [meterDisplayMode, setMeterDisplayMode] = useState<'led' | 'linear'>('led');
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
    ? t('gauge_status_critical', 'Critical Overload')
    : isStrained
    ? t('gauge_status_strained', 'High Utilization')
    : t('gauge_status_healthy', 'Space Available');

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
  const totalVehiclesParked = curbsideDemandCount + occupiedGaragesCount;

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
        className="relative bg-[#11283f]/95 border-2 border-[#0081BC] p-3 sm:p-5 rounded-2xl shadow-2xl w-full max-w-md md:max-w-3xl lg:max-w-4xl mx-auto my-auto flex flex-col gap-2.5 sm:gap-3.5 text-white max-h-[96dvh] [@media(max-height:500px)]:max-h-[98dvh] overflow-y-auto"
      >
        {/* Header - Compact to preserve vertical room */}
        <div className="flex items-center justify-between pb-1.5 sm:pb-2 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-1 sm:p-1.5 rounded-lg bg-[#004B8D] text-[#FFC72C] shrink-0">
              <Gauge className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h3 id="magnified-gauge-title" className="font-bold text-white text-xs sm:text-sm md:text-base leading-none">
                {t('gauge_drawer_title', 'Curbside Parking Demand Gauge')}
              </h3>
              <span className="text-[9px] sm:text-[10px] text-gray-300">
                {t('gauge_drawer_subtitle', 'Live street utilization & capacity analysis')}
              </span>
            </div>
          </div>
          <button
            type="button"
            aria-label={t('drawer_gauge_close_aria', 'Close magnified parking gauge')}
            onClick={() => {
              triggerFeedback('button');
              onClose();
            }}
            className="text-gray-300 hover:text-white flex items-center justify-center min-w-[36px] min-h-[36px] sm:min-w-[44px] sm:min-h-[44px] font-bold text-lg cursor-pointer active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFC72C] rounded hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Responsive Body: Balanced 2-column layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 sm:gap-4 items-stretch">
          {/* Column 1: Live Dial & Allocation Summary */}
          <div className="md:col-span-5 flex flex-col justify-between bg-[#11283f]/90 p-3 sm:p-4 rounded-xl border border-white/10 shadow-inner gap-3">
            {/* Magnified Vector Dial Gauge */}
            <div className="flex flex-col items-center">
              <svg
                viewBox="0 0 300 155"
                className="w-full max-w-[210px] sm:max-w-[240px] md:max-w-[250px] [@media(orientation:landscape)_and_(max-height:500px)]:max-w-[155px] h-auto overflow-visible select-none"
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
              <div className="flex flex-col items-center -mt-2">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    {curbsidePct}%
                  </span>
                  <span className={`text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${statusBadgeColor}`}>
                    {statusLabel}
                  </span>
                </div>
                <span className="text-[10px] text-gray-300 font-medium tracking-wide mt-0.5">
                  {t('gauge_curbside_utilization_label', 'Curbside Demand vs Legal Capacity')}
                </span>
              </div>
            </div>

            {/* Visual Space Allocation: Switcher between LED Bars and Linear Meters */}
            <div className="flex flex-col gap-2 pt-2 border-t border-white/10">
              <div className="flex items-center justify-between pb-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-cyan-300 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                  Space Availability
                </span>
                <div className="flex items-center gap-0.5 bg-[#071524] p-0.5 rounded-md border border-white/10">
                  <button
                    type="button"
                    onClick={() => {
                      triggerFeedback('button');
                      setMeterDisplayMode('led');
                    }}
                    className={`px-2 py-0.5 text-[9px] font-bold rounded transition-colors cursor-pointer ${
                      meterDisplayMode === 'led'
                        ? 'bg-cyan-600 text-white shadow-xs'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    LED Bars
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      triggerFeedback('button');
                      setMeterDisplayMode('linear');
                    }}
                    className={`px-2 py-0.5 text-[9px] font-bold rounded transition-colors cursor-pointer ${
                      meterDisplayMode === 'linear'
                        ? 'bg-[#004B8D] text-white shadow-xs'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Linear Meters
                  </button>
                </div>
              </div>

              {meterDisplayMode === 'led' ? (
                <LedBarIndicatorGauge
                  curbsideDemandCount={curbsideDemandCount}
                  curbsideStallsCapacity={curbsideStallsCapacity}
                  occupiedGaragesCount={occupiedGaragesCount}
                  totalGarageSpacesCapacity={totalGarageSpacesCapacity}
                  circlingCarCount={circlingCarCount}
                  showTitle={false}
                />
              ) : (
                <>
                  {/* Row 1: Legal Curbside Stalls */}
                  <div className="bg-[#0d2135]/95 rounded-lg p-2 sm:p-2.5 border border-white/10 flex flex-col gap-1 shadow-inner">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-gray-300 font-semibold flex items-center gap-1.5">
                        <Car className="w-3.5 h-3.5 text-[#38bdf8] shrink-0" />
                        {t('gauge_occupied_suffix', 'Legal Curbside Stalls Occupied')}
                      </span>
                      <span className="font-black text-white text-xs">
                        <span className="text-[#FFC72C]">{curbsideDemandCount}</span> / {curbsideStallsCapacity}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 rounded-full ${
                          curbsidePct >= 130 ? 'bg-[#ff7043]' : curbsidePct >= 80 ? 'bg-[#FFC72C]' : 'bg-[#4ade80]'
                        }`}
                        style={{ width: `${Math.min(100, (curbsideDemandCount / Math.max(1, curbsideStallsCapacity)) * 100)}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[9px] sm:text-[10px] text-gray-300">
                      <span>{availableStalls > 0 ? `${availableStalls} ${t('gauge_stalls_free', 'Stalls Free')}` : `0 ${t('gauge_stalls_free', 'Stalls Free')}`}</span>
                      <span className={deficitStalls > 0 ? 'text-[#ff7043] font-bold' : 'text-[#4ade80] font-semibold'}>
                        {deficitStalls > 0 ? `${t('gauge_deficit_prefix', 'Deficit:')} ${deficitStalls} ${t('gauge_deficit_suffix', 'Cars')}` : t('gauge_smooth_label', 'Balanced Supply')}
                      </span>
                    </div>
                  </div>

                  {/* Row 2: Garage Parking Spaces */}
                  <div className="bg-[#0d2135]/95 rounded-lg p-2 sm:p-2.5 border border-white/10 flex flex-col gap-1 shadow-inner">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-gray-300 font-semibold flex items-center gap-1.5">
                        <Warehouse className="w-3.5 h-3.5 text-[#fbbf24] shrink-0" />
                        {t('sim_garage_use_label', 'Private/Garage Use')}
                      </span>
                      <span className="font-black text-white text-xs" title="Vehicles parked / spaces available">
                        <span className="text-[#4ade80]">{occupiedGaragesCount}</span> / {totalGarageSpacesCapacity}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#4ade80] transition-all duration-300 rounded-full"
                        style={{ width: `${Math.min(100, (occupiedGaragesCount / Math.max(1, totalGarageSpacesCapacity)) * 100)}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[9px] sm:text-[10px] text-gray-300">
                      <span>{Math.max(0, totalGarageSpacesCapacity - occupiedGaragesCount)} Free Garage Spaces</span>
                      <span className="text-gray-400">Off-Street Private</span>
                    </div>
                  </div>

                  {/* Circling Cars Alert */}
                  {circlingCarCount > 0 && (
                    <div className="px-2.5 py-1.5 rounded-lg bg-amber-500/15 border border-amber-400/30 flex items-center justify-between text-[10px] sm:text-[11px] font-semibold text-[#FFC72C]">
                      <span className="flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-[#FFC72C] shrink-0" />
                        {t('gauge_circling_cars_label', 'Circling Traffic')}
                      </span>
                      <span>{circlingCarCount} {t('gauge_cruising_label', 'Cruising Vehicles')}</span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Column 2: Thematic Metrics Breakdown, Insight & Actions */}
          <div className="md:col-span-7 flex flex-col justify-between gap-3 sm:gap-3.5">
            {/* Thematic Section 1: Neighbourhood Profile */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] sm:text-[11px] uppercase tracking-wider font-bold text-blue-200/80 px-0.5 flex items-center gap-1.5">
                <Home className="w-3 h-3 text-[#38bdf8]" />
                Neighbourhood Baseline
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {/* 1. Total Homes on the Block */}
                <div className="bg-[#193A5A]/80 border border-white/10 rounded-lg p-2 sm:p-2.5 flex flex-col justify-between hover:border-[#0081BC]/60 transition-colors shadow-xs">
                  <span className="text-gray-300 text-[10px] sm:text-[11px] font-semibold flex items-center gap-1.5 leading-tight">
                    <Home className="w-3.5 h-3.5 text-[#a78bfa] shrink-0" />
                    {t('gauge_homes_block_label', 'Total Homes on the Block')}
                  </span>
                  <span className="font-black text-xs sm:text-sm text-white mt-1 leading-tight">
                    {totalDwellings} {t('gauge_dwellings_label', 'Dwellings')}
                  </span>
                </div>

                {/* 2. Average Number of Vehicles Per Dwelling */}
                <div className="bg-[#193A5A]/80 border border-white/10 rounded-lg p-2 sm:p-2.5 flex flex-col justify-between hover:border-[#0081BC]/60 transition-colors shadow-xs">
                  <span className="text-gray-300 text-[10px] sm:text-[11px] font-semibold flex items-center gap-1.5 leading-tight">
                    <Car className="w-3.5 h-3.5 text-[#60a5fa] shrink-0" />
                    {t('gauge_avg_vehicles_dwelling_label', 'Average Number of Vehicles Per Dwelling')}
                  </span>
                  <span className="font-black text-xs sm:text-sm text-white mt-1 leading-tight">
                    {Number(householdCarsPerHome).toFixed(1)} Vehicles / Home
                  </span>
                </div>

                {/* 3. Total Number of Resident Vehicles */}
                <div className="bg-[#193A5A]/80 border border-white/10 rounded-lg p-2 sm:p-2.5 flex flex-col justify-between hover:border-[#0081BC]/60 transition-colors shadow-xs">
                  <span className="text-gray-300 text-[10px] sm:text-[11px] font-semibold flex items-center gap-1.5 leading-tight">
                    <Users className="w-3.5 h-3.5 text-[#FFC72C] shrink-0" />
                    {t('gauge_resident_visitor_vehicles_label', 'Total Number of Resident Vehicles')}
                  </span>
                  <span className="font-black text-xs sm:text-sm text-white mt-1 leading-tight">
                    {activeHouseholdCars} Vehicles
                  </span>
                </div>

                {/* 4. Total Number of Visitor Vehicles */}
                <div className="bg-[#193A5A]/80 border border-white/10 rounded-lg p-2 sm:p-2.5 flex flex-col justify-between hover:border-[#0081BC]/60 transition-colors shadow-xs">
                  <span className="text-gray-300 text-[10px] sm:text-[11px] font-semibold flex items-center gap-1.5 leading-tight">
                    <Users className="w-3.5 h-3.5 text-[#f472b6] shrink-0" />
                    {t('gauge_total_visitor_vehicles_label', 'Total Number of Visitor Vehicles')}
                  </span>
                  <span className="font-black text-xs sm:text-sm text-white mt-1 leading-tight">
                    {activeVisitorCars} Vehicles
                  </span>
                </div>
              </div>
            </div>

            {/* Thematic Section 2: Parking Infrastructure & Allocation */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] sm:text-[11px] uppercase tracking-wider font-bold text-blue-200/80 px-0.5 flex items-center gap-1.5">
                <Warehouse className="w-3 h-3 text-[#38bdf8]" />
                Parking Infrastructure & Supply
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {/* 5. Street Parking Stalls */}
                <div className="bg-[#193A5A]/80 border border-white/10 rounded-lg p-2 sm:p-2.5 flex flex-col justify-between hover:border-[#0081BC]/60 transition-colors shadow-xs">
                  <span className="text-gray-300 text-[10px] sm:text-[11px] font-semibold flex items-center gap-1.5 leading-tight">
                    <Car className="w-3.5 h-3.5 text-[#38bdf8] shrink-0" />
                    {t('gauge_street_parking_stalls_label', 'Street Parking Stalls')}
                  </span>
                  <span className="font-black text-xs sm:text-sm text-white mt-1 leading-tight">
                    {curbsideStallsCapacity} {t('gauge_stalls_unit', 'Stalls')}
                  </span>
                </div>

                {/* 6. Average Number of Vehicle Parking Spaces Per Garage */}
                <div className="bg-[#193A5A]/80 border border-white/10 rounded-lg p-2 sm:p-2.5 flex flex-col justify-between hover:border-[#0081BC]/60 transition-colors shadow-xs">
                  <span className="text-gray-300 text-[10px] sm:text-[11px] font-semibold flex items-center gap-1.5 leading-tight">
                    <Warehouse className="w-3.5 h-3.5 text-[#fbbf24] shrink-0" />
                    {t('gauge_avg_garage_spaces_label', 'Average Number of Vehicle Parking Spaces Per Garage')}
                  </span>
                  <span className="font-black text-xs sm:text-sm text-white mt-1 leading-tight">
                    {drivewayCapacity} Spaces / Garage
                  </span>
                </div>

                {/* Total Number of Vehicles Parked (On Street + In Garage) - Full Width */}
                <div className="col-span-2 bg-[#193A5A]/80 border border-white/10 rounded-lg p-2 sm:p-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1 hover:border-[#0081BC]/60 transition-colors shadow-xs">
                  <span className="text-gray-300 text-[10px] sm:text-[11px] font-semibold flex items-center gap-1.5 leading-tight">
                    <CheckCircle className="w-3.5 h-3.5 text-[#4ade80] shrink-0" />
                    {t('gauge_total_vehicles_parked_label', 'Total Number of Vehicles Parked (On Street + In Garage)')}
                  </span>
                  <span className="font-black text-xs sm:text-sm text-[#4ade80] leading-tight">
                    {totalVehiclesParked} Vehicles ({curbsideDemandCount} Street + {occupiedGaragesCount} Garage)
                  </span>
                </div>
              </div>
            </div>

            {/* Planning Insight */}
            <div className="bg-[#0d2135] border border-[#0081BC]/40 rounded-lg p-2.5 sm:p-3 text-xs text-gray-200 flex items-start gap-2.5 leading-snug shadow-inner">
              <Info className="w-4 h-4 sm:w-5 sm:h-5 text-[#FFC72C] shrink-0 mt-0.5" />
              <div>
                {isHealthy && (
                  <p>
                    <strong className="text-white">{t('gauge_insight_healthy_title', 'Curbside Balanced:')}</strong> {t('gauge_insight_healthy_desc', 'Space is available. Residents, visitors, and deliveries park easily without cruising.')}
                  </p>
                )}
                {isStrained && (
                  <p>
                    <strong className="text-white">{t('gauge_insight_strained_title', 'Approaching Capacity:')}</strong> {t('gauge_insight_strained_desc', 'Curb reaches ~85% occupancy. Minor cruising occurs during peak demand periods.')}
                  </p>
                )}
                {isCritical && (
                  <p>
                    <strong className="text-white">{t('gauge_insight_critical_title', 'Severe Curb Deficit:')}</strong> {t('gauge_insight_critical_desc', 'Vehicle demand exceeds legal spaces. Circling traffic causes blockages and emissions.')}
                  </p>
                )}
              </div>
            </div>

            {/* Pop-up Hint Box: If Curbside Utilization > 80% and vehicles per garage <= 1 */}
            <GarageUsageHintBox
              curbsidePct={curbsidePct}
              drivewayCapacity={drivewayCapacity}
              occupiedGaragesCount={occupiedGaragesCount}
              totalGarageSpacesCapacity={totalGarageSpacesCapacity}
              onOpenControlSliders={() => {
                onClose();
                onOpenManualSliders?.();
              }}
              variant="inline"
            />

            {/* Action Buttons */}
            <div className="flex gap-2 pt-0.5">
              {onOpenManualSliders && (
                <button
                  type="button"
                  onClick={() => {
                    triggerFeedback('button');
                    onOpenManualSliders();
                  }}
                  className="flex-1 py-2 px-3 bg-[#004B8D] hover:bg-[#003566] text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer text-xs min-h-[38px] active:scale-95 shadow-md"
                >
                  <Sliders className="w-3.5 h-3.5 text-[#FFC72C]" />
                  {t('gauge_adjust_sliders_btn', 'Adjust Sliders')}
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  triggerFeedback('button');
                  onClose();
                }}
                className="flex-1 py-2 px-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer text-xs min-h-[38px] active:scale-95 border border-white/10"
              >
                <CheckCircle className="w-3.5 h-3.5 text-[#4ade80]" />
                {t('gauge_back_survey_btn', 'Back to Exploring Parking')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
