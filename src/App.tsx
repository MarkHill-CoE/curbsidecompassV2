import { useState, useMemo, useEffect, useCallback } from 'react';
import { NeighborhoodSimulation } from './components/NeighborhoodSimulation';
import { SimplifiedStreetSummary } from './components/SimplifiedStreetSummary';
import { CivicOnboardingModal } from './components/CivicOnboardingModal';
import { SurveyStage } from './components/SurveyStage';
import { ResultsView } from './components/ResultsView';
import { ManualSlidersDrawer } from './components/ManualSlidersDrawer';
import { MagnifiedGaugeDrawer } from './components/MagnifiedGaugeDrawer';
import { RotateDeviceNotice } from './components/RotateDeviceNotice';

// Temporary tool for the City communications team to review and edit copy directly
import { GoogleSheetSyncModal } from './components/GoogleSheetSyncModal';
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
  Compass,
  RotateCcw,
  FileSpreadsheet,
  HelpCircle,
  ZapOff,
  Eye,
  Sparkles,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { getDirectGoogleSheetWebUrl, isEditableGoogleSheetUrl } from './utils/textSync';
import { feedback, triggerFeedback } from './utils/feedback';
import { ambientAudio } from './utils/ambientAudio';

export default function App() {
  // # BEGIN TEMPORARY SHEETS SYNC
  const { t, isCustomActive, itemCount, sheetUrl } = useAppText();
  const [isSyncModalOpen, setIsSyncModalOpen] = useState<boolean>(false);
  const [syncModalTab, setSyncModalTab] = useState<'inventory' | 'url'>('inventory');
  // # END TEMPORARY SHEETS SYNC

  const [showManualSliders, setShowManualSliders] = useState<boolean>(false);
  const [showMagnifiedGauge, setShowMagnifiedGauge] = useState<boolean>(false);
  const [showOnboarding, setShowOnboarding] = useState<boolean>(() => {
    try {
      return localStorage.getItem('curbside_compass_onboarding_completed') !== 'true';
    } catch {
      return false;
    }
  });
  const [isSimplifiedMode, setIsSimplifiedMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem('curbside_compass_simplified_mode') === 'true';
    } catch {
      return false;
    }
  });
  const [isSimExpanded, setIsSimExpanded] = useState<boolean>(false);

  const handleToggleSimplifiedMode = useCallback((simplified?: boolean) => {
    setIsSimplifiedMode((prev) => {
      const nextVal = simplified !== undefined ? simplified : !prev;
      try {
        localStorage.setItem('curbside_compass_simplified_mode', String(nextVal));
      } catch {
        // ignore
      }
      return nextVal;
    });
  }, []);
  const [currentStep, setCurrentStep] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('curbsideCompass_step');
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  });

  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem('curbsideCompass_answers');
      return saved ? JSON.parse(saved) : {};
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
    try {
      const saved = localStorage.getItem('curbsideCompass_completed');
      return saved === 'true';
    } catch {
      return false;
    }
  });

  const [showValidationError, setShowValidationError] = useState<boolean>(false);
  const [validationErrorMsg, setValidationErrorMsg] = useState<string | null>(null);

  // Automatically save the user's progress to the browser's local storage
  useEffect(() => {
    try {
      localStorage.setItem('curbsideCompass_step', currentStep.toString());
      localStorage.setItem('curbsideCompass_answers', JSON.stringify(selectedAnswers));
      localStorage.setItem('curbsideCompass_simConfig', JSON.stringify(simConfig));
      localStorage.setItem('curbsideCompass_completed', isCompleted.toString());
    } catch (err) {
      console.warn('Could not save progress to browser storage:', err);
    }
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
      q0_layout: layout,
      ...(prev.q0 ? {} : { q0: layout })
    }));
    setManualOverride((prev) => ({
      ...(prev || {}),
      streetLayout: layout,
      neighbourhoodName: neighbourhoodName || prev?.neighbourhoodName,
      postalCode: postalCode || prev?.postalCode
    }));
    const layoutInfo = getStreetLayoutInfo(layout);
    setPolicyNote(`Matched to ${layoutInfo.title} (${layoutInfo.shortTitle}) with ${layoutInfo.curbsideCapacity} legal curbside stalls.`);
  }, []);

  // Handle when a user clicks on an answer option
  const handleSelectOption = useCallback((questionId: string, optionId: string) => {
    setShowValidationError(false);
    setValidationErrorMsg(null);
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: optionId }));

    const question = SURVEY_QUESTIONS.find((q) => q.id === questionId);
    // If this is the location or postal code question, find the matching neighbourhood type
    if (question?.type === 'text' || questionId === 'q0' || questionId === 'q9') {
      const trimmed = optionId.trim();
      if (trimmed && trimmed !== 'OPT_OUT') {
        const detection = detectLayoutAndNeighbourhood(trimmed);
        const layout = detection.typology;
        const layoutInfo = getStreetLayoutInfo(layout);
        const neighbourhoodName = detection.neighbourhood?.name;
        setManualOverride((prev) => ({
          ...(prev || {}),
          streetLayout: layout,
          neighbourhoodName: neighbourhoodName || prev?.neighbourhoodName,
          postalCode: trimmed
        }));
        const matchTitle = neighbourhoodName ? `${neighbourhoodName} • ${layoutInfo.title}` : layoutInfo.title;
        setPolicyNote(`Matched to ${matchTitle} (${layoutInfo.shortTitle}) with ${layoutInfo.curbsideCapacity} legal curbside stalls.`);
      } else if (trimmed === 'OPT_OUT') {
        setPolicyNote('Location opt-out chosen. Using standard Mature Laned baseline.');
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

      // Make sure the user entered a valid postal code or selected an answer before moving on
      if (currentQuestion.type === 'text' || currentQuestion.id === 'q0' || currentQuestion.id === 'q9') {
        const hasLayoutChoice = !!(selectedAnswers['q0_layout'] || selectedAnswers['q9_layout']);
        const valResult = validatePostalCode(answer || '');
        if (!valResult.isValid && !hasLayoutChoice) {
          setValidationErrorMsg(valResult.message || 'Please enter your postal code or select your neighbourhood.');
          setShowValidationError(true);
          return;
        }
      } else if (!answer) {
        setValidationErrorMsg('Please select an option to advance.');
        setShowValidationError(true);
        return;
      }

      setShowValidationError(false);
      setValidationErrorMsg(null);

      if (currentStep >= SURVEY_QUESTIONS.length) {
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

  const isDirectEditable = useMemo(() => isEditableGoogleSheetUrl(sheetUrl), [sheetUrl]);

  const handleOpenGoogleSheet = () => {
    if (isDirectEditable) {
      window.open(getDirectGoogleSheetWebUrl(sheetUrl), '_blank', 'noopener,noreferrer');
    } else {
      setSyncModalTab('url');
      setIsSyncModalOpen(true);
    }
  };

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
              <span className="text-white hidden xs:inline">{t('header_title_curbside', 'Curbside')}</span>
              <span className="text-[#FFC72C]">{t('header_title_compass', 'Compass')}</span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          {/* Communications Team: Text Inventory & Direct Google Sheet Link */}
          <div className="flex items-center rounded-lg border border-white/20 bg-white/10 overflow-hidden shadow-xs">
            <button
              type="button"
              onClick={() => {
                setSyncModalTab('inventory');
                setIsSyncModalOpen(true);
              }}
              title={
                isCustomActive
                  ? `App Text Sync Active (${itemCount} items) - Click to browse inventory or update copy`
                  : 'App Text Inventory & Google Sheet Sync (Communications Tool)'
              }
              aria-label="App text inventory and copy sync tool"
              className={`text-[0.6875rem] sm:text-xs flex items-center justify-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 transition-all min-h-[38px] sm:min-h-[44px] cursor-pointer ${
                isCustomActive
                  ? 'bg-emerald-700 hover:bg-emerald-600 text-white'
                  : 'hover:bg-white/20 text-[#FFC72C]'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4 text-[#FFC72C]" />
              <span className="font-bold flex items-center gap-1">
                <span className="hidden sm:inline">App Text</span>
                <span>Inventory</span>
                {isCustomActive && (
                  <span className="inline-flex items-center px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-emerald-400 text-emerald-950 font-black">
                    {itemCount}
                  </span>
                )}
              </span>
            </button>
            {isDirectEditable ? (
              <a
                href={getDirectGoogleSheetWebUrl(sheetUrl)}
                target="_blank"
                rel="noopener noreferrer"
                title="Open live editable Google Sheet directly in new tab to edit app copy"
                aria-label="Open live editable Google Sheet directly in new tab"
                className="px-2 sm:px-2.5 py-1.5 text-white hover:bg-white/20 transition-all border-l border-white/20 flex items-center gap-1 text-[0.6875rem] sm:text-xs font-bold min-h-[38px] sm:min-h-[44px]"
              >
                <span className="hidden xs:inline">Google</span>
                <span>Sheet</span>
                <ExternalLink className="w-3.5 h-3.5 text-[#FFC72C]" />
              </a>
            ) : (
              <button
                type="button"
                onClick={handleOpenGoogleSheet}
                title="Connect your team's live Google Sheet to edit copy"
                aria-label="Connect live Google Sheet"
                className="px-2 sm:px-2.5 py-1.5 text-white hover:bg-white/20 transition-all border-l border-white/20 flex items-center gap-1 text-[0.6875rem] sm:text-xs font-bold min-h-[38px] sm:min-h-[44px] cursor-pointer"
              >
                <span className="hidden xs:inline">Google</span>
                <span>Sheet</span>
                <ExternalLink className="w-3.5 h-3.5 text-[#FFC72C]" />
              </button>
            )}
          </div>

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
              {t('header_how_it_works', 'How It Works')}
            </span>
          </button>

          {/* View Mode Toggle Button: Accessible on mobile, tablet & desktop */}
          <button
            type="button"
            onClick={() => {
              triggerFeedback('button');
              handleToggleSimplifiedMode();
            }}
            title={isSimplifiedMode ? 'Switch to Live Animated Simulation' : 'Switch to Simplified Static Summary (Low Motion)'}
            aria-label={isSimplifiedMode ? 'Switch to Live Simulation' : 'Switch to Simplified View'}
            className={`text-[0.6875rem] sm:text-xs flex items-center justify-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 rounded transition-all min-h-[44px] min-w-[44px] cursor-pointer border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFC72C] ${
              isSimplifiedMode
                ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border-amber-400/40'
                : 'bg-white/10 hover:bg-white/20 text-gray-200 border-white/20'
            }`}
          >
            {isSimplifiedMode ? (
              <>
                <ZapOff className="w-4 h-4 text-amber-300" />
                <span className="hidden sm:inline font-bold">{t('header_mode_simplified', 'Simplified')}</span>
              </>
            ) : (
              <>
                <Eye className="w-4 h-4 text-[#FFC72C]" />
                <span className="hidden sm:inline font-bold">{t('header_mode_live', 'Live Model')}</span>
              </>
            )}
          </button>

          {/* Leaning Persona Pill */}
          <div className="hidden xl:flex items-center gap-1.5 text-[0.6875rem] bg-black/25 px-2.5 py-1 rounded-full border border-white/15">
            <Compass className="w-3.5 h-3.5 text-[#FFC72C]" />
            <span className="text-gray-300">
              {isCompleted ? t('header_final_persona', 'Final Persona:') : t('header_live_trend', 'Live Trend:')}
            </span>
            <span className="font-bold text-white truncate max-w-[170px]">
              {currentPersona.title.replace('The ', '').replace(' Profile', '')}
            </span>
          </div>

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
              ? "hidden lg:block"
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
              ? "w-full lg:w-[52%] xl:w-[50%] 2xl:w-[48%]"
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
            currentStep < SURVEY_QUESTIONS.length ? (
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
              />
            ) : (
              <div 
                id="outcome-screen-container"
                role="region"
                aria-label={t('watch_title', 'Your Neighbourhood Parking Program Outcome')}
                className="relative flex flex-col justify-between h-full p-2 sm:p-3 text-center animate-in fade-in duration-300 overflow-y-auto"
              >
                {/* Header & Status Card */}
                <div className="flex flex-col items-center justify-center gap-1 sm:gap-1.5 my-auto max-w-xl mx-auto w-full">
                  <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-[#004B8D] text-[9pt] sm:text-[9.5pt] font-black uppercase tracking-wider shadow-2xs">
                    <Sparkles className="w-3.5 h-3.5 text-[#FFC72C] fill-[#FFC72C]" />
                    <span>{t('outcome_badge', 'All 8 Policy Steps Completed')}</span>
                  </div>

                  <h2 className="text-[13pt] sm:text-[16pt] md:text-[18pt] font-black text-[#002B49] tracking-tight leading-tight">
                    {t('watch_title', 'Your Neighbourhood Parking Program Outcome')}
                  </h2>

                  {/* Summary & View Toggle Pills */}
                  <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-1.5 pt-0.5 text-[9.5pt] sm:text-[10pt] font-bold">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-100 border border-gray-200 text-gray-800">
                      📍 {simConfig.neighbourhoodName || 'Edmonton'}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 text-[#004B8D]">
                      🏡 {getStreetLayoutInfo(simConfig.streetLayout).shortTitle} ({simulationMetrics.curbsideStallsCapacity} stalls)
                    </span>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border ${
                      simulationMetrics.curbsidePct >= 100
                        ? 'bg-amber-50 border-amber-300 text-amber-900'
                        : 'bg-emerald-50 border-emerald-300 text-emerald-900'
                    }`}>
                      🚗 {simulationMetrics.curbsideDemandCount} Demand • {simulationMetrics.curbsidePct}% Occupancy
                    </span>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border ${
                      simulationMetrics.circlingCarCount > 0
                        ? 'bg-amber-50 border-amber-300 text-amber-900'
                        : 'bg-emerald-50 border-emerald-300 text-emerald-900'
                    }`}>
                      🚦 {simulationMetrics.circlingCarCount > 0 ? `${simulationMetrics.circlingCarCount} Circling` : 'Smooth Flow'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsSimExpanded((prev) => !prev)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 text-[#004B8D] hover:bg-blue-100 cursor-pointer transition-colors shadow-2xs font-bold"
                      title={isSimExpanded ? "Minimize simulation view" : "Expand simulation view"}
                    >
                      {isSimExpanded ? <ChevronDown className="w-3.5 h-3.5 text-[#FFC72C]" /> : <ChevronUp className="w-3.5 h-3.5 text-[#004B8D]" />}
                      <span>{isSimExpanded ? 'Expanded View (Active)' : 'Expand Street View'}</span>
                    </button>
                  </div>
                </div>

                {/* Bottom Action Buttons: Go Back & View Your Curbside Persona */}
                <div className="sticky bottom-0 z-20 bg-white pt-2 pb-1 border-t border-gray-200 flex items-center justify-between gap-3 w-full max-w-xl mx-auto shrink-0 shadow-[0_-2px_6px_rgba(0,0,0,0.03)]">
                  <button
                    type="button"
                    id="outcome-back-btn"
                    onClick={() => {
                      triggerFeedback('button');
                      setCurrentStep(prev => Math.max(0, prev - 1));
                    }}
                    className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-1.5 border-2 border-gray-300 bg-white text-gray-800 hover:bg-gray-100 transition-all min-h-[44px] sm:min-h-[48px] cursor-pointer shadow-2xs active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#004B8D]"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>{t('watch_btn_back', 'Go Back')}</span>
                  </button>

                  <button
                    type="button"
                    id="outcome-view-persona-btn"
                    onClick={() => {
                      triggerFeedback('submit');
                      setIsCompleted(true);
                    }}
                    className="px-5 py-2 sm:px-6 sm:py-2.5 rounded-xl font-black text-xs sm:text-sm bg-[#004B8D] hover:bg-[#003566] active:scale-95 text-white flex items-center gap-2 shadow-md transition-all cursor-pointer min-h-[44px] sm:min-h-[48px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#004B8D]"
                  >
                    <span>{t('watch_btn_view_persona', 'View Your Curbside Persona')}</span>
                    <ChevronRight className="w-4 h-4 stroke-[2.5]" />
                  </button>
                </div>
              </div>
            )
          ) : (
            <ResultsView
              persona={currentPersona}
              totalX={totalX}
              totalY={totalY}
              config={simConfig}
              answers={selectedAnswers}
              onRetake={handleRetake}
            />
          )}
          </div>
        </section>
      </main>

      {/* # BEGIN TEMPORARY SHEETS SYNC */}
      {/* Google Sheets Sync Modal - To be removed prior to public production release */}
      <GoogleSheetSyncModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        initialTab={syncModalTab}
      />
      {/* # END TEMPORARY SHEETS SYNC */}

      {/* 3-Step Civic Onboarding Walkthrough Modal */}
      <CivicOnboardingModal
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        isSimplifiedMode={isSimplifiedMode}
        onToggleSimplifiedMode={handleToggleSimplifiedMode}
      />

      {/* Mobile Horizontal Screen Orientation Advisory */}
      <RotateDeviceNotice />
    </div>
  );
}
