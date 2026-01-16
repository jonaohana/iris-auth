"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auth = exports.app = void 0;
const app_1 = require("firebase/app");
const auth_1 = require("firebase/auth");
console.log('🔥 Loading firebase.web.ts in iris-auth');
// Firebase configuration
const firebaseConfig = {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || 'AIzaSyDummy-Key-For-Development',
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || 'firebase-auth-ui.firebaseapp.com',
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || 'firebase-auth-ui',
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || 'firebase-auth-ui.appspot.com',
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '123456789',
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || '1:123456789:web:abc123def456',
};
// Initialize Firebase app first
let firebaseApp;
if ((0, app_1.getApps)().length === 0) {
    firebaseApp = (0, app_1.initializeApp)(firebaseConfig);
}
else {
    firebaseApp = (0, app_1.getApp)();
}
// Then get auth instance
const authInstance = (0, auth_1.getAuth)(firebaseApp);
exports.app = firebaseApp;
exports.auth = authInstance;
