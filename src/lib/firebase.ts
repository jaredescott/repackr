import { initializeApp, type FirebaseApp } from 'firebase/app';
import {
  getAuth,
  getRedirectResult,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  type Firestore,
} from 'firebase/firestore';
import { stripUndefinedDeep } from './firestoreSerialize';
import type { RepackrCloudState } from '../types';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export function isFirebaseConfigured(): boolean {
  return Boolean(
    firebaseConfig.apiKey &&
      firebaseConfig.projectId &&
      firebaseConfig.appId,
  );
}

let app: FirebaseApp | null = null;
let db: Firestore | null = null;

export function getFirebaseApp(): FirebaseApp | null {
  if (!isFirebaseConfigured()) return null;
  if (!app) app = initializeApp(firebaseConfig);
  return app;
}

export function getDb(): Firestore | null {
  const a = getFirebaseApp();
  if (!a) return null;
  if (!db) db = getFirestore(a);
  return db;
}

export function getFirebaseAuth() {
  const a = getFirebaseApp();
  return a ? getAuth(a) : null;
}

/** Popup auth breaks under strict COOP on github.io; redirect is reliable there. */
export function shouldUseRedirectAuth(): boolean {
  if (typeof window === 'undefined') return false;
  return window.location.hostname.endsWith('github.io');
}

/** Call once on load after returning from Google redirect. */
export async function completeRedirectSignIn(): Promise<User | null> {
  const auth = getFirebaseAuth();
  if (!auth || !shouldUseRedirectAuth()) return null;
  try {
    const result = await getRedirectResult(auth);
    return result?.user ?? null;
  } catch (err) {
    console.error('Google redirect sign-in failed', err);
    return null;
  }
}

export async function signInWithGoogle(): Promise<User | null> {
  const auth = getFirebaseAuth();
  if (!auth) return null;

  const provider = new GoogleAuthProvider();

  if (shouldUseRedirectAuth()) {
    await signInWithRedirect(auth, provider);
    return null;
  }

  const result = await signInWithPopup(auth, provider);
  return result.user;
}

export async function signOutUser(): Promise<void> {
  const auth = getFirebaseAuth();
  if (auth) await signOut(auth);
}

export function subscribeAuth(cb: (user: User | null) => void): () => void {
  const auth = getFirebaseAuth();
  if (!auth) {
    cb(null);
    return () => {};
  }
  return onAuthStateChanged(auth, cb);
}

export async function loadCloudState(userId: string): Promise<RepackrCloudState | null> {
  const firestore = getDb();
  if (!firestore) return null;
  const snap = await getDoc(doc(firestore, 'users', userId, 'data', 'repackr'));
  if (!snap.exists()) return null;
  return snap.data() as RepackrCloudState;
}

export async function saveCloudState(userId: string, state: RepackrCloudState): Promise<void> {
  const firestore = getDb();
  if (!firestore) return;
  const payload = stripUndefinedDeep(state);
  await setDoc(doc(firestore, 'users', userId, 'data', 'repackr'), payload, { merge: true });
}
