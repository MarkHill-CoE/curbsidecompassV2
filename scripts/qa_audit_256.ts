/**
 * Curbside Compass - Automated 256 Scenario QA Test Suite
 * 
 * Tests all 2^8 = 256 discrete answer permutations across Questions 1-8
 * against the 16 persona result profiles in PERSONA_PROFILES.
 */

import { SURVEY_QUESTIONS, PERSONA_PROFILES, calculatePersona } from '../src/data/surveyData';

export interface QAResult {
  scenarioIndex: number;
  binaryKey: string;
  answers: Record<string, string>;
  totalX: number;
  totalY: number;
  personaId: string;
  personaTitle: string;
  quadrant: string;
}

export function runFullQASuite() {
  const choiceQuestions = SURVEY_QUESTIONS.filter(q => q.options && q.options.length > 0);
  if (choiceQuestions.length !== 8) {
    throw new Error(`Expected 8 choice questions, found ${choiceQuestions.length}`);
  }

  const results: QAResult[] = [];
  const personaCounts: Record<string, number> = {};
  const quadrantCounts: Record<string, number> = { Q1: 0, Q2: 0, Q3: 0, Q4: 0 };

  Object.keys(PERSONA_PROFILES).forEach(k => {
    personaCounts[PERSONA_PROFILES[k].id] = 0;
  });

  for (let i = 0; i < 256; i++) {
    let totalX = 0;
    let totalY = 0;
    const answers: Record<string, string> = {};
    const comboCodes: string[] = [];

    for (let q = 0; q < 8; q++) {
      const bit = (i >> (7 - q)) & 1;
      const question = choiceQuestions[q];
      const selectedOption = question.options[bit];
      totalX += selectedOption.x;
      totalY += selectedOption.y;
      answers[question.id] = selectedOption.id;
      comboCodes.push(bit === 0 ? 'A' : 'B');
    }

    const persona = calculatePersona(totalX, totalY);
    personaCounts[persona.id] = (personaCounts[persona.id] || 0) + 1;
    quadrantCounts[persona.quadrant] = (quadrantCounts[persona.quadrant] || 0) + 1;

    results.push({
      scenarioIndex: i + 1,
      binaryKey: comboCodes.join(''),
      answers,
      totalX,
      totalY,
      personaId: persona.id,
      personaTitle: persona.title,
      quadrant: persona.quadrant
    });
  }

  return { results, personaCounts, quadrantCounts };
}

// Self-executing runner
const { results, personaCounts, quadrantCounts } = runFullQASuite();

console.log('================================================================');
console.log('       CURBSIDE COMPASS 256 SCENARIO QA AUDIT REPORT            ');
console.log('================================================================\n');

console.log('1. PERSONA COVERAGE SUMMARY (Target: 16 Unique Personas):');
console.log('----------------------------------------------------------------');
const sorted = Object.entries(personaCounts).sort((a, b) => b[1] - a[1]);
sorted.forEach(([id, count]) => {
  const pct = ((count / 256) * 100).toFixed(1);
  const status = count === 0 ? '❌ UNREACHABLE' : '✓ Active';
  const bar = '■'.repeat(Math.round(count / 2));
  console.log(`${id.padEnd(19)}: ${String(count).padStart(2)}/256 (${pct.padStart(5)}%) [${status}] ${bar}`);
});

console.log('\n2. UNREACHABLE PERSONAS (CRITICAL BUG):');
console.log('----------------------------------------------------------------');
const unreachables = sorted.filter(([_, count]) => count === 0);
if (unreachables.length > 0) {
  unreachables.forEach(([id]) => {
    console.log(`⚠️  ${id} has 0 hits across all 256 possible survey combinations!`);
  });
} else {
  console.log('All 16 personas are reachable.');
}

console.log('\n3. QUADRANT DISTRIBUTION:');
console.log('----------------------------------------------------------------');
Object.entries(quadrantCounts).forEach(([q, count]) => {
  const pct = ((count / 256) * 100).toFixed(1);
  console.log(`${q}: ${count} scenarios (${pct}%)`);
});

console.log('\n4. EXTREME SCENARIO CHECKS:');
console.log('----------------------------------------------------------------');
const allA = results.find(r => r.binaryKey === 'AAAAAAAA');
const allB = results.find(r => r.binaryKey === 'BBBBBBBB');
console.log(`All "A" Answers: totalX = ${allA?.totalX}, totalY = ${allA?.totalY} => ${allA?.personaTitle} (${allA?.personaId})`);
console.log(`All "B" Answers: totalX = ${allB?.totalX}, totalY = ${allB?.totalY} => ${allB?.personaTitle} (${allB?.personaId})`);
