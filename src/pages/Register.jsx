import React, { useState } from "react";
import { Plus, Search, ChevronRight, X, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";
import { C, cardStyle, inputStyle } from "../styles";
import { useLatestSession, usePatients, registerNewPatient, issueFollowupToken } from "../lib/campData";
import { Button } from "./Dashboard";

export default function Register() {
  const { session } = useLatestSession();
  const patients = usePatients();
  const [mode, setMode] = useState(null);

  if (!session?.active) {
    return (
      <div style={cardStyle()}>
        <div style={{ display: "flex", gap: 8, alignItems: "center", color: C.crimson, fontWeight: 700, fontSize: 14 }}>
          <AlertTriangle size={17} /> No active session
        </div>
        <div style={{ fontSize: 13, color: C.inkSoft, marginTop: 6 }}>Start today's session from Home before registering patients.</div>
      </div>
    );
  }

  if (mode === "new") return <NewPatientForm onBack={() => setMode(null)} onSubmit={async (f) => { await registerNewPatient(session, f); setMode(null); }} />;
  if (mode === "followup") return <FollowupSearch patients={patients} onBack={() => setMode(null)} onIssue={async (p) => { await issueFollowupToken(session, p); setMode(null); }} />;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div onClick={() => setMode("new")} style={{ ...cardStyle(), cursor: "pointer", display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 42, height: 42, borderRadius: 10, background: C.crimson, color: C.white, display: "flex", alignItems: "center", justifyContent: "center" }}><Plus size={20} /></div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 14.5 }}>New Patient</div>
          <div style={{ fontSize: 12, color: C.inkSoft }}>Height, weight, BP → then eye check</div>
        </div>
        <ChevronRight size={18} color={C.inkSoft} />
      </div>
      <div onClick={() => setMode("followup")} style={{ ...cardStyle(), cursor: "pointer", display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 42, height: 42, borderRadius: 10, background: C.gold, color: C.ink, display: "flex", alignItems: "center", justifyContent: "center" }}><Search size={20} /></div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 14.5 }}>Follow-up Patient</div>
          <div style={{ fontSize: 12, color: C.inkSoft }}>Skips vitals → straight to eye check</div>
        </div>
        <ChevronRight size={18} color={C.inkSoft} />
      </div>
    </div>
  );
}

const BLANK = {
  name: "", phone: "", village: "", age: "", gender: "",
  fatherHusbandName: "", dob: "", education: "", occupation: "",
  address: "", landline: "", bloodGroup: "", aadhar: "", bplRation: "",
};

function NewPatientForm({ onBack, onSubmit }) {
  const [f, setF] = useState(BLANK);
  const [more, setMore] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const valid = f.name.trim() && f.phone.trim();
  return (
    <div style={cardStyle()}>
      <FormHeader title="New Patient" onBack={onBack} />

      <Field label="Full name"><input value={f.name} onChange={set("name")} style={inputStyle} /></Field>
      <Field label="Mobile number"><input value={f.phone} onChange={set("phone")} style={inputStyle} inputMode="tel" /></Field>
      <Field label="Village"><input value={f.village} onChange={set("village")} style={inputStyle} /></Field>
      <div style={{ display: "flex", gap: 10 }}>
        <Field label="Age"><input value={f.age} onChange={set("age")} style={inputStyle} inputMode="numeric" /></Field>
        <Field label="Gender">
          <select value={f.gender} onChange={set("gender")} style={inputStyle}>
            <option value="">Select</option><option>Male</option><option>Female</option><option>Other</option>
          </select>
        </Field>
      </div>

      <button type="button" onClick={() => setMore(!more)} style={{ display: "flex", alignItems: "center", gap: 6, background: "transparent", border: "none", color: C.crimson, fontWeight: 700, fontSize: 12.5, padding: "6px 0 14px", cursor: "pointer" }}>
        {more ? <ChevronUp size={15} /> : <ChevronDown size={15} />} {more ? "Hide" : "Add"} intake sheet details
      </button>

      {more && (
        <div style={{ marginBottom: 4 }}>
          <Field label="Father / Husband's name"><input value={f.fatherHusbandName} onChange={set("fatherHusbandName")} style={inputStyle} /></Field>
          <Field label="Date of birth (if known)"><input type="date" value={f.dob} onChange={set("dob")} style={inputStyle} /></Field>
          <div style={{ display: "flex", gap: 10 }}>
            <Field label="Education"><input value={f.education} onChange={set("education")} style={inputStyle} /></Field>
            <Field label="Occupation"><input value={f.occupation} onChange={set("occupation")} style={inputStyle} /></Field>
          </div>
          <Field label="Home address"><textarea rows={2} value={f.address} onChange={set("address")} style={{ ...inputStyle, resize: "vertical" }} /></Field>
          <div style={{ display: "flex", gap: 10 }}>
            <Field label="Landline (optional)"><input value={f.landline} onChange={set("landline")} style={inputStyle} inputMode="tel" /></Field>
            <Field label="Blood group"><input value={f.bloodGroup} onChange={set("bloodGroup")} style={inputStyle} placeholder="e.g. B+" /></Field>
          </div>
          <Field label="Aadhar number"><input value={f.aadhar} onChange={set("aadhar")} style={inputStyle} inputMode="numeric" /></Field>
          <Field label="BPL / Ration card details"><input value={f.bplRation} onChange={set("bplRation")} style={inputStyle} /></Field>
        </div>
      )}

      <Button full disabled={!valid} onClick={() => onSubmit(f)}><Plus size={16} /> Register & Issue Token</Button>
    </div>
  );
}

function FollowupSearch({ patients, onBack, onIssue }) {
  const [q, setQ] = useState("");
  const list = patients.filter((p) => {
    if (!q.trim()) return false;
    const s = q.toLowerCase();
    return p.name?.toLowerCase().includes(s) || p.phone?.includes(s);
  });
  return (
    <div style={cardStyle()}>
      <FormHeader title="Follow-up Patient" onBack={onBack} />
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name or phone" style={{ ...inputStyle, marginBottom: 12 }} />
      {q.trim() && list.length === 0 && (
        <div style={{ fontSize: 13, color: C.inkSoft, padding: "10px 0" }}>No match found — register them as a new patient instead.</div>
      )}
      {list.map((p) => (
        <div key={p.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid ${C.line}` }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14 }}>{p.name}</div>
            <div style={{ fontSize: 12, color: C.inkSoft }}>{p.village} · {p.phone}</div>
          </div>
          <Button small variant="gold" onClick={() => onIssue(p)}>Issue Token</Button>
        </div>
      ))}
    </div>
  );
}

function FormHeader({ title, onBack }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
      <div style={{ fontFamily: "Georgia, serif", fontSize: 16.5 }}>{title}</div>
      <button onClick={onBack} style={{ border: "none", background: C.blush, borderRadius: 8, padding: 6, cursor: "pointer" }}><X size={16} /></button>
    </div>
  );
}
function Field({ label, children }) {
  return <div style={{ marginBottom: 12, flex: 1 }}><div style={{ fontSize: 11.5, color: C.inkSoft, marginBottom: 4, fontWeight: 600 }}>{label}</div>{children}</div>;
}
