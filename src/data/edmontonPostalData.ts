/**
 * Comprehensive Edmonton Postal Code & Address Intelligence Database
 * Grounded in the City of Edmonton Ward and Postal Code dataset.
 * Supports:
 * - Exact 6-character postal code matching
 * - 3-character FSA prefix matching (e.g. T5A -> Belvedere/York, T6E -> Strathcona)
 * - Predictive spelling for neighbourhood names and typo correction
 * - Address street pattern matching with 3-character postal FSA resolution
 */

import { StreetLayoutTypology } from '../types';
import { EDMONTON_EXACT_POSTAL_CODES } from './edmontonPostalCodesList';

export interface PostalLookupResult {
  code: string;
  fsa: string;
  neighbourhood: string;
  ward: string;
  typology: StreetLayoutTypology;
}

export interface MultiNeighbourhoodOption {
  name: string;
  ward: string;
  classification: string;
}

export interface PredictiveMatchResult {
  neighbourhood: string;
  postalFSA: string;
  ward: string;
  classification: string; // POSSE Classification (e.g. Redeveloping, Developing, Industrial, River Valley)
  typology: StreetLayoutTypology;
  confidence: number;
  matchedBy: 'exact_code' | 'fsa' | 'exact_neighbourhood' | 'predictive_spelling' | 'address_street';
  highlightText?: string;
  displayCode?: string;
  isFsaOnly?: boolean;
  multipleNeighbourhoods?: MultiNeighbourhoodOption[];
  fsaNeighbourhoodCount?: number;
}

// Multi-neighbourhood postal code mapping from City of Edmonton POSSE dataset
export const EDMONTON_MULTI_NEIGHBOURHOOD_POSTAL_CODES: Record<string, MultiNeighbourhoodOption[]> = {
  "T5A0B4": [{"name": "Kennedale Industrial", "ward": "Dene", "classification": "Industrial"}, {"name": "Industrial Heights", "ward": "Métis", "classification": "Industrial"}],
  "T5A0E2": [{"name": "Canon Ridge", "ward": "Dene", "classification": "Redeveloping"}, {"name": "River Valley Hermitage", "ward": "Dene", "classification": "River Valley"}],
  "T5A0E4": [{"name": "Kennedale Industrial", "ward": "Dene", "classification": "Industrial"}, {"name": "Belvedere", "ward": "Dene", "classification": "Redeveloping"}],
  "T5A0E9": [{"name": "Canon Ridge", "ward": "Dene", "classification": "Redeveloping"}, {"name": "River Valley Hermitage", "ward": "Dene", "classification": "River Valley"}],
  "T5A0P8": [{"name": "Canon Ridge", "ward": "Dene", "classification": "Redeveloping"}, {"name": "River Valley Hermitage", "ward": "Dene", "classification": "River Valley"}],
  "T5A0R2": [{"name": "Canon Ridge", "ward": "Dene", "classification": "Redeveloping"}, {"name": "River Valley Hermitage", "ward": "Dene", "classification": "River Valley"}],
  "T5A0W8": [{"name": "Canon Ridge", "ward": "Dene", "classification": "Redeveloping"}, {"name": "River Valley Hermitage", "ward": "Dene", "classification": "River Valley"}],
  "T5A1J7": [{"name": "Canon Ridge", "ward": "Dene", "classification": "Redeveloping"}, {"name": "River Valley Hermitage", "ward": "Dene", "classification": "River Valley"}],
  "T5A1N7": [{"name": "Casselman", "ward": "Dene", "classification": "Redeveloping"}, {"name": "McLeod", "ward": "Dene", "classification": "Redeveloping"}],
  "T5A2M6": [{"name": "Homesteader", "ward": "Dene", "classification": "Redeveloping"}, {"name": "River Valley Hermitage", "ward": "Dene", "classification": "River Valley"}],
  "T5A2N4": [{"name": "Casselman", "ward": "Dene", "classification": "Redeveloping"}, {"name": "McLeod", "ward": "Dene", "classification": "Redeveloping"}],
  "T5A2S5": [{"name": "Homesteader", "ward": "Dene", "classification": "Redeveloping"}, {"name": "River Valley Hermitage", "ward": "Dene", "classification": "River Valley"}],
  "T5A2S6": [{"name": "Sifton Park", "ward": "Dene", "classification": "Redeveloping"}, {"name": "River Valley Hermitage", "ward": "Dene", "classification": "River Valley"}],
  "T5A2X5": [{"name": "Homesteader", "ward": "Dene", "classification": "Redeveloping"}, {"name": "River Valley Hermitage", "ward": "Dene", "classification": "River Valley"}],
  "T5A2Y1": [{"name": "Homesteader", "ward": "Dene", "classification": "Redeveloping"}, {"name": "Overlanders", "ward": "Dene", "classification": "Redeveloping"}, {"name": "River Valley Hermitage", "ward": "Dene", "classification": "River Valley"}],
  "T5A3A6": [{"name": "Sifton Park", "ward": "Dene", "classification": "Redeveloping"}, {"name": "Homesteader", "ward": "Dene", "classification": "Redeveloping"}, {"name": "River Valley Hermitage", "ward": "Dene", "classification": "River Valley"}],
  "T5A3A9": [{"name": "River Valley Hermitage", "ward": "Dene", "classification": "River Valley"}, {"name": "Belmont", "ward": "Dene", "classification": "Redeveloping"}],
  "T5A3B4": [{"name": "River Valley Hermitage", "ward": "Dene", "classification": "River Valley"}, {"name": "Belmont", "ward": "Dene", "classification": "Redeveloping"}],
  "T5A3G7": [{"name": "Sifton Park", "ward": "Dene", "classification": "Redeveloping"}, {"name": "Homesteader", "ward": "Dene", "classification": "Redeveloping"}, {"name": "River Valley Hermitage", "ward": "Dene", "classification": "River Valley"}],
  "T5A3G8": [{"name": "Sifton Park", "ward": "Dene", "classification": "Redeveloping"}, {"name": "River Valley Hermitage", "ward": "Dene", "classification": "River Valley"}],
  "T5A3H5": [{"name": "Sifton Park", "ward": "Dene", "classification": "Redeveloping"}, {"name": "River Valley Hermitage", "ward": "Dene", "classification": "River Valley"}],
  "T5A3K8": [{"name": "Homesteader", "ward": "Dene", "classification": "Redeveloping"}, {"name": "River Valley Hermitage", "ward": "Dene", "classification": "River Valley"}],
  "T5A3K9": [{"name": "Homesteader", "ward": "Dene", "classification": "Redeveloping"}, {"name": "River Valley Hermitage", "ward": "Dene", "classification": "River Valley"}],
  "T5A3L1": [{"name": "Homesteader", "ward": "Dene", "classification": "Redeveloping"}, {"name": "River Valley Hermitage", "ward": "Dene", "classification": "River Valley"}],
  "T5A3L5": [{"name": "Sifton Park", "ward": "Dene", "classification": "Redeveloping"}, {"name": "River Valley Hermitage", "ward": "Dene", "classification": "River Valley"}],
  "T5A3M1": [{"name": "River Valley Hermitage", "ward": "Dene", "classification": "River Valley"}, {"name": "Belmont", "ward": "Dene", "classification": "Redeveloping"}],
  "T5A3R5": [{"name": "Sifton Park", "ward": "Dene", "classification": "Redeveloping"}, {"name": "River Valley Hermitage", "ward": "Dene", "classification": "River Valley"}],
  "T5A3X5": [{"name": "River Valley Hermitage", "ward": "Dene", "classification": "River Valley"}, {"name": "Kernohan", "ward": "Dene", "classification": "Redeveloping"}],
  "T5A3Y4": [{"name": "River Valley Hermitage", "ward": "Dene", "classification": "River Valley"}, {"name": "Kernohan", "ward": "Dene", "classification": "Redeveloping"}],
  "T5A3Y6": [{"name": "River Valley Hermitage", "ward": "Dene", "classification": "River Valley"}, {"name": "Kernohan", "ward": "Dene", "classification": "Redeveloping"}],
  "T5A3Z6": [{"name": "River Valley Hermitage", "ward": "Dene", "classification": "River Valley"}, {"name": "Kernohan", "ward": "Dene", "classification": "Redeveloping"}],
  "T5A3Z7": [{"name": "River Valley Hermitage", "ward": "Dene", "classification": "River Valley"}, {"name": "Kernohan", "ward": "Dene", "classification": "Redeveloping"}],
  "T5A4A2": [{"name": "River Valley Hermitage", "ward": "Dene", "classification": "River Valley"}, {"name": "Kernohan", "ward": "Dene", "classification": "Redeveloping"}],
  "T5A4B9": [{"name": "River Valley Hermitage", "ward": "Dene", "classification": "River Valley"}, {"name": "Kernohan", "ward": "Dene", "classification": "Redeveloping"}],
  "T5A4H1": [{"name": "River Valley Hermitage", "ward": "Dene", "classification": "River Valley"}, {"name": "Kernohan", "ward": "Dene", "classification": "Redeveloping"}],
  "T5A4H7": [{"name": "Homesteader", "ward": "Dene", "classification": "Redeveloping"}, {"name": "River Valley Hermitage", "ward": "Dene", "classification": "River Valley"}],
  "T5A4H8": [{"name": "Homesteader", "ward": "Dene", "classification": "Redeveloping"}, {"name": "River Valley Hermitage", "ward": "Dene", "classification": "River Valley"}],
  "T5A4K7": [{"name": "Overlanders", "ward": "Dene", "classification": "Redeveloping"}, {"name": "River Valley Hermitage", "ward": "Dene", "classification": "River Valley"}],
  "T5A4K8": [{"name": "Overlanders", "ward": "Dene", "classification": "Redeveloping"}, {"name": "River Valley Hermitage", "ward": "Dene", "classification": "River Valley"}],
  "T5A4L3": [{"name": "Kennedale Industrial", "ward": "Dene", "classification": "Industrial"}, {"name": "Industrial Heights", "ward": "Métis", "classification": "Industrial"}],
  "T5A4S1": [{"name": "Canon Ridge", "ward": "Dene", "classification": "Redeveloping"}, {"name": "River Valley Hermitage", "ward": "Dene", "classification": "River Valley"}],
  "T5A4X4": [{"name": "Casselman", "ward": "Dene", "classification": "Redeveloping"}, {"name": "McLeod", "ward": "Dene", "classification": "Redeveloping"}],
  "T5A4X5": [{"name": "Casselman", "ward": "Dene", "classification": "Redeveloping"}, {"name": "McLeod", "ward": "Dene", "classification": "Redeveloping"}],
  "T5A4X7": [{"name": "Casselman", "ward": "Dene", "classification": "Redeveloping"}, {"name": "McLeod", "ward": "Dene", "classification": "Redeveloping"}],
  "T5A4Y5": [{"name": "River Valley Hermitage", "ward": "Dene", "classification": "River Valley"}, {"name": "Kernohan", "ward": "Dene", "classification": "Redeveloping"}],
  "T5A4Y6": [{"name": "River Valley Hermitage", "ward": "Dene", "classification": "River Valley"}, {"name": "Belmont", "ward": "Dene", "classification": "Redeveloping"}],
  "T5A4Z9": [{"name": "River Valley Hermitage", "ward": "Dene", "classification": "River Valley"}, {"name": "Kernohan", "ward": "Dene", "classification": "Redeveloping"}],
  "T5A5A3": [{"name": "River Valley Hermitage", "ward": "Dene", "classification": "River Valley"}, {"name": "Belmont", "ward": "Dene", "classification": "Redeveloping"}],
  "T5A5A5": [{"name": "River Valley Hermitage", "ward": "Dene", "classification": "River Valley"}, {"name": "Kernohan", "ward": "Dene", "classification": "Redeveloping"}],
  "T5A5B3": [{"name": "Overlanders", "ward": "Dene", "classification": "Redeveloping"}, {"name": "River Valley Hermitage", "ward": "Dene", "classification": "River Valley"}],
  "T5A5G1": [{"name": "River Valley Hermitage", "ward": "Dene", "classification": "River Valley"}, {"name": "Belmont", "ward": "Dene", "classification": "Redeveloping"}],
  "T5A5H2": [{"name": "Canon Ridge", "ward": "Dene", "classification": "Redeveloping"}, {"name": "River Valley Hermitage", "ward": "Dene", "classification": "River Valley"}],
  "T5A5H4": [{"name": "Canon Ridge", "ward": "Dene", "classification": "Redeveloping"}, {"name": "River Valley Hermitage", "ward": "Dene", "classification": "River Valley"}],
  "T5A5H5": [{"name": "Canon Ridge", "ward": "Dene", "classification": "Redeveloping"}, {"name": "River Valley Hermitage", "ward": "Dene", "classification": "River Valley"}],
  "T5A5J5": [{"name": "Canon Ridge", "ward": "Dene", "classification": "Redeveloping"}, {"name": "River Valley Hermitage", "ward": "Dene", "classification": "River Valley"}]
};

