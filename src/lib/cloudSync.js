import {
  collection,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
  writeBatch
} from 'firebase/firestore';
import {
  auth,
  firebaseConfigured,
  firestore
} from './firebase';
import {
  getLocalImageBlob,
  hasFirebaseImage,
  saveImageBlob,
  STORAGE_KEYS
} from './store';

const COLLECTIONS_BY_STORAGE_KEY = {
  [STORAGE_KEYS.SECTIONS]: 'sections',
  [STORAGE_KEYS.TOPICS]: 'topics',
  [STORAGE_KEYS.QUESTIONS]: 'questions'
};

const STATE_DOCS_BY_STORAGE_KEY = {
  [STORAGE_KEYS.BOOKMARKS]: 'bookmarks',
  [STORAGE_KEYS.PROGRESS]: 'progress'
};

const collectionSnapshots = new Map();
const pendingWrites = new Map();
const MAX_BATCH_OPERATIONS = 450;
const CLOUD_PENDING_STORAGE_KEY = 'dep_firebase_pending_keys';
let readyUserId = null;

function notifyCloudStatus(status, message = '') {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('dep-firebase-status', {
    detail: { status, message }
  }));
}

function cacheKey(userId, collectionName) {
  return `${userId}:${collectionName}`;
}

function firestoreId(id) {
  return encodeURIComponent(String(id));
}

function serializable(value) {
  return JSON.parse(JSON.stringify(value));
}

