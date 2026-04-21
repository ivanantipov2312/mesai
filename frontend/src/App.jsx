import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register.jsx"
import Dashboard from "./pages/Dashboard";
import Calendar from "./pages/Calendar";
import Assignments from "./pages/Assignments";
import Events from "./pages/Events";
import Recommendations from "./pages/Recommendations";
import Onboarding from "./pages/Onboarding";
import Chat from "./pages/Chat.jsx"

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public */}
        <Route path="/login" element={<Login />}/>
		<Route path="/register" element={<Register />}/>
        <Route path="/onboarding" element={<Onboarding />} />

        {/* Protected */}
        <Route path="/" element={<Dashboard />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/assignments" element={<Assignments />} />
        <Route path="/events" element={<Events />} />
		<Route path="/chat" element={<Chat />} />
        <Route path="/recommendations" element={<Recommendations />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