/**
 * Returns City of Edmonton POSSE Classification
 */
export function getPosseClassification(neighbourhoodName: string, typology?: StreetLayoutTypology): string {
  if (!neighbourhoodName) return 'Redeveloping';
  const lower = neighbourhoodName.toLowerCase();
  if (lower.includes('industrial') || lower.includes('coronet') || lower.includes('davies industrial') || lower.includes('mistatim') || lower.includes('rampart') || lower.includes('pylypow')) {
    return 'Industrial';
  }
  if (lower.includes('river valley') || lower.includes('ravine')) {
    return 'River Valley';
  }
  if (
    lower.includes('clareview town centre') ||
    lower.includes('windermere') ||
    lower.includes('chappelle') ||
    lower.includes('allard') ||
    lower.includes('keswick') ||
    lower.includes('laurel') ||
    lower.includes('tamarack') ||
    lower.includes('secord') ||
    lower.includes('rosenthal') ||
    lower.includes('granville') ||
    lower.includes('mcconachie') ||
    lower.includes('cy becker') ||
    lower.includes('cavanagh') ||
    lower.includes('aster') ||
    lower.includes('crystallina') ||
    lower.includes('blatchford') ||
    typology === 'contemporary_townhomes'
  ) {
    return 'Developing';
  }
  return 'Redeveloping';
}

/**
 * Input Intent Recognition
 */
export type InputIntent =
  | { type: 'fsa'; fsa: string; isValid: boolean; fsaData?: (typeof EDMONTON_FSA_DATA)[string] }
  | { type: 'postal_code'; code: string; fsa: string; formatted: string; isValid: boolean }
  | { type: 'neighbourhood'; query: string };

export function classifyInputIntent(query: string): InputIntent {
  const clean = query.trim().toUpperCase().replace(/\s+/g, '');
  
  // Pattern 1: FSA (3-Character Alpha-Numeric, e.g., T5A)
  if (/^[A-Z]\d[A-Z]$/.test(clean)) {
    const fsaData = EDMONTON_FSA_DATA[clean];
    return {
      type: 'fsa',
      fsa: clean,
      isValid: Boolean(fsaData),
      fsaData
    };
  }

  // Pattern 2: Full Postal Code (6-Character Alpha-Numeric, e.g., T5A0A1 or T5A 0A1)
  if (/^[A-Z]\d[A-Z]\d[A-Z]\d$/.test(clean)) {
    const fsa = clean.slice(0, 3);
    const formatted = `${clean.slice(0, 3)} ${clean.slice(3)}`;
    const isValid = Boolean(EDMONTON_EXACT_POSTAL_CODES[clean] || EDMONTON_FSA_DATA[fsa]);
    return {
      type: 'postal_code',
      code: clean,
      fsa,
      formatted,
      isValid
    };
  }

  // Pattern 3: Neighbourhood Name Search (Text Input)
  return {
    type: 'neighbourhood',
    query: query.trim()
  };
}

// 1. Mapping of 3-character Forward Sortation Areas (FSAs) to their primary neighbourhoods, wards, and typologies
export const EDMONTON_FSA_DATA: Record<
  string,
  {
    name: string;
    neighbourhoods: string[];
    ward: string;
    typology: StreetLayoutTypology;
  }
