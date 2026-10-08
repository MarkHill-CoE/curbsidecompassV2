export interface SurveyOption {
  id: string;
  label: string;
  x: number; // fiscal axis (-2: Taxpayer ... +2: User)
  y: number; // regulatory axis (-2: Open/Unrestricted ... +2: Strict/Regulated)
  simEffects?: Partial<SimulationConfig>;
  hint?: string;
}

export interface SurveyQuestion {
  id: string;
  number: number;
  text: string;
  category: 'residential' | 'visitors' | 'finance' | 'commercial' | 'pricing' | 'enforcement' | 'revenue' | 'demographics' | 'location' | 'Proximity to Destination' | (string & {});
  type?: 'choice' | 'text';
  placeholder?: string;
  helperText?: string;
  options: SurveyOption[];
}

export type StreetLayoutTypology =
  | 'mature_laned'
  | 'infill_skinny'
  | 'suburban_front_driveway'
  | 'contemporary_townhomes';

export interface SimulationConfig {
  householdCarsPerHome: number; // 0 - 4 (default 2.0)
  visitorPassesPerHome: number; // 0 - 2 (whole numbers: 0, 1, 2, default 0)
  drivewayCapacity: number; // 1 - 2 (single-car wide: 1 or 2 tandem)
  splitInfillLots?: number; // 0 - 3 (number of 8-plex multi-unit infill buildings replacing houses, default 0)
  deliveriesPerHomePerWeek: number; // 1 - 4 (default 1.0)
  enforcementLevel: 'strict' | 'standard' | 'lenient';
  cruisingTrafficLevel: 'low' | 'moderate' | 'high';
  curbsideFeeModel: 'free' | 'permit' | 'demand';
  streetLayout?: StreetLayoutTypology;
  neighbourhoodName?: string;
  postalCode?: string;
  curbsideDemandOverride?: number;
}

export interface PersonaResult {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  quadrant: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  xRange: 'user' | 'taxpayer';
  yRange: 'restrictive' | 'open';
  keyPriorities: string[];
  edmontonPolicyFit: string;
  outcome: string;
  badgeColor: string;
  stanceOnRegulations?: string;
  stanceOnFunding?: string;
  intensity?: 'moderate' | 'strong';
  legacyMergedTitles?: string[];
  targetCoordinates?: { x: number; y: number };
}


declare global {
  interface Window {
    __agentArtifactAudioUrl?: string;
  }
}
