import { getApps, initializeApp } from 'firebase/app';
import {
  GoogleAuthProvider,
  getAuth,
  signInWithPopup,
  signOut
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { firebaseConfig, firebaseConfigured } from './firebaseConfig';

export { firebaseConfig, firebaseConfigured };

const firebaseApp = firebaseConfigured
  ? (getApps()[0] || initializeApp(firebaseConfig))
  : null;

export const auth = firebaseApp ? getAuth(firebaseApp) : null;
export const firestore = firebaseApp ? getFirestore(firebaseApp) : null;
export const storage = firebaseApp ? getStorage(firebaseApp) : null;

export function signInWithGoogle() {
  if (!auth) throw new Error('Firebase is not configured for this app.');
  return signInWithPopup(auth, new GoogleAuthProvider());
}

export function signOutFromFirebase() {
  if (!auth) return Promise.resolve();
  return signOut(auth);
}
