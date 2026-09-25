import {
  serverTimestamp,
  doc,
  setDoc,
  collection,
  getDocs,
  writeBatch
} from 'firebase/firestore';
import { getDb, ensureAnonymousAuth } from '../lib/firebase';
import { PersonaResult, SimulationConfig } from '../types';
import { sanitizeOpenTextInput } from '../utils/securitySanitizer';
import {
  parseAndNormalizePostalCode,
  applyKAnonymityPostalScrub,
  PostalScrubAuditReport,
  RecordWithPostalCode
} from '../utils/postalPrivacyScrubber';

export interface SurveySubmissionData {
  personaId: string;
  personaTitle: string;
  quadrant: string;
  totalX: number;
  totalY: number;
  answers: Record<string, string>;
  simConfig: SimulationConfig;
  rating?: number | null;
  feedback?: string;
  postalCode?: string;
  fsa?: string;
  isPostalScrubbed?: boolean;
  scrubReason?: string;
  userAgent?: string;
  timestamp?: unknown;
}

const STORAGE_SESSION_KEY = 'curbside_compass_session_id';

/**
 * Generates a cryptographically strong or secure random session ID with format validation
 */
export function getSessionId(): string {
  try {
    let sid = localStorage.getItem(STORAGE_SESSION_KEY);
    if (!sid || !/^sess_[a-zA-Z0-9_-]{8,48}$/.test(sid)) {
      let randPart = '';
      if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
        const arr = new Uint8Array(12);
        crypto.getRandomValues(arr);
        randPart = Array.from(arr, b => b.toString(16).padStart(2, '0')).join('');
      } else {
        randPart = Math.random().toString(36).substring(2, 14) + Date.now().toString(36);
      }
      sid = `sess_${randPart}`;
      localStorage.setItem(STORAGE_SESSION_KEY, sid);
    }
    return sid;
  } catch {
    return `sess_${Date.now().toString(36)}`;
  }
}

/**
 * Saves or updates a completed survey & feedback response to Firestore with strict input bounds checking.
 */
export async function saveSurveyResponse(data: {
  persona: PersonaResult;
  totalX: number;
  totalY: number;
  answers: Record<string, string>;
  simConfig: SimulationConfig;
  rating?: number | null;
  feedback?: string;
}): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const db = getDb();
    if (!db) {
      return { success: false, error: 'Firestore is not initialized.' };
    }

    // Input bounds validation (Google standards for defensive persistence)
    const sanitizedTotalX = typeof data.totalX === 'number' && Number.isFinite(data.totalX)
      ? Math.max(-50, Math.min(50, data.totalX))
      : 0;
    const sanitizedTotalY = typeof data.totalY === 'number' && Number.isFinite(data.totalY)
      ? Math.max(-50, Math.min(50, data.totalY))
      : 0;

    const sanitizedRating = typeof data.rating === 'number' && Number.isInteger(data.rating) && data.rating >= 1 && data.rating <= 5
      ? data.rating
      : null;

    const sanitizedFeedback = typeof data.feedback === 'string'
      ? sanitizeOpenTextInput(data.feedback, 500, true)
      : '';

    // Sanitize answers dictionary (limit to max 30 keys, 50 chars per key, 100 chars per value)
    const sanitizedAnswers: Record<string, string> = {};
    if (data.answers && typeof data.answers === 'object') {
      const entries = Object.entries(data.answers).slice(0, 30);
      for (const [k, v] of entries) {
        if (typeof k === 'string' && typeof v === 'string') {
          sanitizedAnswers[k.slice(0, 50)] = v.slice(0, 100);
        }
      }
    }

    const rawPostal = sanitizedAnswers['q_demographics_fsa'] || sanitizedAnswers['q_demographics_fsa_input'] || sanitizedAnswers['q9'] || '';
    const parsedPostal = parseAndNormalizePostalCode(rawPostal);
    const finalPostal = parsedPostal.isOptOut ? 'OPT_OUT' : (parsedPostal.normalized || rawPostal.slice(0, 8));
    const finalFsa = parsedPostal.isOptOut ? 'OPT_OUT' : (parsedPostal.fsa || '');
    const isAlreadyFsaOnly = !parsedPostal.isOptOut && parsedPostal.normalized.length <= 3;

    // Try ensuring anonymous auth if permitted
    const authUid = await ensureAnonymousAuth();
    const sessionId = getSessionId();

    const submissionDoc: SurveySubmissionData = {
      personaId: String(data.persona.id || '').slice(0, 50),
      personaTitle: String(data.persona.title || '').slice(0, 100),
      quadrant: (['Q1', 'Q2', 'Q3', 'Q4'].includes(data.persona.quadrant) ? data.persona.quadrant : 'Q1'),
      totalX: sanitizedTotalX,
      totalY: sanitizedTotalY,
      answers: sanitizedAnswers,
      simConfig: data.simConfig,
      rating: sanitizedRating,
      feedback: sanitizedFeedback,
      postalCode: finalPostal,
      fsa: finalFsa,
      isPostalScrubbed: isAlreadyFsaOnly,
      scrubReason: isAlreadyFsaOnly ? 'submitted_as_fsa_only' : undefined,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent.slice(0, 200) : '',
      timestamp: serverTimestamp()
    };

    // Use sessionId doc to prevent duplicate submissions per user session, while updating when feedback is submitted
    const docRef = doc(db, 'survey_responses', sessionId);
    await setDoc(docRef, {
      ...submissionDoc,
      authUid: authUid || null,
      updatedAt: serverTimestamp()
    }, { merge: true });

    return { success: true, id: sessionId };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn('[Firebase] Failed to persist survey response:', msg);
    return { success: false, error: msg };
  }
}

