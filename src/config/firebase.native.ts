import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';

console.log('🔥 Loading firebase.native.ts in iris-auth');

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || 'AIzaSyDummy-Key-For-Development',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || 'firebase-auth-ui.firebaseapp.com',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || 'firebase-auth-ui',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || 'firebase-auth-ui.appspot.com',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || '1:123456789:ios:abc123def456',
};

// Initialize Firebase app
let firebaseApp: FirebaseApp;
let authInstance: Auth;

if (getApps().length === 0) {
  // First time initialization
  firebaseApp = initializeApp(firebaseConfig);
  // Use getAuth() - Firebase will handle persistence automatically on React Native
  authInstance = getAuth(firebaseApp);
} else {
  // Already initialized
  firebaseApp = getApp();
  authInstance = getAuth(firebaseApp);
}

export const app = firebaseApp;
export const auth = authInstance;
