import api from "./client";

export const getDevices = (params) => api.get("/api/devices", { params });
export const getDevice = (id) => api.get(`/api/devices/${id}`);

export const createDevice = (data) => {
  const fd = new FormData();
  for (const k in data) if (data[k] !== undefined && data[k] !== null) fd.append(k, data[k]);
  return api.post("/api/devices", fd);
};

export const updateDevice = (id, data) => {
  const fd = new FormData();
  for (const k in data) if (data[k] !== undefined && data[k] !== null) fd.append(k, data[k]);
  return api.put(`/api/devices/${id}`, fd);
};

export const deleteDevice = (id) => api.delete(`/api/devices/${id}`);
