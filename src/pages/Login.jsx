import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { C, inputStyle, cardStyle } from "../styles";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (err) {
      setError("Couldn't sign in — check the email and password.");
    }
    setBusy(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: C.blush, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "system-ui, sans-serif", padding: 16 }}>
      <form onSubmit={submit} style={cardStyle({ width: "100%", maxWidth: 360 })}>
        <div style={{ fontFamily: "Georgia, serif", fontSize: 20, color: C.crimson, marginBottom: 4 }}>Eye Camp</div>
        <div style={{ fontSize: 12.5, color: C.inkSoft, marginBottom: 16 }}>Sign in with your account</div>
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ ...inputStyle, marginBottom: 10 }} required />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ ...inputStyle, marginBottom: 14 }} required />
        {error && <div style={{ color: C.crimson, fontSize: 12.5, marginBottom: 10 }}>{error}</div>}
        <button type="submit" disabled={busy} style={{ width: "100%", background: C.crimson, color: C.white, border: "none", borderRadius: 10, padding: "12px 16px", fontWeight: 700, fontSize: 14.5, cursor: "pointer", opacity: busy ? 0.6 : 1 }}>
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
