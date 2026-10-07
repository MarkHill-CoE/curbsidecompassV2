import React, { useState, useMemo } from 'react';
import { SurveyQuestion, StreetLayoutTypology, SimulationConfig } from '../types';
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  MapPin,
  Search,
  Check,
  Sparkles,
  X,
  AlertCircle,
  Building2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { triggerFeedback } from '../utils/feedback';
import { useAppText } from '../context/TextContentContext';
import { QuestionTradeoffOutcome } from '../data/surveyData';
import {
  getStreetLayoutInfo,
  detectLayoutAndNeighbourhood,
  searchNeighbourhoods,
  EdmontonNeighbourhood
} from '../data/edmontonNeighbourhoods';
import { 
  resolveLocationOrPredictiveAddress, 
  classifyInputIntent, 
  MultiNeighbourhoodOption 
} from '../data/edmontonPostalData';

interface SurveyStageProps {
  questions: SurveyQuestion[];
  currentStep: number;
  selectedAnswers: Record<string, string>;
  onSelectOption: (questionId: string, optionId: string) => void;
  onNavigate: (direction: number) => void;
  showValidationError: boolean;
  validationErrorMsg?: string | null;
  totalX: number;
  totalY: number;
  tradeoffOutcome?: QuestionTradeoffOutcome;
  policyNote?: string;
  currentStreetLayout?: StreetLayoutTypology;
  currentNeighbourhoodName?: string;
  onLayoutChange?: (layout: StreetLayoutTypology, neighbourhoodName?: string, postalCode?: string) => void;
  config?: SimulationConfig;
  totalDwellings?: number;
  onConfigChange?: (newConfig: Partial<SimulationConfig>) => void;
}

