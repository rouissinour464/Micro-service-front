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

function EncadrantLink({ to, label, icon }) {
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

export default function EncadrantNavbar() {
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
        <EncadrantLink
          to="/encadrant"
          icon="📊"
          label="Dashboard"
        />
        <EncadrantLink
          to="/encadrant/etudiants"
          icon="🎓"
          label="Mes étudiants"
        />
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        <EncadrantLink
          to="/encadrant/livrables"
          icon="📁"
          label="Livrables"
        />
        <EncadrantLink
          to="/encadrant/soutenances"
          icon="🎤"
          label="Soutenances"
        />
      </div>
    </div>
  );
}