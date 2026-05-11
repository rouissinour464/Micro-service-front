import React from "react";
import { Topbar, Alert } from "../components/UI";
import AdminNavbar from "../components/AdminNavbar";
import { Outlet } from "react-router-dom";

export default function AdminDashboard() {
  const [alert, setAlert] = React.useState({ type: "", msg: "" });

  return (
    <div className="dash-shell">
      <Topbar />

      <div className="page-body">
        <div className="page-header">
          <p className="page-eyebrow">Dashboard</p>
          <h1 className="page-title">Espace Administrateur</h1>
        </div>

        <AdminNavbar />
        {alert.msg && <Alert type={alert.type} message={alert.msg} />}

        {/* Pages dynamiques */}
        <Outlet />
      </div>
    </div>
  );
}