import { SURVEY_QUESTIONS, PERSONA_PROFILES } from '../data/surveyData';
import { SurveyQuestion } from '../types';

// ============================================================================
// GOOGLE SHEET SYNC CONFIGURATION
// Paste your published Google Sheet CSV URL or share link here to make it the default:
export const DEFAULT_GOOGLE_SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQUZyEh-MPWjgoBxXHPMcV3rWMO1z4unO-6JpDaxhpxNQF80rQwrRLBDJ5k3bzVxVlleaIUWCNkyPsb/pub?gid=6494939&single=true&output=csv';
// ============================================================================

const STORAGE_URL_KEY = 'curbside_compass_sheets_url';
const STORAGE_CACHED_TEXT_KEY = 'curbside_compass_cached_text';
const STORAGE_LAST_SYNC_KEY = 'curbside_compass_last_sync_time';

// Common synonyms for headers in copy spreadsheets
const KEY_HEADER_SYNONYMS = new Set([
  'textkey',
  'key',
  'id',
  'textid',
  'stringid',
  'keyname',
  'identifier',
  'code',
  'token',
  'itemkey',
  'field',
  'name',
  'labelkey'
]);

const REVISED_TEXT_SYNONYMS = new Set([
  'revisedtext',
  'revisedcopy',
  'revised',
  'newtext',
  'newcopy',
  'updatedtext',
  'updatedcopy',
  'proposedtext',
  'finaltext',
  'finalcopy',
  'drafttext',
  'editedtext',
  'edmontontext'
]);

const STANDARD_TEXT_SYNONYMS = new Set([
  'onscreentext',
  'onscreen',
  'screentext',
  'text',
  'copy',
  'content',
  'value',
  'label',
  'english',
  'en',
  'string',
  'displaytext',
  'uitext',
  'originaltext',
  'currentext',
  'body',
  'message'
]);

/**
 * Normalizes header string to lowercase alphanumeric for forgiving comparison.
 */
function normalizeHeader(str: string): string {
  return (str || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Detects whether the content is an HTML response instead of a CSV file.
 */
export function isHtmlContent(text: string): boolean {
  const trimmed = text.trim();
  return (
    trimmed.startsWith('<!DOCTYPE') ||
    trimmed.startsWith('<!doctype') ||
    trimmed.startsWith('<html') ||
    trimmed.startsWith('<HTML') ||
    text.includes('<html') ||
    text.includes('google-signin') ||
    (text.includes('<head>') && text.includes('<body>'))
  );
}

/**
 * Auto-detects the delimiter in a CSV/TSV string (comma, tab, semicolon).
 */
export function detectDelimiter(text: string): string {
  const sample = text.slice(0, 4000);
  const lines = sample.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) return ',';

  const counts: Record<string, number> = { ',': 0, '\t': 0, ';': 0 };

  for (const line of lines.slice(0, 5)) {
    let inQuote = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        inQuote = !inQuote;
      } else if (!inQuote) {
        if (ch === ',') counts[',']++;
        else if (ch === '\t') counts['\t']++;
        else if (ch === ';') counts[';']++;
      }
    }
  }

  if (counts['\t'] > counts[','] && counts['\t'] > counts[';']) return '\t';
  if (counts[';'] > counts[','] && counts[';'] > counts['\t']) return ';';
  return ',';
}

/**
 * Robust CSV/TSV parser supporting quoted fields, escaped quotes, multi-line values, and custom delimiters.
 */
