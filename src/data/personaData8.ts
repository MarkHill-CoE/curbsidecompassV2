import { PersonaResult } from '../types';

export const CUSTOM_PERSONAS_STORAGE_KEY = 'curbside_compass_custom_8_personas';

export const DEFAULT_8_PERSONAS: Record<string, PersonaResult> = {
  // === QUADRANT 1: User-Fee & Regulated (Top-Right) ===
  safety_parker: {
    id: 'safety_parker',
    title: 'Safety Parker',
    subtitle: 'Strict Regulations • Direct User-Fee',
    description: 'You believe high-demand curb space must be strictly regulated with permit caps and dedicated loading/safety zones. Car owners should pay for their own parking through permits and user fees, not everyone through taxes.',
    quadrant: 'Q1',
    xRange: 'user',
    yRange: 'restrictive',
    intensity: 'strong',
    targetCoordinates: { x: 10, y: -10 },
    stanceOnRegulations: 'Strict safety rules, capped household permits, and active parking enforcement.',
    stanceOnFunding: 'Direct user fees, paid permits, and full cost recovery from drivers.',
    keyPriorities: ['Strict safety enforcement', 'Direct user fees'],
    edmontonPolicyFit: 'Aligns with high-demand pedestrian safety corridors, entertainment districts, and university perimeters.',
    outcome: 'Strictly regulated curbside corridors with rigorous user-fee permits, dedicated loading zones, and active enforcement funded entirely by users and violation penalties.',
    badgeColor: '#0081BC',
    legacyMergedTitles: ['Safety Parker', 'Fair Parker']
  },
  flexible_parker: {
    id: 'flexible_parker',
    title: 'Flexible Parker',
    subtitle: 'Clear Rules • Modest User-Fee',
    description: 'You prefer clear, structured parking rules to maintain neighbourhood order. You support reasonable user fees and visitor passes to cover operating costs without heavy taxpayer subsidization.',
    quadrant: 'Q1',
    xRange: 'user',
    yRange: 'restrictive',
    intensity: 'moderate',
    targetCoordinates: { x: 4, y: -4 },
    stanceOnRegulations: 'Defined parking guidelines with reasonable time limits and permit oversight.',
    stanceOnFunding: 'Targeted user fees and digital permits covering program operating costs.',
    keyPriorities: ['Clear guidelines', 'User-pay model'],
    edmontonPolicyFit: 'Aligns with targeted residential permit zones and transit-oriented communities.',
    outcome: 'A targeted, user-funded permit system where on-street parking requires direct vehicle permits and user fees, ensuring local residents and visitors who use the curb cover the program\'s operating costs.',
    badgeColor: '#0081BC',
    legacyMergedTitles: ['Picky Parker', 'Sensible Parker']
  },

  // === QUADRANT 2: Taxpayer-Funded & Regulated (Top-Left) ===
  block_resident: {
    id: 'block_resident',
    title: 'Block Resident',
    subtitle: 'Strict Regulations • General Taxation',
    description: 'You want strict parking rules and defined time limits to protect neighbourhood curb space. You strongly believe everyone should share the costs through general municipal taxes rather than charging drivers separate fees.',
    quadrant: 'Q2',
    xRange: 'taxpayer',
    yRange: 'restrictive',
    intensity: 'strong',
    targetCoordinates: { x: -10, y: -10 },
    stanceOnRegulations: 'Strict enforcement and capped permits to preserve neighbourhood order.',
    stanceOnFunding: 'City-wide property taxes and general municipal revenues; no user permit fees.',
    keyPriorities: ['Strict enforcement', 'General tax funding'],
    edmontonPolicyFit: 'Aligns with mature residential neighbourhoods experiencing external hospital or institutional commuter pressure.',
    outcome: 'A strictly regulated residential permit zone where on-street parking is closely monitored, permits are capped per household, and municipal program costs are funded through general property taxes to preserve neighbourhood curb space.',
    badgeColor: '#005087',
    legacyMergedTitles: ['Block Resident', 'Rule Resident']
  },
  balanced_resident: {
    id: 'balanced_resident',
    title: 'Balanced Resident',
    subtitle: 'Fair Balance • Shared Costs',
    description: 'You like a fair balance of parking rules to keep residential streets neat. You believe everyone should share the program costs through general municipal taxes, keeping on-street parking free and accessible.',
    quadrant: 'Q2',
    xRange: 'taxpayer',
    yRange: 'restrictive',
    intensity: 'moderate',
    targetCoordinates: { x: -4, y: -4 },
    stanceOnRegulations: 'Moderate guidelines to manage street congestion without excessive ticketing.',
    stanceOnFunding: 'Shared municipal property taxes; free access for neighbourhood residents.',
    keyPriorities: ['Balanced access', 'Community funding'],
    edmontonPolicyFit: 'Aligns with standard residential parking guidelines in central mature communities.',
    outcome: 'Standard residential parking guidelines funded through municipal taxes with basic time restrictions during peak hours to keep streets orderly while sharing public costs community-wide.',
    badgeColor: '#005087',
    legacyMergedTitles: ['Tidy Resident', 'Balanced Resident']
  },

  // === QUADRANT 3: Taxpayer-Funded & Open Access (Bottom-Left) ===
  zen_neighbour: {
    id: 'zen_neighbour',
    title: 'Zen Neighbour',
    subtitle: 'Almost No Rules • Strong Taxpayer',
    description: 'You want maximum parking freedom with virtually no restrictions, time limits, or permit bureaucracy. You strongly believe the street curb is a universal public asset funded entirely through general property taxes.',
    quadrant: 'Q3',
    xRange: 'taxpayer',
    yRange: 'open',
    intensity: 'strong',
    targetCoordinates: { x: -10, y: 10 },
    stanceOnRegulations: 'Unrestricted, open curbside parking with no permit caps or time limits.',
    stanceOnFunding: '100% public funding through general municipal taxation.',
    keyPriorities: ['Complete freedom', 'Fully public funding'],
    edmontonPolicyFit: 'Aligns with low-density suburban neighbourhoods and developing communities.',
    outcome: 'Maximum parking freedom with no permit restrictions or time limits, treating the curbside as a universal public amenity fully supported by the city\'s general operating budget.',
    badgeColor: '#009A44',
    legacyMergedTitles: ['Happy Neighbour', 'Zen Neighbour']
  },
  chill_neighbour: {
    id: 'chill_neighbour',
    title: 'Chill Neighbour',
    subtitle: 'Few Rules • Shared Costs',
    description: 'You prefer having few parking rules to keep everyday life easy and stress-free. You believe everyone should share the maintenance costs through taxes rather than burdening drivers with permits.',
    quadrant: 'Q3',
    xRange: 'taxpayer',
    yRange: 'open',
    intensity: 'moderate',
    targetCoordinates: { x: -4, y: 4 },
    stanceOnRegulations: 'Minimal rules; reliance on informal neighbourhood courtesy.',
    stanceOnFunding: 'Shared municipal taxation; free parking access across the community.',
    keyPriorities: ['Minimal restrictions', 'Publicly funded'],
    edmontonPolicyFit: 'Aligns with quiet suburban laned communities and residential cul-de-sacs.',
    outcome: 'Low-density residential streets with relaxed parking regulations, relying on informal neighbourhood courtesy and broad municipal funding rather than active enforcement.',
    badgeColor: '#009A44',
    legacyMergedTitles: ['Easy Neighbour', 'Chill Neighbour']
  },

  // === QUADRANT 4: User-Paid & Open Access (Bottom-Right) ===
  casual_cruiser: {
    id: 'casual_cruiser',
    title: 'Casual Cruiser',
    subtitle: 'Very Few Rules • Direct User-Fee',
    description: 'You like very few parking rules on residential streets, allowing first-come first-served parking. However, you strongly believe car owners must pay for their own parking through metered rates or pay-per-use fees instead of taxpayer subsidies.',
    quadrant: 'Q4',
    xRange: 'user',
    yRange: 'open',
    intensity: 'strong',
    targetCoordinates: { x: 10, y: 10 },
    stanceOnRegulations: 'Open curbside access without residential permit restrictions or caps.',
    stanceOnFunding: 'Direct user-pay model via pay-per-use fees or commercial meter zones.',
    keyPriorities: ['Unrestricted access', 'Direct user payments'],
    edmontonPolicyFit: 'Aligns with commercial corridors, mixed-use infill streets, and retail parking edges.',
    outcome: 'Largely unregulated public curbside parking supported by targeted metered zones only in commercial areas, allowing drivers full mobility with pay-per-use convenience.',
    badgeColor: '#E6A100',
    legacyMergedTitles: ['Free Wheeler', 'Casual Cruiser']
  },
  simple_driver: {
    id: 'simple_driver',
    title: 'Simple Driver',
    subtitle: 'Simple Rules • Light User Fees',
    description: 'You want straightforward, hassle-free parking with few restrictions. You slightly prefer that car owners pay modest fees to cover upkeep, keeping rules clear and transparent without red tape.',
    quadrant: 'Q4',
    xRange: 'user',
    yRange: 'open',
    intensity: 'moderate',
    targetCoordinates: { x: 4, y: 4 },
    stanceOnRegulations: 'Simple, easy-to-understand parking guidelines without bureaucratic restrictions.',
    stanceOnFunding: 'Modest flat user fees for parking users without general tax burdens.',
    keyPriorities: ['Simple access', 'Light user fees'],
    edmontonPolicyFit: 'Aligns with simplified flat-rate parking regions and mixed-density neighbourhood borders.',
    outcome: 'A simplified, open-access parking framework with modest flat-rate user fees during high-demand periods, keeping rules transparent and hassle-free for drivers.',
    badgeColor: '#E6A100',
    legacyMergedTitles: ['Simple Driver', 'Happy Driver']
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
    return isStrong ? personas.safety_parker || DEFAULT_8_PERSONAS.safety_parker
                    : personas.flexible_parker || DEFAULT_8_PERSONAS.flexible_parker;
  }
  
  // Quadrant 2: Taxpayer-Funded (X < 0) & Regulated (Y < 0) - Top-Left
  if (totalX < 0 && totalY < 0) {
    const isStrong = totalX <= -6 || totalY <= -6;
    return isStrong ? personas.block_resident || DEFAULT_8_PERSONAS.block_resident
                    : personas.balanced_resident || DEFAULT_8_PERSONAS.balanced_resident;
  }
  
  // Quadrant 3: Taxpayer-Funded (X < 0) & Open Access (Y >= 0) - Bottom-Left
  if (totalX < 0 && totalY >= 0) {
    const isStrong = totalX <= -6 || totalY >= 6;
    return isStrong ? personas.zen_neighbour || DEFAULT_8_PERSONAS.zen_neighbour
                    : personas.chill_neighbour || DEFAULT_8_PERSONAS.chill_neighbour;
  }
  
  // Quadrant 4: User-Paid (X >= 0) & Open Access (Y >= 0) - Bottom-Right
  const isStrong = totalX >= 6 || totalY >= 6;
  return isStrong ? personas.casual_cruiser || DEFAULT_8_PERSONAS.casual_cruiser
                  : personas.simple_driver || DEFAULT_8_PERSONAS.simple_driver;
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
                   regLower.includes('safety') || regLower.includes('block') || regLower.includes('rule');
  
  const isMinimal = regLower.includes('no rule') || regLower.includes('free') || regLower.includes('unrestricted') ||
                    regLower.includes('zen') || regLower.includes('chill') || regLower.includes('open') ||
                    regLower.includes('few') || regLower.includes('minimal') || regLower.includes('casual');

  // Funding axis: Negative = Taxpayer / Public / Shared. Positive = User-Fee / Direct / Permit / Driver pay.
  const isUserPay = fundLower.includes('user') || fundLower.includes('fee') || fundLower.includes('meter') ||
                    fundLower.includes('driver') || fundLower.includes('permit') || fundLower.includes('pay-per') ||
                    fundLower.includes('direct') || fundLower.includes('private');

  // Intensity determination
  const isStrong = regLower.includes('strict') || regLower.includes('strong') || regLower.includes('absolute') ||
                   regLower.includes('almost no') || fundLower.includes('strong') || fundLower.includes('100%') ||
                   fundLower.includes('all residents') || regLower.includes('safety');

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
 * Ingests a 4-column CSV with headers (Persona, Stance on Regulations, Stance on Funding, Description)
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

  // Find column indices
  const header = rows[0].map(h => h.trim().toLowerCase());
  let personaIdx = header.findIndex(h => h.includes('persona') || h.includes('title') || h.includes('name'));
  let regIdx = header.findIndex(h => h.includes('regulation') || h.includes('rules') || h.includes('regulatory'));
  let fundIdx = header.findIndex(h => h.includes('funding') || h.includes('fiscal') || h.includes('cost'));
  let descIdx = header.findIndex(h => h.includes('desc') || h.includes('summary') || h.includes('detail'));

  // Defaults if headers don't strictly match
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
    const persona = r[personaIdx] || '';
    const stanceOnRegulations = r[regIdx] || '';
    const stanceOnFunding = r[fundIdx] || '';
    const description = r[descIdx] || '';
    if (persona) {
      const { quadrant, intensity } = classifyStances(stanceOnRegulations, stanceOnFunding, persona);
      parsedList.push({
        persona,
        stanceOnRegulations,
        stanceOnFunding,
        description,
        detectedQuadrant: quadrant,
        detectedIntensity: intensity
      });
    }
  });

  // Target 8 slots: 2 per quadrant (1 strong, 1 moderate)
  const targetSlots: Record<string, PersonaResult> = { ...DEFAULT_8_PERSONAS };
  
  // Mapping matrix
  const slotKeys: Record<string, string> = {
    'Q1_strong': 'safety_parker',
    'Q1_moderate': 'flexible_parker',
    'Q2_strong': 'block_resident',
    'Q2_moderate': 'balanced_resident',
    'Q3_strong': 'zen_neighbour',
    'Q3_moderate': 'chill_neighbour',
    'Q4_strong': 'casual_cruiser',
    'Q4_moderate': 'simple_driver'
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
 * Format active 8 personas into a clean 4-column CSV string.
 */
export function exportPersonasToCsv(personas?: Record<string, PersonaResult>): string {
  const pMap = personas || getActive8Personas();
  const headers = ['Persona', 'Stance on Regulations', 'Stance on Funding', 'Description'];
  
  const rows = (Object.values(pMap) as PersonaResult[]).map((p: PersonaResult) => {
    const cleanTitle = `"${(p.title || '').replace(/"/g, '""')}"`;
    const cleanReg = `"${(p.stanceOnRegulations || '').replace(/"/g, '""')}"`;
    const cleanFund = `"${(p.stanceOnFunding || '').replace(/"/g, '""')}"`;
    const cleanDesc = `"${(p.description || '').replace(/"/g, '""')}"`;
    return [cleanTitle, cleanReg, cleanFund, cleanDesc].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}
