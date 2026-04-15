import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth, extractError } from "../context/AuthContext";
import { BrandPanel, Alert, Spinner } from "../components/UI";

export default function RegisterAdminPage() {
  const { registerAdmin } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    adminCode: "",
  });

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
      // registerAdmin() : appel API → setUser() → retourne profil
      await registerAdmin(form);

      // ✅ navigate après que setUser() soit terminé
      navigate("/admin", { replace: true });

    } catch (err) {
      setError(extractError(err));
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <BrandPanel
        eyebrow="Plateforme de Gestion de Stage / PFE Administrateur"
        headline="Créer votre"
        highlightWord="compte admin"
        desc="Seuls les administrateurs autorisés par la faculté peuvent créer un compte administrateur."
        features={[
          "Accès strictement réservé aux administrateurs",
          "Code unique fourni par l'établissement",
        ]}
      />

      <div className="auth-panel-right">
        <div className="auth-form-wrap">
          <div className="auth-form-header">
            <p className="auth-form-eyebrow anim-fade-up">Inscription</p>
            <h2 className="auth-form-title anim-fade-up delay-1">Compte Admin</h2>
            <p className="auth-form-sub anim-fade-up delay-2">
              Remplissez tous les champs, y compris votre code administrateur.
            </p>
          </div>

          <Alert type="error" message={error} />

          <form onSubmit={submit}>
            <div className="form-group anim-fade-up delay-1">
              <label className="form-label">Nom complet</label>
              <input
                className="form-input"
                type="text"
                value={form.fullName}
                onChange={set("fullName")}
                placeholder="Prénom Nom"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group anim-fade-up delay-2">
              <label className="form-label">Email universitaire</label>
              <input
                className="form-input"
                type="email"
                value={form.email}
                onChange={set("email")}
                placeholder="admin@universite.dz"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group anim-fade-up delay-3">
              <label className="form-label">Mot de passe</label>
              <div style={{ position: "relative" }}>
                <input
                  className="form-input"
                  type={showPass ? "text" : "password"}
                  value={form.password}
                  onChange={set("password")}
                  placeholder="Minimum 8 caractères"
                  minLength={8}
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
                    fontSize: 18,
                  }}
                >
                  {showPass ? "🙈" : "👁"}
                </button>
              </div>
            </div>

            <div className="form-group anim-fade-up delay-4">
              <label className="form-label">Code Admin — fourni par la faculté</label>
              <input
                className="form-input"
                type="text"
                value={form.adminCode}
                onChange={set("adminCode")}
                placeholder="FAC-ADMIN-XXX"
                required
                disabled={loading}
                style={{
                  fontFamily: "monospace",
                  letterSpacing: ".08em",
                  textTransform: "uppercase",
                  border: "1.5px solid var(--accent)",
                  background: "rgba(91,110,245,.06)",
                }}
              />
              <p style={{ marginTop: 6, fontSize: 12, color: "var(--text-muted)" }}>
                ⬡ Ce code est à usage unique. Il vous a été transmis personnellement.
              </p>
            </div>

            <button
              type="submit"
              className="btn btn-primary anim-fade-up delay-5"
              disabled={loading}
            >
              {loading ? <Spinner /> : "Créer mon compte admin"}
            </button>
          </form>

          <div className="auth-switch anim-fade-up" style={{ animationDelay: ".48s" }}>
            Déjà un compte ?{" "}
            <Link to="/login" className="auth-link">
              Se connecter →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
