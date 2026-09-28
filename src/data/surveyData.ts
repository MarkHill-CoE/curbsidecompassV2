import { SurveyQuestion, PersonaResult, SimulationConfig, StreetLayoutTypology } from '../types';
import { getTypologyFromPostalCode, getStreetLayoutInfo } from './edmontonNeighbourhoods';

export const INITIAL_SIM_CONFIG: SimulationConfig = {
  householdCarsPerHome: 2.0,
  visitorPassesPerHome: 0.3333, // Calibrated to 60% default starting curbside occupancy across all neighbourhood typologies
  drivewayCapacity: 2,
  splitInfillLots: 2,
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
    category: 'location',
    type: 'text',
    text: 'Where do you live in Edmonton?',
    placeholder: 'e.g. T5J 2R7 or Strathcona',
    helperText: 'Type your neighbourhood or postal code so we can show your street style.',
    options: []
  },
  {
    id: 'q1',
    number: 1,
    category: 'residential',
    text: 'Who should pay the cost to run street parking in neighbourhoods?',
    options: [
      {
        id: 'q1_a',
        label: 'Drivers who park on the street should pay permit fees to cover the costs.',
        x: 4,
        y: 0,
        hint: 'Drivers who park on the street pay permit fees. This covers program costs and encourages people with driveways to park off the street.',
        simEffects: {
          drivewayCapacity: 2,
          householdCarsPerHome: 2.0 // total 12 cars, 12 fit in driveway, 0 on street
        }
      },
      {
        id: 'q1_b',
        label: 'All city taxpayers should pay for street parking through property taxes.',
        x: -4,
        y: 0,
        hint: 'Because street parking is free, more vehicles park on the street.',
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
    text: 'Should the City put a limit on how many street parking permits each home can get?',
    options: [
      {
        id: 'q2_a',
        label: 'Yes, set a limit so street spots stay open for neighbours.',
        x: 0,
        y: -3,
        hint: 'Limiting permits lowers the number of cars parked on the street and encourages using driveways or garages.',
        simEffects: {
          drivewayCapacity: 2,
          householdCarsPerHome: 1.8
        }
      },
      {
        id: 'q2_b',
        label: 'No, let homes get as many permits as they need.',
        x: 0,
        y: 3,
        hint: 'Without permit limits, homes with several cars park them all on the street.',
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
    text: 'How should work vans and delivery trucks park on your street?',
    options: [
      {
        id: 'q3_a',
        label: 'Require work vehicles to buy special permits to park on the street.',
        x: 2,
        y: -2,
        hint: 'Requiring permits and loading zones keeps delivery trucks moving and stops them from blocking traffic.',
        simEffects: {
          deliveriesPerHomePerWeek: 2,
          enforcementLevel: 'strict'
        }
      },
      {
        id: 'q3_b',
        label: 'Let work vehicles and delivery vans park for free without special permits.',
        x: -2,
        y: 2,
        hint: 'Free parking means work trucks take street spots all day and can block narrow streets.',
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
    text: 'How should guest and visitor parking work on your street?',
    options: [
      {
        id: 'q4_a',
        label: 'Guests must register online or use a pass so parking stays under control.',
        x: 3,
        y: -3,
        hint: 'Visitor passes and check-ins keep parking spots open for actual guests.',
        simEffects: {
          visitorPassesPerHome: 0.8,
          enforcementLevel: 'strict'
        }
      },
      {
        id: 'q4_b',
        label: 'Free parking for all guests on a first-come, first-served basis.',
        x: -3,
        y: 3,
        hint: 'Without registration or passes, spots fill up quickly and commuters can park for days.',
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
    text: 'Who should pay for parking officers and parking tickets?',
    options: [
      {
        id: 'q5_a',
        label: 'Drivers who park and get tickets should cover costs through fees and fines.',
        x: 4,
        y: 0,
        hint: 'User fees and tickets pay for patrols, keeping streets clear and moving.',
        simEffects: {
          curbsideFeeModel: 'permit',
          householdCarsPerHome: 1.8,
          drivewayCapacity: 2
        }
      },
      {
        id: 'q5_b',
        label: 'All city taxpayers should pay for enforcement through property taxes.',
        x: -4,
        y: 0,
        hint: 'Because taxes pay for officers, enforcement is relaxed and cars can sit parked for days.',
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
    text: 'How should parking work near busy places like hospitals, colleges, or LRT stations?',
    options: [
      {
        id: 'q6_a',
        label: 'Charge for parking with time limits so spots turn over often.',
        x: 3,
        y: -3,
        hint: 'Paid parking and time limits stop outside commuters from taking neighbourhood spots.',
        simEffects: {
          enforcementLevel: 'strict',
          cruisingTrafficLevel: 'low',
          visitorPassesPerHome: 0.2
        }
      },
      {
        id: 'q6_b',
        label: 'Keep street parking free and open for everyone who visits.',
        x: -3,
        y: 3,
        hint: 'Free parking means hospital and university commuters fill neighbourhood streets all day.',
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
    text: 'How should accessible disability parking spots be protected during busy events?',
    options: [
      {
        id: 'q7_a',
        label: 'Check disability permits strictly so spots stay open for people who need them.',
        x: 2,
        y: -2,
        hint: 'Strict checks make sure people with disabilities, seniors, and caregivers always have a spot.',
        simEffects: {
          enforcementLevel: 'strict',
          householdCarsPerHome: 2.0
        }
      },
      {
        id: 'q7_b',
        label: 'Rely on drivers\' courtesy to leave marked accessible spots open.',
        x: -2,
        y: 2,
        hint: 'Without active checks, drivers without permits take accessible spots during events.',
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
    text: 'How should the City set street parking rules across Edmonton?',
    options: [
      {
        id: 'q8_a',
        label: 'Use the same clear, standard parking rules across all Edmonton neighbourhoods.',
        x: 0,
        y: -4,
        hint: 'Consistent city-wide parking rules stop cars from dodging rules onto the next block.',
        simEffects: {
          drivewayCapacity: 2,
          householdCarsPerHome: 2.0
        }
      },
      {
        id: 'q8_b',
        label: 'Let each neighbourhood vote and pick its own parking rules block by block.',
        x: 0,
        y: 4,
        hint: 'Neighbourhoods get flexibility, but cars may spill over onto nearby unregulated streets.',
        simEffects: {
          drivewayCapacity: 1,
          householdCarsPerHome: 2.8
        }
      }
    ]
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

  // Determine active street layout typology (predetermined by q0 or fallback q9)
  const activeLayout: StreetLayoutTypology =
    overrides.streetLayout ||
    (answers['q0_layout'] as StreetLayoutTypology) ||
    (answers['q9_layout'] as StreetLayoutTypology) ||
    (answers['q0'] ? getTypologyFromPostalCode(answers['q0']) : (answers['q9'] ? getTypologyFromPostalCode(answers['q9']) : 'mature_laned'));

  const layoutInfo = getStreetLayoutInfo(activeLayout);
  const curbsideStallsCapacity = layoutInfo.curbsideCapacity;

  // Dwellings (Home Density):
  // splitInfillLots range 2 to 12 in slider (min 2 = 12 dwellings, max 12 = 22 dwellings)
  const splitLots = overrides.splitInfillLots ?? (activeLayout === 'infill_skinny' ? 6 : 2);
  const totalDwellings = 10 + splitLots;

  // Household Cars:
  // Baseline cars per home (~2.0, modified by q2 unlimited permits)
  let baseCarsPerHome = 2.0;
  if (answers['q2'] === 'q2_b') baseCarsPerHome += 0.33;
  if (answers['q2'] === 'q2_a') baseCarsPerHome -= 0.17;

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
  // When drivewayCap is 0: 0 off-street parking -> all cars park on the curb!
  // When drivewayCap > 0: garages absorb up to ~85% of their capacity
  const totalOffStreetStalls = drivewayCap * totalDwellings;
  const occupiedGarages = drivewayCap === 0
    ? 0
    : Math.min(householdCars, Math.round(totalOffStreetStalls * 0.85));

  // Overflow household vehicles parked along the curb
  const residentCurbOverflow = Math.max(0, householdCars - occupiedGarages);
  // Plus baseline daytime active convenience/errand curb parking
  const residentCurbConvenience = drivewayCap === 0 ? 0 : Math.min(Math.round(householdCars * 0.08), Math.round(curbsideStallsCapacity * 0.25));
  const residentCurbsideDemand = residentCurbOverflow + residentCurbConvenience;

  // Visitor passes and visitor cars:
  const baseVisitorPasses = answers['q4'] === 'q4_b' ? (8 / 12) : (answers['q4'] === 'q4_a' ? (3 / 12) : (4 / 12));
  const visitorPassesPerHome = overrides.visitorPassesPerHome !== undefined
    ? overrides.visitorPassesPerHome
    : baseVisitorPasses;

  const visitorDemand = Math.round(visitorPassesPerHome * totalDwellings);
  // Visitors park on the street
  const visitorCurbsideDemand = visitorDemand;

  // Deliveries:
  let baseDeliveriesPerWeek = activeLayout === 'infill_skinny' ? 2.0 : 1.0;
  if (answers['q3'] === 'q3_b') baseDeliveriesPerWeek += 1.5;
  if (answers['q3'] === 'q3_a') baseDeliveriesPerWeek = 1.0;

  const deliveriesPerWeek = overrides.deliveriesPerHomePerWeek !== undefined
    ? overrides.deliveriesPerHomePerWeek
    : baseDeliveriesPerWeek;

  const totalWeeklyDeliveries = Math.round(deliveriesPerWeek * totalDwellings);
  // Delivery vans active curb turnover impact
  const deliveryCurbsideDemand = totalWeeklyDeliveries / 16;

  // Policy shifts from survey answers (Q1 to Q8)
  let policyDemandShift = 0;
  let feeModel: 'free' | 'permit' = 'free';
  let enforcement: 'strict' | 'standard' | 'lenient' = 'standard';
  let cruisingLevel: 'low' | 'moderate' | 'high' = 'moderate';

  // Q1: Who should pay for residential parking programs?
  if (answers['q1'] === 'q1_a') {
    policyDemandShift -= 1.5;
    feeModel = 'permit';
  } else if (answers['q1'] === 'q1_b') {
    policyDemandShift += 1.5;
    feeModel = 'free';
  }

  // Q2: Limit on-street permits per household?
  if (answers['q2'] === 'q2_a') {
    policyDemandShift -= 1.5;
  } else if (answers['q2'] === 'q2_b') {
    policyDemandShift += 1.5;
  }

  // Q3: Restrictions on commercial & trade vehicles?
  if (answers['q3'] === 'q3_a') {
    policyDemandShift -= 1.0;
  } else if (answers['q3'] === 'q3_b') {
    policyDemandShift += 1.5;
  }

  // Q4: Visitor parking management?
  if (answers['q4'] === 'q4_a') {
    policyDemandShift -= 1.0;
    enforcement = 'strict';
  } else if (answers['q4'] === 'q4_b') {
    policyDemandShift += 1.5;
    enforcement = 'lenient';
  }

  // Q5: Who pays for enforcement?
  if (answers['q5'] === 'q5_a') {
    policyDemandShift -= 1.5;
    enforcement = 'strict';
  } else if (answers['q5'] === 'q5_b') {
    policyDemandShift += 2.0;
    enforcement = 'lenient';
  }

  // Q6: Near major traffic generators (hospitals/universities)?
  if (answers['q6'] === 'q6_a') {
    policyDemandShift -= 2.0;
    cruisingLevel = 'low';
  } else if (answers['q6'] === 'q6_b') {
    policyDemandShift += 3.0;
    cruisingLevel = 'high';
  }

  // Q7: Accessible parking zones during events?
  if (answers['q7'] === 'q7_a') {
    policyDemandShift -= 1.0;
  } else if (answers['q7'] === 'q7_b') {
    policyDemandShift += 1.5;
  }

  // Q8: City-wide standardized rules vs block-by-block opt-in?
  if (answers['q8'] === 'q8_a') {
    policyDemandShift -= 1.0;
  } else if (answers['q8'] === 'q8_b') {
    policyDemandShift += 2.0;
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
  // Calculate percentage: exactly 60% at start, scaling smoothly with demand shifts
  const curbsidePct = Math.max(0, Math.round((totalCalculatedDemand / curbsideStallsCapacity) * 100));

  // Circling vehicles: when demand approaches or exceeds capacity
  let circlingCarCount = 0;
  if (roundedDemand >= curbsideStallsCapacity + 4) {
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

  const simConfig: SimulationConfig = {
    householdCarsPerHome,
    visitorPassesPerHome,
    drivewayCapacity: drivewayCap,
    splitInfillLots: splitLots,
    deliveriesPerHomePerWeek: deliveriesPerWeek,
    enforcementLevel: overrides.enforcementLevel || enforcement,
    cruisingTrafficLevel: overrides.cruisingTrafficLevel || cruisingLevel,
    curbsideFeeModel: overrides.curbsideFeeModel || feeModel,
    streetLayout: activeLayout,
    neighbourhoodName: overrides.neighbourhoodName || answers['q0_neighbourhood'] || answers['q9_neighbourhood'] || undefined,
    postalCode: overrides.postalCode || answers['q0'] || answers['q9'] || undefined
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

  if (question.id === 'q1') {
    if (selectedAnswerId === 'q1_a') {
      return {
        questionNumber: 1,
        questionTitle: question.text,
        hasAnswer: true,
        selectedOptionLabel: selectedOption?.label || 'Permit fees by vehicle owners',
        deltaStallsText: '-1.5 stalls (-10%)',
        deltaStallsValue: -1.5,
        tradeoffRationale: 'User permit fees encourage vehicle owners to use private detached garages instead of the street.',
        curbsideImpactSummary: 'Frees up shared curbside stalls for visitors and delivery couriers.',
        benefitText: 'Frees up curb spaces for guests, family visitors, and delivery couriers. Non-drivers do not pay for parking.',
        costText: 'Drivers who park on the street must pay monthly or yearly permit fees.'
      };
    }
    if (selectedAnswerId === 'q1_b') {
      return {
        questionNumber: 1,
        questionTitle: question.text,
        hasAnswer: true,
        selectedOptionLabel: selectedOption?.label || 'Taxpayer funded',
        deltaStallsText: '+1.5 stalls (+10%)',
        deltaStallsValue: +1.5,
        tradeoffRationale: 'Free on-street storage encourages residents to leave extra vehicles parked curbside.',
        curbsideImpactSummary: 'Higher curbside occupancy and less room for short-term visitors.',
        benefitText: 'Zero permit fees and no out-of-pocket costs for residents parking on the street.',
        costText: 'All city taxpayers cover the bill, even if they do not own a car. Streets stay more crowded.'
      };
    }
    return {
      questionNumber: 1,
      questionTitle: question.text,
      hasAnswer: false,
      tradeoffRationale: 'Choose between vehicle owner permit fees or general taxpayer funding.',
      curbsideImpactSummary: 'Calculates the trade-off between private garage use and street crowding.',
      benefitText: 'Learn who pays and who benefits from street parking rules.',
      costText: 'Select an answer to see the community trade-off.'
    };
  }

  if (question.id === 'q2') {
    if (selectedAnswerId === 'q2_a') {
      return {
        questionNumber: 2,
        questionTitle: question.text,
        hasAnswer: true,
        selectedOptionLabel: selectedOption?.label || 'Limit permits per household',
        deltaStallsText: '-2.0 stalls (-13%)',
        deltaStallsValue: -2.0,
        tradeoffRationale: 'Capping permits per home prevents multi-car homes from occupying multiple curb spaces.',
        curbsideImpactSummary: 'Leaves guaranteed open space for all households along the block.',
        benefitText: 'Guarantees open space so every home on the block has a fair chance to park.',
        costText: 'Homes with multiple drivers cannot park all their cars on the street.'
      };
    }
    if (selectedAnswerId === 'q2_b') {
      return {
        questionNumber: 2,
        questionTitle: question.text,
        hasAnswer: true,
        selectedOptionLabel: selectedOption?.label || 'No permit limits',
        deltaStallsText: '+2.0 stalls (+13%)',
        deltaStallsValue: +2.0,
        tradeoffRationale: 'Unlimited permits allow multi-car homes to store multiple cars on the street.',
        curbsideImpactSummary: 'Increased curbside competition and reduced stall turnover.',
        benefitText: 'Multi-driver households can register and park all their vehicles on the street.',
        costText: 'Street spaces fill up quickly, leaving fewer spots for neighbours and guests.'
      };
    }
    return {
      questionNumber: 2,
      questionTitle: question.text,
      hasAnswer: false,
      tradeoffRationale: 'Decide whether to cap on-street permits per household.',
      curbsideImpactSummary: 'Affects how many vehicles each home can park along the curb.',
      benefitText: 'Balances street space among all neighbours.',
      costText: 'Select an answer to see the community trade-off.'
    };
  }

  if (question.id === 'q3') {
    if (selectedAnswerId === 'q3_a') {
      return {
        questionNumber: 3,
        questionTitle: question.text,
        hasAnswer: true,
        selectedOptionLabel: selectedOption?.label || 'Paid commercial permits & zones',
        deltaStallsText: '-1.5 stalls (-10%)',
        deltaStallsValue: -1.5,
        tradeoffRationale: 'Specialized work and loading zones keep couriers and contractors from double-parking in the lane.',
        curbsideImpactSummary: 'Ensures delivery turnover while keeping street traffic moving smoothly.',
        benefitText: 'Keeps traffic lanes moving and guarantees safe, quick drop-off zones for delivery drivers.',
        costText: 'Contractors and delivery companies must pay permit fees or face short time limits.'
      };
    }
    if (selectedAnswerId === 'q3_b') {
      return {
        questionNumber: 3,
        questionTitle: question.text,
        hasAnswer: true,
        selectedOptionLabel: selectedOption?.label || 'No commercial restrictions',
        deltaStallsText: '+2.0 stalls (+13%)',
        deltaStallsValue: +2.0,
        tradeoffRationale: 'Contractors and delivery vans occupy curbside stalls for extended hours.',
        curbsideImpactSummary: 'Reduces available parking for residents and visiting guests.',
        benefitText: 'Free and convenient parking for home renovations, tradespeople, and couriers.',
        costText: 'Large commercial trucks can block narrow residential roads and take resident stalls all day.'
      };
    }
    return {
      questionNumber: 3,
      questionTitle: question.text,
      hasAnswer: false,
      tradeoffRationale: 'Choose rules for trade contractors and delivery vans.',
      curbsideImpactSummary: 'Balances commercial delivery needs with resident parking.',
      benefitText: 'Explore how delivery vans and work trucks share the road.',
      costText: 'Select an answer to see the community trade-off.'
    };
  }

  if (question.id === 'q4') {
    if (selectedAnswerId === 'q4_a') {
      return {
        questionNumber: 4,
        questionTitle: question.text,
        hasAnswer: true,
        selectedOptionLabel: selectedOption?.label || 'Digital visitor registration',
        deltaStallsText: '-1.5 stalls (-10%)',
        deltaStallsValue: -1.5,
        tradeoffRationale: 'Digital registration prevents non-resident commuters from parking for days at a time.',
        curbsideImpactSummary: 'Maintains predictable, open visitor parking stalls.',
        benefitText: 'Keeps spots open for genuine visiting family and friends; stops commuters from hogging street stalls.',
        costText: 'Visitors or hosts must take time to register online or display a visitor pass.'
      };
    }
    if (selectedAnswerId === 'q4_b') {
      return {
        questionNumber: 4,
        questionTitle: question.text,
        hasAnswer: true,
        selectedOptionLabel: selectedOption?.label || 'First-come, first-served',
        deltaStallsText: '+2.5 stalls (+16%)',
        deltaStallsValue: +2.5,
        tradeoffRationale: 'Unmonitored visitor parking fills stalls quickly without time turnover.',
        curbsideImpactSummary: 'High curb pressure during peak evenings and weekends.',
        benefitText: 'Zero registration, no apps, and no visitor pass paperwork needed for guests.',
        costText: 'Street spaces fill up quickly, and guests often have to circle looking for open parking.'
      };
    }
    return {
      questionNumber: 4,
      questionTitle: question.text,
      hasAnswer: false,
      tradeoffRationale: 'Choose how visitor parking should be managed.',
      curbsideImpactSummary: 'Balances guest convenience with commuter parking overflow.',
      benefitText: 'Decide how easy or strict visiting should be on your block.',
      costText: 'Select an answer to see the community trade-off.'
    };
  }

  if (question.id === 'q5') {
    if (selectedAnswerId === 'q5_a') {
      return {
        questionNumber: 5,
        questionTitle: question.text,
        hasAnswer: true,
        selectedOptionLabel: selectedOption?.label || 'User fees & violation fines',
        deltaStallsText: '-1.5 stalls (-10%)',
        deltaStallsValue: -1.5,
        tradeoffRationale: 'Active patrols funded by violators deter long-term overstays and boost turnover.',
        curbsideImpactSummary: 'Prevents abandoned or stored cars from hogging curbside stalls.',
        benefitText: 'Only people who park or break parking rules pay for enforcement; general city taxes stay low.',
        costText: 'Strict patrols and higher ticket fines for residents who overstay or forget permits.'
      };
    }
    if (selectedAnswerId === 'q5_b') {
      return {
        questionNumber: 5,
        questionTitle: question.text,
        hasAnswer: true,
        selectedOptionLabel: selectedOption?.label || 'Property taxes',
        deltaStallsText: '+2.0 stalls (+13%)',
        deltaStallsValue: +2.0,
        tradeoffRationale: 'Tax-funded enforcement is infrequent and complaint-driven.',
        curbsideImpactSummary: 'Cars linger parked along the curb for multiple days without turnover.',
        benefitText: 'Fewer parking tickets issued; relaxed enforcement across neighbourhood streets.',
        costText: 'All city taxpayers pay for enforcement officers. Abandoned or stored cars linger on the curb.'
      };
    }
    return {
      questionNumber: 5,
      questionTitle: question.text,
      hasAnswer: false,
      tradeoffRationale: 'Decide whether parking violators or all property taxpayers fund enforcement.',
      curbsideImpactSummary: 'Determines how frequently street stalls are patrolled.',
      benefitText: 'Understand who funds city parking officers.',
      costText: 'Select an answer to see the community trade-off.'
    };
  }

  if (question.id === 'q6') {
    if (selectedAnswerId === 'q6_a') {
      return {
        questionNumber: 6,
        questionTitle: question.text,
        hasAnswer: true,
        selectedOptionLabel: selectedOption?.label || 'Paid parking & time limits',
        deltaStallsText: '-2.5 stalls (-16%)',
        deltaStallsValue: -2.5,
        tradeoffRationale: 'Time limits stop hospital and university commuters from taking residential spots.',
        curbsideImpactSummary: 'Keeps traffic flowing and eliminates circling commuter vehicles.',
        benefitText: 'Stops commuter overflow and keeps residential streets quiet and open for locals.',
        costText: 'Hospital visitors, patients, and students must pay to park on nearby residential streets.'
      };
    }
    if (selectedAnswerId === 'q6_b') {
      return {
        questionNumber: 6,
        questionTitle: question.text,
        hasAnswer: true,
        selectedOptionLabel: selectedOption?.label || 'Free & unenforced',
        deltaStallsText: '+3.5 stalls (+22%)',
        deltaStallsValue: +3.5,
        tradeoffRationale: 'Commuters flood residential streets seeking free parking rather than paid lots.',
        curbsideImpactSummary: 'Severe congestion with 4 to 5 vehicles circling looking for spots.',
        benefitText: 'Free parking for patients, hospital visitors, and university students.',
        costText: 'Residential streets stay jammed from morning to night with loud circling cars and exhaust.'
      };
    }
    return {
      questionNumber: 6,
      questionTitle: question.text,
      hasAnswer: false,
      tradeoffRationale: 'Decide how to protect residential streets near major traffic hubs.',
      curbsideImpactSummary: 'Controls commuter spillover and circling traffic.',
      benefitText: 'See how hospital and university traffic impacts nearby homes.',
      costText: 'Select an answer to see the community trade-off.'
    };
  }

  if (question.id === 'q7') {
    if (selectedAnswerId === 'q7_a') {
      return {
        questionNumber: 7,
        questionTitle: question.text,
        hasAnswer: true,
        selectedOptionLabel: selectedOption?.label || 'Strict eligibility & enforcement',
        deltaStallsText: '-1.0 stall (-6%)',
        deltaStallsValue: -1.0,
        tradeoffRationale: 'Accessible curb stalls remain protected for residents and guests with mobility permits.',
        curbsideImpactSummary: 'Ensures equitable access and maintains driveway sightlines.',
        benefitText: 'Guarantees that people with disabilities always have safe, open parking near homes and event venues.',
        costText: 'Drivers must display valid government disability placards or receive heavy fines.'
      };
    }
    if (selectedAnswerId === 'q7_b') {
      return {
        questionNumber: 7,
        questionTitle: question.text,
        hasAnswer: true,
        selectedOptionLabel: selectedOption?.label || 'No event enforcement',
        deltaStallsText: '+1.5 stalls (+10%)',
        deltaStallsValue: +1.5,
        tradeoffRationale: 'Event attendees encroach on accessible stalls and block driveway sightlines.',
        curbsideImpactSummary: 'Restricts mobility access and increases safety hazards.',
        benefitText: 'Less aggressive ticketing and fewer officers on patrol during major community events.',
        costText: 'Accessible spots are taken by non-disabled eventgoers, forcing disabled residents to park blocks away.'
      };
    }
    return {
      questionNumber: 7,
      questionTitle: question.text,
      hasAnswer: false,
      tradeoffRationale: 'Choose enforcement policy for accessible curbside stalls during events.',
      curbsideImpactSummary: 'Protects mobility zones during peak neighbourhood events.',
      benefitText: 'Protect accessible parking for people with mobility needs.',
      costText: 'Select an answer to see the community trade-off.'
    };
  }

  if (question.id === 'q8') {
    if (selectedAnswerId === 'q8_a') {
      return {
        questionNumber: 8,
        questionTitle: question.text,
        hasAnswer: true,
        selectedOptionLabel: selectedOption?.label || 'City-wide standardized rules',
        deltaStallsText: '-1.0 stall (-6%)',
        deltaStallsValue: -1.0,
        tradeoffRationale: 'Consistent city-wide parking rules prevent drivers from dodging restrictions onto adjacent blocks.',
        curbsideImpactSummary: 'Prevents parking spillover onto unregulated neighbouring streets.',
        benefitText: 'Clear, consistent rules across Edmonton prevent parking problems from spilling onto the next street.',
        costText: 'Neighbourhoods have less freedom to create unique local rules.'
      };
    }
    if (selectedAnswerId === 'q8_b') {
      return {
        questionNumber: 8,
        questionTitle: question.text,
        hasAnswer: true,
        selectedOptionLabel: selectedOption?.label || 'Block-by-block opt-in',
        deltaStallsText: '+2.0 stalls (+13%)',
        deltaStallsValue: +2.0,
        tradeoffRationale: 'Unregulated blocks absorb overflow from nearby restricted blocks.',
        curbsideImpactSummary: 'Increases parking spillover pressure on unregulated blocks.',
        benefitText: 'Each neighbourhood or block can customize rules to fit their specific street needs.',
        costText: 'Unregulated blocks get crowded with cars dodging restrictions from nearby streets.'
      };
    }
    return {
      questionNumber: 8,
      questionTitle: question.text,
      hasAnswer: false,
      tradeoffRationale: 'Choose between city-wide standardized rules and block-by-block opt-in.',
      curbsideImpactSummary: 'Determines whether parking restrictions push cars to neighbouring streets.',
      benefitText: 'Compare city-wide consistency with local block choice.',
      costText: 'Select an answer to see the community trade-off.'
    };
  }

  // Location question (q0 or q9 - Postal code & Neighbourhood layout)
  if (question.id === 'q0' || question.id === 'q9' || question.type === 'text') {
    if (selectedAnswerId) {
      const isOptOut = selectedAnswerId === 'OPT_OUT';
      const layout = isOptOut ? 'mature_laned' : getTypologyFromPostalCode(selectedAnswerId);
      const layoutInfo = getStreetLayoutInfo(layout);
      return {
        questionNumber: 0,
        questionTitle: question.text,
        hasAnswer: true,
        selectedOptionLabel: isOptOut ? 'Location Opted Out' : layoutInfo.title,
        deltaStallsText: `${layoutInfo.curbsideCapacity} Stalls Capacity`,
        deltaStallsValue: layoutInfo.curbsideCapacity,
        tradeoffRationale: isOptOut
          ? 'Using standard Mature Laned baseline. Your feedback is kept anonymous.'
          : `Predetermined street model: ${layoutInfo.title} (${layoutInfo.era}). ${layoutInfo.subtitle}. Legal curbside capacity: ${layoutInfo.curbsideCapacity} stalls.`,
        curbsideImpactSummary: `Predetermined street model calibrated to ${layoutInfo.curbsideCapacity} legal curbside stalls (${layoutInfo.drivewayType}).`
      };
    }

    return {
      questionNumber: 0,
      questionTitle: question.text,
      hasAnswer: false,
      tradeoffRationale: 'Share your Edmonton postal code or neighbourhood first to predetermine your street layout type and show the simulation closest to your neighbourhood.',
      curbsideImpactSummary: 'Data is protected under FOIP k-anonymity privacy guidelines.'
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
