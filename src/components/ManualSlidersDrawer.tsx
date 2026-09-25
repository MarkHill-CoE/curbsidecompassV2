import React, { useEffect } from 'react';
import { Sliders, Gauge, CheckCircle, X } from 'lucide-react';
import { SimulationConfig } from '../types';
import { triggerFeedback } from '../utils/feedback';

interface ManualSlidersDrawerProps {
  showControls: boolean;
  onClose: () => void;
  config: SimulationConfig;
  onConfigChange?: (newConfig: Partial<SimulationConfig>) => void;
  activeHouseholdCars: number;
  activeVisitorCars: number;
  totalDwellings: number;
  totalWeeklyDeliveries: number;
  circlingCarCount: number;
  onOpenGauge?: () => void;
  onReshuffle?: () => void;
}

export const ManualSlidersDrawer: React.FC<ManualSlidersDrawerProps> = ({
  showControls,
  onClose,
  config,
  onConfigChange,
  activeHouseholdCars,
  activeVisitorCars,
  totalDwellings,
  totalWeeklyDeliveries,
  circlingCarCount,
  onOpenGauge
}) => {
  // Listen for Escape key to close the drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showControls) {
        onClose();
        document.getElementById('manual-controls-toggle')?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showControls, onClose]);

  if (!showControls) return null;

  return (
    <div
      id="manual-sliders-overlay-container"
      className="absolute inset-0 z-40 bg-[#0c1f31]/75 backdrop-blur-md flex flex-col justify-start p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          triggerFeedback('button');
          onClose();
        }
      }}
    >
      <div
        id="manual-sliders-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="manual-sliders-title"
        className="relative bg-[#11283f]/95 border-2 border-[#0081BC] p-3.5 sm:p-4 rounded-xl shadow-2xl w-full max-w-md mx-auto my-auto flex flex-col gap-2.5 text-xs text-white"
      >
        {/* Header - Styled to match Parking Gauge container header */}
        <div className="flex items-center justify-between pb-1.5 sm:pb-2 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-1 sm:p-1.5 rounded-lg bg-[#004B8D] text-[#FFC72C] shrink-0">
              <Sliders className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h3 id="manual-sliders-title" className="font-bold text-white text-xs sm:text-sm md:text-base leading-none">
                Adjust the Neighbourhood
              </h3>
              <span className="text-[9px] sm:text-[10px] text-gray-300">Live simulation controls & density factors</span>
            </div>
          </div>
          <button
            type="button"
            aria-label="Close manual sliders"
            onClick={() => {
              triggerFeedback('button');
              onClose();
            }}
            className="text-gray-300 hover:text-white flex items-center justify-center min-w-[36px] min-h-[36px] sm:min-w-[44px] sm:min-h-[44px] font-bold text-lg cursor-pointer active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFC72C] rounded hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Cars per household */}
        <div className="flex flex-col gap-0.5">
          <div className="flex justify-between">
            <span className="text-gray-300 font-medium">Cars/Home</span>
            <span className="font-bold text-[#FFC72C]">
              {config.householdCarsPerHome.toFixed(1)} ({activeHouseholdCars})
            </span>
          </div>
          <input
            type="range"
            aria-label="Cars per household"
            min="0"
            max="5"
            step="0.25"
            value={config.householdCarsPerHome}
            onChange={(e) =>
              onConfigChange?.({ householdCarsPerHome: parseFloat(e.target.value) })
            }
            className="accent-[#0081BC] cursor-pointer h-2 bg-gray-700 rounded-lg w-full"
          />
        </div>

        {/* Visitor parking passes */}
        <div className="flex flex-col gap-0.5">
          <div className="flex justify-between">
            <span className="text-gray-300 font-medium">Visitor Passes</span>
            <span className="font-bold text-white">
              {config.visitorPassesPerHome.toFixed(1)} ({activeVisitorCars})
            </span>
          </div>
          <input
            type="range"
            aria-label="Visitor passes per home"
            min="0"
            max="5"
            step="0.25"
            value={config.visitorPassesPerHome}
            onChange={(e) =>
              onConfigChange?.({ visitorPassesPerHome: parseFloat(e.target.value) })
            }
            className="accent-[#0081BC] cursor-pointer h-2 bg-gray-700 rounded-lg w-full"
          />
        </div>

        {/* Infill Homes */}
        <div className="flex flex-col gap-0.5">
          <div className="flex justify-between">
            <span className="text-gray-300 font-medium">Infill Homes</span>
            <span className="font-bold text-[#009A44]">
              {totalDwellings} Dwellings
            </span>
          </div>
          <input
            type="range"
            aria-label="Infill homes"
            min="2"
            max="12"
            step="2"
            value={config.splitInfillLots ?? 2}
            onChange={(e) =>
              onConfigChange?.({ splitInfillLots: parseInt(e.target.value, 10) })
            }
            className="accent-[#009A44] cursor-pointer h-2 bg-gray-700 rounded-lg w-full"
          />
        </div>

        {/* Deliveries Per Home */}
        <div className="flex flex-col gap-0.5">
          <div className="flex justify-between">
            <span className="text-gray-300 font-medium">Weekly Deliveries</span>
            <span className="font-bold text-[#FF5500]">
              {config.deliveriesPerHomePerWeek.toFixed(1)} ({totalWeeklyDeliveries}/wk)
            </span>
          </div>
          <input
            type="range"
            aria-label="Weekly deliveries per home"
            min="1"
            max="4"
            step="0.25"
            value={config.deliveriesPerHomePerWeek}
            onChange={(e) =>
              onConfigChange?.({ deliveriesPerHomePerWeek: parseFloat(e.target.value) })
            }
            className="accent-[#FF5500] cursor-pointer h-2 bg-gray-700 rounded-lg w-full"
          />
        </div>

        {/* Circling Traffic */}
        <div className="flex justify-between items-center text-xs py-1.5 border-t border-white/10">
          <span className="text-gray-300">Circling Traffic</span>
          <span className={`font-bold ${circlingCarCount > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
            {circlingCarCount > 0 ? `${circlingCarCount} Circling for Parking` : 'Smooth Flow'}
          </span>
        </div>

        {/* Test 20s Traffic Jam & Police Response */}
        <div className="pt-1">
          <button
            type="button"
            onClick={() => {
              triggerFeedback('button');
              if (typeof (window as any).__dispatchPoliceBlockageTest === 'function') {
                (window as any).__dispatchPoliceBlockageTest();
              }
              onClose();
            }}
            className="w-full py-1.5 px-3 bg-[#002B49] hover:bg-[#001D33] border border-[#3B82F6]/60 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer text-xs min-h-[36px] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFC72C]"
            title="Test 20-second lane blockage: dispatches EPS police cruiser with lights & sirens to clear traffic"
          >
            <span className="text-base">🚨</span>
            <span>Simulate 20s Jam (Dispatch Police)</span>
          </button>
        </div>

        {/* Bottom Action Buttons: Replaced enforcement level and reshuffle */}
        <div className="flex gap-2 pt-2 border-t border-white/10">
          {onOpenGauge && (
            <button
              type="button"
              onClick={() => {
                triggerFeedback('button');
                onOpenGauge();
              }}
              className="flex-1 py-2 px-3 bg-[#004B8D] hover:bg-[#003566] text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer text-xs min-h-[40px] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFC72C]"
            >
              <Gauge className="w-4 h-4 text-[#FFC72C]" />
              View Gauge
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              triggerFeedback('button');
              onClose();
            }}
            className="flex-1 py-2 px-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer text-xs min-h-[40px] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFC72C]"
          >
            <CheckCircle className="w-4 h-4 text-[#4ade80]" />
            Back to Parking Survey
          </button>
        </div>
      </div>
    </div>
  );
};
