import React from 'react';
import { useAppText, SupportedLocale } from '../context/TextContentContext';
import { Globe, Check, Sparkles, X, Laptop, ShieldCheck } from 'lucide-react';
import { triggerFeedback } from '../utils/feedback';

interface LanguageSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface LocaleOption {
  code: SupportedLocale;
  file: string;
  name: string;
  nativeName: string;
  description: string;
  flag: string;
  browserCodes: string[];
}

const LOCALE_OPTIONS: LocaleOption[] = [
  {
    code: 'en',
    file: 'en.json',
    name: 'English',
    nativeName: 'English (Canada / US)',
    description: 'City of Edmonton curbside survey text and persona descriptions.',
    flag: '🇨🇦',
    browserCodes: ['en', 'en-CA', 'en-US', 'en-GB']
  },
  {
    code: 'fr',
    file: 'fr.json',
    name: 'French (Canadian)',
    nativeName: 'Français canadien',
    description: 'Traduction française officielle de la Ville d’Edmonton pour le sondage sur le stationnement.',
    flag: '🇨🇦',
    browserCodes: ['fr', 'fr-CA', 'fr-FR']
  },
  {
    code: 'tl',
    file: 'tl.json',
    name: 'Tagalog',
    nativeName: 'Wikang Tagalog / Filipino',
    description: 'Kumpletong pagsasalin sa Tagalog para sa pagsusuri ng paradahan at persona.',
    flag: '🇵🇭',
    browserCodes: ['tl', 'tl-PH', 'fil', 'fil-PH']
  },
  {
    code: 'pa',
    file: 'pa.json',
    name: 'Punjabi',
    nativeName: 'ਪੰਜਾਬੀ (ਗੁਰਮੁਖੀ)',
    description: 'ਐਡਮਿੰਟਨ ਪਾਰਕਿੰਗ ਨੀਤੀ ਸਰਵੇਖਣ ਅਤੇ ਸ਼ਖਸੀਅਤ ਪ੍ਰੋਫਾਈਲਾਂ ਦਾ ਪੰਜਾਬੀ ਅਨੁਵਾਦ।',
    flag: '🇮🇳',
    browserCodes: ['pa', 'pa-IN', 'pa-PK', 'pa-Guru']
  }
];

export const LanguageSelectorModal: React.FC<LanguageSelectorModalProps> = ({ isOpen, onClose }) => {
  const {
    language,
    setLanguage,
    browserMatch,
    isBrowserMatched,
    isManualOverride,
    resetToBrowserLanguage,
    t
  } = useAppText();

  if (!isOpen) return null;

  const detectedRaw = typeof navigator !== 'undefined' ? navigator.language : null;
  const detectedList = typeof navigator !== 'undefined' && Array.isArray(navigator.languages)
    ? navigator.languages.join(', ')
    : detectedRaw;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="lang-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#004B87] to-[#006BB6] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center text-[#FFC72C]">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h2 id="lang-modal-title" className="text-base font-bold leading-tight">
                {t('lang_modal_title', 'Language & Localization')}
              </h2>
              <p className="text-xs text-blue-100">
                {t('lang_modal_subtitle', 'Curbside Compass Localization Files')}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label={t('lang_close_label', 'Close language selector')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Browser Detection Banner */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-xs">
          <div className="flex items-start gap-2.5">
            <div className="p-1.5 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 shrink-0 mt-0.5">
              <Laptop className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {t('lang_browser_detection', 'Browser Language Detection:')}
                </span>
                {browserMatch ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                    <Sparkles className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                    {t('lang_matched', 'Matched {code} ({file})').replace('{code}', browserMatch.matched.toUpperCase()).replace('{file}', `${browserMatch.matched}.json`)}
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                    {t('lang_no_match', 'No exact locale match (defaulting to English)')}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 truncate" title={detectedList || ''}>
                {t('lang_detected_browser', 'Detected from browser:')} <code className="font-mono bg-white dark:bg-slate-800 px-1 py-0.5 rounded border border-slate-200 dark:border-slate-700">{detectedList || 'Standard'}</code>
              </p>

              {/* Status and Reset to browser option */}
              <div className="mt-2 flex items-center justify-between gap-2">
                <span className="text-[11px] text-slate-600 dark:text-slate-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  {isBrowserMatched ? (
                    <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
                      {t('lang_status_auto_matched', 'Currently auto-matched to your browser preference')}
                    </span>
                  ) : isManualOverride ? (
                    <span>{t('lang_status_custom', 'Custom selection active (overrides browser)')}</span>
                  ) : (
                    <span>{t('lang_status_default', 'Defaulting to English')}</span>
                  )}
                </span>

                {isManualOverride && browserMatch && (
                  <button
                    type="button"
                    onClick={() => {
                      triggerFeedback('button');
                      resetToBrowserLanguage();
                    }}
                    className="text-[11px] font-semibold text-[#004B87] dark:text-blue-400 hover:underline cursor-pointer shrink-0"
                  >
                    {t('lang_match_browser_btn', 'Match Browser ({code})').replace('{code}', browserMatch.matched.toUpperCase())}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Locale List */}
        <div className="p-4 sm:p-6 space-y-3 overflow-y-auto">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            {t('lang_available_files', 'Available Language JSON Files')}
          </p>

          <div className="space-y-2.5">
            {LOCALE_OPTIONS.map((loc) => {
              const isSelected = language === loc.code;
              const isDetectedForThis = browserMatch?.matched === loc.code;

              return (
                <button
                  key={loc.code}
                  type="button"
                  onClick={() => {
                    triggerFeedback('button');
                    setLanguage(loc.code, true);
                  }}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'border-[#004B87] dark:border-blue-500 bg-blue-50/60 dark:bg-blue-950/40 ring-2 ring-[#004B87]/20 shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800/80 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <span className="text-2xl select-none" role="img" aria-label={loc.name}>
                      {loc.flag}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
                          {loc.name}
                        </span>
                        <code className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          {loc.file}
                        </code>
                        {isDetectedForThis && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                            <Sparkles className="w-2.5 h-2.5" /> {t('lang_browser_match_badge', 'Browser Match')}
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-medium text-slate-700 dark:text-slate-300 mt-0.5">
                        {loc.nativeName}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                        {loc.description}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center justify-center">
                    {isSelected ? (
                      <div className="w-6 h-6 rounded-full bg-[#004B87] text-white flex items-center justify-center">
                        <Check className="w-4 h-4 stroke-[3]" />
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-full border border-slate-300 dark:border-slate-700" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            {t('lang_save_notice', 'Selections are saved locally for future visits.')}
          </p>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#004B87] hover:bg-[#003B6A] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            {t('modal_close_button', 'Done')}
          </button>
        </div>
      </div>
    </div>
  );
};
