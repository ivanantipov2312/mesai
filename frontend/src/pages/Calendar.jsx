import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import { getMyCourses } from "../api/courseApi";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const HOURS = Array.from({ length: 12 }, (_, i) => 8 + i); // 8..19

const TYPE_COLORS = {
  Lecture: "bg-primary text-white",
  Lab: "bg-emerald-500 text-white",
  Seminar: "bg-amber-500 text-white",
};

const startOfWeek = (d) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  const dow = x.getDay();
  x.setDate(x.getDate() - (dow === 0 ? 6 : dow - 1));
  return x;
};
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const sameDay = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
const fmtShort = (d) => d.toLocaleDateString(undefined, { day: "numeric", month: "short" });
const fmtMonthYear = (d) => d.toLocaleDateString(undefined, { month: "long", year: "numeric" });

export default function Calendar() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("week");
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
  const [monthStart, setMonthStart] = useState(() => {
    const n = new Date(); n.setDate(1); n.setHours(0, 0, 0, 0); return n;
  });
  const [selectedDay, setSelectedDay] = useState(null);

  useEffect(() => {
    getMyCourses()
      .then(setEnrollments)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Flatten all schedule slots into {course, slot} pairs
  const slots = useMemo(() =>
    enrollments.flatMap((e) =>
      (e.course?.schedule ?? []).map((slot) => ({ course: e.course, slot }))
    ), [enrollments]);

  // Find slots for a given day name and hour
  const slotsAt = (dayName, hour) =>
    slots.filter((s) => s.slot.day === dayName && parseInt(s.slot.start) === hour);

  // For month view
  const monthCells = useMemo(() => {
    const first = new Date(monthStart);
    const gridStart = startOfWeek(first);
    const cells = [];
    for (let i = 0; i < 42; i++) cells.push(addDays(gridStart, i));
    while (cells.length > 35 && cells[cells.length - 7].getMonth() !== monthStart.getMonth()) cells.splice(-7);
    return cells;
  }, [monthStart]);

  const slotsForDate = (date) => {
    const dow = date.getDay(); // 0=Sun
    const dayName = dow === 0 ? null : DAY_NAMES[dow - 1];
    if (!dayName) return [];
    return slots.filter((s) => s.slot.day === dayName);
  };

  const today = new Date();
  const todayDayName = today.getDay() === 0 ? null : DAY_NAMES[today.getDay() - 1];
  const todayHasCourses = todayDayName ? slots.some((s) => s.slot.day === todayDayName) : false;

  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Timetable</h1>
            <p className="text-slate-500 mt-1">Your weekly course schedule.</p>
          </div>

          {/* View toggle */}
          <div className="flex gap-2">
            {["week", "month"].map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition capitalize ${
                  view === v ? "bg-primary text-white" : "bg-white text-slate-600 hover:bg-slate-100"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        {loading && <div className="text-slate-400">Loading courses…</div>}

        {/* ── WEEK VIEW ── */}
        {!loading && view === "week" && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {/* Week nav */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
              <button onClick={() => setWeekStart(addDays(weekStart, -7))} className="p-2 rounded-lg hover:bg-slate-100">‹</button>
              <span className="text-sm font-medium text-slate-700">
                {fmtShort(weekStart)} – {fmtShort(addDays(weekStart, 4))}
              </span>
              <button onClick={() => setWeekStart(addDays(weekStart, 7))} className="p-2 rounded-lg hover:bg-slate-100">›</button>
              <button onClick={() => setWeekStart(startOfWeek(new Date()))} className="ml-2 px-3 py-1 text-xs text-primary border border-primary/30 rounded-lg hover:bg-primary/5">Today</button>
            </div>

            {/* Grid */}
            <div className="overflow-x-auto">
              <div className="min-w-[600px]">
                {/* Day headers */}
                <div className="grid grid-cols-[56px_repeat(5,1fr)] border-b border-slate-100">
                  <div />
                  {DAYS.map((d, i) => {
                    const date = addDays(weekStart, i);
                    const isToday = sameDay(date, today);
                    return (
                      <div key={d} className={`py-2 text-center text-xs font-semibold ${isToday ? "text-primary" : "text-slate-500"}`}>
                        {d} <span className={`ml-1 px-1.5 py-0.5 rounded-full ${isToday ? "bg-primary text-white" : ""}`}>{date.getDate()}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Hour rows */}
                {HOURS.map((h) => (
                  <div key={h} className="grid grid-cols-[56px_repeat(5,1fr)] border-b border-slate-50 min-h-[48px]">
                    <div className="text-xs text-slate-300 text-right pr-2 pt-1 select-none">{h}:00</div>
                    {DAY_NAMES.map((dayName) => {
                      const items = slotsAt(dayName, h);
                      return (
                        <div key={dayName} className="border-l border-slate-50 p-0.5 space-y-0.5">
                          {items.map(({ course, slot }, idx) => (
                            <div
                              key={idx}
                              className={`rounded-md px-2 py-1 text-xs leading-snug ${TYPE_COLORS[slot.type] ?? "bg-indigo-100 text-indigo-800"}`}
                              title={`${course.name} · ${slot.start}–${slot.end}`}
                            >
                              <div className="font-semibold truncate">{course.code}</div>
                              <div className="opacity-80 truncate">{slot.start}–{slot.end} · {slot.type}</div>
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            {/* Legend */}
            <div className="flex gap-4 px-5 py-3 border-t border-slate-100">
              {Object.entries(TYPE_COLORS).map(([type, cls]) => (
                <span key={type} className="flex items-center gap-1.5 text-xs text-slate-500">
                  <span className={`w-3 h-3 rounded-sm ${cls.split(" ")[0]}`} />
                  {type}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ── MONTH VIEW ── */}
        {!loading && view === "month" && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
              <button onClick={() => { const n = new Date(monthStart); n.setMonth(n.getMonth() - 1); setMonthStart(n); }} className="p-2 rounded-lg hover:bg-slate-100">‹</button>
              <span className="font-semibold text-slate-700">{fmtMonthYear(monthStart)}</span>
              <button onClick={() => { const n = new Date(monthStart); n.setMonth(n.getMonth() + 1); setMonthStart(n); }} className="p-2 rounded-lg hover:bg-slate-100">›</button>
              <button onClick={() => { const n = new Date(); n.setDate(1); n.setHours(0, 0, 0, 0); setMonthStart(n); }} className="ml-2 px-3 py-1 text-xs text-primary border border-primary/30 rounded-lg hover:bg-primary/5">Today</button>
            </div>

            <div className="grid grid-cols-7">
              {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((d) => (
                <div key={d} className="p-2 text-center text-xs font-semibold text-slate-400 border-b border-slate-100">{d}</div>
              ))}
              {monthCells.map((date, idx) => {
                const inMonth = date.getMonth() === monthStart.getMonth();
                const isToday = sameDay(date, today);
                const items = slotsForDate(date);
                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedDay(date)}
                    className={`min-h-[80px] p-1.5 text-left border-b border-r border-slate-50 hover:bg-slate-50 transition ${!inMonth ? "opacity-30" : ""} ${isToday ? "bg-indigo-50" : ""}`}
                  >
                    <div className={`text-xs font-medium mb-1 ${isToday ? "text-primary font-bold" : "text-slate-600"}`}>{date.getDate()}</div>
                    <div className="space-y-0.5">
                      {items.slice(0, 3).map(({ course, slot }, i) => (
                        <div key={i} className={`text-[10px] rounded px-1 truncate ${TYPE_COLORS[slot.type] ?? "bg-indigo-100 text-indigo-800"}`}>
                          {course.code}
                        </div>
                      ))}
                      {items.length > 3 && <div className="text-[10px] text-slate-400">+{items.length - 3}</div>}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Day detail panel */}
        {selectedDay && (
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-800">
                {selectedDay.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" })}
              </h2>
              <button onClick={() => setSelectedDay(null)} className="text-slate-400 hover:text-slate-700 text-lg">×</button>
            </div>
            {slotsForDate(selectedDay).length === 0 ? (
              <p className="text-sm text-slate-400">No classes on this day.</p>
            ) : (
              <div className="space-y-3">
                {slotsForDate(selectedDay)
                  .sort((a, b) => a.slot.start.localeCompare(b.slot.start))
                  .map(({ course, slot }, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-xl border border-slate-100">
                      <div className={`mt-0.5 w-2.5 h-2.5 rounded-full flex-shrink-0 ${TYPE_COLORS[slot.type]?.split(" ")[0] ?? "bg-primary"}`} />
                      <div>
                        <p className="font-semibold text-slate-800 text-sm">{course.name}</p>
                        <p className="text-xs text-slate-400">{course.code} · {slot.start}–{slot.end} · {slot.type}</p>
                        <div className="flex gap-1 mt-1 flex-wrap">
                          {(course.skills_taught ?? []).slice(0, 4).map((s) => (
                            <span key={s} className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded-full">{s}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* Today's classes quick view */}
        {!loading && todayDayName && (
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <h2 className="font-semibold text-slate-800 mb-3">Today — {today.toLocaleDateString(undefined, { weekday: "long" })}</h2>
            {slots.filter((s) => s.slot.day === todayDayName).length === 0 ? (
              <p className="text-sm text-slate-400">No classes today.</p>
            ) : (
              <div className="space-y-2">
                {slots
                  .filter((s) => s.slot.day === todayDayName)
                  .sort((a, b) => a.slot.start.localeCompare(b.slot.start))
                  .map(({ course, slot }, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className={`text-xs px-2 py-1 rounded-lg ${TYPE_COLORS[slot.type] ?? "bg-indigo-100 text-indigo-800"}`}>{slot.start}</span>
                      <span className="text-sm font-medium text-slate-700">{course.code} — {course.name}</span>
                      <span className="text-xs text-slate-400">{slot.type}</span>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
