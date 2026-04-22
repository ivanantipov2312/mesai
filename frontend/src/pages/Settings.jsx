import { useEffect, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import { getNotificationSettings, updateNotificationSettings } from "../api/settingsApi";
import { getMe, updateMe } from "../api/authApi";

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

const FREQUENCY_OPTIONS = [
  {
    value: "high",
    label: "High",
    desc: "7 days, 4 days, and 1 day before",
  },
  {
    value: "medium",
    label: "Medium",
    desc: "4 days and 1 day before",
  },
  {
    value: "low",
    label: "Low",
    desc: "1 day before only",
  },
];

function useTheme() {
  const [theme, setThemeState] = useState(() => localStorage.getItem("theme") || "light");

  const setTheme = (t) => {
    setThemeState(t);
    localStorage.setItem("theme", t);
    if (t === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  useEffect(() => {
    if (theme === "dark") document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, []);

  return { theme, setTheme };
}

export default function Settings() {
  const { theme, setTheme } = useTheme();

  // Profile state
  const [profile, setProfile] = useState({ name: "", email: "", phone: "", program: "" });
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  // Notifications state
  const [notif, setNotif] = useState({ method: ["in_app"], reminder_minutes: 15, reminder_frequency: "medium", apply_to: "both" });
  const [notifLoading, setNotifLoading] = useState(true);
  const [notifSaving, setNotifSaving] = useState(false);
  const [notifSaved, setNotifSaved] = useState(false);

  const [error, setError] = useState("");

  useEffect(() => {
    getMe()
      .then((u) => setProfile({ name: u.name || "", email: u.email || "", phone: u.phone || "", program: u.program || "" }))
      .catch(console.error)
      .finally(() => setProfileLoading(false));

    getNotificationSettings()
      .then(setNotif)
      .catch(console.error)
      .finally(() => setNotifLoading(false));
  }, []);

  const handleProfileSave = async () => {
    setProfileSaving(true);
    setError("");
    try {
      await updateMe({ name: profile.name, phone: profile.phone, program: profile.program });
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 3000);
    } catch {
      setError("Failed to save profile.");
    } finally {
      setProfileSaving(false);
    }
  };

  const handleNotifSave = async () => {
    setNotifSaving(true);
    setError("");
    try {
      const updated = await updateNotificationSettings(notif);
      setNotif(updated);
      setNotifSaved(true);
      setTimeout(() => setNotifSaved(false), 3000);
    } catch {
      setError("Failed to save notification settings.");
    } finally {
      setNotifSaving(false);
    }
  };

  const toggleMethod = (id) =>
    setNotif((s) => ({
      ...s,
      method: s.method.includes(id) ? s.method.filter((m) => m !== id) : [...s.method, id],
    }));

  return (
    <DashboardLayout>
      <div className="max-w-xl space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Settings</h1>
          <p className="text-slate-500 mt-1">Profile, notifications, and appearance.</p>
        </div>

        {error && <div className="text-sm text-rose-500 bg-rose-50 px-4 py-2 rounded-xl">{error}</div>}

        {/* ── Profile ── */}
        <section className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-6 space-y-4">
          <h2 className="text-base font-semibold text-slate-800 dark:text-white">Profile</h2>
          {profileLoading ? (
            <p className="text-sm text-slate-400">Loading…</p>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Name</label>
                  <input value={profile.name} onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
                </div>
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Email</label>
                  <input value={profile.email} disabled
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-slate-50 text-slate-400 cursor-not-allowed dark:bg-slate-700 dark:border-slate-600" />
                </div>
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Phone</label>
                  <input value={profile.phone} onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
                    placeholder="+372 5XXX XXXX"
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
                </div>
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Program</label>
                  <input value={profile.program} onChange={(e) => setProfile((p) => ({ ...p, program: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
                </div>
              </div>
              {profileSaved && <p className="text-sm text-emerald-600">Profile saved!</p>}
              <button onClick={handleProfileSave} disabled={profileSaving}
                className="w-full py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:opacity-90 transition disabled:opacity-50">
                {profileSaving ? "Saving…" : "Save profile"}
              </button>
            </>
          )}
        </section>

        {/* ── Appearance ── */}
        <section className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-6 space-y-4">
          <h2 className="text-base font-semibold text-slate-800 dark:text-white">Appearance</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Dark mode</p>
              <p className="text-xs text-slate-400">Switch between light and dark interface</p>
            </div>
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className={`relative w-12 h-6 rounded-full transition-colors ${theme === "dark" ? "bg-primary" : "bg-slate-200"}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${theme === "dark" ? "translate-x-6" : ""}`} />
            </button>
          </div>
        </section>

        {/* ── Notifications ── */}
        <section className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-6 space-y-5">
          <h2 className="text-base font-semibold text-slate-800 dark:text-white">Notifications</h2>
          {notifLoading ? (
            <p className="text-sm text-slate-400">Loading…</p>
          ) : (
            <>
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">Method</p>
                <div className="space-y-2">
                  {METHOD_OPTIONS.map(({ id, label }) => (
                    <label key={id} className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" checked={notif.method.includes(id)} onChange={() => toggleMethod(id)} className="w-4 h-4 rounded accent-primary" />
                      <span className="text-sm text-slate-700 dark:text-slate-300">{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">Reminder frequency</p>
                <div className="space-y-2">
                  {FREQUENCY_OPTIONS.map(({ value, label, desc }) => (
                    <label key={value} className="flex items-start gap-3 cursor-pointer p-3 rounded-xl border border-slate-100 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-700 transition">
                      <input type="radio" name="frequency" value={value} checked={notif.reminder_frequency === value}
                        onChange={() => setNotif((s) => ({ ...s, reminder_frequency: value }))} className="mt-0.5 accent-primary" />
                      <div>
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{label}</p>
                        <p className="text-xs text-slate-400">{desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">Apply to</p>
                <div className="space-y-2">
                  {APPLY_OPTIONS.map(({ value, label }) => (
                    <label key={value} className="flex items-center gap-3 cursor-pointer">
                      <input type="radio" name="apply_to" value={value} checked={notif.apply_to === value}
                        onChange={() => setNotif((s) => ({ ...s, apply_to: value }))} className="w-4 h-4 accent-primary" />
                      <span className="text-sm text-slate-700 dark:text-slate-300">{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {notifSaved && <p className="text-sm text-emerald-600">Notification settings saved!</p>}
              <button onClick={handleNotifSave} disabled={notifSaving || notif.method.length === 0}
                className="w-full py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:opacity-90 transition disabled:opacity-50">
                {notifSaving ? "Saving…" : "Save notifications"}
              </button>
            </>
          )}
        </section>
      </div>
    </DashboardLayout>
  );
}
