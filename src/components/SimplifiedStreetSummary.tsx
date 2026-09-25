import React from 'react';
import { 
  Gauge, 
  Home, 
  Car, 
  Truck, 
  RotateCcw, 
  Eye, 
  Sliders, 
  Maximize2,
  CheckCircle,
  AlertTriangle,
  Info
} from 'lucide-react';
import { SimulationConfig } from '../types';
import { triggerFeedback } from '../utils/feedback';

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
  policyNote?: string;
  onSwitchToSimulation: () => void;
  onOpenMagnifiedGauge: () => void;
  onOpenManualSliders: () => void;
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
  policyNote,
  onSwitchToSimulation,
  onOpenMagnifiedGauge,
  onOpenManualSliders,
}) => {
  // Determine curbside state text & color styling
  const getStatusDetails = () => {
    if (curbsidePct >= 110) {
      return {
        label: 'Severe Overcrowding',
        desc: 'Curbside demand exceeds physical stalls. Vehicles must circle the block.',
        badgeBg: 'bg-red-700 text-white border-red-800',
        barColor: 'bg-red-600',
        icon: AlertTriangle
      };
    }
    if (curbsidePct >= 95) {
      return {
        label: 'Near Capacity',
        desc: 'Few or no stalls available for visitors, deliveries, or service couriers.',
        badgeBg: 'bg-amber-600 text-white border-amber-700',
        barColor: 'bg-amber-500',
        icon: AlertTriangle
      };
    }
    if (curbsidePct >= 75) {
      return {
        label: 'Balanced Availability (Ideal 85%)',
        desc: 'Optimal street turnover. Stalls are well utilized with 1-2 open spaces per block.',
        badgeBg: 'bg-emerald-700 text-white border-emerald-800',
        barColor: 'bg-emerald-600',
        icon: CheckCircle
      };
    }
    return {
      label: 'Abundant Parking Available',
      desc: 'Plentiful curbside parking with ample spare room for residents and guests.',
      badgeBg: 'bg-[#004B8D] text-white border-[#003566]',
      barColor: 'bg-[#0081BC]',
      icon: CheckCircle
    };
  };

  const status = getStatusDetails();
  const StatusIcon = status.icon;

  // Approximate occupied rear garages from config
  const totalOffStreet = activeHouseholdCars;
  const occupiedGarages = Math.min(12, Math.max(2, Math.round(totalOffStreet * 0.7)));
  const vacantGarages = Math.max(0, 12 - occupiedGarages);

  return (
    <div className="w-full h-full bg-[#112438] text-white flex flex-col justify-between p-3 sm:p-5 overflow-y-auto select-none">
      {/* Top Banner / Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-white/10 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#FFC72C] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
              Simplified Street Model
            </span>
            <span className="text-[10px] text-gray-400 bg-white/10 px-1.5 py-0.5 rounded">
              Static Overview
            </span>
          </div>
          <h2 className="text-sm sm:text-base font-black tracking-tight text-white mt-0.5">
            12-Home Residential Block Parking Summary
          </h2>
        </div>

        {/* View Switcher Button */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              triggerFeedback('button');
              onSwitchToSimulation();
            }}
            className="flex items-center gap-1.5 text-xs font-bold bg-[#0081BC] hover:bg-[#006ca0] active:scale-95 text-white px-3 py-1.5 rounded-lg shadow-sm transition-all cursor-pointer min-h-[38px] border border-blue-400/30"
            title="Switch back to live animated 2.5D simulation"
          >
            <Eye className="w-4 h-4" />
            <span>Switch to Live Simulation</span>
          </button>
        </div>
      </div>

      {/* Main Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 my-auto py-2">
        {/* Card 1: Curbside Parking Demand Meter */}
        <div className="bg-[#193A5A]/90 border border-[#0081BC]/40 rounded-xl p-3.5 sm:p-4 shadow-lg flex flex-col justify-between">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#0081BC]/30 flex items-center justify-center text-[#FFC72C]">
                <Gauge className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-white">Curbside Street Stalls</h3>
                <span className="text-[11px] text-gray-300">Public shared curb parking</span>
              </div>
            </div>

            <span className={`text-[11px] font-bold px-2 py-0.5 rounded border flex items-center gap-1 ${status.badgeBg}`}>
              <StatusIcon className="w-3 h-3 shrink-0" />
              <span>{status.label}</span>
            </span>
          </div>

          {/* Occupancy Bar */}
          <div className="my-2">
            <div className="flex justify-between items-baseline text-xs mb-1">
              <span className="text-gray-300">Curbside Occupancy:</span>
              <span className="text-base font-black text-white">{curbsidePct}%</span>
            </div>
            <div className="w-full h-3 bg-black/40 rounded-full overflow-hidden p-0.5 border border-white/10">
              <div 
                className={`h-full rounded-full transition-all duration-300 ${status.barColor}`}
                style={{ width: `${Math.min(100, curbsidePct)}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[11px] text-gray-400 mt-1">
              <span>{curbsideDemandCount} cars seeking curb parking</span>
              <span>Capacity: {curbsideStallsCapacity} stalls</span>
            </div>
          </div>

          <p className="text-[11px] text-gray-300 bg-black/25 p-2 rounded border border-white/5 mt-2">
            {status.desc}
          </p>

          <button
            type="button"
            onClick={() => {
              triggerFeedback('button');
              onOpenMagnifiedGauge();
            }}
            className="mt-3 w-full flex items-center justify-center gap-1.5 text-xs font-semibold text-gray-200 hover:text-white bg-white/10 hover:bg-white/15 py-1.5 rounded transition-all cursor-pointer border border-white/10"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>Open Magnified Gauge Breakdown</span>
          </button>
        </div>

        {/* Card 2: Off-Street & Neighbourhood Overview */}
        <div className="bg-[#193A5A]/90 border border-[#0081BC]/40 rounded-xl p-3.5 sm:p-4 shadow-lg flex flex-col justify-between">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#0081BC]/30 flex items-center justify-center text-[#FFC72C]">
                <Home className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-white">Private & Off-Street Parking</h3>
                <span className="text-[11px] text-gray-300">Rear laneway garages & pads</span>
              </div>
            </div>

            <span className="text-[11px] font-bold bg-[#059669] text-white border border-[#34D399]/40 px-2 py-0.5 rounded">
              {occupiedGarages}/12 Occupied
            </span>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-2 my-2 text-xs">
            <div className="bg-black/25 p-2 rounded border border-white/5">
              <span className="text-gray-400 text-[10px] block uppercase font-bold">Rear Garages</span>
              <span className="font-bold text-white text-sm">{occupiedGarages} full • {vacantGarages} vacant</span>
            </div>
            <div className="bg-black/25 p-2 rounded border border-white/5">
              <span className="text-gray-400 text-[10px] block uppercase font-bold">Household Cars</span>
              <span className="font-bold text-white text-sm">{activeHouseholdCars} vehicles</span>
            </div>
            <div className="bg-black/25 p-2 rounded border border-white/5">
              <span className="text-gray-400 text-[10px] block uppercase font-bold">Visitor Demand</span>
              <span className="font-bold text-white text-sm">{activeVisitorCars} vehicles</span>
            </div>
            <div className="bg-black/25 p-2 rounded border border-white/5">
              <span className="text-gray-400 text-[10px] block uppercase font-bold">Deliveries / Wk</span>
              <span className="font-bold text-white text-sm">{totalWeeklyDeliveries} visits</span>
            </div>
          </div>

          {/* Circling / Through Traffic Status */}
          <div className="bg-black/25 p-2 rounded border border-white/5 mt-2 flex items-center gap-2 text-xs">
            <span className={`w-2 h-2 rounded-full shrink-0 ${circlingCarCount > 0 ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`} />
            <span className="text-gray-200">
              {circlingCarCount > 0 
                ? `${circlingCarCount} vehicle(s) circling looking for parking`
                : 'Through traffic flowing freely with no circling'
              }
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              triggerFeedback('button');
              onOpenManualSliders();
            }}
            className="mt-3 w-full flex items-center justify-center gap-1.5 text-xs font-semibold text-gray-200 hover:text-white bg-white/10 hover:bg-white/15 py-1.5 rounded transition-all cursor-pointer border border-white/10"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Customize Street Assumptions (Manual Sliders)</span>
          </button>
        </div>
      </div>

      {/* Bottom Feedback Banner */}
      <div className="bg-[#002B49]/80 border border-white/10 rounded-lg p-2.5 sm:p-3 text-xs flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2 text-gray-300 min-w-0">
          <Info className="w-4 h-4 text-[#FFC72C] shrink-0" />
          <span className="truncate">
            {policyNote || 'Model reflects current baseline Edmonton residential street conditions.'}
          </span>
        </div>
        <span className="text-[11px] text-gray-400 whitespace-nowrap hidden sm:inline">
          12 Homes • 120m Block
        </span>
      </div>
    </div>
  );
};
