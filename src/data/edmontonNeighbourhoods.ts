import { StreetLayoutTypology } from '../types';

export interface StreetLayoutInfo {
  id: StreetLayoutTypology;
  title: string;
  shortTitle: string;
  era: string;
  subtitle: string;
  description: string;
  alleyType: string;
  drivewayType: string;
  curbsideCapacity: number;
  curbCutFrequency: 'none' | 'moderate' | 'frequent' | 'pocket_bays';
  treeCanopy: string;
  densityProfile: string;
  parkingDynamic: string;
  icon: string;
  badgeBg: string;
  accentBorder: string;
  sampleNeighbourhoods: string[];
}

export const STREET_LAYOUTS: Record<StreetLayoutTypology, StreetLayoutInfo> = {
  mature_laned: {
    id: 'mature_laned',
    title: 'Mature Laned Neighbourhood',
    shortTitle: 'Mature Laned',
    era: '1950s–1960s Mid-Century Heritage',
    subtitle: 'Rear gravel/paved lane, detached backyard garages, zero front curb cuts',
    description:
      'Continuous curbside parking along wide, tree-canopied boulevards. All vehicle access is through the rear back lane with detached rear garages, leaving the front curb open for 12 legal on-street parking stalls (outside the fire hydrant and 30m ETS bus stop zones).',
    alleyType: 'Rear gravel/paved lane (12 detached garages)',
    drivewayType: 'Zero front driveways (continuous front curb, 12 stalls)',
    curbsideCapacity: 12,
    curbCutFrequency: 'none',
    treeCanopy: 'Stately mature American Elms and Green Ashes',
    densityProfile: 'Single detached bungalows with secondary suites',
    parkingDynamic: 'High curbside capacity, low conflict with private driveway access',
    icon: '🏡',
    badgeBg: 'bg-emerald-900/60 text-emerald-200 border-emerald-500/40',
    accentBorder: 'border-emerald-500',
    sampleNeighbourhoods: [
      'Strathcona',
      'Westmount',
      'Glenora',
      'Highlands',
      'Bonnie Doon',
      'Ritchie',
      'Queen Mary Park',
      'Beverly',
      'Capilano',
      'Crestwood',
      'Parkallen',
      'Hazeldean'
    ]
  },
  infill_skinny: {
    id: 'infill_skinny',
    title: 'Infill & Redeveloping Core',
    shortTitle: 'Infill & Duplex',
    era: 'Post-2015 Urban Infill & Lot Splits',
    subtitle: 'Narrow skinny homes, semi-detached duplexes, rear garden suites',
    description:
      'Subdivided 25-foot lots with multi-unit rowhouses and skinny duplexes. With rear laneway parking, the front street accommodates 12 legal curbside stalls (accounting for the fire hydrant and 30m ETS bus stop zones) with active courier parcel deliveries and visitor turnover.',
    alleyType: 'Paved rear laneway with garage suites & carports',
    drivewayType: 'Rear vehicular access, zero front driveways (continuous front curb, 12 stalls)',
    curbsideCapacity: 12,
    curbCutFrequency: 'none',
    treeCanopy: 'Younger decorative columnar aspens and linden trees',
    densityProfile: 'Duplexes, skinny single detached, and garage suites (18–24 dwellings/block)',
    parkingDynamic: 'High competition for curbside space; active courier deliveries and visitor turnover',
    icon: '🏘️',
    badgeBg: 'bg-amber-900/60 text-amber-200 border-amber-500/40',
    accentBorder: 'border-amber-500',
    sampleNeighbourhoods: [
      'Garneau',
      'Oliver (Wîhkwêntôwin)',
      'Downtown',
      'Central McDougall',
      'McCauley',
      'Queen Alexandra',
      'McKernan',
      'Belgravia',
      'Inglewood',
      'Prince Charles'
    ]
  },
  suburban_front_driveway: {
    id: 'suburban_front_driveway',
    title: 'Suburban Front-Garage Driveway',
    shortTitle: 'Front Driveway',
    era: '1980s–2000s Curvilinear Subdivisions',
    subtitle: 'Front-attached double garages, unmarked residential road, light traffic (35–55 km/h)',
    description:
      'Curvilinear residential streets with unmarked roadways (no marked center lane) and low two-way traffic volume. Vehicle speeds exhibit larger standard deviation from 35 km/h (-5 km/h under the 40 km/h limit) to 55 km/h (+15 km/h above). Single-family homes have front double garages (10 base legal stalls); each 8-plex built removes a front driveway and its 1.5m clearance to add a legal curbside stall back (up to 16 stalls), except where an ETS bus stop is located.',
    alleyType: 'No rear lane (closed private backyards)',
    drivewayType: 'Private front driveways (10 base stalls + 1 per 8-plex outside ETS bus stop)',
    curbsideCapacity: 10,
    curbCutFrequency: 'frequent',
    treeCanopy: 'Boulevard grass swales with ornamental crabapples and spruce',
    densityProfile: 'Spacious 2-storey and split-level homes with 2–3 car private pads',
    parkingDynamic: 'Low curbside capacity; reduced two-way traffic on unmarked road with wide 35–55 km/h speed variance',
    icon: '🚗',
    badgeBg: 'bg-blue-900/60 text-blue-200 border-blue-500/40',
    accentBorder: 'border-blue-500',
    sampleNeighbourhoods: [
      'Mill Woods',
      'Callingwood',
      'Riverbend',
      'Castledowns',
      'Blue Quill',
      'Terwillegar',
      'Clareview',
      'Lewis Farms',
      'Twin Brooks',
      'Kameyosek',
      'Meyokumin'
    ]
  },
  contemporary_townhomes: {
    id: 'contemporary_townhomes',
    title: 'Contemporary Dense Developing',
    shortTitle: 'Modern Townhomes',
    era: '2020s City Plan Transit-Oriented',
    subtitle: 'Modern townhome blocks, integrated pocket parking bays, bioswales',
    description:
      'Modern urban street design featuring joined townhome facades with architectural stoops, landscaped bioswales, and curb bulb-outs. Designated on-street pocket parking bays provide 9 legal curbside stalls (3 bays of 3 stalls, with the 4th bay dedicated to the 30m ETS bus stop zone).',
    alleyType: 'Integrated rear service lane with tuck-under garages',
    drivewayType: 'Rear-loaded vehicle parking; zero front driveways (3 pocket bays, 9 stalls)',
    curbsideCapacity: 9,
    curbCutFrequency: 'pocket_bays',
    treeCanopy: 'Engineered soil cells with native drought-tolerant bur oaks',
    densityProfile: 'Multi-family townhomes and stacked rowhousing (16–20 homes/block)',
    parkingDynamic: 'Designated curbside bays with time limits and dedicated short-stay courier spots',
    icon: '🏢',
    badgeBg: 'bg-indigo-900/60 text-indigo-200 border-indigo-500/40',
    accentBorder: 'border-indigo-500',
    sampleNeighbourhoods: [
      'Griesbach',
      'Blatchford',
      'Windermere',
      'Chappelle',
      'Secord',
      'Keswick',
      'Laurel',
      'Walker',
      'Allard',
      'Crystallina Nera',
      'Rosenthal'
    ]
  }
};

