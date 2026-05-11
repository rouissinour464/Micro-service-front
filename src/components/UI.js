import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// ── Topbar ─────────────────────────────────────────────
const ROLE_LABELS = {
  ADMIN: "Administrateur",
  ENCADRANT: "Enseignant",
  ETUDIANT: "Étudiant",
};

export function Topbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const initials =
    user?.fullName
      ?.split(" ")
      .map(w => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?";

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <header className="topbar">
      <Link to="/" className="topbar-logo">
        <div className="topbar-logo-dot" />
        Iset Tozeur
      </Link>

      <div className="topbar-right">
        <div className="topbar-user-info">
          <div className="topbar-user-name">{user?.fullName}</div>
          <div className="topbar-user-role">
            {ROLE_LABELS[user?.role]}
          </div>
        </div>

        <Link to="/profile" className="topbar-avatar" title="Mon profil">
          {initials}
        </Link>

        <button className="topbar-logout" onClick={handleLogout}>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Déconnexion
        </button>
      </div>
    </header>
  );
}

// ── Alert ─────────────────────────────────────────────
export function Alert({ type = "error", message }) {
  if (!message) return null;

  const icons = {
    error: "⚠",
    success: "✓",
  };

  return (
    <div className={`alert alert-${type}`}>
      <span className="alert-icon">{icons[type]}</span>
      <span>{message}</span>
    </div>
  );
}

// ── Spinner ───────────────────────────────────────────
export function Spinner() {
  return <span className="spinner" />;
}

// ── RoleBadge ─────────────────────────────────────────
const roleClass = {
  ADMIN: "role-badge-admin",
  ENCADRANT: "role-badge-encadrant",
  ETUDIANT: "role-badge-etudiant",
};

const roleIcon = {
  ADMIN: "⬡",
  ENCADRANT: "◈",
  ETUDIANT: "◉",
};

export function RoleBadge({ role }) {
  return (
    <span className={`role-badge ${roleClass[role] || ""}`}>
      {roleIcon[role]} {role}
    </span>
  );
}

// ── BrandPanel (auth screens) ─────────────────────────
export function BrandPanel({
  eyebrow,
  headline,
  highlightWord,
  desc,
  features = [],
  tags = [],
}) {
  return (
    <div className="auth-panel-left">
      <div className="brand-top">
        <div className="brand-logo">
          <div className="brand-logo-icon">⬡</div>
          Iset Tozeur
        </div>
      </div>

      <div className="brand-center">
        <p className="brand-eyebrow">{eyebrow}</p>
        <h1 className="brand-headline">
          {headline} {highlightWord && <span>{highlightWord}</span>}
        </h1>
        <p className="brand-desc">{desc}</p>

        {features.length > 0 && (
          <div className="brand-features">
            {features.map((f, i) => (
              <div key={i} className="brand-feature">
                <span className="brand-feature-dot" />
                {f}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="brand-bottom">
        {tags.map((t, i) => (
          <span key={i} className="brand-tag">
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Skeleton loader ──────────────────────────────────
export function SkeletonBlock({ h = 20, w = "100%", mb = 12 }) {
  return (
    <div
      className="skeleton"
      style={{ height: h, width: w, marginBottom: mb }}
    />
  );
}