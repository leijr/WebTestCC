import api from "./client";

export const login = (username, password) =>
  api.post("/api/auth/login", { username, password });

export const changePassword = (old_password, new_password) =>
  api.post("/api/auth/change-password", { old_password, new_password });
