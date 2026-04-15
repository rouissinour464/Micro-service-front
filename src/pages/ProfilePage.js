import React, { useState, useEffect } from "react";
import { useAuth, extractError } from "../context/AuthContext";
import { Topbar, Alert, Spinner, RoleBadge, SkeletonBlock } from "../components/UI";

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

  // ✅ Charger le profil
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

  // ✅ ✅ FIX : setter correct
  const set = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setEdited(true);
  };

  // ✅ Submit
  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setAlert({ type: "", msg: "" });

    try {
      const payload = {
        fullName: form.fullName,
        email: form.email,
        password: form.newPassword || null, // ✅ envoi correct vers Spring Boot
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
    profile?.fullName?.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase() || "?";

  return (
    <div className="dash-shell">
      <Topbar />

      <div className="page-body">

        {/* ✅ HEADER */}
        <div className="page-header">
          <p className="page-eyebrow anim-fade-up">MON PROFIL</p>
          <h1 className="page-title anim-fade-up delay-1">
            Bienvenue, {profile?.fullName} 👋
          </h1>
          <p className="page-sub anim-fade-up delay-2">
            Consultez et modifiez vos informations personnelles.
          </p>
        </div>

        {/* ✅ IDENTITÉ */}
        <div className="card anim-fade-up delay-2" style={{ padding: 24 }}>
          {loading ? (
            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
              <SkeletonBlock h={64} w={64} mb={0} />
              <div style={{ flex: 1 }}>
                <SkeletonBlock h={20} w="50%" mb={10} />
                <SkeletonBlock h={14} w="35%" mb={0} />
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
              <div
                style={{
                  width: 72,
                  height: 72,
                  background: "linear-gradient(135deg, var(--accent), #22d3a0)",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 26,
                }}
              >
                {initials}
              </div>

              <div>
                <div
                  style={{
                    fontFamily: "var(--font-head)",
                    fontSize: 26,
                    fontWeight: 700,
                    color: "var(--text)",
                    marginBottom: 6,
                  }}
                >
                  {profile?.fullName}
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <RoleBadge role={profile?.role} />
                  <span style={{ fontSize: 13, color: "var(--text-muted)" }}>
                    {ROLE_LABELS[profile?.role]}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ✅ EMAIL CARD */}
        {!loading && (
          <div className="card anim-fade-up delay-3" style={{ padding: 20, marginTop: 16 }}>
            <div className="info-item-label">Adresse email</div>
            <div className="info-item-value">{profile?.email}</div>
          </div>
        )}

        {/* ✅ FORM */}
        <div className="card anim-fade-up delay-4" style={{ marginTop: 24, padding: 24 }}>
          <div className="card-header" style={{ marginBottom: 20 }}>
            <div className="card-icon">✏</div>
            <div className="card-title">Modifier mon profil</div>
          </div>

          {alert.msg && <Alert type={alert.type} message={alert.msg} />}

          <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* NOM */}
            <div className="form-group">
              <label className="form-label">Nom complet</label>
              <input
                className="form-input"
                type="text"
                value={form.fullName}
                onChange={set("fullName")}
                required
                disabled={saving || loading}
              />
            </div>

            {/* EMAIL */}
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

            {/* NEW PASSWORD */}
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
                  disabled={saving || loading}
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
                    color: "var(--text-muted)",
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