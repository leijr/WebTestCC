import api from "./client";

export const getUsers = () => api.get("/api/users");
export const createUser = (data) => api.post("/api/users", data);
export const updateUser = (id, data) => api.put(`/api/users/${id}`, data);
export const deleteUser = (id) => api.delete(`/api/users/${id}`);
export const resetPassword = (id) => api.post(`/api/users/${id}/reset-password`);
