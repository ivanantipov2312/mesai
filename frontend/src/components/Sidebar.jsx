import { Link } from "react-router-dom";

export default function Sidebar() {
  return (
    <aside className="w-72 bg-darknav text-white min-h-screen rounded-r-3xl p-6 shadow-xl">
      <h1 className="text-3xl font-bold mb-10">MESA.I</h1>

      <nav className="space-y-3">

        <Link className="block bg-primary rounded-xl px-4 py-3" to="/">
          Home
        </Link>

        <Link className="block px-4 py-3 hover:bg-white/10 rounded-xl" to="/calendar">
          Calendar
        </Link>

        <Link className="block px-4 py-3 hover:bg-white/10 rounded-xl" to="/assignments">
          Assignments
        </Link>

        <Link className="block px-4 py-3 hover:bg-white/10 rounded-xl" to="/events">
          Events
        </Link>

        <Link className="block px-4 py-3 hover:bg-white/10 rounded-xl" to="/recommendations">
          AI Advice
        </Link>

      </nav>
    </aside>
  );
}