> = {
  T5A: {
    name: 'York / Belvedere / Clareview',
    neighbourhoods: ['York', 'Belvedere', 'Belmont', 'Casselman', 'Miller', 'Canon Ridge', 'McLeod', 'Homesteader', 'Sifton Park', 'Kernohan', 'Overlanders', 'Clareview Town Centre', 'Kennedale Industrial', 'Industrial Heights', 'River Valley Hermitage'],
    ward: 'Dene',
    typology: 'suburban_front_driveway'
  },
  T5B: {
    name: 'Highlands / Virginia Park / Bellevue',
    neighbourhoods: ['Highlands', 'Virginia Park', 'Bellevue', 'Montrose', 'Eastwood', 'Alberta Avenue', 'Delton', 'Parkdale', 'Cromdale', 'Elmwood Park', 'Edmonton Northlands', 'Yellowhead Corridor East', 'Industrial Heights', 'River Valley Highlands'],
    ward: 'Métis',
    typology: 'mature_laned'
  },
  T5C: {
    name: 'Delwood / Balwin / Kilkenny',
    neighbourhoods: ['Delwood', 'Balwin', 'Kilkenny', 'Kildare', 'Belvedere', 'York', 'Yellowhead Corridor East'],
    ward: 'tastawiyiniwak',
    typology: 'mature_laned'
  },
  T5E: {
    name: 'Griesbach / Glengarry / Killarney',
    neighbourhoods: ['Griesbach', 'Glengarry', 'Killarney', 'Rosslyn', 'Lauderdale', 'Evansdale', 'Northmount', 'Calder', 'Kensington', 'Yellowhead Corridor East', 'Yellowhead Corridor West'],
    ward: 'Anirniq',
    typology: 'contemporary_townhomes'
  },
  T5G: {
    name: 'Alberta Avenue / Spruce Avenue / Prince Rupert',
    neighbourhoods: ['Alberta Avenue', 'Spruce Avenue', 'Prince Rupert', 'Westwood', 'Delton', 'Blatchford Area', 'Central McDougall', 'Queen Mary Park', 'McCauley', 'Yellowhead Corridor East'],
    ward: 'O-day\'min',
    typology: 'mature_laned'
  },
  T5H: {
    name: 'Central McDougall / McCauley / Boyle Street',
    neighbourhoods: ['Central McDougall', 'McCauley', 'Boyle Street', 'Riverdale', 'Queen Mary Park', 'Cromdale', 'Wîhkwêntôwin', 'Downtown', 'River Valley Kinnaird'],
    ward: 'O-day\'min',
    typology: 'infill_skinny'
  },
  T5J: {
    name: 'Downtown Core / Rossdale',
    neighbourhoods: ['Downtown', 'Rossdale', 'Boyle Street', 'Riverdale', 'Wîhkwêntôwin'],
    ward: 'O-day\'min',
    typology: 'infill_skinny'
  },
  T5K: {
    name: 'Wîhkwêntôwin (Oliver) / Downtown West',
    neighbourhoods: ['Wîhkwêntôwin', 'Downtown', 'Rossdale', 'Queen Mary Park', 'River Valley Victoria'],
    ward: 'O-day\'min',
    typology: 'infill_skinny'
  },
  T5L: {
    name: 'Inglewood / Sherbrooke / Prince Charles',
    neighbourhoods: ['Inglewood', 'Sherbrooke', 'Prince Charles', 'Woodcroft', 'Dovercourt', 'Athlone', 'Wellington', 'Calder', 'Kensington', 'Dominion Industrial', 'Bonaventure Industrial', 'Huff Bremner Estate Industrial', 'Hagmann Estate Industrial', 'McArthur Industrial', 'Brown Industrial', 'Mistatim Industrial', 'Pembina', 'Hudson', 'Rampart Industrial', 'Baranow'],
    ward: 'Anirniq',
    typology: 'mature_laned'
  },
  T5M: {
    name: 'North Glenora / Westmount / High Park',
    neighbourhoods: ['North Glenora', 'Westmount', 'Inglewood', 'Woodcroft', 'High Park', 'McQueen', 'Sheffield Industrial', 'West Sheffield Industrial', 'High Park Industrial', 'Huff Bremner Estate Industrial', 'Garside Industrial', 'Alberta Park Industrial', 'Norwester Industrial'],
    ward: 'Nakota Isga',
    typology: 'mature_laned'
  },
  T5N: {
    name: 'Glenora / Westmount / Crestwood / Grovenor',
    neighbourhoods: ['Glenora', 'Westmount', 'Crestwood', 'Grovenor', 'McQueen', 'North Glenora', 'Wîhkwêntôwin', 'River Valley Glenora', 'River Valley Victoria', 'River Valley Capitol Hill'],
    ward: 'Nakota Isga',
    typology: 'mature_laned'
  },
  T5P: {
    name: 'Canora / Glenwood / West Jasper Place',
    neighbourhoods: ['Canora', 'Glenwood', 'West Jasper Place', 'Britannia Youngstown', 'Mayfield', 'High Park', 'Youngstown Industrial', 'West Sheffield Industrial', 'Sherwood', 'Meadowlark Park', 'West Meadowlark Park', 'Crestwood', 'Grovenor'],
    ward: 'Nakota Isga',
    typology: 'suburban_front_driveway'
  },
  T5R: {
    name: 'Parkview / Laurier Heights / Rio Terrace',
    neighbourhoods: ['Parkview', 'Laurier Heights', 'Rio Terrace', 'Lynnwood', 'Patricia Heights', 'Jasper Park', 'Sherwood', 'Meadowlark Park', 'Elmwood', 'West Meadowlark Park', 'Quesnell Heights', 'Westridge', 'River Valley Laurier', 'River Valley Capitol Hill', 'River Valley Lessard North'],
    ward: 'sipiwiyiniwak',
    typology: 'mature_laned'
  },
  T5S: {
    name: 'Winterburn / Place LaRue / Westview Village',
    neighbourhoods: ['Place LaRue', 'Westview Village', 'Winterburn Industrial Area West', 'Winterburn Industrial Area East', 'Trumpeter Area', 'Starling', 'Hawks Ridge', 'Kinglet Gardens', 'Pintail Landing', 'Terra Losa', 'McNamara Industrial', 'Wilson Industrial', 'Stone Industrial', 'Morin Industrial', 'Armstrong Industrial', 'White Industrial', 'Poundmaker Industrial', 'Sunwapta Industrial', 'Edmiston Industrial'],
    ward: 'Nakota Isga',
    typology: 'suburban_front_driveway'
  },
  T5T: {
    name: 'Callingwood / Glastonbury / The Hamptons / Belmead',
    neighbourhoods: ['Callingwood North', 'Callingwood South', 'Callingwood', 'Belmead', 'Aldergrove', 'Thorncliff', 'Ormsby Place', 'Lymburn', 'La Perle', 'Glastonbury', 'The Hamptons', 'Secord', 'Rosenthal', 'Granville', 'Webber Greens', 'Suder Greens', 'Potter Greens', 'Breckenridge Greens', 'Stewart Greens', 'Lewis Farms', 'Summerlea', 'Terra Losa', 'Oleskiw'],
    ward: 'sipiwiyiniwak',
    typology: 'suburban_front_driveway'
  },
  T5V: {
    name: 'Mistatim / Kinokamau / Carleton Square',
    neighbourhoods: ['Mistatim Industrial', 'Kinokamau Plains Area', 'Carleton Square Industrial', 'Mitchell Industrial', 'Hawin Park Estate Industrial', 'Gagnon Estate Industrial', 'Garside Industrial', 'Alberta Park Industrial', 'Norwester Industrial', 'Starling', 'Trumpeter Area', 'Pintail Landing'],
    ward: 'Anirniq',
    typology: 'suburban_front_driveway'
  },
  T5W: {
    name: 'Beverly Heights / Rundle Heights / Newton / Beacon Heights',
    neighbourhoods: ['Beverly Heights', 'Rundle Heights', 'Beacon Heights', 'Newton', 'Bergman', 'Highlands', 'Montrose', 'Abbottsfield', 'Industrial Heights', 'River Valley Highlands', 'River Valley Rundle'],
    ward: 'Métis',
    typology: 'mature_laned'
  },
  T5X: {
    name: 'Castledowns / Beaumaris / Baturyn / Canossa',
    neighbourhoods: ['Beaumaris', 'Baturyn', 'Lorelei', 'Dunluce', 'Caernarvon', 'Carlisle', 'Canossa', 'Rapperswill', 'Chambery', 'Elsinore', 'Baranow', 'Griesbach'],
    ward: 'tastawiyiniwak',
    typology: 'suburban_front_driveway'
  },
  T5Y: {
    name: 'Clareview / McConachie / Cy Becker / Brintnell',
    neighbourhoods: ['Hollick-Kenyon', 'Brintnell', 'Matt Berry', 'Clareview Town Centre', 'Clareview', 'McConachie', 'Cy Becker', 'Miller', 'Kirkness', 'Fraser', 'Bannerman', 'Hairsine', 'Ebbers', 'Gorman', 'Quarry Ridge', 'Evergreen', 'Marquis'],
    ward: 'Dene',
    typology: 'contemporary_townhomes'
  },
  T5Z: {
    name: 'Lake District / Eaux Claires / Belle Rive / Schonsee',
    neighbourhoods: ['Eaux Claires', 'Belle Rive', 'Mayliewan', 'Klarvatten', 'Lago Lindo', 'Ozerna', 'Schonsee', 'Crystallina Nera West', 'Crystallina Nera East', 'Crystallina Nera'],
    ward: 'tastawiyiniwak',
    typology: 'suburban_front_driveway'
  },
  T6A: {
    name: 'Ottewell / Capilano / Forest Heights / Gold Bar',
    neighbourhoods: ['Ottewell', 'Capilano', 'Forest Heights', 'Fulton Place', 'Terrace Heights', 'Gold Bar', 'Holyrood', 'Cloverdale', 'Eastgate Business Park', 'River Valley Gold Bar', 'River Valley Riverside'],
    ward: 'Métis',
    typology: 'mature_laned'
  },
  T6B: {
    name: 'Kenilworth / King Edward Park / Davies Industrial',
    neighbourhoods: ['Kenilworth', 'King Edward Park', 'Ottewell', 'Girard Industrial', 'Davies Industrial East', 'Davies Industrial West', 'Weir Industrial', 'Morris Industrial', 'Lambton Industrial', 'Roper Industrial', 'Pylypow Industrial', 'Gainer Industrial', 'Southeast Industrial', 'Coronet Industrial', 'Coronet Addition Industrial', 'Rosedale Industrial'],
    ward: 'Métis',
    typology: 'mature_laned'
  },
  T6C: {
    name: 'Bonnie Doon / Strathearn / Holyrood / Avonmore',
    neighbourhoods: ['Bonnie Doon', 'Strathearn', 'Holyrood', 'Avonmore', 'Idylwylde', 'King Edward Park', 'Ritchie', 'Cloverdale', 'Kenilworth', 'Ottewell', 'Strathcona', 'Mill Creek Ravine South', 'Mill Creek Ravine North'],
    ward: 'Métis',
    typology: 'mature_laned'
  },
  T6E: {
    name: 'Strathcona / Garneau / Ritchie / Hazeldean',
    neighbourhoods: ['Strathcona', 'Garneau', 'Ritchie', 'Hazeldean', 'Queen Alexandra', 'Argyll', 'Avonmore', 'Bonnie Doon', 'Strathcona Junction', 'CPR Irvine', 'Coronet Industrial', 'Papaschase Industrial', 'Davies Industrial West', 'McIntyre Industrial', 'Roper Industrial', 'Strathcona Industrial Park', 'Mill Creek Ravine South', 'Mill Creek Ravine North', 'River Valley Walterdale'],
    ward: 'papastew',
    typology: 'mature_laned'
  },
  T6G: {
    name: 'University of Alberta / McKernan / Belgravia / Windsor Park',
    neighbourhoods: ['University of Alberta', 'McKernan', 'Belgravia', 'Windsor Park', 'Parkallen', 'Garneau', 'Queen Alexandra', 'River Valley Walterdale', 'River Valley Mayfair'],
    ward: 'papastew',
    typology: 'infill_skinny'
  },
  T6H: {
    name: 'Lansdowne / Pleasantview / Malmo Plains / Grandview Heights',
    neighbourhoods: ['Lansdowne', 'Pleasantview', 'Malmo Plains', 'Grandview Heights', 'Lendrum Place', 'Parkallen', 'Allendale', 'Empire Park', 'Brookside', 'Brander Gardens', 'Ramsay Heights', 'Rhatigan Ridge', 'University of Alberta Farm', 'Calgary Trail North', 'Whitemud Creek Ravine North', 'River Valley Whitemud', 'River Valley Fort Edmonton', 'River Valley Terwillegar'],
    ward: 'papastew',
    typology: 'mature_laned'
  },
  T6J: {
    name: 'Greenfield / Duggan / Blue Quill / Twin Brooks / Aspen Gardens',
    neighbourhoods: ['Greenfield', 'Duggan', 'Blue Quill', 'Blue Quill Estates', 'Sweet Grass', 'Steinhauer', 'Twin Brooks', 'Bearspaw', 'Keheewin', 'Skyrattler', 'Ermineskin', 'Rideau Park', 'Royal Gardens', 'Aspen Gardens', 'Westbrook Estates', 'Blackburne', 'Calgary Trail South', 'Whitemud Creek Ravine South', 'Blackmud Creek Ravine', 'Whitemud Creek Ravine Twin Brooks'],
    ward: 'papastew',
    typology: 'suburban_front_driveway'
  },
  T6K: {
    name: 'Mill Woods / Richfield / Tweddle Place / Satoo / Ekota',
    neighbourhoods: ['Mill Woods', 'Richfield', 'Tweddle Place', 'Michaels Park', 'Lee Ridge', 'Kameyosek', 'Ekota', 'Satoo', 'Menisa', 'Tipaskan', 'Meyonohk', 'Tawa', 'Meyokumin', 'Mill Woods Park'],
    ward: 'Karhiio',
    typology: 'suburban_front_driveway'
  },
  T6L: {
    name: 'Hillview / Greenview / Minchau / Weinlos / Crawford Plains',
    neighbourhoods: ['Hillview', 'Greenview', 'Minchau', 'Weinlos', 'Bisset', 'Meyokumin', 'Pollard Meadows', 'Daly Grove', 'Crawford Plains', 'Sakaw', 'Kiniski Gardens', 'Jackson Heights', 'Tawa', 'Mill Woods Town Centre', 'Mill Woods Golf Course'],
    ward: 'Karhiio',
    typology: 'suburban_front_driveway'
  },
  T6M: {
    name: 'The Hamptons / Edgemont / Cameron Heights / Wedgewood',
    neighbourhoods: ['The Hamptons', 'Edgemont', 'The Uplands', 'Cameron Heights', 'Wedgewood Heights', 'Jamieson Place', 'Dechene', 'Gariepy', 'Donsdale', 'Oleskiw', 'Stillwater', 'River\'s Edge', 'Riverview Area', 'River Valley Cameron', 'River Valley Oleskiw', 'River Valley Lessard North'],
    ward: 'sipiwiyiniwak',
    typology: 'suburban_front_driveway'
  },
  T6N: {
    name: 'South Edmonton Common / Research Park',
    neighbourhoods: ['South Edmonton Common', 'Edmonton Research and Development Park', 'Parsons Industrial'],
    ward: 'Karhiio',
    typology: 'suburban_front_driveway'
  },
  T6P: {
    name: 'Maple Ridge / Southeast Industrial / Aster',
    neighbourhoods: ['Maple Ridge', 'Maple Ridge Industrial', 'Southeast Industrial', 'Aster', 'Larkspur'],
    ward: 'Sspomitapi',
    typology: 'suburban_front_driveway'
  },
  T6R: {
    name: 'Riverbend / Terwillegar / Magrath / Mactaggart / Hodgson',
    neighbourhoods: ['Terwillegar Towne', 'South Terwillegar', 'Riverbend', 'Mactaggart', 'Magrath Heights', 'Hodgson', 'Leger', 'Haddow', 'Falconer Heights', 'Henderson Estates', 'Rhatigan Ridge', 'Bulyea Heights', 'Carter Crest', 'Ogilvie Ridge', 'River Valley Terwillegar', 'Whitemud Creek Ravine South', 'Whitemud Creek Ravine Twin Brooks'],
    ward: 'pihêsiwin',
    typology: 'suburban_front_driveway'
  },
  T6S: {
    name: 'Clover Bar Area',
    neighbourhoods: ['Clover Bar Area'],
    ward: 'Dene',
    typology: 'suburban_front_driveway'
  },
  T6T: {
    name: 'Tamarack / Laurel / Silver Berry / Wild Rose',
    neighbourhoods: ['Tamarack', 'Laurel', 'Silver Berry', 'Wild Rose', 'Maple', 'Aster', 'Larkspur', 'Alces', 'Southeast Industrial'],
    ward: 'Sspomitapi',
    typology: 'contemporary_townhomes'
  },
  T6V: {
    name: 'Carlton / Oxford / Cumberland / Albany / Hudson',
    neighbourhoods: ['Carlton', 'Oxford', 'Cumberland', 'Albany', 'Hudson', 'Pembina', 'Baranow', 'Rampart Industrial', 'Goodridge Corners', 'Mistatim Industrial'],
    ward: 'Anirniq',
    typology: 'suburban_front_driveway'
  },
  T6W: {
    name: 'Windermere / Ambleside / Rutherford / Chappelle / Allard',
    neighbourhoods: ['Windermere', 'Ambleside', 'Rutherford', 'MacEwan', 'Chappelle', 'Allard', 'Cavanagh', 'Keswick', 'Glenridding Heights', 'Glenridding Ravine', 'Paisley', 'Graydon Hill', 'Desrochers Area', 'Callaghan', 'Richford', 'Blackburne', 'Blackmud Creek', 'Hays Ridge Area', 'Heritage Valley Town Centre', 'Heritage Valley Area', 'River Valley Windermere', 'River Valley Keswick', 'Kendal'],
    ward: 'pihêsiwin',
    typology: 'contemporary_townhomes'
  },
  T6X: {
    name: 'Summerside / Ellerslie / Walker / The Orchards',
    neighbourhoods: ['Summerside', 'Ellerslie', 'Walker', 'The Orchards At Ellerslie', 'Charlesworth', 'Mattson', 'Meltwater', 'Decoteau', 'Alces', 'Ellerslie Industrial', 'Edmonton South East', 'Edmonton South Central East'],
    ward: 'Karhiio',
    typology: 'suburban_front_driveway'
  },
  T6Y: {
    name: 'Crossroads / Edmonton South Rural',
    neighbourhoods: ['Crossroads', 'Edmonton South Central', 'Edmonton South West'],
    ward: 'Ipiihkoohkanipiaohtsi',
    typology: 'suburban_front_driveway'
  }
};

