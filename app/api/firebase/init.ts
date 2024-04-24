import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

export function init() {
  const apiKey = process.env.FIREBASE_API_KEY;
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const appId = process.env.FIREBASE_APP_ID;

  if (!apiKey || !projectId || !appId) throw new Error('Missing required parameter: apiKey, projectId or appId.');

  const app = initializeApp({
    apiKey: apiKey,
    authDomain: projectId + '.firebaseapp.com',
    projectId: projectId,
    storageBucket: projectId + '.appspot.com',
    messagingSenderId: appId.split(':')[1],
    appId: appId,
  });

  const firestore = getFirestore(app);

  return firestore;
}
