import React, { useState } from 'react';
import { useAppText } from '../context/TextContentContext';
import { RefreshCw, Download, ExternalLink, CheckCircle, AlertCircle, HelpCircle, X, Globe, FileSpreadsheet, ClipboardPaste, Link2 } from 'lucide-react';

interface GoogleSheetSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GoogleSheetSyncModalComponent: React.FC<GoogleSheetSyncModalProps> = ({ isOpen, onClose }) => {
  const {
    sheetUrl,
    setSheetUrl,
    syncStatus,
    itemCount,
    lastSynced,
    errorMessage,
    syncNow,
    applyDirectCsv,
    resetToDefaults,
    isCustomActive
  } = useAppText();

  const [inputUrl, setInputUrl] = useState(sheetUrl);
  const [pastedCsv, setPastedCsv] = useState('');
  const [activeTab, setActiveTab] = useState<'url' | 'paste' | 'guide'>('url');
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSync = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setFeedbackNotice(null);
    await syncNow(inputUrl);
  };

  const handleUseLocalTemplate = async () => {
    const localUrl = '/curbside_compass_text_inventory.csv';
    setInputUrl(localUrl);
    setSheetUrl(localUrl);
    setFeedbackNotice(null);
    await syncNow(localUrl);
  };

  const handleApplyPasted = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackNotice(null);
    if (!pastedCsv.trim()) return;

    const ok = applyDirectCsv(pastedCsv);
    if (ok) {
      setFeedbackNotice('Successfully updated app text from pasted copy!');
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="sync-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden text-gray-800">
        {/* Modal Header */}
        <div className="bg-[#004B8D] text-white px-4 py-3.5 sm:px-6 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center text-white">
              <FileSpreadsheet className="w-5 h-5 text-[#FFC72C]" />
            </div>
            <div>
              <h2 id="sync-modal-title" className="text-base sm:text-lg font-black leading-tight">
                Live Content & Copy Sync
              </h2>
              <p className="text-xs text-white/80 font-medium">
                Update app text live from Google Sheets or CSV
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close sync modal"
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 bg-gray-50 px-4 sm:px-6">
          <button
            type="button"
            onClick={() => setActiveTab('url')}
            className={`py-2.5 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'url'
                ? 'border-[#004B8D] text-[#004B8D]'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <Link2 className="w-3.5 h-3.5" />
            <span>Google Sheet URL</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('paste')}
            className={`py-2.5 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'paste'
                ? 'border-[#004B8D] text-[#004B8D]'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <ClipboardPaste className="w-3.5 h-3.5" />
            <span>Paste CSV Directly</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('guide')}
            className={`py-2.5 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-1 cursor-pointer ${
              activeTab === 'guide'
                ? 'border-[#004B8D] text-[#004B8D]'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Setup Instructions</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4 text-xs sm:text-sm">
          {/* Status Banner */}
          <div
            className={`p-3 sm:p-3.5 rounded-xl border flex items-start gap-2.5 ${
              syncStatus === 'synced' || (isCustomActive && syncStatus !== 'error')
                ? 'bg-green-50 border-green-200 text-green-900'
                : syncStatus === 'error'
                ? 'bg-red-50 border-red-200 text-red-900'
                : 'bg-blue-50 border-blue-200 text-blue-900'
            }`}
          >
            {syncStatus === 'synced' || (isCustomActive && syncStatus !== 'error') ? (
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            ) : syncStatus === 'error' ? (
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            ) : (
              <Globe className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            )}

            <div className="flex-1 min-w-0">
              <div className="font-bold flex items-center justify-between">
                <span>
                  {syncStatus === 'synced' || (isCustomActive && syncStatus !== 'error')
                    ? 'Content Sync Active'
                    : syncStatus === 'error'
                    ? 'Sync Notice'
                    : 'Using Built-in Default Text'}
                </span>
                {lastSynced && (
                  <span className="text-[11px] font-normal text-gray-600">
                    Last sync: {lastSynced}
                  </span>
                )}
              </div>
              <p className="text-xs mt-0.5 opacity-90 leading-relaxed">
                {syncStatus === 'synced' || (isCustomActive && syncStatus !== 'error')
                  ? `Successfully loaded ${itemCount} text items into the application.`
                  : syncStatus === 'error'
                  ? errorMessage || 'Unable to load text from the provided spreadsheet.'
                  : 'The app is currently using the built-in copy. Paste your Google Sheet link or raw CSV to customize text.'}
              </p>
            </div>
          </div>

          {feedbackNotice && (
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-semibold flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{feedbackNotice}</span>
            </div>
          )}

          {activeTab === 'url' && (
            <>
              {/* URL Form Input */}
              <form onSubmit={handleSync} className="space-y-3">
                <div>
                  <label htmlFor="sheet-url-input" className="block font-bold text-gray-700 mb-1 text-xs sm:text-sm">
                    Google Sheet or CSV URL:
                  </label>
                  <input
                    id="sheet-url-input"
                    type="url"
                    placeholder="https://docs.google.com/spreadsheets/d/.../edit or .../pub?output=csv"
                    value={inputUrl}
                    onChange={(e) => setInputUrl(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004B8D] focus:border-transparent outline-none font-mono"
                  />
                  <p className="text-[11px] text-gray-500 mt-1.5 leading-normal">
                    💡 <strong>Any Google Sheets link works:</strong> Paste the link from your browser address bar, the Share link, or a published CSV link. Just ensure your sheet sharing is set to <em>"Anyone with the link can view"</em>.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    type="submit"
                    disabled={syncStatus === 'loading' || !inputUrl.trim()}
                    className="px-4 py-2 bg-[#004B8D] hover:bg-[#00386a] disabled:bg-gray-300 text-white font-bold rounded-lg transition-colors flex items-center gap-2 cursor-pointer text-xs sm:text-sm"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${syncStatus === 'loading' ? 'animate-spin' : ''}`} />
                    <span>{syncStatus === 'loading' ? 'Syncing...' : 'Save & Sync Now'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleUseLocalTemplate}
                    className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-colors text-xs cursor-pointer flex items-center gap-1.5"
                    title="Loads the built-in text inventory CSV file"
                  >
                    <span>Load Built-in Template CSV</span>
                  </button>

                  {isCustomActive && (
                    <button
                      type="button"
                      onClick={resetToDefaults}
                      className="px-3 py-2 text-red-600 hover:bg-red-50 font-semibold rounded-lg transition-colors text-xs cursor-pointer ml-auto"
                    >
                      Reset to Defaults
                    </button>
                  )}
                </div>
              </form>

              {/* Quick Actions Card */}
              <div className="bg-slate-50 border border-gray-200 rounded-xl p-3.5 space-y-2.5">
                <h3 className="font-bold text-xs uppercase tracking-wider text-gray-600">
                  Quick Tools
                </h3>
                <div className="flex flex-wrap gap-2">
                  <a
                    href="/curbside_compass_text_inventory.csv"
                    download="curbside_compass_text_inventory.csv"
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-300 hover:border-gray-400 rounded-lg text-gray-700 font-semibold text-xs shadow-2xs transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-[#004B8D]" />
                    <span>Download Full CSV Template</span>
                  </a>

                  <a
                    href="https://sheets.new"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-300 hover:border-gray-400 rounded-lg text-gray-700 font-semibold text-xs shadow-2xs transition-colors cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-green-600" />
                    <span>Open Blank Google Sheet</span>
                  </a>
                </div>
              </div>
            </>
          )}

          {activeTab === 'paste' && (
            /* Direct CSV Paste Form */
            <form onSubmit={handleApplyPasted} className="space-y-3">
              <div>
                <label htmlFor="csv-textarea" className="block font-bold text-gray-700 mb-1 text-xs sm:text-sm">
                  Paste CSV / TSV Rows or Table:
                </label>
                <textarea
                  id="csv-textarea"
                  rows={7}
                  placeholder={`Text Key,On screen text\nq1_question,Who should pay for residential parking programs?\nq1_option_a,Residents with vehicles in the area...`}
                  value={pastedCsv}
                  onChange={(e) => setPastedCsv(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004B8D] focus:border-transparent outline-none font-mono"
                />
                <p className="text-[11px] text-gray-500 mt-1">
                  You can copy and paste rows directly from Google Sheets or Excel without needing to publish.
                </p>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  type="submit"
                  disabled={!pastedCsv.trim()}
                  className="px-4 py-2 bg-[#004B8D] hover:bg-[#00386a] disabled:bg-gray-300 text-white font-bold rounded-lg transition-colors flex items-center gap-2 cursor-pointer text-xs sm:text-sm"
                >
                  <ClipboardPaste className="w-3.5 h-3.5" />
                  <span>Apply Pasted Copy Now</span>
                </button>

                {isCustomActive && (
                  <button
                    type="button"
                    onClick={resetToDefaults}
                    className="px-3 py-2 text-red-600 hover:bg-red-50 font-semibold rounded-lg transition-colors text-xs cursor-pointer ml-auto"
                  >
                    Reset to Defaults
                  </button>
                )}
              </div>
            </form>
          )}

          {activeTab === 'guide' && (
            /* Guide Tab */
            <div className="space-y-3.5">
              <div className="border-l-4 border-[#004B8D] pl-3 py-1">
                <h3 className="font-black text-sm text-gray-800">
                  How to link Google Sheets with Curbside Compass
                </h3>
                <p className="text-xs text-gray-600">
                  Follow these 3 simple steps to let your communications team update app copy anytime:
                </p>
              </div>

              <ol className="space-y-3 list-decimal list-inside text-gray-700">
                <li className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <strong className="text-gray-900">1. Download & Import the CSV Template:</strong>
                  <p className="mt-1 text-xs text-gray-600 pl-4">
                    Download the template using the <strong>Download Full CSV Template</strong> button, then open Google Sheets and select <strong>File → Import → Upload</strong>.
                  </p>
                </li>

                <li className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <strong className="text-gray-900">2. Edit Copy & Set Sharing:</strong>
                  <p className="mt-1 text-xs text-gray-600 pl-4">
                    Modify any phrasing in the <strong>"On screen text"</strong> (or add a <strong>"Revised text"</strong>) column. In Google Sheets, click the blue <strong>Share</strong> button (top-right) and ensure General access is set to <strong>"Anyone with the link can view"</strong>.
                  </p>
                </li>

                <li className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <strong className="text-gray-900">3. Paste Link in Curbside Compass:</strong>
                  <p className="mt-1 text-xs text-gray-600 pl-4">
                    Copy the URL from your browser's address bar or click <em>Copy link</em> in the Share dialog, return here, paste it into the URL field, and click <strong>Save & Sync Now</strong>. The app will automatically convert and sync the text!
                  </p>
                </li>
              </ol>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-amber-900 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <p>
                  <strong>Reliability Guarantee:</strong> If Google Sheets is ever unreachable or offline, the app automatically serves the built-in copy. The app will never crash or show blank screens.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-gray-50 border-t border-gray-200 px-4 py-3 sm:px-6 flex items-center justify-between">
          <span className="text-[11px] text-gray-500">
            {isCustomActive ? '🟢 Live Sync Active' : '⚪ Built-in Defaults'}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold rounded-lg transition-colors text-xs sm:text-sm cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export const GoogleSheetSyncModal = React.memo(GoogleSheetSyncModalComponent);