// 2. Comprehensive Directory of Edmonton Neighbourhoods with Primary FSA and Ward
export interface NeighbourhoodMeta {
  name: string;
  fsa: string;
  ward: string;
  typology: StreetLayoutTypology;
  aliases: string[];
}

export const ALL_EDMONTON_NEIGHBOURHOODS: NeighbourhoodMeta[] = [
  // Central / Core
  { name: 'Strathcona', fsa: 'T6E', ward: 'papastew', typology: 'mature_laned', aliases: ['Old Strathcona', 'Whyte', 'Whyte Ave', 'Whyte Avenue', '82 Ave', '82 Avenue', '104 St', 'Gateway Blvd'] },
  { name: 'Garneau', fsa: 'T6G', ward: 'papastew', typology: 'infill_skinny', aliases: ['109 St', '88 Ave', 'University', 'U of A', 'Hub Mall'] },
  { name: 'Oliver (Wîhkwêntôwin)', fsa: 'T5K', ward: 'O-day\'min', typology: 'infill_skinny', aliases: ['Oliver', 'Wihkwentowin', 'Wîhkwêntôwin', '124 St', '104 Ave', 'Jasper Ave West', 'Unity Square'] },
  { name: 'Downtown', fsa: 'T5J', ward: 'O-day\'min', typology: 'infill_skinny', aliases: ['Jasper Ave', 'Jasper Avenue', '104 St', 'Ice District', 'Rogers Place', 'Rice Howard Way', 'City Centre'] },
  { name: 'Westmount', fsa: 'T5N', ward: 'O-day\'min', typology: 'mature_laned', aliases: ['124 St', '124 Street', '107 Ave', 'Westmount Mall'] },
  { name: 'Glenora', fsa: 'T5N', ward: 'Nakota Isga', typology: 'mature_laned', aliases: ['142 St', 'Stony Plain Rd', 'Alexander Circle'] },
  { name: 'Highlands', fsa: 'T5W', ward: 'Métis', typology: 'mature_laned', aliases: ['112 Ave', 'Ada Blvd', 'Ada Boulevard', 'Gibbons'] },
  { name: 'Bonnie Doon', fsa: 'T6C', ward: 'Métis', typology: 'mature_laned', aliases: ['82 Ave', '83 St', 'Campus Saint-Jean', 'Bonnie Doon Mall'] },
  { name: 'Ritchie', fsa: 'T6E', ward: 'papastew', typology: 'mature_laned', aliases: ['Ritchie Market', '99 St', '76 Ave'] },
  { name: 'Queen Alexandra', fsa: 'T6E', ward: 'papastew', typology: 'infill_skinny', aliases: ['104 St', '76 Ave', 'Calgary Trail'] },
  { name: 'Queen Mary Park', fsa: 'T5H', ward: 'O-day\'min', typology: 'mature_laned', aliases: ['107 Ave', '116 St', 'Brewery District'] },
  { name: 'Central McDougall', fsa: 'T5H', ward: 'O-day\'min', typology: 'infill_skinny', aliases: ['105 Ave', '101 St', 'Chinatown', 'Kingsway'] },
  { name: 'McCauley', fsa: 'T5H', ward: 'O-day\'min', typology: 'infill_skinny', aliases: ['Little Italy', 'Chinatown North', '95 St', '106 Ave', 'Commonwealth'] },
  { name: 'McKernan', fsa: 'T6G', ward: 'papastew', typology: 'infill_skinny', aliases: ['114 St', '76 Ave', 'McKernan/Belgravia Station'] },
  { name: 'Belgravia', fsa: 'T6G', ward: 'papastew', typology: 'infill_skinny', aliases: ['Saskatchewan Dr', 'Fox Drive', '76 Ave'] },
  { name: 'Parkallen', fsa: 'T6G', ward: 'papastew', typology: 'mature_laned', aliases: ['65 Ave', '111 St', '109 St'] },
  { name: 'Hazeldean', fsa: 'T6E', ward: 'papastew', typology: 'mature_laned', aliases: ['66 Ave', '99 St', 'Mill Creek'] },
  { name: 'Crestwood', fsa: 'T5N', ward: 'Nakota Isga', typology: 'mature_laned', aliases: ['142 St', 'Candy Cane Lane', '95 Ave'] },
  { name: 'Beverly Heights', fsa: 'T5W', ward: 'Métis', typology: 'mature_laned', aliases: ['118 Ave', 'Beverly', '40 St', 'Floden'] },
  { name: 'Capilano', fsa: 'T6A', ward: 'Métis', typology: 'mature_laned', aliases: ['106 Ave', 'Hardisty', '50 St', 'Capilano Mall'] },
  { name: 'Inglewood', fsa: 'T5L', ward: 'Anirniq', typology: 'infill_skinny', aliases: ['118 Ave', '111 Ave', '124 St'] },
  { name: 'Prince Charles', fsa: 'T5L', ward: 'Anirniq', typology: 'infill_skinny', aliases: ['127 St', '121 St', 'Yellowhead'] },
  { name: 'Rossdale', fsa: 'T5K', ward: 'O-day\'min', typology: 'mature_laned', aliases: ['Telus Field', 'RE/MAX Field', 'Riverdale East'] },
  { name: 'Riverdale', fsa: 'T5H', ward: 'O-day\'min', typology: 'mature_laned', aliases: ['Rowland Rd', 'Little Brick', '84 St'] },
  { name: 'Forest Heights', fsa: 'T6A', ward: 'Métis', typology: 'mature_laned', aliases: ['84 St', '98 Ave', 'McNally'] },
  { name: 'Holyrood', fsa: 'T6C', ward: 'Métis', typology: 'mature_laned', aliases: ['85 St', '90 Ave', 'Valley Line LRT'] },
  { name: 'King Edward Park', fsa: 'T6C', ward: 'Métis', typology: 'mature_laned', aliases: ['82 Ave', '75 St', 'Mill Creek Ravine'] },
  { name: 'Avonmore', fsa: 'T6C', ward: 'Métis', typology: 'mature_laned', aliases: ['75 St', '73 Ave', 'Argyll Rd'] },
  { name: 'Grovenor', fsa: 'T5N', ward: 'Nakota Isga', typology: 'mature_laned', aliases: ['142 St', '149 St', '102 Ave'] },
  { name: 'Allendale', fsa: 'T6H', ward: 'papastew', typology: 'infill_skinny', aliases: ['104 St', '63 Ave', 'Allendale School'] },
  { name: 'Pleasantview', fsa: 'T6H', ward: 'papastew', typology: 'mature_laned', aliases: ['106 St', '104 St', '51 Ave'] },
  { name: 'Lansdowne', fsa: 'T6H', ward: 'papastew', typology: 'mature_laned', aliases: ['122 St', '51 Ave', 'Whitemud'] },
  { name: 'Malmo Plains', fsa: 'T6H', ward: 'papastew', typology: 'mature_laned', aliases: ['111 St', 'Michener Park', '48 Ave'] },
  { name: 'Empire Park', fsa: 'T6H', ward: 'papastew', typology: 'suburban_front_driveway', aliases: ['Southgate', '48 Ave', '106 St'] },

  // South / Southeast / Mill Woods
  { name: 'Mill Woods', fsa: 'T6K', ward: 'Karhiio', typology: 'suburban_front_driveway', aliases: ['Millwoods', 'Mill Woods Town Centre', '28 Ave', '66 St'] },
  { name: 'Richfield', fsa: 'T6K', ward: 'Karhiio', typology: 'suburban_front_driveway', aliases: ['34 Ave', '91 St', 'Mill Woods Rd'] },
  { name: 'Lee Ridge', fsa: 'T6K', ward: 'Karhiio', typology: 'suburban_front_driveway', aliases: ['66 St', '34 Ave', 'Mill Woods Rd'] },
  { name: 'Tweddle Place', fsa: 'T6K', ward: 'Karhiio', typology: 'suburban_front_driveway', aliases: ['91 St', 'Mill Woods Rd East'] },
  { name: 'Michaels Park', fsa: 'T6K', ward: 'Karhiio', typology: 'suburban_front_driveway', aliases: ['Whitemud', '66 St', '50 St'] },
  { name: 'Kameyosek', fsa: 'T6K', ward: 'Karhiio', typology: 'suburban_front_driveway', aliases: ['66 St', '28 Ave', 'Kameyosek School'] },
  { name: 'Ekota', fsa: 'T6K', ward: 'Karhiio', typology: 'suburban_front_driveway', aliases: ['Knottwood Rd', '66 St'] },
  { name: 'Satoo', fsa: 'T6K', ward: 'Karhiio', typology: 'suburban_front_driveway', aliases: ['Knottwood Rd East', 'Satoo School'] },
  { name: 'Menisa', fsa: 'T6K', ward: 'Karhiio', typology: 'suburban_front_driveway', aliases: ['Knottwood Rd South', 'Menisa School'] },
  { name: 'Meyonohk', fsa: 'T6K', ward: 'Karhiio', typology: 'suburban_front_driveway', aliases: ['Lakewood', '91 St', '23 Ave'] },
  { name: 'Tipaskan', fsa: 'T6K', ward: 'Karhiio', typology: 'suburban_front_driveway', aliases: ['Lakewood Rd', '91 St', '28 Ave'] },
  { name: 'Greenview', fsa: 'T6L', ward: 'Karhiio', typology: 'suburban_front_driveway', aliases: ['Mill Woods Golf', '50 St', '38 Ave'] },
  { name: 'Hillview', fsa: 'T6L', ward: 'Karhiio', typology: 'suburban_front_driveway', aliases: ['Woodvale Rd', '66 St', '34 Ave'] },
  { name: 'Minchau', fsa: 'T6L', ward: 'Sspomitapi', typology: 'suburban_front_driveway', aliases: ['Mill Creek', '50 St', '34 Ave'] },
  { name: 'Weinlos', fsa: 'T6L', ward: 'Sspomitapi', typology: 'suburban_front_driveway', aliases: ['48 St', '34 Ave', 'Weinlos School'] },
  { name: 'Bisset', fsa: 'T6L', ward: 'Sspomitapi', typology: 'suburban_front_driveway', aliases: ['34 Ave', '38 St'] },
  { name: 'Meyokumin', fsa: 'T6L', ward: 'Karhiio', typology: 'suburban_front_driveway', aliases: ['Mill Woods Rd', '66 St', '19 Ave'] },
  { name: 'Pollard Meadows', fsa: 'T6L', ward: 'Sspomitapi', typology: 'suburban_front_driveway', aliases: ['50 St', '19 Ave'] },
  { name: 'Daly Grove', fsa: 'T6L', ward: 'Sspomitapi', typology: 'suburban_front_driveway', aliases: ['23 Ave', '34 St'] },
  { name: 'Crawford Plains', fsa: 'T6L', ward: 'Sspomitapi', typology: 'suburban_front_driveway', aliases: ['16 Ave', '50 St', 'Crawford Plains School'] },
  { name: 'Sakaw', fsa: 'T6L', ward: 'Karhiio', typology: 'suburban_front_driveway', aliases: ['66 St', 'Anthony Henday East'] },
  { name: 'Kiniski Gardens', fsa: 'T6L', ward: 'Sspomitapi', typology: 'suburban_front_driveway', aliases: ['34 St', 'Whitemud East', 'Kiniski'] },
  { name: 'Jackson Heights', fsa: 'T6L', ward: 'Sspomitapi', typology: 'suburban_front_driveway', aliases: ['Burnewood', '50 St', 'Jackson Heights School'] },

  // Southwest / Heritage Valley / Windermere
  { name: 'Windermere', fsa: 'T6W', ward: 'pihêsiwin', typology: 'contemporary_townhomes', aliases: ['Currents of Windermere', 'Windermere Blvd', '170 St SW'] },
  { name: 'Ambleside', fsa: 'T6W', ward: 'pihêsiwin', typology: 'contemporary_townhomes', aliases: ['Windermere Dr', 'Currents Drive', 'Ambleside Link'] },
  { name: 'Rutherford', fsa: 'T6W', ward: 'Ipiihkoohkanipiaohtsi', typology: 'contemporary_townhomes', aliases: ['111 St SW', '119 St SW', 'James Mowatt Trail'] },
  { name: 'MacEwan', fsa: 'T6W', ward: 'Ipiihkoohkanipiaohtsi', typology: 'suburban_front_driveway', aliases: ['MacEwan Road', '111 St SW', 'Ellerslie Road SW'] },
  { name: 'Chappelle', fsa: 'T6W', ward: 'Ipiihkoohkanipiaohtsi', typology: 'contemporary_townhomes', aliases: ['Chappelle Gardens', 'Chappelle Way', 'Heritage Valley SW'] },
  { name: 'Allard', fsa: 'T6W', ward: 'Ipiihkoohkanipiaohtsi', typology: 'contemporary_townhomes', aliases: ['Allard Blvd', 'Dr. Lila Fahlman', '41 Ave SW'] },
  { name: 'Cavanagh', fsa: 'T6W', ward: 'Ipiihkoohkanipiaohtsi', typology: 'contemporary_townhomes', aliases: ['Gateway Blvd South', 'Calgary Trail SW'] },
  { name: 'Keswick', fsa: 'T6W', ward: 'pihêsiwin', typology: 'contemporary_townhomes', aliases: ['Keswick on the River', 'Hesketh', 'River Valley Keswick'] },
  { name: 'Glenridding Heights', fsa: 'T6W', ward: 'pihêsiwin', typology: 'contemporary_townhomes', aliases: ['Glenridding', '170 St SW', 'Rabbit Hill Rd'] },
  { name: 'Glenridding Ravine', fsa: 'T6W', ward: 'pihêsiwin', typology: 'contemporary_townhomes', aliases: ['Whitemud Creek South', 'Glenridding Way'] },
  { name: 'Paisley', fsa: 'T6W', ward: 'Ipiihkoohkanipiaohtsi', typology: 'contemporary_townhomes', aliases: ['Paisley Point', 'Heritage Valley West'] },
  { name: 'Graydon Hill', fsa: 'T6W', ward: 'Ipiihkoohkanipiaohtsi', typology: 'contemporary_townhomes', aliases: ['Graydon Hill Way', 'Ellerslie SW'] },
  { name: 'Desrochers Area', fsa: 'T6W', ward: 'Ipiihkoohkanipiaohtsi', typology: 'contemporary_townhomes', aliases: ['Desrochers', 'Desrochers Gate', 'Heritage Valley Town Centre'] },
  { name: 'Blackburne', fsa: 'T6W', ward: 'Ipiihkoohkanipiaohtsi', typology: 'suburban_front_driveway', aliases: ['Blackburne Dr', 'Calgary Trail South'] },
  { name: 'Blackmud Creek', fsa: 'T6W', ward: 'Ipiihkoohkanipiaohtsi', typology: 'suburban_front_driveway', aliases: ['Blackmud Creek Ravine', 'Ellerslie Rd SW'] },
  { name: 'Riverbend', fsa: 'T6R', ward: 'pihêsiwin', typology: 'suburban_front_driveway', aliases: ['Riverbend Square', 'Rabbit Hill Rd', 'Terwillegar Dr'] },
  { name: 'Terwillegar Towne', fsa: 'T6R', ward: 'pihêsiwin', typology: 'suburban_front_driveway', aliases: ['Terwillegar', 'Towne Centre Blvd', 'Terwillegar Rec Centre'] },
  { name: 'South Terwillegar', fsa: 'T6R', ward: 'pihêsiwin', typology: 'suburban_front_driveway', aliases: ['South Terwillegar Blvd', 'Terwillegar Drive'] },
  { name: 'Mactaggart', fsa: 'T6R', ward: 'pihêsiwin', typology: 'contemporary_townhomes', aliases: ['Mactaggart Sanctuary', 'Magrath', 'Rabbit Hill Rd'] },
  { name: 'Magrath Heights', fsa: 'T6R', ward: 'pihêsiwin', typology: 'contemporary_townhomes', aliases: ['Magrath', 'Magrath Blvd', '23 Ave NW'] },
  { name: 'Hodgson', fsa: 'T6R', ward: 'pihêsiwin', typology: 'contemporary_townhomes', aliases: ['Hodgson Way', 'Whitemud Creek Ravine'] },
  { name: 'Leger', fsa: 'T6R', ward: 'pihêsiwin', typology: 'contemporary_townhomes', aliases: ['Leger Way', 'Lillian Osborne', 'Terwillegar Transit'] },
  { name: 'Haddow', fsa: 'T6R', ward: 'pihêsiwin', typology: 'suburban_front_driveway', aliases: ['Haddow Dr', 'Terwillegar Dog Park'] },
  { name: 'Falconer Heights', fsa: 'T6R', ward: 'pihêsiwin', typology: 'suburban_front_driveway', aliases: ['Falconer Way', 'Riverbend'] },
  { name: 'Henderson Estates', fsa: 'T6R', ward: 'pihêsiwin', typology: 'suburban_front_driveway', aliases: ['Henderson Way', 'River Valley Terwillegar'] },
  { name: 'Rhatigan Ridge', fsa: 'T6R', ward: 'pihêsiwin', typology: 'suburban_front_driveway', aliases: ['Riverbend Rd', 'St. Mary School'] },
  { name: 'Bulyea Heights', fsa: 'T6R', ward: 'pihêsiwin', typology: 'suburban_front_driveway', aliases: ['Bulyea Rd', 'Whitemud Creek'] },
  { name: 'Carter Crest', fsa: 'T6R', ward: 'pihêsiwin', typology: 'suburban_front_driveway', aliases: ['Carter Crest Way', 'Rabbit Hill Rd'] },
  { name: 'Ogilvie Ridge', fsa: 'T6R', ward: 'pihêsiwin', typology: 'suburban_front_driveway', aliases: ['Ogilvie Way', 'Whitemud Creek'] },

  // South / Kaskitayo / Heritage
  { name: 'Greenfield', fsa: 'T6J', ward: 'papastew', typology: 'mature_laned', aliases: ['114 St', '40 Ave', 'Greenfield School'] },
  { name: 'Duggan', fsa: 'T6J', ward: 'papastew', typology: 'suburban_front_driveway', aliases: ['106 St', '38 Ave', 'Duggan Mall'] },
  { name: 'Blue Quill', fsa: 'T6J', ward: 'Ipiihkoohkanipiaohtsi', typology: 'suburban_front_driveway', aliases: ['119 St', '23 Ave', 'Century Park LRT'] },
  { name: 'Blue Quill Estates', fsa: 'T6J', ward: 'Ipiihkoohkanipiaohtsi', typology: 'suburban_front_driveway', aliases: ['Whitemud Creek Ravine South', '119 St'] },
  { name: 'Sweet Grass', fsa: 'T6J', ward: 'Ipiihkoohkanipiaohtsi', typology: 'suburban_front_driveway', aliases: ['111 St', '34 Ave', 'Sweet Grass School'] },
  { name: 'Steinhauer', fsa: 'T6J', ward: 'Ipiihkoohkanipiaohtsi', typology: 'suburban_front_driveway', aliases: ['106 St', '34 Ave', 'Steinhauer School'] },
  { name: 'Twin Brooks', fsa: 'T6J', ward: 'Ipiihkoohkanipiaohtsi', typology: 'suburban_front_driveway', aliases: ['119 St', '9 Ave NW', 'George P. Nicholson'] },
  { name: 'Bearspaw', fsa: 'T6J', ward: 'Ipiihkoohkanipiaohtsi', typology: 'suburban_front_driveway', aliases: ['106 St', 'Bearspaw Lake', '12 Ave NW'] },
  { name: 'Keheewin', fsa: 'T6J', ward: 'Ipiihkoohkanipiaohtsi', typology: 'suburban_front_driveway', aliases: ['106 St', '19 Ave', 'Keheewin School'] },
  { name: 'Skyrattler', fsa: 'T6J', ward: 'Ipiihkoohkanipiaohtsi', typology: 'suburban_front_driveway', aliases: ['111 St', '23 Ave', 'Blackmud Creek'] },
  { name: 'Ermineskin', fsa: 'T6J', ward: 'Ipiihkoohkanipiaohtsi', typology: 'suburban_front_driveway', aliases: ['Century Park', '111 St', '23 Ave'] },
  { name: 'Rideau Park', fsa: 'T6J', ward: 'papastew', typology: 'suburban_front_driveway', aliases: ['106 St', '40 Ave', 'Rideau Park School'] },
  { name: 'Royal Gardens', fsa: 'T6J', ward: 'papastew', typology: 'suburban_front_driveway', aliases: ['111 St', '40 Ave', 'Harry Ainlay'] },
  { name: 'Aspen Gardens', fsa: 'T6J', ward: 'papastew', typology: 'mature_laned', aliases: ['Whitemud Creek', '122 St', '40 Ave'] },
  { name: 'Westbrook Estates', fsa: 'T6J', ward: 'papastew', typology: 'suburban_front_driveway', aliases: ['Derrick Golf', '119 St', 'Westbrook Drive'] },

  // Southeast / The Meadows / Ellerslie
  { name: 'Summerside', fsa: 'T6X', ward: 'Karhiio', typology: 'suburban_front_driveway', aliases: ['Lake Summerside', 'Summerside Blvd', 'Ellerslie Road East', '66 St SW'] },
  { name: 'Ellerslie', fsa: 'T6X', ward: 'Karhiio', typology: 'suburban_front_driveway', aliases: ['Ellerslie Rd', '91 St SW', '66 St SW'] },
  { name: 'Walker', fsa: 'T6X', ward: 'Karhiio', typology: 'contemporary_townhomes', aliases: ['Walker Lakes', '50 St SW', '66 St SW'] },
  { name: 'The Orchards At Ellerslie', fsa: 'T6X', ward: 'Karhiio', typology: 'contemporary_townhomes', aliases: ['The Orchards', 'Orchards', 'Cherry Gate', 'Plum Way'] },
  { name: 'Charlesworth', fsa: 'T6X', ward: 'Karhiio', typology: 'contemporary_townhomes', aliases: ['50 St SW', 'Ellerslie Rd East', 'Charlesworth Way'] },
  { name: 'Tamarack', fsa: 'T6T', ward: 'Sspomitapi', typology: 'contemporary_townhomes', aliases: ['Tamarack Common', '17 St NW', 'Maple Grove'] },
  { name: 'Laurel', fsa: 'T6T', ward: 'Sspomitapi', typology: 'contemporary_townhomes', aliases: ['Laurel Crossing', '24 St NW', '23 Ave NW'] },
  { name: 'Silver Berry', fsa: 'T6T', ward: 'Sspomitapi', typology: 'suburban_front_driveway', aliases: ['Meadows Rec Centre', '34 St NW', 'Silver Berry Rd'] },
  { name: 'Wild Rose', fsa: 'T6T', ward: 'Sspomitapi', typology: 'suburban_front_driveway', aliases: ['34 St NW', '23 Ave NW', 'Mill Creek Ravine'] },
  { name: 'Maple', fsa: 'T6T', ward: 'Sspomitapi', typology: 'contemporary_townhomes', aliases: ['Maple Crest', 'Whitemud Drive East', 'Anthony Henday South East'] },
  { name: 'Aster', fsa: 'T6P', ward: 'Sspomitapi', typology: 'contemporary_townhomes', aliases: ['Aster Way', 'Meadows East', '23 Ave East'] },

  // West / West Jasper Place / Lewis Farms
  { name: 'Callingwood', fsa: 'T5T', ward: 'sipiwiyiniwak', typology: 'suburban_front_driveway', aliases: ['Callingwood Recreation Centre', '69 Ave', '178 St', 'Whitemud West'] },
  { name: 'Callingwood North', fsa: 'T5T', ward: 'sipiwiyiniwak', typology: 'suburban_front_driveway', aliases: ['178 St', '76 Ave', 'Callingwood Park'] },
  { name: 'Callingwood South', fsa: 'T5T', ward: 'sipiwiyiniwak', typology: 'suburban_front_driveway', aliases: ['178 St', '69 Ave', 'Callingwood Square'] },
  { name: 'The Hamptons', fsa: 'T5T', ward: 'sipiwiyiniwak', typology: 'suburban_front_driveway', aliases: ['Hamptons', 'Hemingway Road', '199 St NW', 'Lessard Rd'] },
  { name: 'Glastonbury', fsa: 'T5T', ward: 'sipiwiyiniwak', typology: 'suburban_front_driveway', aliases: ['Glastonbury Blvd', 'Guinevere', '199 St NW'] },
  { name: 'Secord', fsa: 'T5T', ward: 'Nakota Isga', typology: 'contemporary_townhomes', aliases: ['Secord Blvd', '92 Ave NW', '215 St NW', 'Winterburn Rd'] },
  { name: 'Rosenthal', fsa: 'T5T', ward: 'Nakota Isga', typology: 'contemporary_townhomes', aliases: ['Rosenthal Way', '215 St NW', 'Whitemud Drive West'] },
  { name: 'Granville', fsa: 'T5T', ward: 'sipiwiyiniwak', typology: 'contemporary_townhomes', aliases: ['Granville Drive', 'Whitemud West', 'Costco West'] },
  { name: 'Belmead', fsa: 'T5T', ward: 'Nakota Isga', typology: 'suburban_front_driveway', aliases: ['WEM West', '178 St', '87 Ave'] },
  { name: 'Aldergrove', fsa: 'T5T', ward: 'Nakota Isga', typology: 'suburban_front_driveway', aliases: ['178 St', '87 Ave', 'Aldergrove School'] },
  { name: 'Thorncliff', fsa: 'T5T', ward: 'sipiwiyiniwak', typology: 'suburban_front_driveway', aliases: ['87 Ave', '170 St', 'West Edmonton Mall'] },
  { name: 'Ormsby Place', fsa: 'T5T', ward: 'sipiwiyiniwak', typology: 'suburban_front_driveway', aliases: ['Callingwood Rd', '184 St'] },
  { name: 'Lymburn', fsa: 'T5T', ward: 'sipiwiyiniwak', typology: 'suburban_front_driveway', aliases: ['184 St', '178 St', 'Callingwood Rd'] },
  { name: 'La Perle', fsa: 'T5T', ward: 'Nakota Isga', typology: 'suburban_front_driveway', aliases: ['178 St', '95 Ave', '184 St'] },
  { name: 'Edgemont', fsa: 'T6M', ward: 'sipiwiyiniwak', typology: 'contemporary_townhomes', aliases: ['Edgemont Blvd', 'Lessard Road West', '215 St NW'] },
  { name: 'Cameron Heights', fsa: 'T6M', ward: 'sipiwiyiniwak', typology: 'contemporary_townhomes', aliases: ['Cameron Heights Way', 'River Valley Cameron', 'Anthony Henday SW'] },
  { name: 'Wedgewood Heights', fsa: 'T6M', ward: 'sipiwiyiniwak', typology: 'suburban_front_driveway', aliases: ['Wedgewood Ravine', 'Lessard Rd', '184 St'] },
  { name: 'Jamieson Place', fsa: 'T6M', ward: 'sipiwiyiniwak', typology: 'suburban_front_driveway', aliases: ['184 St', 'Dechene', 'Anthony Henday West'] },
  { name: 'Dechene', fsa: 'T6M', ward: 'sipiwiyiniwak', typology: 'suburban_front_driveway', aliases: ['Dechene Rd', '178 St', 'Callingwood Rd'] },
  { name: 'Gariepy', fsa: 'T6M', ward: 'sipiwiyiniwak', typology: 'suburban_front_driveway', aliases: ['178 St', 'Callingwood Rd', 'River Valley Oleskiw'] },
  { name: 'Donsdale', fsa: 'T6M', ward: 'sipiwiyiniwak', typology: 'suburban_front_driveway', aliases: ['Donsdale Drive', 'Lessard Rd', 'North Saskatchewan River'] },

  // North / Castledowns / Lake District
  { name: 'Griesbach', fsa: 'T5E', ward: 'Anirniq', typology: 'contemporary_townhomes', aliases: ['Village at Griesbach', 'Griesbach Parade', '97 St NW', '137 Ave'] },
  { name: 'Castledowns', fsa: 'T5X', ward: 'tastawiyiniwak', typology: 'suburban_front_driveway', aliases: ['Castle Downs', '153 Ave', 'Castle Downs Rec Centre'] },
  { name: 'Beaumaris', fsa: 'T5X', ward: 'tastawiyiniwak', typology: 'suburban_front_driveway', aliases: ['Beaumaris Lake', '106 St', '153 Ave'] },
  { name: 'Baturyn', fsa: 'T5X', ward: 'tastawiyiniwak', typology: 'suburban_front_driveway', aliases: ['112 St', '167 Ave', 'Baturyn School'] },
  { name: 'Lorelei', fsa: 'T5X', ward: 'tastawiyiniwak', typology: 'suburban_front_driveway', aliases: ['97 St', 'Castledowns Rd', 'Lorelei School'] },
  { name: 'Dunluce', fsa: 'T5X', ward: 'Anirniq', typology: 'suburban_front_driveway', aliases: ['115 St', 'Castle Downs Rd', 'Dunluce School'] },
  { name: 'Caernarvon', fsa: 'T5X', ward: 'Anirniq', typology: 'suburban_front_driveway', aliases: ['118 St', '145 Ave', 'Caernarvon School'] },
  { name: 'Carlisle', fsa: 'T5X', ward: 'Anirniq', typology: 'suburban_front_driveway', aliases: ['121 St', '140 Ave', 'Carlisle Community'] },
  { name: 'Canossa', fsa: 'T5X', ward: 'Anirniq', typology: 'suburban_front_driveway', aliases: ['167 Ave NW', '115 St NW'] },
  { name: 'Rapperswill', fsa: 'T5X', ward: 'Anirniq', typology: 'contemporary_townhomes', aliases: ['Newcastle Centre', '127 St NW', '167 Ave'] },
  { name: 'Chambery', fsa: 'T5X', ward: 'tastawiyiniwak', typology: 'suburban_front_driveway', aliases: ['Chambery Way', '106 St NW'] },
  { name: 'Elsinore', fsa: 'T5X', ward: 'tastawiyiniwak', typology: 'suburban_front_driveway', aliases: ['Elsinore Way', '97 St NW'] },
  { name: 'Baranow', fsa: 'T5X', ward: 'Anirniq', typology: 'suburban_front_driveway', aliases: ['127 St', '153 Ave'] },
  { name: 'Eaux Claires', fsa: 'T5Z', ward: 'tastawiyiniwak', typology: 'suburban_front_driveway', aliases: ['97 St', '153 Ave', 'Eaux Claires Transit'] },
  { name: 'Belle Rive', fsa: 'T5Z', ward: 'tastawiyiniwak', typology: 'suburban_front_driveway', aliases: ['82 St', '153 Ave', 'Belle Rive Lake'] },
  { name: 'Mayliewan', fsa: 'T5Z', ward: 'tastawiyiniwak', typology: 'suburban_front_driveway', aliases: ['Mayliewan Lake', '71 St', '153 Ave'] },
  { name: 'Klarvatten', fsa: 'T5Z', ward: 'tastawiyiniwak', typology: 'suburban_front_driveway', aliases: ['82 St NW', '167 Ave NW'] },
  { name: 'Lago Lindo', fsa: 'T5Z', ward: 'tastawiyiniwak', typology: 'suburban_front_driveway', aliases: ['91 St', '167 Ave', 'Lago Lindo School'] },
  { name: 'Ozerna', fsa: 'T5Z', ward: 'tastawiyiniwak', typology: 'suburban_front_driveway', aliases: ['66 St', '153 Ave', 'Ozerna Lake'] },
  { name: 'Schonsee', fsa: 'T5Z', ward: 'tastawiyiniwak', typology: 'contemporary_townhomes', aliases: ['Schonsee Way', '66 St NW', '167 Ave NW'] },
  { name: 'Crystallina Nera', fsa: 'T5Z', ward: 'tastawiyiniwak', typology: 'contemporary_townhomes', aliases: ['Crystallina', '66 St NW', 'Anthony Henday North'] },
  { name: 'Cumberland', fsa: 'T6V', ward: 'Anirniq', typology: 'suburban_front_driveway', aliases: ['142 St NW', '153 Ave NW'] },
  { name: 'Oxford', fsa: 'T6V', ward: 'Anirniq', typology: 'suburban_front_driveway', aliases: ['127 St NW', '153 Ave NW', 'Oxford Lake'] },
  { name: 'Carlton', fsa: 'T6V', ward: 'Anirniq', typology: 'suburban_front_driveway', aliases: ['Carlton Square', '135 St NW', '153 Ave NW'] },
  { name: 'Albany', fsa: 'T6V', ward: 'Anirniq', typology: 'contemporary_townhomes', aliases: ['Albany Market Square', '167 Ave', '127 St'] },
  { name: 'Hudson', fsa: 'T6V', ward: 'Anirniq', typology: 'suburban_front_driveway', aliases: ['140 St NW', '137 Ave'] },
  { name: 'Pembina', fsa: 'T6V', ward: 'Anirniq', typology: 'suburban_front_driveway', aliases: ['127 St NW', '137 Ave NW'] },

  // Northeast / Clareview / Manning
  { name: 'Clareview', fsa: 'T5Y', ward: 'Dene', typology: 'contemporary_townhomes', aliases: ['Clareview LRT', '137 Ave', '50 St'] },
  { name: 'Hollick-Kenyon', fsa: 'T5Y', ward: 'Dene', typology: 'contemporary_townhomes', aliases: ['50 St NW', '160 Ave NW'] },
  { name: 'Brintnell', fsa: 'T5Y', ward: 'Dene', typology: 'contemporary_townhomes', aliases: ['Brintnell Blvd', '50 St NW', 'Manning Drive'] },
  { name: 'Matt Berry', fsa: 'T5Y', ward: 'Dene', typology: 'suburban_front_driveway', aliases: ['66 St NW', '160 Ave NW'] },
  { name: 'McConachie', fsa: 'T5Y', ward: 'Dene', typology: 'contemporary_townhomes', aliases: ['McConachie Way', 'McConachie Blvd', '66 St NW'] },
  { name: 'Cy Becker', fsa: 'T5Y', ward: 'Dene', typology: 'contemporary_townhomes', aliases: ['Cy Becker Blvd', 'Manning Town Centre'] },
  { name: 'Miller', fsa: 'T5Y', ward: 'Dene', typology: 'suburban_front_driveway', aliases: ['144 Ave', '50 St NW', 'Clareview North'] },
  { name: 'Kirkness', fsa: 'T5Y', ward: 'Dene', typology: 'suburban_front_driveway', aliases: ['144 Ave', 'Manning Freeway', 'Kirkness School'] },
  { name: 'Fraser', fsa: 'T5Y', ward: 'Dene', typology: 'suburban_front_driveway', aliases: ['Victoria Trail', '153 Ave', 'River Valley Hermitage'] },
  { name: 'Bannerman', fsa: 'T5Y', ward: 'Dene', typology: 'suburban_front_driveway', aliases: ['Victoria Trail', '144 Ave', 'Bannerman School'] },
  { name: 'Hairsine', fsa: 'T5Y', ward: 'Dene', typology: 'suburban_front_driveway', aliases: ['Victoria Trail', '137 Ave', 'Hairsine School'] },
  { name: 'York', fsa: 'T5A', ward: 'Dene', typology: 'suburban_front_driveway', aliases: ['66 St', '144 Ave', 'Manning'] },
  { name: 'Belvedere', fsa: 'T5A', ward: 'Dene', typology: 'mature_laned', aliases: ['Belvedere LRT', 'Fort Road', '66 St', '129 Ave'] },
  { name: 'Belmont', fsa: 'T5A', ward: 'Dene', typology: 'suburban_front_driveway', aliases: ['Victoria Trail', '137 Ave', 'Belmont School'] },
  { name: 'Canon Ridge', fsa: 'T5A', ward: 'Dene', typology: 'suburban_front_driveway', aliases: ['Hermitage Park', 'Yellowhead East', 'Victoria Trail'] },
  { name: 'Sifton Park', fsa: 'T5A', ward: 'Dene', typology: 'suburban_front_driveway', aliases: ['137 Ave', '40 St', 'Sifton Park School'] },
  { name: 'Homesteader', fsa: 'T5A', ward: 'Dene', typology: 'suburban_front_driveway', aliases: ['Hermitage Road', 'Yellowhead Trail'] },
  { name: 'Overlanders', fsa: 'T5A', ward: 'Dene', typology: 'suburban_front_driveway', aliases: ['Hermitage', 'Victoria Trail', 'Overlanders School'] }
];

