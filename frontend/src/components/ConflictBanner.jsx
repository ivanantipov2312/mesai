import { useNavigate } from "react-router-dom";

export default function ConflictBanner({ conflicts, onDismiss }) {
  const navigate = useNavigate();

  if (!conflicts || conflicts.length === 0) return null;

  const handleAskAI = (c) => {
    const message =
      `I have a conflict between "${c.course_a.name}" and "${c.course_b.name}" ` +
      `on ${c.day} at ${c.overlap}. What should I do?`;
    navigate("/chat", { state: { prefill: message } });
  };

  return (
    <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2 min-w-0">
          <span className="shrink-0 text-base leading-snug mt-0.5">⚠️</span>
          <div className="min-w-0 w-full">
            <p className="font-semibold text-red-700 text-sm">
              Schedule Conflict{conflicts.length > 1 ? "s" : ""} Detected
            </p>
            <ul className="mt-1 space-y-1.5">
              {conflicts.map((c, i) => (
                <li key={i} className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm text-red-600">
                    <span className="font-medium">"{c.course_a.name}"</span>
                    {" and "}
                    <span className="font-medium">"{c.course_b.name}"</span>
                    {" overlap on "}
                    <span className="font-medium">{c.day}</span>
                    {" "}
                    <span className="font-medium">{c.overlap}</span>
                  </span>
                  <button
                    onClick={() => handleAskAI(c)}
                    className="shrink-0 text-xs px-2 py-0.5 rounded-lg bg-primary text-white hover:opacity-90 transition"
                  >
                    Ask AI
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <button
          onClick={onDismiss}
          aria-label="Dismiss"
          className="shrink-0 text-red-400 hover:text-red-600 transition text-xl leading-none mt-0.5"
        >
          ×
        </button>
      </div>
    </div>
  );
}
