import React, { useState, useEffect } from "react";
import { useAuth, extractError } from "../context/AuthContext";
import {
  Topbar,
  Alert,
  Spinner,
  RoleBadge,
  SkeletonBlock,
} from "../components/UI";

const ROLE_LABELS = {
  ADMIN: "Administrateur",
  ENCADRANT: "Enseignant",
  ETUDIANT: "Étudiant",
};

export default function ProfilePage() {
  const { getProfile, updateProfile } = useAuth();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    newPassword: "",
  });

  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState({ type: "", msg: "" });
  const [showPass, setShowPass] = useState(false);
  const [edited, setEdited] = useState(false);

  useEffect(() => {
    getProfile()
      .then((p) => {
        setProfile(p);
        setForm({
          fullName: p.fullName,
          email: p.email,
          newPassword: "",
        });
      })
      .finally(() => setLoading(false));
  }, [getProfile]);

  const set = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setEdited(true);
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setAlert({ type: "", msg: "" });

    try {
      const payload = {
        fullName: form.fullName,
        email: form.email,
        password: form.newPassword || null,
      };

      const updated = await updateProfile(payload);
      setProfile(updated);

      setForm({
        fullName: updated.fullName,
        email: updated.email,
        newPassword: "",
      });

      setEdited(false);
      setAlert({ type: "success", msg: "✓ Profil mis à jour avec succès." });
    } catch (err) {
      setAlert({ type: "error", msg: extractError(err) });
    } finally {
      setSaving(false);
    }
  };

  const initials =
    profile?.fullName
      ?.split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?";

  return (
    <div className="dash-shell">
      <Topbar />

      <div className="page-body">
        <div className="page-header">
          <p className="page-eyebrow">MON PROFIL</p>
          <h1 className="page-title">
            Bienvenue, {profile?.fullName} 👋
          </h1>
          <p className="page-sub">
            Consultez et modifiez vos informations personnelles.
          </p>
        </div>

        {/* IDENTITÉ */}
        <div className="card" style={{ padding: 24 }}>
          {loading ? (
            <div style={{ display: "flex", gap: 20 }}>
              <SkeletonBlock h={64} w={64} mb={0} />
              <div style={{ flex: 1 }}>
                <SkeletonBlock h={20} w="50%" />
                <SkeletonBlock h={14} w="35%" mb={0} />
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
              <div
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: "50%",
                  background:
                    "linear-gradient(135deg, var(--accent), #22d3a0)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 26,
                  fontWeight: 700,
                  color: "#fff",
                }}
              >
                {initials}
              </div>

              <div>
                <div style={{ fontSize: 26, fontWeight: 700 }}>
                  {profile?.fullName}
                </div>

                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <RoleBadge role={profile?.role} />
                  <span style={{ fontSize: 13, color: "var(--text-muted)" }}>
                    {ROLE_LABELS[profile?.role]}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* FORMULAIRE */}
        <div className="card" style={{ marginTop: 24, padding: 24 }}>
          <div className="card-header">
            <div className="card-icon">✏</div>
            <div className="card-title">Modifier mon profil</div>
          </div>

          {alert.msg && <Alert type={alert.type} message={alert.msg} />}

          <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div className="form-group">
              <label className="form-label">Nom complet</label>
              <input
                className="form-input"
                value={form.fullName}
                onChange={set("fullName")}
                required
                disabled={saving || loading}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Adresse email</label>
              <input
                className="form-input"
                type="email"
                value={form.email}
                onChange={set("email")}
                required
                disabled={saving || loading}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Nouveau mot de passe</label>
              <div style={{ position: "relative" }}>
                <input
                  className="form-input"
                  type={showPass ? "text" : "password"}
                  value={form.newPassword}
                  onChange={set("newPassword")}
                  placeholder="Laisser vide pour ne pas changer"
                  minLength={form.newPassword ? 8 : 0}
                  style={{ paddingRight: 42 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass((s) => !s)}
                  style={{
                    position: "absolute",
                    right: 12,
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

            <button
              type="submit"
              disabled={saving || !edited}
              className="btn btn-primary"
              style={{ width: 200 }}
            >
              {saving ? <Spinner /> : "Enregistrer"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}