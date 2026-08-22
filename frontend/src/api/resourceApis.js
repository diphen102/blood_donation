import { createResourceApi } from "./createResourceApi";
import axiosClient from "./axiosClient";

export const donorApi = {
  ...createResourceApi("donors"),
  me: () => axiosClient.get("/donors/me"),
};
export const donationApi = {
  ...createResourceApi("donations"),
  mine: () => axiosClient.get("/donations/mine"),
};
export const hospitalApi = createResourceApi("hospitals");
export const bloodUnitApi = {
  ...createResourceApi("blood-units"),
  summary: (hospitalId) => axiosClient.get("/blood-units/summary", { params: hospitalId ? { hospitalId } : {} }),
  forDonation: (donationId) => axiosClient.get(`/blood-units/for-donation/${donationId}`),
  use: (id, department) => axiosClient.put(`/blood-units/${id}/use`, { department }),
  discard: (id, reason) => axiosClient.put(`/blood-units/${id}/discard`, { reason }),
};
export const bannerApi = createResourceApi("banners");

export const bloodRequestApi = {
  ...createResourceApi("blood-requests"),
  decide: (id, action, unitIds) => axiosClient.put(`/blood-requests/${id}/decision`, { action, unitIds }),
  receive: (id) => axiosClient.put(`/blood-requests/${id}/receive`),
};

export const notificationApi = {
  list: () => axiosClient.get("/notifications"),
  mine: () => axiosClient.get("/notifications/mine"),
  create: (data) => axiosClient.post("/notifications", data),
  markRead: (id) => axiosClient.put(`/notifications/${id}/read`),
  remove: (id) => axiosClient.delete(`/notifications/${id}`),
};

export const userApi = {
  list: () => axiosClient.get("/users"),
  create: (data) => axiosClient.post("/users", data),
  toggleActive: (id) => axiosClient.put(`/users/${id}/toggle-active`),
  updateRole: (id, data) => axiosClient.put(`/users/${id}/role`, data),
  resetPassword: (id) => axiosClient.put(`/users/${id}/reset-password`),
  remove: (id) => axiosClient.delete(`/users/${id}`),
};
