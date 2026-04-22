import { useEffect, useState, useRef } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import { getCareerMatches, analyzeCv } from "../api/careerApi";
import { getSkillGaps } from "../api/skillsApi";

const TABS = ["Matches", "CV Analysis"];

export default function Career() {
  const [tab, setTab] = useState("Matches");

  // Matches tab
  const [matches, setMatches] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [gaps, setGaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [gapLoading, setGapLoading] = useState(false);

  // CV tab
  const [cvText, setCvText] = useState("");
  const [cvFile, setCvFile] = useState(null);
  const [cvAnalysis, setCvAnalysis] = useState(null);
  const [cvLoading, setCvLoading] = useState(false);
  const [cvError, setCvError] = useState("");
  const fileRef = useRef(null);

  useEffect(() => {
    getCareerMatches()
      .then((data) => {
        setMatches(data ?? []);
        if (data?.[0]) setSelectedId(data[0].career.career_id);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    setGapLoading(true);
    getSkillGaps(selectedId).then(setGaps).catch(console.error).finally(() => setGapLoading(false));
  }, [selectedId]);

  const selectedMatch = matches.find((m) => m.career.career_id === selectedId);

  const handleCvAnalyze = async () => {
    setCvLoading(true);
    setCvError("");
    setCvAnalysis(null);
    try {
      const fd = new FormData();
      if (cvFile) fd.append("file", cvFile);
      else if (cvText.trim()) fd.append("text", cvText.trim());
      else { setCvError("Please upload a file or paste your CV text."); setCvLoading(false); return; }
      const res = await analyzeCv(fd);
      setCvAnalysis(res.analysis);
    } catch (e) {
      setCvError(e.response?.data?.detail || "Analysis failed. Please try again.");
    } finally {
      setCvLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">

        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Career</h1>
            <p className="text-slate-500 mt-1">Explore career matches or analyze your CV for a personalized assessment.</p>
          </div>
          <div className="flex gap-1 bg-slate-100 p-1 rounded-xl self-start">
            {TABS.map((t) => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${tab === t ? "bg-white shadow-sm text-slate-800" : "text-slate-500 hover:text-slate-700"}`}>
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* ── MATCHES TAB ── */}
        {tab === "Matches" && (
          <div className="space-y-6">
            {loading && <div className="text-slate-400">Calculating matches…</div>}

            {!loading && (
              <div className="grid md:grid-cols-3 gap-5">
                {matches.map((m) => {
                  const isSelected = m.career.career_id === selectedId;
                  const matchedCount = Object.keys(m.matched_skills ?? {}).length;
                  const missingCount = Object.keys(m.missing_skills ?? {}).length;
                  return (
                    <button key={m.career.career_id} onClick={() => setSelectedId(m.career.career_id)}
                      className={`text-left rounded-2xl p-5 shadow-sm border-2 transition ${isSelected ? "border-primary bg-indigo-50" : "border-transparent bg-white hover:border-slate-200"}`}>
                      <div className="flex items-center justify-between mb-3">
                        <span className={`text-2xl font-bold ${isSelected ? "text-primary" : "text-slate-800"}`}>{m.match_pct}%</span>
                        {m.career.entry_level && <span className="text-[10px] px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full font-medium">Entry level</span>}
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mb-3">
                        <div className={`h-full rounded-full transition-all ${m.match_pct >= 70 ? "bg-emerald-400" : m.match_pct >= 40 ? "bg-amber-400" : "bg-rose-400"}`} style={{ width: `${m.match_pct}%` }} />
                      </div>
                      <h3 className="font-semibold text-slate-800 mb-1">{m.career.title}</h3>
                      <p className="text-xs text-slate-400 mb-3 line-clamp-2">{m.career.description}</p>
                      <div className="flex gap-3 text-xs text-slate-500">
                        <span className="text-emerald-600 font-medium">✓ {matchedCount} skills</span>
                        <span className="text-rose-500 font-medium">✗ {missingCount} gaps</span>
                      </div>
                      {m.career.avg_salary_eur && (
                        <p className="text-xs text-slate-400 mt-2">~€{(m.career.avg_salary_eur / 1000).toFixed(0)}k/yr · {m.career.demand_level} demand</p>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {selectedMatch && (
              <div className="bg-white rounded-2xl shadow-sm p-6 space-y-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-slate-800">{selectedMatch.career.title}</h2>
                    <p className="text-sm text-slate-500 mt-1">{selectedMatch.career.description}</p>
                  </div>
                  <span className="text-3xl font-bold text-primary">{selectedMatch.match_pct}%</span>
                </div>

                {Object.keys(selectedMatch.matched_skills ?? {}).length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-slate-700 mb-2">Skills you already have</h3>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(selectedMatch.matched_skills).map(([skill, { user_level, required }]) => (
                        <span key={skill} className="text-xs px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
                          {skill.replace(/_/g, " ")} · {user_level}/{required}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="text-sm font-semibold text-slate-700 mb-3">Skill gaps to close</h3>
                  {gapLoading ? <p className="text-sm text-slate-400">Loading gaps…</p> :
                    gaps.length === 0 ? <p className="text-sm text-emerald-600 font-medium">No gaps! You're fully qualified for this role.</p> : (
                      <div className="space-y-4">
                        {gaps.map((gap) => (
                          <div key={gap.skill_id} className="border border-slate-100 rounded-xl p-4">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <span className="font-medium text-sm text-slate-800">{gap.name}</span>
                                <span className="ml-2 text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded-full">{gap.category}</span>
                              </div>
                              <span className="text-xs text-rose-500 font-semibold">Need lvl {gap.required_level} · Have {gap.current_level}</span>
                            </div>
                            <div className="flex gap-1 mb-3">
                              {Array.from({ length: 5 }, (_, i) => (
                                <div key={i} className={`flex-1 h-1.5 rounded-full ${i < gap.current_level ? "bg-primary" : i < gap.required_level ? "bg-rose-200" : "bg-slate-100"}`} />
                              ))}
                            </div>
                            {gap.courses_to_close?.length > 0 && (
                              <div>
                                <p className="text-xs text-slate-400 mb-1.5">Courses that teach this skill:</p>
                                <div className="flex flex-wrap gap-1.5">
                                  {gap.courses_to_close.slice(0, 4).map((c) => (
                                    <span key={c.code} className="text-xs px-2 py-0.5 bg-indigo-50 text-primary rounded-lg font-mono">{c.code}</span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── CV ANALYSIS TAB ── */}
        {tab === "CV Analysis" && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm p-6 space-y-5">
              <div>
                <h2 className="text-base font-semibold text-slate-800">Upload or paste your CV</h2>
                <p className="text-xs text-slate-400 mt-1">Supports PDF, DOCX, and TXT. Your CV is sent to AI for analysis and not stored.</p>
              </div>

              {/* File upload */}
              <div
                onClick={() => fileRef.current?.click()}
                className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center cursor-pointer hover:border-primary/50 hover:bg-indigo-50/30 transition"
              >
                <input ref={fileRef} type="file" accept=".pdf,.docx,.txt" className="hidden"
                  onChange={(e) => { setCvFile(e.target.files[0] || null); setCvText(""); }} />
                {cvFile ? (
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-sm font-medium text-slate-700">{cvFile.name}</span>
                    <button onClick={(e) => { e.stopPropagation(); setCvFile(null); }} className="text-slate-400 hover:text-rose-500 text-xs">✕ Remove</button>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm text-slate-500">Click to upload a file</p>
                    <p className="text-xs text-slate-400 mt-1">PDF, DOCX, or TXT</p>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-slate-100" />
                <span className="text-xs text-slate-400">or paste text</span>
                <div className="flex-1 h-px bg-slate-100" />
              </div>

              <textarea
                value={cvText}
                onChange={(e) => { setCvText(e.target.value); setCvFile(null); }}
                placeholder="Paste your CV content here…"
                rows={6}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />

              {cvError && <p className="text-sm text-rose-500">{cvError}</p>}

              <button onClick={handleCvAnalyze} disabled={cvLoading || (!cvFile && !cvText.trim())}
                className="w-full py-3 bg-primary text-white rounded-xl font-medium hover:opacity-90 transition disabled:opacity-50">
                {cvLoading ? "Analyzing…" : "Analyze CV"}
              </button>
            </div>

            {/* Results */}
            {cvAnalysis && (
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-base font-semibold text-slate-800 mb-4">Analysis results</h2>
                <div className="whitespace-pre-wrap text-sm text-slate-700 leading-relaxed font-mono bg-slate-50 rounded-xl p-4">
                  {cvAnalysis}
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
