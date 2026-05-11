import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";

/* ───────────── PUBLIC ───────────── */
import LoginPage from "./pages/LoginPage";
import RegisterAdminPage from "./pages/RegisterAdminPage";
import ProfilePage from "./pages/ProfilePage";

/* ───────────── ADMIN ───────────── */
import AdminDashboard from "./pages/AdminDashboard";
import CreateUserPage from "./pages/CreateUserPage";
import UsersListPage from "./pages/UsersListPage";
import AdminOffres from "./pages/admin/AdminOffres";
import AdminDemandes from "./pages/admin/AdminDemandes";
import AdminSoutenances from "./pages/admin/AdminSoutenances";

/* ───────────── ENCADRANT ───────────── */
import EncadrantDashboard from "./pages/EncadrantDashboard";
import Encadrements from "./pages/encadrant/encadrements";
import LivrablesEncadrant from "./pages/encadrant/livrables";
import SoutenancesEncadrant from "./pages/encadrant/soutenances";

/* ───────────── ÉTUDIANT ───────────── */
import EtudiantDashboard from "./pages/EtudiantDashboard";
import OffresEtudiant from "./pages/etudiant/offres";
import DemandesEtudiant from "./pages/etudiant/demandes";
import LivrablesEtudiant from "./pages/etudiant/livrables";
import SoutenanceEtudiant from "./pages/etudiant/soutenance";

/* ───────────── LIVRABLE DÉTAIL (COMMUN) ───────────── */
import LivrableDetail from "./pages/encadrant/LivrableDetail";

/* ───────────── ROUTE PROTÉGÉE ───────────── */
function ProtectedRoute({ children, roles }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

/* ───────────── REDIRECTION PAR RÔLE ───────────── */
function RoleRedirect() {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  return (
    <Navigate
      to={{
        ADMIN: "/admin",
        ENCADRANT: "/encadrant",
        ETUDIANT: "/etudiant",
      }[user.role]}
      replace
    />
  );
}

/* ───────────── ROUTES ───────────── */
function AppRoutes() {
  return (
    <Routes>
      {/* PUBLIC */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register/admin" element={<RegisterAdminPage />} />

      {/* LIVRABLE DÉTAIL (ÉTUDIANT + ENCADRANT) */}
      <Route
        path="/livrables/:livrableId"
        element={
          <ProtectedRoute roles={["ETUDIANT", "ENCADRANT"]}>
            <LivrableDetail />
          </ProtectedRoute>
        }
      />

      {/* ADMIN */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={["ADMIN"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="offres" replace />} />
        <Route path="create" element={<CreateUserPage />} />
        <Route path="list" element={<UsersListPage />} />
        <Route path="offres" element={<AdminOffres />} />
        <Route path="demandes" element={<AdminDemandes />} />
        <Route path="soutenances" element={<AdminSoutenances />} />
      </Route>

      {/* ENCADRANT */}
      <Route
        path="/encadrant"
        element={
          <ProtectedRoute roles={["ENCADRANT"]}>
            <EncadrantDashboard />
          </ProtectedRoute>
        }
      >
        <Route index element={<Encadrements />} />
        <Route path="etudiants" element={<Encadrements />} />
        <Route path="livrables" element={<LivrablesEncadrant />} />
        <Route path="soutenances" element={<SoutenancesEncadrant />} />
      </Route>

      {/* ÉTUDIANT */}
      <Route
        path="/etudiant"
        element={
          <ProtectedRoute roles={["ETUDIANT"]}>
            <EtudiantDashboard />
          </ProtectedRoute>
        }
      >
        <Route index element={<OffresEtudiant />} />
        <Route path="offres" element={<OffresEtudiant />} />
        <Route path="demandes" element={<DemandesEtudiant />} />
        <Route path="livrables" element={<LivrablesEtudiant />} />
        <Route path="soutenance" element={<SoutenanceEtudiant />} />
      </Route>

      {/* PROFIL */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />

      {/* FALLBACK */}
      <Route path="*" element={<RoleRedirect />} />
    </Routes>
  );
}

/* ───────────── APP ───────────── */
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}