export function parseCSV(csvText: string, customDelimiter?: string): string[][] {
  let cleanText = csvText;
  // Strip UTF-8 Byte Order Mark if present
  if (cleanText.charCodeAt(0) === 0xfeff) {
    cleanText = cleanText.slice(1);
  }

  const delimiter = customDelimiter || detectDelimiter(cleanText);
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let inQuotes = false;

  for (let i = 0; i < cleanText.length; i++) {
    const char = cleanText[i];
    const nextChar = cleanText[i + 1];

    if (inQuotes) {
      if (char === '"' && nextChar === '"') {
        currentField += '"';
        i++; // skip escaped quote
      } else if (char === '"') {
        inQuotes = false;
      } else {
        currentField += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === delimiter) {
        currentRow.push(currentField);
        currentField = '';
      } else if (char === '\r') {
        // ignore carriage return
      } else if (char === '\n') {
        currentRow.push(currentField);
        rows.push(currentRow);
        currentRow = [];
        currentField = '';
      } else {
        currentField += char;
      }
    }
  }

  if (currentField || currentRow.length > 0) {
    currentRow.push(currentField);
    rows.push(currentRow);
  }

  // Filter out empty rows
  return rows.filter((r) => r.some((c) => c.trim().length > 0));
}

/**
 * Intelligently extracts a key -> text map from 2D CSV rows.
 * Handles:
 * - Title/note rows preceding the real header row
 * - Synonyms for 'Text Key' and 'On screen text'
 * - 'Revised text' prioritizing over 'On screen text'
 * - Direct data rows without headers
 */
export function extractTextMapFromRows(rows: string[][]): Record<string, string> {
  const map: Record<string, string> = {};
  if (!rows || rows.length === 0) return map;

  let headerRowIndex = -1;
  let keyColIndex = -1;
  let revisedTextColIndex = -1;
  let standardTextColIndex = -1;

  // 1. Search the first 20 rows for the header row
  for (let r = 0; r < Math.min(rows.length, 20); r++) {
    const row = rows[r];
    let candidateKeyIdx = -1;
    let candidateRevisedIdx = -1;
    let candidateStandardIdx = -1;

    for (let c = 0; c < row.length; c++) {
      const normalized = normalizeHeader(row[c]);
      if (candidateKeyIdx === -1 && KEY_HEADER_SYNONYMS.has(normalized)) {
        candidateKeyIdx = c;
      }
      if (candidateRevisedIdx === -1 && REVISED_TEXT_SYNONYMS.has(normalized)) {
        candidateRevisedIdx = c;
      }
      if (candidateStandardIdx === -1 && STANDARD_TEXT_SYNONYMS.has(normalized)) {
        candidateStandardIdx = c;
      }
    }

    // A valid header row must have at least a key column and one text column
    if (candidateKeyIdx !== -1 && (candidateStandardIdx !== -1 || candidateRevisedIdx !== -1)) {
      headerRowIndex = r;
      keyColIndex = candidateKeyIdx;
      revisedTextColIndex = candidateRevisedIdx;
      standardTextColIndex = candidateStandardIdx;
      break;
    }
  }

  // 2. If a header row was detected, extract data rows below it
  if (headerRowIndex !== -1 && keyColIndex !== -1) {
    for (let r = headerRowIndex + 1; r < rows.length; r++) {
      const row = rows[r];
      const rawKey = row[keyColIndex]?.trim() || '';
      if (!rawKey) continue;

      // Ignore repeat header rows
      if (KEY_HEADER_SYNONYMS.has(normalizeHeader(rawKey))) continue;

      let val = '';
      if (revisedTextColIndex !== -1 && row[revisedTextColIndex]?.trim()) {
        val = row[revisedTextColIndex];
      } else if (standardTextColIndex !== -1 && row[standardTextColIndex] !== undefined) {
        val = row[standardTextColIndex];
      }

      if (rawKey && val !== undefined) {
        map[rawKey] = val;
      }
    }

    if (Object.keys(map).length > 0) {
      return map;
    }
  }

  // 3. Fallback heuristic: What if there is no header row or it wasn't recognized?
  // Check if rows have known key patterns (e.g., q1_..., header_..., persona_...)
  for (const row of rows) {
    if (row.length < 2) continue;

    // Check if column 0 looks like a text key (e.g. q1_question, header_yeg, etc.)
    const firstCell = (row[0] || '').trim();
    const isLikelyKey =
      /^(q\d+|header_|persona_|results_|compass_|nav_|share_|watch_|[a-z0-9_]{3,40})/i.test(firstCell) &&
      !firstCell.includes(' ');

    if (isLikelyKey) {
      // Find candidate text cell: prefer column 4 (like our inventory template) or column 1 or the longest text
      let candidateText = '';
      if (row[4] !== undefined && row[4].trim() !== '') {
        candidateText = row[4];
      } else if (row[1] !== undefined && row[1].trim() !== '') {
        candidateText = row[1];
      } else {
        candidateText = row.slice(1).reduce((longest, curr) => (curr.length > longest.length ? curr : longest), '');
      }

      if (firstCell && candidateText !== undefined) {
        map[firstCell] = candidateText;
      }
    }
  }

  // 4. CPR-RPP-EE Curbside Compass Tool Personas "persona definitions" tab support:
  // Detects if the sheet rows match persona names, and extracts Column I (index 8) or any column marked outcome
  let outcomeColIdx = -1;
  for (const row of rows.slice(0, 10)) {
    for (let c = 0; c < row.length; c++) {
      const cellNorm = normalizeHeader(row[c]);
      if (cellNorm.includes('outcome') || cellNorm === 'column i') {
        outcomeColIdx = c;
        break;
      }
    }
    if (outcomeColIdx !== -1) break;
  }
  if (outcomeColIdx === -1) {
    const maxCols = Math.max(...rows.map(r => r.length), 0);
    if (maxCols >= 9) {
      outcomeColIdx = 8; // Column I is index 8 (A=0, B=1, C=2, D=3, E=4, F=5, G=6, H=7, I=8)
    }
  }

  for (const row of rows) {
    if (row.length === 0) continue;
    let matchedPKey = '';
    for (let c = 0; c < Math.min(row.length, 3); c++) {
      const cleanName = (row[c] || '').trim().toLowerCase().replace(/[^a-z0-9 ]/g, '');
      if (PERSONA_NAME_TO_KEY[cleanName]) {
        matchedPKey = PERSONA_NAME_TO_KEY[cleanName];
        break;
      }
    }

    if (matchedPKey) {
      let outcomeText = '';
      if (outcomeColIdx !== -1 && row[outcomeColIdx]?.trim()) {
        outcomeText = row[outcomeColIdx].trim();
      } else if (row[8]?.trim()) {
        outcomeText = row[8].trim();
      }

      if (outcomeText) {
        map[`persona_${matchedPKey}_outcome`] = outcomeText;
        map[`persona_${matchedPKey}_edmonton_fit`] = outcomeText;
      }
    }
  }

  return map;
}

