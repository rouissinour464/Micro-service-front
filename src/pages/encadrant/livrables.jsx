import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Spinner, Alert } from "../../components/UI";
import { getLivrablesEncadrant } from "../../services/stageService";

export default function LivrablesEncadrant() {
  const [livrables, setLivrables] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    getLivrablesEncadrant()
      .then(setLivrables)
      .catch(() => setError("Impossible de charger les livrables."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  return (
    <div className="page-body">
      <div className="page-header">
        <div className="page-eyebrow">Livrables</div>
        <h1 className="page-title">📁 Livrables des étudiants</h1>
      </div>

      {error && <Alert type="error" message={error} />}

      {livrables.length === 0 ? (
        <p style={{ textAlign:"center", color:"var(--text-muted)", marginTop:20 }}>
          Aucun livrable reçu.
        </p>
      ) : (
        livrables.map((l) => (
          <div key={l.id} className="card">
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div>
                <div className="card-title">{l.titre}</div>
                {/* ✅ FIX: use etudiantFullName (correct field name from LivrableResponse) */}
                <div className="card-subtitle">
                  👨‍🎓 {l.etudiantFullName || `Étudiant #${l.etudiantId}`} · 📄 {l.typeLivrable}
                </div>
                <div className="card-subtitle" style={{ marginTop:4 }}>
                  {new Date(l.createdAt).toLocaleDateString("fr-FR")}
                </div>
              </div>
              <button
                className="btn btn-sm btn-ghost"
                onClick={() => navigate(`/livrables/${l.id}`)}
              >
                👁 Voir
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
