import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";

// Paste the config object from:
// Firebase Console -> Project settings -> General -> "Your apps" -> Web app
const firebaseConfig = {
  apiKey: "REPLACE_ME",
  authDomain: "REPLACE_ME.firebaseapp.com",
  projectId: "REPLACE_ME",
  storageBucket: "REPLACE_ME.appspot.com",
  messagingSenderId: "REPLACE_ME",
  appId: "REPLACE_ME",
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
