import React, { useState, useEffect, useRef } from 'react';
import { 
  Compass, 
  CheckCircle2, 
  Eye, 
  Car, 
  Home, 
  Gauge, 
  X, 
  ArrowRight, 
  ArrowLeft,
  ShieldCheck,
  ZapOff,
  FastForward
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
  const totalSteps = 4;
  const modalRef = useRef<HTMLDivElement>(null);
  const nextButtonRef = useRef<HTMLButtonElement>(null);

  // Reset to step 1 when opening
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(1);
      setTimeout(() => {
        nextButtonRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Handle keyboard navigation (Escape to close, Enter to advance)
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
      // localStorage may fail in restricted iframes
    }
    onClose();
    if (onStartSurvey) {
      onStartSurvey();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-modal-title"
    >
      <div 
        ref={modalRef}
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border-2 border-[#004B8D] overflow-hidden flex flex-col max-h-[96dvh] [@media(max-height:500px)]:max-h-[98dvh]"
      >
        {/* Top Header Bar */}
        <div className="bg-[#004B8D] text-white px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between border-b-2 border-[#003566] shrink-0">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-white/15 flex items-center justify-center text-[#FFC72C] shrink-0">
              <Compass className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <h2 id="onboarding-modal-title" className="text-lg sm:text-xl font-black tracking-tight leading-tight truncate">
                Curbside Compass
              </h2>
              <p className="text-base text-blue-100 font-semibold leading-tight">
                City of Edmonton Guide
              </p>
            </div>
          </div>

          {/* Prominent Large Skip Intro Button in Header */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleFinish}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 bg-[#FFC72C] hover:bg-[#ffe066] active:bg-[#f5bc20] text-[#004B8D] font-black text-base rounded-lg shadow-sm transition-all cursor-pointer min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              title="Skip this guide and start the survey questions right now"
              aria-label="Skip introduction and start survey"
            >
              <FastForward className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
              <span>Skip Intro</span>
            </button>

            <button
              type="button"
              onClick={handleFinish}
              className="p-2 text-white/80 hover:text-white hover:bg-white/15 rounded-lg transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFC72C]"
              title="Close guide"
              aria-label="Close guide"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Step Progress Tracker */}
        <div className="bg-gray-100 px-3 sm:px-6 py-2 border-b border-gray-300 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 sm:gap-3">
            {[1, 2, 3, 4].map((step) => (
              <button
                key={step}
                type="button"
                onClick={() => {
                  triggerFeedback('button');
                  setCurrentStep(step);
                }}
                className={`flex items-center gap-1 text-base font-bold px-2.5 sm:px-3 py-1 rounded-md transition-all cursor-pointer min-h-[38px] ${
                  currentStep === step
                    ? 'bg-[#004B8D] text-white shadow-xs'
                    : currentStep > step
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                aria-label={`Go to step ${step}`}
              >
                <span>Step {step}</span>
                {currentStep > step && <CheckCircle2 className="w-4 h-4 text-emerald-600 inline ml-0.5" />}
              </button>
            ))}
          </div>

          <span className="text-base font-bold text-gray-700 hidden sm:inline">
            Screen {currentStep} of {totalSteps}
          </span>
        </div>

        {/* Body Content: Designed so all text fits above the fold without scrolling */}
        <div className="p-3 sm:p-6 [@media(max-height:500px)]:p-2.5 flex-1 flex flex-col justify-center text-gray-900 overflow-y-auto">
          {/* SCREEN 1: Welcome & Simple Purpose */}
          {currentStep === 1 && (
            <div className="space-y-3 sm:space-y-4 animate-in fade-in duration-150">
              <div className="border-l-4 border-[#004B8D] pl-3 sm:pl-4">
                <h3 className="text-xl sm:text-2xl font-black text-[#004B8D] leading-snug">
                  Welcome to Curbside Compass!
                </h3>
                <p className="text-base sm:text-lg text-gray-700 font-medium mt-1 leading-normal">
                  The City of Edmonton wants your thoughts on neighbourhood street parking.
                </p>
              </div>

              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-3 sm:p-4 space-y-2">
                <p className="text-base sm:text-lg text-gray-900 leading-relaxed font-normal">
                  As you answer simple questions, a live street picture shows what happens to parking spots, traffic, and your street.
                </p>
                <p className="text-base sm:text-lg text-gray-900 font-bold leading-relaxed">
                  There is no test and no game to win. Just tell us what you think!
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-base text-gray-800 font-semibold pt-1">
                <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg p-2.5">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>Your answers are private</span>
                </div>
                <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg p-2.5">
                  <CheckCircle2 className="w-5 h-5 text-[#004B8D] shrink-0" />
                  <span>Takes only 3 to 5 minutes</span>
                </div>
              </div>
            </div>
          )}

          {/* SCREEN 2: How the Street Picture Works */}
          {currentStep === 2 && (
            <div className="space-y-2.5 sm:space-y-3.5 animate-in fade-in duration-150">
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-[#004B8D] leading-snug">
                  How the Street Picture Works
                </h3>
                <p className="text-base sm:text-lg text-gray-700 font-medium">
                  The picture shows a normal 12-house Edmonton street block:
                </p>
              </div>

              <div className="space-y-2 sm:space-y-2.5">
                <div className="flex items-center gap-3 p-2.5 sm:p-3 bg-gray-50 rounded-xl border-2 border-gray-200">
                  <div className="w-10 h-10 rounded-lg bg-[#193A5A] text-white flex items-center justify-center shrink-0">
                    <Home className="w-5 h-5 text-[#FFC72C]" />
                  </div>
                  <div className="text-base text-gray-900">
                    <strong className="block font-bold">1. Back Garages:</strong>
                    <span>Cars park inside private garages in the back lane.</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-2.5 sm:p-3 bg-gray-50 rounded-xl border-2 border-gray-200">
                  <div className="w-10 h-10 rounded-lg bg-[#0081BC] text-white flex items-center justify-center shrink-0">
                    <Car className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-base text-gray-900">
                    <strong className="block font-bold">2. Curb Spots:</strong>
                    <span>Neighbours, visitors, and delivery vans share street spots.</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-2.5 sm:p-3 bg-gray-50 rounded-xl border-2 border-gray-200">
                  <div className="w-10 h-10 rounded-lg bg-[#059669] text-white flex items-center justify-center shrink-0">
                    <Gauge className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-base text-gray-900">
                    <strong className="block font-bold">3. Street Meter:</strong>
                    <span>Green means spots are easy to find. Red means spots are full.</span>
                  </div>
                </div>
              </div>

              <p className="text-base text-gray-600 italic">
                Tip: You can watch the street picture, or just answer the questions!
              </p>
            </div>
          )}

          {/* SCREEN 3: Choose Visual Style */}
          {currentStep === 3 && (
            <div className="space-y-3 sm:space-y-4 animate-in fade-in duration-150">
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-[#004B8D] leading-snug">
                  Choose Your Picture Style
                </h3>
                <p className="text-base sm:text-lg text-gray-700 font-medium">
                  Pick whichever picture style is easiest for your eyes:
                </p>
              </div>

              <div className="space-y-2.5 sm:space-y-3">
                {/* Option 1: Live Simulation */}
                <button
                  type="button"
                  onClick={() => {
                    triggerFeedback('button');
                    onToggleSimplifiedMode(false);
                  }}
                  className={`w-full text-left p-3 sm:p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center gap-3 min-h-[56px] ${
                    !isSimplifiedMode
                      ? 'border-[#004B8D] bg-blue-50/80 shadow-md ring-2 ring-[#004B8D]/30'
                      : 'border-gray-300 bg-white hover:border-gray-400'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                    !isSimplifiedMode ? 'bg-[#004B8D] text-white' : 'bg-gray-100 text-gray-600'
                  }`}>
                    <Eye className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-base sm:text-lg text-gray-900">
                        Moving Street Picture (Default)
                      </span>
                      {!isSimplifiedMode && (
                        <span className="text-base font-black text-[#004B8D] bg-white border border-[#004B8D] px-2.5 py-0.5 rounded">
                          Selected ✓
                        </span>
                      )}
                    </div>
                    <p className="text-base text-gray-700 font-normal">
                      Cars, bikes, and buses move on the screen as you pick policies.
                    </p>
                  </div>
                </button>

                {/* Option 2: Still Summary */}
                <button
                  type="button"
                  onClick={() => {
                    triggerFeedback('button');
                    onToggleSimplifiedMode(true);
                  }}
                  className={`w-full text-left p-3 sm:p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center gap-3 min-h-[56px] ${
                    isSimplifiedMode
                      ? 'border-[#004B8D] bg-blue-50/80 shadow-md ring-2 ring-[#004B8D]/30'
                      : 'border-gray-300 bg-white hover:border-gray-400'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                    isSimplifiedMode ? 'bg-[#004B8D] text-white' : 'bg-gray-100 text-gray-600'
                  }`}>
                    <ZapOff className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-base sm:text-lg text-gray-900">
                        Still Picture (No Movement)
                      </span>
                      {isSimplifiedMode && (
                        <span className="text-base font-black text-[#004B8D] bg-white border border-[#004B8D] px-2.5 py-0.5 rounded">
                          Selected ✓
                        </span>
                      )}
                    </div>
                    <p className="text-base text-gray-700 font-normal">
                      A quiet, still summary with clear numbers and no moving cars.
                    </p>
                  </div>
                </button>
              </div>

              <p className="text-base text-gray-700 font-medium">
                You can switch between these anytime during the survey!
              </p>
            </div>
          )}

          {/* SCREEN 4: Ready to Start */}
          {currentStep === 4 && (
            <div className="space-y-3 sm:space-y-4 animate-in fade-in duration-150">
              <div className="border-l-4 border-[#059669] pl-3 sm:pl-4">
                <h3 className="text-xl sm:text-2xl font-black text-gray-900 leading-snug">
                  You Are Ready to Begin!
                </h3>
                <p className="text-base sm:text-lg text-gray-700 font-medium mt-1">
                  Here is what to remember:
                </p>
              </div>

              <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-3 sm:p-4 space-y-2 text-base sm:text-lg text-gray-900">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Answer 9 quick questions about parking rules.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Take all the time you need. There is no rush.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>If you want to read this guide again, click <strong>"How It Works"</strong> at the top.</span>
                </div>
              </div>

              <p className="text-base text-gray-800 font-bold">
                Thank you for helping plan Edmonton&apos;s neighbourhood streets!
              </p>
            </div>
          )}
        </div>

        {/* Modal Bottom Footer Navigation Bar */}
        <div className="bg-gray-100 px-3 sm:px-6 py-2.5 sm:py-3 border-t-2 border-gray-300 flex items-center justify-between shrink-0 gap-2">
          {/* Back Button */}
          <div>
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handlePrev}
                className="px-3.5 sm:px-5 py-2 text-base font-bold text-gray-800 bg-white border-2 border-gray-300 hover:bg-gray-200 active:scale-95 rounded-xl transition-all cursor-pointer min-h-[46px] flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#004B8D]"
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Back</span>
              </button>
            )}
          </div>

          {/* Forward / Start Survey Button */}
          <div className="flex items-center gap-2 sm:gap-3">
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
              <span>{currentStep === totalSteps ? 'Start Survey Now' : 'Next Step'}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
