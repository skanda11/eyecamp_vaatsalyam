import React, { useState } from "react";
import { createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, setDoc, updateDoc } from "firebase/firestore";
import { UserPlus } from "lucide-react";
import { secondaryAuth, db } from "../firebase";
import { C, cardStyle, inputStyle, ROLES } from "../styles";
import { useUsers } from "../lib/campData";
import { Button } from "./Dashboard";

export default function ManageUsers() {
  const users = useUsers();
  const [f, setF] = useState({ name: "", email: "", password: "", role: "registration" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const createAccount = async () => {
    setError(""); setBusy(true);
    try {
      const cred = await createUserWithEmailAndPassword(secondaryAuth, f.email.trim(), f.password);
      await setDoc(doc(db, "users", cred.user.uid), { name: f.name, email: f.email.trim(), role: f.role });
      await signOut(secondaryAuth); // secondary instance only, doesn't touch the admin's own session
      setF({ name: "", email: "", password: "", role: "registration" });
    } catch (err) {
      setError(err.message.replace("Firebase: ", ""));
    }
    setBusy(false);
  };

  return (
    <div>
      <div style={cardStyle({ marginBottom: 14 })}>
        <div style={{ fontFamily: "Georgia, serif", fontSize: 16.5, marginBottom: 12 }}>Add staff account</div>
        <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
          <input placeholder="Name" value={f.name} onChange={set("name")} style={inputStyle} />
          <select value={f.role} onChange={set("role")} style={inputStyle}>
            {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <input placeholder="Email" value={f.email} onChange={set("email")} style={{ ...inputStyle, marginBottom: 10 }} />
        <input placeholder="Temporary password (min 6 chars)" value={f.password} onChange={set("password")} style={{ ...inputStyle, marginBottom: 12 }} />
        {error && <div style={{ color: C.crimson, fontSize: 12.5, marginBottom: 10 }}>{error}</div>}
        <Button full disabled={busy || !f.name || !f.email || f.password.length < 6} onClick={createAccount}>
          <UserPlus size={16} /> {busy ? "Creating…" : "Create Account"}
        </Button>
      </div>

      <div style={{ fontSize: 12.5, fontWeight: 700, color: C.inkSoft, marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.4 }}>Staff</div>
      {users.map((u) => (
        <div key={u.uid} style={cardStyle({ marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px" })}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 13.5 }}>{u.name}</div>
            <div style={{ fontSize: 11.5, color: C.inkSoft }}>{u.email}</div>
          </div>
          <select value={u.role} onChange={(e) => updateDoc(doc(db, "users", u.uid), { role: e.target.value })} style={{ ...inputStyle, width: "auto", padding: "6px 8px", fontSize: 12.5 }}>
            {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
      ))}
    </div>
  );
}
