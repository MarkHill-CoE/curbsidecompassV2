/**
 * City of Edmonton Curbside Compass
 * End-of-Survey Postal Code K-Anonymity Privacy Scrubber (k >= 20)
 * 
 * Verifies and executes cell suppression rule:
 * If an individual 6-character postal code has fewer than 20 entries across the survey,
 * the last three characters (LDU) MUST be scrubbed, retaining ONLY the first three
 * characters (FSA, e.g. "T5J") to prevent reverse-tracing individuals.
 */

import {
  parseAndNormalizePostalCode,
  applyKAnonymityPostalScrub,
  RecordWithPostalCode
} from '../src/utils/postalPrivacyScrubber';

function runVerificationTest() {
  console.log('================================================================');
  console.log('   CURBSIDE COMPASS POSTAL CODE K-ANONYMITY SCRUBBER (k >= 20)  ');
  console.log('================================================================\n');

  // Generate synthetic test dataset with varying frequencies:
  // - High volume code "T5J 2R7": 25 entries (>= 20 threshold, should NOT be scrubbed)
  // - High volume code "T6G 2E1": 20 entries (== 20 threshold boundary, should NOT be scrubbed)
  // - Boundary code "T5K 1Y2": 19 entries (< 20 threshold boundary, MUST BE SCRUBBED to "T5K")
  // - Low volume code "T5T 1A1": 5 entries (< 20 threshold, MUST BE SCRUBBED to "T5T")
  // - Single entry code "T6E 4S1": 1 entry (< 20 threshold, MUST BE SCRUBBED to "T6E")
  // - Opt-outs: 10 entries (must remain OPT_OUT)

  const sampleRecords: RecordWithPostalCode[] = [];

  // 1. T5J 2R7 (25 entries >= 20)
  for (let i = 0; i < 25; i++) {
    sampleRecords.push({ id: `rec_t5j_${i}`, postalCode: 'T5J 2R7' });
  }

  // 2. T6G 2E1 (20 entries == 20 boundary)
  for (let i = 0; i < 20; i++) {
    sampleRecords.push({ id: `rec_t6g_${i}`, postalCode: 'T6G 2E1' });
  }

  // 3. T5K 1Y2 (19 entries < 20 boundary)
  for (let i = 0; i < 19; i++) {
    sampleRecords.push({ id: `rec_t5k_${i}`, postalCode: 'T5K 1Y2' });
  }

  // 4. T5T 1A1 (5 entries < 20)
  for (let i = 0; i < 5; i++) {
    sampleRecords.push({ id: `rec_t5t_${i}`, postalCode: 'T5T 1A1' });
  }

  // 5. T6E 4S1 (1 entry < 20)
  sampleRecords.push({ id: `rec_t6e_0`, postalCode: 'T6E 4S1' });

  // 6. OPT_OUT (10 entries)
  for (let i = 0; i < 10; i++) {
    sampleRecords.push({ id: `rec_opt_${i}`, postalCode: 'OPT_OUT' });
  }

  console.log(`Generated synthetic dataset of ${sampleRecords.length} records.`);
  console.log('Applying K-Anonymity threshold (k = 20)...\n');

  const { scrubbedRecords, auditReport } = applyKAnonymityPostalScrub(sampleRecords, 20);

  console.log('AUDIT SUMMARY:');
  console.log('----------------------------------------------------------------');
  console.log(`Total Records Processed   : ${auditReport.totalRecords}`);
  console.log(`Opt-Out Records           : ${auditReport.optOutCount}`);
  console.log(`Unique Postal Codes Input : ${auditReport.uniqueFullPostalCodes}`);
  console.log(`Codes Preserved (>= 20)   : ${auditReport.codesPreservedAtOrAbove20.join(', ')}`);
  console.log(`Codes Scrubbed (< 20)     : ${auditReport.codesScrubbedUnder20.join(', ')}`);
  console.log(`Records Scrubbed to FSA   : ${auditReport.recordsScrubbedCount}`);
  console.log(`Records Preserved in Full : ${auditReport.recordsPreservedCount}`);
  console.log('----------------------------------------------------------------\n');

  // Verify assertions
  let assertionsPassed = true;

  // Check T5J 2R7 (must stay full)
  const t5jRecords = scrubbedRecords.filter(r => (r.id as string).startsWith('rec_t5j_'));
  const allT5JPreserved = t5jRecords.every(r => r.postalCode === 'T5J 2R7' && !r.isPostalScrubbed && r.fsa === 'T5J');
  if (allT5JPreserved) {
    console.log('✓ PASS: T5J 2R7 (25 entries >= 20) preserved in full.');
  } else {
    console.error('✗ FAIL: T5J 2R7 should not have been scrubbed.');
    assertionsPassed = false;
  }

  // Check T6G 2E1 (boundary 20 entries, must stay full)
  const t6gRecords = scrubbedRecords.filter(r => (r.id as string).startsWith('rec_t6g_'));
  const allT6GPreserved = t6gRecords.every(r => r.postalCode === 'T6G 2E1' && !r.isPostalScrubbed && r.fsa === 'T6G');
  if (allT6GPreserved) {
    console.log('✓ PASS: T6G 2E1 (20 entries == 20) preserved in full.');
  } else {
    console.error('✗ FAIL: T6G 2E1 (20 entries) should be preserved.');
    assertionsPassed = false;
  }

  // Check T5K 1Y2 (19 entries < 20, MUST be scrubbed to "T5K")
  const t5kRecords = scrubbedRecords.filter(r => (r.id as string).startsWith('rec_t5k_'));
  const allT5KScrubbed = t5kRecords.every(r => r.postalCode === 'T5K' && r.isPostalScrubbed && r.fsa === 'T5K');
  if (allT5KScrubbed) {
    console.log('✓ PASS: T5K 1Y2 (19 entries < 20) successfully scrubbed to first 3 characters "T5K".');
  } else {
    console.error('✗ FAIL: T5K 1Y2 (19 entries) was not scrubbed to FSA.');
    assertionsPassed = false;
  }

  // Check T5T 1A1 (5 entries < 20, MUST be scrubbed to "T5T")
  const t5tRecords = scrubbedRecords.filter(r => (r.id as string).startsWith('rec_t5t_'));
  const allT5TScrubbed = t5tRecords.every(r => r.postalCode === 'T5T' && r.isPostalScrubbed && r.fsa === 'T5T');
  if (allT5TScrubbed) {
    console.log('✓ PASS: T5T 1A1 (5 entries < 20) successfully scrubbed to first 3 characters "T5T".');
  } else {
    console.error('✗ FAIL: T5T 1A1 (5 entries) was not scrubbed to FSA.');
    assertionsPassed = false;
  }

  // Check T6E 4S1 (1 entry < 20, MUST be scrubbed to "T6E")
  const t6eRecord = scrubbedRecords.find(r => r.id === 'rec_t6e_0');
  if (t6eRecord?.postalCode === 'T6E' && t6eRecord.isPostalScrubbed && t6eRecord.fsa === 'T6E') {
    console.log('✓ PASS: T6E 4S1 (1 entry < 20) successfully scrubbed to first 3 characters "T6E".');
  } else {
    console.error('✗ FAIL: T6E 4S1 (1 entry) was not scrubbed.');
    assertionsPassed = false;
  }

  // Check OPT_OUT
  const optRecords = scrubbedRecords.filter(r => (r.id as string).startsWith('rec_opt_'));
  const allOptMaintained = optRecords.every(r => r.postalCode === 'OPT_OUT' && r.fsa === 'OPT_OUT');
  if (allOptMaintained) {
    console.log('✓ PASS: OPT_OUT records preserved as OPT_OUT.');
  } else {
    console.error('✗ FAIL: OPT_OUT records altered.');
    assertionsPassed = false;
  }

  if (assertionsPassed) {
    console.log('\n================================================================');
    console.log('  ALL K-ANONYMITY POSTAL SCRUBBER PRIVACY TESTS PASSED (100%)   ');
    console.log('================================================================');
  } else {
    console.error('\nERROR: One or more assertions failed.');
    process.exit(1);
  }
}

runVerificationTest();
