import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { getReactNativePersistence, getAuth, initializeAuth } from 'firebase/auth';
import { getFirestore, initializeFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyDj61l8YSDAQV8K_We62vcWJLXd-NkCBjU',
  authDomain: 'mobile2026-faab0.firebaseapp.com',
  databaseURL: 'https://jogo-advinhacao-5238f-default-rtdb.firebaseio.com/',
  projectId: 'mobile2026-faab0',
  storageBucket: 'mobile2026-faab0.firebasestorage.app',
  messagingSenderId: '845834353304',
  appId: '1:845834353304:web:64add86a27e2a498f3eeed',
};

export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = (() => {
  try {
    return initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch {
    return getAuth(app);
  }
})();

export const db = (() => {
  try {
    return initializeFirestore(app, {
      experimentalForceLongPolling: true,
    });
  } catch {
    return getFirestore(app);
  }
})();

export const firebaseConfigured = true;
export const firebaseConfigMessage = '';
