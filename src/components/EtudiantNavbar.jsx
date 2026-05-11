import React from "react";
import { NavLink } from "react-router-dom";

const baseStyle = {
  padding: "10px 16px",
  borderRadius: "var(--r-md)",
  fontWeight: 600,
  fontSize: 14,
  cursor: "pointer",
  textDecoration: "none",
};

function EtudiantLink({ to, label, icon }) {
  return (
    <NavLink
      to={to}
      style={({ isActive }) => ({
        ...baseStyle,
        color: isActive ? "white" : "var(--text-muted)",
        background: isActive ? "var(--accent)" : "transparent",
      })}
    >
      {icon} {label}
    </NavLink>
  );
}

export default function EtudiantNavbar() {
  return (
    <div
      style={{
        background: "var(--dark-2)",
        padding: 16,
        borderRadius: "var(--r-md)",
        display: "flex",
        flexWrap: "wrap",
        gap: 24,
        marginBottom: 30,
      }}
    >
      <div style={{ display: "flex", gap: 10 }}>
        <EtudiantLink to="/etudiant" icon="🏠" label="Accueil" />
        <EtudiantLink to="/etudiant/offres" icon="🏢" label="Offres" />
        <EtudiantLink to="/etudiant/demandes" icon="📝" label="Mes demandes" />
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        <EtudiantLink to="/etudiant/livrables" icon="📁" label="Livrables" />
        <EtudiantLink to="/etudiant/soutenance" icon="🎤" label="Soutenance" />
      </div>
    </div>
  );
}