export interface EdmontonNeighbourhood {
  name: string;
  typology: StreetLayoutTypology;
  sector: 'Central' | 'South' | 'North' | 'West' | 'East' | 'Southwest';
  postalFSA?: string[]; // Forward Sortation Area prefix (e.g. T5J, T6E)
}

export const EDMONTON_NEIGHBOURHOODS: EdmontonNeighbourhood[] = [
  // Central / Mature Laned & Infill
  { name: 'Strathcona', typology: 'mature_laned', sector: 'Central', postalFSA: ['T6E'] },
  { name: 'Garneau', typology: 'infill_skinny', sector: 'Central', postalFSA: ['T6G'] },
  { name: 'Oliver (Wîhkwêntôwin)', typology: 'infill_skinny', sector: 'Central', postalFSA: ['T5K'] },
  { name: 'Downtown', typology: 'infill_skinny', sector: 'Central', postalFSA: ['T5J'] },
  { name: 'Westmount', typology: 'mature_laned', sector: 'Central', postalFSA: ['T5N'] },
  { name: 'Glenora', typology: 'mature_laned', sector: 'Central', postalFSA: ['T5N'] },
  { name: 'Highlands', typology: 'mature_laned', sector: 'East', postalFSA: ['T5W'] },
  { name: 'Bonnie Doon', typology: 'mature_laned', sector: 'East', postalFSA: ['T6C'] },
  { name: 'Ritchie', typology: 'mature_laned', sector: 'Central', postalFSA: ['T6E'] },
  { name: 'Queen Alexandra', typology: 'infill_skinny', sector: 'Central', postalFSA: ['T6E'] },
  { name: 'Queen Mary Park', typology: 'mature_laned', sector: 'Central', postalFSA: ['T5H'] },
  { name: 'Central McDougall', typology: 'infill_skinny', sector: 'Central', postalFSA: ['T5H'] },
  { name: 'McCauley', typology: 'infill_skinny', sector: 'Central', postalFSA: ['T5H'] },
  { name: 'McKernan', typology: 'infill_skinny', sector: 'Central', postalFSA: ['T6G'] },
  { name: 'Belgravia', typology: 'infill_skinny', sector: 'Central', postalFSA: ['T6G'] },
  { name: 'Parkallen', typology: 'mature_laned', sector: 'South', postalFSA: ['T6H'] },
  { name: 'Hazeldean', typology: 'mature_laned', sector: 'South', postalFSA: ['T6E'] },
  { name: 'Crestwood', typology: 'mature_laned', sector: 'West', postalFSA: ['T5N'] },
  { name: 'Beverly', typology: 'mature_laned', sector: 'East', postalFSA: ['T5W'] },
  { name: 'Capilano', typology: 'mature_laned', sector: 'East', postalFSA: ['T6A'] },
  { name: 'Inglewood', typology: 'infill_skinny', sector: 'Central', postalFSA: ['T5L'] },
  { name: 'Prince Charles', typology: 'infill_skinny', sector: 'Central', postalFSA: ['T5L'] },
  { name: 'Rossdale', typology: 'mature_laned', sector: 'Central', postalFSA: ['T5K'] },
  { name: 'Riverdale', typology: 'mature_laned', sector: 'Central', postalFSA: ['T5H'] },
  { name: 'Forest Heights', typology: 'mature_laned', sector: 'East', postalFSA: ['T6A'] },
  { name: 'Holyrood', typology: 'mature_laned', sector: 'East', postalFSA: ['T6C'] },
  { name: 'King Edward Park', typology: 'mature_laned', sector: 'East', postalFSA: ['T6E'] },
  { name: 'Avonmore', typology: 'mature_laned', sector: 'East', postalFSA: ['T6C'] },
  { name: 'Grovenor', typology: 'mature_laned', sector: 'West', postalFSA: ['T5N'] },
  { name: 'Allendale', typology: 'infill_skinny', sector: 'South', postalFSA: ['T6H'] },
  { name: 'Pleasantview', typology: 'mature_laned', sector: 'South', postalFSA: ['T6H'] },
  { name: 'Lansdowne', typology: 'mature_laned', sector: 'South', postalFSA: ['T6H'] },
  { name: 'Malmo Plains', typology: 'mature_laned', sector: 'South', postalFSA: ['T6H'] },
  { name: 'Empire Park', typology: 'suburban_front_driveway', sector: 'South', postalFSA: ['T6H'] },

  // Suburban Front-Garage Driveway Neighbourhoods (1980s–2000s)
  { name: 'Mill Woods', typology: 'suburban_front_driveway', sector: 'South', postalFSA: ['T6K', 'T6L'] },
  { name: 'Kameyosek', typology: 'suburban_front_driveway', sector: 'South', postalFSA: ['T6K'] },
  { name: 'Meyokumin', typology: 'suburban_front_driveway', sector: 'South', postalFSA: ['T6L'] },
  { name: 'Tweddle Place', typology: 'suburban_front_driveway', sector: 'South', postalFSA: ['T6L'] },
  { name: 'Richfield', typology: 'suburban_front_driveway', sector: 'South', postalFSA: ['T6L'] },
  { name: 'Michaels Park', typology: 'suburban_front_driveway', sector: 'South', postalFSA: ['T6L'] },
  { name: 'Callingwood', typology: 'suburban_front_driveway', sector: 'West', postalFSA: ['T5T'] },
  { name: 'Riverbend', typology: 'suburban_front_driveway', sector: 'Southwest', postalFSA: ['T6R'] },
  { name: 'Brander Gardens', typology: 'suburban_front_driveway', sector: 'Southwest', postalFSA: ['T6R'] },
  { name: 'Brookside', typology: 'suburban_front_driveway', sector: 'Southwest', postalFSA: ['T6R'] },
  { name: 'Ramsay Heights', typology: 'suburban_front_driveway', sector: 'Southwest', postalFSA: ['T6R'] },
  { name: 'Bulyea Heights', typology: 'suburban_front_driveway', sector: 'Southwest', postalFSA: ['T6R'] },
  { name: 'Falconer Heights', typology: 'suburban_front_driveway', sector: 'Southwest', postalFSA: ['T6R'] },
  { name: 'Henderson Estates', typology: 'suburban_front_driveway', sector: 'Southwest', postalFSA: ['T6R'] },
  { name: 'Blue Quill', typology: 'suburban_front_driveway', sector: 'South', postalFSA: ['T6J'] },
  { name: 'Sweet Grass', typology: 'suburban_front_driveway', sector: 'South', postalFSA: ['T6J'] },
  { name: 'Greenfield', typology: 'mature_laned', sector: 'South', postalFSA: ['T6J'] },
  { name: 'Duggan', typology: 'suburban_front_driveway', sector: 'South', postalFSA: ['T6J'] },
  { name: 'Twin Brooks', typology: 'suburban_front_driveway', sector: 'South', postalFSA: ['T6J'] },
  { name: 'Terwillegar Towne', typology: 'suburban_front_driveway', sector: 'Southwest', postalFSA: ['T6R'] },
  { name: 'South Terwillegar', typology: 'suburban_front_driveway', sector: 'Southwest', postalFSA: ['T6R'] },
  { name: 'Haddow', typology: 'suburban_front_driveway', sector: 'Southwest', postalFSA: ['T6R'] },
  { name: 'Ogilvie Ridge', typology: 'suburban_front_driveway', sector: 'Southwest', postalFSA: ['T6R'] },
  { name: 'Castledowns', typology: 'suburban_front_driveway', sector: 'North', postalFSA: ['T5X', 'T5Z'] },
  { name: 'Baturyn', typology: 'suburban_front_driveway', sector: 'North', postalFSA: ['T5X'] },
  { name: 'Beaumaris', typology: 'suburban_front_driveway', sector: 'North', postalFSA: ['T5X'] },
  { name: 'Carlisle', typology: 'suburban_front_driveway', sector: 'North', postalFSA: ['T5X'] },
  { name: 'Dunluce', typology: 'suburban_front_driveway', sector: 'North', postalFSA: ['T5X'] },
  { name: 'Lorelei', typology: 'suburban_front_driveway', sector: 'North', postalFSA: ['T5Z'] },
  { name: 'Caernarvon', typology: 'suburban_front_driveway', sector: 'North', postalFSA: ['T5X'] },
  { name: 'Clareview', typology: 'suburban_front_driveway', sector: 'East', postalFSA: ['T5Y'] },
  { name: 'Belmont', typology: 'suburban_front_driveway', sector: 'East', postalFSA: ['T5Y'] },
  { name: 'Hairsine', typology: 'suburban_front_driveway', sector: 'East', postalFSA: ['T5Y'] },
  { name: 'Kernohan', typology: 'suburban_front_driveway', sector: 'East', postalFSA: ['T5Y'] },
  { name: 'Sifton Park', typology: 'suburban_front_driveway', sector: 'East', postalFSA: ['T5Y'] },
  { name: 'Lewis Farms', typology: 'suburban_front_driveway', sector: 'West', postalFSA: ['T5T'] },
  { name: 'Breckenridge Greens', typology: 'suburban_front_driveway', sector: 'West', postalFSA: ['T5T'] },
  { name: 'Potter Greens', typology: 'suburban_front_driveway', sector: 'West', postalFSA: ['T5T'] },
  { name: 'Suder Greens', typology: 'suburban_front_driveway', sector: 'West', postalFSA: ['T5T'] },
  { name: 'Webber Greens', typology: 'suburban_front_driveway', sector: 'West', postalFSA: ['T5T'] },
  { name: 'Glastonbury', typology: 'suburban_front_driveway', sector: 'West', postalFSA: ['T5T'] },
  { name: 'The Hamptons', typology: 'suburban_front_driveway', sector: 'West', postalFSA: ['T5T'] },

  // Contemporary Dense Developing & Townhome Neighbourhoods
  { name: 'Griesbach', typology: 'contemporary_townhomes', sector: 'North', postalFSA: ['T5E'] },
  { name: 'Blatchford', typology: 'contemporary_townhomes', sector: 'Central', postalFSA: ['T5G'] },
  { name: 'Windermere', typology: 'contemporary_townhomes', sector: 'Southwest', postalFSA: ['T6W'] },
  { name: 'Ambleside', typology: 'contemporary_townhomes', sector: 'Southwest', postalFSA: ['T6W'] },
  { name: 'Chappelle Gardens', typology: 'contemporary_townhomes', sector: 'Southwest', postalFSA: ['T6W'] },
  { name: 'Keswick', typology: 'contemporary_townhomes', sector: 'Southwest', postalFSA: ['T6W'] },
  { name: 'Glenridding Heights', typology: 'contemporary_townhomes', sector: 'Southwest', postalFSA: ['T6W'] },
  { name: 'Secord', typology: 'contemporary_townhomes', sector: 'West', postalFSA: ['T5T'] },
  { name: 'Rosenthal', typology: 'contemporary_townhomes', sector: 'West', postalFSA: ['T5T'] },
  { name: 'Stewart Greens', typology: 'contemporary_townhomes', sector: 'West', postalFSA: ['T5T'] },
  { name: 'Laurel', typology: 'contemporary_townhomes', sector: 'South', postalFSA: ['T6T'] },
  { name: 'Walker', typology: 'contemporary_townhomes', sector: 'South', postalFSA: ['T6X'] },
  { name: 'Allard', typology: 'contemporary_townhomes', sector: 'South', postalFSA: ['T6W'] },
  { name: 'Cavanagh', typology: 'contemporary_townhomes', sector: 'South', postalFSA: ['T6W'] },
  { name: 'Heritage Valley', typology: 'contemporary_townhomes', sector: 'South', postalFSA: ['T6W'] },
  { name: 'Rutherford', typology: 'contemporary_townhomes', sector: 'South', postalFSA: ['T6W'] },
  { name: 'MacEwan', typology: 'suburban_front_driveway', sector: 'South', postalFSA: ['T6W'] },
  { name: 'Blackmud Creek', typology: 'suburban_front_driveway', sector: 'South', postalFSA: ['T6W'] },
  { name: 'Crystallina Nera', typology: 'contemporary_townhomes', sector: 'North', postalFSA: ['T5Z'] },
  { name: 'Albany', typology: 'contemporary_townhomes', sector: 'North', postalFSA: ['T5V'] },
  { name: 'Newcastle', typology: 'contemporary_townhomes', sector: 'North', postalFSA: ['T5V'] },
  { name: 'Oxford', typology: 'suburban_front_driveway', sector: 'North', postalFSA: ['T5V'] },
  { name: 'Carlton', typology: 'suburban_front_driveway', sector: 'North', postalFSA: ['T5V'] },
  { name: 'Klarvatten', typology: 'suburban_front_driveway', sector: 'North', postalFSA: ['T5Z'] },
  { name: 'Lago Lindo', typology: 'suburban_front_driveway', sector: 'North', postalFSA: ['T5Z'] },
  { name: 'Schonsee', typology: 'contemporary_townhomes', sector: 'North', postalFSA: ['T5Z'] },
  { name: 'Cy Becker', typology: 'contemporary_townhomes', sector: 'East', postalFSA: ['T5Y'] },
  { name: 'McConachie', typology: 'contemporary_townhomes', sector: 'East', postalFSA: ['T5Y'] },
  { name: 'Manning', typology: 'contemporary_townhomes', sector: 'East', postalFSA: ['T5Y'] },
  { name: 'Silver Berry', typology: 'suburban_front_driveway', sector: 'South', postalFSA: ['T6T'] },
  { name: 'Tamarack', typology: 'contemporary_townhomes', sector: 'South', postalFSA: ['T6T'] },
  { name: 'Wild Rose', typology: 'suburban_front_driveway', sector: 'South', postalFSA: ['T6T'] }
];

