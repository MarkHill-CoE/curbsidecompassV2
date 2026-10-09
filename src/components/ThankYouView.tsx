import React, { useState } from 'react';
import { PersonaResult, SimulationConfig } from '../types';
import {
  CheckCircle,
  Share2,
  Facebook,
  Twitter,
  Instagram,
  Copy,
  Check,
  ArrowLeft,
  RotateCcw,
  User,
  Users,
  Download
} from 'lucide-react';
import { triggerFeedback } from '../utils/feedback';
import { useAppText } from '../context/TextContentContext';
import { trackFunnelStep } from '../lib/analytics';

interface ThankYouViewProps {
  persona: PersonaResult;
  config: SimulationConfig;
  answers?: Record<string, string>;
  totalX?: number;
  totalY?: number;
  onViewResults: () => void;
  onRetake?: () => void;
}

function formatUserSelections(answers: Record<string, string> = {}, config: SimulationConfig): string[] {
  const selections: string[] = [];

  if (config.neighbourhoodName) {
    selections.push(`Neighbourhood: ${config.neighbourhoodName}`);
  }

  // Q1: Program Funding
  if (answers['q1'] === 'q1_a') {
    selections.push('Funding: User-pay permits & fees cover program costs');
  } else if (answers['q1'] === 'q1_b') {
    selections.push('Funding: General property taxes (free street parking for all)');
  } else if (config.curbsideFeeModel) {
    selections.push(`Funding: ${config.curbsideFeeModel === 'free' ? 'Free on-street parking' : 'User-pay permits & fees'}`);
  }

  // Q2: Walking Distance / Proximity to Home
  if (answers['q2'] === 'q2_a') {
    selections.push('Distance: Within immediate block');
  } else if (answers['q2'] === 'q2_b') {
    selections.push('Distance: Within 2-3 blocks');
  }

  // Q3: Permit Limits
  if (answers['q3'] === 'q3_a') {
    selections.push('Permit Limits: Cap permits at 2 per home in high-demand zones');
  } else if (answers['q3'] === 'q3_b') {
    selections.push('Permit Limits: Unlimited permits per household');
  }

  // Q4: Visitor & Service Provider Access (cleaners & contractors)
  if (answers['q4'] === 'q4_a') {
    selections.push('Visitor Access: Equal opportunity for visitors & trades to park');
  } else if (answers['q4'] === 'q4_b') {
    selections.push('Visitor Access: Prioritize street parking for residents');
  }

  // Q5: Hospital & Event Venue Traffic
  if (answers['q5'] === 'q5_a') {
    selections.push('Venue/Hospital Parking: Allow nearby street parking for visitors');
  } else if (answers['q5'] === 'q5_b') {
    selections.push('Venue/Hospital Parking: Protect local residential parking');
  }

  // Q6: Private Parking Equity
  if (answers['q6'] === 'q6_a') {
    selections.push('Parking Equity: Priority permits for homes without private parking');
  } else if (answers['q6'] === 'q6_b') {
    selections.push('Parking Equity: Equal eligibility regardless of private driveway/garage');
  }

  if (config.enforcementLevel && selections.length < 3) {
    selections.push(`Enforcement: ${config.enforcementLevel.charAt(0).toUpperCase() + config.enforcementLevel.slice(1)}`);
  }

  return selections;
}

