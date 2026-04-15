import axios from "axios";

// ✅ Instance Axios pointant Gateway
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL, // http://localhost:8080/api
  headers: { "Content-Type": "application/json" },
});

// ✅ Intercepteur : injecter automatiquement le token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ✅ Gestion 401 → logout auto
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.clear();
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

// ✅ API
export const authApi = {
  login: (data) => api.post("/auth/login", data),
  registerAdmin: (data) => api.post("/auth/register-admin", data),
  getProfile: () => api.get("/auth/profile"),
  updateProfile: (data) => api.put("/auth/profile", data),
  logout: () => api.post("/auth/logout"),
};

export const usersApi = {
  create: (data) => api.post("/users", data),
};

export default api;