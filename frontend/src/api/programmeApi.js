import { api } from "./axios";

export const getProgramme = () => api.get("/api/programme").then(r => r.data);

export const updateProgramme = (body) => api.put("/api/programme", body).then(r => r.data);

export const getSyllabi = () => api.get("/api/programme/syllabi").then(r => r.data);

export const uploadSyllabus = (formData) =>
  api.post("/api/programme/syllabi", formData, { headers: { "Content-Type": "multipart/form-data" } }).then(r => r.data);

export const deleteSyllabus = (id) => api.delete(`/api/programme/syllabi/${id}`);
