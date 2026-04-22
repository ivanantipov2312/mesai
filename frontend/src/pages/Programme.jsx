import { useEffect, useRef, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import { getProgramme, updateProgramme, getSyllabi, uploadSyllabus, deleteSyllabus } from "../api/programmeApi";

const ECTS_TARGET_OPTIONS = [120, 150, 180, 210, 240];

export default function Programme() {
  const [prog, setProg] = useState(null);
  const [syllabi, setSyllabi] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ code: "", name: "", target_ects: 180, graduation_date: "" });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  const loadAll = async () => {
    const [p, s] = await Promise.all([getProgramme(), getSyllabi()]);
    setProg(p);
    setForm({
      code: p.code || "",
      name: p.name || "",
      target_ects: p.target_ects || 180,
      graduation_date: p.graduation_date || "",
    });
    setSyllabi(s);
  };

  useEffect(() => { loadAll().finally(() => setLoading(false)); }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const body = {
        code: form.code || null,
        name: form.name || null,
        target_ects: Number(form.target_ects),
        graduation_date: form.graduation_date || null,
      };
      const updated = await updateProgramme(body);
      setProg(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) { console.error(e); } finally { setSaving(false); }
  };

  const handleUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      await uploadSyllabus(fd);
      await loadAll();
    } catch (e) { console.error(e); } finally { setUploading(false); }
  };

  const handleDeleteSyllabus = async (id) => {
    try { await deleteSyllabus(id); setSyllabi(s => s.filter(x => x.id !== id)); } catch (e) { console.error(e); }
  };

  // ECTS progress
  const enrolled = prog?.enrolled_ects ?? 0;
  const target = prog?.target_ects ?? 180;
  const pct = Math.min(100, Math.round((enrolled / target) * 100));

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-2xl">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Programme</h1>
          <p className="text-slate-500 mt-1">Your academic programme details and ECTS progress.</p>
        </div>

        {loading ? (
          <div className="text-slate-400">Loading…</div>
        ) : (
          <>
            {/* Programme Info */}
            <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
              <h2 className="text-base font-semibold text-slate-800">Programme details</h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Programme code</label>
                  <input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))}
                    placeholder="e.g. IAPB"
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Programme name</label>
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="e.g. Cybersecurity Engineering"
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Target ECTS</label>
                  <select value={form.target_ects} onChange={e => setForm(f => ({ ...f, target_ects: Number(e.target.value) }))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                    {ECTS_TARGET_OPTIONS.map(v => <option key={v} value={v}>{v} ECTS</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Expected graduation</label>
                  <input type="date" value={form.graduation_date} onChange={e => setForm(f => ({ ...f, graduation_date: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
              </div>

              {saved && <p className="text-sm text-emerald-600">Saved!</p>}
              <button onClick={handleSave} disabled={saving}
                className="w-full py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:opacity-90 transition disabled:opacity-50">
                {saving ? "Saving…" : "Save details"}
              </button>
            </div>

            {/* ECTS Progress */}
            <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
              <h2 className="text-base font-semibold text-slate-800">ECTS progress</h2>

              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-softbg rounded-xl p-4">
                  <p className="text-2xl font-bold text-primary">{enrolled}</p>
                  <p className="text-xs text-slate-500 mt-1">In-progress ECTS</p>
                </div>
                <div className="bg-softbg rounded-xl p-4">
                  <p className="text-2xl font-bold text-slate-800">{target}</p>
                  <p className="text-xs text-slate-500 mt-1">Target ECTS</p>
                </div>
                <div className="bg-softbg rounded-xl p-4">
                  <p className="text-2xl font-bold text-emerald-600">{pct}%</p>
                  <p className="text-xs text-slate-500 mt-1">Complete</p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-slate-500">
                  <span>0</span>
                  <span>{target} ECTS goal</span>
                </div>
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="text-xs text-slate-400">
                  {enrolled} ECTS enrolled · {Math.max(0, target - enrolled)} remaining
                  {form.graduation_date && ` · Graduating ${new Date(form.graduation_date).toLocaleDateString(undefined, { month: "long", year: "numeric" })}`}
                </p>
              </div>
            </div>

            {/* Syllabi upload */}
            <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-slate-800">Syllabi</h2>
                <span className="text-xs text-slate-400">{syllabi.length} uploaded</span>
              </div>

              <div
                onClick={() => fileRef.current?.click()}
                className="border-2 border-dashed border-slate-200 rounded-xl p-5 text-center cursor-pointer hover:border-primary/50 hover:bg-indigo-50/20 transition"
              >
                <input ref={fileRef} type="file" accept=".pdf,.docx,.txt" className="hidden"
                  onChange={e => { if (e.target.files[0]) handleUpload(e.target.files[0]); e.target.value = ""; }} />
                {uploading ? (
                  <p className="text-sm text-slate-400">Uploading…</p>
                ) : (
                  <div>
                    <p className="text-sm text-slate-500">Click to upload a syllabus</p>
                    <p className="text-xs text-slate-400 mt-1">PDF, DOCX, or TXT</p>
                  </div>
                )}
              </div>

              {syllabi.length > 0 && (
                <div className="space-y-2">
                  {syllabi.map(s => (
                    <div key={s.id} className="flex items-center justify-between p-3 border border-slate-100 rounded-xl">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-base">📄</span>
                        <span className="text-sm text-slate-700 truncate">{s.filename}</span>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-xs text-slate-400">{new Date(s.uploaded_at).toLocaleDateString()}</span>
                        <button onClick={() => handleDeleteSyllabus(s.id)}
                          className="text-xs text-rose-400 hover:text-rose-600 transition">Remove</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
