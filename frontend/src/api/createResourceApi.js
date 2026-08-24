import axiosClient from "./axiosClient";

export function createResourceApi(resourcePath) {
  return {
    list: (params) => axiosClient.get(`/${resourcePath}`, { params }),
    getById: (id) => axiosClient.get(`/${resourcePath}/${id}`),
    create: (data) => axiosClient.post(`/${resourcePath}`, data),
    update: (id, data) => axiosClient.put(`/${resourcePath}/${id}`, data),
    remove: (id) => axiosClient.delete(`/${resourcePath}/${id}`),
  };
}