/**
 * Returns street layout definition by typology ID
 */
export function getStreetLayoutInfo(typology?: StreetLayoutTypology | string): StreetLayoutInfo {
  if (typology && typology in STREET_LAYOUTS) {
    return STREET_LAYOUTS[typology as StreetLayoutTypology];
  }
  return STREET_LAYOUTS.mature_laned;
}

/**
 * Popular Edmonton neighbourhoods for quick-select chips
 */
export const POPULAR_EDMONTON_NEIGHBOURHOODS = [
  'Strathcona',
  'Garneau',
  'Oliver (Wîhkwêntôwin)',
  'Mill Woods',
  'Windermere',
  'Callingwood',
  'Griesbach',
  'Highlands',
  'Riverbend',
  'Glenora',
  'Blatchford',
  'Chappelle Gardens'
];

import { 
  ALL_EDMONTON_NEIGHBOURHOODS, 
  resolveLocationOrPredictiveAddress, 
  EDMONTON_FSA_DATA 
} from './edmontonPostalData';

/**
 * Determines most likely Street Layout Typology from an Edmonton Postal Code or Neighbourhood Name
 */
export function getTypologyFromPostalCode(postalCodeOrName: string): StreetLayoutTypology {
  if (!postalCodeOrName || postalCodeOrName === 'OPT_OUT') return 'mature_laned';
  
  const predictive = resolveLocationOrPredictiveAddress(postalCodeOrName);
  if (predictive) {
    return predictive.typology;
  }

  const clean = postalCodeOrName.trim().toUpperCase().replace(/[\s-]/g, '');
  if (clean.length < 3) return 'mature_laned';
  const fsa = clean.slice(0, 3);

  // Exact matching against neighbourhood database FSA
  const matchingNeighbourhood = EDMONTON_NEIGHBOURHOODS.find(n => n.postalFSA?.includes(fsa));
  if (matchingNeighbourhood) {
    return matchingNeighbourhood.typology;
  }

  // Broad Edmonton FSA heuristics
  if (['T5J', 'T5K', 'T5H', 'T6G', 'T5L'].includes(fsa)) {
    return 'infill_skinny';
  }
  if (['T5N', 'T5W', 'T6C', 'T6E', 'T6A'].includes(fsa)) {
    return 'mature_laned';
  }
  if (['T6W', 'T6X', 'T5G', 'T5E', 'T6T'].includes(fsa)) {
    return 'contemporary_townhomes';
  }
  if (['T5T', 'T6K', 'T6L', 'T6R', 'T5X', 'T5Z', 'T5Y', 'T6J', 'T5V'].includes(fsa)) {
    return 'suburban_front_driveway';
  }

  return 'mature_laned';
}

