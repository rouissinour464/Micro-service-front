import { useEffect, useState } from "react";
import { Spinner, Alert } from "../../components/UI";
import { getOffresActives } from "../../services/stageService";
import { extractError } from "../../context/AuthContext";

export default function Offres() {
  const [offres, setOffres] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    getOffresActives()
      .then(setOffres)
      .catch((e) => setAlert(extractError(e)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  return (
    <div className="page-body">
      {/* HEADER */}
      <div className="page-header">
        <div className="page-eyebrow">Offres</div>
        <h1 className="page-title">Offres de stage disponibles</h1>
        <p className="page-sub">
          Consultez les offres validées par l’administration
        </p>
      </div>

      {alert && <Alert type="info" message={alert} />}

      {/* LISTE DES OFFRES */}
      <div className="card">
        <div className="card-header">
          <div className="card-icon">📄</div>
          <div>
            <div className="card-title">Liste des offres</div>
            <div className="card-subtitle">
              {offres.length} offre(s) disponible(s)
            </div>
          </div>
        </div>

        <ul className="list">
          {offres.length === 0 && (
            <li className="list-item" style={{ color: "var(--text-muted)" }}>
              Aucune offre disponible.
            </li>
          )}

          {offres.map((o) => (
            <li key={o.id} className="list-item">
              <div>
                <strong>{o.titre}</strong>
                <div style={{ fontSize: 13, color: "var(--text-soft)", marginTop: 4 }}>
                  🏢 {o.entreprise} · 📍 {o.lieu}
                </div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                  🗓 {o.dateDebut} → {o.dateFin}
                  {o.domaine && ` · 🏷 ${o.domaine}`}
                </div>
              </div>

              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setSelected(o)}
              >
                👁 Voir détails
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* DÉTAIL OFFRE */}
      {selected && (
        <div className="card anim-fade-up">
          <div className="card-header">
            <div className="card-icon">📌</div>
            <div>
              <div className="card-title">{selected.titre}</div>
              <div className="card-subtitle">{selected.entreprise}</div>
            </div>
          </div>

          <div className="info-grid">
            <div className="info-item">
              <div className="info-item-label">Lieu</div>
              <div className="info-item-value">{selected.lieu}</div>
            </div>

            <div className="info-item">
              <div className="info-item-label">Durée</div>
              <div className="info-item-value">
                {selected.dateDebut} → {selected.dateFin}
              </div>
            </div>

            <div className="info-item">
              <div className="info-item-label">Domaine</div>
              <div className="info-item-value">
                {selected.domaine || "—"}
              </div>
            </div>
          </div>

          <div className="info-item">
            <div className="info-item-label">Description</div>
            <div className="info-item-value">
              {selected.description}
            </div>
          </div>

          {selected.competencesRequises && (
            <div className="info-item" style={{ marginTop: 14 }}>
              <div className="info-item-label">Compétences requises</div>
              <div className="info-item-value">
                {selected.competencesRequises}
              </div>
            </div>
          )}

          <button
            className="btn btn-ghost"
            style={{ marginTop: 24 }}
            onClick={() => setSelected(null)}
          >
            Fermer
          </button>
        </div>
      )}
    </div>
  );
}
