import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getMe } from "../api/authApi";

const NAV = [
  { to: "/",            label: "Home",      icon: "🏠", end: true },
  { to: "/calendar",    label: "Calendar",  icon: "📅" },
  { to: "/courses",     label: "Courses",   icon: "📚" },
  { to: "/programme",   label: "Programme", icon: "📋" },
  { to: "/career",      label: "Career",    icon: "🎯" },
  { to: "/skills",      label: "Skills",    icon: "📊" },
  { to: "/chat",        label: "AI Chat",   icon: "🤖" },
  { to: "/settings",    label: "Settings",  icon: "⚙️" },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    getMe().then((u) => setUserEmail(u.email || "")).catch(() => {});
  }, []);

  const linkStyle = ({ isActive }) =>
    isActive
      ? "flex items-center gap-3 bg-primary rounded-xl px-4 py-2.5 text-white font-medium text-sm"
      : "flex items-center gap-3 px-4 py-2.5 hover:bg-white/10 rounded-xl text-white/80 hover:text-white text-sm transition-colors";

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <aside className="w-64 bg-darknav text-white min-h-screen flex flex-col p-5 shadow-xl shrink-0">
      {/* Brand */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">MESA.I</h1>
        <p className="text-white/40 text-xs mt-1">Career-driven smart timetable</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1">
        {NAV.map(({ to, label, icon, end }) => (
          <NavLink key={to} to={to} end={end} className={linkStyle}>
            <span className="text-base leading-none">{icon}</span>
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User + sign out */}
      <div className="pt-5 border-t border-white/10 space-y-1">
        {userEmail && (
          <div className="px-4 py-2 text-xs text-white/40 truncate">{userEmail}</div>
        )}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-red-400 hover:bg-red-500/10 rounded-xl text-sm transition-colors"
        >
          <span className="text-base">🚪</span>
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  );
}
