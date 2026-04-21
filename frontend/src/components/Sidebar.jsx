import { NavLink, useNavigate } from "react-router-dom";

export default function Sidebar() {
	const navigate = useNavigate();

	const linkStyle = ({ isActive }) =>
		isActive
			? "block bg-primary bg-primary rounded-xl px-4 py-3"
			: "block px-4 py-3 hover:bg-white/10 rounded-x1"

	const handleLogout = () => {
		// 1. Clear your auth tokens (localStorage/Cookies)
		localStorage.removeItem("token"); 
    
		// 2. Redirect to login page
		navigate("/login");
	};

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

		<NavLink className={linkStyle} to="/courses">
			Courses
		</NavLink>

        <NavLink className={linkStyle} to="/assignments">
          Assignments
        </NavLink>

        <NavLink className={linkStyle} to="/career">
          Career
        </NavLink>

        <NavLink className={linkStyle} to="/skills">
          Skills
        </NavLink>

        <NavLink className={linkStyle} to="/recommendations">
          AI Advice
        </NavLink>

		<NavLink className={linkStyle} to="/chat">
			AI Chat
		</NavLink>

        <NavLink className={linkStyle} to="/settings">
          Settings
        </NavLink>
      </nav>

		{/* Logout Button Section */}
      <div className="pt-6 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="w-full text-left px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}
