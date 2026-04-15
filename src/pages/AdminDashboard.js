import React from "react";
import { Topbar } from "../components/UI";
import AdminNavbar from "../components/AdminNavbar";
import { Outlet } from "react-router-dom";

export default function AdminDashboard() {
  return (
    <div className="dash-shell">
      <Topbar />

      <div className="page-body">
        <div className="page-header">
          <p className="page-eyebrow anim-fade-up">Dashboard</p>
          <h1 className="page-title anim-fade-up delay-1">
            Espace Administrateur
          </h1>
        </div>

        {/* ✅ NAVBAR */}
        <AdminNavbar />

        {/* ✅ Pages enfants */}
        <Outlet />
      </div>
    </div>
  );
}