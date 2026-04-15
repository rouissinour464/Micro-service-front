import api from "./api";

// ✅ LOGIN
export const loginUser = (data) =>
  api.post("/auth/login", data).then(r => r.data);

// ✅ REGISTER ADMIN
export const registerAdmin = (data) =>
  api.post("/auth/register-admin", data).then(r => r.data);

// ✅ PROFILE GET
export const getProfile = () =>
  api.get("/auth/profile").then(r => r.data);

// ✅ UPDATE PROFILE
export const updateProfile = (data) =>
  api.put("/auth/profile", data).then(r => r.data);

// ✅ CREATE USER (enseignant / étudiant)
export const createUser = (data) =>
  api.post("/users", data).then(r => r.data);