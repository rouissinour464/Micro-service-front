import { useEffect, useState } from "react";
import { Spinner, Alert } from "../../components/UI";
import { getOffresActives } from "../../services/stageService";
import { extractError } from "../../context/AuthContext";

export default function Offres() {
  const [offres, setOffres]     = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [alert, setAlert]       = useState(null);
  const [search, setSearch]     = useState("");
  const [filterDomaine, setFilterDomaine] = useState("ALL");

  useEffect(() => {
    getOffresActives()
      .then(setOffres)
      .catch((e) => setAlert(extractError(e)))
      .finally(() => setLoading(false));
  }, []);

  const domaines = ["ALL", ...Array.from(new Set(offres.map((o) => o.domaine).filter(Boolean)))];

  const filtered = offres.filter((o) => {
    const matchSearch =
      !search ||
      o.titre.toLowerCase().includes(search.toLowerCase()) ||
      o.entreprise.toLowerCase().includes(search.toLowerCase()) ||
      o.lieu.toLowerCase().includes(search.toLowerCase());
    const matchDomaine = filterDomaine === "ALL" || o.domaine === filterDomaine;
    return matchSearch && matchDomaine;
  });

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
        <div className="page-eyebrow">Étudiant</div>
        <h1 className="page-title">Offres de stage</h1>
        <p className="page-sub">Consultez les offres validées par l'administration et trouvez votre stage.</p>
      </div>

      {/* ── Stats ── */}
      <div className="stats-grid anim-fade-up delay-1">
        <div className="stat-card">
          <div className="stat-label">Offres disponibles</div>
          <div className="stat-value">{offres.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Résultats filtrés</div>
          <div className="stat-value stat-accent">{filtered.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Domaines</div>
          <div className="stat-value stat-success">{domaines.length - 1}</div>
        </div>
      </div>

      {alert && <Alert type="error" message={alert} />}

      {/* ── Recherche + Filtres ── */}
      <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap", alignItems: "center" }}>
        <input
          className="form-input"
          style={{ flex: 1, minWidth: 220 }}
          placeholder="🔍 Rechercher par titre, entreprise, lieu..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {domaines.length > 1 && domaines.map((d) => (
          <button
            key={d}
            className={`btn btn-sm ${filterDomaine === d ? "btn-primary" : "btn-ghost"}`}
            onClick={() => setFilterDomaine(d)}
          >
            {d === "ALL" ? "📋 Tous" : `🏷 ${d}`}
          </button>
        ))}
      </div>

      {/* ── Liste ── */}
      {filtered.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <div className="empty-title">Aucune offre trouvée</div>
            <div className="empty-sub">Essayez de modifier vos critères de recherche.</div>
          </div>
        </div>
      ) : (
        filtered.map((o, i) => (
          <div
            key={o.id}
            className="card anim-fade-up"
            style={{ animationDelay: `${i * 0.05}s` }}
          >
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
              <span className="badge badge-success">✓ Active</span>
            </div>

            {/* Description (aperçu) */}
            {o.description && (
              <p style={{
                fontSize: 14,
                color: "var(--text-soft)",
                lineHeight: 1.65,
                marginBottom: 14,
                padding: "12px 16px",
                background: "var(--dark-2)",
                borderRadius: "var(--r-sm)",
                border: "1px solid var(--border)",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}>
                {o.description}
              </p>
            )}

            {/* Compétences */}
            {o.competencesRequises && (
              <div style={{ marginBottom: 14, display: "flex", flexWrap: "wrap", gap: 6 }}>
                {o.competencesRequises.split(",").map((c) => (
                  <span key={c} className="badge badge-accent">{c.trim()}</span>
                ))}
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setSelected(o)}
              >
                👁 Voir les détails
              </button>
            </div>
          </div>
        ))
      )}

      {/* ── Modal Détail ── */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div
            className="modal"
            style={{ maxWidth: 560 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <div className="modal-title">{selected.titre}</div>
                <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>
                  🏢 {selected.entreprise}
                </div>
              </div>
              <button className="modal-close" onClick={() => setSelected(null)}>×</button>
            </div>

            <div className="info-grid" style={{ marginBottom: 18 }}>
              <div className="info-item">
                <div className="info-item-label">Lieu</div>
                <div className="info-item-value">📍 {selected.lieu}</div>
              </div>
              <div className="info-item">
                <div className="info-item-label">Durée</div>
                <div className="info-item-value">
                  {new Date(selected.dateDebut).toLocaleDateString("fr-FR")} → {new Date(selected.dateFin).toLocaleDateString("fr-FR")}
                </div>
              </div>
              {selected.domaine && (
                <div className="info-item">
                  <div className="info-item-label">Domaine</div>
                  <div className="info-item-value">🏷 {selected.domaine}</div>
                </div>
              )}
            </div>

            <div style={{
              padding: "14px 16px",
              background: "var(--dark-2)",
              borderRadius: "var(--r-sm)",
              border: "1px solid var(--border)",
              marginBottom: 18,
            }}>
              <div className="info-item-label" style={{ marginBottom: 8 }}>Description</div>
              <p style={{ fontSize: 14, color: "var(--text-soft)", lineHeight: 1.7, margin: 0 }}>
                {selected.description}
              </p>
            </div>

            {selected.competencesRequises && (
              <div style={{ marginBottom: 18 }}>
                <div className="info-item-label" style={{ marginBottom: 8 }}>Compétences requises</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {selected.competencesRequises.split(",").map((c) => (
                    <span key={c} className="badge badge-accent">{c.trim()}</span>
                  ))}
                </div>
              </div>
            )}

            <div className="modal-actions">
              <button className="btn btn-ghost btn-sm" onClick={() => setSelected(null)}>
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}