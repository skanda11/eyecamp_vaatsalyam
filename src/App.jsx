import React, { useState } from "react";
import {
  LayoutDashboard, UserPlus, Activity, Eye, Stethoscope, Scissors, Users, LogOut,
} from "lucide-react";
import { useAuth } from "./AuthContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Register from "./pages/Register";
import Station from "./pages/Station";
import ManageUsers from "./pages/ManageUsers";
import { C } from "./styles";

const ALL_TABS = [
  { key: "dashboard", label: "Home", icon: LayoutDashboard, roles: "*" },
  { key: "register", label: "Register", icon: UserPlus, roles: ["admin", "coordinator", "registration"] },
  { key: "vitals", label: "Vitals", icon: Activity, roles: ["admin", "coordinator", "vitals"] },
  { key: "ophthal", label: "Eye", icon: Eye, roles: ["admin", "coordinator", "ophthal"] },
  { key: "doctor", label: "Doctor", icon: Stethoscope, roles: ["admin", "coordinator", "doctor"] },
  { key: "surgery", label: "Surgery", icon: Scissors, roles: ["admin", "coordinator", "surgery"] },
  { key: "users", label: "Staff", icon: Users, roles: ["admin"] },
];

export default function App() {
  const { user, role, name, loading, logout } = useAuth();
  const [tab, setTab] = useState("dashboard");

  if (loading) return <Centered>Loading…</Centered>;
  if (!user) return <Login />;
  if (!role) return <Centered>Your account isn't set up with a role yet — ask an admin to assign one.</Centered>;

  const tabs = ALL_TABS.filter((t) => t.roles === "*" || t.roles.includes(role));
  const activeTab = tabs.find((t) => t.key === tab) ? tab : "dashboard";

  return (
    <div style={{ minHeight: "100vh", background: C.blush, fontFamily: "system-ui, -apple-system, sans-serif", color: C.ink, paddingBottom: 76 }}>
      <div style={{ background: C.crimson, color: C.white, padding: "14px 16px", position: "sticky", top: 0, zIndex: 20 }}>
        <div style={{ maxWidth: 720, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontFamily: "Georgia, serif", fontSize: 18 }}>Eye Camp</div>
            <div style={{ fontSize: 12, opacity: 0.85, marginTop: 2 }}>{name} · {role}</div>
          </div>
          <button onClick={logout} style={{ background: "transparent", border: "none", color: "#FFD9D9", cursor: "pointer", display: "flex", alignItems: "center", gap: 5, fontSize: 12 }}>
            <LogOut size={15} /> Sign out
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "16px 14px" }}>
        {activeTab === "dashboard" && <Dashboard />}
        {activeTab === "register" && <Register />}
        {activeTab === "vitals" && <Station stage="vitals" title="Vitals" />}
        {activeTab === "ophthal" && <Station stage="ophthal" title="Eye Check" />}
        {activeTab === "doctor" && <Station stage="doctor" title="Doctor" />}
        {activeTab === "surgery" && <Station stage="surgery" title="Surgery" />}
        {activeTab === "users" && <ManageUsers />}
      </div>

      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: C.white, borderTop: `1px solid ${C.line}`, display: "flex", zIndex: 20 }}>
        {tabs.map((t) => {
          const Icon = t.icon;
          const active = activeTab === t.key;
          return (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              flex: 1, border: "none", background: "transparent", padding: "8px 2px 10px",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 3, cursor: "pointer",
              color: active ? C.crimson : C.inkSoft,
            }}>
              <Icon size={19} strokeWidth={active ? 2.4 : 1.8} />
              <span style={{ fontSize: 10, fontWeight: active ? 700 : 500 }}>{t.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Centered({ children }) {
  return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: C.blush, color: C.crimson, fontFamily: "system-ui", padding: 24, textAlign: "center" }}>{children}</div>;
}
