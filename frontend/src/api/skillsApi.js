import { api } from "./axios";

export const getMySkills = async () => {
  const res = await api.get("/api/skills/my");
  return res.data;
};

export const getSkillGaps = async (careerId) => {
  const params = careerId ? `?career_id=${careerId}` : "";
  const res = await api.get(`/api/skills/gaps${params}`);
  return res.data;
};

export const getAllSkills = async () => {
  const res = await api.get("/api/skills");
  return res.data;
};
