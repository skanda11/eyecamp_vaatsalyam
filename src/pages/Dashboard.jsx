import React, { useState } from "react";
import { Play, Square } from "lucide-react";
import { C, cardStyle, inputStyle, STAGE_META } from "../styles";
import { useLatestSession, useVisits, useSessionHistory, startSession, endSession, summarize } from "../lib/campData";
import { useAuth } from "../AuthContext";

export default function Dashboard() {
  const { role } = useAuth();
  const canControl = role === "admin" || role === "coordinator";
  const { session } = useLatestSession();
  const visits = useVisits(session?.id);
  const history = useSessionHistory();
  const [village, setVillage] = useState("");
  const [confirmEnd, setConfirmEnd] = useState(false);
  const counts = summarize(visits);
  const isActive = session?.active;

  if (!session || !isActive) {
    return (
      <div>
        {canControl ? (
          <div style={cardStyle()}>
            <div style={{ fontFamily: "Georgia, serif", fontSize: 17, marginBottom: 10 }}>Start today's camp</div>
            <div style={{ fontSize: 13, color: C.inkSoft, marginBottom: 12 }}>
              Registration and follow-up lookup stay locked until a session is started.
            </div>
            <input value={village} onChange={(e) => setVillage(e.target.value)} placeholder="Village / camp location"
              style={{ ...inputStyle, marginBottom: 12 }} />
            <Button full disabled={!village.trim()} onClick={() => startSession(village.trim())}><Play size={16} /> Start Session</Button>
          </div>
        ) : (
          <div style={cardStyle()}><div style={{ fontSize: 13.5, color: C.inkSoft }}>No active session yet — waiting for a coordinator to start one.</div></div>
        )}
        {history.length > 0 && <HistoryList history={history} />}
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
        <StatBox label="New patients" value={counts.new} color={C.crimson} />
        <StatBox label="Follow-ups" value={counts.followup} color={C.crimson} />
        <StatBox label="Referred to doctor" value={counts.referredDoctor} color={C.orange} />
        <StatBox label="Marked for surgery" value={counts.surgeryMarked} color={C.purple} />
      </div>

      <div style={cardStyle({ marginBottom: 12 })}>
        <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10 }}>Live queue by station</div>
        {Object.entries(STAGE_META).map(([key, meta]) => (
          <div key={key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 0", borderBottom: `1px solid ${C.line}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5 }}>
              <span style={{ width: 9, height: 9, borderRadius: "50%", background: meta.color, display: "inline-block" }} />
              {meta.label}
            </div>
            <div style={{ fontWeight: 800 }}>{counts.byStage[key] || 0}</div>
          </div>
        ))}
        <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 10, fontWeight: 800 }}>
          <span>Total tokens issued</span><span>{counts.total}</span>
        </div>
      </div>

      {canControl && (
        !confirmEnd ? (
          <Button full variant="outline" onClick={() => setConfirmEnd(true)}><Square size={15} /> End Session</Button>
        ) : (
          <div style={cardStyle({ borderColor: C.crimson })}>
            <div style={{ fontSize: 13.5, marginBottom: 10 }}>End the session? Registration will lock and today's final count will be saved.</div>
            <div style={{ display: "flex", gap: 8 }}>
              <Button variant="ghost" full onClick={() => setConfirmEnd(false)}>Cancel</Button>
              <Button full onClick={() => { endSession(session, visits); setConfirmEnd(false); }}>Confirm End</Button>
            </div>
          </div>
        )
      )}

      {history.length > 0 && <HistoryList history={history} />}
    </div>
  );
}

function StatBox({ label, value, color }) {
  return (
    <div style={cardStyle({ padding: "13px 14px" })}>
      <div style={{ fontSize: 26, fontWeight: 800, color }}>{value}</div>
      <div style={{ fontSize: 11.5, color: C.inkSoft, marginTop: 2 }}>{label}</div>
    </div>
  );
}

function HistoryList({ history }) {
  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ fontSize: 12.5, fontWeight: 700, color: C.inkSoft, marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.4 }}>Past camps</div>
      {history.slice(0, 6).map((h) => (
        <div key={h.id} style={cardStyle({ marginBottom: 8, padding: "12px 14px" })}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5, fontWeight: 700 }}>
            <span>{h.village}</span><span style={{ color: C.inkSoft, fontWeight: 500 }}>{h.date}</span>
          </div>
          <div style={{ fontSize: 12, color: C.inkSoft, marginTop: 3 }}>
            {h.counts?.total || 0} tokens · {h.counts?.new || 0} new · {h.counts?.followup || 0} follow-up · {h.counts?.surgeryMarked || 0} surgery
          </div>
        </div>
      ))}
    </div>
  );
}

export function Button({ children, onClick, variant = "primary", full, disabled, small }) {
  const styles = {
    primary: { background: C.crimson, color: C.white },
    gold: { background: C.gold, color: C.ink },
    green: { background: C.green, color: C.white },
    outline: { background: "transparent", color: C.crimson, border: `1.5px solid ${C.crimson}` },
    ghost: { background: C.blush, color: C.ink },
  };
  return (
    <button onClick={onClick} disabled={disabled} style={{
      ...styles[variant], border: styles[variant].border || "none", borderRadius: 10,
      padding: small ? "8px 12px" : "12px 16px", fontSize: small ? 13 : 14.5, fontWeight: 700,
      width: full ? "100%" : "auto", cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.45 : 1,
      display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
    }}>
      {children}
    </button>
  );
}
