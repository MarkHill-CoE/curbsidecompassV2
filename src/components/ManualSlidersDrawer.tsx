import React, { useEffect } from 'react';
import { Sliders, Gauge, CheckCircle, X, ChevronDown } from 'lucide-react';
import { SimulationConfig } from '../types';
import { triggerFeedback } from '../utils/feedback';
import { useAppText } from '../context/TextContentContext';

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

  const effectiveDeliveries = Math.floor(Math.min(3, Math.max(0, config.splitInfillLots ?? 0)) / 3) >= 1
    ? Math.max(2.0, config.deliveriesPerHomePerWeek)
    : config.deliveriesPerHomePerWeek;

  if (!showControls) return null;

  return (
    <div
      id="manual-sliders-overlay-container"
      className="absolute inset-0 z-40 bg-[#0c1f31]/75 backdrop-blur-md flex flex-col justify-start p-2 sm:p-4 md:p-5 overflow-y-auto animate-in fade-in duration-200"
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
        className="relative bg-[#11283f]/95 border-2 border-[#0081BC] p-3 sm:p-4 rounded-xl shadow-2xl w-full max-w-md mx-auto my-1 sm:my-auto flex flex-col gap-2.5 text-xs text-white"
      >
        {/* Header - Styled to match Parking Gauge container header */}
        <div className="flex items-center justify-between pb-1.5 sm:pb-2 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-1 sm:p-1.5 rounded-lg bg-[#004B8D] text-[#FFC72C] shrink-0">
              <Sliders className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h3 id="manual-sliders-title" className="font-bold !text-white text-xs sm:text-sm md:text-base leading-none" style={{ color: '#ffffff' }}>
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

        {/* Instructions right above Street Layout Typology */}
        <p className="text-xs text-blue-100/90 leading-snug">
          {t('drawer_sliders_instruction', 'Move the sliders to simulate parking impacts on your neighbourhood.')}
        </p>

        {/* Edmonton Street Layout Typologies Dropdown Selection */}
        <div className="flex flex-col gap-1 pb-1.5 border-b border-white/10">
          <label 
            htmlFor="street-typology-select" 
            className="flex items-center text-[11px] font-bold text-gray-200 cursor-pointer"
          >
            <span className="uppercase tracking-wider text-gray-300">{t('drawer_sliders_typology_label', 'Street Layout Typology:')}</span>
          </label>
          <div className="relative">
            <select
              id="street-typology-select"
              value={config.streetLayout || 'mature_laned'}
              onChange={(e) => {
                triggerFeedback('choice');
                onConfigChange?.({ streetLayout: e.target.value as any });
              }}
              aria-label={t('drawer_sliders_typology_label', 'Street Layout Typology')}
              className="w-full appearance-none bg-black/40 hover:bg-black/55 text-white font-medium text-xs sm:text-sm py-2 pl-3 pr-9 rounded-lg border-2 border-white/20 hover:border-[#0081BC] focus:border-[#FFC72C] focus:outline-none focus:ring-2 focus:ring-[#FFC72C]/30 transition-all cursor-pointer shadow-inner"
            >
              <option value="mature_laned" className="bg-[#11283f] text-white">
                🏡 {t('drawer_sliders_typology_mature_laned', 'Homes with Rear-lane Access (12 stalls)')} — Detached Rear Garages
              </option>
              <option value="infill_skinny" className="bg-[#11283f] text-white">
                🏘️ {t('drawer_sliders_typology_infill_skinny', 'Multiple Homes on Smaller Lots (12 stalls)')} — Laneway & Skinny Lots
              </option>
              <option value="suburban_front_driveway" className="bg-[#11283f] text-white">
                🚗 {t('drawer_sliders_typology_suburban_front', 'Homes with Front Driveways (10+ stalls)')} — Front Garages; 8-Plexes Restore Stalls
              </option>
              <option value="contemporary_townhomes" className="bg-[#11283f] text-white">
                🏢 {t('drawer_sliders_typology_townhomes', 'Townhomes (9 stalls)')} — Multi-Unit Row Housing
              </option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-gray-300">
              <ChevronDown className="w-4 h-4 text-[#FFC72C]" />
            </div>
          </div>
        </div>

        {/* Cars per household */}
        <div className="flex flex-col gap-1 bg-black/20 p-2.5 rounded-lg border border-white/10 hover:border-white/20 transition-colors">
          <div className="flex justify-between items-baseline gap-2">
            <span className="text-gray-200 font-medium">{t('sim_cars_home_label', 'Average Number of Vehicles Per Home:')}</span>
            <span 
              className="font-bold text-[#FFC72C] text-right"
              title={`Average Number of Vehicles Per Home: ${Math.min(4, config.householdCarsPerHome).toFixed(1)} | Total Vehicles Per Block: ${activeHouseholdCars}`}
            >
              {Math.min(4, config.householdCarsPerHome).toFixed(1)} <span className="text-gray-300 font-normal text-[11px]">(Total Vehicles Per Block: {activeHouseholdCars})</span>
            </span>
          </div>
          <input
            type="range"
            aria-label={t('drawer_sliders_veh_per_home_aria', 'Average Number of Vehicles Per Home')}
            min="0"
            max="4"
            step="0.25"
            value={Math.min(4, config.householdCarsPerHome)}
            onChange={(e) =>
              onConfigChange?.({ householdCarsPerHome: Math.min(4, parseFloat(e.target.value)) })
            }
            className="accent-[#0081BC] cursor-pointer h-2 bg-gray-700 rounded-lg w-full"
          />
          <div className="flex justify-between text-[10px] text-gray-400 font-medium px-0.5">
            <span>0</span>
            <span>1</span>
            <span>2</span>
            <span>3</span>
            <span>4 vehicles max</span>
          </div>
          <p className="text-[10px] text-gray-300 leading-snug mt-0.5">
            {t('sim_cars_home_desc', 'Average Number of Vehicles Per Home translates to {total} Total Vehicles Per Block across the {dwellings} homes on this street.')
              .replace('{total}', String(activeHouseholdCars))
              .replace('{dwellings}', String(totalDwellings))}
          </p>
        </div>

        {/* Private Off-Street Parking (Driveway / Rear Garage Capacity) */}
        <div className="flex flex-col gap-1 bg-black/20 p-2.5 rounded-lg border border-white/10 hover:border-white/20 transition-colors">
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

        {/* Visitor parking passes - Whole numbers only (0, 1, 2) */}
        <div className="flex flex-col gap-1 bg-black/20 p-2.5 rounded-lg border border-white/10 hover:border-white/20 transition-colors">
          <div className="flex justify-between items-baseline gap-2">
            <span className="text-gray-200 font-medium">{t('sim_visitor_passes_label', 'Visitor Passes Per Home:')}</span>
            <span 
              className="font-bold text-white text-right"
              title={`Visitor Passes Per Home: ${Math.min(2, Math.max(0, Math.round(config.visitorPassesPerHome)))} | Total Active Visitor Cars: ${activeVisitorCars}`}
            >
              {Math.min(2, Math.max(0, Math.round(config.visitorPassesPerHome)))} <span className="text-gray-300 font-normal text-[11px]">(Total Visitor Cars: {activeVisitorCars})</span>
            </span>
          </div>
          <input
            type="range"
            aria-label={t('drawer_sliders_visitor_passes_aria', 'Visitor passes per home')}
            min="0"
            max="2"
            step="1"
            value={Math.min(2, Math.max(0, Math.round(config.visitorPassesPerHome)))}
            onChange={(e) =>
              onConfigChange?.({ visitorPassesPerHome: Math.min(2, Math.max(0, parseInt(e.target.value, 10))) })
            }
            className="accent-[#0081BC] cursor-pointer h-2 bg-gray-700 rounded-lg w-full"
          />
          <div className="flex justify-between text-[10px] text-gray-400 font-medium px-0.5">
            <span>0</span>
            <span>1</span>
            <span>2 passes max</span>
          </div>
          <p className="text-[10px] text-gray-300 leading-snug mt-0.5">
            {t('sim_visitor_passes_explainer', 'At {passes} passes per home, visitors generate {active} total parked vehicles on this block.')
              .replace('{passes}', String(Math.min(2, Math.max(0, Math.round(config.visitorPassesPerHome)))))
              .replace('{active}', String(activeVisitorCars))}
          </p>
        </div>

        {/* Home Density */}
        <div className="flex flex-col gap-1 bg-black/20 p-2.5 rounded-lg border border-white/10 hover:border-white/20 transition-colors">
          <div className="flex justify-between items-center">
            <span className="text-gray-200 font-medium">{t('drawer_infill_label', 'Home Density')}</span>
            <span className="font-bold text-[#009A44]">
              {(() => {
                const lots = Math.min(3, Math.max(0, config.splitInfillLots ?? 0));
                if (lots === 0) return 'Baseline (0)';
                if (lots === 1) return '+1 additional multi-unit';
                return `+${lots} additional multi-units`;
              })()}
            </span>
          </div>
          <input
            type="range"
            aria-label={t('drawer_sliders_density_aria', 'Home density')}
            min="0"
            max="3"
            step="1"
            value={Math.min(3, Math.max(0, config.splitInfillLots ?? 0))}
            onChange={(e) => {
              const new8Plex = Math.min(3, Math.max(0, parseInt(e.target.value, 10)));
              const tiers = Math.floor(new8Plex / 3);
              onConfigChange?.({
                splitInfillLots: new8Plex,
                deliveriesPerHomePerWeek: tiers >= 1 && config.deliveriesPerHomePerWeek < 2.0 ? 2.0 : config.deliveriesPerHomePerWeek
              });
            }}
            className="accent-[#009A44] cursor-pointer h-2 bg-gray-700 rounded-lg w-full"
          />
          <div className="flex justify-between text-[10px] text-gray-400 font-medium px-0.5">
            <span>0</span>
            <span>+1</span>
            <span>+2</span>
            <span>3 additional multi-unit</span>
          </div>
          <p className="text-[10px] text-gray-300 leading-snug mt-0.5">
            {t('drawer_density_explainer', 'Adds multi-unit housing to the street.')}
          </p>
        </div>

        {/* Deliveries Per Home */}
        <div className="flex flex-col gap-1 bg-black/20 p-2.5 rounded-lg border border-white/10 hover:border-white/20 transition-colors">
          <div className="flex justify-between items-baseline gap-2">
            <span className="text-gray-200 font-medium">
              {t('sim_deliveries_label', 'Average Number of Weekly Deliveries Per Home:')}
            </span>
            <span 
              className="font-bold text-[#FF5500] text-right"
              title={`Average Number of Weekly Deliveries Per Home: ${effectiveDeliveries.toFixed(1)} | Total Weekly Deliveries: ${totalWeeklyDeliveries}/wk`}
            >
              {effectiveDeliveries.toFixed(1)} <span className="text-gray-300 font-normal text-[11px]">(Total Weekly Deliveries: {totalWeeklyDeliveries}/wk)</span>
            </span>
          </div>
          <input
            type="range"
            aria-label={t('drawer_sliders_deliveries_aria', 'Average Number of Weekly Deliveries Per Home')}
            min="1"
            max="4"
            step="0.25"
            value={effectiveDeliveries}
            onChange={(e) =>
              onConfigChange?.({ deliveriesPerHomePerWeek: parseFloat(e.target.value) })
            }
            className="accent-[#FF5500] cursor-pointer h-2 bg-gray-700 rounded-lg w-full"
          />
          <div className="flex justify-between text-[10px] text-gray-400 font-medium px-0.5">
            <span>1/wk</span>
            <span>2/wk</span>
            <span>3/wk</span>
            <span>4/wk max</span>
          </div>
          <p className="text-[10px] text-gray-300 leading-snug mt-0.5">
            {t('sim_deliveries_desc', 'Average Number of Weekly Deliveries Per Home translates to {total} Total Weekly Deliveries across the {dwellings} homes on this street.')
              .replace('{total}', String(totalWeeklyDeliveries))
              .replace('{dwellings}', String(totalDwellings))}
          </p>
        </div>

        {/* Circling Traffic */}
        <div className="flex justify-between items-center text-xs py-2 px-2.5 rounded-lg bg-black/20 border border-white/10">
          <span className="text-gray-200 font-medium">{t('drawer_circling_label', 'Circling Traffic')}</span>
          <span className={`font-bold ${circlingCarCount > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
            {circlingCarCount > 0 ? `${circlingCarCount} ${t('drawer_circling_text', 'Circling for Parking')}` : t('drawer_smooth_flow', 'Smooth Flow')}
          </span>
        </div>

        {/* Bottom Action Buttons */}
        <div className="flex gap-2 pt-2 border-t border-white/10 shrink-0">
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
            {t('drawer_back_survey_btn', 'Back to Exploring Parking')}
          </button>
        </div>
      </div>
    </div>
  );
};
