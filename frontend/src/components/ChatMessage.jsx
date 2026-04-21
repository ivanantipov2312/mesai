export default function ChatMessage({ role, text }) {
  const isUser = role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`
          max-w-[70%] px-4 py-3 rounded-2xl shadow-sm text-sm
          ${isUser
            ? "bg-primary text-white rounded-br-sm"
            : "bg-white text-gray-800 rounded-bl-sm border"
          }
        `}
      >
        {text}
      </div>
    </div>
  );
}
