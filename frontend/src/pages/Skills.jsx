import { useEffect, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import { getMySkills } from "../api/skillsApi";

const CATEGORY_ORDER = ["Security", "Programming", "Systems", "Data", "Soft Skills"];

const LEVEL_LABELS = ["None", "Intro", "Familiar", "Competent", "Proficient", "Expert"];
const LEVEL_COLORS = [
  "bg-slate-200",
  "bg-amber-300",
  "bg-yellow-400",
  "bg-blue-400",
  "bg-primary",
  "bg-emerald-500",
];

export default function Skills() {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMySkills()
      .then(setSkills)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const byCategory = CATEGORY_ORDER.reduce((acc, cat) => {
    acc[cat] = skills.filter((s) => s.category === cat);
    return acc;
  }, {});

  const totalSkills = skills.length;
  const avgLevel = totalSkills > 0
    ? (skills.reduce((s, sk) => s + sk.level, 0) / totalSkills).toFixed(1)
    : 0;

  return (
    <DashboardLayout>
      <div className="space-y-8">

        <div>
          <h1 className="text-3xl font-bold text-slate-800">Skills map</h1>
          <p className="text-slate-500 mt-1">Your skill levels across all areas, built from enrolled courses and prior knowledge.</p>
        </div>

        {loading && <div className="text-slate-400">Loading skills…</div>}

        {!loading && (
          <>
            {/* Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl p-5 shadow-sm">
                <p className="text-xs text-slate-400 uppercase tracking-wide">Skills tracked</p>
                <p className="text-3xl font-bold text-slate-800 mt-1">{totalSkills}</p>
              </div>
              <div className="bg-white rounded-2xl p-5 shadow-sm">
                <p className="text-xs text-slate-400 uppercase tracking-wide">Average level</p>
                <p className="text-3xl font-bold text-slate-800 mt-1">{avgLevel}<span className="text-base text-slate-400">/5</span></p>
              </div>
              <div className="bg-white rounded-2xl p-5 shadow-sm">
                <p className="text-xs text-slate-400 uppercase tracking-wide">Expert skills</p>
                <p className="text-3xl font-bold text-emerald-500 mt-1">{skills.filter((s) => s.level >= 5).length}</p>
              </div>
              <div className="bg-white rounded-2xl p-5 shadow-sm">
                <p className="text-xs text-slate-400 uppercase tracking-wide">From prior knowledge</p>
                <p className="text-3xl font-bold text-amber-500 mt-1">{skills.filter((s) => s.sources?.includes("prior_knowledge")).length}</p>
              </div>
            </div>

            {/* Skills by category */}
            {CATEGORY_ORDER.map((cat) => {
              const catSkills = byCategory[cat];
              if (!catSkills?.length) return null;
              return (
                <div key={cat} className="bg-white rounded-2xl shadow-sm p-6">
                  <h2 className="font-semibold text-slate-800 mb-4">{cat}</h2>
                  <div className="space-y-4">
                    {catSkills
                      .sort((a, b) => b.level - a.level)
                      .map((sk) => (
                        <div key={sk.skill_id}>
                          <div className="flex items-center justify-between mb-1.5">
                            <div>
                              <span className="text-sm font-medium text-slate-700">{sk.name}</span>
                              {sk.sources?.includes("prior_knowledge") && (
                                <span className="ml-2 text-[10px] px-1.5 py-0.5 bg-amber-100 text-amber-600 rounded-full">prior</span>
                              )}
                            </div>
                            <div className="text-right">
                              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full text-white ${LEVEL_COLORS[sk.level]}`}>
                                {LEVEL_LABELS[sk.level]}
                              </span>
                              <span className="text-xs text-slate-400 ml-2">{sk.level}/5</span>
                            </div>
                          </div>

                          {/* Progress bar */}
                          <div className="flex gap-1">
                            {Array.from({ length: 5 }, (_, i) => (
                              <div
                                key={i}
                                className={`flex-1 h-2 rounded-full transition-all ${i < sk.level ? LEVEL_COLORS[sk.level] : "bg-slate-100"}`}
                              />
                            ))}
                          </div>

                          {/* Sources */}
                          {sk.sources?.filter((s) => s !== "prior_knowledge").length > 0 && (
                            <p className="text-[10px] text-slate-400 mt-1">
                              From: {sk.sources.filter((s) => s !== "prior_knowledge").join(", ")}
                            </p>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              );
            })}

            {totalSkills === 0 && (
              <div className="bg-white rounded-2xl shadow-sm p-8 text-center text-slate-400">
                No skills yet — enroll in courses or set your existing skills on the profile to get started.
              </div>
            )}
          </>
        )}

      </div>
    </DashboardLayout>
  );
}
