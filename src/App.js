// src/App.jsx

import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { AuthProvider, useAuth } from "./context/AuthContext";

/* ── Public ─────────────────────────────────────────────────── */
import LoginPage         from "./pages/LoginPage";
import RegisterAdminPage from "./pages/RegisterAdminPage";
import ProfilePage       from "./pages/ProfilePage";

/* ── Admin ──────────────────────────────────────────────────── */
import AdminDashboard  from "./pages/AdminDashboard";
import CreateUserPage  from "./pages/CreateUserPage";
import UsersListPage   from "./pages/UsersListPage";
import AdminOffres     from "./pages/admin/AdminOffres";
import AdminDemandes   from "./pages/admin/AdminDemandes";
import AdminSoutenances from "./pages/admin/AdminSoutenances";

/* ── Encadrant ──────────────────────────────────────────────── */
import EncadrantDashboard  from "./pages/EncadrantDashboard";
import Encadrements        from "./pages/encadrant/encadrements";
import LivrablesEncadrant  from "./pages/encadrant/livrables";
import SoutenancesEncadrant from "./pages/encadrant/soutenances";
import LivrableDetail      from "./pages/encadrant/LivrableDetail";

/* ── Étudiant ───────────────────────────────────────────────── */
import EtudiantDashboard  from "./pages/EtudiantDashboard";
import OffresEtudiant     from "./pages/etudiant/offres";
import DemandesEtudiant   from "./pages/etudiant/demandes";
import LivrablesEtudiant  from "./pages/etudiant/livrables";
import SoutenanceEtudiant from "./pages/etudiant/soutenance";

// =========================================================
// ROUTE PROTÉGÉE
// =========================================================

/**
 * Redirige vers /login si non connecté.
 * Redirige vers / (RoleRedirect) si le rôle n'est pas autorisé.
 */
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

// =========================================================
// REDIRECTION PAR RÔLE
// =========================================================

function RoleRedirect() {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  const routes = {
    ADMIN:     "/admin",
    ENCADRANT: "/encadrant",
    ETUDIANT:  "/etudiant",
  };

  return <Navigate to={routes[user.role] ?? "/login"} replace />;
}

// =========================================================
// ROUTES
// =========================================================

function AppRoutes() {
  return (
    <Routes>

      {/* ── Public ── */}
      <Route path="/login"          element={<LoginPage />} />
      <Route path="/register/admin" element={<RegisterAdminPage />} />

      {/* ── Livrable Détail (étudiant + encadrant) ── */}
      <Route
        path="/livrables/:livrableId"
        element={
          <ProtectedRoute roles={["ETUDIANT", "ENCADRANT"]}>
            <LivrableDetail />
          </ProtectedRoute>
        }
      />

      {/* ── Admin ── */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={["ADMIN"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      >
        <Route index                   element={<Navigate to="offres" replace />} />
        <Route path="create"           element={<CreateUserPage />} />
        <Route path="list"             element={<UsersListPage />} />
        <Route path="offres"           element={<AdminOffres />} />
        <Route path="demandes"         element={<AdminDemandes />} />
        <Route path="soutenances"      element={<AdminSoutenances />} />
      </Route>

      {/* ── Encadrant ── */}
      <Route
        path="/encadrant"
        element={
          <ProtectedRoute roles={["ENCADRANT"]}>
            <EncadrantDashboard />
          </ProtectedRoute>
        }
      >
        <Route index             element={<Encadrements />} />
        <Route path="etudiants"  element={<Encadrements />} />
        <Route path="livrables"  element={<LivrablesEncadrant />} />
        <Route path="soutenances" element={<SoutenancesEncadrant />} />
      </Route>

      {/* ── Étudiant ── */}
      <Route
        path="/etudiant"
        element={
          <ProtectedRoute roles={["ETUDIANT"]}>
            <EtudiantDashboard />
          </ProtectedRoute>
        }
      >
        <Route index             element={<OffresEtudiant />} />
        <Route path="offres"     element={<OffresEtudiant />} />
        <Route path="demandes"   element={<DemandesEtudiant />} />
        <Route path="livrables"  element={<LivrablesEtudiant />} />
        <Route path="soutenance" element={<SoutenanceEtudiant />} />
      </Route>

      {/* ── Profil (tous rôles connectés) ── */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />

      {/* ── Fallback ── */}
      <Route path="*" element={<RoleRedirect />} />

    </Routes>
  );
}

// =========================================================
// APP ROOT
// =========================================================

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
