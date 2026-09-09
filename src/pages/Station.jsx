import React, { useState } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { C, cardStyle, inputStyle, STAGE_META } from "../styles";
import { useLatestSession, useVisits, updateVisit } from "../lib/campData";
import { Button } from "./Dashboard";

export default function Station({ stage, title }) {
  const { session } = useLatestSession();
  const visits = useVisits(session?.id);
  const meta = STAGE_META[stage];
  const list = visits.filter((v) => v.stage === stage);

  if (!session?.active) {
    return <div style={cardStyle()}><div style={{ fontSize: 13.5, color: C.inkSoft }}>No active session right now.</div></div>;
  }

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <div style={{ fontFamily: "Georgia, serif", fontSize: 17 }}>{title} queue</div>
        <div style={{ marginLeft: "auto", fontSize: 12.5, color: C.inkSoft }}>{list.length} waiting</div>
      </div>
      {list.length === 0 && (
        <div style={cardStyle()}><div style={{ fontSize: 13, color: C.inkSoft, textAlign: "center", padding: "10px 0" }}>No one waiting here right now.</div></div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {list.map((v) => {
          if (stage === "vitals") return <VitalsCard key={v.token} visit={v} sessionId={session.id} color={meta.color} />;
          if (stage === "ophthal") return <OphthalCard key={v.token} visit={v} sessionId={session.id} color={meta.color} />;
          if (stage === "doctor") return <DoctorCard key={v.token} visit={v} sessionId={session.id} color={meta.color} />;
          if (stage === "surgery") return <SurgeryCard key={v.token} visit={v} sessionId={session.id} color={meta.color} />;
          return null;
        })}
      </div>
    </div>
  );
}

function TokenBadge({ token, color }) {
  return (
    <div style={{ width: 54, height: 54, borderRadius: "50%", background: color, color: C.white, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 12.5, flexShrink: 0, boxShadow: `0 3px 8px ${color}55` }}>
      {token}
    </div>
  );
}
function PatientHeader({ visit, color }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
      <TokenBadge token={visit.token} color={color} />
      <div>
        <div style={{ fontWeight: 700, fontSize: 14.5 }}>{visit.name}</div>
        <div style={{ fontSize: 12, color: C.inkSoft }}>{visit.village} · {visit.type === "new" ? "New patient" : "Follow-up"}</div>
      </div>
    </div>
  );
}
function FieldLabel({ children }) {
  return <div style={{ fontSize: 11.5, color: C.inkSoft, marginBottom: 4, fontWeight: 600 }}>{children}</div>;
}

// ---------- Vitals ----------
function VitalsCard({ visit, sessionId, color }) {
  const [h, setH] = useState(""); const [w, setW] = useState("");
  const [pulse, setPulse] = useState(""); const [bp, setBp] = useState("");
  const [history, setHistory] = useState(null); // diabetes/hypertension yes/no
  const bmi = h && w ? (Number(w) / Math.pow(Number(h) / 100, 2)).toFixed(1) : null;
  const valid = h && w && bp && pulse && history !== null;
  return (
    <div style={cardStyle()}>
      <PatientHeader visit={visit} color={color} />
      <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
        <input placeholder="Height (cm)" value={h} onChange={(e) => setH(e.target.value)} style={inputStyle} inputMode="decimal" />
        <input placeholder="Weight (kg)" value={w} onChange={(e) => setW(e.target.value)} style={inputStyle} inputMode="decimal" />
      </div>
      {bmi && <div style={{ fontSize: 12, color: C.inkSoft, marginBottom: 10 }}>BMI: <strong style={{ color: C.ink }}>{bmi} kg/m²</strong></div>}
      <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
        <input placeholder="Pulse rate" value={pulse} onChange={(e) => setPulse(e.target.value)} style={inputStyle} inputMode="numeric" />
        <input placeholder="BP (e.g. 120/80)" value={bp} onChange={(e) => setBp(e.target.value)} style={inputStyle} />
      </div>
      <FieldLabel>History of Diabetes / Hypertension?</FieldLabel>
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <Button variant={history === false ? "green" : "ghost"} full onClick={() => setHistory(false)}>No</Button>
        <Button variant={history === true ? "primary" : "ghost"} full onClick={() => setHistory(true)}>Yes</Button>
      </div>
      <Button full disabled={!valid} onClick={() => updateVisit(sessionId, visit.token, {
        vitals: { height: h, weight: w, bmi, pulse, bp, diabetesHypertension: history },
        stage: "ophthal",
      })}>
        Send to Eye Check <ArrowRight size={15} />
      </Button>
    </div>
  );
}

