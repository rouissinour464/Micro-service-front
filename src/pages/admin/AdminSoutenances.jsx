import React, { useEffect, useState } from "react";
import {
  planifierSoutenance,
  getAllSoutenances,
  deleteSoutenance,
  getUsersByRole,
} from "../../services/stageService";
import { Alert, Spinner } from "../../components/UI";
import { extractError } from "../../context/AuthContext";

const EMPTY_FORM = {
  etudiantId:   "",
  encadrantId:  "",
  rapporteurId: "",
  presidentId:  "",
  dateHeure:    "",
  salle:        "",
};

export default function AdminSoutenances() {
  const [list, setList]               = useState([]);
  const [etudiants, setEtudiants]     = useState([]);
  const [enseignants, setEnseignants] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [alert, setAlert]             = useState({ type: "", msg: "" });
  const [form, setForm]               = useState(EMPTY_FORM);
  const [deleteId, setDeleteId]       = useState(null);

  const flash = (type, msg) => {
    setAlert({ type, msg });
    setTimeout(() => setAlert({ type: "", msg: "" }), 4000);
  };

  const load = async () => {
    try {
      setLoading(true);
      const [s, etu, ens] = await Promise.all([
        getAllSoutenances(),
        getUsersByRole("ETUDIANT"),
        getUsersByRole("ENSEIGNANT"),
      ]);
      setList(s);
      setEtudiants(etu);
      setEnseignants(ens);
    } catch (e) {
      flash("error", extractError(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    const { etudiantId, encadrantId, rapporteurId, presidentId, dateHeure, salle } = form;

    if (!etudiantId || !encadrantId || !rapporteurId || !presidentId || !dateHeure || !salle) {
      flash("error", "Tous les champs sont obligatoires.");
      return;
    }
    if (
      encadrantId === rapporteurId ||
      encadrantId === presidentId  ||
      rapporteurId === presidentId
    ) {
      flash("error", "Les membres du jury doivent être différents.");
      return;
    }
    try {
      await planifierSoutenance({
        etudiantId:   Number(etudiantId),
        encadrantId:  Number(encadrantId),
        rapporteurId: Number(rapporteurId),
        presidentId:  Number(presidentId),
        dateHeure,
        salle,
      });
      flash("success", "Soutenance planifiée avec succès.");
      setForm(EMPTY_FORM);
      load();
    } catch (e) {
      flash("error", extractError(e));
    }
  };

  const handleDelete = async () => {
    try {
      await deleteSoutenance(deleteId);
      flash("success", "Soutenance supprimée.");
      setDeleteId(null);
      load();
    } catch (e) {
      flash("error", extractError(e));
    }
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
      <div className="page-header">
        <div className="page-eyebrow">Administration</div>
        <h1 className="page-title">Soutenances</h1>
        <p className="page-sub">Planifiez et gérez les soutenances de fin d'études.</p>
      </div>

      {/* ── Stats ── */}
      <div className="stats-grid anim-fade-up delay-1">
        <div className="stat-card">
          <div className="stat-label">Total planifiées</div>
          <div className="stat-value">{list.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Ce mois</div>
          <div className="stat-value stat-accent">
            {list.filter((s) => {
              const d = new Date(s.dateHeure);
              const now = new Date();
              return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
            }).length}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">À venir</div>
          <div className="stat-value stat-success">
            {list.filter((s) => new Date(s.dateHeure) > new Date()).length}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Passées</div>
          <div className="stat-value stat-warning">
            {list.filter((s) => new Date(s.dateHeure) <= new Date()).length}
          </div>
        </div>
      </div>

      {alert.msg && <Alert type={alert.type} message={alert.msg} />}

      {/* ── Formulaire ── */}
      <div className="card anim-fade-up delay-2">
        <div className="card-header">
          <div className="card-header-left">
            <div className="card-icon card-icon-accent">🎤</div>
            <div>
              <div className="card-title">Planifier une soutenance</div>
              <div className="card-subtitle">Remplissez tous les champs pour créer une nouvelle soutenance</div>
            </div>
          </div>
        </div>

        <form onSubmit={submit}>
          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label">Étudiant</label>
              <select
                className="form-input form-select"
                value={form.etudiantId}
                onChange={(e) => setForm({ ...form, etudiantId: e.target.value })}
              >
                <option value="">Sélectionner un étudiant</option>
                {etudiants.map((u) => (
                  <option key={u.id} value={u.id}>{u.fullName}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Encadrant</label>
              <select
                className="form-input form-select"
                value={form.encadrantId}
                onChange={(e) => setForm({ ...form, encadrantId: e.target.value })}
              >
                <option value="">Sélectionner un encadrant</option>
                {enseignants.map((u) => (
                  <option key={u.id} value={u.id}>{u.fullName}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Rapporteur</label>
              <select
                className="form-input form-select"
                value={form.rapporteurId}
                onChange={(e) => setForm({ ...form, rapporteurId: e.target.value })}
              >
                <option value="">Sélectionner un rapporteur</option>
                {enseignants.map((u) => (
                  <option key={u.id} value={u.id}>{u.fullName}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Président du jury</label>
              <select
                className="form-input form-select"
                value={form.presidentId}
                onChange={(e) => setForm({ ...form, presidentId: e.target.value })}
              >
                <option value="">Sélectionner un président</option>
                {enseignants.map((u) => (
                  <option key={u.id} value={u.id}>{u.fullName}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Date &amp; heure</label>
              <input
                type="datetime-local"
                className="form-input"
                value={form.dateHeure}
                onChange={(e) => setForm({ ...form, dateHeure: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Salle</label>
              <input
                className="form-input"
                placeholder="Ex : Salle A102"
                value={form.salle}
                onChange={(e) => setForm({ ...form, salle: e.target.value })}
              />
            </div>
          </div>

          <button className="btn btn-primary btn-block" type="submit">
            Planifier la soutenance
          </button>
        </form>
      </div>

      {/* ── Liste ── */}
      {list.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon">🎓</div>
            <div className="empty-title">Aucune soutenance planifiée</div>
            <div className="empty-sub">Utilisez le formulaire ci-dessus pour planifier la première soutenance.</div>
          </div>
        </div>
      ) : (
        list.map((s, i) => (
          <div
            key={s.id}
            className="card anim-fade-up"
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            {/* ── Jury + actions ── */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, marginBottom: 16 }}>
              <div style={{ flex: 1 }}>
                <div className="item-title" style={{ fontSize: 16, marginBottom: 6 }}>
                  🎓 {s.etudiantNom || `Étudiant #${s.etudiantId}`}
                </div>
                <div className="item-sub" style={{ display: "flex", flexWrap: "wrap", gap: "6px 16px" }}>
                  <span>👨‍🏫 Encadrant : <strong>{s.encadrantNom  || `#${s.encadrantId}`}</strong></span>
                  <span>📋 Rapporteur : <strong>{s.rapporteurNom || `#${s.rapporteurId}`}</strong></span>
                  <span>👑 Président : <strong>{s.presidentNom  || `#${s.presidentId}`}</strong></span>
                </div>
              </div>

              {/* Statut */}
              {new Date(s.dateHeure) > new Date() ? (
                <span className="badge badge-success">À venir</span>
              ) : (
                <span className="badge badge-muted">Passée</span>
              )}
            </div>

            {/* ── Date + salle ── */}
            <div
              style={{
                display: "flex",
                gap: 12,
                flexWrap: "wrap",
                fontSize: 14,
                color: "var(--text-soft)",
                padding: "12px 16px",
                background: "var(--dark-2)",
                borderRadius: "var(--r-sm)",
                border: "1px solid var(--border)",
                marginBottom: 14,
              }}
            >
              <span>📅 {new Date(s.dateHeure).toLocaleString("fr-FR", { dateStyle: "long", timeStyle: "short" })}</span>
              <span style={{ color: "var(--border)" }}>|</span>
              <span>🏛 Salle : <strong style={{ color: "var(--text)" }}>{s.salle}</strong></span>
            </div>

            {/* ── Action ── */}
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                className="btn btn-danger btn-sm"
                onClick={() => setDeleteId(s.id)}
              >
                Supprimer
              </button>
            </div>
          </div>
        ))
      )}

      {/* ── Modal Confirmation Suppression ── */}
      {deleteId && (
        <div className="modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="modal card-danger" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Supprimer la soutenance</div>
              <button className="modal-close" onClick={() => setDeleteId(null)}>×</button>
            </div>
            <p style={{ color: "var(--text-soft)", fontSize: 15, lineHeight: 1.65 }}>
              Êtes-vous sûr de vouloir <strong style={{ color: "var(--danger)" }}>supprimer</strong> cette soutenance ? Cette action est irréversible.
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