import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { updateMe } from "../api/authApi";

const PROGRAMS = [
  "Cybersecurity Engineering",
  "Computer Science",
  "IT Systems Administration",
  "Software Engineering",
  "Artificial Intelligence",
  "Data Science",
  "Computer and System Engineering",
  "Other",
];

const CAREER_OPTIONS = [
  { id: "soc_analyst", label: "SOC Analyst" },
  { id: "penetration_tester", label: "Penetration Tester" },
  { id: "security_engineer", label: "Security Engineer" },
  { id: "software_developer", label: "Software Developer" },
  { id: "devops_engineer", label: "DevOps Engineer" },
  { id: "data_analyst", label: "Data Analyst" },
  { id: "it_systems_admin", label: "IT Systems Admin" },
  { id: "cloud_security_engineer", label: "Cloud Security Engineer" },
];

const SKILL_OPTIONS = [
  "python", "java", "javascript", "c_cpp", "sql", "bash_scripting",
  "linux_admin", "windows_admin", "networking", "cloud_computing",
  "containerization", "network_security", "cryptography", "penetration_testing",
  "incident_response", "data_analysis", "machine_learning",
];

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [program, setProgram] = useState("");
  const [semester, setSemester] = useState(1);
  const [careers, setCareers] = useState([]);
  const [skills, setSkills] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const toggleCareer = (id) =>
    setCareers((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  const toggleSkill = (id) =>
    setSkills((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  const finish = async () => {
    setSaving(true);
    setError("");
    try {
      await updateMe({ program, semester: Number(semester), career_interests: careers, existing_skills: skills });
      navigate("/");
    } catch (e) {
      setError("Could not save profile — please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-softbg flex items-center justify-center px-4">
      <div className="w-full max-w-lg">

        {/* Progress */}
        <div className="flex gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className={`flex-1 h-1.5 rounded-full transition-all ${s <= step ? "bg-primary" : "bg-slate-200"}`} />
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-8">

          {/* ── Step 1: Program ── */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h1 className="text-2xl font-bold text-slate-800">Welcome to MESA.I</h1>
                <p className="text-slate-400 mt-1">Let's set up your academic profile.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Program</label>
                <select
                  value={program}
                  onChange={(e) => setProgram(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select your program…</option>
                  {PROGRAMS.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Semester</label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <button
                disabled={!program}
                onClick={() => setStep(2)}
                className="w-full py-3 bg-primary text-white rounded-xl font-medium disabled:opacity-40 hover:opacity-90 transition"
              >
                Continue
              </button>
            </div>
          )}

          {/* ── Step 2: Career interests ── */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h1 className="text-2xl font-bold text-slate-800">Career goals</h1>
                <p className="text-slate-400 mt-1">Pick the roles you're aiming for. MESA.I will track your progress toward them.</p>
              </div>

              <div className="flex flex-wrap gap-2">
                {CAREER_OPTIONS.map(({ id, label }) => (
                  <button
                    key={id}
                    onClick={() => toggleCareer(id)}
                    className={`px-4 py-2 rounded-full text-sm font-medium border transition ${
                      careers.includes(id)
                        ? "bg-primary text-white border-primary"
                        : "bg-white text-slate-600 border-slate-200 hover:border-primary"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="flex-1 py-3 border border-slate-200 text-slate-600 rounded-xl text-sm hover:bg-slate-50 transition">Back</button>
                <button
                  disabled={careers.length === 0}
                  onClick={() => setStep(3)}
                  className="flex-1 py-3 bg-primary text-white rounded-xl font-medium disabled:opacity-40 hover:opacity-90 transition"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* ── Step 3: Existing skills ── */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <h1 className="text-2xl font-bold text-slate-800">Your existing skills</h1>
                <p className="text-slate-400 mt-1">What do you already know? This helps MESA.I personalise your gap analysis.</p>
              </div>

              <div className="flex flex-wrap gap-2">
                {SKILL_OPTIONS.map((id) => (
                  <button
                    key={id}
                    onClick={() => toggleSkill(id)}
                    className={`px-3 py-1.5 rounded-full text-sm border font-mono transition ${
                      skills.includes(id)
                        ? "bg-primary text-white border-primary"
                        : "bg-white text-slate-600 border-slate-200 hover:border-primary"
                    }`}
                  >
                    {id.replace(/_/g, " ")}
                  </button>
                ))}
              </div>

              {error && <p className="text-sm text-rose-500">{error}</p>}

              <div className="flex gap-3">
                <button onClick={() => setStep(2)} className="flex-1 py-3 border border-slate-200 text-slate-600 rounded-xl text-sm hover:bg-slate-50 transition">Back</button>
                <button
                  onClick={finish}
                  disabled={saving}
                  className="flex-1 py-3 bg-primary text-white rounded-xl font-medium disabled:opacity-50 hover:opacity-90 transition"
                >
                  {saving ? "Saving…" : "Finish setup"}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
