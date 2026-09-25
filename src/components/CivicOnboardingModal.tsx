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
  const [currentStep, setCurrentStep] = useState<number>(1);
  const totalSteps = 5;
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
                Curbside Compass
              </h2>
              <p className="text-base text-blue-100 font-semibold leading-tight hidden xs:block">
                City of Edmonton Guide
              </p>
            </div>
          </div>

          {/* Large, Prominent Skip Intro Button */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleFinish}
              className="flex items-center gap-2 px-3.5 sm:px-5 py-2 bg-[#FFC72C] hover:bg-[#ffe066] active:bg-[#f5bc20] text-[#004B8D] font-black text-base sm:text-lg rounded-xl shadow-md transition-all cursor-pointer min-h-[46px] border-2 border-[#003566]/20 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              title="Skip this guide and start the survey right now"
              aria-label="Skip introduction and start survey"
            >
              <FastForward className="w-5 h-5 stroke-[2.5]" />
              <span className="font-black">Skip Intro</span>
            </button>

            <button
              type="button"
              onClick={handleFinish}
              className="p-2 text-white/80 hover:text-white hover:bg-white/15 rounded-xl transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFC72C]"
              title="Close guide"
              aria-label="Close guide"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Step Progress Tracker: Clear & 16px font */}
        <div className="bg-gray-100 px-3 sm:px-5 py-1.5 sm:py-2 border-b border-gray-300 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1.5 sm:gap-2">
            {[1, 2, 3, 4, 5].map((step) => (
              <button
                key={step}
                type="button"
                onClick={() => {
                  triggerFeedback('button');
                  setCurrentStep(step);
                }}
                className={`flex items-center justify-center text-base font-black px-2.5 sm:px-3 py-1 rounded-lg transition-all cursor-pointer min-h-[38px] ${
                  currentStep === step
                    ? 'bg-[#004B8D] text-white shadow-xs scale-105'
                    : currentStep > step
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                aria-label={`Go to step ${step}`}
              >
                <span>Step {step}</span>
                {currentStep > step && <CheckCircle2 className="w-4 h-4 text-emerald-600 inline ml-1" />}
              </button>
            ))}
          </div>

          <span className="text-base font-bold text-gray-700 hidden md:inline">
            Screen {currentStep} of {totalSteps}
          </span>
        </div>

        {/* Body Content Area: Sized strictly above the fold with NO vertical scrolling */}
        <div className="p-3 sm:p-5 [@media(orientation:landscape)_and_(max-height:500px)]:p-2 flex-1 flex flex-col justify-center text-gray-900 overflow-y-auto">
          {/* SCREEN 1: Welcome & Civic Purpose */}
          {currentStep === 1 && (
            <div className="space-y-2.5 sm:space-y-3.5 animate-in fade-in duration-150">
              <div className="border-l-4 border-[#004B8D] pl-3">
                <h3 className="text-xl sm:text-2xl font-black text-[#004B8D] leading-tight">
                  Welcome to Curbside Compass!
                </h3>
                <p className="text-base sm:text-lg text-gray-700 font-bold mt-1">
                  A City of Edmonton Public Survey
                </p>
              </div>

              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-3 sm:p-4 space-y-1.5">
                <p className="text-base sm:text-lg text-gray-900 leading-snug">
                  Help Edmonton plan street parking for your neighbourhood.
                </p>
                <p className="text-base sm:text-lg text-gray-900 leading-snug font-bold">
                  There are no wrong answers. It takes just 3 to 5 minutes!
                </p>
              </div>

              <p className="text-base sm:text-lg text-emerald-800 font-bold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>Your answers are 100% private and protected.</span>
              </p>
            </div>
          )}

          {/* SCREEN 2: How Street Parking Works */}
          {currentStep === 2 && (
            <div className="space-y-2 sm:space-y-3 animate-in fade-in duration-150">
              <h3 className="text-xl sm:text-2xl font-black text-[#004B8D] leading-tight">
                How Our Streets Work
              </h3>

              <div className="space-y-2">
                <div className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-xl border-2 border-gray-200">
                  <div className="w-9 h-9 rounded-lg bg-[#193A5A] text-[#FFC72C] flex items-center justify-center shrink-0">
                    <Home className="w-5 h-5" />
                  </div>
                  <div className="text-base text-gray-900">
                    <strong className="block font-bold">1. Back Garages:</strong>
                    <span>Homes have private garages in the back lane.</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-xl border-2 border-gray-200">
                  <div className="w-9 h-9 rounded-lg bg-[#0081BC] text-white flex items-center justify-center shrink-0">
                    <Car className="w-5 h-5" />
                  </div>
                  <div className="text-base text-gray-900">
                    <strong className="block font-bold">2. Curb Spots:</strong>
                    <span>Residents, visitors, and delivery vans share street spots.</span>
                  </div>
                </div>
              </div>

              <p className="text-base text-gray-700 font-bold leading-snug">
                When curb spots fill up, drivers have to circle the block looking for parking.
              </p>
            </div>
          )}

          {/* SCREEN 3: See What Happens Live */}
          {currentStep === 3 && (
            <div className="space-y-2.5 sm:space-y-3.5 animate-in fade-in duration-150">
              <h3 className="text-xl sm:text-2xl font-black text-[#004B8D] leading-tight">
                See What Happens Live
              </h3>

              <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-3 sm:p-4 space-y-2">
                <p className="text-base sm:text-lg text-gray-900 leading-snug">
                  Every time you answer a question, the street picture updates right away.
                </p>
                <p className="text-base sm:text-lg text-gray-900 leading-snug font-bold">
                  You can see if parking spots open up, or if cars start circling.
                </p>
              </div>

              <p className="text-base sm:text-lg text-gray-700 font-semibold leading-snug">
                This helps you see how each parking rule affects your neighbourhood street.
              </p>
            </div>
          )}

          {/* SCREEN 4: Choose Your View */}
          {currentStep === 4 && (
            <div className="space-y-2 sm:space-y-3 animate-in fade-in duration-150">
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-[#004B8D] leading-tight">
                  Choose Your Street Picture
                </h3>
                <p className="text-base text-gray-700 font-semibold">
                  Pick the view you like best:
                </p>
              </div>

              <div className="space-y-2">
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
                        Moving Street Picture
                      </span>
                      {!isSimplifiedMode && (
                        <span className="text-base font-black text-[#004B8D] bg-white border border-[#004B8D] px-2 py-0.5 rounded">
                          Selected ✓
                        </span>
                      )}
                    </div>
                    <p className="text-base text-gray-700 leading-tight">
                      Watch cars and delivery vans drive on the street.
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
                        Still Picture (No Motion)
                      </span>
                      {isSimplifiedMode && (
                        <span className="text-base font-black text-[#004B8D] bg-white border border-[#004B8D] px-2 py-0.5 rounded">
                          Selected ✓
                        </span>
                      )}
                    </div>
                    <p className="text-base text-gray-700 leading-tight">
                      A calm screen with clear numbers and no moving cars.
                    </p>
                  </div>
                </button>
              </div>

              <p className="text-base text-gray-600 italic">
                You can switch views anytime during the survey!
              </p>
            </div>
          )}

          {/* SCREEN 5: Ready to Start */}
          {currentStep === 5 && (
            <div className="space-y-2.5 sm:space-y-3.5 animate-in fade-in duration-150">
              <div className="border-l-4 border-[#059669] pl-3">
                <h3 className="text-xl sm:text-2xl font-black text-gray-900 leading-tight">
                  You Are Ready to Begin!
                </h3>
                <p className="text-base sm:text-lg text-gray-700 font-bold mt-1">
                  Just 3 things to remember:
                </p>
              </div>

              <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-3 sm:p-4 space-y-2 text-base sm:text-lg text-gray-900 font-semibold">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>Answer 9 quick questions about parking rules.</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>Go at your own speed. There is no rush.</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>Click &quot;How It Works&quot; at the top if you need this guide again.</span>
                </div>
              </div>

              <p className="text-base sm:text-lg text-gray-900 font-black">
                Thank you for helping plan Edmonton&apos;s neighbourhood streets!
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
                <span>Back</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinish}
                className="px-4 py-2 text-base font-bold text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-xl transition-all cursor-pointer min-h-[46px]"
              >
                Skip Intro
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
              <span>{currentStep === totalSteps ? 'Start Survey' : 'Next Step'}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
