import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import { getMyCourses, getAllCourses, enrollCourse, getConflicts } from "../api/courseApi";
import ConflictBanner from "../components/ConflictBanner";
import { getNotes, createNote, updateNote, deleteNote } from "../api/calendarApi";
import { api } from "../api/axios";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const HOURS = Array.from({ length: 12 }, (_, i) => 8 + i); // 8..19

const TYPE_COLORS = {
  Lecture: "bg-primary text-white",
  Lab: "bg-emerald-500 text-white",
  Seminar: "bg-amber-500 text-white",
};

const NOTE_COLORS = ["#6366F1", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#06B6D4", "#EC4899", "#64748B"];

const startOfWeek = (d) => {
  const x = new Date(d); x.setHours(0, 0, 0, 0);
  const dow = x.getDay();
  x.setDate(x.getDate() - (dow === 0 ? 6 : dow - 1));
  return x;
};
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const sameDay = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
const fmtShort = (d) => d.toLocaleDateString(undefined, { day: "numeric", month: "short" });
const fmtMonthYear = (d) => d.toLocaleDateString(undefined, { month: "long", year: "numeric" });
const pad2 = (n) => String(n).padStart(2, "0");
const toLocalISO = (date) =>
  `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}T${pad2(date.getHours())}:${pad2(date.getMinutes())}:00`;

// Parse a note's start_time (ISO string from backend) into a JS Date
const parseNoteDate = (iso) => new Date(iso);

// Get day name (Monday..Friday) for a Date
const getDayName = (d) => { const dow = d.getDay(); return dow === 0 || dow === 6 ? null : DAY_NAMES[dow - 1]; };

const BLANK_NOTE = { title: "", description: "", color: "#6366F1", start_time: "", end_time: "" };

const HOUR_PX = 60; // 1 px per minute
const GRID_START = 8; // first hour shown
const TOTAL_HEIGHT = HOURS.length * HOUR_PX; // 720 px

function timeToMinutes(t) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

// Assigns colIndex + totalCols to each slot so overlapping ones sit side-by-side.
function computeSlotLayout(daySlots) {
  if (daySlots.length === 0) return [];

  const items = daySlots.map((s) => ({
    ...s,
    startMin: timeToMinutes(s.slot.start),
    endMin: timeToMinutes(s.slot.end),
    colIndex: 0,
    totalCols: 1,
  }));

  items.sort((a, b) => a.startMin - b.startMin);

  // Greedy column assignment: place each item in the earliest free column.
  const colEnds = []; // colEnds[c] = endMin of last item placed in column c
  for (const item of items) {
    let placed = false;
    for (let c = 0; c < colEnds.length; c++) {
      if (colEnds[c] <= item.startMin) {
        item.colIndex = c;
        colEnds[c] = item.endMin;
        placed = true;
        break;
      }
    }
    if (!placed) {
      item.colIndex = colEnds.length;
      colEnds.push(item.endMin);
    }
  }

  // totalCols for each item = highest colIndex among all items it overlaps + 1.
  for (const item of items) {
    let maxCol = item.colIndex;
    for (const other of items) {
      if (other !== item && other.startMin < item.endMin && other.endMin > item.startMin) {
        maxCol = Math.max(maxCol, other.colIndex);
      }
    }
    item.totalCols = maxCol + 1;
  }

  return items;
}

export default function Calendar() {
  const [enrollments, setEnrollments] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("week");
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
  const [monthStart, setMonthStart] = useState(() => {
    const n = new Date(); n.setDate(1); n.setHours(0, 0, 0, 0); return n;
  });
  const [selectedDay, setSelectedDay] = useState(null);

  // Add-course panel
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [allCourses, setAllCourses] = useState([]);
  const [panelLoading, setPanelLoading] = useState(false);
  const [enrollingId, setEnrollingId] = useState(null);

  // Note modal
  const [noteModal, setNoteModal] = useState(null); // null | { mode: "create"|"edit", note, prefillDay?, prefillHour? }
  const [noteForm, setNoteForm] = useState(BLANK_NOTE);
  const [noteSaving, setNoteSaving] = useState(false);

  const [exportingIcs, setExportingIcs] = useState(false);
  const [conflicts, setConflicts] = useState([]);
  const [conflictsDismissed, setConflictsDismissed] = useState(false);

  const loadData = async () => {
    const [enrollData, notesData, conflictData] = await Promise.all([
      getMyCourses(),
      getNotes(),
      getConflicts().catch(() => ({ conflicts: [] })),
    ]);
    setEnrollments(Array.isArray(enrollData) ? enrollData : []);
    setNotes(Array.isArray(notesData) ? notesData : []);
    setConflicts(conflictData?.conflicts ?? []);
  };

  useEffect(() => { loadData().finally(() => setLoading(false)); }, []);

  const openAddPanel = () => {
    setShowAddPanel(true);
    if (allCourses.length === 0) {
      setPanelLoading(true);
      getAllCourses().then(setAllCourses).catch(console.error).finally(() => setPanelLoading(false));
    }
  };

  const handlePanelEnroll = async (courseId) => {
    setEnrollingId(courseId);
    try { await enrollCourse(courseId); await loadData(); } catch (e) { console.error(e); } finally { setEnrollingId(null); }
  };

  const handleExportIcs = async () => {
    setExportingIcs(true);
    try {
      const res = await api.get("/api/timetable/export.ics", { responseType: "blob" });
      const url = URL.createObjectURL(new Blob([res.data], { type: "text/calendar" }));
      const a = document.createElement("a"); a.href = url; a.download = "mesai-timetable.ics"; a.click();
      URL.revokeObjectURL(url);
    } catch (e) { console.error(e); } finally { setExportingIcs(false); }
  };

  // Open note modal pre-filled for a specific day + hour
  const openCreateNote = (day, hour, date) => {
    const baseDate = date ?? addDays(weekStart, DAY_NAMES.indexOf(day));
    const start = new Date(baseDate);
    start.setHours(hour, 0, 0, 0);
    const end = new Date(start);
    end.setHours(hour + 1);
    setNoteForm({ ...BLANK_NOTE, start_time: toLocalISO(start), end_time: toLocalISO(end) });
    setNoteModal({ mode: "create" });
  };

  const openEditNote = (note) => {
    setNoteForm({
      title: note.title,
      description: note.description ?? "",
      color: note.color,
      start_time: toLocalISO(parseNoteDate(note.start_time)),
      end_time: toLocalISO(parseNoteDate(note.end_time)),
    });
    setNoteModal({ mode: "edit", id: note.id });
  };

  const handleNoteSave = async () => {
    if (!noteForm.title.trim()) return;
    setNoteSaving(true);
    try {
      if (noteModal.mode === "create") {
        await createNote(noteForm);
      } else {
        await updateNote(noteModal.id, noteForm);
      }
      await loadData();
      setNoteModal(null);
    } catch (e) { console.error(e); } finally { setNoteSaving(false); }
  };

  const handleNoteDelete = async (id) => {
    try { await deleteNote(id); await loadData(); setNoteModal(null); } catch (e) { console.error(e); }
  };

  const enrolledIds = useMemo(() => new Set(enrollments.map((e) => e.course?.id)), [enrollments]);

  // Course slots
  const slots = useMemo(() =>
    enrollments.flatMap((e) => (e.course?.schedule ?? []).map((slot) => ({ course: e.course, slot }))),
    [enrollments]);

  // Per-day layout: colIndex + totalCols for overlap detection
  const slotLayoutByDay = useMemo(() => {
    const result = {};
    for (const dayName of DAY_NAMES) {
      result[dayName] = computeSlotLayout(slots.filter((s) => s.slot.day === dayName));
    }
    return result;
  }, [slots]);

  // Notes for a given day name (weekly recurring display)
  const notesOnDay = (dayName) =>
    notes.filter((n) => getDayName(parseNoteDate(n.start_time)) === dayName);

  // Notes at a specific hour on a day name (across all weeks — shown every week)
  const notesAt = (dayName, hour) =>
    notesOnDay(dayName).filter((n) => parseNoteDate(n.start_time).getHours() === hour);

  const slotsAt = (dayName, hour) =>
    slots.filter((s) => s.slot.day === dayName && parseInt(s.slot.start) === hour);

  // Month view
  const monthCells = useMemo(() => {
    const first = new Date(monthStart);
    const gridStart = startOfWeek(first);
    const cells = [];
    for (let i = 0; i < 42; i++) cells.push(addDays(gridStart, i));
    while (cells.length > 35 && cells[cells.length - 7].getMonth() !== monthStart.getMonth()) cells.splice(-7);
    return cells;
  }, [monthStart]);

  const slotsForDate = (date) => {
    const dayName = getDayName(date);
    if (!dayName) return [];
    return slots.filter((s) => s.slot.day === dayName);
  };

  const notesForDate = (date) =>
    notes.filter((n) => sameDay(parseNoteDate(n.start_time), date));

  const today = new Date();
  const todayDayName = getDayName(today);

  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Timetable</h1>
            <p className="text-slate-500 mt-1">Your courses and personal notes. Click any slot to add a note.</p>
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            {["week", "month"].map((v) => (
              <button key={v} onClick={() => setView(v)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition capitalize ${view === v ? "bg-primary text-white" : "bg-white text-slate-600 hover:bg-slate-100"}`}>
                {v}
              </button>
            ))}
            <button onClick={handleExportIcs} disabled={exportingIcs}
              className="px-4 py-2 rounded-xl text-sm font-medium bg-white text-slate-600 hover:bg-slate-100 transition border border-slate-200 disabled:opacity-50">
              {exportingIcs ? "Exporting…" : "Export .ics"}
            </button>
            <button onClick={openAddPanel}
              className="px-4 py-2 rounded-xl text-sm font-medium bg-primary text-white hover:opacity-90 transition">
              + Add Course
            </button>
          </div>
        </div>

        {/* Conflict warnings */}
        {!conflictsDismissed && (
          <ConflictBanner conflicts={conflicts} onDismiss={() => setConflictsDismissed(true)} />
        )}

        {/* Add Course panel */}
        {showAddPanel && (
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-800">Add a Course</h2>
              <button onClick={() => setShowAddPanel(false)} className="text-slate-400 hover:text-slate-700 text-lg">×</button>
            </div>
            {panelLoading ? <p className="text-sm text-slate-400">Loading courses…</p> : (
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {allCourses.map((c) => {
                  const enrolled = enrolledIds.has(c.id);
                  return (
                    <div key={c.id} className="flex items-center justify-between gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50">
                      <div>
                        <p className="text-sm font-medium text-slate-800">{c.name}</p>
                        <p className="text-xs text-slate-400">{c.code}{c.ects ? ` · ${c.ects} ECTS` : ""}{c.semester ? ` · Sem ${c.semester}` : ""}</p>
                        {(c.skills_taught ?? []).length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {c.skills_taught.slice(0, 3).map((s) => (
                              <span key={s} className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-400 rounded-full font-mono">{s.replace(/_/g, " ")}</span>
                            ))}
                          </div>
                        )}
                      </div>
                      {enrolled ? (
                        <span className="text-xs text-green-600 font-medium shrink-0">Enrolled</span>
                      ) : (
                        <button onClick={() => handlePanelEnroll(c.id)} disabled={enrollingId === c.id}
                          className="text-xs px-3 py-1.5 bg-primary text-white rounded-lg hover:opacity-90 transition disabled:opacity-50 shrink-0">
                          {enrollingId === c.id ? "…" : "Enroll"}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {loading && <div className="text-slate-400">Loading…</div>}

        {/* ── WEEK VIEW ── */}
        {!loading && view === "week" && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
              <button onClick={() => setWeekStart(addDays(weekStart, -7))} className="p-2 rounded-lg hover:bg-slate-100">‹</button>
              <span className="text-sm font-medium text-slate-700">{fmtShort(weekStart)} – {fmtShort(addDays(weekStart, 4))}</span>
              <button onClick={() => setWeekStart(addDays(weekStart, 7))} className="p-2 rounded-lg hover:bg-slate-100">›</button>
              <button onClick={() => setWeekStart(startOfWeek(new Date()))} className="ml-2 px-3 py-1 text-xs text-primary border border-primary/30 rounded-lg hover:bg-primary/5">Today</button>
            </div>

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

                {/* Absolute-positioned time grid */}
                <div className="overflow-y-auto max-h-[600px]">
                  <div className="grid grid-cols-[56px_repeat(5,1fr)]" style={{ height: TOTAL_HEIGHT }}>

                    {/* Time gutter */}
                    <div className="relative h-full select-none">
                      {HOURS.map((h) => (
                        <div key={h} className="absolute right-2 text-xs text-slate-300 -translate-y-2"
                          style={{ top: (h - GRID_START) * HOUR_PX }}>
                          {h}:00
                        </div>
                      ))}
                    </div>

                    {/* One column per day */}
                    {DAY_NAMES.map((dayName, di) => {
                      const date = addDays(weekStart, di);
                      const layoutItems = slotLayoutByDay[dayName] ?? [];
                      const dayNotes = notesOnDay(dayName);
                      return (
                        <div key={dayName}
                          className="relative h-full border-l border-slate-100 cursor-pointer"
                          onClick={(e) => {
                            if (!e.target.closest("[data-no-create]")) {
                              const rect = e.currentTarget.getBoundingClientRect();
                              const hour = Math.min(
                                Math.max(Math.floor((e.clientY - rect.top) / HOUR_PX) + GRID_START, GRID_START),
                                19
                              );
                              openCreateNote(dayName, hour, date);
                            }
                          }}>

                          {/* Hour grid lines */}
                          {HOURS.map((h) => (
                            <div key={h} className="absolute w-full border-b border-slate-50 pointer-events-none"
                              style={{ top: (h - GRID_START) * HOUR_PX, height: HOUR_PX }} />
                          ))}

                          {/* Course blocks */}
                          {layoutItems.map(({ course, slot, colIndex, totalCols }, idx) => {
                            const startMin = timeToMinutes(slot.start);
                            const endMin = timeToMinutes(slot.end);
                            const top = startMin - GRID_START * 60;
                            const height = endMin - startMin;
                            const widthPct = 100 / totalCols;
                            const leftPct = colIndex * widthPct;
                            return (
                              <div key={idx} data-no-create="1"
                                className={`absolute rounded-md px-1.5 py-0.5 text-xs leading-snug overflow-hidden ${TYPE_COLORS[slot.type] ?? "bg-indigo-100 text-indigo-800"}`}
                                style={{
                                  top: top + 1,
                                  height: Math.max(height - 2, 16),
                                  left: `calc(${leftPct}% + 1px)`,
                                  width: `calc(${widthPct}% - 2px)`,
                                }}
                                title={`${course.name} · ${slot.start}–${slot.end}`}>
                                <div className="font-semibold truncate">{course.code}</div>
                                {height >= 30 && (
                                  <div className="opacity-80 truncate">{slot.start}–{slot.end} · {slot.type}</div>
                                )}
                              </div>
                            );
                          })}

                          {/* Note blocks */}
                          {dayNotes.map((note) => {
                            const nd = parseNoteDate(note.start_time);
                            const ed = parseNoteDate(note.end_time);
                            const startMin = nd.getHours() * 60 + nd.getMinutes();
                            const endMin = ed.getHours() * 60 + ed.getMinutes();
                            const top = startMin - GRID_START * 60;
                            const height = Math.max(endMin - startMin, 20);
                            return (
                              <div key={note.id} data-no-create="1"
                                onClick={(e) => { e.stopPropagation(); openEditNote(note); }}
                                className="absolute rounded-md px-1.5 py-0.5 text-xs leading-snug text-white cursor-pointer hover:opacity-80 transition overflow-hidden"
                                style={{
                                  top: top + 1,
                                  height: height - 2,
                                  left: 1,
                                  right: 1,
                                  backgroundColor: note.color,
                                }}
                                title={note.title}>
                                <div className="font-semibold truncate">{note.title}</div>
                                {height >= 30 && (
                                  <div className="opacity-80 truncate">
                                    {nd.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 px-5 py-3 border-t border-slate-100">
              {Object.entries(TYPE_COLORS).map(([type, cls]) => (
                <span key={type} className="flex items-center gap-1.5 text-xs text-slate-500">
                  <span className={`w-3 h-3 rounded-sm ${cls.split(" ")[0]}`} /> {type}
                </span>
              ))}
              <span className="flex items-center gap-1.5 text-xs text-slate-500">
                <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: "#6366F1" }} /> Personal note
              </span>
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
                const courseSlots = slotsForDate(date);
                const dayNotes = notesForDate(date);
                return (
                  <button key={idx} onClick={() => setSelectedDay(date)}
                    className={`min-h-[80px] p-1.5 text-left border-b border-r border-slate-50 hover:bg-slate-50 transition ${!inMonth ? "opacity-30" : ""} ${isToday ? "bg-indigo-50" : ""}`}>
                    <div className={`text-xs font-medium mb-1 ${isToday ? "text-primary font-bold" : "text-slate-600"}`}>{date.getDate()}</div>
                    <div className="space-y-0.5">
                      {courseSlots.slice(0, 2).map(({ course, slot }, i) => (
                        <div key={i} className={`text-[10px] rounded px-1 truncate ${TYPE_COLORS[slot.type] ?? "bg-indigo-100 text-indigo-800"}`}>{course.code}</div>
                      ))}
                      {dayNotes.slice(0, 2).map((n) => (
                        <div key={n.id} className="text-[10px] rounded px-1 truncate text-white" style={{ backgroundColor: n.color }}>{n.title}</div>
                      ))}
                      {courseSlots.length + dayNotes.length > 4 && (
                        <div className="text-[10px] text-slate-400">+{courseSlots.length + dayNotes.length - 4}</div>
                      )}
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
              <h2 className="font-semibold text-slate-800">{selectedDay.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" })}</h2>
              <div className="flex gap-2">
                <button onClick={() => openCreateNote(getDayName(selectedDay), selectedDay.getHours() || 9, selectedDay)}
                  className="text-xs px-3 py-1.5 bg-primary text-white rounded-lg hover:opacity-90 transition">+ Note</button>
                <button onClick={() => setSelectedDay(null)} className="text-slate-400 hover:text-slate-700 text-lg">×</button>
              </div>
            </div>
            {slotsForDate(selectedDay).length === 0 && notesForDate(selectedDay).length === 0 ? (
              <p className="text-sm text-slate-400">No classes or notes on this day.</p>
            ) : (
              <div className="space-y-3">
                {[
                  ...slotsForDate(selectedDay).map(({ course, slot }) => ({ type: "course", course, slot, sortKey: slot.start })),
                  ...notesForDate(selectedDay).map((n) => ({ type: "note", note: n, sortKey: new Date(n.start_time).toTimeString() })),
                ]
                  .sort((a, b) => a.sortKey.localeCompare(b.sortKey))
                  .map((item, i) => item.type === "course" ? (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-xl border border-slate-100">
                      <div className={`mt-0.5 w-2.5 h-2.5 rounded-full flex-shrink-0 ${TYPE_COLORS[item.slot.type]?.split(" ")[0] ?? "bg-primary"}`} />
                      <div>
                        <p className="font-semibold text-slate-800 text-sm">{item.course.name}</p>
                        <p className="text-xs text-slate-400">{item.course.code} · {item.slot.start}–{item.slot.end} · {item.slot.type}</p>
                      </div>
                    </div>
                  ) : (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-xl border border-slate-100 cursor-pointer hover:bg-slate-50"
                      onClick={() => openEditNote(item.note)}>
                      <div className="mt-0.5 w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.note.color }} />
                      <div>
                        <p className="font-semibold text-slate-800 text-sm">{item.note.title}</p>
                        <p className="text-xs text-slate-400">
                          {new Date(item.note.start_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} –{" "}
                          {new Date(item.note.end_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                        {item.note.description && <p className="text-xs text-slate-500 mt-0.5">{item.note.description}</p>}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* Today's classes */}
        {!loading && todayDayName && (
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <h2 className="font-semibold text-slate-800 mb-3">Today — {today.toLocaleDateString(undefined, { weekday: "long" })}</h2>
            {slots.filter((s) => s.slot.day === todayDayName).length === 0 && notesOnDay(todayDayName).length === 0 ? (
              <p className="text-sm text-slate-400">No classes or notes today.</p>
            ) : (
              <div className="space-y-2">
                {[
                  ...slots.filter((s) => s.slot.day === todayDayName).map(({ course, slot }) => ({ type: "course", course, slot, sortKey: slot.start })),
                  ...notesOnDay(todayDayName).map((n) => ({ type: "note", note: n, sortKey: new Date(n.start_time).toTimeString() })),
                ]
                  .sort((a, b) => a.sortKey.localeCompare(b.sortKey))
                  .map((item, i) => item.type === "course" ? (
                    <div key={i} className="flex items-center gap-3">
                      <span className={`text-xs px-2 py-1 rounded-lg ${TYPE_COLORS[item.slot.type] ?? "bg-indigo-100 text-indigo-800"}`}>{item.slot.start}</span>
                      <span className="text-sm font-medium text-slate-700">{item.course.code} — {item.course.name}</span>
                      <span className="text-xs text-slate-400">{item.slot.type}</span>
                    </div>
                  ) : (
                    <div key={i} className="flex items-center gap-3 cursor-pointer" onClick={() => openEditNote(item.note)}>
                      <span className="text-xs px-2 py-1 rounded-lg text-white" style={{ backgroundColor: item.note.color }}>
                        {new Date(item.note.start_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                      <span className="text-sm font-medium text-slate-700">{item.note.title}</span>
                      <span className="text-xs text-slate-400">note</span>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

      </div>

      {/* Note modal */}
      {noteModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4" onClick={() => setNoteModal(null)}>
          <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-slate-800">{noteModal.mode === "create" ? "New note" : "Edit note"}</h2>
              {noteModal.mode === "edit" && (
                <button onClick={() => handleNoteDelete(noteModal.id)} className="text-xs text-rose-500 hover:text-rose-700">Delete</button>
              )}
            </div>

            <input
              type="text"
              placeholder="Title"
              value={noteForm.title}
              onChange={(e) => setNoteForm((f) => ({ ...f, title: e.target.value }))}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />

            <textarea
              placeholder="Description (optional)"
              value={noteForm.description}
              onChange={(e) => setNoteForm((f) => ({ ...f, description: e.target.value }))}
              rows={2}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Start</label>
                <input type="datetime-local" value={noteForm.start_time.slice(0, 16)} onChange={(e) => setNoteForm((f) => ({ ...f, start_time: e.target.value + ":00" }))}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">End</label>
                <input type="datetime-local" value={noteForm.end_time.slice(0, 16)} onChange={(e) => setNoteForm((f) => ({ ...f, end_time: e.target.value + ":00" }))}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-500 mb-2 block">Color</label>
              <div className="flex gap-2 flex-wrap">
                {NOTE_COLORS.map((c) => (
                  <button key={c} onClick={() => setNoteForm((f) => ({ ...f, color: c }))}
                    className={`w-7 h-7 rounded-full border-2 transition ${noteForm.color === c ? "border-slate-800 scale-110" : "border-transparent"}`}
                    style={{ backgroundColor: c }} />
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-1">
              <button onClick={() => setNoteModal(null)} className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm hover:bg-slate-50 transition">Cancel</button>
              <button onClick={handleNoteSave} disabled={noteSaving || !noteForm.title.trim()}
                className="flex-1 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:opacity-90 transition disabled:opacity-50">
                {noteSaving ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
