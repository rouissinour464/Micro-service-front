import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Spinner, Alert } from "../../components/UI";
import {
  getLivrableById,
  getCommentairesByLivrable,
  commenterLivrable,
} from "../../services/stageService";
import { useAuth } from "../../context/AuthContext";

export default function LivrableDetail() {
  const { livrableId } = useParams();
  const { user } = useAuth();

  const [livrable, setLivrable]       = useState(null);
  const [commentaires, setCommentaires] = useState([]);
  const [commentaire, setCommentaire] = useState("");
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState("");

  const isEncadrant = user?.role === "ROLE_ENCADRANT";

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const [l, c] = await Promise.all([
        getLivrableById(livrableId),
        getCommentairesByLivrable(livrableId),
      ]);
      setLivrable(l);
      setCommentaires(c);
    } catch {
      setError("Impossible de charger le livrable.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [livrableId]);

  // ✅ Téléchargement avec token JWT
  const handleDownload = async () => {
    try {
      const token = localStorage.getItem("token");
      const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:8080/api";
      const response = await fetch(
        `${apiUrl}/livrables/${livrable.id}/download`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!response.ok) throw new Error("Erreur téléchargement");

      const blob = await response.blob();
      const url  = window.URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = livrable.nomFichier || "fichier";
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      setError("Impossible de télécharger le fichier.");
    }
  };

  const envoyerCommentaire = async () => {
    if (!commentaire.trim()) return;
    try {
      await commenterLivrable({ livrableId: livrable.id, contenu: commentaire });
      setCommentaire("");
      load();
    } catch {
      setError("Erreur lors de l'envoi du commentaire.");
    }
  };

  if (loading) return <Spinner />;
  if (error)   return <Alert type="error" message={error} />;
  if (!livrable) return <p>Livrable introuvable.</p>;

  return (
    <div className="page-body">

      <div className="page-header">
        <h1 className="page-title">{livrable.titre}</h1>
        <p className="page-sub">
          👨‍🎓 {livrable.etudiantFullName || `Étudiant #${livrable.etudiantId}`} · {livrable.typeLivrable}
        </p>
      </div>

      {error && <Alert type="error" message={error} />}

      {/* FICHIER */}
      <div className="card">
        <div className="card-title">📄 Document</div>
        <p>Fichier : <strong>{livrable.nomFichier}</strong></p>
        {/* ✅ Téléchargement via fetch avec token */}
        <button className="btn btn-ghost" onClick={handleDownload}>
          ⬇ Télécharger
        </button>
      </div>

      {/* COMMENTAIRES */}
      <div className="card">
        <div className="card-title">💬 Commentaires</div>

        {commentaires.length === 0 ? (
          <p style={{ color: "var(--text-muted)" }}>Aucun commentaire.</p>
        ) : (
          commentaires.map((c) => (
            <div key={c.id} className="card-item">
              <div>{c.contenu}</div>
              <div className="item-sub">
                {new Date(c.createdAt).toLocaleString("fr-FR")}
              </div>
            </div>
          ))
        )}

        {isEncadrant && (
          <div style={{ marginTop: 16 }}>
            <textarea
              className="form-input"
              rows={3}
              placeholder="Votre commentaire..."
              value={commentaire}
              onChange={(e) => setCommentaire(e.target.value)}
            />
            <button
              className="btn btn-primary"
              style={{ marginTop: 8 }}
              onClick={envoyerCommentaire}
            >
              Envoyer
            </button>
          </div>
        )}
      </div>
    </div>
  );
}