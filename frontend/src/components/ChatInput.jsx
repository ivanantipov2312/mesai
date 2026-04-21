import { useState } from "react";

export default function ChatInput({ onSend, loading }) {
  const [value, setValue] = useState("");

  const handleSend = () => {
    if (!value.trim()) return;
    onSend(value);
    setValue("");
  };

  return (
    <div className="flex gap-2">
      <input
        className="flex-1 border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
        placeholder="Ask something..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSend()}
      />

      <button
        onClick={handleSend}
        disabled={loading}
        className="bg-primary text-white px-5 rounded-xl hover:opacity-90"
      >
        Send
      </button>
    </div>
  );
}