// Common Edmonton major arterial streets & thoroughfares and their mapped neighbourhood & postal FSA
export const EDMONTON_ADDRESS_LANDMARKS: Array<{
  pattern: RegExp;
  neighbourhood: string;
  fsa: string;
  ward: string;
  typology: StreetLayoutTypology;
  description: string;
}> = [
  { pattern: /whyte\s*(ave|avenue)?|82\s*(ave|avenue)/i, neighbourhood: 'Strathcona', fsa: 'T6E', ward: 'papastew', typology: 'mature_laned', description: 'Whyte (82) Avenue Corridor' },
  { pattern: /jasper\s*(ave|avenue)?/i, neighbourhood: 'Downtown', fsa: 'T5J', ward: 'O-day\'min', typology: 'infill_skinny', description: 'Jasper Avenue Downtown Core' },
  { pattern: /104\s*st(reet)?\s*(downtown|promenade)?/i, neighbourhood: 'Downtown', fsa: 'T5J', ward: 'O-day\'min', typology: 'infill_skinny', description: '104 Street Promenade' },
  { pattern: /124\s*st(reet)?/i, neighbourhood: 'Oliver (Wîhkwêntôwin)', fsa: 'T5K', ward: 'O-day\'min', typology: 'infill_skinny', description: '124 Street Gallery / Dining District' },
  { pattern: /109\s*st(reet)?/i, neighbourhood: 'Garneau', fsa: 'T6G', ward: 'papastew', typology: 'infill_skinny', description: '109 Street Corridor' },
  { pattern: /118\s*(ave|avenue)/i, neighbourhood: 'Alberta Avenue', fsa: 'T5G', ward: 'Métis', typology: 'mature_laned', description: '118 Avenue Arts on the Ave' },
  { pattern: /127\s*st(reet)?/i, neighbourhood: 'Calder', fsa: 'T5L', ward: 'Anirniq', typology: 'mature_laned', description: '127 Street Northwest' },
  { pattern: /170\s*st(reet)?/i, neighbourhood: 'West Jasper Place', fsa: 'T5P', ward: 'Nakota Isga', typology: 'suburban_front_driveway', description: '170 Street Commercial Corridor' },
  { pattern: /178\s*st(reet)?/i, neighbourhood: 'Callingwood', fsa: 'T5T', ward: 'sipiwiyiniwak', typology: 'suburban_front_driveway', description: '178 Street West' },
  { pattern: /97\s*st(reet)?/i, neighbourhood: 'Chinatown / McCauley', fsa: 'T5H', ward: 'O-day\'min', typology: 'infill_skinny', description: '97 Street Corridor' },
  { pattern: /fort\s*r(oa)?d/i, neighbourhood: 'Belvedere', fsa: 'T5A', ward: 'Dene', typology: 'mature_laned', description: 'Fort Road Revitalization Area' },
  { pattern: /calgary\s*trail/i, neighbourhood: 'Allendale', fsa: 'T6H', ward: 'papastew', typology: 'mature_laned', description: 'Calgary Trail Southbound' },
  { pattern: /gateway\s*blvd/i, neighbourhood: 'Strathcona', fsa: 'T6E', ward: 'papastew', typology: 'mature_laned', description: 'Gateway Boulevard Northbound' },
  { pattern: /terwillegar\s*dr(ive)?/i, neighbourhood: 'Terwillegar Towne', fsa: 'T6R', ward: 'pihêsiwin', typology: 'suburban_front_driveway', description: 'Terwillegar Drive Expressway' },
  { pattern: /whitemud\s*(dr|drive)?/i, neighbourhood: 'Brookside', fsa: 'T6H', ward: 'pihêsiwin', typology: 'mature_laned', description: 'Whitemud Drive Corridor' },
  { pattern: /ellerslie\s*r(oa)?d/i, neighbourhood: 'Ellerslie', fsa: 'T6X', ward: 'Karhiio', typology: 'suburban_front_driveway', description: 'Ellerslie Road South' },
  { pattern: /rabbit\s*hill\s*r(oa)?d/i, neighbourhood: 'Riverbend', fsa: 'T6R', ward: 'pihêsiwin', typology: 'suburban_front_driveway', description: 'Rabbit Hill Road Southwest' },
  { pattern: /james\s*mowatt/i, neighbourhood: 'Rutherford', fsa: 'T6W', ward: 'Ipiihkoohkanipiaohtsi', typology: 'contemporary_townhomes', description: 'James Mowatt Trail' },
  { pattern: /stony\s*plain\s*r(oa)?d/i, neighbourhood: 'Grovenor', fsa: 'T5N', ward: 'Nakota Isga', typology: 'mature_laned', description: 'Stony Plain Road' },
  { pattern: /victoria\s*trail/i, neighbourhood: 'Bannerman', fsa: 'T5Y', ward: 'Dene', typology: 'suburban_front_driveway', description: 'Victoria Trail Northeast' },
  { pattern: /manning\s*(dr|drive|fwy|freeway)?/i, neighbourhood: 'Clareview', fsa: 'T5Y', ward: 'Dene', typology: 'contemporary_townhomes', description: 'Manning Drive Corridor' }
];