const PERSONA_NAME_TO_KEY: Record<string, string> = {
  'block resident': 'block_resident',
  'tidy resident': 'tidy_resident',
  'easy resident': 'tidy_resident',
  'picky parker': 'picky_parker',
  'safety parker': 'safety_parker',
  'safey parker': 'safety_parker',
  'rule resident': 'rule_resident',
  'balanced resident': 'balanced_resident',
  'happy resident': 'balanced_resident',
  'sensible parker': 'sensible_parker',
  'simple parker': 'sensible_parker',
  'fair parker': 'fair_parker',
  'happy parker': 'fair_parker',
  'easy neighbor': 'easy_neighbor',
  'easy neighbour': 'easy_neighbor',
  'chill neighbour': 'chill_neighbour',
  'chill neighbor': 'chill_neighbour',
  'simple driver': 'simple_driver',
  'casual cruiser': 'casual_cruiser',
  'happy neighbor': 'happy_neighbor',
  'happy neighbour': 'happy_neighbor',
  'zen neighbor': 'zen_neighbor',
  'zen neighbour': 'zen_neighbor',
  'happy driver': 'happy_driver',
  'free wheeler': 'free_wheeler'
};

/**
 * Applies fetched text overrides directly to the survey questions and persona models.
 */
export function applyTextsToData(texts: Record<string, string>): void {
  if (!texts || Object.keys(texts).length === 0) return;

  // 1. Survey Questions
  SURVEY_QUESTIONS.forEach((q) => {
    const qKey = `q${q.number}_question`;
    if (texts[qKey]) {
      q.text = texts[qKey];
    }

    const catKey = `q${q.number}_category`;
    if (texts[catKey]) {
      q.category = texts[catKey] as SurveyQuestion['category'];
    }

    if (q.options && q.options.length > 0) {
      const optAKey = `q${q.number}_option_a`;
      if (texts[optAKey] && q.options[0]) {
        q.options[0].label = texts[optAKey];
      }

      const optBKey = `q${q.number}_option_b`;
      if (texts[optBKey] && q.options[1]) {
        q.options[1].label = texts[optBKey];
      }

      const hintAKey = `q${q.number}_hint_a`;
      if (texts[hintAKey] && q.options[0]) {
        q.options[0].hint = texts[hintAKey];
      }

      const hintBKey = `q${q.number}_hint_b`;
      if (texts[hintBKey] && q.options[1]) {
        q.options[1].hint = texts[hintBKey];
      }
    }

    if (q.number === 9) {
      if (texts.q9_helper_text) q.helperText = texts.q9_helper_text;
      if (texts.q9_input_placeholder) q.placeholder = texts.q9_input_placeholder;
    }
  });

  // 2. Persona Profiles
  Object.keys(PERSONA_PROFILES).forEach((pKey) => {
    const profile = PERSONA_PROFILES[pKey];
    if (!profile) return;

    const titleKey = `persona_${pKey}_title`;
    if (texts[titleKey]) profile.title = texts[titleKey];

    const subtitleKey = `persona_${pKey}_subtitle`;
    if (texts[subtitleKey]) profile.subtitle = texts[subtitleKey];

    const descKey = `persona_${pKey}_desc`;
    if (texts[descKey]) profile.description = texts[descKey];

    const p1Key = `persona_${pKey}_priority_1`;
    const p2Key = `persona_${pKey}_priority_2`;
    if (texts[p1Key] || texts[p2Key]) {
      profile.keyPriorities = [
        texts[p1Key] || profile.keyPriorities[0] || '',
        texts[p2Key] || profile.keyPriorities[1] || ''
      ];
    }

    const fitKey = `persona_${pKey}_edmonton_fit`;
    const outcomeKey = `persona_${pKey}_outcome`;
    if (texts[outcomeKey]) {
      profile.outcome = texts[outcomeKey];
    }
    if (texts[fitKey]) {
      profile.edmontonPolicyFit = texts[fitKey];
    }
  });
}

