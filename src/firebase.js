import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";

// Paste the config object from:
// Firebase Console -> Project settings -> General -> "Your apps" -> Web app
const firebaseConfig = {
  apiKey: "AIzaSyA9K2THwfsUvAuQ_IccTQYxzT7J2DY1GFs",
  authDomain: "eye-camp-vaatsalyam.firebaseapp.com",
  projectId: "eye-camp-vaatsalyam",
  storageBucket: "eye-camp-vaatsalyam.firebasestorage.app",
  messagingSenderId: "989993189528",
  appId: "1:989993189528:web:a20f67d99c72acfc9850ed",
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Persistent local cache = the app keeps working (reads AND queued writes)
// through a wifi dropout, and syncs automatically once back online.
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
});

// A second, independent app instance. Used only so that an admin creating a
// new teammate's account doesn't get signed out of their own session
// (createUserWithEmailAndPassword normally signs in as the new user).
export const secondaryApp = initializeApp(firebaseConfig, "secondary");
export const secondaryAuth = getAuth(secondaryApp);