/**
 * Levenshtein Distance for predictive spelling error tolerance
 */
export function levenshteinDistance(s1: string, s2: string): number {
  const a = s1.toLowerCase();
  const b = s2.toLowerCase();
  const costs: number[] = [];

  for (let i = 0; i <= a.length; i++) {
    let lastValue = i;
    for (let j = 0; j <= b.length; j++) {
      if (i === 0) {
        costs[j] = j;
      } else if (j > 0) {
        let newValue = costs[j - 1];
        if (a.charAt(i - 1) !== b.charAt(j - 1)) {
          newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
        }
        costs[j - 1] = lastValue;
        lastValue = newValue;
      }
    }
    if (i > 0) costs[b.length] = lastValue;
  }
  return costs[b.length];
}

/**
 * Main Predictive Spelling and Address Resolver:
 * Accepts a Postal Code (exact 6-char or 3-char FSA) OR an Address/Neighbourhood query.
 * Matches with predictive spelling and returns neighbourhood details and the first 3 characters of their postal code (FSA).
 */
export function resolveLocationOrPredictiveAddress(query: string): PredictiveMatchResult | null {
  if (!query || !query.trim() || query === 'OPT_OUT') return null;

  const raw = query.trim();
  const normalized = raw.toUpperCase().replace(/[\s-]/g, '');

  // 1A. Exact 6-Character Postal Code Match from official City dataset
  if (normalized.length === 6 && (EDMONTON_EXACT_POSTAL_CODES[normalized] || EDMONTON_MULTI_NEIGHBOURHOOD_POSTAL_CODES[normalized])) {
    const multiMatches = EDMONTON_MULTI_NEIGHBOURHOOD_POSTAL_CODES[normalized];
    const exact = EDMONTON_EXACT_POSTAL_CODES[normalized] || (multiMatches ? {
      name: multiMatches[0].name,
      ward: multiMatches[0].ward,
      fsa: normalized.slice(0, 3)
    } : null);

    if (exact) {
      const nMeta = ALL_EDMONTON_NEIGHBOURHOODS.find(n => n.name.toLowerCase() === exact.name.toLowerCase());
      const typology = nMeta?.typology || EDMONTON_FSA_DATA[exact.fsa]?.typology || 'mature_laned';
      const classification = multiMatches?.[0]?.classification || getPosseClassification(exact.name, typology);
      const displayCode = `${normalized.slice(0, 3)} ${normalized.slice(3)}`;

      return {
        neighbourhood: exact.name,
        postalFSA: exact.fsa,
        ward: exact.ward,
        classification,
        typology,
        confidence: 1.0,
        matchedBy: 'exact_code',
        displayCode,
        isFsaOnly: false,
        multipleNeighbourhoods: multiMatches,
        highlightText: `${exact.name} (${displayCode}) • Ward ${exact.ward} • ${classification}`
      };
    }
  }

  // 1B. Direct Postal Code FSA (e.g. T5A, T6E, T5K)
  const isExactFsa = /^[A-Z]\d[A-Z]$/.test(normalized);
  if (isExactFsa) {
    const fsaInfo = EDMONTON_FSA_DATA[normalized];
    if (fsaInfo) {
      const classification = fsaInfo.typology === 'contemporary_townhomes' ? 'Developing' : 'Redeveloping';
      return {
        neighbourhood: fsaInfo.name,
        postalFSA: normalized,
        ward: fsaInfo.ward,
        classification,
        typology: fsaInfo.typology,
        confidence: 1.0,
        matchedBy: 'fsa',
        displayCode: normalized,
        isFsaOnly: true,
        fsaNeighbourhoodCount: fsaInfo.neighbourhoods.length,
        highlightText: `FSA ${normalized} (${fsaInfo.name}) • Ward ${fsaInfo.ward} • ${classification}`
      };
    }
  }

  // 1C. Other Postal Prefix or 6-char fallback
  const isPostalPattern = /^T[0-9][A-Z][0-9]?[A-Z]?[0-9]?$/i.test(normalized) || (normalized.length <= 3 && /^T[0-9]?[A-Z]?$/i.test(normalized));
  if (isPostalPattern && normalized.length >= 3) {
    const fsaCandidate = normalized.slice(0, 3).toUpperCase();
    const fsaInfo = EDMONTON_FSA_DATA[fsaCandidate];

    if (fsaInfo) {
      const primaryNeighbourhood = fsaInfo.neighbourhoods[0];
      const classification = getPosseClassification(primaryNeighbourhood, fsaInfo.typology);
      return {
        neighbourhood: primaryNeighbourhood,
        postalFSA: fsaCandidate,
        ward: fsaInfo.ward,
        classification,
        typology: fsaInfo.typology,
        confidence: normalized.length === 6 ? 0.95 : 0.9,
        matchedBy: normalized.length === 6 ? 'exact_code' : 'fsa',
        displayCode: normalized.length === 6 ? `${normalized.slice(0, 3)} ${normalized.slice(3)}` : fsaCandidate,
        isFsaOnly: normalized.length === 3,
        highlightText: `${primaryNeighbourhood} (${fsaCandidate}) • Ward ${fsaInfo.ward}`
      };
    }
  }

  // 2. Address Street Pattern Matching (e.g. user typed "Whyte Ave", "104 St", "Jasper Ave", "Ellerslie Rd")
  for (const landmark of EDMONTON_ADDRESS_LANDMARKS) {
    if (landmark.pattern.test(raw)) {
      const classification = getPosseClassification(landmark.neighbourhood, landmark.typology);
      return {
        neighbourhood: landmark.neighbourhood,
        postalFSA: landmark.fsa,
        ward: landmark.ward,
        classification,
        typology: landmark.typology,
        confidence: 0.95,
        matchedBy: 'address_street',
        highlightText: `${landmark.neighbourhood} (${landmark.fsa}) • ${landmark.description}`
      };
    }
  }

  // 3. Exact and Substring Match against Edmonton Neighbourhoods & Aliases
  const queryLower = raw.toLowerCase();

  // 3A. Exact Name Match
  const exactName = ALL_EDMONTON_NEIGHBOURHOODS.find(n => n.name.toLowerCase() === queryLower);
  if (exactName) {
    const classification = getPosseClassification(exactName.name, exactName.typology);
    return {
      neighbourhood: exactName.name,
      postalFSA: exactName.fsa,
      ward: exactName.ward,
      classification,
      typology: exactName.typology,
      confidence: 1.0,
      matchedBy: 'exact_neighbourhood',
      highlightText: `${exactName.name} (${exactName.fsa}) • Ward ${exactName.ward} • ${classification}`
    };
  }

  // 3B. Exact Alias Match (e.g. "Oliver", "Wihkwentowin", "Millwoods")
  const aliasMatch = ALL_EDMONTON_NEIGHBOURHOODS.find(n =>
    n.aliases.some(a => a.toLowerCase() === queryLower)
  );
  if (aliasMatch) {
    const classification = getPosseClassification(aliasMatch.name, aliasMatch.typology);
    return {
      neighbourhood: aliasMatch.name,
      postalFSA: aliasMatch.fsa,
      ward: aliasMatch.ward,
      classification,
      typology: aliasMatch.typology,
      confidence: 0.95,
      matchedBy: 'exact_neighbourhood',
      highlightText: `${aliasMatch.name} (${aliasMatch.fsa}) • Ward ${aliasMatch.ward}`
    };
  }

  // 3C. Substring startsWith / includes Match
  const startsWithMatch = ALL_EDMONTON_NEIGHBOURHOODS.find(n =>
    n.name.toLowerCase().startsWith(queryLower) ||
    n.aliases.some(a => a.toLowerCase().startsWith(queryLower))
  );
  if (startsWithMatch && queryLower.length >= 3) {
    const classification = getPosseClassification(startsWithMatch.name, startsWithMatch.typology);
    return {
      neighbourhood: startsWithMatch.name,
      postalFSA: startsWithMatch.fsa,
      ward: startsWithMatch.ward,
      classification,
      typology: startsWithMatch.typology,
      confidence: 0.88,
      matchedBy: 'predictive_spelling',
      highlightText: `${startsWithMatch.name} (${startsWithMatch.fsa}) • Ward ${startsWithMatch.ward}`
    };
  }

  // 4. Predictive Spelling (Fuzzy Levenshtein Distance for typos: e.g. "Garneua", "Starthcona", "Terwilleger")
  if (queryLower.length >= 4) {
    let closestMatch: NeighbourhoodMeta | null = null;
    let minDistance = 999;

    for (const n of ALL_EDMONTON_NEIGHBOURHOODS) {
      // Test neighbourhood name
      const distName = levenshteinDistance(queryLower, n.name);
      if (distName < minDistance) {
        minDistance = distName;
        closestMatch = n;
      }

      // Test aliases
      for (const alias of n.aliases) {
        const distAlias = levenshteinDistance(queryLower, alias);
        if (distAlias < minDistance) {
          minDistance = distAlias;
          closestMatch = n;
        }
      }
    }

    // Accept fuzzy match if distance is within tolerance (up to 2 character typos)
    const threshold = queryLower.length <= 5 ? 1 : 2;
    if (closestMatch && minDistance <= threshold) {
      const classification = getPosseClassification(closestMatch.name, closestMatch.typology);
      return {
        neighbourhood: closestMatch.name,
        postalFSA: closestMatch.fsa,
        ward: closestMatch.ward,
        classification,
        typology: closestMatch.typology,
        confidence: 0.82 - (minDistance * 0.1),
        matchedBy: 'predictive_spelling',
        highlightText: `Did you mean ${closestMatch.name}? (${closestMatch.fsa}) • Ward ${closestMatch.ward}`
      };
    }
  }

  return null;
}

