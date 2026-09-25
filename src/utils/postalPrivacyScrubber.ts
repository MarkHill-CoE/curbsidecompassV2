/**
 * City of Edmonton Curbside Compass - Postal Code Privacy & K-Anonymity Engine
 * 
 * Strict Personal Private Information (PII) Rule:
 * Under Statistics Canada and municipal FOIP (Freedom of Information and Protection of Privacy)
 * cell suppression standards, individual 6-character postal codes (e.g., T5J 2R7) can locate
 * a small cluster of households, a cul-de-sac, or an apartment building.
 * 
 * RULE:
 * If at the end of the survey period an individual postal code has fewer than 20 entries (count < 20),
 * the last three characters (the Local Delivery Unit / LDU) MUST be scrubbed, keeping ONLY the first
 * three characters (the Forward Sortation Area / FSA, e.g. "T5J") to guarantee k-anonymity (k >= 20)
 * and eliminate any possibility of reverse-tracing individuals.
 */

export interface PostalCodeParseResult {
  raw: string;
  normalized: string;
  fsa: string;
  ldu: string;
  isValidCanadian: boolean;
  isOptOut: boolean;
}

export interface PostalScrubAuditReport {
  totalRecords: number;
  optOutCount: number;
  invalidCount: number;
  uniqueFullPostalCodes: number;
  codesPreservedAtOrAbove20: string[];
  codesScrubbedUnder20: string[];
  recordsScrubbedCount: number;
  recordsPreservedCount: number;
  thresholdApplied: number;
  timestamp: string;
}

/**
 * Standardizes Canadian postal code formats into normalized FSA and LDU components.
 * e.g., "t5j 2r7", "T5J2R7", "t5j-2r7" => FSA: "T5J", LDU: "2R7", normalized: "T5J 2R7"
 */
export function parseAndNormalizePostalCode(raw: string | undefined | null): PostalCodeParseResult {
  if (!raw || typeof raw !== 'string') {
    return {
      raw: '',
      normalized: '',
      fsa: '',
      ldu: '',
      isValidCanadian: false,
      isOptOut: false
    };
  }

  const trimmed = raw.trim().toUpperCase();
  if (trimmed === 'OPT_OUT' || trimmed === 'OPTOUT' || trimmed === 'PREFER NOT TO SAY') {
    return {
      raw: trimmed,
      normalized: 'OPT_OUT',
      fsa: 'OPT_OUT',
      ldu: '',
      isValidCanadian: false,
      isOptOut: true
    };
  }

  // Remove spaces, hyphens, and non-alphanumerics
  const cleanAlphaNum = trimmed.replace(/[^A-Z0-9]/g, '');

  // 3-character FSA only already (e.g. "T5J")
  if (cleanAlphaNum.length === 3 && /^[A-Z][0-9][A-Z]$/.test(cleanAlphaNum)) {
    return {
      raw: trimmed,
      normalized: cleanAlphaNum,
      fsa: cleanAlphaNum,
      ldu: '',
      isValidCanadian: true,
      isOptOut: false
    };
  }

  // Standard 6-character Canadian Postal Code (e.g. "T5J2R7")
  if (cleanAlphaNum.length === 6 && /^[A-Z][0-9][A-Z][0-9][A-Z][0-9]$/.test(cleanAlphaNum)) {
    const fsa = cleanAlphaNum.slice(0, 3);
    const ldu = cleanAlphaNum.slice(3, 6);
    return {
      raw: trimmed,
      normalized: `${fsa} ${ldu}`,
      fsa,
      ldu,
      isValidCanadian: true,
      isOptOut: false
    };
  }

  // Non-standard or partial input
  return {
    raw: trimmed,
    normalized: cleanAlphaNum.slice(0, 7),
    fsa: cleanAlphaNum.slice(0, 3),
    ldu: cleanAlphaNum.slice(3, 6),
    isValidCanadian: false,
    isOptOut: false
  };
}

/**
 * Scrubs the last three characters (LDU) of a postal code, returning strictly the 3-character FSA.
 * e.g., "T5J 2R7" -> "T5J"
 */
export function scrubToFSA(postalCode: string): string {
  const parsed = parseAndNormalizePostalCode(postalCode);
  if (parsed.isOptOut) return 'OPT_OUT';
  if (!parsed.fsa) return '';
  return parsed.fsa;
}

