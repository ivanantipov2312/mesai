import { api } from "./axios";

export const sendAIChat = async (message) => {
  const response = await api.post("/api/ai/chat", {
    message,
  });

  return response.data;
};

export const getDailyTip = async () => {
	const response = await api.get("/api/ai/daily-tip");
	return response.data;
};
