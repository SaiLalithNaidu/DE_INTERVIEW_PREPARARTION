// Storage helper for Data Engineer Interview Prep
// Firebase stores the shared data while browser storage remains an offline cache.
import { firebaseConfigured } from './firebaseConfig';

const DB_NAME = 'dep-images';
const DB_VERSION = 1;
const STORE_NAME = 'images';

// Open or create IndexedDB
export function openImageDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror = (event) => reject(event.target.error);
  });
}

// Save image blob to IndexedDB
export async function saveImageBlob(id, blobOrDataUrl) {
  const db = await openImageDB();
  await new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.put(blobOrDataUrl, id);
    request.onsuccess = () => resolve(id);
    request.onerror = () => reject(request.error);
  });

  if (firebaseConfigured) {
    const [{ auth, storage }, storageApi] = await Promise.all([
      import('./firebase'),
      import('firebase/storage')
    ]);
    if (!auth?.currentUser || !storage) return id;
    const imageRef = firebaseImageRef(id, auth.currentUser.uid, storageApi, storage);
    if (typeof blobOrDataUrl === 'string') {
      await storageApi.uploadString(imageRef, blobOrDataUrl, 'data_url');
    } else {
      await storageApi.uploadBytes(imageRef, blobOrDataUrl, {
        contentType: blobOrDataUrl?.type || 'application/octet-stream'
      });
    }
  }
  return id;
}

function firebaseImageRef(id, uid, storageApi, storage) {
  const safeId = encodeURIComponent(String(id));
  return storageApi.ref(storage, `users/${uid}/images/${safeId}`);
}

// Read a locally cached image. Used to migrate existing images into Firebase.
export async function getLocalImageBlob(id) {
  if (!id) return null;
  const db = await openImageDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.get(id);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function hasFirebaseImage(id) {
  if (!id || !firebaseConfigured) return false;
  try {
    const [{ auth, storage }, storageApi] = await Promise.all([
      import('./firebase'),
      import('firebase/storage')
    ]);
    if (!auth?.currentUser || !storage) return false;
    await storageApi.getMetadata(firebaseImageRef(id, auth.currentUser.uid, storageApi, storage));
    return true;
  } catch {
    return false;
  }
}

// Get the local image first, then fetch it from the authenticated user's bucket.
export async function getImageBlob(id) {
  if (!id) return null;
  try {
    const localImage = await getLocalImageBlob(id);
    if (localImage) return localImage;
  } catch (error) {
    console.warn('Could not read the local image cache:', error);
  }

  if (!firebaseConfigured) return null;
  try {
    const [{ auth, storage }, storageApi] = await Promise.all([
      import('./firebase'),
      import('firebase/storage')
    ]);
    if (!auth?.currentUser || !storage) return null;
    const imageRef = firebaseImageRef(id, auth.currentUser.uid, storageApi, storage);
    const [bytes, metadata] = await Promise.all([
      storageApi.getBytes(imageRef),
      storageApi.getMetadata(imageRef)
    ]);
    return new Blob([bytes], { type: metadata.contentType || 'application/octet-stream' });
  } catch (error) {
    console.error('Error loading image from Firebase Storage:', error);
    return null;
  }
}

// Delete image from IndexedDB
export async function deleteImageBlob(id) {
  if (!id) return;
  const db = await openImageDB();
  await new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });

  if (firebaseConfigured) {
    try {
      const [{ auth, storage }, storageApi] = await Promise.all([
        import('./firebase'),
        import('firebase/storage')
      ]);
      if (auth?.currentUser && storage) {
        await storageApi.deleteObject(firebaseImageRef(id, auth.currentUser.uid, storageApi, storage));
      }
    } catch (error) {
      if (error.code !== 'storage/object-not-found') throw error;
    }
  }
}

// --- LocalStorage helpers ---
export const STORAGE_KEYS = {
  SECTIONS: 'dep_sections',
  TOPICS: 'dep_topics',
  QUESTIONS: 'dep_questions',
  BOOKMARKS: 'dep_bookmarks',
  PROGRESS: 'dep_progress',
  INITIALIZED: 'dep_initialized'
};

const CLOUD_SYNC_KEYS = new Set([
  STORAGE_KEYS.SECTIONS,
  STORAGE_KEYS.TOPICS,
  STORAGE_KEYS.QUESTIONS,
  STORAGE_KEYS.BOOKMARKS,
  STORAGE_KEYS.PROGRESS
]);
const CLOUD_PENDING_STORAGE_KEY = 'dep_firebase_pending_keys';

export function getStoredData(key, fallback = []) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    console.error(`Failed to load ${key}:`, e);
    return fallback;
  }
}

export function setStoredData(key, value, { syncCloud = true } = {}) {
  try {
    const serializedValue = JSON.stringify(value);
    localStorage.setItem(key, serializedValue);
    if (syncCloud && firebaseConfigured && CLOUD_SYNC_KEYS.has(key)) {
      const pendingKeys = JSON.parse(localStorage.getItem(CLOUD_PENDING_STORAGE_KEY) || '[]');
      if (!pendingKeys.includes(key)) {
        localStorage.setItem(CLOUD_PENDING_STORAGE_KEY, JSON.stringify([...pendingKeys, key]));
      }
      import('./cloudSync').then(({ persistStoredValue }) => (
        persistStoredValue(key, value, serializedValue)
      )).catch((error) => {
        console.error(`Failed to sync ${key} to Firebase:`, error);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('dep-firebase-status', {
            detail: {
              status: 'error',
              message: 'Firebase could not save the latest changes. A local copy is still available.'
            }
          }));
        }
      });
    }
  } catch (e) {
    console.error(`Failed to save ${key}:`, e);
  }
}

// Bookmarks & Progress
export function getBookmarks() {
  return getStoredData(STORAGE_KEYS.BOOKMARKS, []);
}

export function toggleBookmarkInStore(questionId) {
  const current = getBookmarks();
  let updated;
  if (current.includes(questionId)) {
    updated = current.filter(id => id !== questionId);
  } else {
    updated = [...current, questionId];
  }
  setStoredData(STORAGE_KEYS.BOOKMARKS, updated);
  return updated;
}

export function getProgress() {
  return getStoredData(STORAGE_KEYS.PROGRESS, []);
}

export function toggleProgressInStore(questionId) {
  const current = getProgress();
  let updated;
  if (current.includes(questionId)) {
    updated = current.filter(id => id !== questionId);
  } else {
    updated = [...current, questionId];
  }
  setStoredData(STORAGE_KEYS.PROGRESS, updated);
  return updated;
}

