import React, { useState, useEffect, useRef } from 'react';
import { 
  Compass, 
  CheckCircle2, 
  Eye, 
  Car, 
  Home, 
  ArrowRight, 
  FastForward,
  X,
  ZapOff,
  Sparkles
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
  const [activeSection, setActiveSection] = useState<number>(1);
  const modalRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const startButtonRef = useRef<HTMLButtonElement>(null);

  // Focus start button when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        startButtonRef.current?.focus();
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

  // Track active section on scroll
  useEffect(() => {
    if (!isOpen) return;
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const sections = [
        { id: 'civic-step-intro', step: 1 },
        { id: 'civic-step-1', step: 2 },
        { id: 'civic-step-2', step: 3 },
        { id: 'civic-step-3', step: 4 }
      ];

      const scrollTop = container.scrollTop;
      const containerTop = container.getBoundingClientRect().top;

      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i].id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top - containerTop <= 120) {
            setActiveSection(sections[i].step);
            break;
          }
        }
      }
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [isOpen]);

  if (!isOpen) return null;

  const scrollToSection = (id: string, stepIndex: number) => {
    triggerFeedback('button');
    setActiveSection(stepIndex);
    const target = document.getElementById(id);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border-2 sm:border-4 border-[#004B8D] overflow-hidden flex flex-col max-h-[94dvh] [@media(orientation:landscape)_and_(max-height:500px)]:max-h-[96dvh]"
      >
        {/* Top Header Bar: Compact & features Large Skip Button */}
        <div className="bg-[#004B8D] text-white px-3 sm:px-5 py-2.5 sm:py-3 flex items-center justify-between border-b-2 border-[#003566] shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-white/20 flex items-center justify-center text-[#FFC72C] shrink-0">
              <Compass className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <h2 id="civic-modal-title" className="text-base sm:text-xl font-black tracking-tight leading-tight truncate text-[#FFC72C]">
                {t('intro_header_title', 'How to Use')}
              </h2>
              <p className="text-xs sm:text-sm text-blue-100 font-semibold leading-tight hidden xs:block">
                {t('intro_header_subtitle', 'City of Edmonton Guide')}
              </p>
            </div>
          </div>

          {/* Header Close Button */}
          <div className="flex items-center gap-2 shrink-0">
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



        {/* Combined One Long Scroll Body Area */}
        <div 
          ref={scrollContainerRef}
          className="p-3.5 sm:p-5 [@media(orientation:landscape)_and_(max-height:500px)]:p-3 flex-1 overflow-y-auto overscroll-contain text-gray-900 space-y-4 sm:space-y-5 scroll-smooth bg-slate-50/60"
        >
          {/* SECTION 1: Welcome & Civic Purpose (Introduction) */}
          <section id="civic-step-intro" className="space-y-3 p-4 sm:p-5 rounded-2xl bg-blue-50/70 border border-blue-200/80 shadow-2xs scroll-mt-4">
            <div className="flex items-center gap-2">
              <span className="bg-[#004B8D] text-white text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-2xs">
                {t('intro_step_1_label', 'Introduction')}
              </span>
            </div>

            <div className="border-l-4 border-[#004B8D] pl-3.5">
              <h3 className="text-xl sm:text-2xl font-black text-[#004B8D] leading-tight">
                {t('intro_s1_title', 'Welcome to Curbside Compass!')}
              </h3>
              <p className="text-base sm:text-lg text-gray-700 font-bold mt-1">
                {t('intro_s1_subtitle', 'One street. Many needs. What would you prioritize?')}
              </p>
            </div>

            <div className="bg-white/90 border border-blue-200 rounded-xl p-3.5 sm:p-4 space-y-1.5 shadow-2xs">
              <p className="text-sm sm:text-base text-gray-900 leading-relaxed whitespace-pre-line">
                {t('intro_s1_body1', "Residential parking needs are changing. How should we manage limited curbside space as our city grows? Explore different parking rules and see the consequences. What works? What doesn't?\n\nThis tool illustrates the trade-offs on a fictional street. It does not predict conditions on your street and the options do not reflect changes proposed by the City of Edmonton.")}
              </p>
              <p className="text-base sm:text-lg text-gray-900 leading-snug font-bold">
                {t('intro_s1_body2', 'Parking is always a balance and there are no right or wrong answers. Allow 3 to 5 minutes')}
              </p>
            </div>

            <p className="text-sm sm:text-base text-gray-700 font-semibold flex items-start gap-2 bg-white/70 border border-emerald-200/60 p-3 rounded-xl">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <span>{t('intro_s1_privacy', 'Personal information is collected for decision-making under Section 4(c) of the Protection of Privacy Act (POPA).')}</span>
            </p>
          </section>

          {/* SECTION 2: Step 1 - Street Types & Parking Combinations */}
          <section id="civic-step-1" className="space-y-3.5 p-4 sm:p-5 rounded-2xl bg-amber-50/60 border border-amber-200/80 shadow-2xs scroll-mt-4">
            <div className="flex items-center gap-2">
              <span className="bg-[#D97706] text-white text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-2xs">
                {t('intro_step_label', 'Step')} 1
              </span>
              <span className="text-xs sm:text-sm font-bold text-gray-500">
                {t('intro_s2_subtitle', 'Each street has a different combination of:')}
              </span>
            </div>

            <div className="border-l-4 border-[#D97706] pl-3.5">
              <h3 className="text-lg sm:text-xl md:text-2xl font-black text-[#92400E] leading-tight">
                {t('intro_s2_title', 'Select the type of street you would like to explore.')}
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Private Parking */}
              <div className="bg-white/95 border-2 border-blue-200/90 rounded-xl p-3.5 sm:p-4 flex items-start gap-3 shadow-2xs">
                <div className="w-10 h-10 rounded-lg bg-[#004B8D] text-white flex items-center justify-center shrink-0 mt-0.5">
                  <Home className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div>
                  <h4 className="text-base sm:text-lg font-black text-[#004B8D]">
                    {t('intro_s2_private_title', 'Private Parking')}
                  </h4>
                  <p className="text-sm sm:text-base text-gray-900 leading-snug mt-1">
                    {t('intro_s2_private_desc', 'Some homes have parking in a garage, driveway or parking lot. Others have limited or no private parking.')}
                  </p>
                </div>
              </div>

              {/* Street Parking */}
              <div className="bg-white/95 border-2 border-amber-200/90 rounded-xl p-3.5 sm:p-4 flex items-start gap-3 shadow-2xs">
                <div className="w-10 h-10 rounded-lg bg-[#D97706] text-white flex items-center justify-center shrink-0 mt-0.5">
                  <Car className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div>
                  <h4 className="text-base sm:text-lg font-black text-amber-900">
                    {t('intro_s2_street_title', 'Street Parking')}
                  </h4>
                  <p className="text-sm sm:text-base text-gray-900 leading-snug mt-1">
                    {t('intro_s2_street_desc', 'Residents, visitors and service providers share the available street parking.')}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 3: Step 2 - See What Happens Live & Choose Your View */}
          <section id="civic-step-2" className="space-y-3.5 p-4 sm:p-5 rounded-2xl bg-indigo-50/60 border border-indigo-200/80 shadow-2xs scroll-mt-4">
            <div className="flex items-center gap-2">
              <span className="bg-[#4338CA] text-white text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-2xs">
                {t('intro_step_label', 'Step')} 2
              </span>
              <span className="text-xs sm:text-sm font-bold text-gray-500">
                {t('intro_s4_title', 'Choose Your Street Picture')}
              </span>
            </div>

            <div className="border-l-4 border-[#4338CA] pl-3.5 space-y-2">
              <h3 className="text-xl sm:text-2xl font-black text-[#3730A3] leading-tight">
                {t('intro_s3_title', 'Choose Your View')}
              </h3>
              <div className="space-y-2 pt-1 text-base text-gray-800 font-medium">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                  <span>{t('intro_s3_bullet1', 'Answer the questions and watch how your choices impact activity on the street.')}</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                  <span>{t('intro_s3_bullet2', 'Read the benefits and trade-offs related to each choice. You can go back and try different options.')}</span>
                </div>
              </div>
            </div>

            {/* View Selection Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* Moving Simulation */}
              <button
                type="button"
                onClick={() => {
                  triggerFeedback('button');
                  onToggleSimplifiedMode(false);
                }}
                className={`text-left p-3.5 rounded-xl border-2 transition-all cursor-pointer flex items-start gap-3 min-h-[56px] ${
                  !isSimplifiedMode
                    ? 'border-[#004B8D] bg-white shadow-md ring-2 ring-[#004B8D]/30'
                    : 'border-gray-300 bg-white/80 hover:border-gray-400'
                }`}
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                  !isSimplifiedMode ? 'bg-[#004B8D] text-white' : 'bg-gray-100 text-gray-600'
                }`}>
                  <Eye className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-black text-base text-gray-900">
                      {t('intro_s4_opt1_title', 'Animated View')}
                    </span>
                    {!isSimplifiedMode && (
                      <span className="text-xs font-black text-[#004B8D] bg-blue-50 border border-[#004B8D] px-2 py-0.5 rounded shrink-0">
                        {t('intro_s4_badge_selected', 'Selected ✓')}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-700 leading-snug mt-1">
                    {t('intro_s4_opt1_desc', 'Every time you answer a question, the street picture updates right away.')}
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
                className={`text-left p-3.5 rounded-xl border-2 transition-all cursor-pointer flex items-start gap-3 min-h-[56px] ${
                  isSimplifiedMode
                    ? 'border-[#004B8D] bg-white shadow-md ring-2 ring-[#004B8D]/30'
                    : 'border-gray-300 bg-white/80 hover:border-gray-400'
                }`}
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                  isSimplifiedMode ? 'bg-[#004B8D] text-white' : 'bg-gray-100 text-gray-600'
                }`}>
                  <ZapOff className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-black text-base text-gray-900">
                      {t('intro_s4_opt2_title', 'Still Picture')}
                    </span>
                    {isSimplifiedMode && (
                      <span className="text-xs font-black text-[#004B8D] bg-blue-50 border border-[#004B8D] px-2 py-0.5 rounded shrink-0">
                        {t('intro_s4_badge_selected', 'Selected ✓')}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-700 leading-snug mt-1">
                    {t('intro_s4_opt2_desc', 'Explore the same information without moving vehicles.')}
                  </p>
                </div>
              </button>
            </div>

            <p className="text-sm sm:text-base text-gray-600 italic">
              {t('intro_s4_switch_note', 'You can switch views anytime during the survey!')}
            </p>
          </section>

          {/* SECTION 4: Step 3 - Ready to Start */}
          <section id="civic-step-3" className="space-y-4 p-4 sm:p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200/90 shadow-2xs scroll-mt-4">
            <div className="flex items-center gap-2">
              <span className="bg-[#059669] text-white text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-2xs">
                {t('intro_step_label', 'Step')} 3
              </span>
              <span className="text-xs sm:text-sm font-bold text-gray-500">
                {t('intro_s5_subtitle', 'After answering all the questions, discover your parking profile and see a summary of your priorities.')}
              </span>
            </div>

            <div className="border-l-4 border-[#059669] pl-3.5">
              <h3 className="text-xl sm:text-2xl font-black text-emerald-950 leading-tight">
                {t('intro_s5_title', 'You Are Ready to Begin!')}
              </h3>
            </div>

            <div className="bg-white/95 border-2 border-emerald-200 rounded-xl p-3.5 sm:p-4 space-y-2.5 text-base sm:text-lg text-gray-900 font-semibold shadow-2xs">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>{t('intro_s5_point1', 'Set your neighbourhood and answer 6 quick parking questions.')}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>{t('intro_s5_point2', 'Go at your own speed. There is no rush.')}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>{t('intro_s5_point3', 'Click “How to Use” at the top to review these steps anytime.')}</span>
              </div>
            </div>

            <p className="text-base sm:text-lg text-gray-900 font-black">
              {t('intro_s5_thankyou', "Thank you for helping plan Edmonton's neighbourhood streets!")}
            </p>

            {/* Direct CTA card at bottom of scroll */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleFinish}
                className="w-full py-3 sm:py-3.5 px-6 bg-[#059669] hover:bg-[#047857] active:bg-[#065f46] text-white font-black text-lg sm:text-xl rounded-xl shadow-lg transition-all cursor-pointer min-h-[52px] flex items-center justify-center gap-2.5 border-2 border-emerald-600 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300"
              >
                <Sparkles className="w-5 h-5 text-[#FFC72C]" />
                <span>{t('intro_btn_start', 'Start Exploring')}</span>
                <ArrowRight className="w-5 h-5 stroke-[2.5]" />
              </button>
            </div>
          </section>
        </div>

        {/* Modal Bottom Footer Navigation Bar: Sticky & Always Visible */}
        <div className="bg-gray-100 px-3 sm:px-5 py-2.5 sm:py-3 border-t-2 border-gray-300 flex items-center justify-between shrink-0 gap-2">
          {/* Prominent Yellow Skip Intro button */}
          <button
            type="button"
            onClick={handleFinish}
            className="flex items-center gap-2 px-4 sm:px-5 py-2.5 bg-[#FFC72C] hover:bg-[#ffe066] active:bg-[#f5bc20] text-[#004B8D] font-black text-sm sm:text-base rounded-xl shadow-md transition-all cursor-pointer min-h-[46px] border-2 border-[#003566]/20 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#004B8D]"
            title={t('intro_btn_skip_title', 'Skip this guide and start the survey right now')}
            aria-label={t('intro_btn_skip_aria', 'Skip introduction and start survey')}
          >
            <FastForward className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
            <span className="font-black">{t('intro_btn_skip', 'Skip Intro')}</span>
          </button>

          {/* Sticky Start Survey Button */}
          <button
            ref={startButtonRef}
            type="button"
            onClick={handleFinish}
            className="px-6 sm:px-8 py-2.5 text-base sm:text-lg font-black bg-[#059669] hover:bg-[#047857] text-white rounded-xl shadow-md transition-all cursor-pointer min-h-[46px] flex items-center gap-2 active:scale-95 ring-2 ring-emerald-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFC72C]"
          >
            <span>{t('intro_btn_start', 'Start Exploring')}</span>
            <ArrowRight className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>
      </div>
    </div>
  );
};
