import { useEffect, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";

import {
  getAllCourses,
  getMyCourses,
  enrollCourse,
  unenrollCourse,
} from "../api/courseApi";

export default function Courses() {
  const [allCourses, setAllCourses] = useState([]);
  const [myCourses, setMyCourses] = useState([]);

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

      const [all, mine] = await Promise.all([
        getAllCourses(),
        getMyCourses(),
      ]);

      setAllCourses(Array.isArray(all) ? all : []);
      setMyCourses(Array.isArray(mine) ? mine : []);
    } catch (err) {
      console.error(err);
      setError("Failed to load courses.");
    } finally {
      setLoading(false);
    }
  };

  const isEnrolled = (courseId) => {
    return myCourses.some((course) => course.id === courseId);
  };

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
                  {myCourses.map((course) => (
                    <div
                      key={course.id}
                      className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5"
                    >
                      <h3 className="text-lg font-semibold">
                        {course.name}
                      </h3>

                      <p className="text-sm text-slate-500 mt-1">
                        {course.code}
                      </p>

                      {course.description && (
                        <p className="text-sm text-slate-600 mt-3">
                          {course.description}
                        </p>
                      )}

                      <button
                        onClick={() => handleUnenroll(course.id)}
                        disabled={actionLoading === course.id}
                        className="mt-5 w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-xl transition disabled:opacity-60"
                      >
                        {actionLoading === course.id
                          ? "Removing..."
                          : "Unenroll"}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* All Courses */}
            <section>
              <h2 className="text-xl font-semibold text-slate-800 mb-4">
                All Courses
              </h2>

              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                {allCourses.map((course) => {
                  const enrolled = isEnrolled(course.id);

                  return (
                    <div
                      key={course.id}
                      className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5"
                    >
                      <div className="flex justify-between gap-3">
                        <div>
                          <h3 className="text-lg font-semibold">
                            {course.name}
                          </h3>

                          <p className="text-sm text-slate-500 mt-1">
                            {course.code}
                          </p>
                        </div>

                        {enrolled && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full h-fit">
                            Enrolled
                          </span>
                        )}
                      </div>

                      {course.description && (
                        <p className="text-sm text-slate-600 mt-3">
                          {course.description}
                        </p>
                      )}

                      {!enrolled ? (
                        <button
                          onClick={() => handleEnroll(course.id)}
                          disabled={actionLoading === course.id}
                          className="mt-5 w-full bg-primary text-white py-2 rounded-xl hover:opacity-90 transition disabled:opacity-60"
                        >
                          {actionLoading === course.id
                            ? "Enrolling..."
                            : "Enroll"}
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUnenroll(course.id)}
                          disabled={actionLoading === course.id}
                          className="mt-5 w-full bg-slate-200 text-slate-800 py-2 rounded-xl hover:bg-slate-300 transition disabled:opacity-60"
                        >
                          {actionLoading === course.id
                            ? "Updating..."
                            : "Unenroll"}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
