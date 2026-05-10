import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Test connection
export async function initFirebase() {
  try {
    // Validate connection
    try {
      await getDocFromServer(doc(db, 'test', 'connection'));
      console.log('Firebase connection verified');
    } catch (e) {
      console.warn('Firebase connection check failed (expected if document missing), but SDK is initialized');
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Connection failed. Please check your network or Firebase configuration.");
    } else {
      console.error("Firebase init failed:", error);
    }
  }
}
