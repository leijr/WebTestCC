import api from "./client";

export const getDashboardStats = () => api.get("/api/dashboard/stats");
