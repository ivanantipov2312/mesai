import { api } from "./axios";

export async function registerUser(payload) {
  const response = await api.post("/api/auth/register", payload);
  return response.data;
}

export async function loginUser(payload) {
  const response = await api.post("/api/auth/login", payload);
  return response.data;
}

export async function getMe() {
  const response = await api.get("/api/auth/me");
  return response.data;
}

export async function updateMe(payload) {
  const response = await api.patch("/api/auth/me", payload);
  return response.data;
}
