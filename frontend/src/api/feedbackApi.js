import { api } from "./axios";

export async function getFeedback(courseId, { semester, sort } = {}) {
  const params = {};
  if (semester) params.semester = semester;
  if (sort) params.sort = sort;
  const res = await api.get(`/api/feedback/${courseId}`, { params });
  return res.data;
}

export async function getFeedbackStats(courseId) {
  const res = await api.get(`/api/feedback/${courseId}/stats`);
  return res.data;
}

export async function submitFeedback(courseId, payload) {
  const res = await api.post(`/api/feedback/${courseId}`, payload);
  return res.data;
}

export async function voteFeedback(feedbackId, vote) {
  const res = await api.post(`/api/feedback/${feedbackId}/vote`, { vote });
  return res.data;
}
