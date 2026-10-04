import React, { useState } from 'react';
import { PersonaResult, SimulationConfig } from '../types';
import { Award, Target, CheckCircle, ChevronRight, Compass, Share2, AlertTriangle, Printer, RotateCcw, Check } from 'lucide-react';
import { ThankYouView } from './ThankYouView';
import { PolicyCompassGraph } from './PolicyCompassGraph';
import { triggerFeedback } from '../utils/feedback';
import { useAppText } from '../context/TextContentContext';
import { saveSurveyResponse } from '../services/firebaseService';
import { detectPII, sanitizeOpenTextInput } from '../utils/securitySanitizer';

interface ResultsViewProps {
  persona: PersonaResult;
  totalX: number;
  totalY: number;
  config: SimulationConfig;
  answers?: Record<string, string>;
  onRetake?: () => void;
}

const ResultsViewComponent: React.FC<ResultsViewProps> = ({
  persona,
  totalX,
  totalY,
  config,
  answers = {},
  onRetake
}) => {
  const { t } = useAppText();
  const [rating, setRating] = useState<number | null>(null);
  const [ratingError, setRatingError] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<string>('');
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [copied, setCopied] = useState<boolean>(false);

  // Auto-save survey results to Firestore on initial render of ResultsView
  React.useEffect(() => {
    saveSurveyResponse({
      persona,
      totalX,
      totalY,
      answers,
      simConfig: config
    }).catch(err => {
      console.warn('[Firebase] Initial auto-save notice:', err);
    });
  }, [persona, totalX, totalY, answers, config]);

  const handleSubmitFeedback = async () => {
    if (rating === null) {
      setRatingError(true);
      triggerFeedback('button');
      const el = document.getElementById('feedback-rating-group');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }
    setRatingError(false);
    triggerFeedback('submit');
    setIsSaving(true);
    try {
      // Defense-in-depth sanitization: strips control chars, formula injection prefixes, and auto-redacts PII
      const sanitized = sanitizeOpenTextInput(feedback, 500, true);
      await saveSurveyResponse({
        persona,
        totalX,
        totalY,
        answers,
        simConfig: config,
        rating,
        feedback: sanitized
      });
    } catch (err) {
      console.warn('[Firebase] Error saving feedback:', err);
    } finally {
      setIsSaving(false);
      setSubmitted(true);
    }
  };

  if (submitted) {
    return (
      <ThankYouView
        persona={persona}
        config={config}
        answers={answers}
        totalX={totalX}
        totalY={totalY}
        onViewResults={() => setSubmitted(false)}
        onRetake={onRetake}
      />
    );
  }

  // Step 1: Persona Identity
  if (step === 1) {
    const handleShare = async () => {
      triggerFeedback('button');
      const shareUrl = typeof window !== 'undefined' ? window.location.origin : 'https://curbside-compass.edmonton.ca';
      const imageUrl = `${shareUrl}/CurbsideCompass_Social_Media_IMG.jpg`;
      const priorities = (persona.keyPriorities || []).map(p => `• ${p}`).join('\n');
      const fullText = [
        `I took Edmonton's Curbside Compass public engagement tool and got "${persona.title}"!`,
        config.neighbourhoodName ? `📍 Neighbourhood: ${config.neighbourhoodName}` : '',
        priorities ? `\nKey Priorities:\n${priorities}` : '',
        `\n🖼️ Screen Image: ${imageUrl}`,
        `🔗 Find your persona and have your say: ${shareUrl}`,
        `\n#YEGcurbside #Edmonton #YEGtraffic #CurbsideCompass`
      ].filter(Boolean).join('\n');

      const shareData = {
        title: 'Curbside Compass',
        text: fullText,
        url: shareUrl,
      };
      
      if (navigator.share) {
        try {
          await navigator.share(shareData);
        } catch {
          // Fallback or user canceled share
        }
      } else {
        try {
          if (navigator.clipboard) {
            await navigator.clipboard.writeText(fullText);
          }
          setCopied(true);
          setTimeout(() => setCopied(false), 2500);
        } catch {
          setCopied(true);
          setTimeout(() => setCopied(false), 2500);
        }
      }
    };

    return (
      <div className="w-full max-w-4xl mx-auto h-full flex flex-col justify-between p-2 sm:p-4 overflow-y-auto">
        {/* Header with Share & Print Controls */}
        <div className="flex justify-between items-center mb-1 sm:mb-2 flex-shrink-0">
          <span className="text-[10pt] font-extrabold uppercase tracking-wider text-gray-500">
            {t('results_stage_tag', 'Resident Profile')}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              aria-label={t('results_print_summary_aria', 'Print or save summary PDF')}
              className="flex items-center gap-1.5 px-3 py-2 border transition-colors rounded-lg font-bold text-xs sm:text-sm active:scale-95 cursor-pointer bg-white text-gray-700 border-gray-300 hover:bg-gray-100 min-h-[44px]"
            >
              <Printer className="w-4 h-4 text-gray-600" />
              <span className="hidden xs:inline">{t('results_print_btn', 'Print')}</span>
            </button>

            <button
              onClick={handleShare}
              className={`flex items-center gap-1.5 px-3.5 py-2 border transition-colors rounded-lg font-bold text-xs sm:text-sm active:scale-95 cursor-pointer min-h-[44px] ${
                copied
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                  : 'bg-blue-50 text-[#004B8D] border-blue-200 hover:bg-[#004B8D] hover:text-white'
              }`}
            >
              {copied ? (
                <>
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>{t('results_link_copied', 'Link Copied!')}</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4" />
                  <span>{t('results_share_btn', 'Share Persona')}</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="flex-grow flex flex-col gap-2 sm:gap-2.5 min-h-0">
          {/* Policy Compass Graph */}
          <div className="bg-white border border-gray-200 rounded-xl p-1.5 sm:p-3 shadow-xs h-[28vh] max-h-[240px] min-h-[160px] [@media(orientation:landscape)_and_(max-height:540px)]:h-[48vh] [@media(orientation:landscape)_and_(max-height:540px)]:max-h-[180px] [@media(orientation:landscape)_and_(max-height:540px)]:min-h-[140px] sm:h-[34vh] sm:max-h-[290px] flex flex-col items-center justify-center flex-shrink-0">
            <PolicyCompassGraph persona={persona} totalX={totalX} totalY={totalY} />
          </div>

          {/* Persona Info */}
          <div className="bg-white border border-gray-200 rounded-xl p-3 sm:p-4 shadow-xs flex-1 flex flex-col justify-center min-h-0">
            <div className="flex items-center gap-2.5 mb-2 flex-shrink-0">
              <div
                className="w-9 h-9 sm:w-11 sm:h-11 rounded-lg flex items-center justify-center text-white shadow-xs flex-shrink-0"
                style={{ backgroundColor: persona.badgeColor }}
              >
                <Award className="w-6 h-6" />
              </div>
              <h2 className="text-[18pt] sm:text-[22pt] font-black text-gray-900 leading-tight">
                {persona.title}
              </h2>
            </div>
            <p className="text-[11pt] font-medium text-gray-800 leading-relaxed overflow-y-auto">
              {persona.description}
            </p>
          </div>
        </div>

        {/* Next Button Footer - Accessible 48px min touch target */}
        <div className="mt-2 flex items-center justify-between flex-shrink-0">
          {onRetake ? (
            <button
              type="button"
              onClick={onRetake}
              className="px-4 py-2.5 border border-gray-300 bg-white hover:bg-gray-100 text-gray-700 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-colors cursor-pointer min-h-[48px] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#004B8D]"
              title={t('results_retake_title', 'Retake survey and adjust your answers')}
            >
              <RotateCcw className="w-4 h-4 text-gray-500" />
              <span>{t('results_retake_btn', 'Retake Survey')}</span>
            </button>
          ) : <div />}
          <button
            onClick={() => setStep(2)}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-[#004B8D] text-white rounded-xl font-bold shadow hover:bg-[#003866] transition-colors active:scale-95 text-sm sm:text-base min-h-[48px] min-w-[48px] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#004B8D]"
          >
            <span>{t('results_next_feedback', 'Next: Share Feedback')}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // Step 2: Policy Details & Feedback
  return (
    <div className="w-full max-w-4xl mx-auto h-full flex flex-col justify-between gap-2 p-2 sm:p-3 overflow-y-auto">
      
      {/* Compass Result Section at the very top */}
      <div className="bg-white border border-gray-200 rounded-xl p-2.5 sm:p-3 shadow-xs flex-shrink-0">
        <h3 className="text-[10pt] font-bold uppercase tracking-wider text-gray-500 mb-1 flex items-center gap-1.5">
          <Compass className="w-4 h-4 text-[#0081BC]" />
          {t('results_compass_result_title', 'Your Curbside Compass Result')}
        </h3>
        <div className="bg-blue-50/80 border border-blue-100 rounded-lg p-2.5 sm:p-3 flex flex-col gap-1.5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md flex items-center justify-center text-white shadow-xs flex-shrink-0" style={{ backgroundColor: persona.badgeColor }}>
              <Award className="w-5 h-5" />
            </div>
            <span className="font-bold text-[#005087] leading-tight text-[18pt]">
              {persona.title}
            </span>
          </div>
          <p className="text-[11pt] text-gray-800 leading-normal">
            {persona.description}
          </p>
        </div>
      </div>

      {/* Two Column Priorities & Parking Program Trade-off Outcomes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 items-stretch flex-shrink-0">
        
        {/* Left Column: You Believe */}
        <div className="flex flex-col">
          <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-xs flex flex-col h-full justify-center">
            <h4 className="text-[10pt] font-bold uppercase tracking-wider text-gray-600 mb-1.5">
              {t('results_you_believe_title', 'You Believe')}
            </h4>
            <ul className="space-y-1.5 text-[11pt] text-gray-800 w-full px-0.5">
              {persona.keyPriorities.map((priority, idx) => (
                <li key={idx} className="flex items-start gap-2 leading-normal">
                  <CheckCircle className="w-4 h-4 text-[#009A44] flex-shrink-0 mt-0.5" />
                  <span>{priority}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Column: Parking Program Trade-off Outcomes */}
        <div className="flex flex-col">
          <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-xs flex flex-col h-full justify-center">
            <div className="flex items-center gap-1.5 mb-1.5">
              <div className="w-6 h-6 rounded-md bg-[#0081BC]/10 flex items-center justify-center flex-shrink-0">
                <Target className="w-3.5 h-3.5 text-[#0081BC]" />
              </div>
              <h3 className="text-[10pt] font-bold uppercase tracking-wider text-[#004B8D] truncate">
                {t('results_tradeoff_outcomes_title', t('results_parking_program_outcomes_title', 'Parking Program Trade-off Outcomes'))}
              </h3>
            </div>
            <p className="text-[11pt] text-gray-700 leading-normal bg-gray-50 p-2.5 rounded-lg border border-gray-200">
              {persona.outcome || persona.description}
            </p>
          </div>
        </div>
        
      </div>

      {/* Feedback Section */}
      <div className="bg-white border border-gray-200 rounded-xl p-2.5 sm:p-3 shadow-xs flex-shrink-0">
        <div 
          id="feedback-rating-group"
          className={`rounded-lg p-2.5 sm:p-3 flex flex-col transition-all duration-200 border-2 ${
            ratingError && rating === null
              ? 'bg-red-50/70 border-red-500 ring-2 ring-red-200'
              : 'bg-[#193A5A]/5 border-[#004B8D]/20'
          }`}
        >
          <div className="flex items-center justify-between gap-2 mb-2">
            <label className="block text-[11pt] font-bold text-[#004B8D] leading-snug">
              {t('results_feedback_prompt', 'Do you feel this represents your view on neighbourhood parking?')}
              <span className="text-red-600 ml-1.5 text-xs font-black inline-flex items-center" title="Required to finish">
                * (Required)
              </span>
            </label>
            {rating !== null && (
              <span className="text-xs font-bold text-emerald-700 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full flex items-center gap-1 flex-shrink-0">
                <Check className="w-3 h-3" /> {t('results_answered_badge', 'Answered')}
              </span>
            )}
          </div>
          
          <div className="flex items-center justify-between gap-1 sm:gap-2 mb-1.5">
            {[1, 2, 3, 4, 5].map((val) => {
              const isSelected = rating === val;
              return (
                <button
                  key={val}
                  type="button"
                  onClick={() => {
                    triggerFeedback('choice');
                    setRating(val);
                    if (ratingError) setRatingError(false);
                  }}
                  className={`flex-1 min-h-[44px] min-w-[40px] py-1.5 rounded-xl text-[11pt] font-bold transition-all cursor-pointer border-2 flex items-center justify-center active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#004B8D] ${
                    isSelected
                      ? 'bg-[#004B8D] text-white border-[#004B8D] shadow-xs ring-1 ring-[#004B8D]'
                      : ratingError && rating === null
                      ? 'bg-white text-gray-800 hover:bg-red-50 border-red-400'
                      : 'bg-white text-gray-800 hover:bg-blue-50 hover:border-blue-300 border-gray-300'
                  }`}
                  title={`Rating: ${val}`}
                  aria-label={`Rate ${val} out of 5`}
                >
                  {val}
                </button>
              );
            })}
          </div>
          <div className="flex justify-between text-[10pt] text-gray-600 font-semibold px-0.5 mb-2">
            <span>{t('results_scale_1', '1 - Strongly Disagree')}</span>
            <span>{t('results_scale_5', '5 - Strongly Agree')}</span>
          </div>

          {ratingError && rating === null && (
            <div className="mb-2 p-2 bg-red-100/90 border border-red-300 rounded-lg text-xs font-bold text-red-800 flex items-center gap-1.5 animate-fadeIn">
              <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <span>Please select a rating (1 to 5) above to indicate your view. This question is required.</span>
            </div>
          )}
          
          <div className="flex items-center justify-between text-xs mb-1 pt-1 border-t border-gray-200/60">
            <label htmlFor="why-feedback" className="font-bold text-gray-800 text-[11pt]">
              {t('results_why_label', 'Why or why not?')} <span className="text-gray-500 font-normal text-xs">(Optional)</span>
            </label>
            <span className={`text-[10pt] sm:text-xs font-semibold ${500 - feedback.length < 50 ? 'text-amber-700 font-bold' : 'text-gray-500'}`}>
              {500 - feedback.length} left
            </span>
          </div>
          <textarea
            id="why-feedback"
            value={feedback}
            onChange={(e) => {
              // Strip ASCII control characters and BiDi Trojan Source overrides while keeping standard multiline input
              const raw = e.target.value.slice(0, 500).replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F\u202A-\u202E\u2066-\u2069\u200B-\u200D\uFEFF]/g, '');
              setFeedback(raw);
            }}
            maxLength={500}
            rows={2}
            placeholder={t('results_why_placeholder', 'Share your thoughts with City of Edmonton planners (optional)...')}
            className={`w-full text-[11pt] text-gray-800 p-2.5 border rounded-lg focus:outline-none focus:ring-2 resize-none bg-white leading-normal placeholder:text-gray-400 min-h-[52px] ${
              detectPII(feedback).hasPII 
                ? 'border-amber-400 focus:ring-amber-500 focus:border-amber-500' 
                : 'border-gray-300 focus:ring-[#0081BC] focus:border-[#0081BC]'
            }`}
          />
          {detectPII(feedback).hasPII ? (
            <div className="mt-1 p-2 bg-amber-50 border border-amber-300 rounded-md text-xs sm:text-sm text-amber-900 flex items-start gap-1.5 leading-snug animate-fadeIn">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <span>
                {detectPII(feedback).warningMessage || 'Privacy Notice: Please remove phone numbers or email addresses before submitting.'}
              </span>
            </div>
          ) : (
            <p className="text-[10pt] sm:text-xs text-gray-500 mt-1">
              {t('results_privacy_hint', 'Feedback is collected for planning research. Please do not include personal contact details, phone numbers, or full names.')}
            </p>
          )}
        </div>
      </div>

      {/* Navigation Footer for Step 2 */}
      <div className="pt-2 border-t border-gray-200 flex items-center justify-between gap-2.5 mt-auto flex-shrink-0">
        <button
          type="button"
          onClick={() => {
            triggerFeedback('button');
            setStep(1);
          }}
          className="px-4 py-2.5 border border-gray-300 bg-white hover:bg-gray-100 text-gray-700 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-colors cursor-pointer min-h-[48px] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#004B8D]"
        >
          <ChevronRight className="w-4 h-4 rotate-180" />
          {t('results_back_to_compass', 'Back to Compass')}
        </button>

        <div className="flex items-center gap-2">
          {submitted ? (
            <span className="text-xs font-bold text-[#007a36] flex items-center gap-1">
              <CheckCircle className="w-4 h-4 text-[#009A44]" />
              {t('results_feedback_saved', 'Feedback Saved')}
            </span>
          ) : rating ? (
            <span className="text-[10pt] sm:text-xs text-gray-500 hidden xs:inline">
              Rating: {rating}/5
            </span>
          ) : null}

          <button
            type="button"
            id="submit-feedback"
            disabled={isSaving}
            onClick={handleSubmitFeedback}
            className="px-5 py-2.5 bg-[#004B8D] hover:bg-[#003866] disabled:opacity-70 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer min-h-[48px] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#004B8D]"
          >
            <span>{isSaving ? 'Saving...' : submitted ? t('results_view_summary', 'View Summary') : t('results_finish_share', 'Finish & Share')}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export const ResultsView = React.memo(ResultsViewComponent);
