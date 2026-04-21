import { api } from "./axios";

function authHeader() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const sendAIChat = async (message) => {
  const response = await api.post("/api/ai/chat", { message }, { headers: authHeader() });
  return response.data;
};

export const getDailyTip = async () => {
  const response = await api.get("/api/ai/daily-tip", { headers: authHeader() });
  return response.data;
};

export const getCourseFeedback = async (courseId, action) => {
  const response = await api.post(
    "/api/ai/course-feedback",
    { course_id: courseId, action },
    { headers: authHeader() }
  );
  return response.data;
};
