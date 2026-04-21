import { BrowserRouter, Routes, Route } from "react-router-dom";

import ProtectedRoute from "./components/ProtectedRoute"
import Login from "./pages/Login";
import Register from "./pages/Register.jsx"
import Dashboard from "./pages/Dashboard";
import Calendar from "./pages/Calendar";
import Courses from "./pages/Courses"
import Assignments from "./pages/Assignments";
import Settings from "./pages/Settings";
import Recommendations from "./pages/Recommendations";
import Onboarding from "./pages/Onboarding";
import Chat from "./pages/Chat.jsx"
import Career from "./pages/Career.jsx"
import Skills from "./pages/Skills.jsx"

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public */}
        <Route path="/login" element={<Login />}/>
		<Route path="/register" element={<Register />}/>
        <Route path="/onboarding" element={<Onboarding />} />

        {/* Protected */}
	  <Route element={<ProtectedRoute /> }>
        <Route path="/" element={<Dashboard />} />
        <Route path="/calendar" element={<Calendar />} />
		<Route path="/courses" element={<Courses />} />
        <Route path="/assignments" element={<Assignments />} />
        <Route path="/settings" element={<Settings />} />
		<Route path="/chat" element={<Chat />} />
        <Route path="/career" element={<Career />} />
        <Route path="/skills" element={<Skills />} />
        <Route path="/recommendations" element={<Recommendations />} />
		</Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;
