import { useState, useMemo, useEffect, useCallback } from 'react';
import { NeighborhoodSimulation } from './components/NeighborhoodSimulation';
import { SimplifiedStreetSummary } from './components/SimplifiedStreetSummary';
import { CivicOnboardingModal } from './components/CivicOnboardingModal';
import { PersonaMergerViewer } from './components/PersonaMergerViewer';
import { SurveyStage } from './components/SurveyStage';
import { ResultsView } from './components/ResultsView';
import { ManualSlidersDrawer } from './components/ManualSlidersDrawer';
import { MagnifiedGaugeDrawer } from './components/MagnifiedGaugeDrawer';
import { DeviceBrowserCheck } from './components/DeviceBrowserCheck';
import { safeStorage, checkBrowserCompatibility } from './utils/browserCheck';

import { useAppText } from './context/TextContentContext';

import {
  SURVEY_QUESTIONS,
  calculatePersona,
  validatePostalCode,
  calculateSimulationMetricsFromAnswers,
  getQuestionTradeoffImpact
} from './data/surveyData';
import { SimulationConfig, StreetLayoutTypology } from './types';
import { getStreetLayoutInfo, detectLayoutAndNeighbourhood } from './data/edmontonNeighbourhoods';
import {
  RotateCcw,
  HelpCircle,
  ZapOff,
  Eye,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { feedback, triggerFeedback } from './utils/feedback';
import { ambientAudio } from './utils/ambientAudio';

export default function App() {
  const { t } = useAppText();

  const [showPersonaMerger, setShowPersonaMerger] = useState<boolean>(false);
  const [showManualSliders, setShowManualSliders] = useState<boolean>(false);
  const [showMagnifiedGauge, setShowMagnifiedGauge] = useState<boolean>(false);
  const [isDeviceCheckBlocking, setIsDeviceCheckBlocking] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    try {
      if (sessionStorage.getItem('curbside_compass_landscape_dismissed') === 'true') return false;
    } catch {
      // ignore
    }
    const compat = checkBrowserCompatibility();
    return compat.isMobileLandscape;
  });
  const [showOnboarding, setShowOnboarding] = useState<boolean>(() => {
    return safeStorage.getItem('curbside_compass_onboarding_completed') !== 'true';
  });
  const [isSimplifiedMode, setIsSimplifiedMode] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const compat = checkBrowserCompatibility();
    if (!compat.hasCanvas) return true;
    return safeStorage.getItem('curbside_compass_simplified_mode') === 'true';
  });
  const [isSimExpanded, setIsSimExpanded] = useState<boolean>(false);

  const handleToggleSimplifiedMode = useCallback((simplified?: boolean) => {
    setIsSimplifiedMode((prev) => {
      const nextVal = simplified !== undefined ? simplified : !prev;
      safeStorage.setItem('curbside_compass_simplified_mode', String(nextVal));
      return nextVal;
    });
  }, []);
  const [currentStep, setCurrentStep] = useState<number>(() => {
    const saved = safeStorage.getItem('curbsideCompass_step');
    return saved ? parseInt(saved, 10) : 0;
  });

  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>(() => {
    try {
      const saved = safeStorage.getItem('curbsideCompass_answers');
      if (!saved) return {};
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        const safeAnswers: Record<string, string> = {};
        for (const [k, v] of Object.entries(parsed)) {
          if (k !== '__proto__' && k !== 'constructor' && k !== 'prototype' && typeof v === 'string') {
            safeAnswers[k] = v;
          }
        }
        return safeAnswers;
      }
      return {};
    } catch {
      return {};
    }
  });

  // Store temporary overrides if the user adjusts manual sliders or selects a street layout
  const [manualOverride, setManualOverride] = useState<Partial<SimulationConfig> | null>(null);

  // Calculate neighbourhood parking metrics live as answers are given or sliders move
  const computedMetrics = useMemo(() => {
    return calculateSimulationMetricsFromAnswers(selectedAnswers, manualOverride || undefined);
  }, [selectedAnswers, manualOverride]);

  const simConfig = useMemo(() => {
    return computedMetrics.simConfig;
  }, [computedMetrics.simConfig]);

  const simulationMetrics = useMemo(() => ({
    activeHouseholdCars: computedMetrics.activeHouseholdCars,
    activeVisitorCars: computedMetrics.activeVisitorCars,
    totalDwellings: computedMetrics.totalDwellings,
    totalWeeklyDeliveries: computedMetrics.totalWeeklyDeliveries,
    circlingCarCount: computedMetrics.circlingCarCount,
    curbsideDemandCount: computedMetrics.curbsideDemandCount,
    curbsideStallsCapacity: computedMetrics.curbsideStallsCapacity,
    curbsidePct: computedMetrics.curbsidePct,
    occupiedGaragesCount: computedMetrics.occupiedGaragesCount,
    onReshuffle: () => {}
  }), [computedMetrics]);

  const currentTradeoffOutcome = useMemo(() => {
    return getQuestionTradeoffImpact(currentStep, selectedAnswers);
  }, [currentStep, selectedAnswers]);

  const [isCompleted, setIsCompleted] = useState<boolean>(() => {
    const saved = safeStorage.getItem('curbsideCompass_completed');
    return saved === 'true';
  });

  const [showValidationError, setShowValidationError] = useState<boolean>(false);
  const [validationErrorMsg, setValidationErrorMsg] = useState<string | null>(null);

  // Automatically save the user's progress to safe storage
  useEffect(() => {
    safeStorage.setItem('curbsideCompass_step', currentStep.toString());
    safeStorage.setItem('curbsideCompass_answers', JSON.stringify(selectedAnswers));
    safeStorage.setItem('curbsideCompass_simConfig', JSON.stringify(simConfig));
    safeStorage.setItem('curbsideCompass_completed', isCompleted.toString());
  }, [currentStep, selectedAnswers, simConfig, isCompleted]);

  // Expand the street simulation view when the user finishes all questions
  useEffect(() => {
    if (currentStep >= SURVEY_QUESTIONS.length && !isCompleted) {
      setIsSimExpanded(true);
    }
  }, [currentStep, isCompleted]);

  const [policyNote, setPolicyNote] = useState<string>(
    '1950s–1960s Mid-Century Laned Bungalow Street active (12 bungalows, gravel rear alley with detached garages, zero front curb cuts, continuous curbside parking).'
  );
  const [soundEnabled, setSoundEnabled] = useState<boolean>(feedback.isSoundEnabled());
  const [hasManuallyChangedFont, setHasManuallyChangedFont] = useState(false);
  const [fontSizePt, setFontSizePt] = useState<number>(12); // Normal text size is 12 points

  // Apply the chosen font size across the whole webpage
  useEffect(() => {
    // Convert typographic points to screen pixels (1pt = 96/72 pixels)
    document.documentElement.style.fontSize = `${fontSizePt * (96 / 72)}px`;
  }, [fontSizePt]);

  // Connect user feedback audio and background sound effects
  useEffect(() => {
    const unsubscribeFeedback = feedback.subscribe((enabled) => setSoundEnabled(enabled));
    
    // Start ambient background sounds if sound is turned on and survey is active
    if (feedback.isSoundEnabled() && !isCompleted) {
      ambientAudio.play();
    }

    return () => {
      unsubscribeFeedback();
    };
  }, []);

  // Pause ambient audio when the user finishes the survey, or resume if unmuted
  useEffect(() => {
    if (isCompleted) {
      ambientAudio.pause();
    } else if (soundEnabled) {
      ambientAudio.play();
    }
  }, [isCompleted, soundEnabled]);

  // Add up the user's score along the Fiscal axis (X) and Regulatory axis (Y)
  const { totalX, totalY } = useMemo(() => {
    let x = 0;
    let y = 0;

    SURVEY_QUESTIONS.forEach((q) => {
      const selectedOptionId = selectedAnswers[q.id];
      if (selectedOptionId) {
        const option = q.options.find((opt) => opt.id === selectedOptionId);
        if (option) {
          x += option.x;
          y += option.y;
        }
      }
    });

    return { totalX: x, totalY: y };
  }, [selectedAnswers]);

  // Determine which curbside persona best matches the user's answers
  const currentPersona = useMemo(() => {
    return calculatePersona(totalX, totalY);
  }, [totalX, totalY]);

  // Update the simulation when the user chooses a different street type or neighbourhood
  const handleLayoutChange = useCallback((layout: StreetLayoutTypology, neighbourhoodName?: string, postalCode?: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      q0: layout,
      q0_layout: layout
    }));
    setManualOverride((prev) => ({
      ...(prev || {}),
      streetLayout: layout,
      neighbourhoodName: neighbourhoodName || prev?.neighbourhoodName,
      postalCode: postalCode || prev?.postalCode
    }));
    const layoutInfo = getStreetLayoutInfo(layout);
    setPolicyNote(`Selected model street: ${layoutInfo.title} (${layoutInfo.shortTitle}) with ${layoutInfo.curbsideCapacity} legal curbside stalls.`);
  }, []);

  // Handle when a user clicks on an answer option
  const handleSelectOption = useCallback((questionId: string, optionId: string) => {
    setShowValidationError(false);
    setValidationErrorMsg(null);
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: optionId }));

    const question = SURVEY_QUESTIONS.find((q) => q.id === questionId);

    // Step 0: Model street choice
    if (questionId === 'q0') {
      const layout = (optionId as StreetLayoutTypology) || 'mature_laned';
      const layoutInfo = getStreetLayoutInfo(layout);
      setSelectedAnswers((prev) => ({ ...prev, q0: layout, q0_layout: layout }));
      setManualOverride((prev) => ({
        ...(prev || {}),
        streetLayout: layout
      }));
      setPolicyNote(`Selected model street: ${layoutInfo.title} (${layoutInfo.shortTitle}) with ${layoutInfo.curbsideCapacity} legal curbside stalls.`);
      return;
    }

    // Step 7: Location question (Postal code / neighbourhood)
    if (questionId === 'q7' || question?.type === 'text') {
      const trimmed = optionId.trim();
      if (trimmed && trimmed !== 'OPT_OUT') {
        const detection = detectLayoutAndNeighbourhood(trimmed);
        const neighbourhoodName = detection.neighbourhood?.name;
        // Keep active street layout chosen in Step 0, only record location demographics
        setManualOverride((prev) => ({
          ...(prev || {}),
          neighbourhoodName: neighbourhoodName || prev?.neighbourhoodName || trimmed,
          postalCode: trimmed
        }));
        setPolicyNote(neighbourhoodName ? `Location recorded: ${neighbourhoodName}` : `Location recorded: ${trimmed}`);
      } else if (trimmed === 'OPT_OUT') {
        setPolicyNote('Location opt-out chosen. Participation recorded anonymously.');
      }
      return;
    }

    const option = question?.options.find((opt) => opt.id === optionId);
    if (option) {
      // Clear manual slider adjustments so the user's policy choice directly sets the simulation
      setManualOverride((prev) => {
        if (!prev) return null;
        const { streetLayout, neighbourhoodName, postalCode } = prev;
        return (streetLayout || neighbourhoodName || postalCode) ? { streetLayout, neighbourhoodName, postalCode } : null;
      });

      // Show a helpful explanation of what this choice does
      if (option.hint) {
        setPolicyNote(option.hint);
      } else {
        setPolicyNote('Simulation updated based on your policy choice.');
      }
    }
  }, []);

  // Move forward to the next question or backward to the previous question
  const handleNavigate = useCallback((direction: number) => {
    if (direction === 1) {
      const currentQuestion = SURVEY_QUESTIONS[currentStep];
      const answer = selectedAnswers[currentQuestion.id];

      // Step 0: Model street selection
      if (currentQuestion.id === 'q0') {
        const layoutChoice = answer || selectedAnswers['q0_layout'] || 'mature_laned';
        if (!selectedAnswers['q0']) {
          setSelectedAnswers(prev => ({ ...prev, q0: layoutChoice, q0_layout: layoutChoice }));
        }
      }
      // Step 7: Location question (Postal code / neighbourhood / opt-out)
      else if (currentQuestion.type === 'text' || currentQuestion.id === 'q7') {
        if (!answer) {
          setValidationErrorMsg('Please enter your postal code or select the opt-out checkbox.');
          setShowValidationError(true);
          return;
        }
        const valResult = validatePostalCode(answer);
        if (!valResult.isValid) {
          setValidationErrorMsg(valResult.message || 'Please enter your postal code or select the opt-out checkbox.');
          setShowValidationError(true);
          return;
        }
      }
      // Step 1..6: Policy questions
      else if (!answer) {
        setValidationErrorMsg('Please select an option to advance.');
        setShowValidationError(true);
        return;
      }

      setShowValidationError(false);
      setValidationErrorMsg(null);

      if (currentStep >= SURVEY_QUESTIONS.length - 1) {
        setIsCompleted(true);
      } else {
        setCurrentStep((prev) => prev + 1);
      }
    } else {
      setShowValidationError(false);
      setValidationErrorMsg(null);
      if (currentStep > 0) {
        setCurrentStep((prev) => prev - 1);
      }
    }
  }, [currentStep, selectedAnswers]);

  // Reset the survey back to the start and restore initial settings
  const handleRetake = useCallback(() => {
    triggerFeedback('button');
    setSelectedAnswers({});
    setManualOverride(null);
    setCurrentStep(0);
    setIsCompleted(false);
    setIsSimExpanded(false);
    setShowValidationError(false);
    setValidationErrorMsg(null);
    setShowManualSliders(false);
    setShowMagnifiedGauge(false);
    setPolicyNote('Simulation reset to baseline configuration.');
  }, []);

  const handleConfigChange = useCallback((updated: Partial<SimulationConfig>) => {
    setManualOverride((prev) => ({ ...(prev || {}), ...updated }));
  }, []);




  return (
    <div className="flex flex-col h-[100dvh] max-h-[100dvh] w-screen bg-[#f4f6f8] text-gray-800 overflow-hidden font-sans">
      {/* Top Header Navigation Bar */}
      <header className="h-10 sm:h-11 [@media(orientation:landscape)_and_(max-height:540px)]:h-9 bg-[#004B8D] text-white flex items-center justify-between px-2 sm:px-4 z-30 shadow-xs flex-shrink-0 border-b border-[#003566]">
        <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0">
          <img
            id="header-safemobility-compass-logo"
            src="/SafeMobility_Compass.png"
            alt={t('header_logo_alt', 'SafeMobility Compass')}
            className="w-6 h-6 sm:w-7 sm:h-7 object-contain flex-shrink-0 drop-shadow-xs"
            referrerPolicy="no-referrer"
          />
          <div className="min-w-0">
            <h1 className="text-xs sm:text-sm font-black tracking-wide flex items-center gap-1 leading-none truncate">
              <span className="text-[#FFC72C]">{t('header_title_curbside', 'Curbside Compass')}</span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">

          <div className="hidden md:flex items-center bg-[#003566] rounded-md border border-[#002244] overflow-hidden flex-shrink-0">
            <button
              onClick={() => { setHasManuallyChangedFont(true); setFontSizePt(f => Math.max(8, f - 2)); }}
              className="w-7 h-7 sm:w-9 sm:h-9 flex items-center justify-center text-gray-300 hover:bg-[#002244] hover:text-white active:bg-black/30 transition-all font-bold text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFC72C] focus-visible:ring-inset cursor-pointer"
              title={t('header_font_decrease_title', 'Decrease font size (-2pt)')}
              aria-label={t('header_font_decrease_aria', 'Decrease font size')}
            >
              A-
            </button>
            <div className="w-[1px] h-4 sm:h-5 bg-[#002244]" />
            <button
              onClick={() => { setHasManuallyChangedFont(true); setFontSizePt(f => Math.min(24, f + 2)); }}
              className="w-7 h-7 sm:w-9 sm:h-9 flex items-center justify-center text-gray-300 hover:bg-[#002244] hover:text-white active:bg-black/30 transition-all font-bold text-xs sm:text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFC72C] focus-visible:ring-inset cursor-pointer"
              title={t('header_font_increase_title', 'Increase font size (+2pt)')}
              aria-label={t('header_font_increase_aria', 'Increase font size')}
            >
              A+
            </button>
          </div>

          {/* How It Works Civic Onboarding Button */}
          <button
            type="button"
            onClick={() => {
              triggerFeedback('button');
              setShowOnboarding(true);
            }}
            title={t('header_how_it_works_title', 'About the Street Model & Consultation Guide')}
            aria-label={t('header_how_it_works_aria', 'How This Works')}
            className="text-[0.6875rem] sm:text-xs flex items-center justify-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 rounded transition-all min-h-[44px] min-w-[44px] cursor-pointer bg-white/10 hover:bg-white/20 text-gray-200 hover:text-white border border-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFC72C]"
          >
            <HelpCircle className="w-4 h-4 text-[#FFC72C]" />
            <span className="hidden sm:inline font-bold">
              {t('header_how_it_works', 'Help')}
            </span>
          </button>

          {/* View Mode Toggle Button: Accessible on mobile, tablet & desktop */}
          <button
            type="button"
            onClick={() => {
              triggerFeedback('button');
              handleToggleSimplifiedMode();
            }}
            title={isSimplifiedMode ? t('header_switch_to_live', 'Switch to Live Model') : t('header_switch_to_simplified', 'Switch to Simplified Mode')}
            aria-label={isSimplifiedMode ? 'Switch to Live Model' : 'Switch to Simplified Mode'}
            className={`text-[0.6875rem] sm:text-xs flex items-center justify-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 rounded transition-all min-h-[44px] min-w-[44px] cursor-pointer border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFC72C] ${
              isSimplifiedMode
                ? 'bg-white/10 hover:bg-white/20 text-gray-200 border-white/20'
                : 'bg-amber-500/15 hover:bg-amber-500/25 text-amber-200 border-amber-400/40'
            }`}
          >
            {isSimplifiedMode ? (
              <>
                <Eye className="w-4 h-4 text-[#FFC72C]" />
                <span className="hidden sm:inline font-bold">{t('header_mode_live', 'Animated View')}</span>
              </>
            ) : (
              <>
                <ZapOff className="w-4 h-4 text-amber-300" />
                <span className="hidden sm:inline font-bold">{t('header_mode_simplified', 'Static View')}</span>
              </>
            )}
          </button>



          {isCompleted ? (
            <button
              type="button"
              onClick={handleRetake}
              title={t('header_retake_title', 'Retake Assessment')}
              className="text-[0.6875rem] sm:text-xs font-bold flex items-center justify-center gap-1.5 bg-[#FFC72C] text-[#004B8D] hover:bg-[#ffe066] active:bg-[#f5bc20] active:scale-95 px-2.5 sm:px-3 py-1 rounded shadow-xs transition-all cursor-pointer min-h-[44px] min-w-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFC72C] focus-visible:ring-offset-1 focus-visible:ring-offset-[#193A5A]"
            >
              <RotateCcw className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden sm:inline">{t('header_retake_btn', 'Retake')}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleRetake}
              title={t('header_reset_title', 'Reset Survey and Simulation')}
              className="text-[0.6875rem] sm:text-xs flex items-center justify-center gap-1 bg-white/15 hover:bg-white/25 active:bg-white/30 active:scale-95 text-white px-2.5 sm:px-3 py-1 rounded transition-colors min-h-[44px] min-w-[44px] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFC72C] focus-visible:ring-offset-1 focus-visible:ring-offset-[#193A5A]"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden sm:inline font-semibold">{t('header_reset_btn', 'Reset')}</span>
            </button>
          )}
        </div>
      </header>

      {/* Primary Split Viewport: Stacked on mobile portrait, side-by-side on desktop, tablet horizontal, and mobile landscape */}
      <main className="relative flex flex-col lg:flex-row [@media(orientation:landscape)_and_(max-height:540px)]:flex-row flex-1 min-h-0 w-full overflow-hidden">
        {/* Magnified Parking Gauge Overlay */}
        <MagnifiedGaugeDrawer
          isOpen={showMagnifiedGauge}
          onClose={() => setShowMagnifiedGauge(false)}
          curbsidePct={simulationMetrics.curbsidePct}
          curbsideDemandCount={simulationMetrics.curbsideDemandCount}
          curbsideStallsCapacity={simulationMetrics.curbsideStallsCapacity}
          circlingCarCount={simulationMetrics.circlingCarCount}
          activeHouseholdCars={simulationMetrics.activeHouseholdCars}
          activeVisitorCars={simulationMetrics.activeVisitorCars}
          totalDwellings={simulationMetrics.totalDwellings}
          onOpenManualSliders={() => {
            setShowMagnifiedGauge(false);
            setIsSimExpanded(false);
            setShowManualSliders(true);
          }}
        />

        {/* Simulation Section: Calibrated vertical mobile-first height with interactive tap-to-expand */}
        <section
          id="simulation-section"
          onClick={() => {
            if (!isSimExpanded && !isCompleted && !showManualSliders) {
              setIsSimExpanded(true);
            }
          }}
          className={`relative bg-[#193A5A] flex-shrink-0 shadow-inner overflow-hidden border-[#004B8D] border-b-2 lg:border-b-0 lg:border-r-2 transition-all duration-300 ease-in-out ${
            showManualSliders ? '' : 'cursor-pointer'
          } ${
            isCompleted
              ? "hidden lg:block lg:w-1/2"
              : isSimExpanded && !showManualSliders
              ? "w-full h-[67vh] max-h-none sm:h-[67vh] sm:max-h-none md:h-[67vh] md:max-h-none lg:w-[65%] xl:w-[65%]"
              : showManualSliders
              ? "w-full h-[18vh] min-h-[105px] max-h-[135px] sm:h-[22vh] sm:max-h-[170px] md:h-[26vh] md:max-h-[220px] lg:w-[48%] xl:w-[50%] 2xl:w-[52%]"
              : "w-full h-[22vh] min-h-[120px] max-h-[170px] sm:h-[30vh] sm:max-h-[240px] md:h-[38vh] md:max-h-[360px] lg:w-[48%] xl:w-[50%] 2xl:w-[52%]"
          } lg:h-full lg:max-h-none [@media(orientation:landscape)_and_(max-height:540px)]:h-full [@media(orientation:landscape)_and_(max-height:540px)]:w-1/2 [@media(orientation:landscape)_and_(max-height:540px)]:border-b-0 [@media(orientation:landscape)_and_(max-height:540px)]:border-r-2 ${showMagnifiedGauge ? 'filter blur-[1.5px] pointer-events-none' : ''}`}
          aria-label={t('header_sim_view_aria', 'Neighborhood Parking Simulation View')}
        >
          {isSimplifiedMode ? (
            <SimplifiedStreetSummary
              config={simConfig}
              curbsidePct={simulationMetrics.curbsidePct}
              curbsideDemandCount={simulationMetrics.curbsideDemandCount}
              curbsideStallsCapacity={simulationMetrics.curbsideStallsCapacity}
              circlingCarCount={simulationMetrics.circlingCarCount}
              activeHouseholdCars={simulationMetrics.activeHouseholdCars}
              activeVisitorCars={simulationMetrics.activeVisitorCars}
              totalDwellings={simulationMetrics.totalDwellings}
              totalWeeklyDeliveries={simulationMetrics.totalWeeklyDeliveries}
              tradeoffOutcome={currentTradeoffOutcome}
              currentStep={currentStep}
              policyNote={policyNote}
              onSwitchToSimulation={() => handleToggleSimplifiedMode(false)}
              onOpenMagnifiedGauge={() => setShowMagnifiedGauge(true)}
              onOpenManualSliders={() => {
                setIsSimExpanded(false);
                setShowManualSliders(true);
              }}
              onCurbsideDemandChange={(newDemand) => {
                setManualOverride((prev) => ({
                  ...prev,
                  curbsideDemandOverride: newDemand
                }));
              }}
              onReshuffle={simulationMetrics.onReshuffle}
            />
          ) : (
            <NeighborhoodSimulation
              config={simConfig}
              onConfigChange={handleConfigChange}
              activeQuestionNumber={currentStep + 1}
              policyNote={policyNote}
              isCompleted={isCompleted}
              showControls={showManualSliders}
              onToggleControls={() => {
                setShowManualSliders((prev) => {
                  const next = !prev;
                  if (next) {
                    setIsSimExpanded(false);
                  }
                  return next;
                });
              }}
              onToggleMagnifiedGauge={() => setShowMagnifiedGauge((prev) => !prev)}
              onToggleSimplifiedMode={() => handleToggleSimplifiedMode(true)}
              curbsideDemandCount={simulationMetrics.curbsideDemandCount}
              curbsideStallsCapacity={simulationMetrics.curbsideStallsCapacity}
              curbsidePct={simulationMetrics.curbsidePct}
              circlingCarCount={simulationMetrics.circlingCarCount}
              occupiedGaragesCount={simulationMetrics.occupiedGaragesCount}
              hideGaragePill={!isSimExpanded || showManualSliders}
              isExpanded={isSimExpanded}
              onSimulationMetricsChange={() => {}}
            />
          )}
        </section>

        {/* Interactive Survey or Results View: slides down to lower 33% when simulation is expanded, restored when clicked */}
        <section
          id="survey-section"
          onClick={() => {
            if (isSimExpanded && !showManualSliders) {
              setIsSimExpanded(false);
            }
          }}
          onFocusCapture={() => {
            if (isSimExpanded && !showManualSliders) {
              setIsSimExpanded(false);
            }
          }}
          className={`relative w-full flex flex-col overflow-hidden min-h-0 bg-[#ffffff] lg:h-full [@media(orientation:landscape)_and_(max-height:540px)]:h-full transition-all duration-300 ease-in-out ${
            isCompleted
              ? "w-full lg:w-1/2"
              : isSimExpanded && !showManualSliders
              ? "h-[33vh] min-h-[33vh] max-h-[33vh] flex-none overflow-hidden lg:h-full lg:max-h-none lg:w-[35%] xl:w-[35%]"
              : "flex-1 lg:w-[52%] xl:w-[50%] 2xl:w-[48%]"
          } [@media(orientation:landscape)_and_(max-height:540px)]:w-1/2 ${showMagnifiedGauge ? 'filter blur-[1.5px] pointer-events-none' : ''}`}
          aria-label={t('header_survey_aria', 'Parking Policy Persona Survey')}
        >
          {/* Middle bar: Larger Centre Button to Toggle between "Tap to Expand View" and "Tap to Restore View" */}
          {!isCompleted && !showManualSliders && (
            <div
              className={`w-full py-2 px-3 flex items-center justify-center border-b shrink-0 z-20 transition-all ${
                isSimExpanded
                  ? 'bg-amber-50/90 border-amber-300 shadow-xs'
                  : 'bg-slate-100/95 border-slate-300 lg:hidden shadow-2xs'
              }`}
            >
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsSimExpanded((prev) => !prev);
                }}
                className="w-full max-w-sm sm:max-w-md py-2.5 px-6 rounded-full bg-[#004B8D] hover:bg-[#00386a] active:bg-[#002244] text-white text-xs sm:text-sm font-black shadow-md hover:shadow-lg flex items-center justify-center gap-2.5 cursor-pointer transition-all active:scale-[0.98] border-2 border-white/80 ring-2 ring-[#004B8D]/20 min-h-[42px] sm:min-h-[46px]"
                title={
                  isSimExpanded
                    ? t('sim_restore_view_title', 'Tap to restore question view')
                    : t('sim_expand_view_title', 'Tap to expand view')
                }
                aria-label={
                  isSimExpanded
                    ? t('sim_restore_view_label', 'Tap to Restore View')
                    : t('sim_expand_view_label', 'Tap to Expand View')
                }
              >
                {isSimExpanded ? (
                  <>
                    <ChevronDown className="w-4 h-4 text-[#FFC72C] shrink-0" />
                    <span className="tracking-wide">{t('sim_restore_view_label', 'Tap to Restore View')}</span>
                    <ChevronDown className="w-4 h-4 text-[#FFC72C] shrink-0" />
                  </>
                ) : (
                  <>
                    <ChevronUp className="w-4 h-4 text-[#FFC72C] shrink-0" />
                    <span className="tracking-wide">{t('sim_expand_view_label', 'Tap to Expand View')}</span>
                    <ChevronUp className="w-4 h-4 text-[#FFC72C] shrink-0" />
                  </>
                )}
              </button>
            </div>
          )}

          {/* Manual Sliders Overlay: positioned over the question container, blurring question content underneath while the neighborhood canvas remains crisp and unblurred */}
          <ManualSlidersDrawer
            showControls={showManualSliders}
            onClose={() => setShowManualSliders(false)}
            config={simConfig}
            onConfigChange={handleConfigChange}
            activeHouseholdCars={simulationMetrics.activeHouseholdCars}
            activeVisitorCars={simulationMetrics.activeVisitorCars}
            totalDwellings={simulationMetrics.totalDwellings}
            totalWeeklyDeliveries={simulationMetrics.totalWeeklyDeliveries}
            circlingCarCount={simulationMetrics.circlingCarCount}
            onOpenGauge={() => {
              setShowManualSliders(false);
              setShowMagnifiedGauge(true);
            }}
          />
          <div className={`w-full h-full flex-1 flex flex-col min-h-0 overflow-hidden transition-all duration-200 ${showManualSliders || showMagnifiedGauge ? 'blur-sm select-none pointer-events-none' : ''}`}>
          {!isCompleted ? (
            <SurveyStage
              questions={SURVEY_QUESTIONS}
              currentStep={currentStep}
              selectedAnswers={selectedAnswers}
              onSelectOption={handleSelectOption}
              onNavigate={handleNavigate}
              showValidationError={showValidationError}
              validationErrorMsg={validationErrorMsg}
              totalX={totalX}
              totalY={totalY}
              tradeoffOutcome={currentTradeoffOutcome}
              policyNote={policyNote}
              currentStreetLayout={simConfig.streetLayout || 'mature_laned'}
              currentNeighbourhoodName={simConfig.neighbourhoodName}
              onLayoutChange={handleLayoutChange}
              config={simConfig}
              totalDwellings={simulationMetrics.totalDwellings}
              onConfigChange={handleConfigChange}
            />
          ) : (
            <ResultsView
              persona={currentPersona}
              totalX={totalX}
              totalY={totalY}
              config={simConfig}
              answers={selectedAnswers}
              onRetake={handleRetake}
              onOpenPersonaMerger={() => setShowPersonaMerger(true)}
            />
          )}
          </div>
        </section>
      </main>


      {/* 3-Step Civic Onboarding Walkthrough Modal - only displayed when device check is not blocking */}
      <CivicOnboardingModal
        isOpen={showOnboarding && !isDeviceCheckBlocking}
        onClose={() => setShowOnboarding(false)}
        isSimplifiedMode={isSimplifiedMode}
        onToggleSimplifiedMode={handleToggleSimplifiedMode}
      />

      {/* 16 -> 8 Persona Streamlining & CSV Importer Modal */}
      <PersonaMergerViewer
        isOpen={showPersonaMerger}
        onClose={() => setShowPersonaMerger(false)}
        activePersonaId={currentPersona.id}
      />

      {/* Device & Browser Verification Guard (Validates orientation, canvas, and storage before displaying start screen) */}
      <DeviceBrowserCheck
        onBlockStateChange={setIsDeviceCheckBlocking}
        onAutoSwitchSimplifiedMode={() => handleToggleSimplifiedMode(true)}
      />
    </div>
  );
}
