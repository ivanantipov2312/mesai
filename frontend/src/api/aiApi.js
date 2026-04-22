import { api } from "./axios";

export const sendAIChat = async (message) => {
  const response = await api.post("/api/ai/chat", { message });
  return response.data;
};

export const getChatHistory = async () => {
  const response = await api.get("/api/ai/chat/history");
  return response.data;
};

export const getDailyTip = async () => {
  const response = await api.get("/api/ai/daily-tip");
  return response.data;
};

export const getCourseFeedback = async (courseId, action) => {
  const response = await api.post("/api/ai/course-feedback", { course_id: courseId, action });
  return response.data;
};
