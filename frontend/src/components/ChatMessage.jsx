const stripMarkdown = (str) =>
  str
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/#{1,6}\s+/g, "")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[(.+?)\]\(.+?\)/g, "$1")
    .trim();

export default function ChatMessage({ role, text }) {
  const isUser = role === "user";
  const clean = isUser ? text : stripMarkdown(text);

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[75%] px-4 py-3 rounded-2xl shadow-sm text-sm leading-relaxed whitespace-pre-wrap ${
          isUser
            ? "bg-primary text-white rounded-br-md"
            : "bg-white text-slate-800 rounded-bl-md border border-slate-100"
        }`}
      >
        {clean}
      </div>
    </div>
  );
}
