import { SurveyQuestion, PersonaResult, SimulationConfig, StreetLayoutTypology } from '../types';
import { getTypologyFromPostalCode, getStreetLayoutInfo } from './edmontonNeighbourhoods';

export const INITIAL_SIM_CONFIG: SimulationConfig = {
  drivewayCapacity: 2,
  householdCarsPerHome: 2.0,
  visitorPassesPerHome: 0.3333, // Calibrated to 60% default starting curbside occupancy across all neighbourhood typologies
  splitInfillLots: 0,
  deliveriesPerHomePerWeek: 1.0,
  enforcementLevel: 'standard',
  cruisingTrafficLevel: 'moderate',
  curbsideFeeModel: 'free',
  streetLayout: 'mature_laned'
};

export const SURVEY_QUESTIONS: SurveyQuestion[] = [
  {
    id: 'q0',
    number: 0,
    category: 'Neighbourhood Type' as any,
    text: 'Choose one of the four neighbourhoods to calibrate live curbside parking stalls in your simulation and adjust home density.',
    helperText: "For an example street, select a layout you would like to explore. These simplified examples do not represent every street or household's parking options.",
    options: [
      {
        id: 'mature_laned',
        label: 'Mature Laned (1950s)',
        hint: 'Detached garages with back lanes. 12 legal curbside stalls.',
        x: 0,
        y: 0
      },
      {
        id: 'infill_skinny',
        label: 'Infill & Skinny Homes',
        hint: 'Subdivided narrow lots with detached rear garages. 12 legal curbside stalls.',
        x: 0,
        y: 0
      },
      {
        id: 'suburban_front_driveway',
        label: 'Suburban Front Driveway (1980s)',
        hint: 'Attached front driveways with 1.5m yellow curb setbacks (Bylaw 5590). 10 base stalls; each 8-plex removes a driveway to add a curbside stall back (except at the ETS bus stop).',
        x: 0,
        y: 0
      },
      {
        id: 'contemporary_townhomes',
        label: 'Contemporary Townhomes',
        hint: 'Multi-unit rows with rear garage lane and front pocket bays. 9 legal curbside stalls.',
        x: 0,
        y: 0
      }
    ]
  },
  {
    id: 'q1',
    number: 1,
    category: 'Funding',
    text: 'Residential parking programs cost money to operate. Who should pay for them?',
    options: [
      {
        id: 'q1_a',
        label: 'People who use parking through fees and parking permits',
        x: 4,
        y: 0,
        hint: 'Drivers who park on the street pay permit fees. This covers program costs and encourages people with driveways to park off the street.',
        simEffects: {
          drivewayCapacity: 2,
          householdCarsPerHome: 1.8
        }
      },
      {
        id: 'q1_b',
        label: 'All residents through property taxes',
        x: -4,
        y: 0,
        hint: 'Because street parking is free, more vehicles park on the street.',
        simEffects: {
          drivewayCapacity: 1,
          householdCarsPerHome: 2.6
        }
      }
    ]
  },
  {
    id: 'q2',
    number: 2,
    category: 'Parking Proximity to Home',
    text: 'When parking on the street near your home, what would you consider reasonably close?',
    options: [
      {
        id: 'q2_a',
        label: 'On my block',
        x: 4,
        y: 0,
        hint: 'Limits acceptable parking to your immediate block to keep vehicles within a short walking distance.',
        simEffects: {
          curbsideFeeModel: 'permit',
          enforcementLevel: 'strict'
        }
      },
      {
        id: 'q2_b',
        label: 'Within two or three blocks',
        x: -4,
        y: 0,
        hint: 'Increases available parking options by extending acceptable parking distance into the wider neighbourhood.',
        simEffects: {
          curbsideFeeModel: 'free',
          enforcementLevel: 'standard'
        }
      }
    ]
  },
  {
    id: 'q3',
    number: 3,
    category: 'Permit Limit',
    text: 'In neighbourhoods where street parking is in high demand, should there be a limit on parking permits per household?',
    options: [
      {
        id: 'q3_a',
        label: 'Yes',
        x: 0,
        y: -3,
        hint: 'Homes can only get permits for up to two street-parked cars. Extra vehicles must park in private driveways or garages.',
        simEffects: {
          drivewayCapacity: 2,
          householdCarsPerHome: 1.8
        }
      },
      {
        id: 'q3_b',
        label: 'No',
        x: 0,
        y: 3,
        hint: 'Homes can get permits for 3 or more vehicles, so more cars end up parked along the curb.',
        simEffects: {
          drivewayCapacity: 1,
          householdCarsPerHome: 2.5
        }
      }
    ]
  },
  {
    id: 'q4',
    number: 4,
    category: 'Visitor Access',
    text: 'When street parking is in high demand, should visitors and service providers (e.g., cleaners and contractors) have the same opportunity as residents to park on the block they are visiting?',
    options: [
      {
        id: 'q4_a',
        label: 'Yes',
        x: -2,
        y: 2,
        hint: 'Allows visitors, family, and service providers equal access to park near the home they are visiting.',
        simEffects: {
          deliveriesPerHomePerWeek: 2.5,
          enforcementLevel: 'lenient',
          cruisingTrafficLevel: 'high'
        }
      },
      {
        id: 'q4_b',
        label: 'No',
        x: 2,
        y: -2,
        hint: 'Prioritizes street parking for residents, reducing competition from visitor and service vehicles.',
        simEffects: {
          deliveriesPerHomePerWeek: 1.0,
          enforcementLevel: 'strict',
          cruisingTrafficLevel: 'low'
        }
      }
    ]
  },
  {
    id: 'q5',
    number: 5,
    category: 'Parking Proximity to Destination',
    text: 'When people visit hospitals, post-secondary institutions and event venues, should they be able to use nearby residential streets for parking?',
    options: [
      {
        id: 'q5_a',
        label: 'Yes',
        x: 3,
        y: -3,
        hint: 'Expands parking choices on nearby residential streets for patients, students, and event attendees.',
        simEffects: {
          visitorPassesPerHome: 0.33,
          enforcementLevel: 'strict'
        }
      },
      {
        id: 'q5_b',
        label: 'No',
        x: -3,
        y: 3,
        hint: 'Protects nearby residential street parking for residents and guests near major destinations.',
        simEffects: {
          visitorPassesPerHome: 0.75,
          enforcementLevel: 'lenient'
        }
      }
    ]
  },
  {
    id: 'q6',
    number: 6,
    category: 'Residential Parking Permit Eligibility',
    text: 'Should access to private parking affect who can get a permit? Consider all housing types, including those in single-family homes, townhomes and apartments. Private parking can mean a driveway, garage or other off-street parking space.',
    options: [
      {
        id: 'q6_a',
        label: 'Yes, housing types with no private parking should get priority for permits',
        x: 3,
        y: -3,
        hint: 'Prioritizes street parking permits for households with fewer off-street parking alternatives.',
        simEffects: {
          cruisingTrafficLevel: 'low',
          enforcementLevel: 'strict'
        }
      },
      {
        id: 'q6_b',
        label: 'No, all housing types should have the same eligibility, whether or not they have private parking.',
        x: -3,
        y: 3,
        hint: 'Ensures equal permit eligibility for all households regardless of their private parking arrangements.',
        simEffects: {
          cruisingTrafficLevel: 'high',
          enforcementLevel: 'lenient'
        }
      }
    ]
  },
  {
    id: 'q7',
    number: 7,
    category: 'Location' as any,
    type: 'text',
    text: 'Enter your full postal code or first three characters of your postal code.',
    placeholder: 'e.g. T5J 2R7 or T5J',
    helperText: 'Enter your full postal code or first three characters of your postal code:',
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
  answers: Record<string, string>,
  manualOverridesOrLayout?: StreetLayoutTypology | Partial<SimulationConfig>
): ComputedSimulationMetrics {
  const overrides: Partial<SimulationConfig> =
    typeof manualOverridesOrLayout === 'string'
      ? { streetLayout: manualOverridesOrLayout }
      : (manualOverridesOrLayout || {});

  // Determine active street layout typology (predetermined by q0 model street selection)
  const activeLayout: StreetLayoutTypology =
    overrides.streetLayout ||
    (answers['q0'] as StreetLayoutTypology) ||
    (answers['q0_layout'] as StreetLayoutTypology) ||
    'mature_laned';

  // Dwellings (Home Density):
  // splitInfillLots range 0 to 7 (adds up to 7 8-plex multi-unit infill buildings replacing houses on 15.6m lots)
  const num8Plex = Math.min(7, Math.max(0, overrides.splitInfillLots ?? (activeLayout === 'infill_skinny' ? 2 : 0)));
  const totalDwellings = 12 + num8Plex * 7;
  const layoutInfo = getStreetLayoutInfo(activeLayout);
  let baseCurbsideCapacity = layoutInfo.curbsideCapacity;
  if (activeLayout === 'suburban_front_driveway') {
    // Each 8-plex removes a driveway pad and 1.5m yellow curb clearance, creating curbside space for 1 parking stall
    const active8PlexLots = [2, 6, 4, 8, 1, 7, 10].slice(0, num8Plex);
    const restoredStallsCount = active8PlexLots.filter(lot => lot !== 10).length;
    baseCurbsideCapacity = layoutInfo.curbsideCapacity + restoredStallsCount;
  }
  const curbsideStallsCapacity = baseCurbsideCapacity;

  // Household Cars:
  // Baseline cars per home (~2.0, modified by q3 unlimited permits - formerly q2)
  let baseCarsPerHome = 2.0;
  if (answers['q3'] === 'q3_b') baseCarsPerHome += 0.33;
  if (answers['q3'] === 'q3_a') baseCarsPerHome -= 0.17;

  const householdCarsPerHome = overrides.householdCarsPerHome !== undefined
    ? overrides.householdCarsPerHome
    : baseCarsPerHome;

  const householdCars = Math.round(householdCarsPerHome * totalDwellings);

  // Private Off-Street Parking (Driveway / Garage Capacity):
  const baseDrivewayCap = activeLayout === 'suburban_front_driveway' ? 2 : (activeLayout === 'contemporary_townhomes' ? 1 : 2);
  const drivewayCap = overrides.drivewayCapacity !== undefined
    ? overrides.drivewayCapacity
    : baseDrivewayCap;

  // Private off-street capacity (garages / private driveways)
  // 8-Plex lots have zero garage parking (100% transit/curbside oriented under Edmonton missing-middle zoning)
  const singleFamilyHomes = Math.max(0, 12 - num8Plex);
  const totalOffStreetStalls = drivewayCap * singleFamilyHomes;
  const occupiedGarages = drivewayCap === 0
    ? 0
    : Math.min(householdCars, Math.round(totalOffStreetStalls * 0.85));

  // Overflow household vehicles parked along the curb
  const residentCurbOverflow = Math.max(0, householdCars - occupiedGarages);
  // Plus baseline daytime active convenience/errand curb parking
  const residentCurbConvenience = drivewayCap === 0 ? 0 : Math.min(Math.round(householdCars * 0.08), Math.round(curbsideStallsCapacity * 0.25));
  const residentCurbsideDemand = residentCurbOverflow + residentCurbConvenience;

  // Visitor passes and visitor cars: (Q5 Parking Proximity to Destination - formerly q4)
  const baseVisitorPasses = answers['q5'] === 'q5_b' ? (8 / 12) : (answers['q5'] === 'q5_a' ? (3 / 12) : (4 / 12));
  const visitorPassesPerHome = overrides.visitorPassesPerHome !== undefined
    ? overrides.visitorPassesPerHome
    : baseVisitorPasses;

  const visitorDemand = Math.round(visitorPassesPerHome * totalDwellings);
  // Visitors park on the street
  const visitorCurbsideDemand = visitorDemand;

  // Deliveries: (Q4 Visitor Access - formerly q3)
  const numThree8PlexTiers = Math.floor(num8Plex / 3);
  let baseDeliveriesPerWeek = activeLayout === 'infill_skinny' ? 2.0 : 1.0;
  if (answers['q4'] === 'q4_a') baseDeliveriesPerWeek += 1.5;
  if (answers['q4'] === 'q4_b') baseDeliveriesPerWeek = 1.0;
  if (numThree8PlexTiers >= 1) {
    baseDeliveriesPerWeek = Math.max(baseDeliveriesPerWeek, 2.0 + (numThree8PlexTiers - 1) * 1.0);
  }

  const deliveriesPerWeek = overrides.deliveriesPerHomePerWeek !== undefined
    ? (numThree8PlexTiers >= 1 ? Math.max(overrides.deliveriesPerHomePerWeek, 2.0 + (numThree8PlexTiers - 1) * 1.0) : overrides.deliveriesPerHomePerWeek)
    : baseDeliveriesPerWeek;

  const totalWeeklyDeliveries = Math.round(deliveriesPerWeek * totalDwellings);
  // Delivery vans active curb turnover impact
  const deliveryCurbsideDemand = totalWeeklyDeliveries / 16;

  // Policy shifts from survey answers (Q1 to Q6)
  let policyDemandShift = 0;
  let feeModel: 'free' | 'permit' = 'free';
  let enforcement: 'strict' | 'standard' | 'lenient' = 'standard';
  let cruisingLevel: 'low' | 'moderate' | 'high' = 'moderate';

  // Q1: Residential Parking Permit Program Funding
  if (answers['q1'] === 'q1_a') {
    policyDemandShift -= 2.0;
    feeModel = 'permit';
  } else if (answers['q1'] === 'q1_b') {
    policyDemandShift += 2.0;
    feeModel = 'free';
  }

  // Q2: Parking Proximity to Home (formerly Q5)
  if (answers['q2'] === 'q2_a') {
    policyDemandShift -= 1.5;
    feeModel = 'permit';
  } else if (answers['q2'] === 'q2_b') {
    policyDemandShift += 1.5;
  }

  // Q3: Residential Parking Permit Limit (formerly Q2)
  if (answers['q3'] === 'q3_a') {
    policyDemandShift -= 2.0;
  } else if (answers['q3'] === 'q3_b') {
    policyDemandShift += 2.0;
  }

  // Q4: Visitor Access (visitors, cleaners, and contractors)
  if (answers['q4'] === 'q4_a') {
    policyDemandShift += 2.0;
    enforcement = 'lenient';
    cruisingLevel = 'high';
  } else if (answers['q4'] === 'q4_b') {
    policyDemandShift -= 2.0;
    enforcement = 'strict';
    cruisingLevel = 'low';
  }

  // Q5: Parking Proximity to Destination (formerly Q4)
  if (answers['q5'] === 'q5_a') {
    policyDemandShift -= 2.0;
    enforcement = 'strict';
  } else if (answers['q5'] === 'q5_b') {
    policyDemandShift += 2.0;
    enforcement = 'lenient';
  }

  // Q6: Residential Parking Permit Eligibility (private parking)
  if (answers['q6'] === 'q6_a') {
    policyDemandShift -= 2.5;
    cruisingLevel = 'low';
    enforcement = 'strict';
  } else if (answers['q6'] === 'q6_b') {
    policyDemandShift += 2.5;
    cruisingLevel = 'high';
    enforcement = 'lenient';
  }

  // Q7: Accessible parking zones during events
  if (answers['q7'] === 'q7_a') {
    policyDemandShift -= 1.0;
    enforcement = 'strict';
  } else if (answers['q7'] === 'q7_b') {
    policyDemandShift += 1.0;
    enforcement = 'lenient';
  }

  // Q8: Neighbourhood-specific parking rules vs city-wide
  if (answers['q8'] === 'q8_a') {
    policyDemandShift -= 1.5;
  } else if (answers['q8'] === 'q8_b') {
    policyDemandShift += 1.5;
  }

  // Baseline calibration: The default parking occupancy to start is strictly 60% regardless of neighbourhood type
  const baselineCurbsideDemand = curbsideStallsCapacity * 0.60;

  // Compute the baseline unadjusted demand for this typology at its default parameters
  const defaultSplit = activeLayout === 'infill_skinny' ? 6 : 2;
  const defaultDwellings = 10 + defaultSplit;
  const defaultCarsPerHome = 2.0;
  const defaultDrivewayCap = activeLayout === 'suburban_front_driveway' ? 2 : (activeLayout === 'contemporary_townhomes' ? 1 : 2);
  const defaultTotalOffStreet = defaultDrivewayCap * defaultDwellings;
  const defaultHouseholdCars = Math.round(defaultCarsPerHome * defaultDwellings);
  const defaultOccupiedGarages = Math.min(defaultHouseholdCars, Math.round(defaultTotalOffStreet * 0.85));
  const defaultResidentOverflow = Math.max(0, defaultHouseholdCars - defaultOccupiedGarages);
  const defaultConvenience = Math.min(Math.round(defaultHouseholdCars * 0.08), Math.round(curbsideStallsCapacity * 0.25));
  const defaultResidentDemand = defaultResidentOverflow + defaultConvenience;
  const defaultVisitorDemand = Math.round((4 / 12) * defaultDwellings);
  const defaultDeliveries = activeLayout === 'infill_skinny' ? 2.0 : 1.0;
  const defaultDeliveryDemand = Math.round(defaultDeliveries * defaultDwellings) / 16;
  const defaultRawDemand = defaultResidentDemand + defaultVisitorDemand + defaultDeliveryDemand;

  // Net shift resulting from manual slider adjustments away from the default baseline
  const currentRawDemand = residentCurbsideDemand + visitorCurbsideDemand + deliveryCurbsideDemand;
  const sliderDemandDelta = currentRawDemand - defaultRawDemand;

  // Total curbside demand: starts at exactly 60% baseline capacity, shifting with policy and slider choices
  const totalCalculatedDemand = overrides.curbsideDemandOverride !== undefined
    ? overrides.curbsideDemandOverride
    : (baselineCurbsideDemand + sliderDemandDelta + policyDemandShift);

  // Clamp demand between 0 and realistic upper bound
  const roundedDemand = Math.max(0, Math.min(36, Math.round(totalCalculatedDemand)));
  // Calculate percentage: exactly 60% at start, scaling smoothly with demand shifts (0% when stalls converted to bike lane)
  const curbsidePct = curbsideStallsCapacity > 0
    ? Math.max(0, Math.round((totalCalculatedDemand / curbsideStallsCapacity) * 100))
    : 0;

  // Circling vehicles: when demand approaches or exceeds capacity
  let circlingCarCount = 0;
  if (curbsideStallsCapacity > 0 && roundedDemand >= curbsideStallsCapacity + 4) {
    circlingCarCount = 5;
  } else if (roundedDemand >= curbsideStallsCapacity + 2) {
    circlingCarCount = 4;
  } else if (roundedDemand >= curbsideStallsCapacity + 1) {
    circlingCarCount = 3;
  } else if (roundedDemand >= curbsideStallsCapacity) {
    circlingCarCount = 2;
  } else if (roundedDemand >= Math.round(curbsideStallsCapacity * 0.85)) {
    circlingCarCount = 1;
  }

  if (cruisingLevel === 'high') {
    circlingCarCount = Math.min(5, circlingCarCount + 1);
  } else if (cruisingLevel === 'low') {
    circlingCarCount = Math.max(0, circlingCarCount - 1);
  }

  const simConfig: SimulationConfig = {
    householdCarsPerHome,
    visitorPassesPerHome,
    drivewayCapacity: drivewayCap,
    splitInfillLots: num8Plex,
    deliveriesPerHomePerWeek: deliveriesPerWeek,
    enforcementLevel: overrides.enforcementLevel || enforcement,
    cruisingTrafficLevel: overrides.cruisingTrafficLevel || cruisingLevel,
    curbsideFeeModel: overrides.curbsideFeeModel || feeModel,
    streetLayout: activeLayout,
    neighbourhoodName: overrides.neighbourhoodName || answers['q7_neighbourhood'] || (answers['q7'] !== 'OPT_OUT' ? answers['q7'] : undefined),
    postalCode: overrides.postalCode || (answers['q7'] !== 'OPT_OUT' ? answers['q7'] : undefined)
  };

  return {
    activeHouseholdCars: householdCars,
    activeVisitorCars: visitorDemand,
    totalDwellings,
    totalWeeklyDeliveries,
    circlingCarCount,
    curbsideDemandCount: roundedDemand,
    curbsideStallsCapacity,
    curbsidePct,
    occupiedGaragesCount: occupiedGarages,
    simConfig
  };
}

export interface QuestionTradeoffOutcome {
  questionNumber: number;
  questionTitle: string;
  hasAnswer: boolean;
  selectedOptionLabel?: string;
  deltaStallsText?: string;
  deltaStallsValue?: number;
  tradeoffRationale: string;
  curbsideImpactSummary: string;
  benefitText?: string;
  costText?: string;
}

export function getQuestionTradeoffImpact(
  questionIndex: number,
  answers: Record<string, string>
): QuestionTradeoffOutcome {
  const question = SURVEY_QUESTIONS[questionIndex];
  if (!question) {
    return {
      questionNumber: questionIndex + 1,
      questionTitle: 'Curbside Parking Policy',
      hasAnswer: false,
      tradeoffRationale: 'Answer survey questions to see the live calculated impact on curbside parking stalls.',
      curbsideImpactSummary: 'Curbside parking demand updates in real-time.',
      benefitText: 'Select an option to explore the community benefit.',
      costText: 'Every choice involves a real-world community trade-off.'
    };
  }

  const selectedAnswerId = answers[question.id];
  const selectedOption = question.options.find(opt => opt.id === selectedAnswerId);

  if (question.id === 'q0' || question.category === 'model_street') {
    const layout = (selectedAnswerId as StreetLayoutTypology) || 'mature_laned';
    const layoutInfo = getStreetLayoutInfo(layout);
    return {
      questionNumber: 0,
      questionTitle: question.text,
      hasAnswer: Boolean(selectedAnswerId),
      selectedOptionLabel: layoutInfo.title,
      deltaStallsText: `${layoutInfo.curbsideCapacity} Stalls Capacity`,
      deltaStallsValue: layoutInfo.curbsideCapacity,
      tradeoffRationale: `Model street: ${layoutInfo.title} (${layoutInfo.era}). ${layoutInfo.subtitle}. Legal curbside capacity: ${layoutInfo.curbsideCapacity} stalls.`,
      curbsideImpactSummary: `Model street calibrated to ${layoutInfo.curbsideCapacity} legal curbside stalls (${layoutInfo.drivewayType}).`,
      benefitText: `Interactive 2.5D simulation calibrated for ${layoutInfo.title}.`,
      costText: `Different street typologies have varying curb cuts, driveway access, and parking pressure.`
    };
  }

  if (question.id === 'q1') {
    if (selectedAnswerId === 'q1_a') {
      return {
        questionNumber: 1,
        questionTitle: question.text,
        hasAnswer: true,
        selectedOptionLabel: selectedOption?.label || 'People who use parking through fees and parking permits',
        deltaStallsText: '-1.5 stalls (-10%)',
        deltaStallsValue: -1.5,
        tradeoffRationale: 'Ensures program operating costs are paid directly by users rather than through property taxes',
        curbsideImpactSummary: 'Drivers who park on the street pay permit fees. This covers program costs and encourages people with driveways to park off the street.',
        benefitText: 'Costs are covered by people using the program, rather than through property taxes.',
        costText: 'Residents must pay for permits to park on the street.'
      };
    }
    if (selectedAnswerId === 'q1_b') {
      return {
        questionNumber: 1,
        questionTitle: question.text,
        hasAnswer: true,
        selectedOptionLabel: selectedOption?.label || 'All residents through property taxes',
        deltaStallsText: '+1.5 stalls (+10%)',
        deltaStallsValue: 1.5,
        tradeoffRationale: 'Reduces direct costs to users by funding the program through property taxes instead of separate fees',
        curbsideImpactSummary: 'Because street parking is free, more vehicles park on the street.',
        benefitText: 'People can use the program without paying separate parking fees, reducing the cost of access.',
        costText: 'Costs are covered by all residents through property taxes, including by people who do not use the program.'
      };
    }
    return {
      questionNumber: 1,
      questionTitle: question.text,
      hasAnswer: false,
      tradeoffRationale: 'Residential parking programs cost money to operate. Who should pay for them?',
      curbsideImpactSummary: 'Select an option to evaluate curbside stall impact.',
      benefitText: 'Select an option to see the benefit.',
      costText: 'Select an option to see the trade-off.'
    };
  }

  if (question.id === 'q2') {
    if (selectedAnswerId === 'q2_a') {
      return {
        questionNumber: 2,
        questionTitle: question.text,
        hasAnswer: true,
        selectedOptionLabel: selectedOption?.label || 'On my block',
        deltaStallsText: '-2.0 stalls (-13%)',
        deltaStallsValue: -2.0,
        tradeoffRationale: 'Limits acceptable parking distance to the immediate block to keep vehicles close to home',
        curbsideImpactSummary: 'Limits acceptable parking to your immediate block to keep vehicles within a short walking distance.',
        benefitText: 'A short distance between your vehicle and home',
        costText: 'Parking on your block may be full even when parking is available nearby.'
      };
    }
    if (selectedAnswerId === 'q2_b') {
      return {
        questionNumber: 2,
        questionTitle: question.text,
        hasAnswer: true,
        selectedOptionLabel: selectedOption?.label || 'Within two or three blocks',
        deltaStallsText: '+2.0 stalls (+13%)',
        deltaStallsValue: 2.0,
        tradeoffRationale: 'Expands acceptable parking distance to the wider neighbourhood to increase available parking options',
        curbsideImpactSummary: 'Increases available parking options by extending acceptable parking distance into the wider neighbourhood.',
        benefitText: 'More possible spaces fall within the distance you consider acceptable.',
        costText: 'You may have a longer walk between your vehicle and home.'
      };
    }
    return {
      questionNumber: 2,
      questionTitle: question.text,
      hasAnswer: false,
      tradeoffRationale: 'When parking on the street near your home, what would you consider reasonably close?',
      curbsideImpactSummary: 'Select an option to evaluate curbside stall impact.',
      benefitText: 'Select an option to see the benefit.',
      costText: 'Select an option to see the trade-off.'
    };
  }

  if (question.id === 'q3') {
    if (selectedAnswerId === 'q3_a') {
      return {
        questionNumber: 3,
        questionTitle: question.text,
        hasAnswer: true,
        selectedOptionLabel: selectedOption?.label || 'Yes',
        deltaStallsText: '-2.0 stalls (-13%)',
        deltaStallsValue: -2.0,
        tradeoffRationale: 'Reduces competition for street parking to improve availability for other residents and visitors',
        curbsideImpactSummary: 'Limiting permits can reduce competition for street parking, improving availability for other residents and visitors.',
        benefitText: 'Limiting permits can reduce competition for street parking, improving availability for other residents and visitors.',
        costText: 'Households with more vehicles than permits would need other parking arrangements, which may be difficult if they have limited or no private parking'
      };
    }
    if (selectedAnswerId === 'q3_b') {
      return {
        questionNumber: 3,
        questionTitle: question.text,
        hasAnswer: true,
        selectedOptionLabel: selectedOption?.label || 'No',
        deltaStallsText: '+2.0 stalls (+13%)',
        deltaStallsValue: 2.0,
        tradeoffRationale: 'Accommodates households with multiple drivers by allowing permits for all eligible vehicles',
        curbsideImpactSummary: 'Homes can get permits for 3 or more vehicles, so more cars end up parked along the curb.',
        benefitText: 'Households can obtain permits for all eligible vehicles, accommodating households with multiple drivers.',
        costText: 'More vehicles may compete for the same spaces, making parking near home harder to find.'
      };
    }
    return {
      questionNumber: 3,
      questionTitle: question.text,
      hasAnswer: false,
      tradeoffRationale: 'Decide whether there should be a household permit limit in high demand neighbourhoods.',
      curbsideImpactSummary: 'Select an option to evaluate curbside stall impact.',
      benefitText: 'Select an option to see the benefit.',
      costText: 'Select an option to see the trade-off.'
    };
  }

  if (question.id === 'q4') {
    if (selectedAnswerId === 'q4_a') {
      return {
        questionNumber: 4,
        questionTitle: question.text,
        hasAnswer: true,
        selectedOptionLabel: selectedOption?.label || 'Yes',
        deltaStallsText: '+2.0 stalls (+13%)',
        deltaStallsValue: 2.0,
        tradeoffRationale: 'Allows family, friends, and service providers to park conveniently close to the homes they visit',
        curbsideImpactSummary: 'Allows visitors, family, and service providers equal access to park near the home they are visiting.',
        benefitText: 'Family, friends and people providing services can use available spaces close to the home they’re visiting.',
        costText: 'Residents face more competition for those spaces and more vehicles are parked on the street.'
      };
    }
    if (selectedAnswerId === 'q4_b') {
      return {
        questionNumber: 4,
        questionTitle: question.text,
        hasAnswer: true,
        selectedOptionLabel: selectedOption?.label || 'No',
        deltaStallsText: '-2.0 stalls (-13%)',
        deltaStallsValue: -2.0,
        tradeoffRationale: 'Prioritizes residents for nearby spaces by reducing competition from visitor vehicles',
        curbsideImpactSummary: 'Prioritizes street parking for residents, reducing competition from visitor and service vehicles.',
        benefitText: 'Residents have priority for nearby spaces, reducing traffic and competition from visitor vehicles.',
        costText: 'Visitors and service providers may need to park farther away, making visits less convenient.'
      };
    }
    return {
      questionNumber: 4,
      questionTitle: question.text,
      hasAnswer: false,
      tradeoffRationale: 'Decide whether visitors and service providers should have equal parking opportunities.',
      curbsideImpactSummary: 'Select an option to evaluate curbside stall impact.',
      benefitText: 'Select an option to see the benefit.',
      costText: 'Select an option to see the trade-off.'
    };
  }

  if (question.id === 'q5') {
    if (selectedAnswerId === 'q5_a') {
      return {
        questionNumber: 5,
        questionTitle: question.text,
        hasAnswer: true,
        selectedOptionLabel: selectedOption?.label || 'Yes',
        deltaStallsText: '-2.5 stalls (-16%)',
        deltaStallsValue: -2.5,
        tradeoffRationale: 'Expands parking options for patients, students, visitors, and event attendees near major destinations',
        curbsideImpactSummary: 'Expands parking choices on nearby residential streets for patients, students, and event attendees.',
        benefitText: 'Patients, students and event attendees have more parking options within a few blocks of their destination.',
        costText: 'Residents and their visitors may face more competition for spaces and need to park farther away.'
      };
    }
    if (selectedAnswerId === 'q5_b') {
      return {
        questionNumber: 5,
        questionTitle: question.text,
        hasAnswer: true,
        selectedOptionLabel: selectedOption?.label || 'No',
        deltaStallsText: '+2.5 stalls (+16%)',
        deltaStallsValue: 2.5,
        tradeoffRationale: 'Protects residential street parking from institutional and event venue visitor spillover',
        curbsideImpactSummary: 'Protects nearby residential street parking for residents and guests near major destinations.',
        benefitText: 'Residents and their visitors face less competition for nearby spaces from people visiting these destinations.',
        costText: 'People visiting nearby destinations have fewer street parking options and may need to park farther away, or use other parking facilities'
      };
    }
    return {
      questionNumber: 5,
      questionTitle: question.text,
      hasAnswer: false,
      tradeoffRationale: 'Decide whether visitors to hospitals, institutions and venues can use nearby residential streets.',
      curbsideImpactSummary: 'Select an option to evaluate curbside stall impact.',
      benefitText: 'Select an option to see the benefit.',
      costText: 'Select an option to see the trade-off.'
    };
  }

  if (question.id === 'q6') {
    if (selectedAnswerId === 'q6_a') {
      return {
        questionNumber: 6,
        questionTitle: question.text,
        hasAnswer: true,
        selectedOptionLabel: selectedOption?.label || 'Yes, housing types with no private parking should get priority for permits',
        deltaStallsText: '-3.5 stalls (-22%)',
        deltaStallsValue: -3.5,
        tradeoffRationale: 'Prioritizes street parking permits for households with no private off-street parking options',
        curbsideImpactSummary: 'Prioritizes street parking permits for households with fewer off-street parking alternatives.',
        benefitText: 'Prioritizes households with fewer alternatives to street parking, regardless of housing type.',
        costText: 'Households with private parking may have less access to permits, even when their private parking does not meet all their needs.'
      };
    }
    if (selectedAnswerId === 'q6_b') {
      return {
        questionNumber: 6,
        questionTitle: question.text,
        hasAnswer: true,
        selectedOptionLabel: selectedOption?.label || 'No, all housing types should have the same eligibility, whether or not they have private parking.',
        deltaStallsText: '+3.5 stalls (+22%)',
        deltaStallsValue: 3.5,
        tradeoffRationale: 'Ensures equal permit eligibility for all households regardless of private parking availability',
        curbsideImpactSummary: 'Ensures equal permit eligibility for all households regardless of their private parking arrangements.',
        benefitText: 'Households have the same opportunity to obtain permits, regardless of their private parking options.',
        costText: 'Households without private parking receive no additional priority and may face more competition for limited permits.'
      };
    }
    return {
      questionNumber: 6,
      questionTitle: question.text,
      hasAnswer: false,
      tradeoffRationale: 'Decide whether access to private parking should affect permit eligibility.',
      curbsideImpactSummary: 'Select an option to evaluate curbside stall impact.',
      benefitText: 'Select an option to see the benefit.',
      costText: 'Select an option to see the trade-off.'
    };
  }

  // Location question (q7 - Postal code & Neighbourhood demographics)
  if (question.id === 'q7' || question.category === 'location' || question.type === 'text') {
    if (selectedAnswerId) {
      const isOptOut = selectedAnswerId === 'OPT_OUT';
      return {
        questionNumber: 7,
        questionTitle: question.text,
        hasAnswer: true,
        selectedOptionLabel: isOptOut ? 'Location Opted Out' : selectedAnswerId,
        deltaStallsText: isOptOut ? 'Anonymous' : 'Recorded',
        deltaStallsValue: 0,
        tradeoffRationale: isOptOut
          ? 'Location kept 100% anonymous.'
          : `Recorded location: ${selectedAnswerId} for demographic reporting.`,
        curbsideImpactSummary: isOptOut
          ? 'Participation recorded anonymously without disclosing location.'
          : `Recorded location: ${selectedAnswerId}.`,
        benefitText: isOptOut
          ? '100% anonymous participation.'
          : 'Provides valuable geographic data to Edmonton City Planning.',
        costText: 'Demographic and location input is protected under Alberta privacy guidelines.'
      };
    }

    return {
      questionNumber: 7,
      questionTitle: question.text,
      hasAnswer: false,
      tradeoffRationale: 'Share your Edmonton postal code or neighbourhood to help City Planning understand regional feedback.',
      curbsideImpactSummary: 'Data is protected under POPA / FOIP privacy guidelines.',
      benefitText: 'Helps Edmonton City Planning understand feedback by neighbourhood.',
      costText: 'Participation can also be submitted anonymously.'
    };
  }

  return {
    questionNumber: questionIndex + 1,
    questionTitle: question.text,
    hasAnswer: false,
    tradeoffRationale: 'Answer this question to see its calculated impact on curbside parking.',
    curbsideImpactSummary: 'Curbside parking demand updates in real-time.'
  };
}

export function validatePostalCode(val: string): { isValid: boolean; message?: string } {
  if (val === 'OPT_OUT') return { isValid: true };
  if (!val || !val.trim()) {
    return { isValid: false, message: 'Please enter your postal code or select your neighbourhood to continue.' };
  }
  const trimmed = val.trim();
  const alphaNum = trimmed.replace(/[\s-]/g, '');

  // If user entered a recognized neighbourhood name, layout ID, or text string >= 2 chars
  if (/^[a-zA-Z\s'()._-]+$/.test(trimmed) && trimmed.length >= 2) {
    return { isValid: true };
  }

  // Postal code check: alphanumeric 3 to 7 characters (accepts FSA or full postal code)
  if (/^[a-zA-Z0-9]+$/.test(alphaNum)) {
    if (alphaNum.length >= 3 && alphaNum.length <= 7) {
      return { isValid: true };
    }
  }

  return {
    isValid: false,
    message: 'Please enter a valid postal code (e.g. T5J 2R7) or select an Edmonton neighbourhood.'
  };
}

import {
  DEFAULT_8_PERSONAS,
  getActive8Personas,
  calculate8Persona
} from './personaData8';

export const PERSONA_PROFILES: Record<string, PersonaResult> = {
  // === The 8 Active Curbside Policy Archetypes ===
  user_funded_parker: DEFAULT_8_PERSONAS.user_funded_parker,
  practical_parker: DEFAULT_8_PERSONAS.practical_parker,
  city_funded_parker: DEFAULT_8_PERSONAS.city_funded_parker,
  flexible_parker: DEFAULT_8_PERSONAS.flexible_parker,
  chill_neighbour: DEFAULT_8_PERSONAS.chill_neighbour,
  balanced_resident: DEFAULT_8_PERSONAS.balanced_resident,
  casual_cruiser: DEFAULT_8_PERSONAS.casual_cruiser,
  balanced_neighbour: DEFAULT_8_PERSONAS.balanced_neighbour,

  // === Legacy Profile Aliases (Backwards compatibility & smooth migration) ===
  safety_parker: DEFAULT_8_PERSONAS.user_funded_parker,
  block_resident: DEFAULT_8_PERSONAS.city_funded_parker,
  zen_neighbour: DEFAULT_8_PERSONAS.chill_neighbour,
  simple_driver: DEFAULT_8_PERSONAS.balanced_neighbour,
  tidy_resident: DEFAULT_8_PERSONAS.flexible_parker,
  rule_resident: DEFAULT_8_PERSONAS.city_funded_parker,
  picky_parker: DEFAULT_8_PERSONAS.practical_parker,
  sensible_parker: DEFAULT_8_PERSONAS.practical_parker,
  fair_parker: DEFAULT_8_PERSONAS.user_funded_parker,
  easy_neighbor: DEFAULT_8_PERSONAS.balanced_resident,
  happy_neighbor: DEFAULT_8_PERSONAS.chill_neighbour,
  zen_neighbor: DEFAULT_8_PERSONAS.chill_neighbour,
  happy_driver: DEFAULT_8_PERSONAS.balanced_neighbour,
  free_wheeler: DEFAULT_8_PERSONAS.casual_cruiser
};

export function calculatePersona(totalX: number, totalY: number): PersonaResult {
  return calculate8Persona(totalX, totalY);
}
