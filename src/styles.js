export const C = {
  crimson: "#821719",
  crimsonDark: "#5E1012",
  gold: "#CF9E37",
  blush: "#F9EDE8",
  orange: "#D45E00",
  green: "#3F6B4A",
  purple: "#5B3B7A",
  ink: "#2A1414",
  inkSoft: "#6B4E4E",
  white: "#FFFFFF",
  line: "#E4D3C8",
};

export const inputStyle = {
  width: "100%",
  padding: "10px 11px",
  borderRadius: 9,
  border: `1.5px solid ${C.line}`,
  fontSize: 14,
  boxSizing: "border-box",
  fontFamily: "inherit",
};

export function cardStyle(extra = {}) {
  return {
    background: C.white,
    borderRadius: 14,
    padding: 16,
    boxShadow: "0 1px 3px rgba(43,20,20,0.08)",
    border: `1px solid ${C.line}`,
    ...extra,
  };
}

export const STAGE = { VITALS: "vitals", OPHTHAL: "ophthal", DOCTOR: "doctor", SURGERY: "surgery", DONE: "done" };

export const STAGE_META = {
  [STAGE.VITALS]: { label: "Vitals", color: C.gold, role: "vitals" },
  [STAGE.OPHTHAL]: { label: "Eye Check", color: C.orange, role: "ophthal" },
  [STAGE.DOCTOR]: { label: "Doctor", color: C.crimson, role: "doctor" },
  [STAGE.SURGERY]: { label: "Surgery", color: C.purple, role: "surgery" },
  [STAGE.DONE]: { label: "Done", color: C.green, role: null },
};

export const ROLES = ["admin", "coordinator", "registration", "vitals", "ophthal", "doctor", "surgery"];
