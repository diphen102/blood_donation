import axiosClient from "./axiosClient";

export const authApi = {
  login: (username, password) => axiosClient.post("/auth/login", { username, password }),
  register: (data) => axiosClient.post("/auth/register", data),
  me: () => axiosClient.get("/auth/me"),
  changePassword: (data) => axiosClient.put("/auth/change-password", data),
};