// ---------- Eye check ----------
const BLANK_POWER = { rSphD: "", rCylD: "", rAxisD: "", lSphD: "", lCylD: "", lAxisD: "",
  rSphN: "", rCylN: "", rAxisN: "", lSphN: "", lCylN: "", lAxisN: "" };

function PowerTable({ power, setPower }) {
  const set = (k) => (e) => setPower({ ...power, [k]: e.target.value });
  const cell = (k, ph) => <input value={power[k]} onChange={set(k)} placeholder={ph} style={{ ...inputStyle, padding: "6px 6px", fontSize: 12, textAlign: "center" }} />;
  return (
    <div style={{ marginBottom: 12 }}>
      <FieldLabel>Power details</FieldLabel>
      <div style={{ display: "grid", gridTemplateColumns: "44px repeat(6, 1fr)", gap: 4, alignItems: "center", fontSize: 10.5, color: C.inkSoft, marginBottom: 4 }}>
        <div /><div style={{ gridColumn: "span 3", textAlign: "center", fontWeight: 700 }}>RIGHT EYE</div><div style={{ gridColumn: "span 3", textAlign: "center", fontWeight: 700 }}>LEFT EYE</div>
        <div /><div style={{ textAlign: "center" }}>Sph</div><div style={{ textAlign: "center" }}>Cyl</div><div style={{ textAlign: "center" }}>Axis</div>
        <div style={{ textAlign: "center" }}>Sph</div><div style={{ textAlign: "center" }}>Cyl</div><div style={{ textAlign: "center" }}>Axis</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "44px repeat(6, 1fr)", gap: 4, marginBottom: 4, alignItems: "center" }}>
        <div style={{ fontSize: 11, fontWeight: 600 }}>Dist.</div>
        {cell("rSphD")}{cell("rCylD")}{cell("rAxisD")}{cell("lSphD")}{cell("lCylD")}{cell("lAxisD")}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "44px repeat(6, 1fr)", gap: 4, alignItems: "center" }}>
        <div style={{ fontSize: 11, fontWeight: 600 }}>Near</div>
        {cell("rSphN")}{cell("rCylN")}{cell("rAxisN")}{cell("lSphN")}{cell("lCylN")}{cell("lAxisN")}
      </div>
    </div>
  );
}

function OphthalCard({ visit, sessionId, color }) {
  const [notes, setNotes] = useState(""); const [irregular, setIrregular] = useState(null);
  const [power, setPower] = useState(BLANK_POWER);
  return (
    <div style={cardStyle()}>
      <PatientHeader visit={visit} color={color} />
      <PowerTable power={power} setPower={setPower} />
      <textarea placeholder="Eye check notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} style={{ ...inputStyle, marginBottom: 10, resize: "vertical" }} />
      <FieldLabel>Irregularity found?</FieldLabel>
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <Button variant={irregular === false ? "green" : "ghost"} full onClick={() => setIrregular(false)}>No</Button>
        <Button variant={irregular === true ? "primary" : "ghost"} full onClick={() => setIrregular(true)}>Yes</Button>
      </div>
      <Button full disabled={irregular === null}
        onClick={() => updateVisit(sessionId, visit.token, { ophthalNotes: notes, power, irregularity: irregular, stage: irregular ? "doctor" : "done" })}>
        {irregular ? <>Refer to Doctor <ArrowRight size={15} /></> : <>Mark Complete <CheckCircle2 size={15} /></>}
      </Button>
    </div>
  );
}

