import { useEffect, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import CourseReviews from "../components/CourseReviews";
import ConflictBanner from "../components/ConflictBanner";

import {
  getAllCourses,
  getMyCourses,
  enrollCourse,
  unenrollCourse,
  getConflicts,
} from "../api/courseApi";

const SOURCE_TABS = ["All", "TalTech", "EuroTeQ", "Erasmus"];
const SOURCE_KEY = { All: null, TalTech: "taltech", EuroTeQ: "euroteq", Erasmus: "erasmus" };

const SOURCE_BADGE = {
  taltech: "bg-blue-100 text-blue-700",
  euroteq: "bg-violet-100 text-violet-700",
  erasmus: "bg-orange-100 text-orange-700",
};
const SOURCE_LABEL = { taltech: "TalTech", euroteq: "EuroTeQ", erasmus: "Erasmus" };

function timeToMinutes(str) {
  const [h, m] = str.split(":").map(Number);
  return h * 60 + m;
}

function courseConflictsWithEnrolled(course, myCourses) {
  const mySlots = myCourses.flatMap((e) => e.course?.schedule ?? []);
  for (const slot of course.schedule ?? []) {
    const sStart = timeToMinutes(slot.start);
    const sEnd = timeToMinutes(slot.end);
    for (const ms of mySlots) {
      if (ms.day !== slot.day) continue;
      if (sStart < timeToMinutes(ms.end) && sEnd > timeToMinutes(ms.start)) return true;
    }
  }
  return false;
}

export default function Courses() {
  const [allCourses, setAllCourses] = useState([]);
  const [myCourses, setMyCourses] = useState([]);
  const [reviewsCourse, setReviewsCourse] = useState(null);
  const [conflicts, setConflicts] = useState([]);
  const [conflictsDismissed, setConflictsDismissed] = useState(false);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [sourceTab, setSourceTab] = useState("All");
  const [hideConflicts, setHideConflicts] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const [all, mine, conflictData] = await Promise.all([
        getAllCourses(),
        getMyCourses(),
        getConflicts().catch(() => ({ conflicts: [] })),
      ]);
      setAllCourses(Array.isArray(all) ? all : []);
      setMyCourses(Array.isArray(mine) ? mine : []);
      setConflicts(conflictData?.conflicts ?? []);
    } catch (err) {
      console.error(err);
      setError("Failed to load courses.");
    } finally {
      setLoading(false);
    }
  };

  const isEnrolled = (courseId) => myCourses.some((c) => c.course?.id === courseId);

  const filteredCourses = allCourses.filter((c) => {
    const q = search.toLowerCase();
    if (q && !c.name.toLowerCase().includes(q) && !c.code.toLowerCase().includes(q) &&
        !(c.skills_taught ?? []).some((s) => s.toLowerCase().includes(q))) return false;
    const srcKey = SOURCE_KEY[sourceTab];
    if (srcKey && (c.source ?? "taltech") !== srcKey) return false;
    if (hideConflicts && !isEnrolled(c.id) && courseConflictsWithEnrolled(c, myCourses)) return false;
    return true;
  });

  const handleEnroll = async (courseId) => {
    try {
      setActionLoading(courseId);
      setError("");
      await enrollCourse(courseId);
      await loadData();
    } catch (err) {
      if (err.response?.status === 409) setError("You are already enrolled in this course.");
      else setError("Failed to enroll.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnenroll = async (courseId) => {
    try {
      setActionLoading(courseId);
      setError("");
      await unenrollCourse(courseId);
      await loadData();
    } catch (err) {
      if (err.response?.status === 404) setError("Enrollment not found.");
      else setError("Failed to unenroll.");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Courses</h1>
            <p className="text-slate-500 mt-1">Manage your enrolled subjects and browse available courses.</p>
          </div>
          <button onClick={loadData} className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 transition">
            Refresh
          </button>
        </div>

        {!conflictsDismissed && (
          <ConflictBanner conflicts={conflicts} onDismiss={() => setConflictsDismissed(true)} />
        )}
        {error && <div className="bg-red-100 text-red-700 px-4 py-3 rounded-xl">{error}</div>}

        {loading ? (
          <div className="bg-white rounded-2xl shadow-sm p-8">Loading courses...</div>
        ) : (
          <>
            {/* My Courses */}
            <section>
              <h2 className="text-xl font-semibold text-slate-800 mb-4">My Courses</h2>
              {myCourses.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm p-6 text-slate-500">You are not enrolled in any courses yet.</div>
              ) : (
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {myCourses.map((enrollment) => {
                    const c = enrollment.course;
                    return (
                      <div key={enrollment.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="text-lg font-semibold">{c.name}</h3>
                            <p className="text-sm text-slate-500 mt-0.5">{c.code}</p>
                          </div>
                          <div className="flex flex-col items-end gap-1 shrink-0">
                            {c.ects && <span className="text-xs bg-indigo-50 text-primary px-2 py-1 rounded-full">{c.ects} ECTS</span>}
                            {c.source && c.source !== "taltech" && (
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${SOURCE_BADGE[c.source] ?? ""}`}>
                                {SOURCE_LABEL[c.source] ?? c.source}
                              </span>
                            )}
                          </div>
                        </div>
                        {c.description && <p className="text-sm text-slate-600 mt-3 line-clamp-2">{c.description}</p>}
                        {(c.skills_taught ?? []).length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-3">
                            {c.skills_taught.slice(0, 4).map((s) => (
                              <span key={s} className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full font-mono">{s.replace(/_/g, " ")}</span>
                            ))}
                          </div>
                        )}
                        <div className="mt-5 flex gap-2">
                          <button onClick={() => handleUnenroll(c.id)} disabled={actionLoading === c.id}
                            className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-xl transition disabled:opacity-60 text-sm">
                            {actionLoading === c.id ? "Removing..." : "Unenroll"}
                          </button>
                          <button onClick={() => setReviewsCourse(c)}
                            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm transition">
                            Reviews
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* All Courses */}
            <section>
              <h2 className="text-xl font-semibold text-slate-800 mb-4">All Courses</h2>

              {/* Source tabs */}
              <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit mb-4">
                {SOURCE_TABS.map((t) => (
                  <button key={t} onClick={() => setSourceTab(t)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${sourceTab === t ? "bg-white shadow-sm text-slate-800" : "text-slate-500 hover:text-slate-700"}`}>
                    {t}
                  </button>
                ))}
              </div>

              {/* Search + conflict toggle */}
              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <input
                  type="text"
                  placeholder="Search by name, code, or skill…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer select-none whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={hideConflicts}
                    onChange={(e) => setHideConflicts(e.target.checked)}
                    className="rounded accent-primary"
                  />
                  Hide schedule conflicts
                </label>
              </div>

              {filteredCourses.length === 0 && (
                <div className="bg-white rounded-2xl shadow-sm p-6 text-slate-400 text-sm">No courses match your filters.</div>
              )}

              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredCourses.map((course) => {
                  const enrolled = isEnrolled(course.id);
                  const src = course.source ?? "taltech";
                  return (
                    <div key={course.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex flex-col">
                      <div className="flex justify-between gap-3 mb-1">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base font-semibold text-slate-800">{course.name}</h3>
                          <p className="text-xs text-slate-500 mt-0.5">{course.code}{course.semester ? ` · ${course.semester}` : ""}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          {course.ects && <span className="text-xs bg-indigo-50 text-primary px-2 py-0.5 rounded-full">{course.ects} ECTS</span>}
                          {src !== "taltech" && (
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${SOURCE_BADGE[src] ?? ""}`}>
                              {SOURCE_LABEL[src] ?? src}
                            </span>
                          )}
                          {enrolled && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Enrolled</span>}
                        </div>
                      </div>

                      {course.description && (
                        <p className="text-sm text-slate-600 mt-2 line-clamp-2 flex-1">{course.description}</p>
                      )}

                      {(course.skills_taught ?? []).length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-3">
                          {course.skills_taught.slice(0, 5).map((s) => (
                            <span key={s} className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full font-mono">{s.replace(/_/g, " ")}</span>
                          ))}
                          {course.skills_taught.length > 5 && (
                            <span className="text-[10px] text-slate-400">+{course.skills_taught.length - 5}</span>
                          )}
                        </div>
                      )}

                      <div className="mt-4 flex gap-2">
                        {!enrolled ? (
                          <button onClick={() => handleEnroll(course.id)} disabled={actionLoading === course.id}
                            className="flex-1 bg-primary text-white py-2 rounded-xl hover:opacity-90 transition disabled:opacity-60 text-sm">
                            {actionLoading === course.id ? "Enrolling..." : "Enroll"}
                          </button>
                        ) : (
                          <button onClick={() => handleUnenroll(course.id)} disabled={actionLoading === course.id}
                            className="flex-1 bg-slate-200 text-slate-800 py-2 rounded-xl hover:bg-slate-300 transition disabled:opacity-60 text-sm">
                            {actionLoading === course.id ? "Updating..." : "Unenroll"}
                          </button>
                        )}
                        <button onClick={() => setReviewsCourse(course)}
                          className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm transition">
                          Reviews
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </>
        )}
      </div>
      {reviewsCourse && (
        <CourseReviews course={reviewsCourse} onClose={() => setReviewsCourse(null)} />
      )}
    </DashboardLayout>
  );
}
