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
  ExternalLink,
  User,
  Users,
  Download
} from 'lucide-react';
import { triggerFeedback } from '../utils/feedback';
import { useAppText } from '../context/TextContentContext';

const curbsideSocialImg = '/Curbside_Compass_fb.png';

interface ThankYouViewProps {
  persona: PersonaResult;
  config: SimulationConfig;
  onViewResults: () => void;
  onRetake?: () => void;
}

const ThankYouViewComponent: React.FC<ThankYouViewProps> = ({
  persona,
  config,
  onViewResults,
  onRetake
}) => {
  const { t } = useAppText();
  const [shareMode, setShareMode] = useState<'with_persona' | 'general'>('with_persona');
  const [copied, setCopied] = useState<boolean>(false);
  const [platformNotice, setPlatformNotice] = useState<string | null>(null);

  const shareUrl = typeof window !== 'undefined' ? window.location.href : 'https://curbside-compass.edmonton.ca';

  const shareText = shareMode === 'with_persona'
    ? `I took Edmonton's Curbside Compass public engagement tool and got "${persona.title}"!\n\nMy Curbside Preferences:\n• Fee Model: ${config.curbsideFeeModel.charAt(0).toUpperCase() + config.curbsideFeeModel.slice(1)}\n• Enforcement: ${config.enforcementLevel}\n\nWhere do you stand on neighbourhood parking? Find your persona:`
    : `Where do you stand on Edmonton's neighbourhood parking and curbside policies? Have your say and try the Curbside Compass public engagement tool:`;

  const shareTextWithUrl = `${shareText} ${shareUrl}`;

  const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
  const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}&hashtags=YEGcurbside,Edmonton,YEGtraffic`;
  const instagramUrl = 'https://www.instagram.com/';

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareTextWithUrl);
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
        await navigator.clipboard.writeText(shareTextWithUrl);
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
              'Your perspectives on neighbourhood parking provide valuable insight for the City of Edmonton. Encourage your neighbours, friends, and community members to discover their parking persona and have their say on curbside policies:'
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
                    {t('share_opt_persona', 'Include My Persona')}
                  </span>
                </div>
                <div className="text-[0.59375rem] text-gray-600 leading-tight line-clamp-1">
                  Includes: <strong className="text-[#004B8D]">{persona.title}</strong>
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
                <div className="text-[0.59375rem] text-gray-600 leading-tight">
                  Encouraging post without persona results
                </div>
              </button>
            </div>

            {/* Social Post Preview Card with Image */}
            <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
              <div className="p-2 border-b border-gray-100 flex items-start gap-2.5">
                {/* Thumbnail of Curbside Compass Image */}
                <div className="relative flex-shrink-0 w-20 sm:w-24 h-20 sm:h-24 rounded-md overflow-hidden bg-slate-100 border border-gray-200 shadow-2xs group">
                  <img
                    src={curbsideSocialImg}
                    alt="Curbside Compass Social Share Card"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <a
                      href={curbsideSocialImg}
                      download="Curbside_Compass_fb.png"
                      onClick={() => triggerFeedback('button')}
                      className="p-1 bg-white/90 rounded text-gray-800 text-[0.5625rem] font-bold flex items-center gap-0.5 no-underline active:scale-95"
                      title="Download image"
                    >
                      <Download className="w-2.5 h-2.5" />
                    </a>
                  </div>
                </div>

                {/* Post Text & Meta */}
                <div className="flex-1 min-w-0 flex flex-col justify-between h-20 sm:h-24 py-0.5">
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-[0.59375rem] font-bold text-[#004B8D] uppercase tracking-wide">
                        Social Post Preview
                      </span>
                      <a
                        href={curbsideSocialImg}
                        download="Curbside_Compass_fb.png"
                        onClick={() => triggerFeedback('button')}
                        className="text-[0.5625rem] text-gray-500 hover:text-[#004B8D] flex items-center gap-1 font-semibold active:scale-95"
                        title="Download image to save or attach"
                      >
                        <Download className="w-2.5 h-2.5" />
                        <span>Save image</span>
                      </a>
                    </div>
                    <p className="text-[0.625rem] sm:text-[0.65625rem] text-gray-700 leading-snug line-clamp-3 italic">
                      "{shareText}"
                    </p>
                  </div>

                  <div className="text-[0.5625rem] text-[#0081BC] font-medium truncate">
                    🔗 {shareUrl}
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
              title="Share on Facebook"
            >
              <Facebook className="w-4 h-4 fill-current" />
              <span>Facebook</span>
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
              id="share-x-button"
              className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-black hover:bg-neutral-800 text-white text-xs font-bold shadow-xs transition-transform active:scale-95 cursor-pointer no-underline min-h-[44px] min-w-[44px]"
              title="Share on X"
            >
              <Twitter className="w-4 h-4 fill-current" />
              <span>X (Twitter)</span>
            </a>

            {/* Instagram */}
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                triggerFeedback('button');
                handlePlatformClick('Instagram');
              }}
              id="share-instagram-button"
              className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#FCB045] hover:opacity-95 text-white text-xs font-bold shadow-xs transition-transform active:scale-95 cursor-pointer no-underline min-h-[44px] min-w-[44px]"
              title="Share on Instagram"
            >
              <Instagram className="w-4 h-4" />
              <span>Instagram</span>
            </a>
          </div>

          {/* Platform Toast Notice */}
          {platformNotice && (
            <div className={`mb-2 p-2 border rounded-lg text-xs leading-snug flex items-start gap-2 ${
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
                <strong>Share caption copied!</strong> Opening {platformNotice} so you can paste your post.
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
                  : 'bg-white border border-gray-300 text-gray-800 hover:bg-gray-50 shadow-xs'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>{t('share_copied_btn', 'Copied to Clipboard!')}</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-gray-600" />
                  <span>{t('share_copy_btn', 'Copy Full Post Text to Clipboard')}</span>
                </>
              )}
            </button>
            <p className="text-center text-xs text-gray-500 mt-1.5 whitespace-pre-line">
              {t(
                'share_copy_helper_text',
                'Copies your Curbside Compass result\nand the survey link to paste and share anywhere'
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
          <span>{t('share_view_persona_btn', 'View Parking Persona')}</span>
        </button>

        {onRetake && (
          <button
            type="button"
            onClick={() => {
              triggerFeedback('button');
              onRetake();
            }}
            className="text-xs sm:text-sm font-bold text-gray-600 hover:text-gray-900 flex items-center gap-1.5 py-2 px-3 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer active:scale-95 min-h-[44px] min-w-[44px]"
          >
            <span>{t('share_retake_btn', 'Retake Assessment')}</span>
            <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
          </button>
        )}
      </div>
    </div>
  );
};

export const ThankYouView = React.memo(ThankYouViewComponent);