/**
 * Detects both typology and matched neighbourhood from user input (postal code or neighbourhood query)
 */
export function detectLayoutAndNeighbourhood(input: string): {
  typology: StreetLayoutTypology;
  neighbourhood: EdmontonNeighbourhood | null;
  detectedBy: 'neighbourhood' | 'postal_fsa' | 'postal_heuristic' | 'default';
} {
  if (!input || input === 'OPT_OUT') {
    return { typology: 'mature_laned', neighbourhood: null, detectedBy: 'default' };
  }

  // 0. Direct typology match
  if (input in STREET_LAYOUTS) {
    return {
      typology: input as StreetLayoutTypology,
      neighbourhood: null,
      detectedBy: 'default'
    };
  }

  // 1. Predictive postal code and address matching
  const predictive = resolveLocationOrPredictiveAddress(input);
  if (predictive) {
    const existing = EDMONTON_NEIGHBOURHOODS.find(n => n.name.toLowerCase() === predictive.neighbourhood.toLowerCase());
    const matched: EdmontonNeighbourhood = existing || {
      name: predictive.neighbourhood,
      typology: predictive.typology,
      sector: 'Central',
      postalFSA: [predictive.postalFSA]
    };
    return {
      typology: predictive.typology,
      neighbourhood: matched,
      detectedBy: predictive.matchedBy === 'exact_code' || predictive.matchedBy === 'fsa' ? 'postal_fsa' : 'neighbourhood'
    };
  }

  // 2. Direct neighbourhood match fallback
  const matchedNeighbourhood = findNeighbourhood(input);
  if (matchedNeighbourhood) {
    return {
      typology: matchedNeighbourhood.typology,
      neighbourhood: matchedNeighbourhood,
      detectedBy: 'neighbourhood'
    };
  }

  // 3. Fallback FSA heuristic
  const clean = input.trim().toUpperCase().replace(/[\s-]/g, '');
  if (clean.length >= 3) {
    const fsa = clean.slice(0, 3);
    const fsaData = EDMONTON_FSA_DATA[fsa];
    if (fsaData) {
      return {
        typology: fsaData.typology,
        neighbourhood: {
          name: fsaData.neighbourhoods[0] || fsaData.name,
          typology: fsaData.typology,
          sector: 'Central',
          postalFSA: [fsa]
        },
        detectedBy: 'postal_fsa'
      };
    }
  }

  return { typology: 'mature_laned', neighbourhood: null, detectedBy: 'default' };
}

