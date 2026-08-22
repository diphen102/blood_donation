import axiosClient from "./axiosClient";

// Tạo bộ hàm CRUD chuẩn REST cho 1 resource, dùng chung cho Donor/Donation/Hospital/BloodUnit
// để tránh lặp code — 4 module này có cùng 1 khuôn mẫu API (GET list, GET :id, POST, PUT, DELETE).
export function createResourceApi(resourcePath) {
  return {
    list: (params) => axiosClient.get(`/${resourcePath}`, { params }),
    getById: (id) => axiosClient.get(`/${resourcePath}/${id}`),
    create: (data) => axiosClient.post(`/${resourcePath}`, data),
    update: (id, data) => axiosClient.put(`/${resourcePath}/${id}`, data),
    remove: (id) => axiosClient.delete(`/${resourcePath}/${id}`),
  };
}
