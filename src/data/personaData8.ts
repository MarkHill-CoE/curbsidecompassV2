import { PersonaResult } from '../types';

export const CUSTOM_PERSONAS_STORAGE_KEY = 'curbside_compass_custom_4_personas_v1';

export const DEFAULT_4_PERSONAS: Record<string, PersonaResult> = {
  // === QUADRANT 1: User-Paid & Regulated (Top-Right) ===
  permit_planner: {
    id: 'permit_planner',
    title: 'Permit Planner',
    subtitle: 'More Rules • User Fees & Permits',
    description: 'Your choices suggest you favour more rules to manage competing parking needs, with program costs covered through user fees.',
    quadrant: 'Q1',
    xRange: 'user',
    yRange: 'restrictive',
    intensity: 'strong',
    targetCoordinates: { x: 10, y: -10 },
    stanceOnRegulations: 'Your choices suggest you favour more parking rules to manage demand for street parking.',
    stanceOnFunding: 'Your choices suggest you favour covering residential parking program costs through fees paid by program users.',
    keyPriorities: [
      'More parking rules to manage demand',
      'Program costs covered through user fees'
    ],
    edmontonPolicyFit: 'Aligns with high-demand residential permit zones and corridors where program costs are funded by participating permit holders.',
    outcome: 'More rules can help manage competition for street parking, but may limit when or how people can park. User fees place program costs on those who use it, adding an expense for people who rely on street parking.',
    badgeColor: '#0081BC',
    legacyMergedTitles: ['User-Funded Parker', 'Safety Parker', 'Practical Parker', 'Picky Parker', 'Fair Parker', 'Sensible Parker']
  },

  // === QUADRANT 2: Taxpayer-Funded & Regulated (Top-Left) ===
  community_coordinator: {
    id: 'community_coordinator',
    title: 'Community Coordinator',
    subtitle: 'More Rules • Property Taxes',
    description: 'Your choices suggest you favour more rules to manage competing parking needs, with program costs shared through property taxes.',
    quadrant: 'Q2',
    xRange: 'taxpayer',
    yRange: 'restrictive',
    intensity: 'strong',
    targetCoordinates: { x: -10, y: -10 },
    stanceOnRegulations: 'Your choices suggest you favour more parking rules to manage demand for street parking.',
    stanceOnFunding: 'Your choices suggest you favour covering residential parking program costs through property taxes.',
    keyPriorities: [
      'More parking rules to manage demand',
      'Program costs covered through property taxes'
    ],
    edmontonPolicyFit: 'Aligns with regulated residential neighbourhoods where parking management is funded as a shared municipal service via property taxes.',
    outcome: 'More rules can help manage competition for street parking, but may limit when or how people can park. Property tax funding spreads program costs across taxpayers, including those who do not use the program.',
    badgeColor: '#005087',
    legacyMergedTitles: ['City-Funded Parker', 'Block Resident', 'Flexible Parker', 'Rule Resident', 'Tidy Resident', 'Balanced Resident']
  },

  // === QUADRANT 3: Taxpayer-Funded & Open Access (Bottom-Left) ===
  community_cruiser: {
    id: 'community_cruiser',
    title: 'Community Cruiser',
    subtitle: 'Fewer Rules • Property Taxes',
    description: 'Your choices suggest you favour fewer parking restrictions, with program costs shared through property taxes.',
    quadrant: 'Q3',
    xRange: 'taxpayer',
    yRange: 'open',
    intensity: 'strong',
    targetCoordinates: { x: -10, y: 10 },
    stanceOnRegulations: 'Your choices suggest you favour fewer restrictions on street parking.',
    stanceOnFunding: 'Your choices suggest you favour covering residential parking program costs through property taxes.',
    keyPriorities: [
      'Fewer parking restrictions',
      'Program costs covered through property taxes'
    ],
    edmontonPolicyFit: 'Aligns with open-access residential streets prioritizing convenience and flexibility, funded community-wide through property taxes.',
    outcome: 'Fewer restrictions give people more flexibility to park, but can increase competition for spaces where demand is high. Property tax funding spreads program costs across taxpayers, including those who do not use the program.',
    badgeColor: '#009A44',
    legacyMergedTitles: ['Chill Neighbour', 'Zen Neighbour', 'Balanced Resident', 'Easy Neighbour', 'Happy Neighbour']
  },

  // === QUADRANT 4: User-Paid & Open Access (Bottom-Right) ===
  casual_cruiser: {
    id: 'casual_cruiser',
    title: 'Casual Cruiser',
    subtitle: 'Fewer Rules • User Fees & Permits',
    description: 'Your choices suggest you favour fewer parking restrictions, with program costs covered through user fees.',
    quadrant: 'Q4',
    xRange: 'user',
    yRange: 'open',
    intensity: 'strong',
    targetCoordinates: { x: 10, y: 10 },
    stanceOnRegulations: 'Your choices suggest you favour fewer restrictions on street parking.',
    stanceOnFunding: 'Your choices suggest you favour covering residential parking program costs through fees paid by program users.',
    keyPriorities: [
      'Fewer parking restrictions',
      'Program costs covered through user fees'
    ],
    edmontonPolicyFit: 'Aligns with flexible street parking with minimal restrictions, where administrative and maintenance costs are paid directly by users.',
    outcome: 'Fewer restrictions give people more flexibility to park, but can increase competition for spaces where demand is high. User fees place program costs on those who use it, adding an expense for people who rely on street parking.',
    badgeColor: '#E6A100',
    legacyMergedTitles: ['Casual Cruiser', 'Free Wheeler', 'Balanced Neighbour', 'Simple Driver', 'Happy Driver']
  }
};

