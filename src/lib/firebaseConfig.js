const env = import.meta.env;

export const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY?.trim(),
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN?.trim(),
  projectId: env.VITE_FIREBASE_PROJECT_ID?.trim(),
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET?.trim(),
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID?.trim(),
  appId: env.VITE_FIREBASE_APP_ID?.trim()
};

const requiredConfigKeys = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'appId'];
export const firebaseConfigured = requiredConfigKeys.every((key) => Boolean(firebaseConfig[key]));
