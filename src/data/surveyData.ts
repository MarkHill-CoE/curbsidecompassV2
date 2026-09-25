import { SurveyQuestion, PersonaResult, SimulationConfig } from '../types';

export const INITIAL_SIM_CONFIG: SimulationConfig = {
  householdCarsPerHome: 2.0,
  visitorPassesPerHome: 0.3714, // Calibrated to 60% initial curbside occupancy (6.6 cars demand / 11 legal curbside stalls)
  drivewayCapacity: 2,
  splitInfillLots: 2,
  deliveriesPerHomePerWeek: 1.0,
  enforcementLevel: 'standard',
  cruisingTrafficLevel: 'moderate',
  curbsideFeeModel: 'free'
};

export const SURVEY_QUESTIONS: SurveyQuestion[] = [
  {
    id: 'q1',
    number: 1,
    category: 'residential',
    text: 'Who should pay for residential parking programs?',
    options: [
      {
        id: 'q1_a',
        label: 'Residents with vehicles in residential parking program areas pay permit fees that cover all program costs.',
        x: 4,
        y: 0,
        hint: 'Residents with vehicles in the program area pay permit fees, which fully cover program costs and reduce street parking by encouraging off-street driveway parking.',
        simEffects: {
          drivewayCapacity: 2,
          householdCarsPerHome: 2.0 // total 12 cars, 12 fit in driveway, 0 on street
        }
      },
      {
        id: 'q1_b',
        label: 'Tax-payers cover program costs through property tax revenues.',
        x: -4,
        y: 0,
        hint: 'Since no fee is charged, more vehicles park on the street.',
        simEffects: {
          drivewayCapacity: 1, // only 6 fit in driveway
          householdCarsPerHome: 2.6 // total ~16 cars. 6 in driveway, 10 on street.
        }
      }
    ]
  },
  {
    id: 'q2',
    number: 2,
    category: 'visitors',
    text: 'Should your neighbourhood limit the number of on-street parking permits residents can hold?',
    options: [
      {
        id: 'q2_a',
        label: 'Yes.',
        x: 0,
        y: -3,
        hint: 'Limiting on-street parking permits reduces the number of vehicles parked on the street and encourages off-street or driveway parking.',
        simEffects: {
          drivewayCapacity: 2,
          householdCarsPerHome: 1.8
        }
      },
      {
        id: 'q2_b',
        label: 'No.',
        x: 0,
        y: 3,
        hint: 'Since no fee is charged, more vehicles park on the street.',
        simEffects: {
          drivewayCapacity: 1,
          householdCarsPerHome: 2.5
        }
      }
    ]
  },
  {
    id: 'q3',
    number: 3,
    category: 'commercial',
    text: 'What restrictions should be placed on commercial and trade vehicles in residential areas?',
    options: [
      {
        id: 'q3_a',
        label: 'Specialized paid permits are required to access work/loading zones.',
        x: 2,
        y: -2,
        hint: 'Since a fee is charged, fewer vehicles park on the street and more park in driveways.',
        simEffects: {
          deliveriesPerHomePerWeek: 2,
          enforcementLevel: 'strict'
        }
      },
      {
        id: 'q3_b',
        label: 'No restrictions - commercial and trade vehicles have access and do not require paid permits.',
        x: -2,
        y: 2,
        hint: 'Since parking is on a first-come, first-served basis, available spots fill up quickly and remaining vehicles park on the street.',
        simEffects: {
          deliveriesPerHomePerWeek: 4,
          enforcementLevel: 'lenient'
        }
      }
    ]
  },
  {
    id: 'q4',
    number: 4,
    category: 'visitors',
    text: 'How would you manage visitor parking in your neighbourhood?',
    options: [
      {
        id: 'q4_a',
        label: 'Visitors digitally register their vehicles, with enforcement conducted regularly.',
        x: 3,
        y: -3,
        hint: 'Visitor registration and regular enforcement keep curb demand predictable.',
        simEffects: {
          visitorPassesPerHome: 0.8,
          enforcementLevel: 'strict'
        }
      },
      {
        id: 'q4_b',
        label: 'Visitor parking is on a first-come, first-served basis.',
        x: -3,
        y: 3,
        hint: 'Since no permit or registration is required, visitor vehicles park freely on the street.',
        simEffects: {
          visitorPassesPerHome: 2.2,
          enforcementLevel: 'lenient'
        }
      }
    ]
  },
  {
    id: 'q5',
    number: 5,
    category: 'finance',
    text: 'Who should pay for residential parking enforcement?',
    options: [
      {
        id: 'q5_a',
        label: 'Residents and visitors — through permit fees, guest pass sales and violation fines.',
        x: 4,
        y: 0,
        hint: 'Since user fees and violation fines cover enforcement, curb turnover is prioritized.',
        simEffects: {
          curbsideFeeModel: 'permit',
          householdCarsPerHome: 1.8,
          drivewayCapacity: 2
        }
      },
      {
        id: 'q5_b',
        label: 'Edmontonians — through property taxes.',
        x: -4,
        y: 0,
        hint: 'Since enforcement is funded by general city taxes, curb usage is open to all residents.',
        simEffects: {
          curbsideFeeModel: 'free',
          householdCarsPerHome: 2.8,
          drivewayCapacity: 1
        }
      }
    ]
  },
  {
    id: 'q6',
    number: 6,
    category: 'enforcement',
    text: 'How would you manage parking near major traffic generators, like educational institutions and hospitals?',
    options: [
      {
        id: 'q6_a',
        label: 'Paid parking with time limits and frequent enforcement.',
        x: 3,
        y: -3,
        hint: 'Since a fee is charged, fewer vehicles park on the street and more park in driveways.',
        simEffects: {
          enforcementLevel: 'strict',
          cruisingTrafficLevel: 'low',
          visitorPassesPerHome: 0.2
        }
      },
      {
        id: 'q6_b',
        label: 'Maintain free, unenforced parking for visitors.',
        x: -3,
        y: 3,
        hint: 'Since no fee is charged, more vehicles park on the street.',
        simEffects: {
          enforcementLevel: 'lenient',
          cruisingTrafficLevel: 'high',
          visitorPassesPerHome: 1.2
        }
      }
    ]
  },
  {
    id: 'q7',
    number: 7,
    category: 'residential',
    text: 'How would you manage accessible parking zones during events?',
    options: [
      {
        id: 'q7_a',
        label: 'Conduct strict eligibility and digital pass checks, plus regular enforcement.',
        x: 2,
        y: -2,
        hint: 'Since no fee is charged, more vehicles park on the street.',
        simEffects: {
          enforcementLevel: 'strict',
          householdCarsPerHome: 2.0
        }
      },
      {
        id: 'q7_b',
        label: 'No active enforcement, relying on public courtesy to obey zone signage.',
        x: -2,
        y: 2,
        hint: 'Since no fee is charged, more vehicles park on the street.',
        simEffects: {
          enforcementLevel: 'lenient',
          householdCarsPerHome: 2.5
        }
      }
    ]
  },
  {
    id: 'q8',
    number: 8,
    category: 'residential',
    text: 'How should parking rules respond to the individual needs of each neighbourhood?',
    options: [
      {
        id: 'q8_a',
        label: 'Apply proactive, city-wide standardized rules across all mature and developing neighbourhoods.',
        x: 0,
        y: -4,
        hint: 'City-wide standards ensure consistent parking management across all Edmonton communities.',
        simEffects: {
          drivewayCapacity: 2,
          householdCarsPerHome: 2.0
        }
      },
      {
        id: 'q8_b',
        label: 'Allow neighbourhoods to opt into local solutions on a block-by-block basis.',
        x: 0,
        y: 4,
        hint: 'Neighbourhood-by-neighbourhood opt-in provides local flexibility with fewer blanket rules.',
        simEffects: {
          drivewayCapacity: 1,
          householdCarsPerHome: 2.8
        }
      }
    ]
  },
  {
    id: 'q9',
    number: 9,
    category: 'location',
    type: 'text',
    text: 'Please enter your full postal code.',
    placeholder: 'e.g. T5J 2R7',
    helperText: 'Please enter a 6 or 7 character alphanumeric postal code (e.g., T5J 2R7 or T5J2R7).',
    options: []
  }
];

