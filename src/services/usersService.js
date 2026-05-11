import api from "./api";

// ✅ LISTE DES UTILISATEURS
export const getUsers = () =>
  api.get("/admin/users").then((res) => res.data);

// ✅ RECHERCHE
export const searchUsers = (keyword) =>
  api
    .get(`/admin/users/search?keyword=${encodeURIComponent(keyword)}`)
    .then((res) => res.data);

// ✅ UPDATE UTILISATEUR
export const updateUser = (id, data) =>
  api.put(`/admin/users/${id}`, data).then((res) => res.data);

// ✅ DELETE UTILISATEUR
export const deleteUser = (id) =>
  api.delete(`/admin/users/${id}`);