// Aliases for compatibility
export const DEFAULT_8_PERSONAS = DEFAULT_4_PERSONAS;

/**
 * Retrieve the current active 4 personas from localStorage, falling back to defaults.
 */
export function getActive4Personas(): Record<string, PersonaResult> {
  if (typeof window === 'undefined') return DEFAULT_4_PERSONAS;
  try {
    const raw = localStorage.getItem(CUSTOM_PERSONAS_STORAGE_KEY);
    if (!raw) return DEFAULT_4_PERSONAS;
    const parsed = JSON.parse(raw);
    if (
      parsed &&
      typeof parsed === 'object' &&
      parsed.permit_planner &&
      parsed.community_coordinator &&
      parsed.community_cruiser &&
      parsed.casual_cruiser
    ) {
      return parsed as Record<string, PersonaResult>;
    }
  } catch (err) {
    console.warn('[Persona4] Failed reading custom personas from localStorage:', err);
  }
  return DEFAULT_4_PERSONAS;
}

export const getActive8Personas = getActive4Personas;

/**
 * Save custom 4 personas to localStorage and notify listeners.
 */
export function saveActive4Personas(personas: Record<string, PersonaResult>): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CUSTOM_PERSONAS_STORAGE_KEY, JSON.stringify(personas));
    window.dispatchEvent(new Event('curbside_compass_personas_updated'));
  } catch (err) {
    console.error('[Persona4] Error saving custom personas:', err);
  }
}

export const saveActive8Personas = saveActive4Personas;

/**
 * Reset personas back to standard City of Edmonton defaults.
 */
export function resetActive4Personas(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(CUSTOM_PERSONAS_STORAGE_KEY);
    window.dispatchEvent(new Event('curbside_compass_personas_updated'));
  } catch (err) {
    console.error('[Persona4] Error resetting custom personas:', err);
  }
}

export const resetActive8Personas = resetActive4Personas;

/**
 * Calculate matching persona among the 4 simplified archetypes (one per quadrant).
 */
export function calculate4Persona(totalX: number, totalY: number): PersonaResult {
  const personas = getActive4Personas();

  // Quadrant 1: User-Paid (X >= 0) & Regulated (Y < 0) - Top-Right
  if (totalX >= 0 && totalY < 0) {
    return personas.permit_planner || DEFAULT_4_PERSONAS.permit_planner;
  }

  // Quadrant 2: Taxpayer-Funded (X < 0) & Regulated (Y < 0) - Top-Left
  if (totalX < 0 && totalY < 0) {
    return personas.community_coordinator || DEFAULT_4_PERSONAS.community_coordinator;
  }

  // Quadrant 3: Taxpayer-Funded (X < 0) & Open Access (Y >= 0) - Bottom-Left
  if (totalX < 0 && totalY >= 0) {
    return personas.community_cruiser || DEFAULT_4_PERSONAS.community_cruiser;
  }

  // Quadrant 4: User-Paid (X >= 0) & Open Access (Y >= 0) - Bottom-Right
  return personas.casual_cruiser || DEFAULT_4_PERSONAS.casual_cruiser;
}

