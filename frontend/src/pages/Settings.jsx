import { useEffect, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import { getNotificationSettings, updateNotificationSettings } from "../api/settingsApi";

const REMINDER_OPTIONS = [
  { value: 5,    label: "5 minutes before" },
  { value: 15,   label: "15 minutes before" },
  { value: 30,   label: "30 minutes before" },
  { value: 60,   label: "1 hour before" },
  { value: 1440, label: "1 day before" },
];

const METHOD_OPTIONS = [
  { id: "email",  label: "Email" },
  { id: "sms",    label: "SMS" },
  { id: "in_app", label: "In-app" },
];

const APPLY_OPTIONS = [
  { value: "courses", label: "Course reminders only" },
  { value: "notes",   label: "Personal notes only" },
  { value: "both",    label: "Courses and notes" },
];

export default function Settings() {
  const [settings, setSettings] = useState({ method: ["in_app"], reminder_minutes: 15, apply_to: "both" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getNotificationSettings()
      .then(setSettings)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const toggleMethod = (id) =>
    setSettings((s) => ({
      ...s,
      method: s.method.includes(id) ? s.method.filter((m) => m !== id) : [...s.method, id],
    }));

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    setError("");
    try {
      const updated = await updateNotificationSettings(settings);
      setSettings(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      setError("Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-xl space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Settings</h1>
          <p className="text-slate-500 mt-1">Manage your notification preferences.</p>
        </div>

        {loading ? (
          <div className="text-slate-400">Loading…</div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm p-6 space-y-6">

            {/* Notification method */}
            <div>
              <h2 className="text-sm font-semibold text-slate-700 mb-3">Notification method</h2>
              <div className="space-y-2">
                {METHOD_OPTIONS.map(({ id, label }) => (
                  <label key={id} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.method.includes(id)}
                      onChange={() => toggleMethod(id)}
                      className="w-4 h-4 rounded accent-primary"
                    />
                    <span className="text-sm text-slate-700">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Reminder timing */}
            <div>
              <h2 className="text-sm font-semibold text-slate-700 mb-3">Reminder timing</h2>
              <select
                value={settings.reminder_minutes}
                onChange={(e) => setSettings((s) => ({ ...s, reminder_minutes: Number(e.target.value) }))}
                className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {REMINDER_OPTIONS.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            {/* Apply to */}
            <div>
              <h2 className="text-sm font-semibold text-slate-700 mb-3">Apply reminders to</h2>
              <div className="space-y-2">
                {APPLY_OPTIONS.map(({ value, label }) => (
                  <label key={value} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="apply_to"
                      value={value}
                      checked={settings.apply_to === value}
                      onChange={() => setSettings((s) => ({ ...s, apply_to: value }))}
                      className="w-4 h-4 accent-primary"
                    />
                    <span className="text-sm text-slate-700">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {error && <p className="text-sm text-rose-500">{error}</p>}
            {saved && <p className="text-sm text-emerald-600">Settings saved!</p>}

            <button
              onClick={handleSave}
              disabled={saving || settings.method.length === 0}
              className="w-full py-3 bg-primary text-white rounded-xl font-medium hover:opacity-90 transition disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save settings"}
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
