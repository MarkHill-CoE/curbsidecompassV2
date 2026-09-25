/**
 * Security & Data Governance Sanitizer for City of Edmonton Curbside Compass
 * 
 * Provides defense-in-depth protection for open text feedback inputs:
 * 1. PII Detection & Redaction (FOIP / Privacy Act compliance)
 * 2. Formula Injection Neutralization (CWE-1236 CSV / Spreadsheet Injection defense)
 * 3. Unicode Control Character & Trojan Source / BiDi Override Stripping
 * 4. Stored XSS & Script Tag Neutralization
 * 5. String Bounds & Length Enforcement
 */

// Matches email patterns (e.g., user@edmonton.ca)
const EMAIL_REGEX = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;

// Matches North American phone number patterns (e.g. 780-555-1234, (780) 555-1234, +1 780 555 1234)
const PHONE_REGEX = /\b(?:\+?1[-.\s]?)?\(?[2-9]\d{2}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g;

// Unprintable ASCII control characters (excluding newline \n and carriage return \r)
// \x00-\x08, \x0B, \x0C, \x0E-\x1F, \x7F
const CONTROL_CHARS_REGEX = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g;

// Unicode Directional / Trojan Source override characters (CVE-2021-42574)
// \u202A-\u202E (LRE, RLE, PDF, LRO, RLO)
// \u2066-\u2069 (LRI, RLI, FSI, PDI)
// \u200B-\u200D (Zero-width spaces/joiners)
// \uFEFF (Byte order mark)
const BIDI_OVERRIDE_REGEX = /[\u202A-\u202E\u2066-\u2069\u200B-\u200D\uFEFF]/g;

// Spreadsheet Formula Injection prefixes (OWASP / CWE-1236)
const FORMULA_PREFIX_REGEX = /^[=+\-@\t\r]/;

export interface PIIDetectionResult {
  hasPII: boolean;
  hasEmail: boolean;
  hasPhone: boolean;
  warningMessage?: string;
}

/**
 * Detects whether an open text input contains Personally Identifiable Information (PII).
 * Used in real-time UI feedback to caution respondents before submission.
 */
export function detectPII(text: string): PIIDetectionResult {
  if (!text || typeof text !== 'string') {
    return { hasPII: false, hasEmail: false, hasPhone: false };
  }

  const hasEmail = EMAIL_REGEX.test(text);
  // Reset regex state
  EMAIL_REGEX.lastIndex = 0;

  const hasPhone = PHONE_REGEX.test(text);
  PHONE_REGEX.lastIndex = 0;

  const hasPII = hasEmail || hasPhone;

  let warningMessage: string | undefined;
  if (hasEmail && hasPhone) {
    warningMessage = 'Notice: Please remove email addresses and phone numbers for your privacy under municipal FOIP guidelines.';
  } else if (hasEmail) {
    warningMessage = 'Notice: Please remove email addresses for your privacy under municipal FOIP guidelines.';
  } else if (hasPhone) {
    warningMessage = 'Notice: Please remove phone numbers for your privacy under municipal FOIP guidelines.';
  }

  return {
    hasPII,
    hasEmail,
    hasPhone,
    warningMessage
  };
}

/**
 * Redacts unsolicited PII (emails and phone numbers) to ensure FOIP compliance.
 */
export function redactPII(text: string): string {
  if (!text || typeof text !== 'string') return '';
  return text
    .replace(EMAIL_REGEX, '[REDACTED EMAIL]')
    .replace(PHONE_REGEX, '[REDACTED PHONE]');
}

/**
 * Sanitizes open text input for secure storage and spreadsheet export.
 * 
 * - Removes unprintable control characters and BiDi Trojan Source characters.
 * - Neutralizes formula injection by prepending an apostrophe if text begins with =, +, -, @.
 * - Strips dangerous HTML tags (<script>, <iframe>, <object>, <embed>).
 * - Enforces character length boundaries.
 */
export function sanitizeOpenTextInput(input: unknown, maxLength = 500, autoRedactPII = true): string {
  if (typeof input !== 'string') {
    return '';
  }

  let sanitized = input;

  // 1. Remove control characters and BiDi override characters
  sanitized = sanitized.replace(CONTROL_CHARS_REGEX, '');
  sanitized = sanitized.replace(BIDI_OVERRIDE_REGEX, '');

  // 2. Strip dangerous HTML script and execution tags
  sanitized = sanitized.replace(/<\s*(?:script|iframe|object|embed|style|meta|link)[^>]*>.*?<\s*\/\s*(?:script|iframe|object|embed|style|meta|link)\s*>/gis, '');
  sanitized = sanitized.replace(/<\s*(?:script|iframe|object|embed|style|meta|link)[^>]*\/?>/gis, '');

  // 3. Optional FOIP redaction
  if (autoRedactPII) {
    sanitized = redactPII(sanitized);
  }

  // 4. Trim whitespace and enforce length bound
  sanitized = sanitized.trim().slice(0, maxLength);

  // 5. Neutralize spreadsheet formula injection (CWE-1236)
  // If the string begins with =, +, -, @, or tab/return, prepend an apostrophe (')
  // so Excel, Google Sheets, or CSV parsers treat it strictly as plaintext rather than an executable formula.
  if (FORMULA_PREFIX_REGEX.test(sanitized)) {
    sanitized = `'${sanitized}`;
  }

  return sanitized.slice(0, maxLength + 1);
}
