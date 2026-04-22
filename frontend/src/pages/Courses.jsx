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

export default function Courses() {
  const [allCourses, setAllCourses] = useState([]);
  const [myCourses, setMyCourses] = useState([]);
  const [reviewsCourse, setReviewsCourse] = useState(null);
  const [conflicts, setConflicts] = useState([]);
  const [conflictsDismissed, setConflictsDismissed] = useState(false);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  /**
   * Single source of truth:
   * Always fetch fresh backend data
   */
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

  const [search, setSearch] = useState("");
  const [semFilter, setSemFilter] = useState("");

  const isEnrolled = (courseId) => {
    return myCourses.some((course) => course.course?.id === courseId);
  };

  const filteredCourses = allCourses.filter((c) => {
    const q = search.toLowerCase();
    const matchText = !q || c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q) ||
      (c.skills_taught ?? []).some((s) => s.toLowerCase().includes(q));
    const matchSem = !semFilter || String(c.semester) === semFilter;
    return matchText && matchSem;
  });

  const handleEnroll = async (courseId) => {
    try {
      setActionLoading(courseId);
      setError("");

      await enrollCourse(courseId);

      // always reload backend truth
      await loadData();
    } catch (err) {
      console.error(err);

      if (err.response?.status === 409) {
        setError("You are already enrolled in this course.");
      } else {
        setError("Failed to enroll.");
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnenroll = async (courseId) => {
    try {
      setActionLoading(courseId);
      setError("");

      await unenrollCourse(courseId);

      // always reload backend truth
      await loadData();
    } catch (err) {
      console.error(err);

      if (err.response?.status === 404) {
        setError("Enrollment not found.");
      } else {
        setError("Failed to unenroll.");
      }
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
            <h1 className="text-3xl font-bold text-slate-800">
              Courses
            </h1>

            <p className="text-slate-500 mt-1">
              Manage your enrolled subjects and browse available courses.
            </p>
          </div>

          <button
            onClick={loadData}
            className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 transition"
          >
            Refresh
          </button>
        </div>

        {/* Conflict warnings */}
        {!conflictsDismissed && (
          <ConflictBanner conflicts={conflicts} onDismiss={() => setConflictsDismissed(true)} />
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-100 text-red-700 px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="bg-white rounded-2xl shadow-sm p-8">
            Loading courses...
          </div>
        ) : (
          <>
            {/* My Courses */}
            <section>
              <h2 className="text-xl font-semibold text-slate-800 mb-4">
                My Courses
              </h2>

              {myCourses.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm p-6 text-slate-500">
                  You are not enrolled in any courses yet.
                </div>
              ) : (
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {myCourses.map((enrollment) => {
                    const c = enrollment.course;
                    return (
                      <div
                        key={enrollment.id}
                        className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="text-lg font-semibold">{c.name}</h3>
                            <p className="text-sm text-slate-500 mt-0.5">{c.code}</p>
                          </div>
                          {c.ects && (
                            <span className="text-xs bg-indigo-50 text-primary px-2 py-1 rounded-full shrink-0">{c.ects} ECTS</span>
                          )}
                        </div>

                        {c.description && (
                          <p className="text-sm text-slate-600 mt-3 line-clamp-2">{c.description}</p>
                        )}

                        {(c.skills_taught ?? []).length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-3">
                            {c.skills_taught.slice(0, 4).map((s) => (
                              <span key={s} className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full font-mono">{s.replace(/_/g, " ")}</span>
                            ))}
                          </div>
                        )}

                        <div className="mt-5 flex gap-2">
                          <button
                            onClick={() => handleUnenroll(c.id)}
                            disabled={actionLoading === c.id}
                            className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-xl transition disabled:opacity-60 text-sm"
                          >
                            {actionLoading === c.id ? "Removing..." : "Unenroll"}
                          </button>
                          <button
                            onClick={() => setReviewsCourse(c)}
                            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm transition"
                          >
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
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
                <h2 className="text-xl font-semibold text-slate-800">All Courses</h2>
                <div className="flex gap-2 flex-1">
                  <input
                    type="text"
                    placeholder="Search by name, code, or skill…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <select
                    value={semFilter}
                    onChange={(e) => setSemFilter(e.target.value)}
                    className="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">All semesters</option>
                    {[1,2,3,4,5,6,7,8].map((s) => (
                      <option key={s} value={String(s)}>Sem {s}</option>
                    ))}
                  </select>
                </div>
              </div>

              {filteredCourses.length === 0 && (
                <div className="bg-white rounded-2xl shadow-sm p-6 text-slate-400 text-sm">No courses match your search.</div>
              )}

              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredCourses.map((course) => {
                  const enrolled = isEnrolled(course.id);

                  return (
                    <div
                      key={course.id}
                      className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex flex-col"
                    >
                      <div className="flex justify-between gap-3 mb-1">
                        <div>
                          <h3 className="text-base font-semibold text-slate-800">{course.name}</h3>
                          <p className="text-xs text-slate-500 mt-0.5">{course.code}{course.semester ? ` · Sem ${course.semester}` : ""}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          {course.ects && (
                            <span className="text-xs bg-indigo-50 text-primary px-2 py-0.5 rounded-full">{course.ects} ECTS</span>
                          )}
                          {enrolled && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Enrolled</span>
                          )}
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
                          <button
                            onClick={() => handleEnroll(course.id)}
                            disabled={actionLoading === course.id}
                            className="flex-1 bg-primary text-white py-2 rounded-xl hover:opacity-90 transition disabled:opacity-60 text-sm"
                          >
                            {actionLoading === course.id ? "Enrolling..." : "Enroll"}
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUnenroll(course.id)}
                            disabled={actionLoading === course.id}
                            className="flex-1 bg-slate-200 text-slate-800 py-2 rounded-xl hover:bg-slate-300 transition disabled:opacity-60 text-sm"
                          >
                            {actionLoading === course.id ? "Updating..." : "Unenroll"}
                          </button>
                        )}
                        <button
                          onClick={() => setReviewsCourse(course)}
                          className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm transition"
                        >
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