export interface PostalCodeHint {
  type: 'postal';
  code: string;
  rawCode: string;
  neighbourhood: string;
  ward: string;
  fsa: string;
}

/**
 * Searches exact postal codes in Edmonton matching a partial postal code query.
 */
export function searchPostalCodeHints(query: string, limit = 8): PostalCodeHint[] {
  if (!query) return [];
  const cleanQ = query.toUpperCase().replace(/[\s-]/g, '');
  if (cleanQ.length < 3) return [];

  const results: PostalCodeHint[] = [];
  for (const [rawCode, data] of Object.entries(EDMONTON_EXACT_POSTAL_CODES)) {
    if (rawCode.startsWith(cleanQ)) {
      const formatted = `${rawCode.slice(0, 3)} ${rawCode.slice(3)}`;
      results.push({
        type: 'postal',
        code: formatted,
        rawCode,
        neighbourhood: data.name,
        ward: data.ward,
        fsa: data.fsa
      });
      if (results.length >= limit) break;
    }
  }
  return results;
}

/**
 * Determines whether the postal code or neighbourhood hint dropdown should be shown.
 * Rule:
 * - If the first letter is not a 't': only show after the first three characters (e.g. at 4 or more characters).
 * - For postal codes that start with a 't': only show after the first four characters (e.g. at 5 or more characters, or after 4 postal characters).
 */