/**
 * Automatically converts any user-provided Google Sheet link (edit, share, view, pubhtml)
 * into high-reliability direct CSV export URLs that support browser CORS.
 */
export function getGoogleSheetCandidateUrls(rawUrl: string): string[] {
  const url = (rawUrl || '').trim();
  if (!url) return [];

  // Local files or non-Google URLs
  if (!url.includes('docs.google.com/spreadsheets')) {
    return [url];
  }

  const candidates: string[] = [];

  // Extract sheet tab GID if present in query or hash
  const gidMatch = url.match(/[?&#]gid=([0-9]+)/);
  const gid = gidMatch ? gidMatch[1] : '';
  const gidParam = gid ? `&gid=${gid}` : '';

  // Case 1: Published to Web links (/d/e/2PACX-.../pubhtml or /pub)
  if (url.includes('/d/e/')) {
    const basePublished = url.replace(/\/pubhtml([?#].*)?$/, '/pub');
    const separator = basePublished.includes('?') ? '&' : '?';
    let pubCsvUrl = basePublished;
    if (!pubCsvUrl.includes('output=csv')) {
      pubCsvUrl = pubCsvUrl.replace(/output=[^&]+/, 'output=csv');
      if (!pubCsvUrl.includes('output=csv')) {
        pubCsvUrl = `${pubCsvUrl}${separator}output=csv`;
      }
    }
    if (gid && !pubCsvUrl.includes(`gid=${gid}`)) {
      pubCsvUrl += `&gid=${gid}`;
    }
    candidates.push(pubCsvUrl);
    if (!candidates.includes(url)) {
      candidates.push(url);
    }
    return candidates;
  }

  // Case 2: Standard Google Spreadsheet URL (/spreadsheets/d/{ID}/...)
  const docIdMatch = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (docIdMatch && docIdMatch[1]) {
    const docId = docIdMatch[1];

    // 1. Google Visualization API (GViz) CSV export - supports CORS for all sheets shared with link
    candidates.push(`https://docs.google.com/spreadsheets/d/${docId}/gviz/tq?tqx=out:csv${gidParam}`);
    // 2. Direct export format=csv
    candidates.push(`https://docs.google.com/spreadsheets/d/${docId}/export?format=csv${gidParam}`);
    // 3. Published endpoint
    candidates.push(`https://docs.google.com/spreadsheets/d/${docId}/pub?output=csv${gidParam}`);
  }

  // Fallback: the original URL
  if (!candidates.includes(url)) {
    candidates.push(url);
  }

  return candidates;
}

/**
 * Get active sheet URL from code default, local storage or environment.
 */
export function getActiveSheetUrl(): string {
  if (DEFAULT_GOOGLE_SHEET_URL && DEFAULT_GOOGLE_SHEET_URL.trim()) {
    try {
      const stored = localStorage.getItem(STORAGE_URL_KEY);
      // If user configured a custom URL in modal that is different and not local fallback, respect user preference
      if (stored && stored.trim() && stored !== '/curbside_compass_text_inventory.csv' && stored !== DEFAULT_GOOGLE_SHEET_URL) {
        return stored.trim();
      }
    } catch {
      // Ignore localStorage errors
    }
    return DEFAULT_GOOGLE_SHEET_URL.trim();
  }

  try {
    const stored = localStorage.getItem(STORAGE_URL_KEY);
    if (stored && stored.trim()) return stored.trim();
  } catch {
    // Ignore localStorage errors
  }

  const envUrl = (import.meta as unknown as { env?: { VITE_GOOGLE_SHEET_CSV_URL?: string } }).env?.VITE_GOOGLE_SHEET_CSV_URL;
  if (envUrl && envUrl.trim()) {
    return envUrl.trim();
  }

  return '';
}

/**
 * Save custom sheet URL.
 */
export function setActiveSheetUrl(url: string): void {
  try {
    if (!url || !url.trim()) {
      localStorage.removeItem(STORAGE_URL_KEY);
    } else {
      localStorage.setItem(STORAGE_URL_KEY, url.trim());
    }
  } catch {
    // Ignore localStorage errors
  }
}

/**
 * Read cached text overrides.
 */
export function getCachedTexts(): Record<string, string> {
  try {
    const data = localStorage.getItem(STORAGE_CACHED_TEXT_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch {
    // Ignore localStorage errors
  }
  return {};
}

/**
 * Save cached text overrides.
 */
export function saveCachedTexts(texts: Record<string, string>): void {
  try {
    localStorage.setItem(STORAGE_CACHED_TEXT_KEY, JSON.stringify(texts));
    localStorage.setItem(STORAGE_LAST_SYNC_KEY, new Date().toISOString());
  } catch {
    // Ignore localStorage errors
  }
}

/**
 * Clear cached text overrides and restore defaults.
 */
export function clearCachedTexts(): void {
  try {
    localStorage.removeItem(STORAGE_CACHED_TEXT_KEY);
    localStorage.removeItem(STORAGE_LAST_SYNC_KEY);
  } catch {
    // Ignore localStorage errors
  }
}

/**
 * Parses and applies text overrides directly from raw CSV/TSV text.
 */
export function syncFromCsvText(csvData: string): {
  success: boolean;
  itemCount: number;
  texts: Record<string, string>;
  error?: string;
} {
  if (!csvData || !csvData.trim()) {
    return {
      success: false,
      itemCount: 0,
      texts: {},
      error: 'CSV content is empty'
    };
  }

  if (isHtmlContent(csvData)) {
    return {
      success: false,
      itemCount: 0,
      texts: {},
      error:
        'The spreadsheet returned a webpage (HTML) instead of CSV data. Please ensure the Google Sheet is shared as "Anyone with the link can view", or use File > Share > Publish to web and select Comma-separated values (.csv).'
    };
  }

  const rows = parseCSV(csvData);
  if (rows.length === 0) {
    return {
      success: false,
      itemCount: 0,
      texts: {},
      error: 'Spreadsheet contains no valid rows'
    };
  }

  const texts = extractTextMapFromRows(rows);
  const keysCount = Object.keys(texts).length;

  if (keysCount === 0) {
    return {
      success: false,
      itemCount: 0,
      texts: {},
      error:
        'No valid text keys found in spreadsheet. Ensure the sheet has a "Text Key" column (e.g. q1_question, header_title_curbside) and an "On screen text" column.'
    };
  }

  // Apply to in-memory questions & personas
  applyTextsToData(texts);
  // Cache for offline/subsequent fast boots
  saveCachedTexts(texts);

  return {
    success: true,
    itemCount: keysCount,
    texts
  };
}

/**
 * Fetches and parses CSV from a Google Sheets URL or local CSV file.
 * Automatically handles Google Sheet edit links, view links, publish-to-web links,
 * CORS, and multi-line quoted fields.
 */
export async function fetchAndSyncTexts(targetUrl?: string): Promise<{
  success: boolean;
  itemCount: number;
  texts: Record<string, string>;
  error?: string;
}> {
  const inputUrl = (targetUrl || getActiveSheetUrl()).trim();

  if (!inputUrl) {
    return {
      success: false,
      itemCount: 0,
      texts: {},
      error: 'No Google Sheet URL configured'
    };
  }

  const candidateUrls = getGoogleSheetCandidateUrls(inputUrl);
  let lastError = '';
  let hadHtmlResponse = false;

  for (const candidate of candidateUrls) {
    try {
      let rawData = '';

      // 1. Try local server proxy first (bypasses browser CORS, iframe redirect blocks, and third-party cookie restrictions)
      if (candidate.startsWith('http://') || candidate.startsWith('https://')) {
        try {
          const proxyUrl = `/api/sheet-proxy?url=${encodeURIComponent(candidate)}&_cb=${Date.now()}`;
          const proxyResponse = await fetch(proxyUrl);
          if (proxyResponse.ok) {
            const proxyText = await proxyResponse.text();
            if (proxyText && !isHtmlContent(proxyText) && proxyText.trim().length > 0) {
              rawData = proxyText;
            }
          }
        } catch {
          // Fall back to direct browser fetch
        }
      }

      // 2. Direct browser fetch if proxy didn't return CSV
      if (!rawData) {
        const separator = candidate.includes('?') ? '&' : '?';
        const finalUrl = `${candidate}${separator}_cb=${Date.now()}`;

        const response = await fetch(finalUrl);
        if (!response.ok) {
          lastError = `HTTP ${response.status}: ${response.statusText}`;
          continue;
        }

        const directText = await response.text();
        if (isHtmlContent(directText)) {
          hadHtmlResponse = true;
          continue;
        }
        rawData = directText;
      }

      if (rawData) {
        const result = syncFromCsvText(rawData);
        if (result.success) {
          return result;
        } else if (result.error) {
          lastError = result.error;
        }
      }
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err);
    }
  }

  // If candidate URLs produced an HTML response, provide actionable instructions
  const friendlyError = hadHtmlResponse
    ? 'This Google Sheet requires access permissions or returned a webpage instead of CSV. Ensure the sheet is shared ("Anyone with the link can view") or published to web (File > Share > Publish to web > CSV).'
    : lastError || 'Failed to load spreadsheet. Please check the URL and sharing settings.';

  // Log as a warning so it informs the console without registering as a fatal app crash
  console.warn('[TextSync] Google Sheet sync notice:', friendlyError);

  return {
    success: false,
    itemCount: 0,
    texts: {},
    error: friendlyError
  };
}

