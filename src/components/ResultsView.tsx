import React, { useState } from 'react';
import { PersonaResult, SimulationConfig } from '../types';
import { Award, Target, CheckCircle, ChevronRight, Compass, AlertTriangle, Check } from 'lucide-react';
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
  onOpenPersonaMerger?: () => void;
}

const ResultsViewComponent: React.FC<ResultsViewProps> = ({
  persona,
  totalX,
  totalY,
  config,
  answers = {},
  onRetake,
  onOpenPersonaMerger
}) => {
  const { t } = useAppText();
  const [rating, setRating] = useState<number | null>(null);
  const [ratingError, setRatingError] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<string>('');
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

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

  // Unified Results View: Profile, Compass, Outcomes, and Feedback
  return (
    <div className="w-full max-w-4xl mx-auto h-full flex flex-col justify-between gap-2 p-2 sm:p-3 overflow-y-auto">
      
      {/* Merged Curbside Compass Result & Outcomes Container */}
      <div className="bg-white border border-gray-200 rounded-xl p-3 sm:p-4 shadow-xs flex flex-col gap-3 flex-shrink-0">
        <h3 className="text-[10pt] font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5 border-b border-gray-100 pb-2">
          <Compass className="w-4 h-4 text-[#0081BC]" />
          {t('results_compass_result_title', 'Your Resident Profile Result')}
        </h3>

        {/* Persona Profile Header */}
        <div className="bg-blue-50/80 border border-blue-100 rounded-lg p-2.5 sm:p-3 flex flex-col gap-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-md flex items-center justify-center text-white shadow-xs flex-shrink-0" style={{ backgroundColor: persona.badgeColor }}>
                <Award className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-[#005087] leading-tight text-[18pt] block">
                  {persona.title}
                </span>
                <span className="text-xs font-semibold text-gray-500">
                  {persona.quadrant === 'Q1' && 'Q1 - User-Paid & Regulated'}
                  {persona.quadrant === 'Q2' && 'Q2 - Taxpayer-Funded & Regulated'}
                  {persona.quadrant === 'Q3' && 'Q3 - Taxpayer-Funded & Open Access'}
                  {persona.quadrant === 'Q4' && 'Q4 - User-Paid & Open Access'}
                </span>
              </div>
            </div>
          </div>



          <p className="text-[11pt] text-gray-800 leading-normal">
            {persona.description}
          </p>
        </div>

        {/* Policy Compass Graph (Positioned just under the resident profile header) */}
        <div className="bg-slate-50/50 border border-gray-200 rounded-xl p-2 sm:p-3 shadow-xs w-full flex flex-col items-center justify-center h-[340px] sm:h-[400px] max-h-[50dvh]">
          <PolicyCompassGraph persona={persona} totalX={totalX} totalY={totalY} />
        </div>

        {/* Two Column Priorities & Parking Program Trade-off Outcomes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 items-stretch">
          {/* Left Column: You Prioritize */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-3 flex flex-col justify-center">
            <h4 className="text-[10pt] font-bold uppercase tracking-wider text-gray-600 mb-1.5">
              {t('results_you_believe_title', 'You Prioritize')}
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

          {/* Right Column: Parking Program Trade-off Outcomes */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-3 flex flex-col justify-center">
            <div className="flex items-center gap-1.5 mb-1.5">
              <div className="w-5 h-5 rounded-md bg-[#0081BC]/10 flex items-center justify-center flex-shrink-0">
                <Target className="w-3.5 h-3.5 text-[#0081BC]" />
              </div>
              <h3 className="text-[10pt] font-bold uppercase tracking-wider text-[#004B8D] truncate">
                {t('results_tradeoff_outcomes_title', t('results_parking_program_outcomes_title', 'Trade-off Outcomes'))}
              </h3>
            </div>
            <p className="text-[10.5pt] text-gray-700 leading-normal bg-white p-2.5 rounded-md border border-slate-200/80">
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
              {t('results_privacy_hint', 'Feedback is collected for the purpose of redesigning the Residential Parking Program and managing parking and curbside space.')}
            </p>
          )}
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="pt-2 border-t border-gray-200 flex items-center justify-end gap-2.5 mt-auto flex-shrink-0">

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