const ThankYouViewComponent: React.FC<ThankYouViewProps> = ({
  persona,
  config,
  answers = {},
  onViewResults,
  onRetake
}) => {
  const { t } = useAppText();
  const [shareMode, setShareMode] = useState<'with_persona' | 'general'>('with_persona');
  const [copied, setCopied] = useState<boolean>(false);
  const [platformNotice, setPlatformNotice] = useState<string | null>(null);

  React.useEffect(() => {
    trackFunnelStep(5, 'thank_you_view', { persona: persona.title });
  }, [persona.title]);

  const curbsideSocialImg = '/CurbsideCompass_Social_Media_IMG.jpg';

  const defaultAppUrl = 'https://curbsidecompass-v-2.replit.app/';
  const shareUrl = typeof window !== 'undefined' && window.location.origin && window.location.origin !== 'null' 
    ? window.location.origin 
    : defaultAppUrl;
  const imageUrl = typeof window !== 'undefined' ? `${window.location.origin}${curbsideSocialImg}` : `${defaultAppUrl}${curbsideSocialImg}`;

  const userSelections = formatUserSelections(answers, config);
  const priorities = (persona.keyPriorities || []).map(p => `• ${p}`);

  const shareTextWithPersona = [
    `Help Shape Edmonton's Neighborhood Streets`,
    `How should local parking and curbside spaces be balanced? Explore the City's Curbside Compass interactive tool, a street model to visualize potential tradeoffs and share your input directly.`,
    ``,
    `🎯 My Policy Profile: "${persona.title}"`,
    config.neighbourhoodName ? `📍 Typology: ${config.neighbourhoodName}` : null,
    ``,
    `My Curbside Selections:`,
    ...userSelections.map(s => `• ${s}`),
    ``,
    priorities.length > 0 ? `Key Priorities:\n${priorities.join('\n')}\n` : null,
    `Explore Curbside Compass Today : ${shareUrl}`,
    ``,
    `#YEG #YEGtraffic #CurbsideCompass`
  ].filter(line => line !== null).join('\n');

  const shareTextGeneral = [
    `Help Shape Edmonton's Neighborhood Streets`,
    `How should local parking and curbside spaces be balanced? Explore the City's Curbside Compass interactive tool, a street model to visualize potential tradeoffs and share your input directly.`,
    `Explore Curbside Compass Today : ${shareUrl}`,
    `#YEG #YEGtraffic #CurbsideCompass`
  ].join('\n');

  const fullShareText = shareMode === 'with_persona' ? shareTextWithPersona : shareTextGeneral;

  const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
  const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(fullShareText)}`;
  const instagramUrl = 'https://www.instagram.com/';

  const handleCopyLink = async () => {
    triggerFeedback('button');
    trackFunnelStep(6, 'copy_full_post_text', { share_mode: shareMode });
    try {
      if (navigator.clipboard) {
        // Attempt rich HTML + plain text copy for destinations that support embedded image pastes
        if (typeof ClipboardItem !== 'undefined') {
          try {
            const htmlFormatted = shareMode === 'with_persona' ? `
              <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 14px; line-height: 1.5; color: #1e293b;">
                <p style="font-size: 16px; font-weight: bold; color: #004B8D;">Help Shape Edmonton's Neighborhood Streets</p>
                <p>How should local parking and curbside spaces be balanced? Explore the City's Curbside Compass interactive tool, a street model to visualize potential tradeoffs and share your input directly.</p>
                <p style="font-size: 15px; color: #004B8D;"><strong>🎯 My Policy Profile: ${persona.title}</strong></p>
                ${config.neighbourhoodName ? `<p>📍 <em>Neighbourhood: ${config.neighbourhoodName}</em></p>` : ''}
                <p><strong>My Curbside Selections:</strong><br/>
                ${userSelections.map(s => `• ${s}`).join('<br/>')}
                </p>
                ${priorities.length > 0 ? `<p><strong>Key Priorities:</strong><br/>${priorities.join('<br/>')}</p>` : ''}
                <p><img src="${imageUrl}" alt="Curbside Compass Screen Image" style="max-width: 100%; width: 560px; height: auto; border-radius: 8px; border: 1px solid #cbd5e1; display: block; margin: 12px 0;" /></p>
                <p><strong>Explore Curbside Compass Today :</strong> <a href="${shareUrl}" style="color: #0081BC; font-weight: bold;">${shareUrl}</a></p>
                <p style="color: #64748b; font-size: 12px;">#YEG #YEGtraffic #CurbsideCompass</p>
              </div>
            `.trim() : `
              <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 14px; line-height: 1.5; color: #1e293b;">
                <p style="font-size: 16px; font-weight: bold; color: #004B8D;">Help Shape Edmonton's Neighborhood Streets</p>
                <p>How should local parking and curbside spaces be balanced? Explore the City's Curbside Compass interactive tool, a street model to visualize potential tradeoffs and share your input directly.</p>
                <p><img src="${imageUrl}" alt="Curbside Compass Screen Image" style="max-width: 100%; width: 560px; height: auto; border-radius: 8px; border: 1px solid #cbd5e1; display: block; margin: 12px 0;" /></p>
                <p><strong>Explore Curbside Compass Today :</strong> <a href="${shareUrl}" style="color: #0081BC; font-weight: bold;">${shareUrl}</a></p>
                <p style="color: #64748b; font-size: 12px;">#YEG #YEGtraffic #CurbsideCompass</p>
              </div>
            `.trim();

            const textBlob = new Blob([fullShareText], { type: 'text/plain' });
            const htmlBlob = new Blob([htmlFormatted], { type: 'text/html' });
            await navigator.clipboard.write([
              new ClipboardItem({
                'text/plain': textBlob,
                'text/html': htmlBlob,
              })
            ]);
            setCopied(true);
            setTimeout(() => setCopied(false), 3000);
            return;
          } catch {
            // Fallback to writeText below
          }
        }

        await navigator.clipboard.writeText(fullShareText);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      }
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };


  const handlePlatformClick = async (platform: string) => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(fullShareText);
      }
    } catch {
      // ignore
    }
    setPlatformNotice(platform);
    setTimeout(() => setPlatformNotice(null), 5000);
  };

  return (
    <div className="w-full h-full flex flex-col justify-between p-3 sm:p-5 bg-white text-gray-800 overflow-y-auto">
      {/* Header bar */}
      <div className="flex items-center justify-between pb-2 border-b border-gray-100 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
              <CheckCircle className="w-4 h-4 text-[#009A44]" />
            </div>
            <span className="text-xs font-bold text-gray-700">
              {t('share_feedback_completed', 'Feedback Completed')}
            </span>
          </div>
        </div>

        {onRetake && (
          <button
            type="button"
            onClick={() => {
              triggerFeedback('button');
              onRetake();
            }}
            className="text-xs font-bold flex items-center justify-center gap-1.5 text-gray-700 hover:text-[#004B8D] bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg transition-all cursor-pointer active:scale-95 min-h-[44px] min-w-[44px]"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t('share_start_over', 'Start Over')}</span>
          </button>
        )}
      </div>

      {/* Main Content Area */}
      <div className="my-auto py-2 sm:py-3 flex flex-col items-center max-w-xl mx-auto w-full">
        {/* Combined Thank You & Share Container */}
        <div className="w-full max-w-lg bg-white border border-gray-200 rounded-2xl p-3.5 sm:p-4 shadow-sm text-left">
          {/* Header */}
          <div className="flex items-center gap-2 mb-1.5">
            <Share2 className="w-4.5 h-4.5 text-[#0081BC]" />
            <h1 className="text-sm sm:text-base font-black text-[#004B8D] tracking-tight">
              {t('share_headline', 'Thank You for Your Feedback! Share the Curbside Compass')}
            </h1>
          </div>

          <p className="text-xs text-gray-600 leading-snug mb-3">
            {t(
              'share_intro',
              'Your perspectives on neighbourhood parking provide valuable insight for the City of Edmonton. Encourage your neighbours, friends, and community members to discover their residential parking profile and have their say on curbside policies:'
            )}
          </p>

          {/* Option Selection: Share Persona Result vs General Encouraging Invite */}
          <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-2 sm:p-2.5 mb-2.5">
            <span className="block text-[0.625rem] font-bold uppercase tracking-wider text-gray-500 mb-1.5">
              {t('share_choose_label', 'Choose What to Share')}
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mb-2">
              {/* Option A: With Persona Result */}
              <button
                type="button"
                id="share-option-persona"
                onClick={() => {
                  triggerFeedback('choice');
                  setShareMode('with_persona');
                }}
                className={`text-left p-1.5 sm:p-2 rounded-lg border transition-all cursor-pointer flex flex-col justify-between active:scale-[0.98] ${
                  shareMode === 'with_persona'
                    ? 'bg-blue-50/90 border-[#004B8D] text-gray-900 ring-1 ring-[#004B8D] shadow-2xs'
                    : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-0.5">
                  <User className={`w-3.5 h-3.5 ${shareMode === 'with_persona' ? 'text-[#004B8D]' : 'text-gray-500'}`} />
                  <span className="text-[0.6875rem] font-bold">
                    {t('share_opt_persona', 'Include "My Residential Profile"')}
                  </span>
                </div>
                <div className="text-[0.59375rem] text-gray-600 leading-tight line-clamp-1">
                  {t('share_opt_persona_includes', 'Includes: {persona}').replace('{persona}', persona.title)}
                </div>
              </button>

              {/* Option B: General Invite without Persona */}
              <button
                type="button"
                id="share-option-general"
                onClick={() => {
                  triggerFeedback('choice');
                  setShareMode('general');
                }}
                className={`text-left p-1.5 sm:p-2 rounded-lg border transition-all cursor-pointer flex flex-col justify-between active:scale-[0.98] ${
                  shareMode === 'general'
                    ? 'bg-blue-50/90 border-[#004B8D] text-gray-900 ring-1 ring-[#004B8D] shadow-2xs'
                    : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-0.5">
                  <Users className={`w-3.5 h-3.5 ${shareMode === 'general' ? 'text-[#004B8D]' : 'text-gray-500'}`} />
                  <span className="text-[0.6875rem] font-bold">
                    {t('share_opt_general', 'General Invite Only')}
                  </span>
                </div>
                <div className="text-[0.59375rem] text-gray-600 leading-tight line-clamp-1">
                  {t('share_opt_general_desc', 'Encouraging post without sharing your residential profile results')}
                </div>
              </button>
            </div>

            {/* Social Post Preview Card with Image and Selections */}
            <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
              <div className="p-2.5 border-b border-gray-100 flex flex-col sm:flex-row items-start gap-2.5">
                {/* Thumbnail of Curbside Compass Image with Quick Actions */}
                <div className="relative flex-shrink-0 w-full sm:w-28 h-28 rounded-md overflow-hidden bg-slate-100 border border-gray-200 shadow-2xs group">
                  <img
                    src={curbsideSocialImg}
                    alt="Curbside Compass Social Share Card"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                    <a
                      href={curbsideSocialImg}
                      download="CurbsideCompass_Social_Media_IMG.jpg"
                      onClick={() => triggerFeedback('button')}
                      className="p-1.5 bg-white/95 hover:bg-white rounded text-gray-800 text-[0.625rem] font-bold flex items-center gap-1 no-underline active:scale-95 shadow-xs"
                      title={t('share_download_img_title', 'Download image file')}
                    >
                      <Download className="w-3 h-3 text-[#004B8D]" />
                      <span>Download</span>
                    </a>
                  </div>
                </div>

                {/* Post Text & User Selections Meta */}
                <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5 w-full">
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-[0.59375rem] font-bold text-[#004B8D] uppercase tracking-wide">
                        {t('share_preview_label', 'Social Post Preview')}
                      </span>
                      <div className="flex items-center gap-2">
                        <a
                          href={curbsideSocialImg}
                          download="CurbsideCompass_Social_Media_IMG.jpg"
                          onClick={() => triggerFeedback('button')}
                          className="text-[0.5625rem] text-gray-600 hover:text-[#004B8D] flex items-center gap-0.5 font-semibold active:scale-95"
                          title={t('share_download_attach_title', 'Download image to save or attach')}
                        >
                          <Download className="w-2.5 h-2.5" />
                          <span>{t('share_save_image_btn', 'Save Image')}</span>
                        </a>
                      </div>
                    </div>

                    {shareMode === 'with_persona' ? (
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-gray-900 leading-snug">
                          🎯 {persona.title}
                        </p>
                        <div className="bg-slate-50 rounded p-1.5 border border-slate-100 space-y-0.5 max-h-24 overflow-y-auto">
                          <span className="text-[0.5625rem] font-bold text-gray-500 uppercase block">User Selections:</span>
                          {userSelections.slice(0, 4).map((sel, idx) => (
                            <p key={idx} className="text-[0.59375rem] text-gray-700 leading-tight">
                              • {sel}
                            </p>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-gray-900 leading-snug">
                          📢 {t('share_opt_general', 'General Invite')}
                        </p>
                        <div className="bg-slate-50 rounded p-1.5 border border-slate-100 space-y-0.5 max-h-24 overflow-y-auto">
                          <span className="text-[0.5625rem] font-bold text-gray-500 uppercase block">Post Message:</span>
                          <p className="text-[0.59375rem] text-gray-700 leading-tight whitespace-pre-line">
                            {shareTextGeneral}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-1.5 flex flex-col gap-0.5 text-[0.5625rem]">
                    <div className="text-[#0081BC] font-medium truncate flex items-center gap-1">
                      <span>🔗 Weblink:</span>
                      <span className="underline">{shareUrl}</span>
                    </div>
                    <div className="text-gray-500 truncate flex items-center gap-1">
                      <span>🖼️ Image file:</span>
                      <span className="font-mono">{curbsideSocialImg}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Social Platform Buttons */}
          <div className="grid grid-cols-3 gap-2 mb-2">
            {/* Facebook */}
            <a
              href={facebookShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                triggerFeedback('button');
                handlePlatformClick('Facebook');
              }}
              id="share-facebook-button"
              className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-[#1877F2] hover:bg-[#1565cf] text-white text-xs font-bold shadow-xs transition-transform active:scale-95 cursor-pointer no-underline min-h-[44px] min-w-[44px]"
              title={t('share_on_facebook', 'Share on Facebook')}
            >
              <Facebook className="w-4 h-4 fill-current" />
              <span>{t('share_facebook', 'Facebook')}</span>
            </a>

            {/* X (formerly Twitter) */}
            <a
              href={twitterShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                triggerFeedback('button');
                handlePlatformClick('X');
              }}
              id="share-twitter-button"
              className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-black hover:bg-gray-800 text-white text-xs font-bold shadow-xs transition-transform active:scale-95 cursor-pointer no-underline min-h-[44px] min-w-[44px]"
              title={t('share_on_twitter', 'Post on X')}
            >
              <Twitter className="w-4 h-4 fill-current" />
              <span>{t('share_twitter', 'Post on X')}</span>
            </a>

            {/* Instagram / Direct Paste */}
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                triggerFeedback('button');
                handlePlatformClick('Instagram');
              }}
              id="share-instagram-button"
              className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737] hover:opacity-90 text-white text-xs font-bold shadow-xs transition-transform active:scale-95 cursor-pointer no-underline min-h-[44px] min-w-[44px]"
              title={t('share_on_instagram', 'Share on Instagram')}
            >
              <Instagram className="w-4 h-4" />
              <span>{t('share_instagram', 'Instagram')}</span>
            </a>
          </div>

          {/* Platform Click Helper / Auto-Copy Notification */}
          {platformNotice && (
            <div className={`mb-2 p-2 sm:p-2.5 rounded-xl text-xs flex items-start gap-2 border transition-all animate-in fade-in duration-200 ${
              platformNotice === 'Instagram' ? 'bg-purple-50 border-purple-200 text-purple-900' :
              platformNotice === 'Facebook' ? 'bg-blue-50 border-blue-200 text-blue-900' :
              'bg-gray-50 border-gray-200 text-gray-900'
            }`}>
              <Check className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                platformNotice === 'Instagram' ? 'text-purple-700' :
                platformNotice === 'Facebook' ? 'text-blue-700' :
                'text-gray-700'
              }`} />
              <span>
                <strong>{t('share_caption_copied_title', 'Share caption copied!')}</strong>{' '}
                {t('share_opening_platform', 'Opening {platform} so you can paste your post with your selections, link, and image.').replace('{platform}', platformNotice)}
              </span>
            </div>
          )}

          {/* Direct Copy Full Text Button */}
          <div className="pt-2 border-t border-gray-100">
            <button
              type="button"
              id="copy-share-text-button"
              onClick={() => {
                triggerFeedback('button');
                handleCopyLink();
              }}
              className={`w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer active:scale-95 min-h-[44px] ${
                copied
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-white border-2 border-[#004B8D] text-[#004B8D] hover:bg-blue-50 shadow-xs'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>{t('share_copied_btn', 'Copied Post, Link & Image to Clipboard!')}</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-[#004B8D]" />
                  <span>{t('share_copy_btn', 'Copy Full Post Text to Clipboard')}</span>
                </>
              )}
            </button>
            <p className="text-center text-xs text-gray-500 mt-1.5">
              {t(
                'share_copy_helper_text',
                'Copies your Curbside Compass result and the survey link to paste and share anywhere'
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="pt-2 border-t border-gray-100 flex items-center justify-between flex-shrink-0">
        <button
          type="button"
          onClick={() => {
            triggerFeedback('button');
            onViewResults();
          }}
          className="text-xs sm:text-sm font-bold text-[#004B8D] hover:text-[#003366] flex items-center gap-1.5 py-2 px-3 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer active:scale-95 min-h-[44px] min-w-[44px]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('share_view_persona_btn', 'View Resident Profile')}</span>
        </button>

        {onRetake && (
          <button
            type="button"
            onClick={() => {
              triggerFeedback('button');
              trackFunnelStep(6, 'retake_survey', { source: 'thank_you_view' });
              onRetake();
            }}
            className="text-xs sm:text-sm font-bold text-gray-600 hover:text-gray-900 flex items-center gap-1.5 py-2 px-3 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer active:scale-95 min-h-[44px]"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{t('results_retake_btn', 'Retake Survey')}</span>
          </button>
        )}
      </div>
    </div>
  );
};

export const ThankYouView = React.memo(ThankYouViewComponent);
