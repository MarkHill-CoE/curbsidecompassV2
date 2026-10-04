import React, { useState, useEffect, useRef } from 'react';
import { 
  Compass, 
  CheckCircle2, 
  Eye, 
  Car, 
  Home, 
  ArrowRight, 
  ArrowLeft,
  FastForward,
  X,
  ZapOff
} from 'lucide-react';
import { triggerFeedback } from '../utils/feedback';
import { useAppText } from '../context/TextContentContext';

interface CivicOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  isSimplifiedMode: boolean;
  onToggleSimplifiedMode: (simplified: boolean) => void;
  onStartSurvey?: () => void;
}

export const CivicOnboardingModal: React.FC<CivicOnboardingModalProps> = ({
  isOpen,
  onClose,
  isSimplifiedMode,
  onToggleSimplifiedMode,
  onStartSurvey,
}) => {
  const { t } = useAppText();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const totalSteps = 4;
  const modalRef = useRef<HTMLDivElement>(null);
  const nextButtonRef = useRef<HTMLButtonElement>(null);

  // Reset to step 1 when opened
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(1);
      setTimeout(() => {
        nextButtonRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Escape key closes modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleFinish();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleNext = () => {
    triggerFeedback('button');
    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleFinish();
    }
  };

  const handlePrev = () => {
    triggerFeedback('button');
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleFinish = () => {
    triggerFeedback('button');
    try {
      localStorage.setItem('curbside_compass_onboarding_completed', 'true');
    } catch {
      // Graceful fallback
    }
    onClose();
    if (onStartSurvey) {
      onStartSurvey();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="civic-modal-title"
    >
      <div 
        ref={modalRef}
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border-2 sm:border-4 border-[#004B8D] overflow-hidden flex flex-col max-h-[98dvh] [@media(orientation:landscape)_and_(max-height:500px)]:max-h-[98dvh]"
      >
        {/* Top Header Bar: Compact & features Large Skip Button */}
        <div className="bg-[#004B8D] text-white px-3 sm:px-5 py-2 sm:py-2.5 flex items-center justify-between border-b-2 border-[#003566] shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-white/20 flex items-center justify-center text-[#FFC72C] shrink-0">
              <Compass className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <h2 id="civic-modal-title" className="text-base sm:text-xl font-black tracking-tight leading-tight truncate">
                {t('intro_header_title', 'Curbside Compass')}
              </h2>
              <p className="text-base text-blue-100 font-semibold leading-tight hidden xs:block">
                {t('intro_header_subtitle', 'City of Edmonton Guide')}
              </p>
            </div>
          </div>

          {/* Large, Prominent Skip Intro Button */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleFinish}
              className="flex items-center gap-2 px-3.5 sm:px-5 py-2 bg-[#FFC72C] hover:bg-[#ffe066] active:bg-[#f5bc20] text-[#004B8D] font-black text-base sm:text-lg rounded-xl shadow-md transition-all cursor-pointer min-h-[46px] border-2 border-[#003566]/20 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              title={t('intro_btn_skip_title', 'Skip this guide and start the survey right now')}
              aria-label={t('intro_btn_skip_aria', 'Skip introduction and start survey')}
            >
              <FastForward className="w-5 h-5 stroke-[2.5]" />
              <span className="font-black">{t('intro_btn_skip', 'Skip Intro')}</span>
            </button>

            <button
              type="button"
              onClick={handleFinish}
              className="p-2 text-white/80 hover:text-white hover:bg-white/15 rounded-xl transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFC72C]"
              title={t('intro_btn_close_title', 'Close guide')}
              aria-label={t('intro_btn_close_aria', 'Close guide')}
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Step Progress Tracker: Clear & 16px font */}
        <div className="bg-gray-100 px-3 sm:px-5 py-1.5 sm:py-2 border-b border-gray-300 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1 sm:gap-2">
            {[1, 2, 3, 4].map((step) => {
              const label = step === 1 ? t('intro_step_1_label', 'Introduction') : `${t('intro_step_label', 'Step')} ${step - 1}`;
              const aria = step === 1 ? t('intro_step_1_aria', 'Go to Introduction') : `Go to Step ${step - 1}`;
              return (
                <button
                  key={step}
                  type="button"
                  onClick={() => {
                    triggerFeedback('button');
                    setCurrentStep(step);
                  }}
                  className={`flex items-center justify-center text-xs sm:text-sm md:text-base font-black px-2.5 sm:px-3.5 py-1 rounded-lg transition-all cursor-pointer min-h-[38px] ${
                    currentStep === step
                      ? 'bg-[#004B8D] text-white shadow-xs scale-105'
                      : currentStep > step
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                  aria-label={aria}
                >
                  <span>{label}</span>
                  {currentStep > step && <CheckCircle2 className="w-4 h-4 text-emerald-600 inline ml-1" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Body Content Area: Sized strictly above the fold with NO vertical scrolling */}
        <div className="p-3 sm:p-5 [@media(orientation:landscape)_and_(max-height:500px)]:p-2 flex-1 flex flex-col justify-center text-gray-900 overflow-y-auto">
          {/* SCREEN 1: Welcome & Civic Purpose (Introduction) */}
          {currentStep === 1 && (
            <div className="space-y-2.5 sm:space-y-3.5 animate-in fade-in duration-150">
              <div className="border-l-4 border-[#004B8D] pl-3">
                <h3 className="text-xl sm:text-2xl font-black text-[#004B8D] leading-tight">
                  {t('intro_s1_title', 'Welcome to Curbside Compass!')}
                </h3>
                <p className="text-base sm:text-lg text-gray-700 font-bold mt-1">
                  {t('intro_s1_subtitle', 'A City of Edmonton Public Survey')}
                </p>
              </div>

              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-3 sm:p-4 space-y-1.5">
                <p className="text-base sm:text-lg text-gray-900 leading-snug">
                  {t('intro_s1_body1', 'Help Edmonton plan street parking for your neighbourhood.')}
                </p>
                <p className="text-base sm:text-lg text-gray-900 leading-snug font-bold">
                  {t('intro_s1_body2', 'There are no wrong answers. It takes just 3 to 5 minutes!')}
                </p>
              </div>

              <p className="text-base sm:text-lg text-emerald-800 font-bold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>{t('intro_s1_privacy', 'Your answers are 100% private and protected.')}</span>
              </p>
            </div>
          )}

          {/* SCREEN 2: Step 1 - Street Types & Parking Combinations */}
          {currentStep === 2 && (
            <div className="space-y-2.5 sm:space-y-3.5 animate-in fade-in duration-150">
              <div className="border-l-4 border-[#004B8D] pl-3">
                <h3 className="text-lg sm:text-xl md:text-2xl font-black text-[#004B8D] leading-tight">
                  {t('intro_s2_title', 'Select the type of street you would like to explore.')}
                </h3>
                <p className="text-sm sm:text-base md:text-lg text-gray-700 font-bold mt-1">
                  {t('intro_s2_subtitle', 'Each street has a different combination of:')}
                </p>
              </div>

              <div className="space-y-2.5 sm:space-y-3">
                {/* Private Parking */}
                <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-3 sm:p-4 flex items-start gap-3 shadow-2xs">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-[#004B8D] text-white flex items-center justify-center shrink-0 mt-0.5">
                    <Home className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div>
                    <h4 className="text-base sm:text-lg font-black text-[#004B8D]">
                      {t('intro_s2_private_title', 'Private Parking')}
                    </h4>
                    <p className="text-sm sm:text-base text-gray-900 leading-snug mt-0.5">
                      {t('intro_s2_private_desc', 'Some homes have parking in a garage, driveway or parking lot. Others have limited or no private parking.')}
                    </p>
                  </div>
                </div>

                {/* Street Parking */}
                <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-3 sm:p-4 flex items-start gap-3 shadow-2xs">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-[#D97706] text-white flex items-center justify-center shrink-0 mt-0.5">
                    <Car className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div>
                    <h4 className="text-base sm:text-lg font-black text-amber-900">
                      {t('intro_s2_street_title', 'Street Parking')}
                    </h4>
                    <p className="text-sm sm:text-base text-gray-900 leading-snug mt-0.5">
                      {t('intro_s2_street_desc', 'Residents, visitors and service providers share the available street parking.')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SCREEN 3: Step 2 - See What Happens Live & Choose Your View */}
          {currentStep === 3 && (
            <div className="space-y-2 sm:space-y-3 animate-in fade-in duration-150">
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-[#004B8D] leading-tight">
                  {t('intro_s3_title', 'See What Happens Live')}
                </h3>
                <p className="text-base text-gray-700 font-semibold mt-0.5">
                  {t('intro_s3_body1', 'Every time you answer a question, the street picture updates right away.')}
                </p>
              </div>

              {/* View Selection Options */}
              <div className="space-y-2 pt-1">
                {/* Moving Simulation */}
                <button
                  type="button"
                  onClick={() => {
                    triggerFeedback('button');
                    onToggleSimplifiedMode(false);
                  }}
                  className={`w-full text-left p-2.5 sm:p-3 rounded-xl border-2 transition-all cursor-pointer flex items-center gap-3 min-h-[50px] ${
                    !isSimplifiedMode
                      ? 'border-[#004B8D] bg-blue-50 shadow-md ring-2 ring-[#004B8D]/30'
                      : 'border-gray-300 bg-white hover:border-gray-400'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                    !isSimplifiedMode ? 'bg-[#004B8D] text-white' : 'bg-gray-100 text-gray-600'
                  }`}>
                    <Eye className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-base sm:text-lg text-gray-900">
                        {t('intro_s4_opt1_title', 'Moving Street Picture')}
                      </span>
                      {!isSimplifiedMode && (
                        <span className="text-base font-black text-[#004B8D] bg-white border border-[#004B8D] px-2 py-0.5 rounded">
                          {t('intro_s4_badge_selected', 'Selected ✓')}
                        </span>
                      )}
                    </div>
                    <p className="text-base text-gray-700 leading-tight">
                      {t('intro_s4_opt1_desc', 'Watch cars and delivery vans drive on the street.')}
                    </p>
                  </div>
                </button>

                {/* Still Summary */}
                <button
                  type="button"
                  onClick={() => {
                    triggerFeedback('button');
                    onToggleSimplifiedMode(true);
                  }}
                  className={`w-full text-left p-2.5 sm:p-3 rounded-xl border-2 transition-all cursor-pointer flex items-center gap-3 min-h-[50px] ${
                    isSimplifiedMode
                      ? 'border-[#004B8D] bg-blue-50 shadow-md ring-2 ring-[#004B8D]/30'
                      : 'border-gray-300 bg-white hover:border-gray-400'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                    isSimplifiedMode ? 'bg-[#004B8D] text-white' : 'bg-gray-100 text-gray-600'
                  }`}>
                    <ZapOff className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-base sm:text-lg text-gray-900">
                        {t('intro_s4_opt2_title', 'Still Picture (No Motion)')}
                      </span>
                      {isSimplifiedMode && (
                        <span className="text-base font-black text-[#004B8D] bg-white border border-[#004B8D] px-2 py-0.5 rounded">
                          {t('intro_s4_badge_selected', 'Selected ✓')}
                        </span>
                      )}
                    </div>
                    <p className="text-base text-gray-700 leading-tight">
                      {t('intro_s4_opt2_desc', 'A calm screen with clear numbers and no moving cars.')}
                    </p>
                  </div>
                </button>
              </div>

              <p className="text-base text-gray-600 italic">
                {t('intro_s4_switch_note', 'You can switch views anytime during the survey!')}
              </p>
            </div>
          )}

          {/* SCREEN 4: Step 3 - Ready to Start */}
          {currentStep === 4 && (
            <div className="space-y-2.5 sm:space-y-3.5 animate-in fade-in duration-150">
              <div className="border-l-4 border-[#059669] pl-3">
                <h3 className="text-xl sm:text-2xl font-black text-gray-900 leading-tight">
                  {t('intro_s5_title', 'You Are Ready to Begin!')}
                </h3>
                <p className="text-base sm:text-lg text-gray-700 font-bold mt-1">
                  {t('intro_s5_subtitle', 'Just 3 things to remember:')}
                </p>
              </div>

              <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-3 sm:p-4 space-y-2 text-base sm:text-lg text-gray-900 font-semibold">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>{t('intro_s5_point1', 'Set your neighbourhood and answer 8 quick parking questions.')}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>{t('intro_s5_point2', 'Go at your own speed. There is no rush.')}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>{t('intro_s5_point3', 'Click "How It Works" at the top if you need this guide again.')}</span>
                </div>
              </div>

              <p className="text-base sm:text-lg text-gray-900 font-black">
                {t('intro_s5_thankyou', "Thank you for helping plan Edmonton's neighbourhood streets!")}
              </p>
            </div>
          )}
        </div>

        {/* Modal Bottom Footer Navigation Bar */}
        <div className="bg-gray-100 px-3 sm:px-5 py-2.5 sm:py-3 border-t-2 border-gray-300 flex items-center justify-between shrink-0 gap-2">
          {/* Back Button */}
          <div>
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={handlePrev}
                className="px-4 sm:px-5 py-2 text-base font-bold text-gray-800 bg-white border-2 border-gray-300 hover:bg-gray-200 active:scale-95 rounded-xl transition-all cursor-pointer min-h-[46px] flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#004B8D]"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>{t('intro_btn_back', 'Back')}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinish}
                className="px-4 py-2 text-base font-bold text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-xl transition-all cursor-pointer min-h-[46px]"
              >
                {t('intro_btn_skip', 'Skip Intro')}
              </button>
            )}
          </div>

          {/* Forward / Start Survey Button */}
          <div className="flex items-center gap-2">
            <button
              ref={nextButtonRef}
              type="button"
              onClick={handleNext}
              className={`px-5 sm:px-7 py-2.5 text-base sm:text-lg font-black rounded-xl shadow-md transition-all cursor-pointer min-h-[46px] flex items-center gap-2 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFC72C] ${
                currentStep === totalSteps
                  ? 'bg-[#059669] hover:bg-[#047857] text-white ring-2 ring-emerald-400'
                  : 'bg-[#004B8D] hover:bg-[#003566] text-white'
              }`}
            >
              <span>{currentStep === totalSteps ? t('intro_btn_start', 'Start Survey') : t('intro_btn_next', 'Next Step')}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