export interface ComputedSimulationMetrics {
  activeHouseholdCars: number;
  activeVisitorCars: number;
  totalDwellings: number;
  totalWeeklyDeliveries: number;
  circlingCarCount: number;
  curbsideDemandCount: number;
  curbsideStallsCapacity: number;
  curbsidePct: number;
  occupiedGaragesCount: number;
  simConfig: SimulationConfig;
}

export function calculateSimulationMetricsFromAnswers(
  answers: Record<string, string>
): ComputedSimulationMetrics {
  const totalDwellings = 12;
  const curbsideStallsCapacity = 16;

  // Baseline calibration: 10 cars out of 16 legal stalls (62.5% balanced occupancy)
  let curbsideDemand = 10.0;
  let occupiedGarages = 10;
  let deliveriesPerWeek = 1.0;
  let visitorDemand = 4;
  let householdCars = 24;
  let drivewayCap = 2;
  let feeModel: 'free' | 'permit' = 'free';
  let enforcement: 'strict' | 'standard' | 'lenient' = 'standard';
  let cruisingLevel: 'low' | 'moderate' | 'high' = 'moderate';

  // Q1: Who should pay for residential parking programs?
  if (answers['q1'] === 'q1_a') {
    // Permit fees paid by vehicle owners: incentivizes off-street garage use
    curbsideDemand -= 1.5;
    occupiedGarages = Math.min(12, occupiedGarages + 1);
    feeModel = 'permit';
  } else if (answers['q1'] === 'q1_b') {
    // Taxpayer funded: free on-street storage encourages parking on curb
    curbsideDemand += 1.5;
    occupiedGarages = Math.max(8, occupiedGarages - 1);
    feeModel = 'free';
  }

  // Q2: Limit on-street permits per household?
  if (answers['q2'] === 'q2_a') {
    // Limit permits: forces extra household vehicles off the street
    curbsideDemand -= 2.0;
    occupiedGarages = Math.min(12, occupiedGarages + 1);
  } else if (answers['q2'] === 'q2_b') {
    // Unlimited permits: multi-car homes park multiple cars along the curb
    curbsideDemand += 2.0;
    householdCars += 4;
  }

  // Q3: Restrictions on commercial & trade vehicles?
  if (answers['q3'] === 'q3_a') {
    // Paid permits/loading zones: trades park off-street or in designated loading zones
    curbsideDemand -= 1.5;
    deliveriesPerWeek = 1.0;
  } else if (answers['q3'] === 'q3_b') {
    // No restrictions: trades, contractors, and delivery vans take up curb stalls
    curbsideDemand += 2.0;
    deliveriesPerWeek = 3.5;
  }

  // Q4: Visitor parking management?
  if (answers['q4'] === 'q4_a') {
    // Digital registration & enforcement: visitor parking stays controlled
    curbsideDemand -= 1.5;
    visitorDemand = 3;
    enforcement = 'strict';
  } else if (answers['q4'] === 'q4_b') {
    // First-come, first-served free: unmanaged visitor parking floods the street
    curbsideDemand += 2.5;
    visitorDemand = 8;
    enforcement = 'lenient';
  }

  // Q5: Who pays for enforcement?
  if (answers['q5'] === 'q5_a') {
    // User fees & violation fines: active patrols, high turnover, overstays penalized
    curbsideDemand -= 1.5;
    enforcement = 'strict';
  } else if (answers['q5'] === 'q5_b') {
    // Property taxes: infrequent complaint-based enforcement, cars linger on curb
    curbsideDemand += 2.0;
    enforcement = 'lenient';
  }

  // Q6: Near major traffic generators (hospitals/universities)?
  if (answers['q6'] === 'q6_a') {
    // Paid parking & time limits: commuter overflow prevented
    curbsideDemand -= 2.5;
    cruisingLevel = 'low';
  } else if (answers['q6'] === 'q6_b') {
    // Free & unenforced: hospital/university commuters flood neighbourhood street
    curbsideDemand += 3.5;
    cruisingLevel = 'high';
  }

  // Q7: Accessible parking zones during events?
  if (answers['q7'] === 'q7_a') {
    // Strict eligibility checks & enforcement: stalls protected, orderly parking
    curbsideDemand -= 1.0;
  } else if (answers['q7'] === 'q7_b') {
    // No enforcement: event-goers encroach on stalls and driveways
    curbsideDemand += 1.5;
  }

  // Q8: City-wide standardized rules vs block-by-block opt-in?
  if (answers['q8'] === 'q8_a') {
    // Standardized rules: city-wide consistency prevents spillover from adjacent streets
    curbsideDemand -= 1.0;
  } else if (answers['q8'] === 'q8_b') {
    // Block-by-block opt-in: spillover from regulated blocks onto this block
    curbsideDemand += 2.0;
  }

  // Clamp demand between 2 and 26 cars
  const roundedDemand = Math.max(2, Math.min(26, Math.round(curbsideDemand)));
  const curbsidePct = Math.round((roundedDemand / curbsideStallsCapacity) * 100);

  // Circling vehicles: when demand approaches or exceeds capacity (16 stalls)
  let circlingCarCount = 0;
  if (roundedDemand >= 20) {
    circlingCarCount = 5;
  } else if (roundedDemand >= 17) {
    circlingCarCount = 4;
  } else if (roundedDemand >= 15) {
    circlingCarCount = 2;
  } else if (roundedDemand >= 13) {
    circlingCarCount = 1;
  }

  const simConfig: SimulationConfig = {
    householdCarsPerHome: householdCars / totalDwellings,
    visitorPassesPerHome: visitorDemand / totalDwellings,
    drivewayCapacity: drivewayCap,
    splitInfillLots: 2,
    deliveriesPerHomePerWeek: deliveriesPerWeek,
    enforcementLevel: enforcement,
    cruisingTrafficLevel: cruisingLevel,
    curbsideFeeModel: feeModel
  };

  return {
    activeHouseholdCars: householdCars,
    activeVisitorCars: visitorDemand,
    totalDwellings,
    totalWeeklyDeliveries: Math.round(deliveriesPerWeek * totalDwellings),
    circlingCarCount,
    curbsideDemandCount: roundedDemand,
    curbsideStallsCapacity,
    curbsidePct,
    occupiedGaragesCount: occupiedGarages,
    simConfig
  };
}

