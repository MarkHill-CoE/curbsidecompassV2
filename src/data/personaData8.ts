import { PersonaResult } from '../types';

export const CUSTOM_PERSONAS_STORAGE_KEY = 'curbside_compass_custom_8_personas_v2';

export const DEFAULT_8_PERSONAS: Record<string, PersonaResult> = {
  // === QUADRANT 1: User-Paid & Regulated (Top-Right) ===
  user_funded_parker: {
    id: 'user_funded_parker',
    title: 'User-Funded Parker',
    subtitle: 'More Rules • User Fees & Permits',
    description: 'Your choices suggest you favour more rules to manage residential street parking, with program costs covered by users through fees and permits.',
    quadrant: 'Q1',
    xRange: 'user',
    yRange: 'restrictive',
    intensity: 'strong',
    targetCoordinates: { x: 10, y: -10 },
    stanceOnRegulations: 'Your choices suggest you favour more parking rules to manage demand for street parking.',
    stanceOnFunding: 'Your choices suggest you prefer that people using the residential parking program pay for it through fees and permits.',
    keyPriorities: ['More parking rules to manage demand', 'Users pay through fees and permits'],
    edmontonPolicyFit: 'Aligns with high-demand pedestrian corridors, entertainment districts, and university perimeters.',
    outcome: 'A regulated residential street parking program where parking rules manage high street parking demand, with program costs covered directly by users through fees and permits.',
    badgeColor: '#0081BC',
    legacyMergedTitles: ['User-Funded Parker', 'Safety Parker']
  },
  practical_parker: {
    id: 'practical_parker',
    title: 'Practical Parker',
    subtitle: 'Limited Restrictions • User Fees & Permits',
    description: 'Your choices suggest, you favour some parking rules while keeping restrictions limited, with program costs covered by users through permits and fees.',
    quadrant: 'Q1',
    xRange: 'user',
    yRange: 'restrictive',
    intensity: 'moderate',
    targetCoordinates: { x: 4, y: -4 },
    stanceOnRegulations: 'Your choices suggest you favour some parking rules while keeping restrictions limited.',
    stanceOnFunding: 'Your choices suggest you prefer that people using the residential parking program pay for it through fees and permits.',
    keyPriorities: ['Limited restrictions', 'Users pay through permits and fees'],
    edmontonPolicyFit: 'Aligns with targeted residential permit zones and transit-oriented communities.',
    outcome: 'A targeted curbside permit framework keeping restrictions limited while ensuring users cover program costs through permits and fees.',
    badgeColor: '#0081BC',
    legacyMergedTitles: ['Practical Parker', 'Picky Parker']
  },

  // === QUADRANT 2: Taxpayer-Funded & Regulated (Top-Left) ===
  city_funded_parker: {
    id: 'city_funded_parker',
    title: 'City-Funded Parker',
    subtitle: 'Firm Rules • Property Taxes',
    description: 'Your choices suggest, you favour clear parking rules to manage residential street parking, with program costs covered through property taxes.',
    quadrant: 'Q2',
    xRange: 'taxpayer',
    yRange: 'restrictive',
    intensity: 'strong',
    targetCoordinates: { x: -10, y: -10 },
    stanceOnRegulations: 'Your choices suggest you value clear and firm parking rules.',
    stanceOnFunding: 'Your choices suggest you prefer residential parking programs to be covered through property taxes.',
    keyPriorities: ['Clear and firm parking rules', 'Funded through property taxes'],
    edmontonPolicyFit: 'Aligns with mature residential neighbourhoods experiencing external hospital or commuter pressure.',
    outcome: 'A residential parking program with clear, firm parking rules to manage street parking, fully covered through municipal property taxes.',
    badgeColor: '#005087',
    legacyMergedTitles: ['City-Funded Parker', 'Block Resident']
  },
  flexible_parker: {
    id: 'flexible_parker',
    title: 'Flexible Parker',
    subtitle: 'Some Rules • Property Taxes',
    description: 'As a Flexible Parker, you favour some parking rules while keeping restrictions limited, with program costs funded through property taxes.',
    quadrant: 'Q2',
    xRange: 'taxpayer',
    yRange: 'restrictive',
    intensity: 'moderate',
    targetCoordinates: { x: -4, y: -4 },
    stanceOnRegulations: 'Your choices suggest you favour some parking rules while keeping restrictions limited.',
    stanceOnFunding: 'You think all residents should pay for residential parking programs to be covered through property taxes.',
    keyPriorities: ['Some rules with limited restrictions', 'All residents pay through property taxes'],
    edmontonPolicyFit: 'Aligns with standard residential parking guidelines in central mature communities.',
    outcome: 'A balanced residential parking program keeping restrictions limited, with program costs funded community-wide through property taxes.',
    badgeColor: '#005087',
    legacyMergedTitles: ['Flexible Parker', 'Balanced Resident']
  },

  // === QUADRANT 3: Taxpayer-Funded & Open Access (Bottom-Left) ===
  chill_neighbour: {
    id: 'chill_neighbour',
    title: 'Chill Neighbour',
    subtitle: 'Fewer Rules • Property Taxes',
    description: 'Your choices suggest you favour fewer restrictions and first-come, first-served residential street parking, with program costs covered through property taxes.',
    quadrant: 'Q3',
    xRange: 'taxpayer',
    yRange: 'open',
    intensity: 'strong',
    targetCoordinates: { x: -10, y: 10 },
    stanceOnRegulations: 'Your choices suggest you favour fewer parking rules, and first-come, first-served residential parking.',
    stanceOnFunding: 'Your choices suggest you prefer residential parking programs to be covered through property taxes.',
    keyPriorities: ['Fewer parking rules', 'First-come, first-served', 'Property tax funding'],
    edmontonPolicyFit: 'Aligns with low-density suburban neighbourhoods and quiet residential streets.',
    outcome: 'Open curbside parking with fewer restrictions and first-come, first-served street parking, fully covered through municipal property taxes.',
    badgeColor: '#009A44',
    legacyMergedTitles: ['Chill Neighbour', 'Zen Neighbour']
  },
  balanced_resident: {
    id: 'balanced_resident',
    title: 'Balanced Resident',
    subtitle: 'Situational Rules • Taxes & User Fees',
    description: 'Your choices suggest you favour different parking rules for different situations, with program costs covered by a combination of property taxes and user fees.',
    quadrant: 'Q3',
    xRange: 'taxpayer',
    yRange: 'open',
    intensity: 'moderate',
    targetCoordinates: { x: -4, y: 4 },
    stanceOnRegulations: 'Your choices suggest you favour different parking rules depending on the situation.',
    stanceOnFunding: 'Your choices suggest you prefer residential parking programs to be covered through both property taxes and user fees.',
    keyPriorities: ['Situational parking rules', 'Property taxes & user fees combined'],
    edmontonPolicyFit: 'Aligns with mixed-density and evolving residential neighbourhoods.',
    outcome: 'A adaptable parking framework tailoring rules to different neighbourhood situations, funded through a combination of property taxes and user fees.',
    badgeColor: '#009A44',
    legacyMergedTitles: ['Balanced Resident', 'Easy Neighbour']
  },

  // === QUADRANT 4: User-Paid & Open Access (Bottom-Right) ===
  casual_cruiser: {
    id: 'casual_cruiser',
    title: 'Casual Cruiser',
    subtitle: 'Fewer Rules • User Fees & Permits',
    description: 'Your choices suggest you favour fewer restrictions and first-come, first served residential street parking, with program costs covered by users through fees and permits.',
    quadrant: 'Q4',
    xRange: 'user',
    yRange: 'open',
    intensity: 'strong',
    targetCoordinates: { x: 10, y: 10 },
    stanceOnRegulations: 'Your choices suggest you favour fewer parking rules and first-come, first-served parking.',
    stanceOnFunding: 'Your choices suggest you prefer people using the residential parking program to pay for it through fees and permits.',
    keyPriorities: ['Fewer parking rules', 'First-come, first-served', 'Users pay through fees and permits'],
    edmontonPolicyFit: 'Aligns with commercial corridors, mixed-use infill streets, and retail parking edges.',
    outcome: 'An open-access street parking setup with fewer restrictions and first-come, first-served parking, supported by user fees and permits.',
    badgeColor: '#E6A100',
    legacyMergedTitles: ['Casual Cruiser', 'Free Wheeler']
  },
  balanced_neighbour: {
    id: 'balanced_neighbour',
    title: 'Balanced Neighbour',
    subtitle: 'Moderate Rules • User Fees & Permits',
    description: 'Your choices suggest you favour moderate parking rules and user-friendly programs, with program costs covered by users through fees and permits.',
    quadrant: 'Q4',
    xRange: 'user',
    yRange: 'open',
    intensity: 'moderate',
    targetCoordinates: { x: 4, y: 4 },
    stanceOnRegulations: 'Your choices suggest you favour moderate parking rules and that you would like a user-friendly program.',
    stanceOnFunding: 'Your choices suggest you prefer people using the residential parking program to pay for it through fees and permits.',
    keyPriorities: ['Moderate parking rules', 'User-friendly program', 'Users pay through fees and permits'],
    edmontonPolicyFit: 'Aligns with simplified user-paid parking zones and mixed-density areas.',
    outcome: 'A user-friendly residential parking program with moderate parking rules, funded by program users through permits and fees.',
    badgeColor: '#E6A100',
    legacyMergedTitles: ['Balanced Neighbour', 'Simple Driver']
  }
};

