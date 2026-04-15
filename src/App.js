import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";

import LoginPage from "./pages/LoginPage";
import RegisterAdminPage from "./pages/RegisterAdminPage";
import AdminDashboard from "./pages/AdminDashboard";
import CreateUserPage from "./pages/CreateUserPage";
import UsersListPage from "./pages/UsersListPage";
import EncadrantDashboard from "./pages/EncadrantDashboard";
import EtudiantDashboard from "./pages/EtudiantDashboard";
import ProfilePage from "./pages/ProfilePage";

function ProtectedRoute({ children, roles }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;

  if (roles && !roles.includes(user.role))
    return <Navigate to="/" replace />;

  return children;
}

function RoleRedirect() {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  const redirect = {
    ADMIN: "/admin",
    ENCADRANT: "/encadrant",
    ETUDIANT: "/etudiant",
  };

  return <Navigate to={redirect[user.role]} replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register/admin" element={<RegisterAdminPage />} />

      {/* ✅ ADMIN avec sous‑routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={["ADMIN"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      >
        <Route path="create" element={<CreateUserPage />} />
        <Route path="list" element={<UsersListPage />} />
      </Route>

      {/* ENCADRANT */}
      <Route
        path="/encadrant"
        element={
          <ProtectedRoute roles={["ENCADRANT"]}>
            <EncadrantDashboard />
          </ProtectedRoute>
        }
      />

      {/* ETUDIANT */}
      <Route
        path="/etudiant"
        element={
          <ProtectedRoute roles={["ETUDIANT"]}>
            <EtudiantDashboard />
          </ProtectedRoute>
        }
      />

      {/* PROFIL */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />

      {/* REDIRECTION */}
      <Route path="*" element={<RoleRedirect />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}