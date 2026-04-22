import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import ChatMessage from "../components/ChatMessage";
import ChatInput from "../components/ChatInput";
import { sendAIChat, getChatHistory } from "../api/aiApi";

export default function Chat() {
  const location = useLocation();
  const navigate = useNavigate();
  const bottomRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const prefillHandled = useRef(false);

  // Load persisted history on mount
  useEffect(() => {
    getChatHistory()
      .then((rows) => {
        if (rows.length === 0) {
          setMessages([{ role: "assistant", text: "Hi! I'm your AI study advisor. Ask me anything about your courses, career goals, or skills." }]);
        } else {
          setMessages(rows.map((r) => ({ role: r.role, text: r.content })));
        }
      })
      .catch(() => {
        setMessages([{ role: "assistant", text: "Hi! I'm your AI study advisor. Ask me anything about your courses, career goals, or skills." }]);
      })
      .finally(() => setHistoryLoading(false));
  }, []);

  // Auto-scroll on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (text) => {
    const newMessages = [...messages, { role: "user", text }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const res = await sendAIChat(text);
      setMessages([...newMessages, { role: "assistant", text: res.response || "No response" }]);
    } catch {
      setMessages([...newMessages, { role: "assistant", text: "Something went wrong. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const prefill = location.state?.prefill;
    if (prefill && !prefillHandled.current && !historyLoading) {
      prefillHandled.current = true;
      navigate("/chat", { replace: true, state: null });
      handleSend(prefill);
    }
  }, [historyLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <DashboardLayout>
      <div className="flex flex-col h-[82vh]">
        <div className="mb-4">
          <h1 className="text-3xl font-bold text-slate-800">AI Chat</h1>
          <p className="text-slate-500 text-sm mt-1">Your conversation history is saved across sessions.</p>
        </div>

        {/* Chat window */}
        <div className="flex-1 overflow-y-auto space-y-3 p-4 bg-softbg rounded-2xl">
          {historyLoading ? (
            <p className="text-sm text-slate-400 text-center pt-8">Loading conversation…</p>
          ) : (
            <>
              {messages.map((msg, i) => (
                <ChatMessage key={i} role={msg.role} text={msg.text} />
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-slate-100 rounded-2xl rounded-bl-md px-4 py-3 text-sm text-slate-400 shadow-sm">
                    Thinking…
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </>
          )}
        </div>

        <div className="mt-4">
          <ChatInput onSend={handleSend} loading={loading || historyLoading} />
        </div>
      </div>
    </DashboardLayout>
  );
}
