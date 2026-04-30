import api from "./client";

export const borrowDevice = (data) => api.post("/api/borrow", data);
export const returnDevice = (id, data) => api.post(`/api/borrow/${id}/return`, data);
export const getMyBorrows = () => api.get("/api/borrow/me");
export const getAllBorrows = (params) => api.get("/api/borrow/all", { params });
export const exportBorrows = (params) =>
  api.get("/api/borrow/export", { params, responseType: "blob" });
