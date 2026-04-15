import api from "./api";

// ✅ LISTE
export const getUsers = () =>
  api.get("/admin/users").then(res => res.data);

// ✅ RECHERCHE
export const searchUsers = (keyword) =>
  api.get(`/admin/users/search?keyword=${encodeURIComponent(keyword)}`)
     .then(res => res.data);

// ✅ UPDATE
export const updateUser = (id, data) =>
  api.put(`/admin/users/${id}`, data).then(res => res.data);

// ✅ DELETE
export const deleteUser = (id) =>
  api.delete(`/admin/users/${id}`);