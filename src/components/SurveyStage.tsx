import React, { useState, useMemo } from 'react';
import { SurveyQuestion, StreetLayoutTypology, SimulationConfig } from '../types';
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  MapPin,
  Shield,
  Search,
  Check,
  Sparkles,
  X
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
import { resolveLocationOrPredictiveAddress } from '../data/edmontonPostalData';

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

  const [neighbourhoodQuery, setNeighbourhoodQuery] = useState<string>(() => currentNeighbourhoodName || '');
  const [postalInput, setPostalInput] = useState<string>(() => {
    if (currentAnswer && currentAnswer !== 'OPT_OUT' && /^[A-Z0-9\s-]+$/i.test(currentAnswer) && currentAnswer.length <= 8 && /\d/.test(currentAnswer)) {
      return currentAnswer;
    }
    return '';
  });
  const [showDropdown, setShowDropdown] = useState(false);

  const filteredNeighbourhoods = useMemo(() => {
    return searchNeighbourhoods(neighbourhoodQuery, 8);
  }, [neighbourhoodQuery]);

  const detectedLocation = useMemo(() => {
    const input = postalInput || neighbourhoodQuery;
    if (!input || input === 'OPT_OUT') return null;
    return resolveLocationOrPredictiveAddress(input);
  }, [postalInput, neighbourhoodQuery]);

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
      tag: 'Continuous curb • Rear gravel lane & garages • Zero front driveways',
      stalls: getStreetLayoutInfo('mature_laned').curbsideCapacity,
      desc: 'Strathcona, Westmount, Glenora, Highlands, Bonnie Doon'
    },
    {
      id: 'infill_skinny',
      icon: '🏘️',
      title: 'Multiple Homes on Smaller Lots',
      era: 'Post-2015 Redeveloping',
      tag: 'Subdivided lots • Narrow skinny duplexes & garden suites',
      stalls: getStreetLayoutInfo('infill_skinny').curbsideCapacity,
      desc: 'Garneau, Oliver (Wîhkwêntôwin), Downtown, Queen Alex, McKernan'
    },
    {
      id: 'suburban_front_driveway',
      icon: '🚗',
      title: 'Homes with Front Driveways',
      era: '1980s–2000s Subdivisions',
      tag: 'Attached garages • Unmarked road (35–55 km/h) • Driveways (10+ stalls)',
      stalls: getStreetLayoutInfo('suburban_front_driveway').curbsideCapacity,
      desc: 'Mill Woods, Callingwood, Riverbend, Castledowns, Blue Quill'
    },
    {
      id: 'contemporary_townhomes',
      icon: '🏢',
      title: 'Townhomes',
      era: '2020s City Plan Developing',
      tag: 'Dense townhomes • Rear garage lane • Pocket parking bays',
      stalls: getStreetLayoutInfo('contemporary_townhomes').curbsideCapacity,
      desc: 'Griesbach, Blatchford, Windermere, Chappelle, Laurel, Secord'
    }
  ];

  // Location input handlers - preserve user's chosen street model
  const handleLocationInputChange = (rawVal: string) => {
    const trimmed = rawVal.trim();
    const isPostalCandidate = /^[A-Z0-9\s-]+$/i.test(trimmed) && (/\d/.test(trimmed) || (trimmed.length <= 3 && /^T[0-9]?[A-Z]?$/i.test(trimmed)));

    if (isPostalCandidate) {
      const sanitized = rawVal.toUpperCase().replace(/[^A-Z0-9\s-]/g, '').slice(0, 8);
      setPostalInput(sanitized);
      const detection = detectLayoutAndNeighbourhood(sanitized);
      if (detection.neighbourhood) {
        setNeighbourhoodQuery(detection.neighbourhood.name);
      }
      onSelectOption(currentQuestion.id, sanitized);
    } else {
      setNeighbourhoodQuery(rawVal);
      setShowDropdown(true);
      const detection = detectLayoutAndNeighbourhood(rawVal);
      if (detection.neighbourhood?.postalFSA?.[0]) {
        setPostalInput(`${detection.neighbourhood.postalFSA[0]} `);
      }
      onSelectOption(currentQuestion.id, rawVal);
    }
  };

  const handleSelectNeighbourhood = (n: EdmontonNeighbourhood) => {
    triggerFeedback('choice');
    setNeighbourhoodQuery(n.name);
    setShowDropdown(false);
    if (n.postalFSA?.[0] && !postalInput) {
      setPostalInput(`${n.postalFSA[0]} `);
    }
    onSelectOption(currentQuestion.id, n.name);
  };

  const handleSelectStreetModel = (layoutId: StreetLayoutTypology) => {
    triggerFeedback('choice');
    onSelectOption('q0', layoutId);
    onLayoutChange?.(layoutId, neighbourhoodQuery, postalInput);
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
                ? t('q0_question', 'Choose your model neighbourhood.')
                : isLocationStep
                ? t('q7_question', 'Choose your model neighbourhood.')
                : t(`q${currentQuestion.number}_question`, currentQuestion.text)}
            </h4>

            {/* Step 0: Choose Your Model Neighbourhood (Street Layout + Home Density Infill Slider) */}
            {isModelStreetStep && (
              <div className="w-full flex flex-col gap-2 pt-0.5">
                <p className="text-xs sm:text-sm text-gray-600 font-medium">
                  {t('q0_helper', currentQuestion.helperText || 'Choose one of the four neighbourhoods to calibrate live curbside parking stalls in your simulation and adjust home density to increase new infill:')}
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
                              <span className="text-[10px] text-gray-500 font-semibold block leading-tight truncate">
                                {layout.era}
                              </span>
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

                {/* Home Density (Infill) Slider container just above the Active Simulation Model container */}
                <div className="bg-gradient-to-r from-purple-50/90 to-blue-50/90 border-2 border-purple-200/90 rounded-xl p-2.5 sm:p-3 shadow-2xs flex flex-col gap-1.5 mt-0.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-[#7B2CBF] text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
                        🏘️
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs sm:text-sm font-black text-gray-900 block leading-tight truncate">
                          {t('drawer_infill_label', 'Home Density')} (Infill)
                        </span>
                        <span className="text-[10px] sm:text-[10.5px] text-gray-600 font-semibold block leading-tight">
                          {t('density_slider_subtitle', 'Adjust 8-plex infill lots in your street simulation to increase infill')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 pt-0.5">
                    <span className="text-[10px] font-bold text-gray-500 shrink-0">Baseline (0)</span>
                    <input
                      type="range"
                      aria-label={t('drawer_sliders_density_aria', 'Home density')}
                      min="0"
                      max="7"
                      step="1"
                      value={Math.min(7, Math.max(0, config?.splitInfillLots ?? 0))}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        triggerFeedback('choice');
                        const tiers = Math.floor(val / 3);
                        onConfigChange?.({
                          splitInfillLots: val,
                          deliveriesPerHomePerWeek: tiers >= 1 && (config?.deliveriesPerHomePerWeek ?? 1.2) < 2.0 ? 2.0 : config?.deliveriesPerHomePerWeek
                        });
                      }}
                      className="accent-[#7B2CBF] cursor-pointer h-2.5 bg-gray-200 rounded-lg w-full"
                    />
                    <span className="text-[10px] font-bold text-purple-700 shrink-0">Max Infill (7)</span>
                  </div>

                  <p className="text-[10px] sm:text-[10.5px] text-gray-600 leading-snug">
                    {t('sim_density_explainer', 'Each infill adds multi-unit housing (8 dwellings per 15.6m lot).')}
                  </p>
                </div>

                {/* Active selection feedback pill / Active Simulation Model Container */}
                {(() => {
                  const activeTypology = (currentAnswer as StreetLayoutTypology || currentStreetLayout);
                  const activeInfo = getStreetLayoutInfo(activeTypology);
                  let displayCapacity = activeInfo.curbsideCapacity;
                  if (activeTypology === 'suburban_front_driveway') {
                    const num8Plex = Math.min(7, Math.max(0, config?.splitInfillLots ?? 0));
                    const activeLots = [2, 6, 4, 8, 1, 7, 10].slice(0, num8Plex);
                    const restoredCount = activeLots.filter(lot => lot !== 10).length;
                    displayCapacity += restoredCount;
                  }
                  return (
                    <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-blue-50 border border-blue-200 text-xs text-[#004B8D] mt-0.5 shadow-2xs">
                      <span className="truncate">
                        {t('survey_active_style_label', 'Active simulation model:')}{' '}
                        <strong className="font-bold text-[#193A5A]">{activeInfo.title}</strong>
                      </span>
                      <span className="text-[10px] font-bold bg-[#004B8D] text-white px-2 py-0.5 rounded-full shrink-0 ml-2">
                        {displayCapacity} Legal Stalls
                      </span>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Step 7: Choose your neighbourhood type? (Location) */}
            {isLocationStep && (
              <div className="w-full flex flex-col gap-2 pt-0.5">
                <label htmlFor="location-smart-input" className="block text-xs sm:text-sm font-semibold text-[#193A5A] leading-snug">
                  {t('q7_helper', 'Search your neighbourhood or enter a postal code to record your location:')}
                </label>

                {/* Single Smart Unified Search Input with explicit 48px touch target */}
                <div className="relative flex flex-col gap-1 w-full">
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                      <Search className="w-5 h-5 text-[#004B8D]" />
                    </div>
                    <input
                      type="text"
                      id="location-smart-input"
                      disabled={currentAnswer === 'OPT_OUT'}
                      placeholder={t('q7_placeholder', 'Postal code (e.g. T5J 2R7) or neighbourhood...')}
                      value={currentAnswer === 'OPT_OUT' ? '' : (postalInput || neighbourhoodQuery)}
                      onChange={(e) => handleLocationInputChange(e.target.value)}
                      onFocus={() => setShowDropdown(true)}
                      onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          triggerFeedback('button');
                          onNavigate(1);
                        }
                      }}
                      className="w-full pl-10 pr-9 py-2 sm:py-2.5 bg-white border-2 border-gray-300 rounded-lg text-sm sm:text-base font-semibold text-[#004B8D] placeholder:text-gray-400 placeholder:font-normal focus:outline-none focus:border-[#004B8D] focus:ring-2 focus:ring-[#004B8D]/20 transition-all min-h-[44px] shadow-2xs"
                      aria-label={t('survey_location_input_aria', 'Edmonton postal code or neighbourhood')}
                    />
                    {(postalInput || neighbourhoodQuery) && currentAnswer !== 'OPT_OUT' && (
                      <button
                        type="button"
                        onClick={() => {
                          setPostalInput('');
                          setNeighbourhoodQuery('');
                          onSelectOption(currentQuestion.id, '');
                        }}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1.5 cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
                        aria-label={t('survey_clear_location_aria', 'Clear location search')}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Autocomplete Dropdown with first 3 characters of postal code (FSA) */}
                  {showDropdown && filteredNeighbourhoods.length > 0 && currentAnswer !== 'OPT_OUT' && (
                    <div className="absolute top-[44px] left-0 right-0 z-30 bg-white border border-[#004B8D]/40 rounded-lg shadow-xl overflow-hidden max-h-40 overflow-y-auto">
                      {filteredNeighbourhoods.map((n) => (
                        <button
                          key={n.name}
                          type="button"
                          onMouseDown={() => handleSelectNeighbourhood(n)}
                          className="w-full text-left px-3 py-1.5 hover:bg-[#004B8D]/10 flex items-center justify-between text-xs border-b border-gray-100 last:border-b-0 cursor-pointer"
                        >
                          <span className="font-bold text-gray-800">{n.name}</span>
                          {n.postalFSA?.[0] && (
                            <span className="text-[10px] text-[#004B8D] font-bold bg-[#004B8D]/10 px-1.5 py-0.5 rounded">
                              {n.postalFSA[0]}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Identified Neighbourhood & Postal Code feedback */}
                {detectedLocation && currentAnswer !== 'OPT_OUT' && (
                  <div className="flex items-center justify-between p-2 rounded-lg bg-[#004B8D]/5 border border-[#004B8D]/20 text-xs shadow-2xs">
                    <div className="flex items-center gap-1.5 truncate">
                      <MapPin className="w-3.5 h-3.5 text-[#004B8D] shrink-0" />
                      <span className="font-bold text-[#004B8D] truncate">
                        {detectedLocation.neighbourhood}
                      </span>
                      <span className="text-[10px] font-semibold text-[#004B8D] bg-[#004B8D]/10 px-1.5 py-0.5 rounded shrink-0">
                        Postal Code: {detectedLocation.postalFSA}
                      </span>
                      {detectedLocation.ward && (
                        <span className="text-[10px] text-gray-500 truncate hidden xs:inline">
                          • Ward {detectedLocation.ward}
                        </span>
                      )}
                    </div>
                    {detectedLocation.matchedBy === 'predictive_spelling' && (
                      <span className="text-[10px] text-amber-700 bg-amber-100/80 px-1.5 py-0.5 rounded font-medium shrink-0">
                        Auto-corrected
                      </span>
                    )}
                  </div>
                )}

                {/* Opt-Out Option & Privacy */}
                <div className="flex items-center justify-between text-[10px] text-gray-500 pt-0.5">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={currentAnswer === 'OPT_OUT'}
                      onChange={(e) => {
                        triggerFeedback('choice');
                        const checked = e.target.checked;
                        if (checked) {
                          setPostalInput('');
                          setNeighbourhoodQuery('');
                          onSelectOption(currentQuestion.id, 'OPT_OUT');
                        } else {
                          onSelectOption(currentQuestion.id, '');
                        }
                      }}
                      className="w-3.5 h-3.5 text-[#004B8D] rounded border-gray-300 focus:ring-[#004B8D]"
                    />
                    <span className="text-gray-600 select-none font-medium">
                      {t('survey_prefer_not_to_share', 'Prefer not to share location')}
                    </span>
                  </label>
                  <span className="flex items-center gap-1 text-gray-400 hidden xs:inline-flex">
                    <Shield className="w-3 h-3 text-[#004B8D]/70 shrink-0" />
                    {t('survey_postal_codes_anonymized', 'Postal codes anonymized')}
                  </span>
                </div>

                {/* City of Edmonton Statutory Collection Notice in 10pt font */}
                <p className="text-[10pt] leading-normal text-gray-600 border-t border-gray-200/80 pt-2 mt-1 select-text">
                  {t(
                    'privacy_popa_statutory_notice',
                    'Personal information is collected for the purpose of Residential Parking Public Engagement and will be used for analysis and insights. Collection is authorized under section 4(c) of the Protection of Privacy Act (POPA) and is managed and protected in accordance with the Act. The City intends to input the information into an automated system to generate content or make decisions, recommendations or predictions in accordance with the City of Edmonton Generative AI Standard. For questions about the collection, please contact [title], [business telephone number] and [email address].'
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
                  {/* The Gain Container */}
                  <div className="overflow-hidden bg-emerald-50/70 border border-emerald-300 rounded-md text-emerald-950 shadow-2xs">
                    <div className="w-full bg-emerald-700 px-2 py-0.5 flex items-center gap-1.5 text-white">
                      <Check className="w-3 h-3 stroke-[3]" />
                      <span className="text-[8.5pt] sm:text-[9pt] font-black uppercase tracking-wider leading-none">
                        {t('tradeoff_gain_pill', 'The Gain')}
                      </span>
                    </div>
                    <div className="px-2 py-1.5">
                      <p className="text-[12pt] font-normal leading-tight text-emerald-950">
                        {tradeoffOutcome?.benefitText || tradeoffOutcome?.curbsideImpactSummary}
                      </p>
                    </div>
                  </div>

                  {/* The Cost Container */}
                  <div className="overflow-hidden bg-amber-50/70 border border-amber-300 rounded-md text-amber-950 shadow-2xs">
                    <div className="w-full bg-amber-700 px-2 py-0.5 flex items-center gap-1.5 text-white">
                      <span className="text-[10px] leading-none">⚡</span>
                      <span className="text-[8.5pt] sm:text-[9pt] font-black uppercase tracking-wider leading-none">
                        {t('tradeoff_cost_pill', 'The Cost')}
                      </span>
                    </div>
                    <div className="px-2 py-1.5">
                      <p className="text-[12pt] font-normal leading-tight text-amber-950">
                        {tradeoffOutcome?.costText || tradeoffOutcome?.tradeoffRationale}
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
            {validationErrorMsg || (isLocationStep ? t('nav_alert_postal_format', 'Please enter your postal code, neighbourhood, or select "Prefer not to share location".') : t('nav_alert_select_option', 'Please select an option to advance.'))}
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