export const calculate8Persona = calculate4Persona;

/**
 * Helper to parse CSV text into rows respecting quotes and commas.
 */
export function parseCsvRows(text: string): string[][] {
  const lines: string[][] = [];
  let row: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      row.push(current.trim());
      current = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      row.push(current.trim());
      current = '';
      if (row.some(cell => cell.length > 0)) {
        lines.push(row);
      }
      row = [];
    } else {
      current += char;
    }
  }

  if (current.length > 0 || row.length > 0) {
    row.push(current.trim());
    if (row.some(cell => cell.length > 0)) {
      lines.push(row);
    }
  }

  return lines;
}

export interface ParsedCsvPersonaRow {
  persona: string;
  stanceOnRegulations: string;
  stanceOnFunding: string;
  description: string;
  outcome?: string;
  keyPriorities?: string[];
  detectedQuadrant: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  detectedIntensity: 'strong';
}

/**
 * Auto-detects quadrant from natural language stance strings or header hints.
 */
export function classifyStances(regText: string, fundText: string, quadHint?: string): 'Q1' | 'Q2' | 'Q3' | 'Q4' {
  if (quadHint) {
    const upper = quadHint.toUpperCase();
    if (upper.includes('Q1')) return 'Q1';
    if (upper.includes('Q2')) return 'Q2';
    if (upper.includes('Q3')) return 'Q3';
    if (upper.includes('Q4')) return 'Q4';
  }

  const fundLower = fundText.toLowerCase();
  const regLower = regText.toLowerCase();

  const isUserPay = fundLower.includes('user') || fundLower.includes('permit') || fundLower.includes('fee');
  const isMoreRules = regLower.includes('more') || regLower.includes('manage') || regLower.includes('rule');

  if (isUserPay && isMoreRules) return 'Q1';
  if (!isUserPay && isMoreRules) return 'Q2';
  if (!isUserPay && !isMoreRules) return 'Q3';
  return 'Q4';
}

/**
 * Ingests a CSV (supports 8-column City of Edmonton format)
 * and returns the 4 structured PersonaResult objects (one per quadrant).
 */