/**
 * Retrieve the current active 8 personas from localStorage, falling back to defaults.
 */
export function getActive8Personas(): Record<string, PersonaResult> {
  if (typeof window === 'undefined') return DEFAULT_8_PERSONAS;
  try {
    const raw = localStorage.getItem(CUSTOM_PERSONAS_STORAGE_KEY);
    if (!raw) return DEFAULT_8_PERSONAS;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && Object.keys(parsed).length >= 8) {
      return parsed as Record<string, PersonaResult>;
    }
  } catch (err) {
    console.warn('[Persona8] Failed reading custom personas from localStorage:', err);
  }
  return DEFAULT_8_PERSONAS;
}

/**
 * Save custom 8 personas to localStorage and notify listeners.
 */
export function saveActive8Personas(personas: Record<string, PersonaResult>): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CUSTOM_PERSONAS_STORAGE_KEY, JSON.stringify(personas));
    window.dispatchEvent(new Event('curbside_compass_personas_updated'));
  } catch (err) {
    console.error('[Persona8] Error saving custom personas:', err);
  }
}

/**
 * Reset personas back to standard City of Edmonton defaults.
 */
export function resetActive8Personas(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(CUSTOM_PERSONAS_STORAGE_KEY);
    window.dispatchEvent(new Event('curbside_compass_personas_updated'));
  } catch (err) {
    console.error('[Persona8] Error resetting custom personas:', err);
  }
}

