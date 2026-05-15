import axios from "axios";

/* =========================================================
   BASE URL
========================================================= */
const API_URL = process.env.REACT_APP_API_URL || "/api";

/* =========================================================
   HELPER URL FICHIERS
========================================================= */
export const getFileUrl = (filename) => {
  if (!filename) return null;
  // /api → /api/files/...  (Nginx proxy vers gateway → stage-service)
  const base = API_URL.replace(/\/api$/, "");
  return `${base}/api/files/${filename}`;
};

/* =========================================================
   AXIOS INSTANCE
========================================================= */
const stageApi = axios.create({
  baseURL: API_URL,
  timeout: Number(process.env.REACT_APP_API_TIMEOUT) || 15000,
});

/* =========================================================
   INTERCEPTORS
========================================================= */
stageApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

stageApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.clear();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

/* =========================================================
   OFFRES
========================================================= */
export const getOffresActives = () =>
  stageApi.get("/offres").then((r) => r.data);

export const getAllOffres = () =>
  stageApi.get("/offres/all").then((r) => r.data);

export const createOffre = (data) =>
  stageApi.post("/offres", data).then((r) => r.data);

export const updateOffre = (id, data) =>
  stageApi.put(`/offres/${id}`, data).then((r) => r.data);

export const toggleOffre = (id) =>
  stageApi.patch(`/offres/${id}/toggle`).then((r) => r.data);

export const deleteOffre = (id) =>
  stageApi.delete(`/offres/${id}`).then((r) => r.data);

/* =========================================================
   HELPER FORM DATA
========================================================= */
const buildDemandeFormData = (data) => {
  const formData = new FormData();
  formData.append("titreProjet",       data.titreProjet       || "");
  formData.append("descriptionProjet", data.descriptionProjet || "");
  formData.append("domaine",           data.domaine           || "");
  formData.append("niveau",            data.niveau            || "");
  formData.append("lieu",              data.lieu              || "");
  formData.append("entreprise",        data.entreprise        || "");
  if (data.imageFile) formData.append("file", data.imageFile);
  return formData;
};

/* =========================================================
   DEMANDES (ÉTUDIANT)
========================================================= */
export const soumettreDemande = (data) =>
  stageApi.post("/demandes", buildDemandeFormData(data), {
    headers: { "Content-Type": "multipart/form-data" },
  }).then((r) => r.data);

export const updateDemande = (id, data) =>
  stageApi.put(`/demandes/${id}`, buildDemandeFormData(data), {
    headers: { "Content-Type": "multipart/form-data" },
  }).then((r) => r.data);

export const deleteDemande = (id) =>
  stageApi.delete(`/demandes/${id}`).then((r) => r.data);

export const getMesDemandes = () =>
  stageApi.get("/demandes/mes-demandes").then((r) => r.data);

export const getDemandeById = (id) =>
  stageApi.get(`/demandes/${id}`).then((r) => r.data);

/* =========================================================
   ADMIN DEMANDES
========================================================= */
export const getAllDemandes = () =>
  stageApi.get("/demandes").then((r) => r.data);

export const getDemandesEnAttente = () =>
  stageApi.get("/demandes/en-attente").then((r) => r.data);

export const validerDemande = (id, data) =>
  stageApi.patch(`/demandes/${id}/validation`, data).then((r) => r.data);

export const choisirEncadrant = (demandeId, encadrantId) =>
  stageApi.patch(`/demandes/${demandeId}/encadrant`, {
    encadrantId: Number(encadrantId),
  }).then((r) => r.data);

/* =========================================================
   ENCADRANTS
========================================================= */
export const getEncadrants = () =>
  stageApi.get("/encadrants").then((r) => r.data);

export const getMesEncadrements = () =>
  stageApi.get("/demandes/mes-encadrements").then((r) => r.data);

/* =========================================================
   USERS
========================================================= */
export const getUsersByRole = (role) =>
  stageApi.get("/users/by-role", { params: { role } }).then((r) => r.data);

/* =========================================================
   LIVRABLES
========================================================= */
export const deposerLivrable = (formData) =>
  stageApi.post("/livrables", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  }).then((r) => r.data);

export const getMesLivrables = () =>
  stageApi.get("/livrables/mes-livrables").then((r) => r.data);

export const getLivrablesEncadrant = () =>
  stageApi.get("/livrables/mes-etudiants").then((r) => r.data);

export const getLivrablesByDemande = (id) =>
  stageApi.get(`/livrables/demande/${id}`).then((r) => r.data);

export const getLivrableById = (id) =>
  stageApi.get(`/livrables/${id}`).then((r) => r.data);

export const updateLivrable = (id, data) =>
  stageApi.put(`/livrables/${id}`, data, {
    headers: { "Content-Type": "multipart/form-data" },
  }).then((r) => r.data);

export const deleteLivrable = (id) =>
  stageApi.delete(`/livrables/${id}`).then((r) => r.data);

export const deleteLivrableEncadrant = (id) =>
  stageApi.delete(`/livrables/${id}/encadrant`).then((r) => r.data);

/* =========================================================
   COMMENTAIRES
========================================================= */
export const commenterLivrable = (data) =>
  stageApi.post("/commentaires", data).then((r) => r.data);

export const addCommentaire = (livrableId, contenu) =>
  stageApi.post(`/commentaires/${livrableId}`, { contenu }).then((r) => r.data);

export const getCommentairesByLivrable = (id) =>
  stageApi.get(`/commentaires/livrable/${id}`).then((r) => r.data);

export const getMesCommentaires = () =>
  stageApi.get("/commentaires/mes-commentaires").then((r) => r.data);

export const deleteCommentaire = (id) =>
  stageApi.delete(`/commentaires/${id}`).then((r) => r.data);

/* =========================================================
   SOUTENANCES
========================================================= */
export const planifierSoutenance = (data) =>
  stageApi.post("/soutenances", data).then((r) => r.data);

export const getMaSoutenance = () =>
  stageApi.get("/soutenances/ma-soutenance").then((r) => r.data);

export const getMesSoutenances = () =>
  stageApi.get("/soutenances/mes-etudiants").then((r) => r.data);

export const getAllSoutenances = () =>
  stageApi.get("/soutenances").then((r) => r.data);

export const deleteSoutenance = (id) =>
  stageApi.delete(`/soutenances/${id}`).then((r) => r.data);

export default stageApi;