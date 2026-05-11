import axios from "axios";

// ✅ Instance Axios pointant vers l'API Gateway
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL, // ex: http://localhost:8080/api
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Intercepteur REQUEST : injecter automatiquement le token JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ✅ Intercepteur RESPONSE : gestion automatique du 401 (logout)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.clear();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// ✅ API AUTH
export const authApi = {
  login: (data) => api.post("/auth/login", data),
  registerAdmin: (data) => api.post("/auth/register-admin", data),
  getProfile: () => api.get("/auth/profile"),
  updateProfile: (data) => api.put("/auth/profile", data),
  logout: () => api.post("/auth/logout"),
};

// ✅ API USERS (admin)
export const usersApi = {
  create: (data) => api.post("/users", data),
};

export default api;