/**
 * Calculate matching persona among the 8 archetypes using quadrant and intensity thresholds.
 */
export function calculate8Persona(totalX: number, totalY: number): PersonaResult {
  const personas = getActive8Personas();
  
  // Quadrant 1: User-Paid (X >= 0) & Regulated (Y < 0) - Top-Right
  if (totalX >= 0 && totalY < 0) {
    const isStrong = totalX >= 6 || totalY <= -6;
    return isStrong ? (personas.user_funded_parker || personas.safety_parker || DEFAULT_8_PERSONAS.user_funded_parker)
                    : (personas.practical_parker || personas.flexible_parker || DEFAULT_8_PERSONAS.practical_parker);
  }
  
  // Quadrant 2: Taxpayer-Funded (X < 0) & Regulated (Y < 0) - Top-Left
  if (totalX < 0 && totalY < 0) {
    const isStrong = totalX <= -6 || totalY <= -6;
    return isStrong ? (personas.city_funded_parker || personas.block_resident || DEFAULT_8_PERSONAS.city_funded_parker)
                    : (personas.flexible_parker || personas.balanced_resident || DEFAULT_8_PERSONAS.flexible_parker);
  }
  
  // Quadrant 3: Taxpayer-Funded (X < 0) & Open Access (Y >= 0) - Bottom-Left
  if (totalX < 0 && totalY >= 0) {
    const isStrong = totalX <= -6 || totalY >= 6;
    return isStrong ? (personas.chill_neighbour || personas.zen_neighbour || DEFAULT_8_PERSONAS.chill_neighbour)
                    : (personas.balanced_resident || DEFAULT_8_PERSONAS.balanced_resident);
  }
  
  // Quadrant 4: User-Paid (X >= 0) & Open Access (Y >= 0) - Bottom-Right
  const isStrong = totalX >= 6 || totalY >= 6;
  return isStrong ? (personas.casual_cruiser || DEFAULT_8_PERSONAS.casual_cruiser)
                  : (personas.balanced_neighbour || personas.simple_driver || DEFAULT_8_PERSONAS.balanced_neighbour);
}

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
  detectedQuadrant?: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  detectedIntensity?: 'moderate' | 'strong';
}

/**
 * Auto-detects quadrant and intensity from natural language stance strings.
 */
