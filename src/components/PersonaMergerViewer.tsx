import React, { useState, useMemo } from 'react';
import {
  LEGACY_16_PERSONAS,
  LegacyPersona
} from '../data/legacyPersonas';
import {
  DEFAULT_8_PERSONAS,
  getActive8Personas,
  saveActive8Personas,
  resetActive8Personas,
  parsePersonasFromCsv,
  exportPersonasToCsv,
  CUSTOM_PERSONAS_STORAGE_KEY
} from '../data/personaData8';
import { PersonaResult } from '../types';
import {
  X,
  Layers,
  ArrowRight,
  UploadCloud,
  Download,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  FileText,
  Search,
  Sparkles,
  Info,
  ExternalLink
} from 'lucide-react';
import { triggerFeedback } from '../utils/feedback';

interface PersonaMergerViewerProps {
  isOpen: boolean;
  onClose: () => void;
  activePersonaId?: string;
}

export const PersonaMergerViewer: React.FC<PersonaMergerViewerProps> = ({
  isOpen,
  onClose,
  activePersonaId
}) => {
  const [activeTab, setActiveTab] = useState<'merger' | 'csv_import' | 'all_8'>('merger');
  const [selectedQuadrant, setSelectedQuadrant] = useState<'ALL' | 'Q1' | 'Q2' | 'Q3' | 'Q4'>('ALL');
  const [hoveredLegacyId, setHoveredLegacyId] = useState<string | null>(null);
  const [hoveredActiveId, setHoveredActiveId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // CSV Import State
  const [csvText, setCsvText] = useState<string>('');
  const [importStatus, setImportStatus] = useState<{
    type: 'idle' | 'success' | 'error';
    message?: string;
    parsedCount?: number;
  }>({ type: 'idle' });
  const [activePersonas, setActivePersonas] = useState<Record<string, PersonaResult>>(() => getActive8Personas());
  const [isCustomActive, setIsCustomActive] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return Boolean(localStorage.getItem(CUSTOM_PERSONAS_STORAGE_KEY));
  });

  const handleCsvFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = (event.target?.result as string) || '';
      setCsvText(text);
      triggerFeedback('toggle');
      handlePreviewAndParse(text);
    };
    reader.readAsText(file);
  };

  const handlePreviewAndParse = (textToParse: string) => {
    if (!textToParse.trim()) {
      setImportStatus({ type: 'error', message: 'Please paste or upload a CSV file with persona rows.' });
      return;
    }
    const result = parsePersonasFromCsv(textToParse);
    if (!result.success || !result.personas) {
      setImportStatus({ type: 'error', message: result.error || 'Failed to parse CSV format.' });
    } else {
      setImportStatus({
        type: 'success',
        message: `Parsed ${result.parsedRows?.length || 8} personas successfully! Ready to apply.`,
        parsedCount: result.parsedRows?.length
      });
    }
  };

  const handleApplyCsv = () => {
    const result = parsePersonasFromCsv(csvText);
    if (!result.success || !result.personas) {
      setImportStatus({ type: 'error', message: result.error || 'Failed to parse CSV format.' });
      return;
    }
    saveActive8Personas(result.personas);
    setActivePersonas(result.personas);
    setIsCustomActive(true);
    setImportStatus({
      type: 'success',
      message: 'Successfully applied and saved 8 updated personas across the application!'
    });
    triggerFeedback('submit');
  };

  const handleResetDefaults = () => {
    resetActive8Personas();
    setActivePersonas(DEFAULT_8_PERSONAS);
    setIsCustomActive(false);
    setCsvText('');
    setImportStatus({
      type: 'idle',
      message: 'Reset to official City of Edmonton default 8 personas.'
    });
    triggerFeedback('button');
  };

  const handleExportCsv = () => {
    const csvData = exportPersonasToCsv(activePersonas);
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Curbside_Compass_8_Personas.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerFeedback('button');
  };

  // Filtered lists
  const filteredLegacy = useMemo(() => {
    return LEGACY_16_PERSONAS.filter((p) => {
      const matchQ = selectedQuadrant === 'ALL' || p.quadrant === selectedQuadrant;
      const matchSearch =
        !searchQuery ||
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchQ && matchSearch;
    });
  }, [selectedQuadrant, searchQuery]);

  const activePersonaList = useMemo(() => {
    return (Object.values(activePersonas) as PersonaResult[]).filter((p: PersonaResult) => {
      const matchQ = selectedQuadrant === 'ALL' || p.quadrant === selectedQuadrant;
      const matchSearch =
        !searchQuery ||
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.stanceOnRegulations && p.stanceOnRegulations.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (p.stanceOnFunding && p.stanceOnFunding.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchQ && matchSearch;
    });
  }, [activePersonas, selectedQuadrant, searchQuery]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-5xl max-h-[92dvh] flex flex-col overflow-hidden my-auto">
        
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-[#005087] to-[#0081BC] text-white flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl backdrop-blur-md">
              <Layers className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold tracking-tight">
                  Curbside Persona Streamlining: 16 → 8 Transition
                </h2>
                {isCustomActive && (
                  <span className="text-[11px] font-bold px-2 py-0.5 bg-amber-400 text-amber-950 rounded-full">
                    Custom CSV Active
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-white/80">
                Consolidated 2-axis Policy Compass model (2 personas per quadrant: Moderate vs. Strong)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="px-5 py-2.5 bg-slate-50 border-b border-gray-200 flex flex-wrap items-center justify-between gap-2 flex-shrink-0">
          <div className="flex items-center gap-1.5 p-1 bg-gray-200/80 rounded-xl">
            <button
              onClick={() => { setActiveTab('merger'); triggerFeedback('toggle'); }}
              className={`px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
                activeTab === 'merger'
                  ? 'bg-white text-[#005087] shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Side-by-Side 16 → 8 Mapping
            </button>
            <button
              onClick={() => { setActiveTab('all_8'); triggerFeedback('toggle'); }}
              className={`px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
                activeTab === 'all_8'
                  ? 'bg-white text-[#005087] shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              The 8 Active Archetypes
            </button>
            <button
              onClick={() => { setActiveTab('csv_import'); triggerFeedback('toggle'); }}
              className={`px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'csv_import'
                  ? 'bg-white text-[#005087] shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <UploadCloud className="w-3.5 h-3.5" />
              Bulk CSV Update & Ingestion
            </button>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCsv}
              className="px-2.5 py-1 text-xs font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg flex items-center gap-1.5 shadow-2xs transition-colors"
              title="Download 4-column CSV"
            >
              <Download className="w-3.5 h-3.5 text-gray-500" />
              Export CSV
            </button>
            {isCustomActive && (
              <button
                onClick={handleResetDefaults}
                className="px-2.5 py-1 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 rounded-lg flex items-center gap-1.5 shadow-2xs transition-colors"
                title="Restore default 8 personas"
              >
                <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
                Reset Defaults
              </button>
            )}
          </div>
        </div>

        {/* Tab 1: Side-by-Side Merger */}
        {activeTab === 'merger' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 flex flex-col gap-4">
            
            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-gray-200 flex-shrink-0">
              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                <span className="text-xs font-bold text-gray-500 uppercase mr-1">Quadrant:</span>
                {(['ALL', 'Q1', 'Q2', 'Q3', 'Q4'] as const).map((q) => (
                  <button
                    key={q}
                    onClick={() => { setSelectedQuadrant(q); triggerFeedback('toggle'); }}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                      selectedQuadrant === q
                        ? 'bg-[#005087] text-white shadow-2xs'
                        : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {q === 'ALL' ? 'All Quadrants' : q}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search personas, stances..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#005087]"
                />
              </div>
            </div>

            {/* Split Screen 16 vs 8 */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              
              {/* Left Column: Legacy 16 Personas (5 cols) */}
              <div className="lg:col-span-5 flex flex-col gap-2.5">
                <div className="flex items-center justify-between pb-1 border-b border-gray-200">
                  <h3 className="text-xs sm:text-sm font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                    Legacy 16 Personas ({filteredLegacy.length})
                  </h3>
                  <span className="text-[11px] text-gray-500">Historical 4×4 Matrix</span>
                </div>

                <div className="space-y-2 max-h-[60dvh] overflow-y-auto pr-1">
                  {filteredLegacy.map((legacy) => {
                    const isHovered = hoveredLegacyId === legacy.id || hoveredActiveId === legacy.mergedIntoPersonaId;
                    return (
                      <div
                        key={legacy.id}
                        onMouseEnter={() => setHoveredLegacyId(legacy.id)}
                        onMouseLeave={() => setHoveredLegacyId(null)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer ${
                          isHovered
                            ? 'bg-blue-50/70 border-[#0081BC] shadow-xs ring-1 ring-[#0081BC]'
                            : 'bg-white border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] font-bold px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded">
                                #{legacy.number}
                              </span>
                              <span className="text-xs font-bold text-gray-900">{legacy.title}</span>
                              <span className="text-[10px] font-semibold text-gray-500">({legacy.quadrant})</span>
                            </div>
                            <p className="text-[11px] font-medium text-gray-500 mt-0.5">{legacy.subtitle}</p>
                          </div>
                          
                          <div className="flex items-center gap-1 text-[11px] font-bold text-[#005087] bg-[#005087]/10 px-2 py-0.5 rounded-full flex-shrink-0">
                            <span>→ {legacy.mergedIntoPersonaTitle}</span>
                          </div>
                        </div>

                        <p className="text-xs text-gray-600 mt-1.5 line-clamp-2 leading-relaxed">
                          {legacy.description}
                        </p>
                        
                        <div className="mt-2 pt-1.5 border-t border-gray-100 flex items-center justify-between text-[10px] text-gray-400">
                          <span>{legacy.xRangeText}</span>
                          <span>{legacy.yRangeText}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Center Flow Indicator (2 cols on lg, or divider) */}
              <div className="hidden lg:flex lg:col-span-1 flex-col items-center justify-center text-gray-400">
                <div className="h-full border-l-2 border-dashed border-gray-200 flex items-center justify-center">
                  <div className="bg-white p-2 rounded-full border border-gray-300 shadow-2xs -ml-[17px]">
                    <ArrowRight className="w-4 h-4 text-[#005087]" />
                  </div>
                </div>
              </div>

              {/* Right Column: 8 Successor Personas (6 cols) */}
              <div className="lg:col-span-6 flex flex-col gap-2.5">
                <div className="flex items-center justify-between pb-1 border-b border-gray-200">
                  <h3 className="text-xs sm:text-sm font-bold text-[#005087] uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#0081BC]"></span>
                    Successor 8 Archetypes ({activePersonaList.length})
                  </h3>
                  <span className="text-[11px] text-gray-500">2 per Quadrant (Moderate vs Strong)</span>
                </div>

                <div className="space-y-2.5 max-h-[60dvh] overflow-y-auto pr-1">
                  {activePersonaList.map((p) => {
                    const isHovered =
                      hoveredActiveId === p.id ||
                      (hoveredLegacyId &&
                        p.legacyMergedTitles?.some((title) =>
                          LEGACY_16_PERSONAS.find((leg) => leg.id === hoveredLegacyId)?.title === title
                        ));

                    const quadrantBadgeColors: Record<string, string> = {
                      Q1: 'bg-[#0081BC]/15 text-[#004B8D] border-[#0081BC]/30',
                      Q2: 'bg-[#005087]/15 text-[#005087] border-[#005087]/30',
                      Q3: 'bg-[#009A44]/15 text-[#007a36] border-[#009A44]/30',
                      Q4: 'bg-amber-500/15 text-amber-900 border-amber-500/30'
                    };

                    return (
                      <div
                        key={p.id}
                        onMouseEnter={() => setHoveredActiveId(p.id)}
                        onMouseLeave={() => setHoveredActiveId(null)}
                        className={`p-3.5 rounded-xl border transition-all ${
                          isHovered
                            ? 'bg-blue-50/70 border-[#005087] shadow-md ring-1 ring-[#005087]'
                            : 'bg-white border-gray-200 hover:border-gray-300 shadow-2xs'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-bold text-gray-900">{p.title}</h4>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                                  quadrantBadgeColors[p.quadrant] || 'bg-gray-100 text-gray-700'
                                }`}
                              >
                                {p.quadrant} • {p.intensity === 'strong' ? 'Strong' : 'Moderate'}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5">{p.subtitle}</p>
                          </div>

                          {/* Merged lineage pill */}
                          {p.legacyMergedTitles && p.legacyMergedTitles.length > 0 && (
                            <div className="text-right flex-shrink-0">
                              <span className="text-[10px] text-gray-400 block font-medium">Consolidates:</span>
                              <span className="text-[11px] font-semibold text-gray-700">
                                {p.legacyMergedTitles.join(' + ')}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Stances */}
                        <div className="mt-2.5 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                          <div className="p-2 bg-slate-50 rounded-lg border border-gray-200">
                            <span className="font-bold text-gray-700 block text-[10px] uppercase">
                              Stance on Regulations
                            </span>
                            <span className="text-gray-600 line-clamp-2">
                              {p.stanceOnRegulations || p.yRange}
                            </span>
                          </div>
                          <div className="p-2 bg-slate-50 rounded-lg border border-gray-200">
                            <span className="font-bold text-gray-700 block text-[10px] uppercase">
                              Stance on Funding
                            </span>
                            <span className="text-gray-600 line-clamp-2">
                              {p.stanceOnFunding || p.xRange}
                            </span>
                          </div>
                        </div>

                        {/* Full civic description */}
                        <p className="text-xs text-gray-700 mt-2.5 leading-relaxed bg-amber-50/50 p-2.5 rounded-lg border border-amber-200/60">
                          {p.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: The 8 Active Archetypes Grid */}
        {activeTab === 'all_8' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 flex flex-col gap-4">
            <div className="bg-blue-50/60 border border-blue-200 p-3.5 rounded-xl flex items-start gap-3 text-xs text-blue-900">
              <Info className="w-5 h-5 text-[#0081BC] flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">The Streamlined 8-Persona Architecture</p>
                <p className="text-blue-800/80 mt-0.5">
                  Each quadrant contains exactly 2 archetypes: one <strong>Moderate</strong> (closer to the center axis) and one <strong>Strong</strong> (higher conviction / intensity).
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(Object.values(activePersonas) as PersonaResult[]).map((p: PersonaResult) => (
                <div
                  key={p.id}
                  className="bg-white border border-gray-200 rounded-xl p-4 shadow-xs flex flex-col justify-between gap-3 hover:shadow-md transition-shadow"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3.5 h-3.5 rounded-full"
                          style={{ backgroundColor: p.badgeColor || '#005087' }}
                        />
                        <h4 className="text-base font-bold text-gray-900">{p.title}</h4>
                      </div>
                      <span className="text-xs font-bold px-2 py-0.5 bg-gray-100 text-gray-800 rounded-md">
                        {p.quadrant} • {p.intensity?.toUpperCase() || 'MODERATE'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 font-medium mt-1">{p.subtitle}</p>

                    <div className="mt-3 space-y-2 text-xs">
                      <div className="bg-slate-50 p-2 rounded-lg border border-gray-200">
                        <span className="font-bold text-gray-800 block text-[10px] uppercase">
                          Stance on Regulations:
                        </span>
                        <span className="text-gray-700">{p.stanceOnRegulations}</span>
                      </div>
                      <div className="bg-slate-50 p-2 rounded-lg border border-gray-200">
                        <span className="font-bold text-gray-800 block text-[10px] uppercase">
                          Stance on Funding:
                        </span>
                        <span className="text-gray-700">{p.stanceOnFunding}</span>
                      </div>
                    </div>

                    <p className="text-xs text-gray-700 mt-3 bg-gray-50/70 p-2.5 rounded-lg border border-gray-200/80 leading-relaxed">
                      {p.description}
                    </p>
                  </div>

                  {p.legacyMergedTitles && (
                    <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
                      <span>Consolidates legacy:</span>
                      <span className="font-bold text-[#005087]">{p.legacyMergedTitles.join(' & ')}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: CSV Import & Bulk Updater */}
        {activeTab === 'csv_import' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 flex flex-col gap-4">
            
            {/* Guide Card */}
            <div className="bg-slate-50 border border-gray-200 rounded-xl p-4 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-gray-800 font-bold text-sm">
                <FileSpreadsheet className="w-4 h-4 text-[#005087]" />
                4-Column Persona CSV Format
              </div>
              <p className="text-xs text-gray-600">
                You can upload a file (e.g. <code className="bg-gray-200 px-1 py-0.5 rounded text-[11px]">Curbside-Compass-Persona-Update.csv</code>) or paste CSV text directly with the following headers:
              </p>
              <pre className="bg-white p-2.5 rounded-lg border border-gray-300 text-[11px] font-mono text-gray-700 overflow-x-auto">
{`Persona, Stance on Regulations, Stance on Funding, Description
"Safety Parker","Strict safety rules and caps","Direct user pay & permits","You believe high-demand curb space must be strictly regulated..."
"Flexible Parker","Clear & defined guidelines","User fees and visitor passes","You prefer clear rules with modest user fees..."`}
              </pre>
            </div>

            {/* Upload & Paste Controls */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <label className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white border-2 border-dashed border-[#0081BC] hover:border-[#005087] hover:bg-blue-50/30 text-[#005087] rounded-xl font-bold text-xs cursor-pointer transition-all shadow-2xs">
                <UploadCloud className="w-4 h-4" />
                <span>Upload CSV File</span>
                <input
                  type="file"
                  accept=".csv,text/csv"
                  onChange={handleCsvFileUpload}
                  className="hidden"
                />
              </label>

              <button
                onClick={() => {
                  const sample = exportPersonasToCsv(DEFAULT_8_PERSONAS);
                  setCsvText(sample);
                  handlePreviewAndParse(sample);
                }}
                className="px-3.5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs rounded-xl transition-colors"
              >
                Load Current Personas into Box
              </button>
            </div>

            {/* Textarea */}
            <div className="flex flex-col gap-1.5 flex-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-gray-700 uppercase">
                  Paste or Edit CSV Content:
                </label>
                <span className="text-[11px] text-gray-400">
                  {csvText ? `${csvText.split('\n').length} lines` : 'Empty'}
                </span>
              </div>
              <textarea
                value={csvText}
                onChange={(e) => {
                  setCsvText(e.target.value);
                  handlePreviewAndParse(e.target.value);
                }}
                placeholder="Paste CSV rows here: Persona, Stance on Regulations, Stance on Funding, Description..."
                rows={8}
                className="w-full font-mono text-xs p-3 bg-white border border-gray-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#005087] resize-y"
              />
            </div>

            {/* Import Status Alert */}
            {importStatus.type !== 'idle' && (
              <div
                className={`p-3 rounded-xl border flex items-center gap-2.5 text-xs font-medium ${
                  importStatus.type === 'success'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}
              >
                {importStatus.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                )}
                <span>{importStatus.message}</span>
              </div>
            )}

            {/* Action Bar */}
            <div className="pt-2 flex items-center justify-end gap-2 border-t border-gray-200">
              <button
                onClick={handleApplyCsv}
                disabled={!csvText.trim()}
                className="px-4 py-2 text-xs font-bold bg-[#005087] hover:bg-[#003B64] disabled:opacity-50 text-white rounded-xl shadow-xs transition-all flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                Apply 8 Personas to App
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-5 py-3 bg-gray-100 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span>City of Edmonton Curbside Management</span>
            <span>•</span>
            <span>POPA & Council Policies Aligned</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-gray-800 hover:bg-gray-900 text-white font-semibold rounded-lg text-xs transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