export function shouldShowLocationDropdown(query: string): boolean {
  if (!query) return false;
  const trimmed = query.trim();
  if (!trimmed) return false;

  const firstChar = trimmed.charAt(0).toLowerCase();
  const clean = trimmed.toUpperCase().replace(/[\s-]/g, '');

  // Is this a postal code starting with 't'?
  // Edmonton postal codes start with 'T' followed by a digit (e.g. T5..., T6...)
  // or is a single 'T' representing the beginning of a postal code.
  const isPostalCodeStartingWithT = firstChar === 't' && (
    clean.length === 1 ||
    /^[A-Z]\d/.test(clean) ||
    /^[A-Z]\d[A-Z]/.test(clean)
  );

  if (isPostalCodeStartingWithT) {
    // Only show after the first four characters for postal codes that start with a t:
    // Suppresses 1 char ('T'), 2 chars ('T5'), 3 chars ('T5A' FSA), 4 chars ('T5A ' or 'T5A0').
    // Only shows after the first four characters (i.e. trimmed.length > 4 or clean.length > 4):
    return trimmed.length > 4 || clean.length > 4;
  }

  // If the first letter is not a 't' (e.g., neighbourhood text search like "Downtown", "Oliver", "Glenora"):
  // Only show after the first three characters (i.e. trimmed.length > 3):
  return trimmed.length > 3;
}
