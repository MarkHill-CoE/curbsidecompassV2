import {
  serverTimestamp,
  doc,
  setDoc,
  collection,
  getDocs,
  writeBatch
} from 'firebase/firestore';
import { getDb, getFirebaseAuth, ensureAnonymousAuth } from '../lib/firebase';
import { PersonaResult, SimulationConfig } from '../types';
import { sanitizeOpenTextInput } from '../utils/securitySanitizer';
import { encryptPostalCode } from '../utils/postalEncryption';
import {
  parseAndNormalizePostalCode,
  applyKAnonymityPostalScrub,
  PostalScrubAuditReport,
  RecordWithPostalCode
} from '../utils/postalPrivacyScrubber';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): FirestoreErrorInfo {
  const auth = getFirebaseAuth();
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid ?? null,
      email: auth?.currentUser?.email ?? null,
      emailVerified: auth?.currentUser?.emailVerified ?? null,
      isAnonymous: auth?.currentUser?.isAnonymous ?? null,
      tenantId: auth?.currentUser?.tenantId ?? null,
      providerInfo: auth?.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.warn(`[Firestore Error: ${operationType} on ${path}]`, JSON.stringify(errInfo));
  return errInfo;
}

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
  encryptedPostalCode?: string;
  fsa?: string;
  neighbourhood?: string;
  isEncrypted?: boolean;
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
 * Saves or updates a completed survey & feedback response to Firestore with strict input bounds checking and AES-256 postal encryption.
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
  const sessionId = getSessionId();
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

    const rawLocation = sanitizedAnswers['q7'] || sanitizedAnswers['q_demographics_fsa'] || sanitizedAnswers['q0'] || sanitizedAnswers['q9'] || '';
    const parsedPostal = parseAndNormalizePostalCode(rawLocation);
    const finalFsa = parsedPostal.isOptOut ? 'OPT_OUT' : (parsedPostal.fsa || '');
    const isAlreadyFsaOnly = !parsedPostal.isOptOut && parsedPostal.normalized.length <= 3;
    
    // Resolve human-readable neighbourhood
    const neighbourhoodName = data.simConfig?.neighbourhoodName || sanitizedAnswers['q7_neighbourhood'] || (parsedPostal.isOptOut ? 'Anonymous' : (parsedPostal.normalized.length <= 3 && rawLocation.length > 3 ? rawLocation : undefined));

    // Perform AES-256-GCM encryption on the full postal code
    let encryptedPostalCode = '';
    if (!parsedPostal.isOptOut && parsedPostal.normalized && parsedPostal.normalized.length >= 3) {
      try {
        encryptedPostalCode = await encryptPostalCode(parsedPostal.normalized);
      } catch (encErr) {
        console.warn('[Postal Encryption] Encryption notice:', encErr);
      }
    }

    // Try ensuring anonymous auth if permitted
    const authUid = await ensureAnonymousAuth();

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
      encryptedPostalCode: encryptedPostalCode || undefined,
      fsa: finalFsa || undefined,
      neighbourhood: neighbourhoodName ? String(neighbourhoodName).slice(0, 80) : undefined,
      isEncrypted: Boolean(encryptedPostalCode),
      isPostalScrubbed: isAlreadyFsaOnly,
      scrubReason: isAlreadyFsaOnly ? 'submitted_as_fsa_only' : undefined,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent.slice(0, 200) : '',
      timestamp: serverTimestamp()
    };

    // Save to local backup in case client is offline or network connection is interrupted
    try {
      localStorage.setItem(`curbside_survey_backup_${sessionId}`, JSON.stringify({
        ...submissionDoc,
        timestamp: new Date().toISOString()
      }));
    } catch {
      // ignore storage limits
    }

    // Use sessionId doc to prevent duplicate submissions per user session, while updating when feedback is submitted
    try {
      const docRef = doc(db, 'survey_responses', sessionId);
      await setDoc(docRef, {
        ...submissionDoc,
        authUid: authUid || null,
        updatedAt: serverTimestamp()
      }, { merge: true });
    } catch (writeErr: unknown) {
      const errStr = writeErr instanceof Error ? writeErr.message : String(writeErr);
      if (errStr.includes('unavailable') || errStr.includes('offline') || errStr.includes('Could not reach')) {
        console.info('[Firebase] Device is offline; response preserved in local storage & offline queue.');
        return { success: true, id: sessionId };
      }
      throw writeErr;
    }

    return { success: true, id: sessionId };
  } catch (err) {
    const errInfo = handleFirestoreError(err, OperationType.WRITE, `survey_responses/${sessionId}`);
    return { success: false, error: errInfo.error };
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
    const errInfo = handleFirestoreError(err, OperationType.WRITE, 'survey_responses');
    return { success: false, error: errInfo.error };
  }
}
