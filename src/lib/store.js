// Storage helper for Data Engineer Interview Prep
// LocalStorage for structured metadata + IndexedDB for high-res infographics/images

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
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.put(blobOrDataUrl, id);
    request.onsuccess = () => resolve(id);
    request.onerror = () => reject(request.error);
  });
}

// Get image blob from IndexedDB (returns Blob or DataURL)
export async function getImageBlob(id) {
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

// Delete image from IndexedDB
export async function deleteImageBlob(id) {
  if (!id) return;
  const db = await openImageDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
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

export function getStoredData(key, fallback = []) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    console.error(`Failed to load ${key}:`, e);
    return fallback;
  }
}

export function setStoredData(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
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