export function classifyStances(regText: string, fundText: string, personaTitle: string): {
  quadrant: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  intensity: 'moderate' | 'strong';
} {
  const regLower = (regText + ' ' + personaTitle).toLowerCase();
  const fundLower = (fundText + ' ' + personaTitle).toLowerCase();

  // Regulations axis: Negative = Strict / Restrictive / Regulated. Positive = Open / Few / Deregulated.
  const isStrict = regLower.includes('strict') || regLower.includes('tight') || regLower.includes('high') ||
                   regLower.includes('regulated') || regLower.includes('enforce') || regLower.includes('cap') ||
                   regLower.includes('safety') || regLower.includes('block') || regLower.includes('rule') ||
                   regLower.includes('firm') || regLower.includes('more parking rules');
  
  const isMinimal = regLower.includes('no rule') || regLower.includes('free') || regLower.includes('unrestricted') ||
                    regLower.includes('zen') || regLower.includes('chill') || regLower.includes('open') ||
                    regLower.includes('few') || regLower.includes('minimal') || regLower.includes('casual') ||
                    regLower.includes('first-come');

  // Funding axis: Negative = Taxpayer / Public / Shared / Property taxes. Positive = User-Fee / Direct / Permit / Driver pay / Fees.
  const isUserPay = fundLower.includes('user') || fundLower.includes('fee') || fundLower.includes('meter') ||
                    fundLower.includes('driver') || fundLower.includes('permit') || fundLower.includes('pay-per') ||
                    fundLower.includes('direct') || fundLower.includes('private');

  // Intensity determination
  const isStrong = regLower.includes('strict') || regLower.includes('strong') || regLower.includes('absolute') ||
                   regLower.includes('almost no') || fundLower.includes('strong') || fundLower.includes('100%') ||
                   fundLower.includes('all residents') || regLower.includes('safety') || regLower.includes('firm') ||
                   regLower.includes('fewer parking rules');

  let quadrant: 'Q1' | 'Q2' | 'Q3' | 'Q4' = 'Q1';

  if (isUserPay && (isStrict || !isMinimal)) {
    quadrant = 'Q1'; // User-Fee + Regulated
  } else if (!isUserPay && (isStrict || !isMinimal)) {
    quadrant = 'Q2'; // Taxpayer + Regulated
  } else if (!isUserPay && isMinimal) {
    quadrant = 'Q3'; // Taxpayer + Open
  } else {
    quadrant = 'Q4'; // User-Fee + Open
  }

  return {
    quadrant,
    intensity: isStrong ? 'strong' : 'moderate'
  };
}

