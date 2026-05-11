import { useEffect, useState } from "react";
import { Spinner } from "../../components/UI";
import { getMaSoutenance } from "../../services/stageService";

export default function Soutenance() {
  const [s, setS]         = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMaSoutenance()
      .then(setS)
      .catch(() => setS(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  if (!s) return (
    <div className="page-body">
      <div className="page-header">
        <div className="page-eyebrow">Soutenance</div>
        <h1 className="page-title">🎓 Ma soutenance</h1>
      </div>
      <p style={{ color:"var(--text-muted)", textAlign:"center", marginTop:20 }}>
        Aucune soutenance planifiée pour le moment.
      </p>
    </div>
  );

  return (
    <div className="page-body">
      <div className="page-header">
        <div className="page-eyebrow">Soutenance</div>
        <h1 className="page-title">🎓 Ma soutenance</h1>
      </div>

      <div className="card">
        {/* ✅ shows full names from SoutenanceResponse */}
        <div className="info-grid">
          <div className="info-item">
            <div className="info-item-label">Encadrant</div>
            <div className="info-item-value">
              {s.encadrantNom || `User #${s.encadrantId}`}
            </div>
          </div>
          <div className="info-item">
            <div className="info-item-label">Rapporteur</div>
            <div className="info-item-value">
              {s.rapporteurNom || `User #${s.rapporteurId}`}
            </div>
          </div>
          <div className="info-item">
            <div className="info-item-label">Président</div>
            <div className="info-item-value">
              {s.presidentNom || `User #${s.presidentId}`}
            </div>
          </div>
          <div className="info-item">
            <div className="info-item-label">Date & Heure</div>
            <div className="info-item-value">
              📅 {new Date(s.dateHeure).toLocaleString("fr-FR")}
            </div>
          </div>
          <div className="info-item">
            <div className="info-item-label">Salle</div>
            <div className="info-item-value">🏛 {s.salle}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
