import { useEffect, useState } from "react";
import {
  collection, doc, onSnapshot, query, orderBy, limit,
  addDoc, updateDoc, runTransaction, serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";

// ---------- realtime hooks ----------

export function useLatestSession() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const q = query(collection(db, "sessions"), orderBy("startedAt", "desc"), limit(1));
    return onSnapshot(q, (snap) => {
      setSession(snap.empty ? null : { id: snap.docs[0].id, ...snap.docs[0].data() });
      setLoading(false);
    });
  }, []);
  return { session, loading };
}

export function useSessionHistory() {
  const [history, setHistory] = useState([]);
  useEffect(() => {
    const q = query(collection(db, "sessions"), orderBy("startedAt", "desc"), limit(20));
    return onSnapshot(q, (snap) => {
      setHistory(snap.docs.map((d) => ({ id: d.id, ...d.data() })).filter((s) => s.endedAt));
    });
  }, []);
  return history;
}

export function useVisits(sessionId) {
  const [visits, setVisits] = useState([]);
  useEffect(() => {
    if (!sessionId) { setVisits([]); return; }
    const q = query(collection(db, "sessions", sessionId, "visits"), orderBy("createdAt", "asc"));
    return onSnapshot(q, (snap) => setVisits(snap.docs.map((d) => d.data())));
  }, [sessionId]);
  return visits;
}

export function usePatients() {
  const [patients, setPatients] = useState([]);
  useEffect(() => {
    return onSnapshot(collection(db, "patients"), (snap) =>
      setPatients(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
  }, []);
  return patients;
}

export function useUsers() {
  const [users, setUsers] = useState([]);
  useEffect(() => {
    return onSnapshot(collection(db, "users"), (snap) =>
      setUsers(snap.docs.map((d) => ({ uid: d.id, ...d.data() })))
    );
  }, []);
  return users;
}

// ---------- session actions ----------

export async function startSession(village) {
  await addDoc(collection(db, "sessions"), {
    village, date: new Date().toDateString(), active: true,
    tokenCounter: 0, startedAt: serverTimestamp(), endedAt: null,
  });
}

export function summarize(visits) {
  const byStage = { vitals: 0, ophthal: 0, doctor: 0, surgery: 0, done: 0 };
  visits.forEach((v) => (byStage[v.stage] = (byStage[v.stage] || 0) + 1));
  return {
    total: visits.length,
    new: visits.filter((v) => v.type === "new").length,
    followup: visits.filter((v) => v.type === "followup").length,
    referredDoctor: visits.filter((v) => v.irregularity).length,
    surgeryMarked: visits.filter((v) => v.surgeryNeeded).length,
    byStage,
  };
}

export async function endSession(session, visits) {
  await updateDoc(doc(db, "sessions", session.id), {
    active: false, endedAt: serverTimestamp(), counts: summarize(visits),
  });
}

// ---------- token issuance (transactional: safe under concurrent devices) ----------

async function issueToken(sessionId, type, buildVisit) {
  const sessionRef = doc(db, "sessions", sessionId);
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(sessionRef);
    const current = snap.data().tokenCounter || 0;
    const n = current + 1;
    const token = `${type === "new" ? "N" : "F"}-${String(n).padStart(3, "0")}`;
    tx.update(sessionRef, { tokenCounter: n });
    tx.set(doc(db, "sessions", sessionId, "visits", token), buildVisit(token));
  });
}

// Full intake-sheet fields, captured once on the patient's persistent record.
export async function registerNewPatient(session, form) {
  const patientRef = await addDoc(collection(db, "patients"), {
    name: form.name,
    phone: form.phone,
    village: form.village,
    age: form.age,
    gender: form.gender,
    fatherHusbandName: form.fatherHusbandName || "",
    dob: form.dob || "",
    education: form.education || "",
    occupation: form.occupation || "",
    address: form.address || "",
    landline: form.landline || "",
    bloodGroup: form.bloodGroup || "",
    aadhar: form.aadhar || "",
    bplRation: form.bplRation || "",
    createdAt: serverTimestamp(),
  });
  await issueToken(session.id, "new", (token) => ({
    token, patientId: patientRef.id, name: form.name, village: form.village,
    type: "new", stage: "vitals", vitals: {}, createdAt: Date.now(),
  }));
}

export async function issueFollowupToken(session, patient) {
  await issueToken(session.id, "followup", (token) => ({
    token, patientId: patient.id, name: patient.name, village: patient.village,
    type: "followup", stage: "ophthal", createdAt: Date.now(),
  }));
}

export async function updateVisit(sessionId, token, patch) {
  await updateDoc(doc(db, "sessions", sessionId, "visits", token), patch);
}
