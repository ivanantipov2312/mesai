import { NavLink } from "react-router-dom";

export default function Sidebar() {
	const linkStyle = ({ isActive }) =>
		isActive
			? "block bg-primary bg-primary rounded-xl px-4 py-3"
			: "block px-4 py-3 hover:bg-white/10 rounded-x1"

  return (
    <aside className="w-72 bg-darknav text-white min-h-screen rounded-r-3xl p-6 shadow-xl">
      <h1 className="text-3xl font-bold mb-10">MESA.I</h1>

      <nav className="space-y-3">

        <NavLink className={linkStyle} to="/" end>
          Home
        </NavLink>

        <NavLink className={linkStyle} to="/calendar">
          Calendar
        </NavLink>

        <NavLink className={linkStyle} to="/assignments">
          Assignments
        </NavLink>

        <NavLink className={linkStyle} to="/events">
          Events
        </NavLink>

        <NavLink className={linkStyle} to="/recommendations">
          AI Advice
        </NavLink>

      </nav>
    </aside>
  );
}