export interface RecordWithPostalCode {
  id?: string;
  postalCode?: string;
  fsa?: string;
  isPostalScrubbed?: boolean;
  scrubReason?: string;
  [key: string]: unknown;
}

/**
 * Applies k-anonymity (k >= 20) cell suppression to a dataset of survey records:
 * 
 * 1. Groups and tallies records by full 6-character postal code.
 * 2. If an individual postal code has fewer than 20 entries (count < 20):
 *    - The last three characters are scrubbed, retaining ONLY the 3-character FSA.
 *    - Marked with `isPostalScrubbed: true` and `scrubReason: 'k_anonymity_under_20_entries'`.
 * 3. If an individual postal code has 20 or more entries (count >= 20):
 *    - The full postal code is retained (meets k-anonymity privacy threshold).
 *    - Marked with `isPostalScrubbed: false`.
 */
export function applyKAnonymityPostalScrub<T extends RecordWithPostalCode>(
  records: T[],
  threshold = 20
): {
  scrubbedRecords: T[];
  auditReport: PostalScrubAuditReport;
} {
  const frequencyMap = new Map<string, number>();
  let optOutCount = 0;
  let invalidCount = 0;

  // Pass 1: Count occurrences of each full normalized postal code
  for (const record of records) {
    const parsed = parseAndNormalizePostalCode(record.postalCode);
    if (parsed.isOptOut) {
      optOutCount++;
      continue;
    }
    if (!parsed.isValidCanadian || parsed.normalized.length < 6) {
      invalidCount++;
      continue;
    }
    const fullCode = parsed.normalized;
    frequencyMap.set(fullCode, (frequencyMap.get(fullCode) || 0) + 1);
  }

  const codesPreservedAtOrAbove20: string[] = [];
  const codesScrubbedUnder20: string[] = [];

  for (const [code, count] of frequencyMap.entries()) {
    if (count >= threshold) {
      codesPreservedAtOrAbove20.push(`${code} (${count} entries)`);
    } else {
      codesScrubbedUnder20.push(`${code} (${count} entries < ${threshold})`);
    }
  }

  let recordsScrubbedCount = 0;
  let recordsPreservedCount = 0;

  // Pass 2: Scrub records where full code count < threshold
  const scrubbedRecords = records.map((record) => {
    const parsed = parseAndNormalizePostalCode(record.postalCode);

    // If opted out, preserve opt-out flag and FSA as OPT_OUT
    if (parsed.isOptOut) {
      return {
        ...record,
        postalCode: 'OPT_OUT',
        fsa: 'OPT_OUT',
        isPostalScrubbed: false
      };
    }

    // If already just 3 characters FSA or partial
    if (parsed.normalized.length <= 3) {
      return {
        ...record,
        postalCode: parsed.fsa,
        fsa: parsed.fsa,
        isPostalScrubbed: true,
        scrubReason: 'submitted_as_fsa_only'
      };
    }

    const fullCode = parsed.normalized;
    const count = frequencyMap.get(fullCode) || 0;

    if (count < threshold) {
      // Under threshold: Scrub last 3 characters, keep only first 3 characters (FSA)
      recordsScrubbedCount++;
      return {
        ...record,
        postalCode: parsed.fsa, // Only first three characters retained!
        fsa: parsed.fsa,
        isPostalScrubbed: true,
        scrubReason: `k_anonymity_under_${threshold}_entries`
      };
    } else {
      // At or above threshold (>= 20): Meets k-anonymity privacy standard
      recordsPreservedCount++;
      return {
        ...record,
        postalCode: parsed.normalized,
        fsa: parsed.fsa,
        isPostalScrubbed: false
      };
    }
  });

  const auditReport: PostalScrubAuditReport = {
    totalRecords: records.length,
    optOutCount,
    invalidCount,
    uniqueFullPostalCodes: frequencyMap.size,
    codesPreservedAtOrAbove20,
    codesScrubbedUnder20,
    recordsScrubbedCount,
    recordsPreservedCount,
    thresholdApplied: threshold,
    timestamp: new Date().toISOString()
  };

  return {
    scrubbedRecords,
    auditReport
  };
}
