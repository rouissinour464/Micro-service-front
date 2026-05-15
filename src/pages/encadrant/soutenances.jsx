import { useEffect, useState } from "react";
import { Spinner, Alert } from "../../components/UI";
import { getMesSoutenances } from "../../services/stageService";

export default function SoutenancesEncadrant() {
  const [list, setList]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  useEffect(() => {
    getMesSoutenances()
      .then(setList)
      .catch(() => setError("Impossible de charger les soutenances."))
      .finally(() => setLoading(false));
  }, []);

  const now = new Date();
  const aVenir  = list.filter((s) => new Date(s.dateHeure) > now);
  const passees = list.filter((s) => new Date(s.dateHeure) <= now);

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
        <div className="page-eyebrow">Encadrant</div>
        <h1 className="page-title">Mes soutenances</h1>
        <p className="page-sub">Retrouvez toutes les soutenances auxquelles vous participez en tant que membre du jury.</p>
      </div>

      {/* ── Stats ── */}
      <div className="stats-grid anim-fade-up delay-1">
        <div className="stat-card">
          <div className="stat-label">Total</div>
          <div className="stat-value">{list.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">À venir</div>
          <div className="stat-value stat-success">{aVenir.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Passées</div>
          <div className="stat-value stat-warning">{passees.length}</div>
        </div>
      </div>

      {error && <Alert type="error" message={error} />}

      {/* ── Liste ── */}
      {list.length === 0 && !error ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon">🎤</div>
            <div className="empty-title">Aucune soutenance planifiée</div>
            <div className="empty-sub">Vous n'avez pas encore de soutenance assignée.</div>
          </div>
        </div>
      ) : (
        list.map((s, i) => (
          <div
            key={s.id}
            className="card anim-fade-up"
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            {/* ── Étudiant + badge ── */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, marginBottom: 16 }}>
              <div style={{ flex: 1 }}>
                <div className="item-title" style={{ fontSize: 16, marginBottom: 6 }}>
                  🎓 {s.etudiantNom || `Étudiant #${s.etudiantId}`}
                </div>
                <div className="item-sub" style={{ display: "flex", flexWrap: "wrap", gap: "6px 16px" }}>
                  {s.encadrantNom  && <span>👨‍🏫 Encadrant : <strong>{s.encadrantNom}</strong></span>}
                  {s.rapporteurNom && <span>📋 Rapporteur : <strong>{s.rapporteurNom}</strong></span>}
                  {s.presidentNom  && <span>👑 Président : <strong>{s.presidentNom}</strong></span>}
                </div>
              </div>
              {new Date(s.dateHeure) > now ? (
                <span className="badge badge-success">À venir</span>
              ) : (
                <span className="badge badge-muted">Passée</span>
              )}
            </div>

            {/* ── Date + salle ── */}
            <div style={{
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
              fontSize: 14,
              color: "var(--text-soft)",
              padding: "12px 16px",
              background: "var(--dark-2)",
              borderRadius: "var(--r-sm)",
              border: "1px solid var(--border)",
            }}>
              <span>📅 {new Date(s.dateHeure).toLocaleString("fr-FR", { dateStyle: "long", timeStyle: "short" })}</span>
              <span style={{ color: "var(--border)" }}>|</span>
              <span>🏛 Salle : <strong style={{ color: "var(--text)" }}>{s.salle}</strong></span>
            </div>
          </div>
        ))
      )}
    </div>
  );
}