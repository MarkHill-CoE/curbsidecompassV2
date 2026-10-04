import React, { useState, useMemo, useCallback } from 'react';
import { useAppText } from '../context/TextContentContext';
import { TEXT_INVENTORY, TextInventoryItem } from '../data/textInventoryData';
import {
  RefreshCw,
  Download,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  X,
  Globe,
  FileSpreadsheet,
  ClipboardPaste,
  Link2,
  Search,
  Edit3,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Info,
  UploadCloud,
  FileText
} from 'lucide-react';

import { getDirectGoogleSheetWebUrl, isEditableGoogleSheetUrl } from '../utils/textSync';

interface GoogleSheetSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'csv' | 'inventory' | 'url' | 'paste' | 'guide';
}

const CATEGORY_FILTERS = [
  'All',
  'Questions (Q1-Q9)',
  'Results & Personas',
  'Neighbourhood Simulation',
  'Policy Compass',
  'Metrics & Sliders',
  'Civic Onboarding',
  'Simplified Street Layouts',
  'Global Header & Nav',
  'Privacy & Feedback'
] as const;

export const GoogleSheetSyncModal: React.FC<GoogleSheetSyncModalProps> = ({ isOpen, onClose, initialTab }) => {
  const {
    t,
    sheetUrl,
    setSheetUrl,
    syncStatus,
    itemCount,
    lastSynced,
    errorMessage,
    syncNow,
    applyDirectCsv,
    resetToDefaults,
    isCustomActive,
    customTexts,
    updateTextItem
  } = useAppText();

  const [inputUrl, setInputUrl] = useState(sheetUrl);
  const [pastedCsv, setPastedCsv] = useState('');
  const [activeTab, setActiveTab] = useState<'csv' | 'inventory' | 'url' | 'paste' | 'guide'>('inventory');
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Check if current connected URL is an active editable sheet (vs static published CSV feed)
  const isDirectEditable = useMemo(() => {
    return isEditableGoogleSheetUrl(inputUrl || sheetUrl);
  }, [inputUrl, sheetUrl]);

  // Only sync initial tab when the modal transitions from closed to open,
  // so Browse & Search Copy and active tabs remain open while viewing/editing.
  const prevIsOpenRef = React.useRef(false);
  React.useEffect(() => {
    if (isOpen && !prevIsOpenRef.current) {
      if (initialTab) {
        setActiveTab(initialTab);
      }
      setInputUrl(sheetUrl);
    }
    prevIsOpenRef.current = isOpen;
  }, [isOpen, initialTab, sheetUrl]);

  // Direct clickable link to open Google Sheet in browser
  const directSheetUrl = useMemo(() => {
    return getDirectGoogleSheetWebUrl(inputUrl || sheetUrl);
  }, [inputUrl, sheetUrl]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editingText, setEditingText] = useState<string>('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [copyAllStatus, setCopyAllStatus] = useState<boolean>(false);
  const [testStatus, setTestStatus] = useState<{ loading: boolean; message: string | null; isError: boolean }>({
    loading: false,
    message: null,
    isError: false
  });
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);

const QUESTION_FIELD_ORDER_MAP: Record<string, number> = {
  'Progress Step Header': 1,
  'Policy Category Badge': 2,
  'Question Card': 3,
  'Option A Choice': 4,
  'Option B Choice': 5,
  'Simulation Hint A': 6,
  'Simulation Hint B': 7
};

function getQuestionFieldOrder(item: TextInventoryItem): number {
  const k = item.key;
  if (k.endsWith('_progress_title')) return 1;
  if (k.endsWith('_category')) return 2;
  if (k.endsWith('_question')) return 3;
  if (k.endsWith('_option_a')) return 4;
  if (k.endsWith('_option_b')) return 5;
  if (k.endsWith('_hint_a')) return 6;
  if (k.endsWith('_hint_b')) return 7;

  if (item.container === 'Progress Step Header') return 1;
  if (item.container === 'Policy Category Badge') return 2;
  if (item.container === 'Option A Choice') return 4;
  if (item.container === 'Option B Choice') return 5;
  if (item.container === 'Simulation Hint A') return 6;
  if (item.container === 'Simulation Hint B') return 7;
  if (item.container === 'Question Card' && !k.includes('error') && !k.includes('opt_out')) return 3;

  if (k.includes('opt_out')) return 8;
  if (k.includes('helper')) return 9;
  if (k.includes('placeholder')) return 10;
  if (k.includes('error')) return 11;
  return 12;
}

function getQuestionNumber(key: string): number {
  const match = key.match(/^q(\d+)_/);
  return match ? parseInt(match[1], 10) : 999;
}

  // Filter inventory items based on search query and category
  const filteredItems = useMemo(() => {
    const list = TEXT_INVENTORY.filter((item) => {
      // Category filter
      if (selectedCategory !== 'All') {
        if (selectedCategory === 'Questions (Q1-Q9)') {
          if (!/^q[1-9]_/.test(item.key)) return false;
        } else if (selectedCategory === 'Results & Personas') {
          if (!item.key.startsWith('persona_') && !item.key.startsWith('results_') && !item.key.startsWith('share_')) return false;
        } else if (selectedCategory === 'Neighbourhood Simulation') {
          if (!item.key.startsWith('sim_') && item.key !== 'OCCUPIED' && item.key !== 'VACANT' && !item.key.startsWith('watch_')) return false;
        } else if (selectedCategory === 'Policy Compass') {
          if (!item.key.startsWith('compass_')) return false;
        } else if (selectedCategory === 'Metrics & Sliders') {
          if (!item.key.startsWith('gauge_') && !item.key.startsWith('slider_') && !item.key.startsWith('drawer_')) return false;
        } else if (selectedCategory === 'Civic Onboarding') {
          if (!item.key.startsWith('intro_') && !item.key.startsWith('modal_')) return false;
        } else if (selectedCategory === 'Simplified Street Layouts') {
          if (!item.key.startsWith('static_')) return false;
        } else if (selectedCategory === 'Global Header & Nav') {
          if (!item.key.startsWith('header_') && !item.key.startsWith('nav_')) return false;
        } else if (selectedCategory === 'Privacy & Feedback') {
          if (!item.key.startsWith('survey_') && !item.key.startsWith('postal_') && !item.key.startsWith('thankyou_')) return false;
        }
      }

      // Text search filter
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const activeText = (customTexts[item.key] || item.defaultText || '').toLowerCase();
      return (
        item.key.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.container.toLowerCase().includes(q) ||
        item.defaultText.toLowerCase().includes(q) ||
        activeText.includes(q)
      );
    });

    // When viewing Questions (Q1-Q9), enforce strict field ordering per question:
    // 1. Progress Step Header, 2. Policy Category Badge, 3. Question Card, 4. Option A Choice, 5. Option B Choice, 6. Simulation Hint A, 7. Simulation Hint B
    if (selectedCategory === 'Questions (Q1-Q9)' || (list.length > 0 && list.some(i => /^q[1-9]_/.test(i.key)))) {
      return [...list].sort((a, b) => {
        const isQA = /^q[1-9]_/.test(a.key);
        const isQB = /^q[1-9]_/.test(b.key);
        if (isQA && isQB) {
          const qA = getQuestionNumber(a.key);
          const qB = getQuestionNumber(b.key);
          if (qA !== qB) {
            return qA - qB;
          }
          const orderA = getQuestionFieldOrder(a);
          const orderB = getQuestionFieldOrder(b);
          if (orderA !== orderB) {
            return orderA - orderB;
          }
          return a.key.localeCompare(b.key);
        }
        if (isQA) return -1;
        if (isQB) return 1;
        return a.key.localeCompare(b.key);
      });
    }

    return list;
  }, [searchQuery, selectedCategory, customTexts]);

  // Copy single text key to clipboard
  const handleCopyKey = useCallback((key: string) => {
    navigator.clipboard.writeText(key).then(() => {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    });
  }, []);

  // 1-Click Copy entire 562-row table for instant paste into Google Sheets
  const handleCopyAllForGoogleSheets = useCallback(() => {
    const headers = ['Text Key', 'Section / Screen', 'Container / Element', 'On screen text', 'Revised text', 'Guidance & Notes'];
    const rows = TEXT_INVENTORY.map((item) => {
      const activeText = customTexts[item.key] || item.defaultText;
      return [
        item.key,
        item.category,
        item.container,
        activeText.replace(/\t/g, ' ').replace(/\r?\n/g, ' '),
        '', // blank column for communications team revisions
        item.guidance.replace(/\t/g, ' ')
      ].join('\t');
    });

    const fullTsv = [headers.join('\t'), ...rows].join('\n');
    navigator.clipboard.writeText(fullTsv).then(() => {
      setCopyAllStatus(true);
      setTimeout(() => setCopyAllStatus(false), 3500);
    });
  }, [customTexts]);

  // Start inline editing
  const handleStartEdit = (item: TextInventoryItem) => {
    setEditingKey(item.key);
    setEditingText(customTexts[item.key] !== undefined ? customTexts[item.key] : item.defaultText);
  };

  // Save inline edit
  const handleSaveEdit = (key: string) => {
    updateTextItem(key, editingText);
    setEditingKey(null);
    setFeedbackNotice(`Updated "${key}" successfully!`);
    setTimeout(() => setFeedbackNotice(null), 3000);
  };

  // Reset single item to default
  const handleResetSingleItem = (key: string) => {
    updateTextItem(key, '');
    setEditingKey(null);
    setFeedbackNotice(`Reverted "${key}" back to default text.`);
    setTimeout(() => setFeedbackNotice(null), 3000);
  };

  const handleSync = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setFeedbackNotice(null);
    setTestStatus({ loading: false, message: null, isError: false });
    await syncNow(inputUrl);
  };

  const handleTestLink = async () => {
    const target = inputUrl.trim();
    if (!target) {
      setTestStatus({ loading: false, message: 'Please enter a Google Sheet URL first.', isError: true });
      return;
    }
    setTestStatus({ loading: true, message: 'Connecting to Google Sheets...', isError: false });
    try {
      const ok = await syncNow(target);
      if (ok) {
        setTestStatus({
          loading: false,
          message: `Success! Connected to Google Sheet. Text is synced live in the app.`,
          isError: false
        });
      } else {
        setTestStatus({
          loading: false,
          message: errorMessage || 'Could not read sheet. Please verify sheet is shared as "Anyone with the link can view".',
          isError: true
        });
      }
    } catch {
      setTestStatus({
        loading: false,
        message: 'Connection failed. Please check the URL and sharing settings.',
        isError: true
      });
    }
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
      setFeedbackNotice(t('sync_pasted_success', 'Successfully updated app text from pasted copy!'));
      setActiveTab('inventory');
    }
  };

  const handleFileProcess = (file: File) => {
    if (!file) return;
    setUploadedFileName(file.name);
    setFeedbackNotice(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content) {
        const ok = applyDirectCsv(content);
        if (ok) {
          setFeedbackNotice(`Successfully updated questions and copy from ${file.name}!`);
        }
      }
    };
    reader.readAsText(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="sync-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-xs animate-fadeIn"
      onClick={(e) => {
        // Modal remains open until the user explicitly clicks the Close button
        e.stopPropagation();
      }}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden text-gray-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-[#004B8D] text-white px-4 py-3 sm:px-6 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center text-white shadow-inner">
              <FileSpreadsheet className="w-5 h-5 text-[#FFC72C]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="sync-modal-title" className="text-base sm:text-lg font-black leading-tight">
                  Curbside Compass Content Manager
                </h2>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FFC72C] text-[#002B49] uppercase tracking-wide">
                  Live Content &amp; Copy Sync
                </span>
              </div>
              <p className="text-xs text-white/80 font-medium mt-0.5">
                Browse 562 app texts, edit copy inline, or live sync with spreadsheets
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Curbside Compass Content Manager"
            className="text-white/90 hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-white/15 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-bold border border-white/20 shadow-xs"
          >
            <X className="w-4 h-4" />
            <span>Close</span>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 bg-gray-50 px-3 sm:px-6 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('csv')}
            className={`py-3 px-3 sm:px-4 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'csv'
                ? 'border-[#004B8D] text-[#004B8D] bg-white'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4 text-[#004B8D]" />
            <span>Questions CSV (Download / Upload)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('inventory')}
            className={`py-3 px-3 sm:px-4 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'inventory'
                ? 'border-[#004B8D] text-[#004B8D] bg-white'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>Browse &amp; Search Copy</span>
            <span className="ml-1 text-[11px] px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-800 font-mono">
              562
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('url')}
            className={`py-3 px-3 sm:px-4 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'url'
                ? 'border-[#004B8D] text-[#004B8D] bg-white'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Link2 className="w-4 h-4" />
            <span>Google Sheet Link Sync</span>
            {isCustomActive && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('paste')}
            className={`py-3 px-3 sm:px-4 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'paste'
                ? 'border-[#004B8D] text-[#004B8D] bg-white'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <ClipboardPaste className="w-4 h-4" />
            <span>Paste Spreadsheet Rows</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('guide')}
            className={`py-3 px-3 sm:px-4 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'guide'
                ? 'border-[#004B8D] text-[#004B8D] bg-white'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>Communications Guide</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-3 sm:p-5 overflow-y-auto flex-1 space-y-3.5 text-xs sm:text-sm">
          {/* Status Alert Banner */}
          <div
            className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
              syncStatus === 'synced' || (isCustomActive && syncStatus !== 'error')
                ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                : syncStatus === 'error'
                ? 'bg-red-50 border-red-200 text-red-900'
                : 'bg-blue-50 border-blue-200 text-blue-900'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {syncStatus === 'synced' || (isCustomActive && syncStatus !== 'error') ? (
                <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              ) : syncStatus === 'error' ? (
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              ) : (
                <Globe className="w-5 h-5 text-blue-600 flex-shrink-0" />
              )}
              <div className="truncate">
                <span className="font-bold">
                  {syncStatus === 'synced' || (isCustomActive && syncStatus !== 'error')
                    ? `Live Copy Overrides Active: ${itemCount} text items synced`
                    : syncStatus === 'error'
                    ? 'Sync Notice'
                    : 'Using Built-in Grade 5 English Copy (562 text keys ready)'}
                </span>
                {lastSynced && (
                  <span className="text-[11px] opacity-75 ml-2 font-normal">
                    (Last updated: {lastSynced})
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
              {isDirectEditable ? (
                <a
                  href={directSheetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 sm:px-3 py-1.5 bg-[#004B8D] hover:bg-[#00386a] text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                  title="Opens the active editable Google Sheet directly in a new browser tab"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-[#FFC72C]" />
                  <span className="hidden sm:inline">Open</span>
                  <span>Google Sheet</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              ) : (
                <button
                  type="button"
                  onClick={() => setActiveTab('url')}
                  className="px-2.5 sm:px-3 py-1.5 bg-[#004B8D] hover:bg-[#00386a] text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                  title="Connect your team's live Google Sheet to edit copy"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-[#FFC72C]" />
                  <span>Connect Live Sheet</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => syncNow(inputUrl || sheetUrl)}
                disabled={syncStatus === 'loading'}
                className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer whitespace-nowrap shadow-xs"
                title="Sync and apply the latest text edits directly from the Google Sheet into the app"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${syncStatus === 'loading' ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Sync</span>
                <span>Now</span>
              </button>

              {isCustomActive && (
                <button
                  type="button"
                  onClick={resetToDefaults}
                  className="px-2 py-1.5 text-xs font-semibold text-red-700 bg-red-100 hover:bg-red-200 rounded-lg transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1"
                  title="Revert all customized text back to the default English copy"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span className="hidden md:inline">Reset</span>
                </button>
              )}
            </div>
          </div>

          {feedbackNotice && (
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-semibold flex items-center gap-2 animate-fadeIn">
              <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{feedbackNotice}</span>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 0: QUESTIONS CSV (DOWNLOAD, REVISE & UPLOAD)                          */}
          {/* ========================================================================= */}
          {activeTab === 'csv' && (
            <div className="space-y-4">
              {/* Introduction Card */}
              <div className="bg-gradient-to-r from-blue-50 to-slate-50 border border-blue-200/80 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#004B8D] text-white flex items-center justify-center shrink-0 shadow-xs">
                    <FileSpreadsheet className="w-5 h-5 text-[#FFC72C]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-[#002B49]">
                      Questions CSV Workflow (Download &rarr; Revise &rarr; Re-upload)
                    </h3>
                    <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                      Download the complete survey questions spreadsheet, modify question prompts, answer choices, or hints in Excel or Google Sheets, and drag &amp; drop the revised CSV here to instantly update the live application.
                    </p>
                  </div>
                </div>
              </div>

              {/* 2-Step Action Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {/* Step 1: Download Box */}
                <div className="bg-white border-2 border-slate-200 rounded-xl p-4 flex flex-col justify-between shadow-2xs hover:border-[#004B8D]/40 transition-colors">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-[#004B8D] text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                        1
                      </span>
                      <h4 className="font-bold text-xs sm:text-sm text-gray-900">
                        Download Questions CSV
                      </h4>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      Contains all 9 questions (Q0 through Q8), Option A and B statements, hints, curbside stall impact numbers, gains/benefits, pains/costs, and municipal policy rationales.
                    </p>
                  </div>

                  <div className="pt-4 space-y-2">
                    <a
                      href="/curbside_compass_all_questions_text.csv"
                      download="curbside_compass_all_questions_text.csv"
                      className="w-full py-2.5 px-3 bg-[#004B8D] hover:bg-[#00386a] text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Download className="w-4 h-4 text-[#FFC72C]" />
                      <span>Download Questions Dataset (.csv)</span>
                    </a>

                    <a
                      href="/curbside_compass_text_inventory.csv"
                      download="curbside_compass_text_inventory.csv"
                      className="w-full py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5 text-gray-500" />
                      <span>Or download full app copy inventory (562 items)</span>
                    </a>
                  </div>
                </div>

                {/* Step 2: Upload Box */}
                <div className="bg-white border-2 border-slate-200 rounded-xl p-4 flex flex-col justify-between shadow-2xs">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                        2
                      </span>
                      <h4 className="font-bold text-xs sm:text-sm text-gray-900">
                        Upload Revised CSV
                      </h4>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      Select or drop your revised spreadsheet. The survey and simulation will update live immediately.
                    </p>
                  </div>

                  <div className="pt-3">
                    <div
                      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={handleFileDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-xl p-4 sm:p-5 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-2 ${
                        isDragging
                          ? 'border-emerald-500 bg-emerald-50/70 scale-[1.01]'
                          : 'border-slate-300 hover:border-emerald-600 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".csv,text/csv,text/plain"
                        onChange={handleFileInputChange}
                        className="hidden"
                      />
                      <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shadow-inner">
                        <UploadCloud className="w-5 h-5 text-emerald-700" />
                      </div>
                      <div>
                        <span className="font-bold text-xs text-emerald-800 hover:underline block">
                          Click to browse or drop CSV file here
                        </span>
                        <span className="text-[10px] text-gray-500">
                          Supports .csv files from Excel, Google Sheets, or Numbers
                        </span>
                      </div>
                    </div>

                    {uploadedFileName && (
                      <div className="mt-2 text-center text-xs text-gray-600 font-medium">
                        Last uploaded: <span className="font-bold text-gray-800">{uploadedFileName}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Status and Active Changes Card */}
              {isCustomActive && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="text-emerald-950 truncate">
                      <strong>Custom copy active:</strong> {itemCount} items currently overriding City defaults.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={resetToDefaults}
                    className="px-2.5 py-1 text-xs font-semibold text-red-700 bg-red-100 hover:bg-red-200 rounded-lg transition-colors cursor-pointer shrink-0"
                  >
                    Reset to Defaults
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 1: BROWSE & SEARCH TEXT INVENTORY (PRIMARY FOR COMMS TEAM)           */}
          {/* ========================================================================= */}
          {activeTab === 'inventory' && (
            <div className="space-y-3">
              {/* Quick Actions & Export Bar */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2.5">
                <div className="flex items-center gap-2 text-xs text-slate-700 font-medium">
                  <Info className="w-4 h-4 text-[#004B8D] flex-shrink-0" />
                  <span>
                    Browse any text in the app. Click <strong>Edit</strong> on any item to update wording live!
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {isDirectEditable ? (
                    <a
                      href={directSheetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-700 hover:bg-emerald-600 text-white transition-all shadow-xs cursor-pointer"
                      title="Opens the active editable Google Sheet directly in a new tab"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5 text-[#FFC72C]" />
                      <span>Open Google Sheet</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setActiveTab('url')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#004B8D] hover:bg-[#00386a] text-white transition-all shadow-xs cursor-pointer"
                      title="Connect your team's live Google Sheet to edit copy"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5 text-[#FFC72C]" />
                      <span>Connect Live Sheet</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleCopyAllForGoogleSheets}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer ${
                      copyAllStatus
                        ? 'bg-emerald-600 text-white'
                        : 'bg-[#004B8D] hover:bg-[#00386a] text-white'
                    }`}
                    title="Copies all 562 rows formatted to paste directly into Google Sheets row A1"
                  >
                    {copyAllStatus ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Copied 562 Rows to Clipboard!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy All for Google Sheets</span>
                      </>
                    )}
                  </button>

                  <a
                    href="/curbside_compass_text_inventory.csv"
                    download="curbside_compass_text_inventory.csv"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 hover:border-gray-400 rounded-lg text-gray-700 font-bold text-xs shadow-2xs transition-colors cursor-pointer"
                    title="Download complete 562-row CSV template with Text Key, Current text, and Revised text columns"
                  >
                    <Download className="w-3.5 h-3.5 text-[#004B8D]" />
                    <span>Download CSV</span>
                  </a>
                </div>
              </div>

              {/* Search & Category Filter Toolbar */}
              <div className="space-y-2">
                <div className="relative">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by text content, question words, or key (e.g. 'permit fees', 'q1_question', 'compass')..."
                    className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004B8D] focus:border-transparent outline-none bg-white"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 rounded cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Category Pill Filters */}
                <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs">
                  {CATEGORY_FILTERS.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all whitespace-nowrap cursor-pointer ${
                        selectedCategory === cat
                          ? 'bg-[#004B8D] text-white shadow-2xs'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Items Counter */}
              <div className="flex items-center justify-between text-[11px] text-gray-500 px-1">
                <span>Showing {filteredItems.length} of 562 text keys</span>
                {isCustomActive && (
                  <span className="text-emerald-700 font-semibold">
                    ● {itemCount} keys currently customized
                  </span>
                )}
              </div>

              {/* Inventory Table / Cards */}
              <div className="border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-200 bg-white max-h-[48vh] overflow-y-auto shadow-inner">
                {filteredItems.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <p className="font-semibold">No matching text items found for "{searchQuery}".</p>
                    <button
                      type="button"
                      onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
                      className="mt-2 text-xs text-[#004B8D] underline cursor-pointer"
                    >
                      Clear search filters
                    </button>
                  </div>
                ) : (
                  filteredItems.map((item) => {
                    const isCustomized = customTexts[item.key] !== undefined && customTexts[item.key].trim() !== '';
                    const activeText = isCustomized ? customTexts[item.key] : item.defaultText;
                    const isEditing = editingKey === item.key;

                    return (
                      <div
                        key={item.key}
                        className={`p-3 sm:p-3.5 transition-colors ${
                          isCustomized ? 'bg-emerald-50/40' : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            {/* Tags Bar */}
                            <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                                {item.category}
                              </span>
                              <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-700">
                                {item.container}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleCopyKey(item.key)}
                                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer"
                                title="Click to copy key name"
                              >
                                <span>{item.key}</span>
                                {copiedKey === item.key ? (
                                  <Check className="w-3 h-3 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3 h-3 opacity-60" />
                                )}
                              </button>
                              {isCustomized && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-200 text-emerald-800 uppercase tracking-wider">
                                  Custom Overridden
                                </span>
                              )}
                            </div>

                            {/* Active Content & Inline Editor */}
                            {isEditing ? (
                              <div className="mt-2 space-y-2">
                                <label className="block text-[11px] font-bold text-gray-700">
                                  Edit Copy for &ldquo;{item.key}&rdquo;:
                                </label>
                                <textarea
                                  rows={3}
                                  value={editingText}
                                  onChange={(e) => setEditingText(e.target.value)}
                                  className="w-full p-2.5 text-xs sm:text-sm border border-[#004B8D] rounded-lg focus:ring-2 focus:ring-[#004B8D] outline-none font-sans"
                                  autoFocus
                                />
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => handleSaveEdit(item.key)}
                                    className="px-3 py-1 bg-[#004B8D] hover:bg-[#00386a] text-white font-bold rounded-md text-xs cursor-pointer flex items-center gap-1"
                                  >
                                    <Check className="w-3 h-3" />
                                    <span>Save & Apply Live</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setEditingKey(null)}
                                    className="px-2.5 py-1 text-gray-600 hover:bg-gray-100 rounded-md text-xs cursor-pointer"
                                  >
                                    Cancel
                                  </button>
                                  {isCustomized && (
                                    <button
                                      type="button"
                                      onClick={() => handleResetSingleItem(item.key)}
                                      className="px-2.5 py-1 text-red-600 hover:bg-red-50 rounded-md text-xs cursor-pointer ml-auto flex items-center gap-1"
                                      title="Reset this string to default"
                                    >
                                      <RotateCcw className="w-3 h-3" />
                                      <span>Revert to Default</span>
                                    </button>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <div>
                                <p className="text-xs sm:text-sm text-gray-900 leading-relaxed font-sans">
                                  {activeText ? activeText : <span className="text-gray-400 italic">(Blank)</span>}
                                </p>
                                {isCustomized && (
                                  <p className="text-[11px] text-gray-500 mt-1 line-through opacity-75">
                                    Original: {item.defaultText}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Action Button */}
                          {!isEditing && (
                            <div className="flex sm:flex-col items-center gap-1 flex-shrink-0 self-end sm:self-start">
                              <button
                                type="button"
                                onClick={() => handleStartEdit(item)}
                                className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-gray-300 hover:border-gray-400 rounded-md text-xs font-semibold text-gray-700 flex items-center gap-1 transition-colors cursor-pointer"
                                title="Edit this text directly in browser"
                              >
                                <Edit3 className="w-3 h-3 text-[#004B8D]" />
                                <span>Edit</span>
                              </button>
                              {isCustomized && (
                                <button
                                  type="button"
                                  onClick={() => handleResetSingleItem(item.key)}
                                  className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                                  title="Revert to original text"
                                >
                                  <RotateCcw className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: GOOGLE SHEET URL SYNC                                              */}
          {/* ========================================================================= */}
          {activeTab === 'url' && (
            <div className="space-y-4">
              {/* Direct Google Sheet Connection Banner */}
              {isDirectEditable ? (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-emerald-50 border border-emerald-300 rounded-xl shadow-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-2 rounded-lg bg-emerald-700 text-white shrink-0">
                      <FileSpreadsheet className="w-5 h-5 text-[#FFC72C]" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-xs sm:text-sm text-emerald-950 flex items-center gap-1.5">
                        <CheckCircle className="w-4 h-4 text-emerald-600 inline" />
                        <span>Live Editable Google Sheet Connected</span>
                      </div>
                      <div className="text-[11px] text-emerald-800 truncate font-mono mt-0.5">{directSheetUrl}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href={directSheetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                      title="Opens your active Google Sheet directly in a new browser tab for live editing"
                    >
                      <span>Open in Google Sheets</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-amber-50/90 border border-amber-300 rounded-xl space-y-3">
                  <div className="flex items-start gap-2.5">
                    <div className="p-2 rounded-lg bg-amber-600 text-white shrink-0 mt-0.5">
                      <FileSpreadsheet className="w-5 h-5 text-white" />
                    </div>
                    <div className="space-y-1">
                      <div className="font-bold text-xs sm:text-sm text-amber-950">
                        Connect Your Team&apos;s Active Google Sheet
                      </div>
                      <p className="text-xs text-amber-900 leading-relaxed">
                        The app is currently reading from the built-in default copy feed. To enable live in-browser editing for your Communications team, connect an active Google Sheet in your Google Drive:
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    <a
                      href="https://sheets.new"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 bg-white border border-amber-300 hover:border-amber-400 rounded-lg text-xs font-semibold text-gray-800 flex items-center justify-between shadow-2xs hover:bg-amber-100/40 transition-colors"
                    >
                      <span className="flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[10px]">1</span>
                        <span>Create New Google Sheet</span>
                      </span>
                      <ExternalLink className="w-3.5 h-3.5 text-gray-500" />
                    </a>

                    <button
                      type="button"
                      onClick={handleCopyAllForGoogleSheets}
                      className="p-2.5 bg-white border border-amber-300 hover:border-amber-400 rounded-lg text-xs font-semibold text-gray-800 flex items-center justify-between shadow-2xs hover:bg-amber-100/40 transition-colors cursor-pointer"
                    >
                      <span className="flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-[10px]">2</span>
                        <span>{copyAllStatus ? '✓ Copied to Clipboard!' : 'Copy All Text Inventory'}</span>
                      </span>
                      <Copy className="w-3.5 h-3.5 text-gray-500" />
                    </button>
                  </div>

                  <p className="text-[11px] text-amber-900 leading-normal">
                    <strong>Step 3:</strong> Paste into cell A1 in your new sheet, click <em>Share &rarr; General Access: &ldquo;Anyone with the link can view&rdquo;</em>, then paste the link below and click <strong>Save &amp; Sync Now</strong>.
                  </p>
                </div>
              )}

              <form onSubmit={handleSync} className="space-y-3 bg-white p-4 border border-gray-200 rounded-xl shadow-xs">
                <div>
                  <label htmlFor="sheet-url-input" className="block font-bold text-gray-800 mb-1 text-xs sm:text-sm">
                    {t('sync_field_url_label', 'Google Sheet Link or CSV URL:')}
                  </label>
                  <input
                    id="sheet-url-input"
                    type="url"
                    placeholder="https://docs.google.com/spreadsheets/d/1.../edit or share link"
                    value={inputUrl}
                    onChange={(e) => setInputUrl(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004B8D] focus:border-transparent outline-none font-mono"
                  />
                  <p className="text-[11px] text-gray-500 mt-1.5 leading-normal">
                    💡 <strong>Any link format works:</strong> Paste the link from your browser URL bar, the Google Sheets Share link, or a published CSV link. Just ensure General access is set to <em>&ldquo;Anyone with the link can view&rdquo;</em>.
                  </p>
                </div>

                {testStatus.message && (
                  <div
                    className={`p-2.5 rounded-lg text-xs font-semibold flex items-center gap-2 ${
                      testStatus.isError
                        ? 'bg-red-50 border border-red-200 text-red-800'
                        : 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                    }`}
                  >
                    {testStatus.isError ? (
                      <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                    ) : (
                      <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    )}
                    <span>{testStatus.message}</span>
                  </div>
                )}

                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    type="submit"
                    disabled={syncStatus === 'loading' || !inputUrl.trim()}
                    className="px-4 py-2 bg-[#004B8D] hover:bg-[#00386a] disabled:bg-gray-300 text-white font-bold rounded-lg transition-colors flex items-center gap-2 cursor-pointer text-xs sm:text-sm shadow-xs"
                  >
                    <RefreshCw className={`w-4 h-4 ${syncStatus === 'loading' ? 'animate-spin' : ''}`} />
                    <span>{syncStatus === 'loading' ? t('sync_btn_syncing', 'Syncing Copy...') : t('sync_btn_save_sync', 'Save & Sync Now')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleTestLink}
                    disabled={testStatus.loading || !inputUrl.trim()}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-lg transition-colors text-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <span>{testStatus.loading ? 'Testing...' : 'Test Connection'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleUseLocalTemplate}
                    className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-colors text-xs cursor-pointer flex items-center gap-1.5 ml-auto"
                    title={t('sync_btn_load_template_title', 'Loads the built-in text inventory CSV file')}
                  >
                    <span>{t('sync_btn_load_template', 'Load Built-in Template CSV')}</span>
                  </button>
                </div>
              </form>

              {/* 3 Simple Setup Steps Card */}
              <div className="bg-blue-50/60 border border-blue-200 rounded-xl p-3.5 space-y-2">
                <h3 className="font-bold text-xs uppercase tracking-wider text-[#004B8D]">
                  3-Step Quick Setup Guide for Communications Staff
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <div className="bg-white p-2.5 rounded-lg border border-blue-100 shadow-2xs">
                    <div className="font-black text-[#004B8D] text-sm">1. Export Template</div>
                    <p className="text-gray-600 mt-0.5 text-[11px]">
                      Click <strong>Copy All for Google Sheets</strong> (or Download CSV) and paste into a Google Sheet.
                    </p>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-blue-100 shadow-2xs">
                    <div className="font-black text-[#004B8D] text-sm">2. Set Sharing</div>
                    <p className="text-gray-600 mt-0.5 text-[11px]">
                      In Google Sheets, click <strong>Share</strong> (top-right) and set access to <em>&ldquo;Anyone with link can view&rdquo;</em>.
                    </p>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-blue-100 shadow-2xs">
                    <div className="font-black text-[#004B8D] text-sm">3. Paste & Sync</div>
                    <p className="text-gray-600 mt-0.5 text-[11px]">
                      Paste the URL into the field above and click <strong>Save & Sync Now</strong>. That&rsquo;s it!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: PASTE SPREADSHEET ROWS DIRECTLY                                   */}
          {/* ========================================================================= */}
          {activeTab === 'paste' && (
            <form onSubmit={handleApplyPasted} className="space-y-3 bg-white p-4 border border-gray-200 rounded-xl shadow-xs">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="csv-textarea" className="block font-bold text-gray-800 text-xs sm:text-sm">
                    {t('sync_field_paste_label', 'Paste Spreadsheet Rows (from Google Sheets or Excel):')}
                  </label>
                  <span className="text-[11px] text-gray-500">
                    No publishing required
                  </span>
                </div>
                <textarea
                  id="csv-textarea"
                  rows={8}
                  placeholder={`Text Key\tOn screen text\tRevised text\nq1_question\tWho should pay for residential parking programs?\tResidents pay for parking permits in their zones.\nq1_option_a\tResidents with vehicles pay permit fees...\tResidents pay all costs.`}
                  value={pastedCsv}
                  onChange={(e) => setPastedCsv(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004B8D] focus:border-transparent outline-none font-mono"
                />
                <p className="text-[11px] text-gray-500 mt-1">
                  💡 In Google Sheets, simply select the rows and columns you updated, copy them (Ctrl+C / Cmd+C), and paste them directly into this box.
                </p>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  type="submit"
                  disabled={!pastedCsv.trim()}
                  className="px-4 py-2 bg-[#004B8D] hover:bg-[#00386a] disabled:bg-gray-300 text-white font-bold rounded-lg transition-colors flex items-center gap-2 cursor-pointer text-xs sm:text-sm shadow-xs"
                >
                  <ClipboardPaste className="w-4 h-4" />
                  <span>{t('sync_btn_apply_pasted', 'Apply Pasted Copy Now')}</span>
                </button>
              </div>
            </form>
          )}

          {/* ========================================================================= */}
          {/* TAB 4: COMMUNICATIONS TEAM GUIDE                                         */}
          {/* ========================================================================= */}
          {activeTab === 'guide' && (
            <div className="space-y-3 bg-white p-4 border border-gray-200 rounded-xl shadow-xs">
              <div className="border-l-4 border-[#004B8D] pl-3 py-1">
                <h3 className="font-black text-sm text-gray-800">
                  Curbside Compass Communications & Plain Language Guide
                </h3>
                <p className="text-xs text-gray-600">
                  Best practices for City of Edmonton public communications and live copy management
                </p>
              </div>

              <div className="space-y-2.5 text-xs text-gray-700">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <h4 className="font-bold text-gray-900 text-xs sm:text-sm flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#FFC72C]" />
                    <span>Grade 5 Plain Language Standard</span>
                  </h4>
                  <p className="mt-1 leading-relaxed text-gray-600">
                    Curbside parking policies can be technical. To maintain accessibility across diverse Edmonton communities:
                  </p>
                  <ul className="mt-1.5 list-disc list-inside space-y-0.5 text-gray-600">
                    <li>Use short, direct sentences (under 15 words where possible).</li>
                    <li>Avoid municipal jargon (e.g. use &ldquo;street parking rules&rdquo; rather than &ldquo;curbside asset monetization frameworks&rdquo;).</li>
                    <li>Clearly state who pays and what the tradeoff is (e.g. &ldquo;Residents pay&rdquo; vs. &ldquo;All taxpayers pay&rdquo;).</li>
                  </ul>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <h4 className="font-bold text-gray-900 text-xs sm:text-sm flex items-center gap-1.5">
                    <FileSpreadsheet className="w-4 h-4 text-[#004B8D]" />
                    <span>How Column Matching Works</span>
                  </h4>
                  <p className="mt-1 leading-relaxed text-gray-600">
                    When editing in Google Sheets:
                  </p>
                  <ul className="mt-1.5 list-disc list-inside space-y-0.5 text-gray-600">
                    <li><strong>Text Key:</strong> Keep this column intact (e.g. <code>q1_question</code>).</li>
                    <li><strong>Revised text:</strong> Type your revised copy into this column. The app automatically prefers this column over the default text.</li>
                    <li><strong>On screen text:</strong> Shows the current live wording for your reference.</li>
                  </ul>
                </div>

                <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-amber-900 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-xs">Zero-Downtime Guarantee</h5>
                    <p className="mt-0.5 leading-relaxed text-[11px]">
                      If the Google Sheet link is ever unreachable or offline, Curbside Compass automatically falls back to the built-in copy. The app will never display blank screens or error codes to public residents.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-gray-50 border-t border-gray-200 px-4 py-3 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <span className="font-bold text-gray-800">Curbside Compass Content Manager</span>
            <span>•</span>
            <span className="text-[11px] font-mono text-gray-500">562 Keys Total</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close Curbside Compass Content Manager"
            className="px-5 py-2 bg-[#004B8D] hover:bg-[#00386a] text-white font-bold rounded-lg transition-colors text-xs sm:text-sm cursor-pointer shadow-xs flex items-center gap-1.5"
            title="Close Curbside Compass Content Manager"
          >
            <X className="w-4 h-4" />
            <span>Close</span>
          </button>
        </div>
      </div>
    </div>
  );
};
