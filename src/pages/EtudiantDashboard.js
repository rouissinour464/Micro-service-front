import React from "react";
import { Topbar, Alert } from "../components/UI";
import EtudiantNavbar from "../components/EtudiantNavbar";
import { Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function EtudiantDashboard() {
  const { user } = useAuth();
  const [alert, setAlert] = React.useState({ type: "", msg: "" });

  return (
    <div className="dash-shell">
      <Topbar />

      <div className="page-body">
        <div className="page-header">
          <p className="page-eyebrow">Dashboard</p>
          <h1 className="page-title">
            Espace Étudiant – {user?.fullName?.split(" ")[0]} 📚
          </h1>
        </div>

        <EtudiantNavbar />
        {alert.msg && <Alert type={alert.type} message={alert.msg} />}

        {/* Pages dynamiques */}
        <Outlet />
      </div>
    </div>
  );
}
