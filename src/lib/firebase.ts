import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported, Analytics } from "firebase/analytics";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { 
  getFirestore
} from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Helper for safe storage operations
const safeStorage = {
  setItem(key: string, value: any) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn('Storage serialization failed:', e);
    }
  },
  getItem(key: string) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (e) {
      console.warn('Storage parsing failed:', e);
      return null;
    }
  }
};

const firebaseConfig = {
  apiKey: "AIzaSyByWIWExVaEtfk9_Qfwv13zR62W35LOEKE",
  authDomain: "annektech.firebaseapp.com",
  projectId: "annektech",
  storageBucket: "annektech.firebasestorage.app",
  messagingSenderId: "1072516256382",
  appId: "1:1072516256382:web:6d954239b7eda366e53e2f",
  measurementId: "G-8XYYFVF19M"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Analytics conditionally with storage wrapper
export let analytics: Analytics | null = null;
isSupported().then(async yes => {
  if (yes) {
    try {
      analytics = getAnalytics(app);
      // Use safe storage for analytics data
      (window as any)._firebase_analytics_storage = safeStorage;
      // Test connection
      await fetch('https://www.google-analytics.com/collect', { method: 'HEAD' });
    } catch (error) {
      console.warn('Analytics disabled: Connection test failed');
      analytics = null;
    }
  }
}).catch(() => {
  console.warn('Analytics disabled: Not supported in this environment');
  analytics = null;
});

export const auth = getAuth(app);
export const storage = getStorage(app);

// Initialize admin credentials
export async function initializeAdminAccount() {
  try {
    await createUserWithEmailAndPassword(auth, "adminannektech@gmail.com", "Nat@0543485978");
  } catch (error) {
    console.log("Admin account already exists or error occurred:", error);
  }
}