import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Onboarding() {
  const navigate = useNavigate();
  const [interests, setInterests] = useState("");

  const handleSubmit = () => {
    // TODO: send to backend
    localStorage.setItem("interests", interests);
    navigate("/");
  };

  return (
    <div style={{ padding: 40 }}>
      <h1>Onboarding</h1>

      <p>What are your interests?</p>

      <input
        placeholder="AI, startups, partying..."
        value={interests}
        onChange={(e) => setInterests(e.target.value)}
      />

      <br />

      <button onClick={handleSubmit}>
        Continue
      </button>
    </div>
  );
}