export function parsePersonasFromCsv(csvText: string): {
  success: boolean;
  personas?: Record<string, PersonaResult>;
  parsedRows?: ParsedCsvPersonaRow[];
  error?: string;
} {
  const rows = parseCsvRows(csvText);
  if (rows.length < 2) {
    return { success: false, error: 'CSV must contain at least a header row and data rows.' };
  }

  const header = rows[0].map(h => h.trim().toLowerCase().replace(/:/g, ''));

  const quadIdx = header.findIndex(h => h.includes('quadrant'));
  const intIdx = header.findIndex(h => h.includes('intensity'));
  let nameIdx = header.findIndex(h => h === 'name' || h === 'persona' || h.includes('title'));
  let regIdx = header.findIndex(h => h.includes('regulation') || h.includes('rules'));
  let fundIdx = header.findIndex(h => h.includes('funding') || h.includes('tax') || h.includes('fee'));
  const believeIdx = header.findIndex(h => h.includes('believe') || h.includes('priorit'));
  const outcomeIdx = header.findIndex(h => h.includes('outcome') || h.includes('trade-off') || h.includes('tradeoff'));
  let profileIdx = header.findIndex(h => h.includes('profile') || h.includes('desc'));

  if (nameIdx === -1) nameIdx = 2;
  if (regIdx === -1) regIdx = 3;
  if (fundIdx === -1) fundIdx = 4;
  if (profileIdx === -1) profileIdx = header.length - 1;

  const dataRows = rows.slice(1).filter(r => r.some(c => c.trim().length > 0));

  if (dataRows.length < 1) {
    return { success: false, error: 'No data rows found in CSV.' };
  }

  const targetSlots: Record<string, PersonaResult> = { ...DEFAULT_4_PERSONAS };
  const parsedList: ParsedCsvPersonaRow[] = [];

  const quadKeys: Record<'Q1' | 'Q2' | 'Q3' | 'Q4', string> = {
    Q1: 'permit_planner',
    Q2: 'community_coordinator',
    Q3: 'community_cruiser',
    Q4: 'casual_cruiser'
  };

  dataRows.forEach((r) => {
    const rawQuad = quadIdx !== -1 ? r[quadIdx] : '';
    const name = r[nameIdx] || '';
    const stanceOnRegulations = regIdx !== -1 ? r[regIdx] : '';
    const stanceOnFunding = fundIdx !== -1 ? r[fundIdx] : '';
    const rawBelieve = believeIdx !== -1 ? r[believeIdx] : '';
    const outcome = outcomeIdx !== -1 ? r[outcomeIdx] : '';
    const description = r[profileIdx] || '';

    const quadrant = classifyStances(stanceOnRegulations, stanceOnFunding, rawQuad);
    const slotKey = quadKeys[quadrant];

    const priorities = rawBelieve
      ? rawBelieve.split(';').map(p => p.trim()).filter(Boolean)
      : targetSlots[slotKey]?.keyPriorities || [];

    const parsedRow: ParsedCsvPersonaRow = {
      persona: name || targetSlots[slotKey]?.title || 'Persona',
      stanceOnRegulations,
      stanceOnFunding,
      description: description || targetSlots[slotKey]?.description || '',
      outcome: outcome || targetSlots[slotKey]?.outcome || '',
      keyPriorities: priorities,
      detectedQuadrant: quadrant,
      detectedIntensity: 'strong'
    };

    parsedList.push(parsedRow);

    if (targetSlots[slotKey]) {
      targetSlots[slotKey] = {
        ...targetSlots[slotKey],
        title: name || targetSlots[slotKey].title,
        description: description || targetSlots[slotKey].description,
        stanceOnRegulations: stanceOnRegulations || targetSlots[slotKey].stanceOnRegulations,
        stanceOnFunding: stanceOnFunding || targetSlots[slotKey].stanceOnFunding,
        outcome: outcome || targetSlots[slotKey].outcome,
        keyPriorities: priorities.length > 0 ? priorities : targetSlots[slotKey].keyPriorities
      };
    }
  });

  return {
    success: true,
    personas: targetSlots,
    parsedRows: parsedList
  };
}

/**
 * Exports current 4 personas to the standard 8-column CSV structure.
 */
export function exportPersonasToCsv(personas?: Record<string, PersonaResult>): string {
  const pMap = personas || getActive4Personas();
  const header = 'quadrant,intensity,name,stance on regulations,stance on funding,what they believe,trade-off outcomes,their profile';

  const order: Array<keyof typeof DEFAULT_4_PERSONAS> = [
    'permit_planner',
    'community_coordinator',
    'community_cruiser',
    'casual_cruiser'
  ];

  const quadLabels: Record<string, string> = {
    Q1: 'Q1 - User-Paid & Regulated',
    Q2: 'Q2 - Taxpayer-Funded & Regulated',
    Q3: 'Q3 - Taxpayer-Funded & Open Access',
    Q4: 'Q4 - User-Paid & Open Access'
  };

  const rows = order.map((key) => {
    const p = pMap[key] || DEFAULT_4_PERSONAS[key];
    const qLabel = quadLabels[p.quadrant] || `${p.quadrant}`;
    const intensity = 'Strong';
    const name = p.title;
    const regStance = p.stanceOnRegulations || '';
    const fundStance = p.stanceOnFunding || '';
    const believe = p.keyPriorities ? p.keyPriorities.join('; ') : '';
    const outcome = p.outcome || '';
    const profile = p.description || '';

    const escape = (val: string) => `"${val.replace(/"/g, '""').trim()}"`;

    return [
      escape(qLabel),
      escape(intensity),
      escape(name),
      escape(regStance),
      escape(fundStance),
      escape(believe),
      escape(outcome),
      escape(profile)
    ].join(',');
  });

  return [header, ...rows].join('\n');
}