export function validatePostalCode(val: string): { isValid: boolean; message?: string } {
  if (val === 'OPT_OUT') return { isValid: true };
  if (!val || !val.trim()) {
    return { isValid: false, message: 'Please enter your full postal code to continue.' };
  }
  const trimmed = val.trim();
  const alphaNum = trimmed.replace(/[\s-]/g, '');

  if (!/^[a-zA-Z0-9]+$/.test(alphaNum)) {
    return { isValid: false, message: 'Postal code must contain only letters and numbers.' };
  }

  if (alphaNum.length < 6 || alphaNum.length > 7) {
    return {
      isValid: false,
      message: `Postal code must be 6 or 7 alphanumeric characters (currently ${alphaNum.length}).`
    };
  }

  return { isValid: true };
}

export const PERSONA_PROFILES: Record<string, PersonaResult> = {
  // Row 1: Strict / Most Rules (Y < -9)
  block_resident: {
    id: 'block-resident', quadrant: 'Q2', xRange: 'taxpayer', yRange: 'restrictive',
    title: 'Block Resident', subtitle: 'Strict Rules • General Taxation',
    description: 'You like strict parking rules to keep order. You prefer that everyone shares the costs through taxes, rather than just car owners.',
    keyPriorities: ['Strict enforcement', 'General tax funding'],
    edmontonPolicyFit: 'Aligns with highly regulated mature neighbourhoods.',
    outcome: 'A strictly regulated residential permit zone where on-street parking is closely monitored, permits are capped per household, and municipal program costs are funded through general property taxes to preserve neighbourhood curb space.',
    badgeColor: '#005087'
  },
  tidy_resident: {
    id: 'tidy-resident', quadrant: 'Q2', xRange: 'taxpayer', yRange: 'restrictive',
    title: 'Tidy Resident', subtitle: 'Some Rules • General Taxation',
    description: 'You like some parking rules to keep streets neat. You feel everyone should share the costs through taxes, not just drivers.',
    keyPriorities: ['Clear guidelines', 'Shared costs'],
    edmontonPolicyFit: 'Aligns with standard residential parking guidelines.',
    outcome: 'Standard residential parking guidelines funded through municipal taxes with basic time restrictions during peak hours to keep streets orderly while sharing public costs community-wide.',
    badgeColor: '#005087'
  },
  picky_parker: {
    id: 'picky-parker', quadrant: 'Q1', xRange: 'user', yRange: 'restrictive',
    title: 'Picky Parker', subtitle: 'Clear Rules • User-Fee',
    description: 'You like clear parking rules. You prefer that car owners pay for parking, rather than everyone sharing the costs through taxes.',
    keyPriorities: ['Clear restrictions', 'User-pay model'],
    edmontonPolicyFit: 'Aligns with targeted permit zones.',
    outcome: 'A targeted, user-funded permit system where on-street parking requires direct vehicle permits and user fees, ensuring local residents and visitors who use the curb cover the program\'s operating costs.',
    badgeColor: '#0081BC'
  },
  safety_parker: {
    id: 'safety-parker', quadrant: 'Q1', xRange: 'user', yRange: 'restrictive',
    title: 'Safety Parker', subtitle: 'Strict Rules • Strong User-Fee',
    description: 'You like strict parking rules to keep streets safe. You strongly believe car owners should pay for their own parking, not everyone.',
    keyPriorities: ['Strict safety enforcement', 'Direct user fees'],
    edmontonPolicyFit: 'Aligns with high-traffic pedestrian safety corridors.',
    outcome: 'Strictly enforced high-demand curbside corridors with rigorous user-fee permits, dedicated loading/safety zones, and active enforcement funded entirely by user fees and violation penalties.',
    badgeColor: '#0081BC'
  },

  // Row 2: Clear / Fair Balance (-9 <= Y < 0)
  rule_resident: {
    id: 'rule-resident', quadrant: 'Q2', xRange: 'taxpayer', yRange: 'restrictive',
    title: 'Rule Resident', subtitle: 'Clear Rules • Shared Costs',
    description: 'You like clear parking rules. You think everyone should share the costs through taxes, not just car owners.',
    keyPriorities: ['Defined zones', 'Tax-supported maintenance'],
    edmontonPolicyFit: 'Aligns with protected residential areas.',
    outcome: 'Clearly defined residential parking zones with defined time limits and permit oversight, supported by municipal infrastructure maintenance to protect neighbourhood access.',
    badgeColor: '#005087'
  },
  balanced_resident: {
    id: 'balanced-resident', quadrant: 'Q2', xRange: 'taxpayer', yRange: 'restrictive',
    title: 'Balanced Resident', subtitle: 'Fair Balance • Shared Costs',
    description: 'You like a fair balance of parking rules. You slightly prefer that everyone shares the costs through taxes, instead of just drivers.',
    keyPriorities: ['Balanced access', 'Community funding'],
    edmontonPolicyFit: 'Aligns with flexible neighbourhood parking.',
    outcome: 'A balanced, flexible neighbourhood parking framework where standard rules prevent congestion, funded through broad community taxation to ensure equitable public access.',
    badgeColor: '#005087'
  },
  sensible_parker: {
    id: 'sensible-parker', quadrant: 'Q1', xRange: 'user', yRange: 'restrictive',
    title: 'Sensible Parker', subtitle: 'Fair Balance • User-Fee',
    description: 'You like a fair balance of parking rules. You prefer that drivers pay for their own parking, instead of everyone sharing the costs.',
    keyPriorities: ['Balanced enforcement', 'Driver-paid infrastructure'],
    edmontonPolicyFit: 'Aligns with hybrid paid-parking zones.',
    outcome: 'A hybrid user-pay system featuring paid hourly or digital daily visitor passes, ensuring that curbside maintenance and administrative costs are directly recovered from drivers.',
    badgeColor: '#0081BC'
  },
  fair_parker: {
    id: 'fair-parker', quadrant: 'Q1', xRange: 'user', yRange: 'restrictive',
    title: 'Fair Parker', subtitle: 'Fair Balance • Strong User-Fee',
    description: 'You like a fair balance of parking rules. You strongly feel that drivers should pay for parking, instead of everyone.',
    keyPriorities: ['Fair access', 'Full cost-recovery from drivers'],
    edmontonPolicyFit: 'Aligns with self-sustaining parking districts.',
    outcome: 'Self-sustaining parking districts where variable curb pricing and user permit fees balance stall turnover and fund local neighbourhood street amenities without general tax subsidies.',
    badgeColor: '#0081BC'
  },

  // Row 3: Fewer / Few Rules (0 <= Y <= 4)
  easy_neighbor: {
    id: 'easy-neighbor', quadrant: 'Q3', xRange: 'taxpayer', yRange: 'open',
    title: 'Easy Neighbour', subtitle: 'Fewer Rules • Shared Costs',
    description: 'You like fewer parking rules to make things easy. You prefer that everyone shares the costs through taxes, rather than just drivers.',
    keyPriorities: ['Easy access', 'Taxpayer funding'],
    edmontonPolicyFit: 'Aligns with open suburban parking.',
    outcome: 'Open suburban curbside access with minimal restrictions, where street space is freely available on a first-come, first-served basis, funded through general city-wide taxation.',
    badgeColor: '#009A44'
  },
  chill_neighbour: {
    id: 'chill-neighbour', quadrant: 'Q3', xRange: 'taxpayer', yRange: 'open',
    title: 'Chill Neighbour', subtitle: 'Few Rules • Shared Costs',
    description: 'You like having few parking rules. You believe everyone should share the costs through taxes, not just car owners.',
    keyPriorities: ['Minimal restrictions', 'Publicly funded'],
    edmontonPolicyFit: 'Aligns with low-density residential guidelines.',
    outcome: 'Low-density residential streets with relaxed parking regulations, relying on informal neighbourhood courtesy and broad municipal funding rather than active enforcement.',
    badgeColor: '#009A44'
  },
  simple_driver: {
    id: 'simple-driver', quadrant: 'Q4', xRange: 'user', yRange: 'open',
    title: 'Simple Driver', subtitle: 'Fewer Rules • User-Fee',
    description: 'You like fewer parking rules to keep life simple. You slightly prefer that car owners pay for parking, rather than everyone sharing the costs.',
    keyPriorities: ['Simple access', 'Light user fees'],
    edmontonPolicyFit: 'Aligns with simplified flat-rate zones.',
    outcome: 'A simplified, open-access parking framework with modest flat-rate user fees during high-demand periods, keeping rules transparent and hassle-free for drivers.',
    badgeColor: '#FFC72C'
  },
  casual_cruiser: {
    id: 'casual-cruiser', quadrant: 'Q4', xRange: 'user', yRange: 'open',
    title: 'Casual Cruiser', subtitle: 'Very Few Rules • Strong User-Fee',
    description: 'You like very few parking rules on our streets. You strongly believe car owners must pay for their own parking, not everyone.',
    keyPriorities: ['Unrestricted access', 'Direct user payments'],
    edmontonPolicyFit: 'Aligns with unregulated paid public lots.',
    outcome: 'Largely unregulated public curbside parking supported by targeted metered zones only in commercial areas, allowing drivers full mobility with pay-per-use convenience.',
    badgeColor: '#FFC72C'
  },

  // Row 4: Almost No / Very Few Rules (Y > 4)
  happy_neighbor: {
    id: 'happy-neighbor', quadrant: 'Q3', xRange: 'taxpayer', yRange: 'open',
    title: 'Happy Neighbour', subtitle: 'Almost No Rules • Strong Taxpayer',
    description: 'You want almost no parking rules. You strongly believe everyone should share the costs through taxes, not just drivers.',
    keyPriorities: ['Complete freedom', 'Fully public funding'],
    edmontonPolicyFit: 'Aligns with historically unregulated rural/suburban edges.',
    outcome: 'Maximum parking freedom with no permit restrictions or time limits, treating the curbside as a universal public amenity fully supported by the city\'s general operating budget.',
    badgeColor: '#009A44'
  },
  zen_neighbor: {
    id: 'zen-neighbor', quadrant: 'Q3', xRange: 'taxpayer', yRange: 'open',
    title: 'Zen Neighbour', subtitle: 'Very Few Rules • Shared Costs',
    description: 'You want very few parking rules for more freedom. You slightly prefer that everyone shares the costs through taxes, not just car owners.',
    keyPriorities: ['High freedom', 'Shared municipal cost'],
    edmontonPolicyFit: 'Aligns with unenforced open streets.',
    outcome: 'Unrestricted open residential streets with no time limits or permit requirements, fostering high freedom and community neighborliness funded through municipal services.',
    badgeColor: '#009A44'
  },
  happy_driver: {
    id: 'happy-driver', quadrant: 'Q4', xRange: 'user', yRange: 'open',
    title: 'Happy Driver', subtitle: 'Almost No Rules • User-Fee',
    description: 'You want almost no parking rules. You prefer that drivers pay for parking, rather than everyone sharing the costs through taxes.',
    keyPriorities: ['No restrictions', 'Flat user fees'],
    edmontonPolicyFit: 'Aligns with open flat-rate parking regions.',
    outcome: 'Free-flowing, rule-free curbside access where drivers pay minimal, flat-rate parking charges only where high turnover is strictly necessary, without bureaucratic permit programs.',
    badgeColor: '#FFC72C'
  },
  free_wheeler: {
    id: 'free-wheeler', quadrant: 'Q4', xRange: 'user', yRange: 'open',
    title: 'Free Wheeler', subtitle: 'Almost No Rules • Strong User-Fee',
    description: 'You want almost no parking rules so people are free. You strongly believe drivers should pay for their own parking, not everyone.',
    keyPriorities: ['Absolute freedom', '100% user-funded'],
    edmontonPolicyFit: 'Aligns with private unregulated toll/parking models.',
    outcome: 'A fully deregulated curbside model with zero permit restrictions or city-imposed caps, where parking infrastructure is entirely market-driven and self-funded by motorists.',
    badgeColor: '#FFC72C'
  }
};

