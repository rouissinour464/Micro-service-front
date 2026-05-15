import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Alert } from "../../components/UI";
import {
  getLivrableById,
  getCommentairesByLivrable,
  commenterLivrable,
  deleteCommentaire,
} from "../../services/stageService";
import { useAuth } from "../../context/AuthContext";

/* ── helpers ─────────────────────────────────────────────── */
function formatDate(d) {
  return new Date(d).toLocaleString("fr-FR", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}
function formatSize(bytes) {
  if (!bytes) return "";
  if (bytes < 1048576) return Math.round(bytes / 1024) + " Ko";
  return (bytes / 1048576).toFixed(1) + " Mo";
}

const TYPE_META = {
  RAPPORT:      { label: "Rapport",      color: "var(--accent)",  bg: "#5b6ef518", border: "#5b6ef530" },
  DOCUMENT:     { label: "Document",     color: "var(--warning)", bg: "#f5a62312", border: "#f5a62330" },
  PRESENTATION: { label: "Présentation", color: "var(--success)", bg: "#22d3a012", border: "#22d3a030" },
};

/* ════════════════════════════════════════════════════════════ */
export default function LivrableDetail() {
  const { livrableId } = useParams();
  const { user }       = useAuth();
  const navigate       = useNavigate();

  const [livrable, setLivrable]         = useState(null);
  const [commentaires, setCommentaires] = useState([]);
  const [commentaire, setCommentaire]   = useState("");
  const [loading, setLoading]           = useState(true);
  const [sending, setSending]           = useState(false);
  const [downloading, setDownloading]   = useState(false);
  const [error, setError]               = useState("");
  const [success, setSuccess]           = useState("");
  const [deleteComId, setDeleteComId]   = useState(null);

  const isEncadrant =
    user?.role === "ROLE_ENCADRANT" ||
    user?.role === "ENCADRANT" ||
    (Array.isArray(user?.roles) &&
      user.roles.some(r => r === "ROLE_ENCADRANT" || r === "ENCADRANT")) ||
    (Array.isArray(user?.authorities) &&
      user.authorities.some(a =>
        a === "ROLE_ENCADRANT" || a?.authority === "ROLE_ENCADRANT"
      ));

  /* ── flash ── */
  const flash = (type, msg) => {
    if (type === "error") setError(msg);
    else setSuccess(msg);
    setTimeout(() => { setError(""); setSuccess(""); }, 3000);
  };

  /* ── load ── */
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

  /* ── download ── */
  const handleDownload = async () => {
    setDownloading(true);
    try {
      const token  = localStorage.getItem("token");
      const apiUrl = (process.env.REACT_APP_API_URL || "http://localhost:8080/api").replace(/\/$/, "");
      const res    = await fetch(`${apiUrl}/livrables/${livrable.id}/download`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url  = window.URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href = url; a.download = livrable.nomFichier || "fichier"; a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      flash("error", "Impossible de télécharger le fichier.");
    } finally {
      setDownloading(false);
    }
  };

  /* ── envoyer commentaire ── */
  const envoyerCommentaire = async () => {
    if (!commentaire.trim()) return;
    setSending(true);
    try {
      await commenterLivrable({ livrableId: livrable.id, contenu: commentaire.trim() });
      setCommentaire("");
      flash("success", "Commentaire envoyé avec succès.");
      load();
    } catch {
      flash("error", "Erreur lors de l'envoi du commentaire.");
    } finally {
      setSending(false);
    }
  };

  /* ── supprimer commentaire ── */
  const confirmDeleteComment = async () => {
    try {
      await deleteCommentaire(deleteComId);
      setDeleteComId(null);
      flash("success", "Commentaire supprimé.");
      load();
    } catch {
      flash("error", "Impossible de supprimer ce commentaire.");
      setDeleteComId(null);
    }
  };

  /* ── render states ── */
  if (loading) {
    return (
      <div className="spinner-wrap">
        <div className="spinner spinner-lg" />
      </div>
    );
  }

  if (!livrable) {
    return (
      <div className="page-body">
        <Alert type="error" message={error || "Livrable introuvable."} />
        <button className="btn btn-ghost" style={{ width: "auto" }} onClick={() => navigate(-1)}>
          ← Retour
        </button>
      </div>
    );
  }

  const meta = TYPE_META[livrable.typeLivrable] || {
    label: livrable.typeLivrable,
    color: "var(--text-muted)", bg: "var(--dark-3)", border: "var(--border)",
  };

  /* ════════════════════════════════════════════════════════════ */
  return (
    <div className="page-body anim-fade-up">

      {/* ── Header ── */}
      <div className="page-header">
        <button
          className="btn btn-sm btn-ghost"
          onClick={() => navigate(-1)}
          style={{ width: "auto", marginBottom: 20 }}
        >
          ← Retour
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <span style={{
            padding: "4px 14px", borderRadius: 100, fontSize: 11,
            fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase",
            color: meta.color, background: meta.bg, border: `1px solid ${meta.border}`,
          }}>
            {meta.label}
          </span>
          {livrable.createdAt && (
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
              🗓 {formatDate(livrable.createdAt)}
            </span>
          )}
        </div>

        <h1 className="page-title">{livrable.titre}</h1>
        <p className="page-sub">
          👨‍🎓 {livrable.etudiantFullName || `Étudiant #${livrable.etudiantId}`}
        </p>
      </div>

      {error   && <Alert type="error"   message={error}   />}
      {success && <Alert type="success" message={success} />}

      {/* ── Description ── */}
      {livrable.description && (
        <div className="card anim-fade-up delay-1">
          <div className="card-header">
            <div className="card-header-left">
              <div className="card-icon">📝</div>
              <div className="card-title">Description</div>
            </div>
          </div>
          <p style={{ fontSize: 14, color: "var(--text-soft)", lineHeight: 1.75, margin: 0 }}>
            {livrable.description}
          </p>
        </div>
      )}

      {/* ── Fichier ── */}
      <div className="card anim-fade-up delay-2">
        <div className="card-header">
          <div className="card-header-left">
            <div className="card-icon">📄</div>
            <div>
              <div className="card-title">Document joint</div>
              <div className="card-subtitle">
                {livrable.tailleFichier && formatSize(livrable.tailleFichier)}
                {livrable.typeMime && (
                  <span style={{ marginLeft: 8 }}>· {livrable.typeMime}</span>
                )}
              </div>
            </div>
          </div>
          <button
            className="btn btn-ghost btn-sm"
            onClick={handleDownload}
            disabled={downloading}
            style={{ width: "auto" }}
          >
            {downloading
              ? <><span className="spinner" style={{ width: 14, height: 14 }} /> Téléchargement…</>
              : "⬇ Télécharger"}
          </button>
        </div>

        <div style={{
          padding: "14px 16px",
          background: "var(--dark-2)",
          border: "1px solid var(--border)",
          borderRadius: "var(--r-sm)",
          fontFamily: "monospace",
          fontSize: 13,
          color: "var(--text-soft)",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}>
          📎 {livrable.nomFichier || "Fichier sans nom"}
        </div>
      </div>

      {/* ── Commentaires ── */}
      <div className="card anim-fade-up delay-3">
        <div className="card-header">
          <div className="card-header-left">
            <div className="card-icon card-icon-accent">💬</div>
            <div>
              <div className="card-title">Commentaires</div>
              <div className="card-subtitle">
                {commentaires.length > 0
                  ? `${commentaires.length} commentaire${commentaires.length > 1 ? "s" : ""}`
                  : "Aucun commentaire"}
              </div>
            </div>
          </div>
          {commentaires.length > 0 && (
            <span style={{
              padding: "4px 12px",
              background: "rgba(99,120,255,0.1)",
              border: "1px solid rgba(99,120,255,0.25)",
              borderRadius: 100,
              fontSize: 13,
              fontWeight: 700,
              color: "var(--accent)",
            }}>
              {commentaires.length}
            </span>
          )}
        </div>

        {/* ── Liste commentaires ── */}
        {commentaires.length === 0 ? (
          <div className="empty-state" style={{ padding: "40px 24px" }}>
            <div className="empty-icon">💬</div>
            <div className="empty-title">Aucun commentaire</div>
            <div className="empty-sub">
              {isEncadrant
                ? "Laissez un retour à l'étudiant via le formulaire ci-dessous."
                : "Votre encadrant n'a pas encore commenté ce livrable."}
            </div>
          </div>
        ) : (
          <div style={{
            display: "flex", flexDirection: "column", gap: 12,
            marginBottom: isEncadrant ? 24 : 0,
          }}>
            {commentaires.map((c, i) => (
              <div
                key={c.id}
                className="anim-fade-up"
                style={{
                  animationDelay: `${i * 0.04}s`,
                  background: "var(--dark-2)",
                  border: "1px solid var(--border)",
                  borderLeft: "3px solid var(--accent)",
                  borderRadius: "var(--r-md)",
                  padding: "16px 18px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: 12,
                  transition: "border-color .2s",
                }}
              >
                <div style={{ flex: 1 }}>

                  {/* ── auteur + date ── */}
                  <div style={{
                    display: "flex", alignItems: "center", gap: 10,
                    marginBottom: 10, flexWrap: "wrap",
                  }}>

                    {/* avatar initiale */}
                    <div style={{
                      width: 28, height: 28,
                      borderRadius: "50%",
                      background: "var(--accent-grad)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 11, fontWeight: 800, color: "#fff",
                      flexShrink: 0,
                      boxShadow: "0 2px 8px var(--accent-glow)",
                    }}>
                      {(c.auteurNom || "E").charAt(0).toUpperCase()}
                    </div>

                    <span style={{
                      fontSize: 13, fontWeight: 700,
                      color: "var(--accent)", letterSpacing: ".02em",
                    }}>
                      {c.auteurNom || "Encadrant"}
                    </span>

                    <span style={{
                      width: 3, height: 3, borderRadius: "50%",
                      background: "var(--text-muted)", display: "inline-block",
                      flexShrink: 0,
                    }} />

                    <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                      🕐 {formatDate(c.createdAt)}
                    </span>
                  </div>

                  {/* ── contenu ── */}
                  <p style={{
                    fontSize: 14, color: "var(--text-soft)",
                    lineHeight: 1.75, margin: 0,
                    paddingLeft: 38,
                  }}>
                    {c.contenu}
                  </p>
                </div>

                {/* ── supprimer — encadrant uniquement ── */}
                {isEncadrant && (
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => setDeleteComId(c.id)}
                    title="Supprimer ce commentaire"
                    style={{ flexShrink: 0, padding: "6px 10px" }}
                  >
                    🗑
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── Zone de saisie (encadrant uniquement) ── */}
        {isEncadrant && (
          <div style={{
            borderTop: commentaires.length > 0 ? "1px solid var(--border)" : "none",
            paddingTop: commentaires.length > 0 ? 24 : 0,
          }}>

            {/* label avec icone */}
            <div style={{
              display: "flex", alignItems: "center", gap: 10,
              marginBottom: 12,
            }}>
              <div style={{
                width: 28, height: 28,
                borderRadius: "50%",
                background: "var(--accent-grad)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 11, fontWeight: 800, color: "#fff",
                boxShadow: "0 2px 8px var(--accent-glow)",
                flexShrink: 0,
              }}>
                {(user?.fullName || user?.name || user?.email || "E").charAt(0).toUpperCase()}
              </div>
              <label className="form-label" style={{ margin: 0 }}>
                Ajouter un commentaire
              </label>
            </div>

            <textarea
              className="form-input"
              rows={4}
              placeholder="Votre retour sur ce livrable : points forts, corrections, suggestions…"
              value={commentaire}
              onChange={e => setCommentaire(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) envoyerCommentaire();
              }}
              style={{ marginBottom: 12, resize: "vertical" }}
            />

            <div style={{
              display: "flex", alignItems: "center",
              justifyContent: "space-between", flexWrap: "wrap", gap: 10,
            }}>
              <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                Ctrl + Entrée pour envoyer
              </span>
              <button
                className="btn btn-primary"
                style={{ width: "auto" }}
                onClick={envoyerCommentaire}
                disabled={sending || !commentaire.trim()}
              >
                {sending
                  ? <><span className="spinner" style={{ width: 14, height: 14 }} /> Envoi…</>
                  : "💬 Envoyer le commentaire"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════
          MODAL — Confirmation suppression commentaire
      ══════════════════════════════════════════════════════ */}
      {deleteComId !== null && (
        <div className="modal-overlay" onClick={() => setDeleteComId(null)}>
          <div className="modal card-danger" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">🗑 Supprimer ce commentaire ?</div>
              <button className="modal-close" onClick={() => setDeleteComId(null)}>×</button>
            </div>
            <p style={{ color: "var(--text-soft)", fontSize: 15, lineHeight: 1.65 }}>
              Cette action est{" "}
              <strong style={{ color: "var(--danger)" }}>irréversible</strong>.
              Le commentaire sera définitivement supprimé.
            </p>
            <div className="modal-actions">
              <button className="btn btn-ghost btn-sm" onClick={() => setDeleteComId(null)}>
                Annuler
              </button>
              <button className="btn btn-danger btn-sm" onClick={confirmDeleteComment}>
                Oui, supprimer
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}