function stableStringify(value) {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(',')}}`;
  }
  return JSON.stringify(value);
}

function userCollection(userId, collectionName) {
  return collection(firestore, 'users', userId, collectionName);
}

function userStateDoc(userId, stateName) {
  return doc(firestore, 'users', userId, 'appState', stateName);
}

function profileDoc(userId) {
  return doc(firestore, 'users', userId, 'metadata', 'app');
}

function readPendingCloudKeys() {
  try {
    const value = JSON.parse(localStorage.getItem(CLOUD_PENDING_STORAGE_KEY) || '[]');
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function clearPendingCloudKey(storageKey, expectedSerializedValue) {
  if (expectedSerializedValue !== undefined && localStorage.getItem(storageKey) !== expectedSerializedValue) return;
  const remaining = readPendingCloudKeys().filter((key) => key !== storageKey);
  if (remaining.length) localStorage.setItem(CLOUD_PENDING_STORAGE_KEY, JSON.stringify(remaining));
  else localStorage.removeItem(CLOUD_PENDING_STORAGE_KEY);
}

function clearAllPendingCloudKeys() {
  localStorage.removeItem(CLOUD_PENDING_STORAGE_KEY);
}

async function commitOperations(operations) {
  for (let offset = 0; offset < operations.length; offset += MAX_BATCH_OPERATIONS) {
    const batch = writeBatch(firestore);
    const chunk = operations.slice(offset, offset + MAX_BATCH_OPERATIONS);
    for (const operation of chunk) {
      if (operation.type === 'delete') batch.delete(operation.ref);
      else batch.set(operation.ref, operation.data);
    }
    await batch.commit();
  }
}

async function readCollection(userId, collectionName) {
  const snapshot = await getDocs(userCollection(userId, collectionName));
  const entries = snapshot.docs.map((snapshotDoc, index) => {
    const data = snapshotDoc.data();
    const order = Number.isFinite(data.__order) ? data.__order : index;
    const { __order, ...record } = data;
    if (record.id == null) record.id = decodeURIComponent(snapshotDoc.id);
    return { record, order };
  }).sort((left, right) => left.order - right.order);

  const cache = new Map(entries.map(({ record, order }) => [
    String(record.id),
    { ...serializable(record), __order: order }
  ]));
  collectionSnapshots.set(cacheKey(userId, collectionName), cache);
  return entries.map(({ record }) => record);
}

async function replaceCollection(userId, collectionName, records = []) {
  const collectionCacheKey = cacheKey(userId, collectionName);
  if (!collectionSnapshots.has(collectionCacheKey)) {
    await readCollection(userId, collectionName);
  }
  const previous = collectionSnapshots.get(collectionCacheKey) || new Map();
  const next = new Map();
  const operations = [];
  const target = userCollection(userId, collectionName);

  records.forEach((record, index) => {
    if (!record || record.id == null) return;
    const recordId = String(record.id);
    const data = { ...serializable(record), __order: index };
    next.set(recordId, data);

    if (!previous.has(recordId) || stableStringify(previous.get(recordId)) !== stableStringify(data)) {
      operations.push({
        type: 'set',
        ref: doc(target, firestoreId(recordId)),
        data
      });
    }
  });

  for (const recordId of previous.keys()) {
    if (!next.has(recordId)) {
      operations.push({ type: 'delete', ref: doc(target, firestoreId(recordId)) });
    }
  }

  await commitOperations(operations);
  collectionSnapshots.set(collectionCacheKey, next);
}

async function writeStateDoc(userId, stateName, value) {
  await setDoc(userStateDoc(userId, stateName), {
    value: serializable(value),
    updatedAt: serverTimestamp()
  });
}

async function readStateDoc(userId, stateName, fallback) {
  const snapshot = await getDoc(userStateDoc(userId, stateName));
  return snapshot.exists() ? snapshot.data().value : fallback;
}

async function writeAllData(userId, data) {
  await Promise.all([
    replaceCollection(userId, 'sections', data.sections || []),
    replaceCollection(userId, 'topics', data.topics || []),
    replaceCollection(userId, 'questions', data.questions || []),
    writeStateDoc(userId, 'bookmarks', data.bookmarks || []),
    writeStateDoc(userId, 'progress', data.progress || [])
  ]);
}

async function migrateLocalImages(userId, questions, onlyImageIds = null) {
  const requested = onlyImageIds || (questions || []).map((question) => question.imageId).filter(Boolean);
  const imageIds = [...new Set(requested)];
  const pending = [];

  for (const imageId of imageIds) {
    try {
      const image = await getLocalImageBlob(imageId);
      if (!image) {
        if (await hasFirebaseImage(imageId)) continue;
        pending.push(imageId);
        continue;
      }
      if (auth?.currentUser?.uid !== userId) {
        pending.push(imageId);
        continue;
      }
      await saveImageBlob(imageId, image);
    } catch (error) {
      console.error(`Failed to migrate image ${imageId} to Firebase Storage:`, error);
      pending.push(imageId);
    }
  }

  return pending;
}

function queueImageMigration(userId, imageIds) {
  if (!imageIds.length) return;

  void (async () => {
    try {
      const pendingImageIds = await migrateLocalImages(userId, [], imageIds);
      await setDoc(profileDoc(userId), {
        pendingImageIds,
        updatedAt: serverTimestamp()
      }, { merge: true });

      if (auth?.currentUser?.uid !== userId) return;
      notifyCloudStatus(
        pendingImageIds.length ? 'warning' : 'connected',
        pendingImageIds.length
          ? `${pendingImageIds.length} image(s) still need to be uploaded to Firebase Storage.`
          : ''
      );
    } catch (error) {
      console.error('Firebase image migration could not be completed:', error);
      if (auth?.currentUser?.uid === userId) {
        notifyCloudStatus('warning', 'Some browser images still need to be uploaded to Firebase Storage.');
      }
    }
  })();
}

function cacheDataLocally(data) {
  const values = [
    [STORAGE_KEYS.SECTIONS, data.sections],
    [STORAGE_KEYS.TOPICS, data.topics],
    [STORAGE_KEYS.QUESTIONS, data.questions],
    [STORAGE_KEYS.BOOKMARKS, data.bookmarks],
    [STORAGE_KEYS.PROGRESS, data.progress]
  ];

  for (const [key, value] of values) {
    if (value !== undefined) localStorage.setItem(key, JSON.stringify(value));
  }
}

export function disconnectCloudPersistence() {
  readyUserId = null;
}

export async function syncAppDataWithFirebase(localData, user, seedData) {
  if (!firebaseConfigured || !firestore || !user?.uid) {
    throw new Error('Firebase is not fully configured.');
  }

  const userId = user.uid;
  const profileReference = profileDoc(userId);
  const profileSnapshot = await getDoc(profileReference);
  const previousLocalOwner = localStorage.getItem('dep_firebase_uid');
  const pendingKeys = previousLocalOwner === userId ? readPendingCloudKeys() : [];
  const sourceData = previousLocalOwner && previousLocalOwner !== userId
    ? seedData
    : localData;

  if (!profileSnapshot.exists()) {
    const pendingImageIds = [...new Set(
      (sourceData.questions || []).map((question) => question.imageId).filter(Boolean)
    )];
    await writeAllData(userId, sourceData);
    await setDoc(profileReference, {
      schemaVersion: 1,
      pendingImageIds,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    readyUserId = userId;
    localStorage.setItem('dep_firebase_uid', userId);
    cacheDataLocally(sourceData);
    clearAllPendingCloudKeys();
    queueImageMigration(userId, pendingImageIds);
    notifyCloudStatus(
      pendingImageIds.length ? 'warning' : 'connected',
      pendingImageIds.length
        ? `${pendingImageIds.length} existing image(s) are syncing to Firebase Storage.`
        : ''
    );
    return { data: sourceData, pendingImageCount: pendingImageIds.length };
  }

  const profile = profileSnapshot.data();
  if (pendingKeys.length) {
    const localValues = {
      [STORAGE_KEYS.SECTIONS]: localData.sections,
      [STORAGE_KEYS.TOPICS]: localData.topics,
      [STORAGE_KEYS.QUESTIONS]: localData.questions,
      [STORAGE_KEYS.BOOKMARKS]: localData.bookmarks,
      [STORAGE_KEYS.PROGRESS]: localData.progress
    };
    for (const storageKey of pendingKeys) {
      if (localValues[storageKey] === undefined) continue;
      await persistValue(userId, storageKey, localValues[storageKey]);
      clearPendingCloudKey(storageKey, JSON.stringify(localValues[storageKey]));
    }
  }

  const pendingImageIds = Array.isArray(profile.pendingImageIds) ? profile.pendingImageIds : [];

  const [sections, topics, questions, bookmarks, progress] = await Promise.all([
    readCollection(userId, 'sections'),
    readCollection(userId, 'topics'),
    readCollection(userId, 'questions'),
    readStateDoc(userId, 'bookmarks', []),
    readStateDoc(userId, 'progress', [])
  ]);
  const data = { sections, topics, questions, bookmarks, progress };
  readyUserId = userId;
  localStorage.setItem('dep_firebase_uid', userId);
  cacheDataLocally(data);
  clearAllPendingCloudKeys();
  queueImageMigration(userId, pendingImageIds);
  notifyCloudStatus(
    pendingImageIds.length ? 'warning' : 'connected',
    pendingImageIds.length
      ? `${pendingImageIds.length} existing image(s) are syncing to Firebase Storage.`
      : ''
  );
  return { data, pendingImageCount: pendingImageIds.length };
}

async function persistValue(userId, storageKey, value) {
  if (COLLECTIONS_BY_STORAGE_KEY[storageKey]) {
    await replaceCollection(userId, COLLECTIONS_BY_STORAGE_KEY[storageKey], value || []);
    return;
  }
  if (STATE_DOCS_BY_STORAGE_KEY[storageKey]) {
    await writeStateDoc(userId, STATE_DOCS_BY_STORAGE_KEY[storageKey], value || []);
  }
}

export async function persistStoredValue(storageKey, value, serializedValue) {
  const userId = auth?.currentUser?.uid;
  if (!firebaseConfigured || !userId || readyUserId !== userId) return;
  if (!COLLECTIONS_BY_STORAGE_KEY[storageKey] && !STATE_DOCS_BY_STORAGE_KEY[storageKey]) return;

  const queueKey = `${userId}:${storageKey}`;
  const previous = pendingWrites.get(queueKey) || Promise.resolve();
  const next = previous.catch(() => {}).then(async () => {
    if (auth?.currentUser?.uid !== userId || readyUserId !== userId) return;
    await persistValue(userId, storageKey, value);
    clearPendingCloudKey(storageKey, serializedValue);
    notifyCloudStatus('connected');
  }).catch((error) => {
    console.error(`Firebase sync failed for ${storageKey}:`, error);
    notifyCloudStatus('error', 'Firebase could not save the latest changes. A local copy is still available.');
    throw error;
  });

  pendingWrites.set(queueKey, next);
  try {
    await next;
  } finally {
    if (pendingWrites.get(queueKey) === next) pendingWrites.delete(queueKey);
  }
}