const SurveyStageComponent: React.FC<SurveyStageProps> = ({
  questions,
  currentStep,
  selectedAnswers,
  onSelectOption,
  onNavigate,
  showValidationError,
  validationErrorMsg,
  tradeoffOutcome,
  currentStreetLayout = 'mature_laned',
  currentNeighbourhoodName,
  onLayoutChange,
  config,
  totalDwellings,
  onConfigChange
}) => {
  const { t } = useAppText();
  const currentQuestion = questions[currentStep] || questions[0];
  const isLastQuestion = currentStep === questions.length - 1;
  const currentAnswer = selectedAnswers[currentQuestion.id];
  const isModelStreetStep = currentQuestion.id === 'q0' || currentQuestion.category === 'Street Model' || currentQuestion.category === 'Neighbourhood Type';
  const isLocationStep = currentQuestion.id === 'q7' || currentQuestion.category === 'location' || currentQuestion.category === 'Location' || currentQuestion.category === 'Location & Community' || currentQuestion.type === 'text';

  // Responsive column classes for question options
  const optionCount = currentQuestion.options.length;
  let gridClasses = 'grid grid-cols-1 gap-1 sm:gap-1.5 md:gap-2 w-full';
  if (optionCount === 3) {
    gridClasses =
      'grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 [@media(orientation:landscape)_and_(max-height:540px)]:grid-cols-3 gap-1 sm:gap-1.5 md:gap-2 w-full';
  } else if (optionCount === 2 || optionCount === 4) {
    gridClasses =
      'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 [@media(orientation:landscape)_and_(max-height:540px)]:grid-cols-2 gap-1 sm:gap-1.5 md:gap-2 w-full';
  }

  const [locationInput, setLocationInput] = useState<string>(() => {
    if (currentAnswer && currentAnswer !== 'OPT_OUT') return currentAnswer;
    if (currentNeighbourhoodName) return currentNeighbourhoodName;
    return '';
  });
  const [selectedDisambiguation, setSelectedDisambiguation] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  // Input Intent Recognition
  const inputIntent = useMemo(() => {
    return classifyInputIntent(locationInput);
  }, [locationInput]);

  // Autocomplete suggestions: SUPPRESSED if input is FSA or Full Postal Code
  const filteredNeighbourhoods = useMemo(() => {
    if (inputIntent.type !== 'neighbourhood') return [];
    return searchNeighbourhoods(locationInput, 8);
  }, [inputIntent.type, locationInput]);

  // POSSE dataset location resolution
  const detectedLocation = useMemo(() => {
    if (!locationInput || locationInput === 'OPT_OUT') return null;
    return resolveLocationOrPredictiveAddress(locationInput);
  }, [locationInput]);

  const streetModelOptions: Array<{
    id: StreetLayoutTypology;
    icon: string;
    title: string;
    era: string;
    tag: string;
    stalls: number;
    desc: string;
  }> = [
    {
      id: 'mature_laned',
      icon: '🏡',
      title: 'Homes with Rear-lane Access',
      era: '1950s–1960s Heritage',
      tag: 'Garages or parking areas accessed from a rear lane or alley.',
      stalls: getStreetLayoutInfo('mature_laned').curbsideCapacity,
      desc: 'Strathcona, Westmount, Glenora, Highlands, Bonnie Doon'
    },
    {
      id: 'infill_skinny',
      icon: '🏘️',
      title: 'Multiple Homes on Smaller Lots',
      era: 'Post-2015 Redeveloping',
      tag: 'More households sharing the block; private parking varies',
      stalls: getStreetLayoutInfo('infill_skinny').curbsideCapacity,
      desc: 'Garneau, Oliver (Wîhkwêntôwin), Downtown, Queen Alex, McKernan'
    },
    {
      id: 'suburban_front_driveway',
      icon: '🚗',
      title: 'Homes with Front Driveways',
      era: '1980s–2000s Subdivisions',
      tag: 'Driveways cross the curb to reach private parking',
      stalls: getStreetLayoutInfo('suburban_front_driveway').curbsideCapacity,
      desc: 'Mill Woods, Callingwood, Riverbend, Castledowns, Blue Quill'
    },
    {
      id: 'contemporary_townhomes',
      icon: '🏢',
      title: 'Townhomes',
      era: '2020s City Plan Developing',
      tag: 'Homes grouped together; private parking arrangements vary',
      stalls: getStreetLayoutInfo('contemporary_townhomes').curbsideCapacity,
      desc: 'Griesbach, Blatchford, Windermere, Chappelle, Laurel, Secord'
    }
  ];

  // Location input handlers - preserve user's chosen street model
  const handleLocationInputChange = (rawVal: string) => {
    setLocationInput(rawVal);
    setSelectedDisambiguation(null);
    const intent = classifyInputIntent(rawVal);

    if (intent.type === 'fsa') {
      // Pattern 1: FSA (3-Character Alpha-Numeric, e.g., T5A)
      // Action: Validate against the FSA list. Suppress and hide the autocomplete dropdown (do NOT display neighbourhood suggestions).
      // Store the value as a valid region-level FSA location.
      setShowDropdown(false);
      onSelectOption(currentQuestion.id, intent.fsa);
      if (intent.isValid && intent.fsaData) {
        onLayoutChange?.(intent.fsaData.typology, intent.fsaData.name, intent.fsa);
      }
    } else if (intent.type === 'postal_code') {
      // Pattern 2: Full Postal Code (6-Character Alpha-Numeric, e.g., T5A0A1 or T5A 0A1)
      // Action: Query full postal code table. Instantly resolve and auto-select exact associated Neighbourhood Name, POSSE Ward, and Classification.
      setShowDropdown(false);
      onSelectOption(currentQuestion.id, intent.formatted);
      const detection = resolveLocationOrPredictiveAddress(intent.code);
      if (detection) {
        onLayoutChange?.(detection.typology, detection.neighbourhood, intent.formatted);
      }
    } else {
      // Pattern 3: Neighbourhood Name Search (Text Input, e.g., "Belv..." or "Downtown")
      // Action: Display autocomplete dropdown menu listing matching neighbourhood names.
      if (rawVal.trim().length > 0) {
        setShowDropdown(true);
      } else {
        setShowDropdown(false);
      }
      onSelectOption(currentQuestion.id, rawVal);
      const detection = resolveLocationOrPredictiveAddress(rawVal);
      if (detection) {
        onLayoutChange?.(detection.typology, detection.neighbourhood, detection.postalFSA);
      }
    }
  };

  const handleSelectNeighbourhood = (n: EdmontonNeighbourhood) => {
    triggerFeedback('choice');
    setLocationInput(n.name);
    setShowDropdown(false);
    setSelectedDisambiguation(null);
    onSelectOption(currentQuestion.id, n.name);
    onLayoutChange?.(n.typology, n.name, n.postalFSA?.[0]);
  };

  const handleSelectDisambiguation = (opt: MultiNeighbourhoodOption) => {
    triggerFeedback('choice');
    setSelectedDisambiguation(opt.name);
    const detection = resolveLocationOrPredictiveAddress(opt.name);
    if (detection) {
      onLayoutChange?.(detection.typology, opt.name, detectedLocation?.postalFSA);
    }
  };

  const handleSelectStreetModel = (layoutId: StreetLayoutTypology) => {
    triggerFeedback('choice');
    onSelectOption('q0', layoutId);
    onLayoutChange?.(layoutId, detectedLocation?.neighbourhood || locationInput, detectedLocation?.postalFSA);
  };

  // Step header title and category
  const headerTitle = useMemo(() => {
    if (isModelStreetStep) {
      return t('q0_progress_title', 'STREET STYLE');
    }
    if (isLocationStep) {
      return t('q7_progress_title', 'YOUR LOCATION IN EDMONTON');
    }
    return t(`q${currentQuestion.number}_progress_title`, `QUESTION ${currentQuestion.number} OF 6`);
  }, [isModelStreetStep, isLocationStep, currentQuestion.number, t]);

  const headerCategory = useMemo(() => {
    if (isModelStreetStep) {
      return t('q0_category', 'Neighbourhood Type');
    }
    if (isLocationStep) {
      return t('q7_category', 'Location & Community');
    }
    return t(`q${currentQuestion.number}_category`, `${currentQuestion.category}`);
  }, [isModelStreetStep, isLocationStep, currentQuestion.number, currentQuestion.category, t]);

  const stepCounterText = useMemo(() => {
    if (isModelStreetStep) {
      return 'Step 1 of 8';
    }
    if (isLocationStep) {
      return 'Step 8 of 8';
    }
    return `Question ${currentQuestion.number} of 6`;
  }, [isModelStreetStep, isLocationStep, currentQuestion.number]);

  const progressPercentage = useMemo(() => {
    return Math.round(((currentStep + 1) / questions.length) * 100);
  }, [currentStep, questions.length]);

  return (
    <div className="w-full max-w-4xl mx-auto h-full max-h-full flex flex-col min-h-0 px-2.5 sm:px-3.5 md:px-4 pt-2 sm:pt-3 pb-0 [@media(orientation:landscape)_and_(max-height:540px)]:p-1.5 overflow-hidden">
      {/* Progress & Category Header */}
      <div className="flex flex-col gap-1 flex-shrink-0 mb-1 sm:mb-1.5">
        <div className="flex items-center justify-between text-xs sm:text-sm font-semibold text-gray-500">
          <span className="flex items-center gap-1.5 truncate">
            <span className="font-bold text-[#004B8D]">
              {headerTitle}
            </span>
            <span className="text-gray-300">·</span>
            <span className="text-gray-500 font-medium truncate">
              {headerCategory}
            </span>
          </span>
          <span className="text-[11px] text-gray-400 font-mono hidden xs:inline">
            {stepCounterText}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-[#004B8D]"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.35 }}
          />
        </div>
      </div>

      {/* Animated Question Card with adaptive layout & momentum scroll */}
      <div className="relative flex-1 flex flex-col justify-start min-h-0 overflow-y-auto overscroll-contain pt-0.5 pb-1 sm:pt-1 sm:pb-2 pr-0.5">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion.id}
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -15 }}
            transition={{ duration: 0.18 }}
            className="flex flex-col w-full"
          >
            <h4 className="text-[13pt] sm:text-[15pt] md:text-[17pt] font-bold text-[#193A5A] mb-1 sm:mb-1.5 leading-snug tracking-[-0.05em]">
              {isModelStreetStep
                ? t('q0_question', 'Choose one of the four neighbourhoods to calibrate live curbside parking stalls in your simulation and adjust home density.')
                : isLocationStep
                ? t('q7_question', 'Enter your full postal code or first three characters of your postal code.')
                : t(`q${currentQuestion.number}_question`, currentQuestion.text)}
            </h4>

            {/* Step 0: Choose Your Model Neighbourhood (Street Layout + Home Density Infill Slider) */}
            {isModelStreetStep && (
              <div className="w-full flex flex-col gap-2 pt-0.5">
                <p className="text-xs sm:text-sm text-gray-600 font-medium">
                  {t('q0_helper', currentQuestion.helperText || "For an example street, select a layout you would like to explore. These simplified examples do not represent every street or household's parking options.")}
                </p>

                {/* 4 Cards Grid - 2x2 Layout */}
                <div
                  className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5"
                  role="radiogroup"
                  aria-label="Edmonton Street Style Choices"
                >
                  {streetModelOptions.map((layout) => {
                    const isSelected = (currentAnswer || currentStreetLayout) === layout.id;
                    return (
                      <button
                        key={layout.id}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        onClick={() => handleSelectStreetModel(layout.id)}
                        className={`text-left p-3 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between gap-1.5 relative active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#004B8D] ${
                          isSelected
                            ? 'border-[#004B8D] bg-blue-50/90 shadow-xs ring-2 ring-[#004B8D]'
                            : 'border-gray-200 bg-white hover:border-[#004B8D]/50 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-1">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-2xl leading-none shrink-0" role="img" aria-label={layout.title}>{layout.icon}</span>
                            <div className="min-w-0">
                              <h4 className={`font-bold text-xs sm:text-sm leading-tight truncate ${isSelected ? 'text-[#004B8D]' : 'text-black'}`}>
                                {layout.title}
                              </h4>
                            </div>
                          </div>
                          <div className="shrink-0 pt-0.5 flex items-center gap-1.5">
                            <span className="text-[10px] font-bold bg-[#004B8D]/10 text-[#004B8D] px-2 py-0.5 rounded-full">
                              {layout.stalls} Stalls
                            </span>
                            {isSelected ? (
                              <span className="w-4 h-4 rounded-full bg-[#004B8D] text-white flex items-center justify-center shadow-xs">
                                <Check className="w-2.5 h-2.5 stroke-[3]" />
                              </span>
                            ) : (
                              <div className="w-4 h-4 rounded-full border-2 border-gray-300 bg-white" />
                            )}
                          </div>
                        </div>

                        <p className="text-[10.5px] sm:text-[11px] text-gray-600 leading-tight">
                          {layout.tag}
                        </p>
                      </button>
                    );
                  })}
                </div>

                {/* Home Density Slider Control */}
                <div className="mt-1 p-3 sm:p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex flex-col gap-2 shadow-2xs">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="p-1.5 rounded-lg bg-[#004B8D]/10 text-[#004B8D] shrink-0">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <label htmlFor="home-density-slider" className="text-xs sm:text-sm font-bold text-[#193A5A] block leading-tight cursor-pointer">
                            {t('drawer_infill_label', 'Home Density')}
                          </label>
                        </div>
                        <p className="text-[11px] text-gray-600 leading-tight mt-0.5">
                          {t('drawer_density_explainer', 'Adds multi-unit housing to the street.')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 text-right">
                      <span className="text-xs font-bold text-[#004B8D] bg-blue-100/70 border border-blue-200 px-2 py-0.5 rounded-full">
                        {(() => {
                          const lots = Math.min(7, Math.max(0, config?.splitInfillLots ?? 0));
                          if (lots === 0) return 'Baseline (0 lots)';
                          if (lots === 1) return '+1 Multi-unit lot';
                          return `+${lots} Multi-unit lots`;
                        })()}
                      </span>
                      <span className="text-[11px] font-bold text-gray-700 bg-white border border-gray-200 px-2 py-0.5 rounded-full shadow-2xs">
                        {(totalDwellings ?? (12 + Math.min(7, Math.max(0, config?.splitInfillLots ?? 0)) * 7))} {t('drawer_dwellings_unit', 'Dwellings')}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1 pt-0.5">
                    <input
                      id="home-density-slider"
                      type="range"
                      aria-label={t('drawer_sliders_density_aria', 'Home density')}
                      min="0"
                      max="7"
                      step="1"
                      value={Math.min(7, Math.max(0, config?.splitInfillLots ?? 0))}
                      onChange={(e) => {
                        const new8Plex = parseInt(e.target.value, 10);
                        const tiers = Math.floor(new8Plex / 3);
                        onConfigChange?.({
                          splitInfillLots: new8Plex,
                          deliveriesPerHomePerWeek: tiers >= 1 && (config?.deliveriesPerHomePerWeek ?? 1.5) < 2.0 ? 2.0 : (config?.deliveriesPerHomePerWeek ?? 1.5)
                        });
                      }}
                      className="accent-[#009A44] cursor-pointer h-2 bg-gray-200 rounded-lg w-full"
                    />
                    <div className="flex justify-between text-[10px] text-gray-500 font-medium px-0.5">
                      <span>Low Density (0)</span>
                      <span>Moderate (+3 lots)</span>
                      <span>High Density (+7 lots)</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 7: Choose your neighbourhood type? (Location) */}
            {isLocationStep && (
              <div className="w-full flex flex-col gap-2 pt-0.5">
                <label htmlFor="location-smart-input" className="block text-xs sm:text-sm font-semibold text-[#193A5A] leading-snug">
                  {t('q7_helper', 'Enter your full postal code or first three characters of your postal code:')}
                </label>

                {/* Single Smart Unified Search Input with explicit 48px touch target */}
                <div className="relative flex flex-col gap-1 w-full">
                  {/* Mode Indicator Pill when typing */}
                  {locationInput && currentAnswer !== 'OPT_OUT' && (
                    <div className="flex items-center justify-between text-[11px] font-semibold px-0.5">
                      <div className="flex items-center gap-1.5">
                        {inputIntent.type === 'fsa' && (
                          <span className={`px-2 py-0.5 rounded-full flex items-center gap-1 ${inputIntent.isValid ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                            <span>📮</span>
                            <span>Forward Sortation Area (FSA)</span>
                            <span className="font-normal opacity-75">• Dropdown suppressed</span>
                          </span>
                        )}
                        {inputIntent.type === 'postal_code' && (
                          <span className="px-2 py-0.5 rounded-full bg-blue-100 text-[#004B8D] flex items-center gap-1">
                            <span>📮</span>
                            <span>Exact 6-Character Postal Code</span>
                          </span>
                        )}
                        {inputIntent.type === 'neighbourhood' && (
                          <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 flex items-center gap-1">
                            <span>📍</span>
                            <span>Neighbourhood Text Search</span>
                          </span>
                        )}
                      </div>
                      {inputIntent.type === 'fsa' && inputIntent.isValid && (
                        <span className="text-[10px] text-emerald-700 font-medium hidden xs:inline">
                          ✓ Valid Edmonton FSA ({inputIntent.fsaData?.ward} Ward)
                        </span>
                      )}
                    </div>
                  )}

                  <div className="relative">
                    <input
                      type="text"
                      id="location-smart-input"
                      disabled={currentAnswer === 'OPT_OUT'}
                      placeholder={currentAnswer === 'OPT_OUT' ? t('postal_opt_out_placeholder', 'Postal code opted out') : t('q7_placeholder', 'Postal code (e.g. T5J 2R7 or T5J)...')}
                      value={currentAnswer === 'OPT_OUT' ? '' : locationInput}
                      onChange={(e) => handleLocationInputChange(e.target.value)}
                      onFocus={() => {
                        if (inputIntent.type === 'neighbourhood' && locationInput.trim().length > 0) {
                          setShowDropdown(true);
                        }
                      }}
                      onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          triggerFeedback('button');
                          onNavigate(1);
                        }
                      }}
                      className={`w-full pl-3.5 sm:pl-4 pr-16 py-2 sm:py-2.5 border-2 rounded-lg text-sm sm:text-base font-semibold placeholder:text-gray-400 placeholder:font-normal focus:outline-none transition-all min-h-[46px] shadow-2xs ${
                        currentAnswer === 'OPT_OUT'
                          ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                          : inputIntent.type === 'fsa' && inputIntent.isValid
                          ? 'bg-white border-emerald-500 text-emerald-900 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20'
                          : inputIntent.type === 'postal_code' && inputIntent.isValid
                          ? 'bg-white border-[#004B8D] text-[#004B8D] focus:border-[#004B8D] focus:ring-2 focus:ring-[#004B8D]/20'
                          : 'bg-white border-gray-300 text-gray-900 focus:border-[#004B8D] focus:ring-2 focus:ring-[#004B8D]/20'
                      }`}
                      aria-label={t('survey_location_input_aria', 'Edmonton postal code')}
                      aria-autocomplete="list"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                      {locationInput && currentAnswer !== 'OPT_OUT' && (
                        <button
                          type="button"
                          onClick={() => {
                            setLocationInput('');
                            setSelectedDisambiguation(null);
                            setShowDropdown(false);
                            onSelectOption(currentQuestion.id, '');
                          }}
                          className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                          aria-label={t('survey_clear_location_aria', 'Clear location search')}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                      <div className="pointer-events-none text-gray-400 flex items-center justify-center">
                        <Search className="w-5 h-5 text-[#004B8D]" />
                      </div>
                    </div>
                  </div>

                  {/* Autocomplete Dropdown: strictly for Neighbourhood search (Pattern 3), NEVER for FSA (Pattern 1) */}
                  {showDropdown && filteredNeighbourhoods.length > 0 && currentAnswer !== 'OPT_OUT' && inputIntent.type === 'neighbourhood' && (
                    <div className="absolute top-[48px] left-0 right-0 z-30 bg-white border border-[#004B8D]/40 rounded-lg shadow-xl overflow-hidden max-h-48 overflow-y-auto divide-y divide-gray-100">
                      {filteredNeighbourhoods.map((n) => (
                        <button
                          key={n.name}
                          type="button"
                          onMouseDown={() => handleSelectNeighbourhood(n)}
                          className="w-full text-left px-3 py-2.5 hover:bg-[#004B8D]/10 flex items-center gap-1.5 text-xs cursor-pointer transition-colors"
                        >
                          <MapPin className="w-3.5 h-3.5 text-[#004B8D] shrink-0" />
                          <span className="font-bold text-gray-800">{n.name}</span>
                          {n.ward && (
                            <span className="text-[11px] text-gray-500 font-medium">
                              ({n.ward.toLowerCase().includes('ward') ? n.ward : `${n.ward} Ward`})
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Postal Code Opt-Out Checkbox */}
                <div className="pt-0.5 pb-0.5">
                  <label
                    htmlFor="postal-code-opt-out-checkbox"
                    className="inline-flex items-center gap-2 cursor-pointer py-1 text-xs sm:text-sm font-medium text-gray-700 select-none hover:text-[#004B8D] transition-colors"
                  >
                    <input
                      type="checkbox"
                      id="postal-code-opt-out-checkbox"
                      name="postalCodeOptOut"
                      checked={currentAnswer === 'OPT_OUT'}
                      onChange={(e) => {
                        triggerFeedback('button');
                        if (e.target.checked) {
                          setLocationInput('');
                          setSelectedDisambiguation(null);
                          setShowDropdown(false);
                          onSelectOption(currentQuestion.id, 'OPT_OUT');
                          onLayoutChange?.(currentStreetLayout, undefined, 'OPT_OUT');
                        } else {
                          onSelectOption(currentQuestion.id, '');
                        }
                      }}
                      className="w-4 h-4 rounded border-gray-300 text-[#004B8D] focus:ring-[#004B8D] cursor-pointer accent-[#004B8D]"
                    />
                    <span>
                      {t('postal_code_opt_out', 'I prefer not to provide my postal code')}
                    </span>
                  </label>
                </div>

                {/* Opt-out confirmation banner when checked */}
                {currentAnswer === 'OPT_OUT' && (
                  <div className="flex items-center gap-2 p-2.5 rounded-lg bg-gray-50 border border-gray-200 text-xs text-gray-600 font-medium">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Postal code opted out. You can proceed with the survey and all your responses will remain anonymous.</span>
                  </div>
                )}

                {/* Multi-neighbourhood Disambiguation Follow-up (e.g. T5A 0B4 spans Industrial Heights & Kennedale Industrial) */}
                {detectedLocation?.multipleNeighbourhoods && detectedLocation.multipleNeighbourhoods.length > 1 && currentAnswer !== 'OPT_OUT' && (
                  <div className="p-2.5 rounded-lg bg-amber-50/90 border border-amber-200 text-xs shadow-2xs">
                    <div className="flex items-start gap-1.5 text-amber-900 font-semibold mb-1.5">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <span>Postal code {detectedLocation.displayCode || detectedLocation.postalFSA} spans multiple neighbourhoods.</span>
                        <div className="text-[11px] font-normal text-amber-800">
                          Please select your exact neighbourhood to ensure accurate local planning data:
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5 pl-5">
                      {detectedLocation.multipleNeighbourhoods.map((opt) => {
                        const isChosen = (selectedDisambiguation || detectedLocation.neighbourhood) === opt.name;
                        return (
                          <button
                            key={opt.name}
                            type="button"
                            onClick={() => handleSelectDisambiguation(opt)}
                            className={`px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5 ${
                              isChosen
                                ? 'bg-[#004B8D] text-white shadow-xs'
                                : 'bg-white text-gray-800 border border-amber-300 hover:bg-amber-100'
                            }`}
                          >
                            <span>{opt.name}</span>
                            <span className={`text-[10px] px-1 py-0.2 rounded ${isChosen ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'}`}>
                              {opt.ward} Ward • {opt.classification}
                            </span>
                            {isChosen && <Check className="w-3 h-3 text-white ml-0.5" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Identified Neighbourhood & Postal Code feedback with Ward */}
                {detectedLocation && currentAnswer !== 'OPT_OUT' && (
                  <div className="flex items-center p-2.5 rounded-lg bg-[#004B8D]/5 border border-[#004B8D]/20 text-xs shadow-2xs gap-1.5 sm:gap-2">
                    <div className="flex items-center gap-2 flex-wrap min-w-0">
                      {detectedLocation.isFsaOnly ? (
                        <div className="flex items-center gap-1.5 font-bold text-[#004B8D]">
                          <Building2 className="w-4 h-4 shrink-0 text-[#004B8D]" />
                          <span>FSA Region: {detectedLocation.postalFSA}</span>
                          <span className="text-gray-400 font-normal">|</span>
                          <span className="text-gray-700 font-medium truncate">{detectedLocation.neighbourhood}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 font-bold text-[#004B8D]">
                          <MapPin className="w-4 h-4 shrink-0 text-[#004B8D]" />
                          <span className="truncate">{selectedDisambiguation || detectedLocation.neighbourhood}</span>
                        </div>
                      )}

                      {/* Ward */}
                      {detectedLocation.ward && (
                        <span className="text-[10px] font-medium text-gray-700 bg-gray-100 px-1.5 py-0.5 rounded shrink-0">
                          Ward {detectedLocation.ward}
                        </span>
                      )}
                    </div>
                  </div>
                )}


                {/* City of Edmonton Statutory Collection Notice in 10pt font */}
                <p className="text-[10pt] leading-normal text-gray-600 border-t border-gray-200/80 pt-2 mt-1 select-text">
                  {t(
                    'privacy_popa_statutory_notice',
                    'Personal information is collected for the purpose of Residential Parking Public Engagement and will be used for analysis and insights. Collection is authorized under section 4(c) of the Protection of Privacy Act (POPA) and is managed and protected in accordance with the Act. The City intends to input the information into an automated system to generate content or make decisions, recommendations or predictions in accordance with the City of Edmonton Generative AI Standard.(see Council Policies, standards section). For questions about the collection, please contact the Community Activator at 780-496-5236 and residentialparking@edmonton.ca'
                  )}
                </p>
              </div>
            )}

            {/* Steps 1 to 6: Policy Questions */}
            {!isModelStreetStep && !isLocationStep && (
              <div
                className={gridClasses}
                role="radiogroup"
                aria-label={`Options for ${currentQuestion.text}`}
                onKeyDown={(e) => {
                  if (['ArrowDown', 'ArrowRight'].includes(e.key)) {
                    e.preventDefault();
                    const options = currentQuestion.options || [];
                    const currentIndex = options.findIndex((o) => o.id === currentAnswer);
                    const nextIndex = currentIndex < options.length - 1 ? currentIndex + 1 : 0;
                    const nextOption = options[nextIndex];
                    if (nextOption) {
                      triggerFeedback('choice');
                      onSelectOption(currentQuestion.id, nextOption.id);
                      document.getElementById(`option-btn-${nextOption.id}`)?.focus();
                    }
                  } else if (['ArrowUp', 'ArrowLeft'].includes(e.key)) {
                    e.preventDefault();
                    const options = currentQuestion.options || [];
                    const currentIndex = options.findIndex((o) => o.id === currentAnswer);
                    const prevIndex = currentIndex > 0 ? currentIndex - 1 : options.length - 1;
                    const prevOption = options[prevIndex];
                    if (prevOption) {
                      triggerFeedback('choice');
                      onSelectOption(currentQuestion.id, prevOption.id);
                      document.getElementById(`option-btn-${prevOption.id}`)?.focus();
                    }
                  }
                }}
              >
                {currentQuestion.options.map((option) => {
                  const isSelected = currentAnswer === option.id;
                  return (
                    <button
                      key={option.id}
                      id={`option-btn-${option.id}`}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      aria-describedby={(currentAnswer && tradeoffOutcome?.hasAnswer) ? 'tradeoff-education-card' : undefined}
                      tabIndex={isSelected || (!currentAnswer && option === currentQuestion.options[0]) ? 0 : -1}
                      onClick={() => {
                        triggerFeedback('choice');
                        onSelectOption(currentQuestion.id, option.id);
                      }}
                      className={`w-full text-left py-2 px-2.5 sm:py-2.5 sm:px-3 rounded-lg border-2 transition-all flex items-start gap-2.5 cursor-pointer relative min-h-[44px] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#004B8D] focus-visible:ring-offset-2 ${
                        isSelected
                          ? 'border-[#004B8D] bg-[#004B8D]/8 shadow-2xs ring-1 ring-[#004B8D]'
                          : 'border-gray-200 bg-white hover:border-[#004B8D]/40 hover:bg-gray-50/80'
                      }`}
                    >
                      <div className="pt-0.5 flex-shrink-0">
                        <div
                          className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                            isSelected
                              ? 'border-[#004B8D] bg-[#004B8D]'
                              : 'border-gray-400 bg-white'
                          }`}
                        >
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                      </div>

                      <div className="flex flex-col flex-grow min-w-0">
                        <span className="text-[12pt] font-semibold leading-tight tracking-tight text-black">
                          {t(`q${currentQuestion.number}_option_${option.id.slice(-1)}`, option.label)}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* FOR YOUR CHOICE Trade-off card (displayed for Questions 1-6 once an answer is chosen) */}
            {!isModelStreetStep && !isLocationStep && (currentAnswer || tradeoffOutcome?.hasAnswer) && (
              <div
                id="tradeoff-education-card"
                role="region"
                aria-live="polite"
                className="mt-1.5 bg-white border border-[#004B8D]/30 rounded-lg p-1.5 sm:p-2 shadow-2xs transition-all animate-in fade-in slide-in-from-bottom-1 duration-150"
              >
                <div className="flex items-center gap-1 mb-1 pb-0.5 border-b border-gray-100">
                  <Sparkles className="w-3 h-3 text-[#FFC72C] fill-[#FFC72C] shrink-0" />
                  <span className="text-[9pt] sm:text-[9.5pt] font-extrabold uppercase tracking-wider text-[#004B8D] leading-none">
                    {t('tradeoff_card_header', 'FOR YOUR CHOICE')}
                  </span>
                </div>

                <div className="flex flex-col gap-1.5">
                  {/* Benefit Container */}
                  <div className="overflow-hidden bg-emerald-50/70 border border-emerald-300 rounded-md text-emerald-950 shadow-2xs">
                    <div className="w-full bg-emerald-700 px-2 py-0.5 flex items-center gap-1.5 text-white">
                      <Check className="w-3 h-3 stroke-[3]" />
                      <span className="text-[8.5pt] sm:text-[9pt] font-black uppercase tracking-wider leading-none">
                        {t('tradeoff_gain_pill', 'Benefit')}
                      </span>
                    </div>
                    <div className="px-2 py-1.5">
                      <p className="text-[12pt] font-normal leading-tight text-emerald-950">
                        {currentAnswer ? t(`q${currentQuestion.number}_gain_${currentAnswer.slice(-1)}`, tradeoffOutcome?.benefitText || tradeoffOutcome?.curbsideImpactSummary || '') : (tradeoffOutcome?.benefitText || tradeoffOutcome?.curbsideImpactSummary || '')}
                      </p>
                    </div>
                  </div>

                  {/* Trade-off Container */}
                  <div className="overflow-hidden bg-amber-50/70 border border-amber-300 rounded-md text-amber-950 shadow-2xs">
                    <div className="w-full bg-amber-700 px-2 py-0.5 flex items-center gap-1.5 text-white">
                      <span className="text-[10px] leading-none">⚡</span>
                      <span className="text-[8.5pt] sm:text-[9pt] font-black uppercase tracking-wider leading-none">
                        {t('tradeoff_cost_pill', 'Trade-off')}
                      </span>
                    </div>
                    <div className="px-2 py-1.5">
                      <p className="text-[12pt] font-normal leading-tight text-amber-950">
                        {currentAnswer ? t(`q${currentQuestion.number}_cost_${currentAnswer.slice(-1)}`, tradeoffOutcome?.costText || tradeoffOutcome?.tradeoffRationale || '') : (tradeoffOutcome?.costText || tradeoffOutcome?.tradeoffRationale || '')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Buttons & Validation Alert */}
      <div
        id="survey-navigation-container"
        role="navigation"
        aria-label="Question Navigation"
        className="sticky bottom-0 z-30 bg-white pt-2 sm:pt-2.5 pb-[max(0.75rem,env(safe-area-inset-bottom))] px-3 sm:px-4 md:px-6 border-t border-gray-200 flex flex-col gap-1.5 flex-shrink-0 shadow-[0_-3px_10px_rgba(0,0,0,0.04)]"
      >
        {showValidationError && (
          <div 
            role="alert" 
            aria-live="assertive"
            className="text-xs sm:text-sm text-[#E8552D] bg-[#E8552D]/10 border border-[#E8552D]/30 px-3 py-1.5 rounded-md font-semibold flex items-center gap-2 animate-pulse"
          >
            <span className="w-2 h-2 rounded-full bg-[#E8552D] flex-shrink-0" aria-hidden="true" />
            {validationErrorMsg || (isLocationStep ? t('nav_alert_postal_format', 'Please enter your postal code or select the opt-out checkbox.') : t('nav_alert_select_option', 'Please select an option to advance.'))}
          </div>
        )}

        <div className="flex items-center justify-between gap-2 sm:gap-3">
          {/* Go Back button */}
          <button
            type="button"
            id="survey-prev-btn"
            disabled={currentStep === 0}
            onClick={() => {
              if (currentStep > 0) {
                triggerFeedback('button');
                onNavigate(-1);
              }
            }}
            className={`px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-1.5 border-2 transition-all min-h-[44px] sm:min-h-[48px] min-w-[48px] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#004B8D] ${
              currentStep === 0
                ? 'opacity-40 cursor-not-allowed border-gray-200 bg-gray-50 text-gray-400'
                : 'border-gray-300 bg-white text-gray-800 hover:bg-gray-100 cursor-pointer shadow-2xs'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>{t('nav_btn_go_back', 'Go Back')}</span>
          </button>

          {/* Next / Calculate Persona button */}
          {isLastQuestion ? (
            <button
              type="button"
              id="survey-next-btn"
              onClick={() => {
                triggerFeedback('submit');
                onNavigate(1);
              }}
              className="px-5 py-2 sm:px-6 sm:py-2.5 rounded-xl font-black text-xs sm:text-sm bg-[#004B8D] hover:bg-[#003566] active:scale-95 text-white flex items-center gap-2 shadow-xs transition-all cursor-pointer min-h-[44px] sm:min-h-[48px] min-w-[48px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#004B8D]"
            >
              <CheckCircle2 className="w-4 h-4 text-[#FFC72C] stroke-[2.5]" />
              <span>{t('nav_btn_calc_persona', 'Calculate Resident Profile')}</span>
            </button>
          ) : (
            <button
              type="button"
              id="survey-next-btn"
              onClick={() => {
                triggerFeedback('button');
                onNavigate(1);
              }}
              className="px-5 py-2 sm:px-6 sm:py-2.5 rounded-xl font-black text-xs sm:text-sm bg-[#004B8D] hover:bg-[#003566] active:scale-95 text-white flex items-center gap-2 shadow-xs transition-all cursor-pointer min-h-[44px] sm:min-h-[48px] min-w-[48px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#004B8D]"
            >
              <span>{t('nav_btn_next', 'Next')}</span>
              <ChevronRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export const SurveyStage = React.memo(SurveyStageComponent);