/**
 * Finds neighbourhood by name or query
 */
export function findNeighbourhood(nameOrQuery: string): EdmontonNeighbourhood | null {
  if (!nameOrQuery || !nameOrQuery.trim()) return null;
  const q = nameOrQuery.toLowerCase().trim();

  // Search existing database
  const direct = EDMONTON_NEIGHBOURHOODS.find(n => n.name.toLowerCase() === q);
  if (direct) return direct;

  const partial = EDMONTON_NEIGHBOURHOODS.find(n => n.name.toLowerCase().includes(q));
  if (partial) return partial;

  // Search extended directory
  const extended = ALL_EDMONTON_NEIGHBOURHOODS.find(n => 
    n.name.toLowerCase() === q || 
    n.aliases.some(a => a.toLowerCase() === q) ||
    n.name.toLowerCase().includes(q)
  );
  if (extended) {
    return {
      name: extended.name,
      typology: extended.typology,
      sector: 'Central',
      postalFSA: [extended.fsa]
    };
  }

  return null;
}

/**
 * Searches neighbourhoods for autocomplete with predictive aliases
 */
export function searchNeighbourhoods(query: string, limit = 8): EdmontonNeighbourhood[] {
  if (!query || !query.trim()) return EDMONTON_NEIGHBOURHOODS.slice(0, limit);
  const q = query.toLowerCase().trim();
  
  const results: EdmontonNeighbourhood[] = [];
  const addedNames = new Set<string>();

  // 1. Matches in primary list
  for (const n of EDMONTON_NEIGHBOURHOODS) {
    if (
      n.name.toLowerCase().includes(q) ||
      n.sector.toLowerCase().includes(q) ||
      n.postalFSA?.some(f => f.toLowerCase().includes(q))
    ) {
      results.push(n);
      addedNames.add(n.name.toLowerCase());
      if (results.length >= limit) return results;
    }
  }

  // 2. Matches in extended list
  for (const ext of ALL_EDMONTON_NEIGHBOURHOODS) {
    if (!addedNames.has(ext.name.toLowerCase())) {
      if (
        ext.name.toLowerCase().includes(q) ||
        ext.fsa.toLowerCase().includes(q) ||
        ext.aliases.some(a => a.toLowerCase().includes(q))
      ) {
        results.push({
          name: ext.name,
          typology: ext.typology,
          sector: 'Central',
          postalFSA: [ext.fsa]
        });
        addedNames.add(ext.name.toLowerCase());
        if (results.length >= limit) return results;
      }
    }
  }

  return results.slice(0, limit);
}
