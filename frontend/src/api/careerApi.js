import { api } from "./axios";

export const getCareers = async () => {
  const res = await api.get("/api/careers");
  return res.data;
};

export const getCareerMatches = async () => {
  const res = await api.get("/api/careers/match");
  return res.data;
};

export const analyzeCv = async (formData) => {
  const res = await api.post("/api/careers/analyze-cv", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};
