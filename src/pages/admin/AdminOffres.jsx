import React, { useEffect, useState } from "react";
import { Spinner, Alert } from "../../components/UI";
import {
  getAllOffres,
  createOffre,
  updateOffre,
  toggleOffre,
  deleteOffre,
} from "../../services/stageService";
import { extractError } from "../../context/AuthContext";

const EMPTY_FORM = {
  titre:              "",
  description:        "",
  entreprise:         "",
  lieu:               "",
  dateDebut:          "",
  dateFin:            "",
  domaine:            "",
  competencesRequises:"",
};

export default function AdminOffres() {
  const [offres, setOffres]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm]       = useState(EMPTY_FORM);
  const [alert, setAlert]     = useState({ type: "", msg: "" });
  const [deleteId, setDeleteId]   = useState(null);
  const [showForm, setShowForm]   = useState(false);
  const [filter, setFilter]       = useState("ALL");

  const flash = (type, msg) => {
    setAlert({ type, msg });
    setTimeout(() => setAlert({ type: "", msg: "" }), 4000);
  };

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(false);
  };

  const load = async () => {
    try {
      setLoading(true);
      setOffres(await getAllOffres());
    } catch (e) {
      flash("error", extractError(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const edit = (o) => {
    setEditingId(o.id);
    setForm({
      titre:               o.titre,
      description:         o.description,
      entreprise:          o.entreprise,
      lieu:                o.lieu,
      dateDebut:           o.dateDebut,
      dateFin:             o.dateFin,
      domaine:             o.domaine || "",
      competencesRequises: o.competencesRequises || "",
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const submit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateOffre(editingId, form);
        flash("success", "Offre modifiée avec succès.");
      } else {
        await createOffre(form);
        flash("success", "Offre créée avec succès.");
      }
      resetForm();
      load();
    } catch (e) {
      flash("error", extractError(e));
    }
  };

  const toggle = async (id) => {
    try {
      await toggleOffre(id);
      load();
    } catch (e) {
      flash("error", extractError(e));
    }
  };

  const handleDelete = async () => {
    try {
      await deleteOffre(deleteId);
      flash("success", "Offre supprimée.");
      setDeleteId(null);
      load();
    } catch (e) {
      flash("error", extractError(e));
    }
  };

  const filtered =
    filter === "ALL"     ? offres :
    filter === "ACTIVE"  ? offres.filter((o) => o.active) :
    offres.filter((o) => !o.active);

  const counts = {
    ALL:      offres.length,
    ACTIVE:   offres.filter((o) => o.active).length,
    INACTIVE: offres.filter((o) => !o.active).length,
  };

  if (loading) {
    return (
      <div className="spinner-wrap">
        <div className="spinner spinner-lg" />
      </div>
    );
  }

  return (
    <div className="page-body anim-fade-up">

      {/* ── Header ── */}
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
        <div>
          <div className="page-eyebrow">Administration</div>
          <h1 className="page-title">Offres de stage</h1>
          <p className="page-sub">Créez et gérez les offres disponibles pour les étudiants.</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => { resetForm(); setShowForm(true); }}
          style={{ alignSelf: "flex-end" }}
        >
          + Nouvelle offre
        </button>
      </div>

      {/* ── Stats ── */}
      <div className="stats-grid anim-fade-up delay-1">
        <div className="stat-card">
          <div className="stat-label">Total</div>
          <div className="stat-value">{counts.ALL}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Actives</div>
          <div className="stat-value stat-success">{counts.ACTIVE}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Inactives</div>
          <div className="stat-value stat-warning">{counts.INACTIVE}</div>
        </div>
      </div>

      {alert.msg && <Alert type={alert.type} message={alert.msg} />}

      {/* ── Formulaire (conditionnel) ── */}
      {showForm && (
        <div className="card card-accent anim-scale-in" style={{ marginBottom: 28 }}>
          <div className="card-header">
            <div className="card-header-left">
              <div className="card-icon card-icon-accent">🏢</div>
              <div>
                <div className="card-title">{editingId ? "Modifier l'offre" : "Créer une offre"}</div>
                <div className="card-subtitle">Renseignez les informations de l'offre de stage</div>
              </div>
            </div>
            <button className="modal-close" onClick={resetForm}>×</button>
          </div>

          <form onSubmit={submit}>
            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">Titre</label>
                <input
                  className="form-input"
                  placeholder="Ex : Développeur Full-Stack"
                  value={form.titre}
                  onChange={(e) => setForm({ ...form, titre: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Entreprise</label>
                <input
                  className="form-input"
                  placeholder="Ex : Acme Corp"
                  value={form.entreprise}
                  onChange={(e) => setForm({ ...form, entreprise: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Lieu</label>
                <input
                  className="form-input"
                  placeholder="Ex : Tunis, Ariana..."
                  value={form.lieu}
                  onChange={(e) => setForm({ ...form, lieu: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Domaine</label>
                <input
                  className="form-input"
                  placeholder="Ex : Informatique, Finance..."
                  value={form.domaine}
                  onChange={(e) => setForm({ ...form, domaine: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Date de début</label>
                <input
                  type="date"
                  className="form-input"
                  value={form.dateDebut}
                  onChange={(e) => setForm({ ...form, dateDebut: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Date de fin</label>
                <input
                  type="date"
                  className="form-input"
                  value={form.dateFin}
                  onChange={(e) => setForm({ ...form, dateFin: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="form-input"
                placeholder="Décrivez le poste, les missions, l'environnement de travail..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Compétences requises</label>
              <input
                className="form-input"
                placeholder="Ex : React, Java, Git..."
                value={form.competencesRequises}
                onChange={(e) => setForm({ ...form, competencesRequises: e.target.value })}
              />
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
              <button type="submit" className="btn btn-primary">
                {editingId ? "Enregistrer les modifications" : "Créer l'offre"}
              </button>
              <button type="button" className="btn btn-ghost" onClick={resetForm}>
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Filtres ── */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
        {[
          { key: "ALL",      label: "Toutes",    icon: "📋" },
          { key: "ACTIVE",   label: "Actives",   icon: "✅" },
          { key: "INACTIVE", label: "Inactives", icon: "⏸️" },
        ].map((f) => (
          <button
            key={f.key}
            className={`btn btn-sm ${filter === f.key ? "btn-primary" : "btn-ghost"}`}
            onClick={() => setFilter(f.key)}
          >
            {f.icon} {f.label}
            <span
              style={{
                background: "rgba(255,255,255,0.15)",
                borderRadius: "100px",
                padding: "2px 7px",
                fontSize: 11,
                fontWeight: 700,
                marginLeft: 2,
              }}
            >
              {counts[f.key]}
            </span>
          </button>
        ))}
      </div>

      {/* ── Liste ── */}
      {filtered.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <div className="empty-title">Aucune offre</div>
            <div className="empty-sub">Il n'y a aucune offre correspondant à ce filtre.</div>
          </div>
        </div>
      ) : (
        filtered.map((o, i) => (
          <div
            key={o.id}
            className="card anim-fade-up"
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            {/* ── Row 1 : titre + badge ── */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, marginBottom: 14 }}>
              <div style={{ flex: 1 }}>
                <div className="item-title" style={{ fontSize: 16 }}>{o.titre}</div>
                <div className="item-sub" style={{ marginTop: 4, display: "flex", flexWrap: "wrap", gap: "6px 14px" }}>
                  <span>🏢 {o.entreprise}</span>
                  <span>📍 {o.lieu}</span>
                  {o.domaine && <span>🏷 {o.domaine}</span>}
                  {o.dateDebut && o.dateFin && (
                    <span>
                      📅 {new Date(o.dateDebut).toLocaleDateString("fr-FR")}
                      {" → "}
                      {new Date(o.dateFin).toLocaleDateString("fr-FR")}
                    </span>
                  )}
                </div>
              </div>
              <span className={`badge ${o.active ? "badge-success" : "badge-muted"}`}>
                {o.active ? "✓ Active" : "⏸ Inactive"}
              </span>
            </div>

            {/* ── Description ── */}
            {o.description && (
              <p
                style={{
                  fontSize: 14,
                  color: "var(--text-soft)",
                  lineHeight: 1.65,
                  marginBottom: 14,
                  padding: "12px 16px",
                  background: "var(--dark-2)",
                  borderRadius: "var(--r-sm)",
                  border: "1px solid var(--border)",
                }}
              >
                {o.description}
              </p>
            )}

            {/* ── Compétences ── */}
            {o.competencesRequises && (
              <div style={{ marginBottom: 14, display: "flex", flexWrap: "wrap", gap: 6 }}>
                {o.competencesRequises.split(",").map((c) => (
                  <span key={c} className="badge badge-accent">{c.trim()}</span>
                ))}
              </div>
            )}

            {/* ── Actions ── */}
            <div style={{ display: "flex", gap: 10, paddingTop: 4 }}>
              <button className="btn btn-ghost btn-sm" onClick={() => edit(o)}>
                ✏️ Modifier
              </button>
              <button
                className={`btn btn-sm ${o.active ? "btn-ghost" : "btn-success"}`}
                onClick={() => toggle(o.id)}
              >
                {o.active ? "⏸ Désactiver" : "▶ Activer"}
              </button>
              <button
                className="btn btn-danger btn-sm"
                onClick={() => setDeleteId(o.id)}
                style={{ marginLeft: "auto" }}
              >
                Supprimer
              </button>
            </div>
          </div>
        ))
      )}

      {/* ── Modal Suppression ── */}
      {deleteId && (
        <div className="modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="modal card-danger" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Supprimer l'offre</div>
              <button className="modal-close" onClick={() => setDeleteId(null)}>×</button>
            </div>
            <p style={{ color: "var(--text-soft)", fontSize: 15, lineHeight: 1.65 }}>
              Êtes-vous sûr de vouloir <strong style={{ color: "var(--danger)" }}>supprimer</strong> cette offre ? Elle ne sera plus visible par les étudiants.
            </p>
            <div className="modal-actions">
              <button className="btn btn-ghost btn-sm" onClick={() => setDeleteId(null)}>
                Annuler
              </button>
              <button className="btn btn-danger btn-sm" onClick={handleDelete}>
                Confirmer la suppression
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}