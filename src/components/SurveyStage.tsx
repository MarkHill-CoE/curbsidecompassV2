import React, { useState, useMemo, useEffect } from 'react';
import { SurveyQuestion, StreetLayoutTypology } from '../types';
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
  getTypologyFromPostalCode,
  detectLayoutAndNeighbourhood,
  POPULAR_EDMONTON_NEIGHBOURHOODS,
  searchNeighbourhoods,
  findNeighbourhood,
  EdmontonNeighbourhood
} from '../data/edmontonNeighbourhoods';

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
}

const SurveyStageComponent: React.FC<SurveyStageProps> = ({
  questions,
  currentStep,
  selectedAnswers,
  onSelectOption,
  onNavigate,
  showValidationError,
  validationErrorMsg,
  totalX,
  totalY,
  tradeoffOutcome,
  policyNote,
  currentStreetLayout = 'mature_laned',
  currentNeighbourhoodName,
  onLayoutChange
}) => {
  const { t } = useAppText();
  const currentQuestion = questions[currentStep];
  const isLastQuestion = currentStep === questions.length - 1;
  const progressPct = ((currentStep + 1) / questions.length) * 100;
  const currentAnswer = selectedAnswers[currentQuestion.id];
  const isTextQuestion = currentQuestion.type === 'text' || currentQuestion.options.length === 0;

  // Lay out answer choices in responsive columns so cards fit comfortably without excessive scrolling
  const optionCount = currentQuestion.options.length;
  let gridClasses = 'grid grid-cols-1 gap-1.5 sm:gap-2 md:gap-2.5 w-full';
  if (optionCount === 3) {
    gridClasses =
      'grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 [@media(orientation:landscape)_and_(max-height:540px)]:grid-cols-3 gap-1.5 sm:gap-2 md:gap-2.5 w-full';
  } else if (optionCount === 2 || optionCount === 4) {
    gridClasses =
      'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 [@media(orientation:landscape)_and_(max-height:540px)]:grid-cols-2 gap-1.5 sm:gap-2 md:gap-2.5 w-full';
  }

  const [q0SubScreen, setQ0SubScreen] = useState<0 | 1>(0);
  const [neighbourhoodQuery, setNeighbourhoodQuery] = useState<string>(() => currentNeighbourhoodName || '');
  const [postalInput, setPostalInput] = useState<string>(() => {
    if (currentAnswer && currentAnswer !== 'OPT_OUT' && /^[A-Z0-9\s-]+$/i.test(currentAnswer) && currentAnswer.length <= 8 && /\d/.test(currentAnswer)) {
      return currentAnswer;
    }
    return '';
  });
  const [showDropdown, setShowDropdown] = useState(false);

  // Reset to screen 0 when advancing questions
  useEffect(() => {
    if (currentStep > 0) {
      setQ0SubScreen(0);
    }
  }, [currentStep]);

  const selectedOption = useMemo(() => {
    if (!currentQuestion?.options || !currentAnswer) return null;
    return currentQuestion.options.find((opt) => opt.id === currentAnswer) || null;
  }, [currentQuestion, currentAnswer]);

  const filteredNeighbourhoods = useMemo(() => {
    return searchNeighbourhoods(neighbourhoodQuery, 8);
  }, [neighbourhoodQuery]);

  const layoutOptions: Array<{
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
      title: 'Mature Laned',
      era: '1950s–1960s Heritage',
      tag: 'Continuous curb • Rear gravel lane & garages • Zero front driveways',
      stalls: 16,
      desc: 'Strathcona, Westmount, Glenora, Highlands, Bonnie Doon'
    },
    {
      id: 'infill_skinny',
      icon: '🏘️',
      title: 'Infill & Duplex',
      era: 'Post-2015 Redeveloping',
      tag: 'Subdivided lots • Narrow skinny duplexes & garden suites • Active deliveries',
      stalls: 16,
      desc: 'Garneau, Oliver (Wîhkwêntôwin), Downtown, Queen Alex, McKernan'
    },
    {
      id: 'suburban_front_driveway',
      icon: '🚗',
      title: 'Suburban Front Driveway',
      era: '1980s–2000s Subdivisions',
      tag: 'Attached garages • Concrete driveways • Driveway curb cuts every 30 ft',
      stalls: 10,
      desc: 'Mill Woods, Callingwood, Riverbend, Castledowns, Blue Quill'
    },
    {
      id: 'contemporary_townhomes',
      icon: '🏢',
      title: 'Modern Townhomes',
      era: '2020s City Plan Developing',
      tag: 'Dense townhomes • Pocket parking bays • Stormwater bioswales',
      stalls: 12,
      desc: 'Griesbach, Blatchford, Windermere, Chappelle, Laurel, Secord'
    }
  ];

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
      onLayoutChange?.(detection.typology, detection.neighbourhood?.name || neighbourhoodQuery, sanitized);
    } else {
      setNeighbourhoodQuery(rawVal);
      setShowDropdown(true);
      const detection = detectLayoutAndNeighbourhood(rawVal);
      if (detection.neighbourhood?.postalFSA?.[0]) {
        setPostalInput(`${detection.neighbourhood.postalFSA[0]} `);
      }
      onSelectOption(currentQuestion.id, rawVal);
      onLayoutChange?.(detection.typology, detection.neighbourhood?.name || rawVal, postalInput);
    }
  };

  const handlePostalChange = (rawVal: string) => {
    const sanitized = rawVal.toUpperCase().replace(/[^A-Z0-9\s-]/g, '').slice(0, 8);
    setPostalInput(sanitized);
    const detection = detectLayoutAndNeighbourhood(sanitized);
    if (detection.neighbourhood && !neighbourhoodQuery) {
      setNeighbourhoodQuery(detection.neighbourhood.name);
    }
    onSelectOption(currentQuestion.id, sanitized);
    onLayoutChange?.(detection.typology, detection.neighbourhood?.name || neighbourhoodQuery, sanitized);
  };

  const handleSelectNeighbourhood = (n: EdmontonNeighbourhood) => {
    triggerFeedback('choice');
    setNeighbourhoodQuery(n.name);
    setShowDropdown(false);
    if (n.postalFSA?.[0] && !postalInput) {
      setPostalInput(`${n.postalFSA[0]} `);
    }
    onSelectOption(currentQuestion.id, n.name);
    onLayoutChange?.(n.typology, n.name, postalInput || n.postalFSA?.[0]);
  };

  const handleSelectLayout = (layoutId: StreetLayoutTypology) => {
    triggerFeedback('choice');
    onLayoutChange?.(layoutId, neighbourhoodQuery, postalInput);
    onSelectOption(currentQuestion.id, postalInput || neighbourhoodQuery || layoutId);
  };

  return (
    <div className="w-full max-w-4xl mx-auto h-full max-h-full flex flex-col min-h-0 px-2.5 sm:px-3.5 md:px-4 pt-2 sm:pt-3 pb-0 [@media(orientation:landscape)_and_(max-height:540px)]:p-1.5 overflow-hidden">
      {/* Progress & Category Header */}
      <div className="flex flex-col gap-1 flex-shrink-0 mb-1 sm:mb-1.5">
        <div className="flex items-center justify-between text-xs sm:text-sm font-semibold text-gray-500">
          <span className="flex items-center gap-1.5 truncate">
            <span className="font-bold text-[#004B8D]">
              {currentQuestion.id === 'q0' || currentQuestion.category === 'location'
                ? q0SubScreen === 0
                  ? t('q0_step1_progress_title', 'Step 1 of 2: Find Street')
                  : t('q0_step2_progress_title', 'Step 2 of 2: Confirm Layout')
                : t(`q${currentQuestion.number}_progress_title`, `Question ${currentQuestion.number} of 8`)}
            </span>
            <span className="text-gray-300">·</span>
            <span className="text-gray-500 font-medium truncate">
              {t(
                `q${currentQuestion.number}_category`,
                currentQuestion.category === 'location'
                  ? q0SubScreen === 0
                    ? 'Location'
                    : 'Street Style'
                  : currentQuestion.category === 'demographics'
                  ? 'Demographics'
                  : `${currentQuestion.category} Policy`
              )}
            </span>
          </span>
          <span className="text-[11px] text-gray-400 font-mono hidden xs:inline">
            {currentQuestion.id === 'q0' ? (q0SubScreen === 0 ? 'Step 1/2' : 'Step 2/2') : `${Math.round(((currentQuestion.number) / 8) * 100)}%`}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-[#004B8D]"
            initial={{ width: 0 }}
            animate={{
              width: currentQuestion.id === 'q0'
                ? q0SubScreen === 0 ? '50%' : '100%'
                : `${((currentQuestion.number) / 8) * 100}%`
            }}
            transition={{ duration: 0.35 }}
          />
        </div>
      </div>

      {/* Animated Question Card with adaptive layout & momentum scroll */}
      <div className="relative flex-1 flex flex-col justify-start min-h-0 overflow-y-auto overscroll-contain pt-0.5 pb-2.5 sm:pt-1 sm:pb-3 pr-0.5">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${currentQuestion.id}_${q0SubScreen}`}
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -15 }}
            transition={{ duration: 0.18 }}
            className="flex flex-col w-full"
          >
            <h3 className="text-[13pt] sm:text-[16pt] md:text-[18pt] font-bold text-[#193A5A] mb-1.5 sm:mb-2 leading-snug tracking-tight">
              {currentQuestion.id === 'q0'
                ? q0SubScreen === 0
                  ? t('q0_title_step1', 'Where do you live in Edmonton?')
                  : t('q0_title_step2', 'Confirm your street style')
                : t(`q${currentQuestion.number}_question`, currentQuestion.text)}
            </h3>

            {isTextQuestion ? (
              q0SubScreen === 0 ? (
                /* Screen 0A: Location / Postal Code / Neighbourhood Input (Optimized to fit 100% above the fold) */
                <div className="w-full flex flex-col gap-1.5 pt-0.5">
                  <label htmlFor="location-smart-input" className="block text-xs sm:text-sm font-semibold text-[#193A5A] leading-snug">
                    {t('q0_helper_short', 'Search your neighbourhood or enter a postal code to match your street:')}
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
                        placeholder={t('q0_placeholder', 'Postal code (e.g. T5J 2R7) or neighbourhood...')}
                        value={currentAnswer === 'OPT_OUT' ? '' : (postalInput || neighbourhoodQuery)}
                        onChange={(e) => handleLocationInputChange(e.target.value)}
                        onFocus={() => setShowDropdown(true)}
                        onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            triggerFeedback('button');
                            setQ0SubScreen(1);
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

                    {/* Autocomplete Dropdown */}
                    {showDropdown && filteredNeighbourhoods.length > 0 && currentAnswer !== 'OPT_OUT' && (
                      <div className="absolute top-[38px] left-0 right-0 z-30 bg-white border border-[#004B8D]/40 rounded-lg shadow-xl overflow-hidden max-h-40 overflow-y-auto">
                        {filteredNeighbourhoods.map((n) => (
                          <button
                            key={n.name}
                            type="button"
                            onMouseDown={() => handleSelectNeighbourhood(n)}
                            className="w-full text-left px-3 py-1.5 hover:bg-[#004B8D]/10 flex items-center justify-between text-xs border-b border-gray-100 last:border-b-0 cursor-pointer"
                          >
                            <span className="font-bold text-gray-800">{n.name}</span>
                            <span className="text-[10px] text-[#004B8D] font-semibold bg-[#004B8D]/10 px-1.5 py-0.5 rounded">
                              {getStreetLayoutInfo(n.typology).shortTitle}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Popular Community Quick Chips */}
                  {currentAnswer !== 'OPT_OUT' && (
                    <div className="flex flex-wrap items-center gap-1">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mr-0.5">{t('survey_quick_match', 'Quick Match:')}</span>
                      {POPULAR_EDMONTON_NEIGHBOURHOODS.slice(0, 4).map((popName) => {
                        const isSelected = neighbourhoodQuery.toLowerCase() === popName.toLowerCase();
                        return (
                          <button
                            key={popName}
                            type="button"
                            onClick={() => {
                              const n = findNeighbourhood(popName);
                              if (n) handleSelectNeighbourhood(n);
                            }}
                            className={`text-[11px] px-2 py-0.5 rounded-md border transition-all cursor-pointer font-medium ${
                              isSelected
                                ? 'bg-[#004B8D] text-white border-[#004B8D] font-bold shadow-2xs'
                                : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-200'
                            }`}
                          >
                            {popName}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Compact Live Matched Street Layout Callout */}
                  {(() => {
                    const activeLayout = getStreetLayoutInfo(currentStreetLayout);
                    const matchedName = neighbourhoodQuery || currentNeighbourhoodName;
                    return (
                      <div className="flex items-center justify-between p-2 rounded-lg border border-[#004B8D]/25 bg-[#004B8D]/5 text-xs shadow-2xs">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-xl leading-none shrink-0" role="img" aria-label={activeLayout.title}>
                            {activeLayout.icon}
                          </span>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-bold text-[#004B8D] text-xs">
                                {activeLayout.title}
                              </span>
                              {matchedName && currentAnswer !== 'OPT_OUT' && (
                                <span className="text-[10px] font-semibold text-gray-600 truncate">
                                  • {matchedName}
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-gray-500 block truncate">
                              {t('survey_on_street_stalls', '{count} on-street stalls').replace('{count}', String(activeLayout.curbsideCapacity))} · {activeLayout.drivewayType}
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            triggerFeedback('button');
                            setQ0SubScreen(1);
                          }}
                          className="text-[11px] font-bold text-[#004B8D] hover:underline shrink-0 px-1 py-0.5 cursor-pointer ml-1"
                        >
                          {t('survey_change_layout_btn', 'Change ▾')}
                        </button>
                      </div>
                    );
                  })()}

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
                            onLayoutChange?.('mature_laned', undefined, 'OPT_OUT');
                          } else {
                            onSelectOption(currentQuestion.id, '');
                          }
                        }}
                        className="w-3.5 h-3.5 text-[#004B8D] rounded border-gray-300 focus:ring-[#004B8D]"
                      />
                      <span className="text-gray-600 select-none">
                        {t('survey_prefer_not_to_share', 'Prefer not to share location')}
                      </span>
                    </label>
                    <span className="flex items-center gap-1 text-gray-400 hidden xs:inline-flex">
                      <Shield className="w-3 h-3 text-[#004B8D]/70 shrink-0" />
                      {t('survey_postal_codes_anonymized', 'Postal codes anonymized')}
                    </span>
                  </div>
                </div>
              ) : (
                /* Screen 0B: Choose / Confirm 1 of 4 Edmonton Street Layouts */
                <div className="w-full flex flex-col gap-1.5 pt-0.5">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-600 font-medium truncate">
                      {neighbourhoodQuery ? (
                        <>{t('survey_detected_for', 'Detected for {area}: Tap to change').replace('{area}', neighbourhoodQuery)}</>
                      ) : (
                        t('survey_select_street_style', 'Select your neighbourhood street style:')
                      )}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        triggerFeedback('button');
                        setQ0SubScreen(0);
                      }}
                      className="text-xs text-[#004B8D] font-bold hover:underline shrink-0 cursor-pointer ml-2"
                    >
                      {t('survey_back_button', '← Back')}
                    </button>
                  </div>

                  {/* 4 Cards Grid - Compact 2x2 to fit 100% above the fold */}
                  <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                    {layoutOptions.map((layout) => {
                      const isSelected = currentStreetLayout === layout.id;
                      return (
                        <button
                          key={layout.id}
                          type="button"
                          onClick={() => handleSelectLayout(layout.id)}
                          className={`text-left p-2 sm:p-2.5 rounded-lg border-2 transition-all cursor-pointer flex flex-col justify-between gap-1 relative ${
                            isSelected
                              ? 'border-[#004B8D] bg-[#004B8D]/6 shadow-2xs ring-1 ring-[#004B8D]'
                              : 'border-gray-200 bg-white hover:border-[#004B8D]/40 hover:bg-gray-50/80'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-1">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span className="text-lg leading-none shrink-0" role="img" aria-label={layout.title}>{layout.icon}</span>
                              <div className="min-w-0">
                                <h4 className="font-bold text-xs sm:text-sm text-black leading-tight truncate">
                                  {layout.title}
                                </h4>
                                <span className="text-[10px] text-gray-500 font-semibold block leading-tight truncate">
                                  {t('survey_stalls_unit', '{count} Stalls').replace('{count}', String(layout.stalls))}
                                </span>
                              </div>
                            </div>
                            {isSelected && (
                              <span className="text-[#004B8D] font-bold text-xs flex items-center shrink-0">
                                <Check className="w-3.5 h-3.5" />
                              </span>
                            )}
                          </div>

                          <p className="text-[10px] sm:text-[11px] text-gray-600 leading-tight line-clamp-1">
                            {layout.tag.split('•')[0].trim()}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )
            ) : (
              /* Options List with WAI-ARIA arrow key navigation */
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
                      className={`w-full text-left p-3.5 sm:p-4 rounded-xl border-2 transition-all flex items-start gap-3 sm:gap-3.5 cursor-pointer relative min-h-[52px] sm:min-h-[56px] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#004B8D] focus-visible:ring-offset-2 ${
                        isSelected
                          ? 'border-[#004B8D] bg-[#004B8D]/8 shadow-xs ring-1 ring-[#004B8D]'
                          : 'border-gray-200 bg-white hover:border-[#004B8D]/40 hover:bg-gray-50/80'
                      }`}
                    >
                      <div className="pt-1 flex-shrink-0">
                        <div
                          className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                            isSelected
                              ? 'border-[#004B8D] bg-[#004B8D]'
                              : 'border-gray-400 bg-white'
                          }`}
                        >
                          {isSelected && <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-white" />}
                        </div>
                      </div>

                      <div className="flex flex-col flex-grow min-w-0">
                        <span className="text-[14pt] sm:text-[15pt] font-semibold leading-snug tracking-tight text-black">
                          {t(`q${currentQuestion.number}_option_${option.id.slice(-1)}`, option.label)}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* The Real-World Trade-Off For Your Choice (displayed below question answers once an answer is selected) */}
            {!isTextQuestion && currentQuestion.id !== 'q0' && (currentAnswer || tradeoffOutcome?.hasAnswer) && (
              <div
                id="tradeoff-education-card"
                role="region"
                aria-live="polite"
                className="mt-2.5 bg-white border-2 border-[#004B8D]/30 rounded-xl p-2.5 sm:p-3 shadow-xs transition-all animate-in fade-in slide-in-from-bottom-2 duration-200"
              >
                <div className="flex items-center gap-1.5 mb-1.5 pb-1 border-b border-gray-100">
                  <span className="text-[10pt] font-extrabold uppercase tracking-wider text-[#004B8D] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#FFC72C] fill-[#FFC72C]" />
                    {t('tradeoff_card_header', 'The Real-World Trade-Off For Your Choice')}
                  </span>
                </div>

                <div className="flex flex-col gap-1.5">
                  {/* The Gain / Benefit Pill */}
                  <div className="flex items-start gap-2 bg-emerald-50 border border-emerald-300 rounded-lg px-2.5 py-1.5 text-emerald-950 shadow-2xs">
                    <span className="self-start shrink-0 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[8.5pt] sm:text-[9pt] font-black uppercase tracking-wider bg-emerald-700 text-white shadow-2xs mt-0.5">
                      <Check className="w-3 h-3 stroke-[3]" />
                      {t('tradeoff_gain_pill', 'The Gain')}
                    </span>
                    <p className="text-[11.5pt] sm:text-[12pt] font-normal leading-snug text-emerald-950">
                      {tradeoffOutcome?.benefitText || tradeoffOutcome?.curbsideImpactSummary}
                    </p>
                  </div>

                  {/* The Trade-off / Cost Pill */}
                  <div className="flex items-start gap-2 bg-amber-50 border border-amber-300 rounded-lg px-2.5 py-1.5 text-amber-950 shadow-2xs">
                    <span className="self-start shrink-0 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[8.5pt] sm:text-[9pt] font-black uppercase tracking-wider bg-amber-700 text-white shadow-2xs mt-0.5">
                      <span className="text-[10px] leading-none">⚡</span>
                      {t('tradeoff_cost_pill', 'The Cost')}
                    </span>
                    <p className="text-[11.5pt] sm:text-[12pt] font-normal leading-snug text-amber-950">
                      {tradeoffOutcome?.costText || tradeoffOutcome?.tradeoffRationale}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Buttons & Validation Alert (always pinned at bottom of question container) */}
      <div
        id="survey-navigation-container"
        role="navigation"
        aria-label="Question Navigation"
        className="sticky bottom-0 z-30 bg-white pt-2 sm:pt-2.5 pb-[max(0.75rem,env(safe-area-inset-bottom))] px-0.5 sm:px-1 border-t border-gray-200 flex flex-col gap-1.5 flex-shrink-0 shadow-[0_-3px_10px_rgba(0,0,0,0.04)]"
      >
        {showValidationError && (
          <div 
            role="alert" 
            aria-live="assertive"
            className="text-xs sm:text-sm text-[#E8552D] bg-[#E8552D]/10 border border-[#E8552D]/30 px-3 py-1.5 rounded-md font-semibold flex items-center gap-2 animate-pulse"
          >
            <span className="w-2 h-2 rounded-full bg-[#E8552D] flex-shrink-0" aria-hidden="true" />
            {validationErrorMsg || (isTextQuestion ? t('nav_alert_postal_format', 'Please enter a 6 or 7 character alphanumeric postal code.') : t('nav_alert_select_option', 'Please select an option to advance.'))}
          </div>
        )}

        <div className="flex items-center justify-between gap-2 sm:gap-3">
          {/* Go Back button */}
          {currentQuestion.id === 'q0' ? (
            q0SubScreen === 1 ? (
              <button
                type="button"
                id="survey-prev-btn"
                onClick={() => {
                  triggerFeedback('button');
                  setQ0SubScreen(0);
                }}
                className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-1.5 border-2 border-gray-300 bg-white text-gray-800 hover:bg-gray-100 transition-all min-h-[44px] sm:min-h-[48px] min-w-[48px] cursor-pointer shadow-2xs active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#004B8D]"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>{t('nav_btn_go_back', 'Go Back')}</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  id="survey-prev-btn"
                  disabled={true}
                  aria-disabled="true"
                  className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-1.5 border-2 border-gray-200 bg-gray-50 text-gray-400 opacity-40 cursor-not-allowed min-h-[44px] sm:min-h-[48px] min-w-[48px]"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>{t('nav_btn_go_back', 'Go Back')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    triggerFeedback('button');
                    onNavigate(1);
                  }}
                  className="text-xs font-semibold text-gray-500 hover:text-[#004B8D] px-2 py-1.5 min-h-[44px] flex items-center cursor-pointer underline underline-offset-2"
                >
                  {t('skip_to_q1_link', 'Skip Location')}
                </button>
              </div>
            )
          ) : (
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
                  ? 'opacity-40 cursor-not-allowed border-gray-200 text-gray-400'
                  : 'border-gray-300 bg-white text-gray-800 hover:bg-gray-100 cursor-pointer shadow-2xs'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              <span>{t('nav_btn_go_back', 'Go Back')}</span>
            </button>
          )}

          {/* Next button */}
          {currentQuestion.id === 'q0' ? (
            <button
              type="button"
              id="survey-next-btn"
              onClick={() => {
                triggerFeedback('button');
                if (q0SubScreen === 0) {
                  setQ0SubScreen(1);
                } else {
                  onNavigate(1);
                }
              }}
              className="px-5 py-2 sm:px-6 sm:py-2.5 rounded-xl font-black text-xs sm:text-sm bg-[#004B8D] hover:bg-[#003566] active:scale-95 text-white flex items-center gap-1.5 shadow-xs transition-all cursor-pointer min-h-[44px] sm:min-h-[48px] min-w-[48px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#004B8D]"
            >
              <span>{t('nav_btn_next', 'Next')}</span>
              <ChevronRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          ) : isLastQuestion ? (
            <button
              type="button"
              id="survey-next-btn"
              onClick={() => {
                if (!currentAnswer) {
                  onNavigate(1); // Trigger validation error
                  return;
                }
                triggerFeedback('submit');
                onNavigate(1);
              }}
              className="px-5 py-2 sm:px-6 sm:py-2.5 rounded-xl font-black text-xs sm:text-sm bg-[#004B8D] hover:bg-[#003566] active:scale-95 text-white flex items-center gap-2 shadow-xs transition-all cursor-pointer min-h-[44px] sm:min-h-[48px] min-w-[48px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#004B8D]"
            >
              <CheckCircle2 className="w-4 h-4 text-[#FFC72C] stroke-[2.5]" />
              <span>{t('nav_btn_calc_persona', 'See Results')}</span>
            </button>
          ) : (
            <button
              type="button"
              id="survey-next-btn"
              onClick={() => {
                if (!currentAnswer) {
                  onNavigate(1); // Trigger validation error
                  return;
                }
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
