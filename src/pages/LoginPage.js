import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth, extractError } from "../context/AuthContext";
import { BrandPanel, Alert, Spinner } from "../components/UI";

const ROLE_ROUTE = {
  ADMIN: "/admin",
  ENCADRANT: "/encadrant",
  ETUDIANT: "/etudiant",
};

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPass, setShowPass] = useState(false);

  const set = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const profile = await login({
        email: form.email,
        password: form.password,
      });

      const route = ROLE_ROUTE[profile.role] || "/";
      navigate(route, { replace: true });
    } catch (err) {
      setError(extractError(err));
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <BrandPanel
        eyebrow="Plateforme de Gestion des Stages / PFEs"
        headline="Accédez à votre Espace"
        desc="Connectez-vous pour accéder à votre espace."
      />

      <div className="auth-panel-right">
        <div className="auth-form-wrap">
          <div className="auth-form-header">
            <p className="auth-form-eyebrow">Bienvenue</p>
            <h2 className="auth-form-title">Connexion</h2>
            <p className="auth-form-sub">
              Entrez vos identifiants.
            </p>
          </div>

          <Alert type="error" message={error} />

          <form onSubmit={submit}>
            <div className="form-group">
              <label className="form-label">Adresse email</label>
              <input
                className="form-input"
                type="email"
                value={form.email}
                onChange={set("email")}
                placeholder="vous@universite.tn"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Mot de passe</label>

              <div style={{ position: "relative" }}>
                <input
                  className="form-input"
                  type={showPass ? "text" : "password"}
                  value={form.password}
                  onChange={set("password")}
                  placeholder="••••••••"
                  required
                  disabled={loading}
                  style={{ paddingRight: 48 }}
                />

                <button
                  type="button"
                  onClick={() => setShowPass((s) => !s)}
                  style={{
                    position: "absolute",
                    right: 14,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--text-muted)",
                  }}
                  aria-label="Afficher / masquer le mot de passe"
                >
                  {showPass ? "🙈" : "👁"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? <Spinner /> : "Se connecter"}
            </button>
          </form>

          <div className="divider">ou</div>

          <div className="auth-switch">
            Administrateur ?{" "}
            <Link to="/register/admin" className="auth-link">
              Créer un compte admin →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}