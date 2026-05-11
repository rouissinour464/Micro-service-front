import { useEffect, useState } from "react";
import { Spinner, Alert } from "../../components/UI";
import { getMesSoutenances } from "../../services/stageService";

export default function SoutenancesEncadrant() {
  const [list, setList]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getMesSoutenances()
      .then(setList)
      .catch(() => setError("Impossible de charger les soutenances."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  return (
    <div className="page-body">
      <div className="page-header">
        <div className="page-eyebrow">Soutenances</div>
        <h1 className="page-title">🎤 Mes soutenances</h1>
      </div>

      {error && <Alert type="error" message={error} />}

      {list.length === 0 && !error ? (
        <p style={{ color:"var(--text-muted)", textAlign:"center", marginTop:20 }}>
          Aucune soutenance planifiée.
        </p>
      ) : (
        list.map((s) => (
          <div key={s.id} className="card">
            {/* ✅ shows etudiantNom from SoutenanceResponse */}
            <div className="card-title">🎓 {s.etudiantNom || `Étudiant #${s.etudiantId}`}</div>
            <div className="card-subtitle">
              📅 {new Date(s.dateHeure).toLocaleString("fr-FR")}
            </div>
            <div className="card-subtitle">🏛 Salle {s.salle}</div>
          </div>
        ))
      )}
    </div>
  );
}
