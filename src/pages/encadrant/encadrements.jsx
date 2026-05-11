import { useEffect, useState } from "react";
import { Spinner } from "../../components/UI";
import { getMesEncadrements } from "../../services/stageService";

export default function Encadrements() {

  const [demandes, setDemandes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMesEncadrements()
      .then((res) => setDemandes(res))
      .catch((err) => {
        console.error("Erreur chargement encadrements :", err);
        setDemandes([]);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  return (
    <div className="page-body">

      {/* HEADER */}
      <div className="page-header">
        <div className="page-eyebrow">Encadrement</div>
        <h1 className="page-title">Mes étudiants encadrés</h1>
        <p className="page-sub">
          Liste des projets de stage qui vous sont affectés
        </p>
      </div>

      {/* EMPTY STATE */}
      {demandes.length === 0 ? (
        <p style={{ color: "var(--text-muted)", textAlign: "center" }}>
          Aucun étudiant affecté pour le moment.
        </p>
      ) : (
        demandes.map((d) => (
          <div key={d.id} className="card anim-fade-up">

            {/* HEADER CARD */}
            <div className="card-header">
              <div className="card-icon">👨‍🎓</div>
              <div>
                <div className="card-title">{d.titreProjet}</div>
                <div className="card-subtitle">
                  {d.entreprise} · {d.lieu}
                </div>
              </div>
            </div>

            {/* INFOS GRID */}
            <div className="info-grid">

              <div className="info-item">
                <div className="info-item-label">Étudiant</div>
                <div className="info-item-value">
                  {d.etudiantNom ?? `Étudiant #${d.etudiantId}`}
                </div>
              </div>

              <div className="info-item">
                <div className="info-item-label">Domaine</div>
                <div className="info-item-value">{d.domaine}</div>
              </div>

              <div className="info-item">
                <div className="info-item-label">Niveau</div>
                <div className="info-item-value">{d.niveau}</div>
              </div>

              <div className="info-item">
                <div className="info-item-label">Statut</div>
                <div className="info-item-value">Validée</div>
              </div>

            </div>

            {/* DESCRIPTION */}
            <div className="info-item">
              <div className="info-item-label">Description du projet</div>
              <div className="info-item-value">
                {d.descriptionProjet}
              </div>
            </div>

            {/* DOCUMENT (FIXED) */}
            {d.imageDemandeUrl && (
              <div className="info-item" style={{ marginTop: 14 }}>
                <div className="info-item-label">Document joint</div>

                <a
                  href={`${process.env.REACT_APP_API_URL}/files/${d.imageDemandeUrl}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-ghost btn-sm"
                >
                  📎 Voir le document
                </a>
              </div>
            )}

          </div>
        ))
      )}
    </div>
  );
}