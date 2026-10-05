import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, Firestore, doc, getDocFromServer } from 'firebase/firestore';
import { getAuth, Auth, signInAnonymously } from 'firebase/auth';

// Firebase configuration provided by user / environment variables
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCWiWWa5XsmkKeuB7XTGvS6WTMCuNt1zu8",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "apps-parking-tradeoff-tool-dev.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "apps-parking-tradeoff-tool-dev",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "apps-parking-tradeoff-tool-dev.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1073690749503",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1073690749503:web:d3d0c0dd5c15047ba4668a",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-GTSPXG6VD9"
};

let dbInstance: Firestore | null = null;
let authInstance: Auth | null = null;
let anonymousAuthDisabled = false;
let connectionTested = false;

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
 * Validates connection to Firestore backend as per Firebase Integration specifications
 */
export async function testConnection(): Promise<boolean> {
  if (connectionTested) return true;
  connectionTested = true;
  try {
    const db = getDb();
    if (!db) return false;
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Please check your Firebase configuration.");
    }
    return false;
  }
}

/**
 * Ensures user has an anonymous Firebase session for secure submissions if Auth is enabled
 */
export async function ensureAnonymousAuth(): Promise<string | null> {
  if (anonymousAuthDisabled) return null;
  const auth = getFirebaseAuth();
  if (!auth) return null;
  try {
    if (auth.currentUser) {
      return auth.currentUser.uid;
    }
    const userCredential = await signInAnonymously(auth);
    return userCredential.user.uid;
  } catch {
    // If anonymous auth is not activated in Firebase console, disable future retries and fall back cleanly
    anonymousAuthDisabled = true;
    return null;
  }
}

