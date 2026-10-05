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
              <h2 id="civic-modal-title" className="text-base sm:text-xl font-black tracking-tight leading-tight truncate">
                {t('intro_header_title', 'Curbside Compass')}
              </h2>
              <p className="text-xs sm:text-sm text-blue-100 font-semibold leading-tight hidden xs:block">
                {t('intro_header_subtitle', 'City of Edmonton Guide')}
              </p>
            </div>
          </div>

          {/* Large, Prominent Skip Intro Button */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleFinish}
              className="flex items-center gap-2 px-3.5 sm:px-5 py-2 bg-[#FFC72C] hover:bg-[#ffe066] active:bg-[#f5bc20] text-[#004B8D] font-black text-sm sm:text-base rounded-xl shadow-md transition-all cursor-pointer min-h-[44px] border-2 border-[#003566]/20 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              title={t('intro_btn_skip_title', 'Skip this guide and start the survey right now')}
              aria-label={t('intro_btn_skip_aria', 'Skip introduction and start survey')}
            >
              <FastForward className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
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

        {/* Section Quick Jump Bar */}
        <div className="bg-gray-100 px-2 sm:px-4 py-1.5 border-b border-gray-300 flex items-center justify-between overflow-x-auto shrink-0 scrollbar-none gap-1 sm:gap-2">
          {[
            { id: 'civic-step-intro', step: 1, label: t('intro_step_1_label', 'Introduction') },
            { id: 'civic-step-1', step: 2, label: `${t('intro_step_label', 'Step')} 1: ${t('intro_s2_private_title', 'Street Types')}` },
            { id: 'civic-step-2', step: 3, label: `${t('intro_step_label', 'Step')} 2: ${t('intro_s4_title', 'Choose View')}` },
            { id: 'civic-step-3', step: 4, label: `${t('intro_step_label', 'Step')} 3: ${t('intro_s5_title', 'Ready')}` },
          ].map((item) => (
            <button
              key={item.step}
              type="button"
              onClick={() => scrollToSection(item.id, item.step)}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-black whitespace-nowrap transition-all cursor-pointer min-h-[36px] flex items-center gap-1.5 ${
                activeSection === item.step
                  ? 'bg-[#004B8D] text-white shadow-xs'
                  : 'bg-white text-gray-700 hover:bg-gray-200 border border-gray-300'
              }`}
              aria-label={`Jump to ${item.label}`}
            >
              <span>{item.label}</span>
              {activeSection > item.step && (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 inline shrink-0" />
              )}
            </button>
          ))}
        </div>

        {/* Combined One Long Scroll Body Area */}
        <div 
          ref={scrollContainerRef}
          className="p-4 sm:p-6 [@media(orientation:landscape)_and_(max-height:500px)]:p-3 flex-1 overflow-y-auto overscroll-contain text-gray-900 space-y-6 sm:space-y-8 divide-y divide-gray-200 scroll-smooth"
        >
          {/* SECTION 1: Welcome & Civic Purpose (Introduction) */}
          <section id="civic-step-intro" className="space-y-3 pt-1 scroll-mt-4">
            <div className="flex items-center gap-2">
              <span className="bg-[#004B8D] text-white text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                {t('intro_step_1_label', 'Introduction')}
              </span>
            </div>

            <div className="border-l-4 border-[#004B8D] pl-3.5">
              <h3 className="text-xl sm:text-2xl font-black text-[#004B8D] leading-tight">
                {t('intro_s1_title', 'Welcome to Curbside Compass!')}
              </h3>
              <p className="text-base sm:text-lg text-gray-700 font-bold mt-1">
                {t('intro_s1_subtitle', 'A City of Edmonton Public Survey')}
              </p>
            </div>

            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-3.5 sm:p-4 space-y-1.5">
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
          </section>

          {/* SECTION 2: Step 1 - Street Types & Parking Combinations */}
          <section id="civic-step-1" className="space-y-3.5 pt-6 scroll-mt-4">
            <div className="flex items-center gap-2">
              <span className="bg-[#004B8D] text-white text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                {t('intro_step_label', 'Step')} 1
              </span>
              <span className="text-xs sm:text-sm font-bold text-gray-500">
                {t('intro_s2_subtitle', 'Each street has a different combination of:')}
              </span>
            </div>

            <div className="border-l-4 border-[#004B8D] pl-3.5">
              <h3 className="text-lg sm:text-xl md:text-2xl font-black text-[#004B8D] leading-tight">
                {t('intro_s2_title', 'Select the type of street you would like to explore.')}
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Private Parking */}
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-3.5 sm:p-4 flex items-start gap-3 shadow-2xs">
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
              <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-3.5 sm:p-4 flex items-start gap-3 shadow-2xs">
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
          <section id="civic-step-2" className="space-y-3.5 pt-6 scroll-mt-4">
            <div className="flex items-center gap-2">
              <span className="bg-[#004B8D] text-white text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                {t('intro_step_label', 'Step')} 2
              </span>
              <span className="text-xs sm:text-sm font-bold text-gray-500">
                {t('intro_s4_title', 'Choose Your Street Picture')}
              </span>
            </div>

            <div className="border-l-4 border-[#004B8D] pl-3.5">
              <h3 className="text-xl sm:text-2xl font-black text-[#004B8D] leading-tight">
                {t('intro_s3_title', 'See What Happens Live')}
              </h3>
              <p className="text-base text-gray-700 font-semibold mt-0.5">
                {t('intro_s3_body1', 'Every time you answer a question, the street picture updates right away.')}
              </p>
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
                    ? 'border-[#004B8D] bg-blue-50 shadow-md ring-2 ring-[#004B8D]/30'
                    : 'border-gray-300 bg-white hover:border-gray-400'
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
                      {t('intro_s4_opt1_title', 'Moving Street Picture')}
                    </span>
                    {!isSimplifiedMode && (
                      <span className="text-xs font-black text-[#004B8D] bg-white border border-[#004B8D] px-2 py-0.5 rounded shrink-0">
                        {t('intro_s4_badge_selected', 'Selected ✓')}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-700 leading-snug mt-1">
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
                className={`text-left p-3.5 rounded-xl border-2 transition-all cursor-pointer flex items-start gap-3 min-h-[56px] ${
                  isSimplifiedMode
                    ? 'border-[#004B8D] bg-blue-50 shadow-md ring-2 ring-[#004B8D]/30'
                    : 'border-gray-300 bg-white hover:border-gray-400'
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
                      {t('intro_s4_opt2_title', 'Still Picture (No Motion)')}
                    </span>
                    {isSimplifiedMode && (
                      <span className="text-xs font-black text-[#004B8D] bg-white border border-[#004B8D] px-2 py-0.5 rounded shrink-0">
                        {t('intro_s4_badge_selected', 'Selected ✓')}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-700 leading-snug mt-1">
                    {t('intro_s4_opt2_desc', 'A calm screen with clear numbers and no moving cars.')}
                  </p>
                </div>
              </button>
            </div>

            <p className="text-sm sm:text-base text-gray-600 italic">
              {t('intro_s4_switch_note', 'You can switch views anytime during the survey!')}
            </p>
          </section>

          {/* SECTION 4: Step 3 - Ready to Start */}
          <section id="civic-step-3" className="space-y-4 pt-6 pb-2 scroll-mt-4">
            <div className="flex items-center gap-2">
              <span className="bg-[#059669] text-white text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                {t('intro_step_label', 'Step')} 3
              </span>
              <span className="text-xs sm:text-sm font-bold text-gray-500">
                {t('intro_s5_subtitle', 'Just 3 things to remember:')}
              </span>
            </div>

            <div className="border-l-4 border-[#059669] pl-3.5">
              <h3 className="text-xl sm:text-2xl font-black text-gray-900 leading-tight">
                {t('intro_s5_title', 'You Are Ready to Begin!')}
              </h3>
            </div>

            <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-3.5 sm:p-4 space-y-2.5 text-base sm:text-lg text-gray-900 font-semibold">
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
                <span>{t('intro_s5_point3', 'Click "How It Works" at the top if you need this guide again.')}</span>
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
                <span>{t('intro_btn_start', 'Start Survey')}</span>
                <ArrowRight className="w-5 h-5 stroke-[2.5]" />
              </button>
            </div>
          </section>
        </div>

        {/* Modal Bottom Footer Navigation Bar: Sticky & Always Visible */}
        <div className="bg-gray-100 px-3 sm:px-5 py-2.5 sm:py-3 border-t-2 border-gray-300 flex items-center justify-between shrink-0 gap-2">
          {/* Close / Skip button */}
          <button
            type="button"
            onClick={handleFinish}
            className="px-4 py-2 text-sm sm:text-base font-bold text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-xl transition-all cursor-pointer min-h-[46px]"
          >
            {t('intro_btn_skip', 'Skip Intro')}
          </button>

          {/* Sticky Start Survey Button */}
          <button
            ref={startButtonRef}
            type="button"
            onClick={handleFinish}
            className="px-6 sm:px-8 py-2.5 text-base sm:text-lg font-black bg-[#059669] hover:bg-[#047857] text-white rounded-xl shadow-md transition-all cursor-pointer min-h-[46px] flex items-center gap-2 active:scale-95 ring-2 ring-emerald-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFC72C]"
          >
            <span>{t('intro_btn_start', 'Start Survey')}</span>
            <ArrowRight className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>
      </div>
    </div>
  );
};