export function calculatePersona(totalX: number, totalY: number): PersonaResult {
  const isCol1 = totalX < -4;
  const isCol2 = totalX >= -4 && totalX < 0;
  const isCol3 = totalX >= 0 && totalX <= 4;
  const isCol4 = totalX > 4;

  const isRow1 = totalY < -4;
  const isRow2 = totalY >= -4 && totalY < 0;
  const isRow3 = totalY >= 0 && totalY <= 4;
  const isRow4 = totalY > 4;

  if (isCol1) {
    if (isRow1) return PERSONA_PROFILES.block_resident;
    if (isRow2) return PERSONA_PROFILES.rule_resident;
    if (isRow3) return PERSONA_PROFILES.easy_neighbor;
    return PERSONA_PROFILES.happy_neighbor;
  } else if (isCol2) {
    if (isRow1) return PERSONA_PROFILES.tidy_resident;
    if (isRow2) return PERSONA_PROFILES.balanced_resident;
    if (isRow3) return PERSONA_PROFILES.chill_neighbour;
    return PERSONA_PROFILES.zen_neighbor;
  } else if (isCol3) {
    if (isRow1) return PERSONA_PROFILES.picky_parker;
    if (isRow2) return PERSONA_PROFILES.sensible_parker;
    if (isRow3) return PERSONA_PROFILES.simple_driver;
    return PERSONA_PROFILES.happy_driver;
  } else {
    // Col 4
    if (isRow1) return PERSONA_PROFILES.safety_parker;
    if (isRow2) return PERSONA_PROFILES.fair_parker;
    if (isRow3) return PERSONA_PROFILES.casual_cruiser;
    return PERSONA_PROFILES.free_wheeler;
  }
}
