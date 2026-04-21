import { useEffect, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import { getCareerMatches } from "../api/careerApi";
import { getSkillGaps } from "../api/skillsApi";

export default function Career() {
  const [matches, setMatches] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [gaps, setGaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [gapLoading, setGapLoading] = useState(false);

  useEffect(() => {
    getCareerMatches()
      .then((data) => {
        setMatches(data ?? []);
        if (data?.[0]) {
          setSelectedId(data[0].career.career_id);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    setGapLoading(true);
    getSkillGaps(selectedId)
      .then(setGaps)
      .catch(console.error)
      .finally(() => setGapLoading(false));
  }, [selectedId]);

  const selectedMatch = matches.find((m) => m.career.career_id === selectedId);

  return (
    <DashboardLayout>
      <div className="space-y-8">

        <div>
          <h1 className="text-3xl font-bold text-slate-800">Career alignment</h1>
          <p className="text-slate-500 mt-1">Your top career matches based on enrolled courses and existing skills.</p>
        </div>

        {loading && <div className="text-slate-400">Calculating matches…</div>}

        {/* Match cards */}
        {!loading && (
          <div className="grid md:grid-cols-3 gap-5">
            {matches.map((m) => {
              const isSelected = m.career.career_id === selectedId;
              const matchedCount = Object.keys(m.matched_skills ?? {}).length;
              const missingCount = Object.keys(m.missing_skills ?? {}).length;
              return (
                <button
                  key={m.career.career_id}
                  onClick={() => setSelectedId(m.career.career_id)}
                  className={`text-left rounded-2xl p-5 shadow-sm border-2 transition ${
                    isSelected ? "border-primary bg-indigo-50" : "border-transparent bg-white hover:border-slate-200"
                  }`}
                >
                  {/* Score */}
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-2xl font-bold ${isSelected ? "text-primary" : "text-slate-800"}`}>
                      {m.match_pct}%
                    </span>
                    {m.career.entry_level && (
                      <span className="text-[10px] px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full font-medium">Entry level</span>
                    )}
                  </div>

                  {/* Progress bar */}
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mb-3">
                    <div
                      className={`h-full rounded-full transition-all ${m.match_pct >= 70 ? "bg-emerald-400" : m.match_pct >= 40 ? "bg-amber-400" : "bg-rose-400"}`}
                      style={{ width: `${m.match_pct}%` }}
                    />
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

        {/* Detail panel for selected career */}
        {selectedMatch && (
          <div className="bg-white rounded-2xl shadow-sm p-6 space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-800">{selectedMatch.career.title}</h2>
                <p className="text-sm text-slate-500 mt-1">{selectedMatch.career.description}</p>
              </div>
              <span className="text-3xl font-bold text-primary">{selectedMatch.match_pct}%</span>
            </div>

            {/* Matched skills */}
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

            {/* Skill gaps */}
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Skill gaps to close</h3>
              {gapLoading ? (
                <p className="text-sm text-slate-400">Loading gaps…</p>
              ) : gaps.length === 0 ? (
                <p className="text-sm text-emerald-600 font-medium">No gaps! You're fully qualified for this role.</p>
              ) : (
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

                      {/* Level bar */}
                      <div className="flex gap-1 mb-3">
                        {Array.from({ length: 5 }, (_, i) => (
                          <div
                            key={i}
                            className={`flex-1 h-1.5 rounded-full ${
                              i < gap.current_level ? "bg-primary" : i < gap.required_level ? "bg-rose-200" : "bg-slate-100"
                            }`}
                          />
                        ))}
                      </div>

                      {/* Courses to close gap */}
                      {gap.courses_to_close?.length > 0 && (
                        <div>
                          <p className="text-xs text-slate-400 mb-1.5">Courses that teach this skill:</p>
                          <div className="flex flex-wrap gap-1.5">
                            {gap.courses_to_close.slice(0, 4).map((c) => (
                              <span key={c.code} className="text-xs px-2 py-0.5 bg-indigo-50 text-primary rounded-lg font-mono">
                                {c.code}
                              </span>
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
    </DashboardLayout>
  );
}
