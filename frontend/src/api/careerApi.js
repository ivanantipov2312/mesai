import { api } from "./axios";

export const getCareers = async () => {
  const res = await api.get("/api/careers");
  return res.data;
};

export const getCareerMatches = async () => {
  const res = await api.get("/api/careers/match");
  return res.data;
};
