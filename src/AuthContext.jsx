import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { auth, db } from "./firebase";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null); // { name, role }
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (!u) {
        setProfile(null);
        setLoading(false);
      }
    });
    return unsubAuth;
  }, []);

  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(doc(db, "users", user.uid), (snap) => {
      setProfile(snap.exists() ? snap.data() : { name: user.email, role: null });
      setLoading(false);
    });
    return unsub;
  }, [user]);

  const value = {
    user,
    role: profile?.role || null,
    name: profile?.name || user?.email || "",
    loading,
    logout: () => signOut(auth),
  };

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  return useContext(AuthCtx);
}
