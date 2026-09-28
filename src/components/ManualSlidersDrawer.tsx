import React, { useEffect } from 'react';
import { Sliders, Gauge, CheckCircle, X } from 'lucide-react';
import { SimulationConfig } from '../types';
import { triggerFeedback } from '../utils/feedback';
import { useAppText } from '../context/TextContentContext';
import { getStreetLayoutInfo } from '../data/edmontonNeighbourhoods';

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
  const { t } = useAppText();

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
                {t('drawer_sliders_title', 'Adjust the Neighbourhood')}
              </h3>
              <span className="text-[9px] sm:text-[10px] text-gray-300">
                {t('drawer_sliders_subtitle', 'Live simulation controls & density factors')}
              </span>
            </div>
          </div>
          <button
            type="button"
            aria-label={t('drawer_sliders_close_label', 'Close manual sliders')}
            onClick={() => {
              triggerFeedback('button');
              onClose();
            }}
            className="text-gray-300 hover:text-white flex items-center justify-center min-w-[36px] min-h-[36px] sm:min-w-[44px] sm:min-h-[44px] font-bold text-lg cursor-pointer active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFC72C] rounded hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* 4 Edmonton Street Layout Typologies Quick Switcher */}
        <div className="flex flex-col gap-1 pb-1.5 border-b border-white/10">
          <div className="flex justify-between items-center text-[11px]">
            <span className="text-gray-300 font-bold uppercase tracking-wider">{t('drawer_sliders_typology_label', 'Street Layout Typology:')}</span>
            <span className="font-semibold text-[#FFC72C]">
              {getStreetLayoutInfo(config.streetLayout).shortTitle}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {([
              { id: 'mature_laned', icon: '🏡', nameKey: 'drawer_sliders_typology_mature_laned', defaultName: 'Mature Laned', count: 16 },
              { id: 'infill_skinny', icon: '🏘️', nameKey: 'drawer_sliders_typology_infill_skinny', defaultName: 'Infill & Duplex', count: 16 },
              { id: 'suburban_front_driveway', icon: '🚗', nameKey: 'drawer_sliders_typology_suburban_front', defaultName: 'Front Driveway', count: 10 },
              { id: 'contemporary_townhomes', icon: '🏢', nameKey: 'drawer_sliders_typology_townhomes', defaultName: 'Townhomes', count: 12 }
            ] as const).map((item) => {
              const isSelected = (config.streetLayout || 'mature_laned') === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    triggerFeedback('choice');
                    onConfigChange?.({ streetLayout: item.id });
                  }}
                  className={`flex items-center justify-between px-2 py-1.5 rounded-lg border text-left cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-[#0081BC] text-white border-white shadow-xs font-bold'
                      : 'bg-black/30 hover:bg-white/10 text-gray-200 border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="text-sm">{item.icon}</span>
                    <span className="text-[11px] truncate">{t(item.nameKey, item.defaultName)}</span>
                  </div>
                  <span className="text-[9px] opacity-80 shrink-0 font-mono">
                    {t('drawer_sliders_stalls_unit', '{count} stalls').replace('{count}', String(item.count))}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Cars per household */}
        <div className="flex flex-col gap-0.5">
          <div className="flex justify-between">
            <span className="text-gray-300 font-medium">{t('sim_cars_home_label', 'Average Vehicles Per Home')}</span>
            <span className="font-bold text-[#FFC72C]">
              {config.householdCarsPerHome.toFixed(1)} ({activeHouseholdCars})
            </span>
          </div>
          <input
            type="range"
            aria-label={t('drawer_sliders_veh_per_home_aria', 'Average vehicles per home')}
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

        {/* Private Off-Street Parking (Driveway / Rear Garage Capacity) */}
        <div className="flex flex-col gap-0.5 bg-black/25 p-2 rounded-lg border border-white/10">
          <div className="flex justify-between">
            <span className="text-gray-200 font-bold flex items-center gap-1.5">
              <span>🏠</span>
              <span>{t('sim_private_parking_label', 'Private Off-Street Stalls (Driveway / Garage)')}</span>
            </span>
            <span className="font-bold text-emerald-400">
              {config.drivewayCapacity ?? 2} {t('sim_stalls_per_home', 'stalls/home')}
            </span>
          </div>
          <input
            type="range"
            aria-label={t('drawer_sliders_driveway_aria', 'Private off-street parking stalls per home')}
            min="0"
            max="3"
            step="1"
            value={config.drivewayCapacity ?? 2}
            onChange={(e) =>
              onConfigChange?.({ drivewayCapacity: parseInt(e.target.value, 10) })
            }
            className="accent-emerald-400 cursor-pointer h-2 bg-gray-700 rounded-lg w-full"
          />
          <p className="text-[10px] text-gray-300 leading-snug mt-0.5">
            {t('sim_private_parking_explainer', 'Household cars park in private garages/driveways first; overflow vehicles park on the curbside.')}
          </p>
        </div>

        {/* Visitor parking passes */}
        <div className="flex flex-col gap-0.5">
          <div className="flex justify-between">
            <span className="text-gray-300 font-medium">{t('sim_visitor_passes_label', 'Visitor Passes Per Home')}</span>
            <span className="font-bold text-white">
              {config.visitorPassesPerHome.toFixed(1)} ({activeVisitorCars})
            </span>
          </div>
          <input
            type="range"
            aria-label={t('drawer_sliders_visitor_passes_aria', 'Visitor passes per home')}
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

        {/* Home Density */}
        <div className="flex flex-col gap-0.5">
          <div className="flex justify-between">
            <span className="text-gray-300 font-medium">{t('drawer_infill_label', 'Home Density')}</span>
            <span className="font-bold text-[#009A44]">
              {totalDwellings} {t('drawer_dwellings_unit', 'Dwellings')}
            </span>
          </div>
          <input
            type="range"
            aria-label={t('drawer_sliders_density_aria', 'Home density')}
            min="2"
            max="12"
            step="2"
            value={config.splitInfillLots ?? 2}
            onChange={(e) =>
              onConfigChange?.({ splitInfillLots: parseInt(e.target.value, 10) })
            }
            className="accent-[#009A44] cursor-pointer h-2 bg-gray-700 rounded-lg w-full"
          />
          <p className="text-[10px] text-gray-300 leading-snug mt-0.5">
            {t('drawer_density_explainer', 'Subdivided lots and skinny duplexes increase residents, vehicles, and visitor parking demand.')}
          </p>
        </div>

        {/* Deliveries Per Home */}
        <div className="flex flex-col gap-0.5">
          <div className="flex justify-between">
            <span className="text-gray-300 font-medium">{t('sim_deliveries_label', 'Weekly Deliveries')}</span>
            <span className="font-bold text-[#FF5500]">
              {config.deliveriesPerHomePerWeek.toFixed(1)} ({totalWeeklyDeliveries}/wk)
            </span>
          </div>
          <input
            type="range"
            aria-label={t('drawer_sliders_deliveries_aria', 'Weekly deliveries per home')}
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
          <span className="text-gray-300">{t('drawer_circling_label', 'Circling Traffic')}</span>
          <span className={`font-bold ${circlingCarCount > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
            {circlingCarCount > 0 ? `${circlingCarCount} ${t('drawer_circling_text', 'Circling for Parking')}` : t('drawer_smooth_flow', 'Smooth Flow')}
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
            title={t('drawer_police_test_title', 'Test 20-second lane blockage: dispatches EPS police cruiser with lights & sirens to clear traffic')}
          >
            <span className="text-base">🚨</span>
            <span>{t('drawer_police_test_btn', 'Call EPS')}</span>
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
              {t('drawer_view_gauge_btn', 'View Gauge')}
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
            {t('drawer_back_survey_btn', 'Back to Parking Survey')}
          </button>
        </div>
      </div>
    </div>
  );
};
