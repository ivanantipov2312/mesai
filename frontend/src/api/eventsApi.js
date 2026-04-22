import { api } from "./axios";

export const getEvents = () => api.get("/api/events").then((r) => r.data);
