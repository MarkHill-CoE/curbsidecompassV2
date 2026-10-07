export interface LegacyPersona {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  description: string;
  quadrant: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  xRangeText: string;
  yRangeText: string;
  keyPriorities: string[];
  edmontonPolicyFit: string;
  mergedIntoPersonaId: string; // Key in the new 8-persona structure
  mergedIntoPersonaTitle: string;
  badgeColor: string;
}

export const LEGACY_16_PERSONAS: LegacyPersona[] = [
  // --- QUADRANT 1: Regulated & User-Pay (Top-Right) ---
  {
    id: 'safety_parker',
    number: 4,
    title: 'Safety Parker',
    subtitle: 'Strict Rules • Strong User-Fee',
    description: 'You like strict parking rules to keep streets safe. You strongly believe car owners should pay for their own parking, not everyone.',
    quadrant: 'Q1',
    xRangeText: 'X > +8 (Strong User-Fee)',
    yRangeText: 'Y < -9 (Strict Rules)',
    keyPriorities: ['Strict safety enforcement', 'Direct user fees'],
    edmontonPolicyFit: 'Aligns with high-traffic pedestrian safety corridors.',
    mergedIntoPersonaId: 'safety_parker_8',
    mergedIntoPersonaTitle: 'Safety Parker',
    badgeColor: '#0081BC'
  },
  {
    id: 'fair_parker',
    number: 8,
    title: 'Fair Parker',
    subtitle: 'Fair Balance • Strong User-Fee',
    description: 'You like a fair balance of parking rules. You strongly feel that drivers should pay for parking, instead of everyone.',
    quadrant: 'Q1',
    xRangeText: 'X > +8 (Strong User-Fee)',
    yRangeText: '-9 <= Y < 0 (Fair Balance)',
    keyPriorities: ['Fair access', 'Full cost-recovery from drivers'],
    edmontonPolicyFit: 'Aligns with self-sustaining parking districts.',
    mergedIntoPersonaId: 'safety_parker_8',
    mergedIntoPersonaTitle: 'Safety Parker',
    badgeColor: '#0081BC'
  },
  {
    id: 'picky_parker',
    number: 3,
    title: 'Picky Parker',
    subtitle: 'Clear Rules • User-Fee',
    description: 'You like clear parking rules. You prefer that car owners pay for parking, rather than everyone sharing the costs through taxes.',
    quadrant: 'Q1',
    xRangeText: '0 <= X <= +8 (Moderate User-Fee)',
    yRangeText: 'Y < -9 (Strict Rules)',
    keyPriorities: ['Clear restrictions', 'User-pay model'],
    edmontonPolicyFit: 'Aligns with targeted permit zones.',
    mergedIntoPersonaId: 'flexible_parker_8',
    mergedIntoPersonaTitle: 'Flexible Parker',
    badgeColor: '#0081BC'
  },
  {
    id: 'sensible_parker',
    number: 7,
    title: 'Sensible Parker',
    subtitle: 'Fair Balance • User-Fee',
    description: 'You like a fair balance of parking rules. You prefer that drivers pay for their own parking, instead of everyone sharing the costs.',
    quadrant: 'Q1',
    xRangeText: '0 <= X <= +8 (Moderate User-Fee)',
    yRangeText: '-9 <= Y < 0 (Fair Balance)',
    keyPriorities: ['Balanced enforcement', 'Driver-paid infrastructure'],
    edmontonPolicyFit: 'Aligns with hybrid paid-parking zones.',
    mergedIntoPersonaId: 'flexible_parker_8',
    mergedIntoPersonaTitle: 'Flexible Parker',
    badgeColor: '#0081BC'
  },

  // --- QUADRANT 2: Regulated & Taxpayer-Funded (Top-Left) ---
  {
    id: 'block_resident',
    number: 1,
    title: 'Block Resident',
    subtitle: 'Strict Rules • General Taxation',
    description: 'You like strict parking rules to keep order. You prefer that everyone shares the costs through taxes, rather than just car owners.',
    quadrant: 'Q2',
    xRangeText: 'X < -8 (Strong Taxpayer)',
    yRangeText: 'Y < -9 (Strict Rules)',
    keyPriorities: ['Strict enforcement', 'General tax funding'],
    edmontonPolicyFit: 'Aligns with highly regulated mature neighbourhoods.',
    mergedIntoPersonaId: 'block_resident_8',
    mergedIntoPersonaTitle: 'Block Resident',
    badgeColor: '#005087'
  },
  {
    id: 'rule_resident',
    number: 5,
    title: 'Rule Resident',
    subtitle: 'Clear Rules • Shared Costs',
    description: 'You like clear parking rules. You think everyone should share the costs through taxes, not just car owners.',
    quadrant: 'Q2',
    xRangeText: 'X < -8 (Strong Taxpayer)',
    yRangeText: '-9 <= Y < 0 (Clear Rules)',
    keyPriorities: ['Defined zones', 'Tax-supported maintenance'],
    edmontonPolicyFit: 'Aligns with protected residential areas.',
    mergedIntoPersonaId: 'block_resident_8',
    mergedIntoPersonaTitle: 'Block Resident',
    badgeColor: '#005087'
  },
  {
    id: 'tidy_resident',
    number: 2,
    title: 'Tidy Resident',
    subtitle: 'Some Rules • General Taxation',
    description: 'You like some parking rules to keep streets neat. You feel everyone should share the costs through taxes, not just drivers.',
    quadrant: 'Q2',
    xRangeText: '-8 <= X < 0 (Moderate Taxpayer)',
    yRangeText: 'Y < -9 (Some Rules)',
    keyPriorities: ['Clear guidelines', 'Shared costs'],
    edmontonPolicyFit: 'Aligns with standard residential parking guidelines.',
    mergedIntoPersonaId: 'balanced_resident_8',
    mergedIntoPersonaTitle: 'Balanced Resident',
    badgeColor: '#005087'
  },
  {
    id: 'balanced_resident',
    number: 6,
    title: 'Balanced Resident',
    subtitle: 'Fair Balance • Shared Costs',
    description: 'You like a fair balance of parking rules. You slightly prefer that everyone shares the costs through taxes, instead of just drivers.',
    quadrant: 'Q2',
    xRangeText: '-8 <= X < 0 (Moderate Taxpayer)',
    yRangeText: '-9 <= Y < 0 (Fair Balance)',
    keyPriorities: ['Balanced access', 'Community funding'],
    edmontonPolicyFit: 'Aligns with flexible neighbourhood parking.',
    mergedIntoPersonaId: 'balanced_resident_8',
    mergedIntoPersonaTitle: 'Balanced Resident',
    badgeColor: '#005087'
  },

  // --- QUADRANT 3: Open Access & Taxpayer-Funded (Bottom-Left) ---
  {
    id: 'happy_neighbor',
    number: 13,
    title: 'Happy Neighbour',
    subtitle: 'Almost No Rules • Strong Taxpayer',
    description: 'You want almost no parking rules. You strongly believe everyone should share the costs through taxes, not just drivers.',
    quadrant: 'Q3',
    xRangeText: 'X < -8 (Strong Taxpayer)',
    yRangeText: 'Y > +9 (Almost No Rules)',
    keyPriorities: ['Complete freedom', 'Fully public funding'],
    edmontonPolicyFit: 'Aligns with historically unregulated rural/suburban edges.',
    mergedIntoPersonaId: 'zen_neighbour_8',
    mergedIntoPersonaTitle: 'Zen Neighbour',
    badgeColor: '#009A44'
  },
  {
    id: 'zen_neighbor',
    number: 14,
    title: 'Zen Neighbour',
    subtitle: 'Very Few Rules • Shared Costs',
    description: 'You want very few parking rules for more freedom. You slightly prefer that everyone shares the costs through taxes, not just car owners.',
    quadrant: 'Q3',
    xRangeText: '-8 <= X < 0 (Shared Costs)',
    yRangeText: 'Y > +9 (Very Few Rules)',
    keyPriorities: ['High freedom', 'Shared municipal cost'],
    edmontonPolicyFit: 'Aligns with unenforced open streets.',
    mergedIntoPersonaId: 'zen_neighbour_8',
    mergedIntoPersonaTitle: 'Zen Neighbour',
    badgeColor: '#009A44'
  },
  {
    id: 'easy_neighbor',
    number: 9,
    title: 'Easy Neighbour',
    subtitle: 'Fewer Rules • Shared Costs',
    description: 'You like fewer parking rules to make things easy. You prefer that everyone shares the costs through taxes, rather than just drivers.',
    quadrant: 'Q3',
    xRangeText: 'X < -8 (Shared Costs)',
    yRangeText: '0 <= Y <= +9 (Fewer Rules)',
    keyPriorities: ['Easy access', 'Taxpayer funding'],
    edmontonPolicyFit: 'Aligns with open suburban parking.',
    mergedIntoPersonaId: 'chill_neighbour_8',
    mergedIntoPersonaTitle: 'Chill Neighbour',
    badgeColor: '#009A44'
  },
  {
    id: 'chill_neighbour',
    number: 10,
    title: 'Chill Neighbour',
    subtitle: 'Few Rules • Shared Costs',
    description: 'You like having few parking rules. You believe everyone should share the costs through taxes, not just car owners.',
    quadrant: 'Q3',
    xRangeText: '-8 <= X < 0 (Shared Costs)',
    yRangeText: '0 <= Y <= +9 (Few Rules)',
    keyPriorities: ['Minimal restrictions', 'Publicly funded'],
    edmontonPolicyFit: 'Aligns with low-density residential guidelines.',
    mergedIntoPersonaId: 'chill_neighbour_8',
    mergedIntoPersonaTitle: 'Chill Neighbour',
    badgeColor: '#009A44'
  },

  // --- QUADRANT 4: Open Access & User-Paid (Bottom-Right) ---
  {
    id: 'free_wheeler',
    number: 16,
    title: 'Free Wheeler',
    subtitle: 'Almost No Rules • Strong User-Fee',
    description: 'You want almost no parking rules so people are free. You strongly believe drivers should pay for their own parking, not everyone.',
    quadrant: 'Q4',
    xRangeText: 'X > +8 (Strong User-Fee)',
    yRangeText: 'Y > +9 (Almost No Rules)',
    keyPriorities: ['Absolute freedom', '100% user-funded'],
    edmontonPolicyFit: 'Aligns with private unregulated toll/parking models.',
    mergedIntoPersonaId: 'casual_cruiser_8',
    mergedIntoPersonaTitle: 'Casual Cruiser',
    badgeColor: '#FFC72C'
  },
  {
    id: 'casual_cruiser',
    number: 12,
    title: 'Casual Cruiser',
    subtitle: 'Very Few Rules • Strong User-Fee',
    description: 'You like very few parking rules on our streets. You strongly believe car owners must pay for their own parking, not everyone.',
    quadrant: 'Q4',
    xRangeText: 'X > +8 (Strong User-Fee)',
    yRangeText: '0 <= Y <= +9 (Very Few Rules)',
    keyPriorities: ['Unrestricted access', 'Direct user payments'],
    edmontonPolicyFit: 'Aligns with unregulated paid public lots.',
    mergedIntoPersonaId: 'casual_cruiser_8',
    mergedIntoPersonaTitle: 'Casual Cruiser',
    badgeColor: '#FFC72C'
  },
  {
    id: 'simple_driver',
    number: 11,
    title: 'Simple Driver',
    subtitle: 'Fewer Rules • User-Fee',
    description: 'You like fewer parking rules to keep life simple. You slightly prefer that car owners pay for parking, rather than everyone sharing the costs.',
    quadrant: 'Q4',
    xRangeText: '0 <= X <= +8 (Moderate User-Fee)',
    yRangeText: '0 <= Y <= +9 (Fewer Rules)',
    keyPriorities: ['Simple access', 'Light user fees'],
    edmontonPolicyFit: 'Aligns with simplified flat-rate zones.',
    mergedIntoPersonaId: 'simple_driver_8',
    mergedIntoPersonaTitle: 'Simple Driver',
    badgeColor: '#FFC72C'
  },
  {
    id: 'happy_driver',
    number: 15,
    title: 'Happy Driver',
    subtitle: 'Almost No Rules • User-Fee',
    description: 'You want almost no parking rules. You prefer that drivers pay for parking, rather than everyone sharing the costs through taxes.',
    quadrant: 'Q4',
    xRangeText: '0 <= X <= +8 (Moderate User-Fee)',
    yRangeText: 'Y > +9 (Almost No Rules)',
    keyPriorities: ['No restrictions', 'Flat user fees'],
    edmontonPolicyFit: 'Aligns with open flat-rate parking regions.',
    mergedIntoPersonaId: 'simple_driver_8',
    mergedIntoPersonaTitle: 'Simple Driver',
    badgeColor: '#FFC72C'
  }
];
