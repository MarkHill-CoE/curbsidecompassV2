import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth, signInAnonymously } from 'firebase/auth';

// Firebase configuration provided by user / environment variables
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCWiWWa5XsmkKeuB7XTGvS6WTMCuNt1zu8",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "apps-parking-tradeoff-dev.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "apps-parking-tradeoff-dev",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "apps-parking-tradeoff-dev.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1073690749503",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1073690749503:web:d3d0c0dd5c15047ba4668a",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-GTSPXG6VD9"
};

let dbInstance: Firestore | null = null;
let authInstance: Auth | null = null;
let initError: string | null = null;

export function getFirebaseApp() {
  if (getApps().length > 0) {
    return getApp();
  }
  return initializeApp(firebaseConfig);
}

export function getDb(): Firestore | null {
  if (dbInstance) return dbInstance;
  try {
    const app = getFirebaseApp();
    dbInstance = getFirestore(app);
    return dbInstance;
  } catch (err) {
    console.warn('[Firebase] Firestore init notice:', err);
    initError = err instanceof Error ? err.message : String(err);
    return null;
  }
}

export function getFirebaseAuth(): Auth | null {
  if (authInstance) return authInstance;
  try {
    const app = getFirebaseApp();
    authInstance = getAuth(app);
    return authInstance;
  } catch (err) {
    console.warn('[Firebase] Auth init notice:', err);
    return null;
  }
}

/**
 * Ensures user has an anonymous Firebase session for secure submissions if Auth is enabled
 */
export async function ensureAnonymousAuth(): Promise<string | null> {
  const auth = getFirebaseAuth();
  if (!auth) return null;
  try {
    if (auth.currentUser) {
      return auth.currentUser.uid;
    }
    const userCredential = await signInAnonymously(auth);
    return userCredential.user.uid;
  } catch (err) {
    console.warn('[Firebase] Anonymous sign-in notice (falling back to client session ID):', err);
    return null;
  }
}
