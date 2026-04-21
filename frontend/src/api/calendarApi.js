import { api } from "./axios";

export const getNotes = () => api.get("/api/calendar/notes").then((r) => r.data);

export const createNote = (body) => api.post("/api/calendar/notes", body).then((r) => r.data);

export const updateNote = (id, body) => api.put(`/api/calendar/notes/${id}`, body).then((r) => r.data);

export const deleteNote = (id) => api.delete(`/api/calendar/notes/${id}`);