// ---------- Doctor ----------
function DoctorCard({ visit, sessionId, color }) {
  const [complaints, setComplaints] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [plan, setPlan] = useState("");
  const [treatment, setTreatment] = useState("");
  const [surgery, setSurgery] = useState(null);
  return (
    <div style={cardStyle()}>
      <PatientHeader visit={visit} color={color} />
      <div style={{ fontSize: 12, color: C.inkSoft, marginBottom: 10, background: C.blush, padding: "6px 9px", borderRadius: 7 }}>
        Eye check note: {visit.ophthalNotes || "—"}
      </div>
      <Field label="Presenting complaints"><textarea rows={2} value={complaints} onChange={(e) => setComplaints(e.target.value)} style={{ ...inputStyle, resize: "vertical" }} /></Field>
      <Field label="Diagnosis"><textarea rows={2} value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} style={{ ...inputStyle, resize: "vertical" }} /></Field>
      <Field label="Plan of management"><textarea rows={2} value={plan} onChange={(e) => setPlan(e.target.value)} style={{ ...inputStyle, resize: "vertical" }} /></Field>
      <Field label="Treatment"><textarea rows={2} value={treatment} onChange={(e) => setTreatment(e.target.value)} style={{ ...inputStyle, resize: "vertical" }} /></Field>
      <FieldLabel>Surgery required?</FieldLabel>
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <Button variant={surgery === false ? "green" : "ghost"} full onClick={() => setSurgery(false)}>No</Button>
        <Button variant={surgery === true ? "primary" : "ghost"} full onClick={() => setSurgery(true)}>Yes</Button>
      </div>
      <Button full disabled={surgery === null}
        onClick={() => updateVisit(sessionId, visit.token, {
          presentingComplaints: complaints, doctorNotes: diagnosis, planOfManagement: plan, treatment,
          surgeryNeeded: surgery, stage: surgery ? "surgery" : "done", surgeryStatus: surgery ? "pending" : null,
        })}>
        {surgery ? <>Mark for Surgery <ArrowRight size={15} /></> : <>Mark Complete <CheckCircle2 size={15} /></>}
      </Button>
    </div>
  );
}
function Field({ label, children }) {
  return <div style={{ marginBottom: 10 }}><FieldLabel>{label}</FieldLabel>{children}</div>;
}

// ---------- Surgery ----------
function SurgeryCard({ visit, sessionId, color }) {
  const status = visit.surgeryStatus || "pending";
  return (
    <div style={cardStyle()}>
      <PatientHeader visit={visit} color={color} />
      <div style={{ fontSize: 12, color: C.inkSoft, marginBottom: 12, background: C.blush, padding: "6px 9px", borderRadius: 7 }}>
        Diagnosis: {visit.doctorNotes || "—"}
      </div>
      <div style={{ fontSize: 11.5, color: C.inkSoft, marginBottom: 8, fontWeight: 600 }}>
        Status: <span style={{ color: C.ink, fontWeight: 700 }}>{status === "pending" ? "Awaiting transport" : status === "taken" ? "Taken for surgery" : "Returned to village"}</span>
      </div>
      {status === "pending" && <Button full variant="gold" onClick={() => updateVisit(sessionId, visit.token, { surgeryStatus: "taken" })}>Mark Taken</Button>}
      {status === "taken" && <Button full variant="green" onClick={() => updateVisit(sessionId, visit.token, { surgeryStatus: "returned", stage: "done" })}>Mark Returned — Done</Button>}
      {status === "returned" && <div style={{ color: C.green, fontWeight: 700, fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}><CheckCircle2 size={16} /> Complete</div>}
    </div>
  );
}
