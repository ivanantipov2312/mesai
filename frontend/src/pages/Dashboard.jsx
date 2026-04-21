import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import { getMe } from "../api/authApi";
import { getMyCourses } from "../api/courseApi";
import { getCareerMatches } from "../api/careerApi";
import { getDailyTip, sendAIChat } from "../api/aiApi";

const ECTS_TARGET = 180;

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [courses, setCourses] = useState([]);
  const [topMatch, setTopMatch] = useState(null);
  const [tip, setTip] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [coaching, setCoaching] = useState("");
  const [loadingCoach, setLoadingCoach] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [me, myCourses, matches, dailyTip] = await Promise.all([
          getMe(),
          getMyCourses(),
          getCareerMatches(),
          getDailyTip(),
        ]);
        setUser(me);
        setCourses(myCourses);
        if (matches?.length) setTopMatch(matches[0]);
        setTip(dailyTip?.tip ?? "");
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const totalEcts = courses.reduce((s, e) => s + (e.course?.ects ?? 0), 0);
  const ectsPct = Math.min(100, Math.round((totalEcts / ECTS_TARGET) * 100));

  const submitCheckIn = async () => {
    if (!checkIn.trim() || loadingCoach) return;
    setLoadingCoach(true);
    try {
      const res = await sendAIChat(checkIn);
      setCoaching(res.response ?? "");
      setCheckIn("");
    } catch {
      setCoaching("Could not reach the AI — try again.");
    } finally {
      setLoadingCoach(false);
    }
  };

  const firstName = user?.name?.split(" ")[0] ?? "there";

  return (
    <DashboardLayout>
      <div className="space-y-8">

        {/* Greeting */}
        <div>
          <h1 className="text-4xl font-bold text-slate-800">
            Hi {firstName} 👋
          </h1>
          <p className="text-slate-500 mt-1">
            {user?.program ?? "TalTech"} · Semester {user?.semester ?? "–"} · MESA.I is tracking everything for you.
          </p>
        </div>

        {/* Stat cards */}
        {loading ? (
          <div className="text-slate-400">Loading your data…</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

            {/* ECTS progress */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">Program progress</p>
              <p className="text-3xl font-bold text-slate-800">{totalEcts} <span className="text-lg font-normal text-slate-400">/ {ECTS_TARGET} ECTS</span></p>
              <div className="mt-3 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-primary transition-all duration-500 rounded-full" style={{ width: `${ectsPct}%` }} />
              </div>
              <p className="text-xs text-slate-400 mt-2">{courses.length} course{courses.length !== 1 ? "s" : ""} enrolled</p>
            </div>

            {/* Top career match */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">Top career match</p>
              {topMatch ? (
                <>
                  <p className="text-3xl font-bold text-slate-800">{topMatch.match_pct}%</p>
                  <p className="text-slate-600 mt-1 font-medium">{topMatch.career.title}</p>
                  <Link to="/career" className="text-xs text-primary mt-2 block hover:underline">
                    View all career paths →
                  </Link>
                </>
              ) : (
                <p className="text-slate-400 mt-2">
                  <Link to="/career" className="text-primary hover:underline">Set up your career path →</Link>
                </p>
              )}
            </div>

            {/* Skills */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">Your skills</p>
              <p className="text-3xl font-bold text-slate-800">{(user?.existing_skills ?? []).length}</p>
              <p className="text-slate-500 mt-1">existing skills on your profile</p>
              <Link to="/skills" className="text-xs text-primary mt-2 block hover:underline">
                View skills map →
              </Link>
            </div>

          </div>
        )}

        {/* AI daily tip */}
        {tip && (
          <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5">
            <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-2">✦ MESA.I tip of the day</p>
            <p className="text-slate-700 leading-relaxed">{tip}</p>
          </div>
        )}

        {/* Daily check-in */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-semibold text-slate-800 mb-3">Daily check-in</h2>
          <p className="text-sm text-slate-400 mb-3">How's it going? MESA.I will coach you based on your current situation.</p>
          <textarea
            className="w-full border border-slate-200 rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
            rows={3}
            placeholder="e.g. I'm struggling with the cryptography assignment and feeling behind on ECTS…"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
          />
          <button
            onClick={submitCheckIn}
            disabled={loadingCoach || !checkIn.trim()}
            className="mt-3 px-5 py-2 bg-primary text-white rounded-xl text-sm font-medium disabled:opacity-50 hover:opacity-90 transition"
          >
            {loadingCoach ? "Thinking…" : "Get AI coaching"}
          </button>
          {coaching && (
            <div className="mt-4 bg-slate-50 border border-slate-100 rounded-xl p-4 text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
              {coaching}
            </div>
          )}
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { to: "/courses", label: "Browse Courses" },
            { to: "/calendar", label: "My Timetable" },
            { to: "/career", label: "Career Paths" },
            { to: "/chat", label: "Ask MESA.I" },
          ].map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className="bg-white rounded-2xl p-4 shadow-sm text-center text-sm font-medium text-slate-700 hover:shadow-md hover:text-primary transition"
            >
              {label}
            </Link>
          ))}
        </div>

      </div>
    </DashboardLayout>
  );
}