/**
 * End-of-Survey Batch Scrubbing Routine:
 * Enforces strict Personal Private Information cell suppression rules across all survey responses.
 * 
 * If an individual 6-character postal code has fewer than 20 entries (threshold default = 20):
 * - Scrubs the last three characters, keeping ONLY the first three characters (FSA).
 * - Flags the document with `isPostalScrubbed: true` and `scrubReason: 'k_anonymity_under_20_entries'`.
 * - Commits updates back to Firestore in transactional batches.
 */
export async function scrubFirestoreLowVolumePostalCodes(threshold = 20): Promise<{
  success: boolean;
  auditReport?: PostalScrubAuditReport;
  error?: string;
}> {
  try {
    const db = getDb();
    if (!db) {
      return { success: false, error: 'Firestore is not initialized.' };
    }

    const responsesCol = collection(db, 'survey_responses');
    const snapshot = await getDocs(responsesCol);

    if (snapshot.empty) {
      return {
        success: true,
        auditReport: {
          totalRecords: 0,
          optOutCount: 0,
          invalidCount: 0,
          uniqueFullPostalCodes: 0,
          codesPreservedAtOrAbove20: [],
          codesScrubbedUnder20: [],
          recordsScrubbedCount: 0,
          recordsPreservedCount: 0,
          thresholdApplied: threshold,
          timestamp: new Date().toISOString()
        }
      };
    }

    // Map documents to records
    const records: (RecordWithPostalCode & { _docId: string })[] = [];
    snapshot.forEach((d) => {
      const data = d.data();
      records.push({
        _docId: d.id,
        ...data,
        postalCode: typeof data.postalCode === 'string' ? data.postalCode : ''
      });
    });

    // Run K-Anonymity privacy scrubbing logic
    const { scrubbedRecords, auditReport } = applyKAnonymityPostalScrub(records, threshold);

    // Identify records that require updates in Firestore
    const recordsToUpdate = scrubbedRecords.filter((rec, idx) => {
      const original = records[idx];
      return rec.postalCode !== original.postalCode || rec.isPostalScrubbed !== original.isPostalScrubbed;
    });

    // Commit updates in Firestore batches (max 500 ops per batch)
    const BATCH_LIMIT = 450;
    for (let i = 0; i < recordsToUpdate.length; i += BATCH_LIMIT) {
      const batch = writeBatch(db);
      const chunk = recordsToUpdate.slice(i, i + BATCH_LIMIT);
      for (const item of chunk) {
        const itemRef = doc(db, 'survey_responses', item._docId);
        batch.update(itemRef, {
          postalCode: item.postalCode,
          fsa: item.fsa || item.postalCode,
          isPostalScrubbed: item.isPostalScrubbed,
          scrubReason: item.scrubReason || `k_anonymity_under_${threshold}_entries`,
          updatedAt: serverTimestamp()
        });
      }
      await batch.commit();
    }

    return { success: true, auditReport };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[Firebase] Error executing postal code k-anonymity scrub:', msg);
    return { success: false, error: msg };
  }
}
