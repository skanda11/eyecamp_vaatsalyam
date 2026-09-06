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

function VitalsCard({ visit, sessionId, color }) {
  const [h, setH] = useState(""); const [w, setW] = useState(""); const [bp, setBp] = useState("");
  const valid = h && w && bp;
  return (
    <div style={cardStyle()}>
      <PatientHeader visit={visit} color={color} />
      <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
        <input placeholder="Height (cm)" value={h} onChange={(e) => setH(e.target.value)} style={inputStyle} inputMode="decimal" />
        <input placeholder="Weight (kg)" value={w} onChange={(e) => setW(e.target.value)} style={inputStyle} inputMode="decimal" />
      </div>
      <input placeholder="BP (e.g. 120/80)" value={bp} onChange={(e) => setBp(e.target.value)} style={{ ...inputStyle, marginBottom: 12 }} />
      <Button full disabled={!valid} onClick={() => updateVisit(sessionId, visit.token, { vitals: { height: h, weight: w, bp }, stage: "ophthal" })}>
        Send to Eye Check <ArrowRight size={15} />
      </Button>
    </div>
  );
}

function OphthalCard({ visit, sessionId, color }) {
  const [notes, setNotes] = useState(""); const [irregular, setIrregular] = useState(null);
  return (
    <div style={cardStyle()}>
      <PatientHeader visit={visit} color={color} />
      <textarea placeholder="Eye check notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} style={{ ...inputStyle, marginBottom: 10, resize: "vertical" }} />
      <div style={{ fontSize: 11.5, color: C.inkSoft, marginBottom: 6, fontWeight: 600 }}>Irregularity found?</div>
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <Button variant={irregular === false ? "green" : "ghost"} full onClick={() => setIrregular(false)}>No</Button>
        <Button variant={irregular === true ? "primary" : "ghost"} full onClick={() => setIrregular(true)}>Yes</Button>
      </div>
      <Button full disabled={irregular === null}
        onClick={() => updateVisit(sessionId, visit.token, { ophthalNotes: notes, irregularity: irregular, stage: irregular ? "doctor" : "done" })}>
        {irregular ? <>Refer to Doctor <ArrowRight size={15} /></> : <>Mark Complete <CheckCircle2 size={15} /></>}
      </Button>
    </div>
  );
}

function DoctorCard({ visit, sessionId, color }) {
  const [notes, setNotes] = useState(""); const [surgery, setSurgery] = useState(null);
  return (
    <div style={cardStyle()}>
      <PatientHeader visit={visit} color={color} />
      <div style={{ fontSize: 12, color: C.inkSoft, marginBottom: 8, background: C.blush, padding: "6px 9px", borderRadius: 7 }}>
        Eye check note: {visit.ophthalNotes || "—"}
      </div>
      <textarea placeholder="Doctor's notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} style={{ ...inputStyle, marginBottom: 10, resize: "vertical" }} />
      <div style={{ fontSize: 11.5, color: C.inkSoft, marginBottom: 6, fontWeight: 600 }}>Surgery required?</div>
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <Button variant={surgery === false ? "green" : "ghost"} full onClick={() => setSurgery(false)}>No</Button>
        <Button variant={surgery === true ? "primary" : "ghost"} full onClick={() => setSurgery(true)}>Yes</Button>
      </div>
      <Button full disabled={surgery === null}
        onClick={() => updateVisit(sessionId, visit.token, { doctorNotes: notes, surgeryNeeded: surgery, stage: surgery ? "surgery" : "done", surgeryStatus: surgery ? "pending" : null })}>
        {surgery ? <>Mark for Surgery <ArrowRight size={15} /></> : <>Mark Complete <CheckCircle2 size={15} /></>}
      </Button>
    </div>
  );
}

function SurgeryCard({ visit, sessionId, color }) {
  const status = visit.surgeryStatus || "pending";
  return (
    <div style={cardStyle()}>
      <PatientHeader visit={visit} color={color} />
      <div style={{ fontSize: 12, color: C.inkSoft, marginBottom: 12, background: C.blush, padding: "6px 9px", borderRadius: 7 }}>
        Doctor's note: {visit.doctorNotes || "—"}
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