/**
 * Ingests a CSV (supports both 4-column and 9-column formats)
 * and returns the 8 structured PersonaResult objects.
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

  // Find column indices with colon and space stripping
  const header = rows[0].map(h => h.trim().toLowerCase().replace(/:/g, ''));
  
  const idIdx = header.findIndex(h => h === 'id' || h.startsWith('id'));
  let personaIdx = header.findIndex(h => h === 'persona' || h.includes('title') || h.includes('name'));
  let regIdx = header.findIndex(h => h.includes('regulation') || h.includes('rules') || h.includes('regulatory'));
  let fundIdx = header.findIndex(h => h.includes('funding') || h.includes('fiscal') || h.includes('cost') || h.includes('tax'));
  let descIdx = header.findIndex(h => h.includes('desc') || h.includes('summary') || h.includes('detail'));
  const quadIdx = header.findIndex(h => h.includes('quadrant'));
  const intIdx = header.findIndex(h => h.includes('intensity'));

  // Defaults if headers don't strictly match
  if (personaIdx === -1 && idIdx !== -1) personaIdx = idIdx;
  if (personaIdx === -1) personaIdx = 0;
  if (regIdx === -1) regIdx = 1;
  if (fundIdx === -1) fundIdx = 2;
  if (descIdx === -1) descIdx = 3;

  const dataRows = rows.slice(1).filter(r => r.some(c => c.trim().length > 0));

  if (dataRows.length < 1) {
    return { success: false, error: 'No data rows found in CSV.' };
  }

  const parsedList: ParsedCsvPersonaRow[] = [];

  dataRows.forEach((r) => {
    const rawId = (idIdx !== -1 ? r[idIdx] : '') || '';
    const persona = r[personaIdx] || rawId || '';
    const stanceOnRegulations = r[regIdx] || '';
    const stanceOnFunding = r[fundIdx] || '';
    const description = r[descIdx] || '';

    let quad: 'Q1' | 'Q2' | 'Q3' | 'Q4' | undefined;
    if (quadIdx !== -1 && r[quadIdx]) {
      const qVal = r[quadIdx].trim().toUpperCase();
      if (['Q1', 'Q2', 'Q3', 'Q4'].includes(qVal)) {
        quad = qVal as 'Q1' | 'Q2' | 'Q3' | 'Q4';
      }
    }

    let intensity: 'moderate' | 'strong' | undefined;
    if (intIdx !== -1 && r[intIdx]) {
      const iVal = r[intIdx].trim().toLowerCase();
      if (iVal === 'strong' || iVal === 'moderate') {
        intensity = iVal as 'moderate' | 'strong';
      }
    }

    if (!quad || !intensity) {
      const detected = classifyStances(stanceOnRegulations, stanceOnFunding, persona);
      if (!quad) quad = detected.quadrant;
      if (!intensity) intensity = detected.intensity;
    }

    if (persona) {
      parsedList.push({
        persona,
        stanceOnRegulations,
        stanceOnFunding,
        description,
        detectedQuadrant: quad,
        detectedIntensity: intensity
      });
    }
  });

  // Target 8 slots: 2 per quadrant (1 strong, 1 moderate)
  const targetSlots: Record<string, PersonaResult> = { ...DEFAULT_8_PERSONAS };
  
  // Mapping matrix
  const slotKeys: Record<string, string> = {
    'Q1_strong': 'user_funded_parker',
    'Q1_moderate': 'practical_parker',
    'Q2_strong': 'city_funded_parker',
    'Q2_moderate': 'flexible_parker',
    'Q3_strong': 'chill_neighbour',
    'Q3_moderate': 'balanced_resident',
    'Q4_strong': 'casual_cruiser',
    'Q4_moderate': 'balanced_neighbour'
  };

  const assignedSlotKeys = new Set<string>();

  // Assign rows that match quadrant + intensity
  parsedList.forEach((row, idx) => {
    const q = row.detectedQuadrant || 'Q1';
    const intensity = row.detectedIntensity || 'moderate';
    let slotKey = `${q}_${intensity}`;

    // If slot already taken, try other intensity in same quadrant
    if (assignedSlotKeys.has(slotKey)) {
      const altIntensity = intensity === 'strong' ? 'moderate' : 'strong';
      slotKey = `${q}_${altIntensity}`;
    }

    // Fallback: If still taken, assign to next unfilled slot
    if (assignedSlotKeys.has(slotKey)) {
      const allPossible = Object.keys(slotKeys);
      const remaining = allPossible.find(k => !assignedSlotKeys.has(k));
      if (remaining) slotKey = remaining;
    }

    const personaKey = slotKeys[slotKey] || Object.values(slotKeys)[idx % 8];
    assignedSlotKeys.add(slotKey);

    const base = DEFAULT_8_PERSONAS[personaKey];
    if (base) {
      targetSlots[personaKey] = {
        ...base,
        title: row.persona || base.title,
        description: row.description || base.description,
        stanceOnRegulations: row.stanceOnRegulations || base.stanceOnRegulations,
        stanceOnFunding: row.stanceOnFunding || base.stanceOnFunding,
        subtitle: `${row.stanceOnRegulations || base.stanceOnRegulations} • ${row.stanceOnFunding || base.stanceOnFunding}`.slice(0, 48)
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
 * Format active 8 personas into a clean 9-column CSV string.
 */
export function exportPersonasToCsv(personas?: Record<string, PersonaResult>): string {
  const pMap = personas || getActive8Personas();
  const headers = ['id', 'title', 'stanceOnRegulations', 'stanceOnFunding', 'Description', 'quadrant', 'xRange', 'yRange', 'intensity'];
  
  const rows = (Object.values(pMap) as PersonaResult[]).map((p: PersonaResult) => {
    const cleanId = `"${(p.id || '').replace(/"/g, '""')}"`;
    const cleanTitle = `"${(p.title || '').replace(/"/g, '""')}"`;
    const cleanReg = `"${(p.stanceOnRegulations || '').replace(/"/g, '""')}"`;
    const cleanFund = `"${(p.stanceOnFunding || '').replace(/"/g, '""')}"`;
    const cleanDesc = `"${(p.description || '').replace(/"/g, '""')}"`;
    const cleanQuad = p.quadrant || 'Q1';
    const cleanX = p.xRange || 'user';
    const cleanY = p.yRange || 'restrictive';
    const cleanIntensity = p.intensity || 'moderate';
    return [cleanId, cleanTitle, cleanReg, cleanFund, cleanDesc, cleanQuad, cleanX, cleanY, cleanIntensity].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}
