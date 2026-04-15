import React, { useState } from "react";
import { useAuth, extractError } from "../context/AuthContext";
import { Alert, Spinner, RoleBadge } from "../components/UI";

const ROLES = [
  { value: "ENCADRANT", label: "◈ Enseignant (ENCADRANT)" },
  { value: "ETUDIANT", label: "◉ Étudiant (ETUDIANT)" },
];

const ROLE_MAP = {
  ENCADRANT: "TEACHER",
  ETUDIANT: "STUDENT",
};

const EMPTY_FORM = {
  fullName: "",
  email: "",
  password: "",
  role: "ENCADRANT",
};

export default function CreateUserPage() {
  const { createUser } = useAuth();

  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ type: "", msg: "" });
  const [showPass, setShowPass] = useState(false);

  const set = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value })); // ✅ clé dynamique

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAlert({ type: "", msg: "" });

    try {
      const payload = {
        fullName: form.fullName,
        email: form.email,
        password: form.password,
        role: ROLE_MAP[form.role],
      };

      const newUser = await createUser(payload);

      setAlert({
        type: "success",
        msg: `✅ Compte ${newUser.role} créé pour ${newUser.email}`,
      });

      setForm(EMPTY_FORM);
    } catch (err) {
      setAlert({ type: "error", msg: extractError(err) });
    }

    setLoading(false);
  };

  return (
    <div className="card anim-fade-up">
      <div className="card-header">
        <div className="card-icon">➕</div>
        <div>
          <div className="card-title">Créer un compte utilisateur</div>
          <div className="card-subtitle">
            Enseignant ou étudiant — sans code requis
          </div>
        </div>
      </div>

      {alert.msg && <Alert type={alert.type} message={alert.msg} />}

      <form onSubmit={submit}>
        {/* FULL NAME + EMAIL */}
        <div className="form-row-2">
          <div className="form-group">
            <label className="form-label">Nom complet</label>
            <input
              className="form-input"
              value={form.fullName}
              onChange={set("fullName")}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              className="form-input"
              type="email"
              value={form.email}
              onChange={set("email")}
              required
            />
          </div>
        </div>

        {/* PASSWORD + ROLE */}
        <div className="form-row-2">
          <div className="form-group">
            <label className="form-label">Mot de passe</label>

            <div style={{ position: "relative" }}>
              <input
                className="form-input"
                type={showPass ? "text" : "password"}
                value={form.password}
                onChange={set("password")}
                required
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
                }}
              >
                {showPass ? "🙈" : "👁"}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Rôle</label>
            <select
              className="form-input form-select"
              value={form.role}
              onChange={set("role")}
            >
              {ROLES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
          style={{ maxWidth: 240 }}
        >
          {loading ? <Spinner /> : "Créer le compte"}
        </button>
      </form>
    </div>
  );
}