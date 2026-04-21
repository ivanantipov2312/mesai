import { api } from "./axios";

export const getNotificationSettings = () =>
  api.get("/api/settings/notifications").then((r) => r.data);

export const updateNotificationSettings = (body) =>
  api.put("/api/settings/notifications", body).then((r) => r.data);
