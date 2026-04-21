import { useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import ChatMessage from "../components/ChatMessage";
import ChatInput from "../components/ChatInput";
import { sendAIChat } from "../api/aiApi";

export default function Chat() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Hi! I am your AI study assistant. Ask me anything.",
    },
  ]);

  const [loading, setLoading] = useState(false);

  const handleSend = async (text) => {
    // add user message
    const newMessages = [
      ...messages,
      { role: "user", text },
    ];

    setMessages(newMessages);
    setLoading(true);

    try {
      const res = await sendAIChat(text);

      setMessages([
        ...newMessages,
        {
          role: "assistant",
          text: res.response || "No response",
        },
      ]);
    } catch (err) {
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          text: "Error: AI request failed.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col h-[80vh]">

        {/* Header */}
        <h1 className="text-3xl font-bold mb-4">
          AI Chat Assistant
        </h1>

        {/* Chat window */}
        <div className="flex-1 overflow-y-auto space-y-3 p-4 bg-softbg rounded-2xl">

          {messages.map((msg, i) => (
            <ChatMessage
              key={i}
              role={msg.role}
              text={msg.text}
            />
          ))}

        </div>

        {/* Input */}
        <div className="mt-4">
          <ChatInput onSend={handleSend} loading={loading} />
        </div>

      </div>
    </DashboardLayout>
  );
}
