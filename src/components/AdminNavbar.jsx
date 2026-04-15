import React from "react";
import { NavLink } from "react-router-dom";

export default function AdminNavbar() {
  const baseStyle = {
    padding: "10px 16px",
    borderRadius: "var(--r-md)",
    fontWeight: 600,
    fontSize: 14,
    cursor: "pointer",
    transition: "0.2s",
  };

  return (
    <div
      style={{
        background: "var(--dark-2)",
        padding: "14px 22px",
        borderRadius: "var(--r-md)",
        display: "flex",
        gap: 20,
        marginBottom: 30,
      }}
    >
      <NavLink
        to="/admin/create"
        style={({ isActive }) => ({
          ...baseStyle,
          color: isActive ? "white" : "var(--text-muted)",
          background: isActive ? "var(--accent)" : "transparent",
        })}
      >
        ➕ Créer un compte
      </NavLink>

      <NavLink
        to="/admin/list"
        style={({ isActive }) => ({
          ...baseStyle,
          color: isActive ? "white" : "var(--text-muted)",
          background: isActive ? "var(--accent)" : "transparent",
        })}
      >
        📄 Voir la liste
      </NavLink>
    </div>
  );
}