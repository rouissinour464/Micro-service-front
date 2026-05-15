import React, { useEffect, useState } from "react";
import {
  getAllDemandes,
  validerDemande,
  getFileUrl,
} from "../../services/stageService";
import { Alert } from "../../components/UI";
import { extractError } from "../../context/AuthContext";

const STATUS_BADGE = {
  EN_ATTENTE: { label: "En attente", cls: "badge-warning", icon: "⏳" },
  VALIDEE: { label: "Validée", cls: "badge-success", icon: "✓" },
  REJETEE: { label: "Rejetée", cls: "badge-danger", icon: "✗" },
};

const NIVEAU_ICONS = {
  Licence: "🎓",
  Master: "🏅",
  Ingénieur: "⚙️",
};

export default function AdminDemandes() {
  const [demandes, setDemandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ type: "", msg: "" });
  const [rejectId, setRejectId] = useState(null);
  const [rejectComment, setRejectComment] = useState("");
  const [confirmId, setConfirmId] = useState(null);
  const [filter, setFilter] = useState("ALL");

  const flash = (type, msg) => {
    setAlert({ type, msg });
    setTimeout(() => setAlert({ type: "", msg: "" }), 4000);
  };

  const load = async () => {
    try {
      setLoading(true);
      setDemandes(await getAllDemandes());
    } catch (e) {
      flash("error", extractError(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleValider = async () => {
    try {
      await validerDemande(confirmId, {
        status: "VALIDEE",
        commentaire: "",
      });

      flash("success", "Demande validée avec succès.");
      setConfirmId(null);
      load();
    } catch (e) {
      flash("error", extractError(e));
    }
  };

  const handleRejeter = async () => {
    if (!rejectComment.trim()) {
      flash("error", "Le motif de rejet est obligatoire.");
      return;
    }

    try {
      await validerDemande(rejectId, {
        status: "REJETEE",
        commentaire: rejectComment,
      });

      flash("success", "Demande rejetée.");
      setRejectId(null);
      setRejectComment("");
      load();
    } catch (e) {
      flash("error", extractError(e));
    }
  };

  const filtered =
    filter === "ALL"
      ? demandes
      : demandes.filter((d) => d.status === filter);

  const counts = {
    ALL: demandes.length,
    EN_ATTENTE: demandes.filter((d) => d.status === "EN_ATTENTE").length,
    VALIDEE: demandes.filter((d) => d.status === "VALIDEE").length,
    REJETEE: demandes.filter((d) => d.status === "REJETEE").length,
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
      <div className="page-header">
        <div className="page-eyebrow">Administration</div>

        <h1 className="page-title">Demandes de stage</h1>

        <p className="page-sub">
          Gérez et validez les demandes soumises par les étudiants.
        </p>
      </div>

      <div className="stats-grid delay-1 anim-fade-up">
        <div className="stat-card">
          <div className="stat-label">Total</div>
          <div className="stat-value">{counts.ALL}</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">En attente</div>
          <div className="stat-value stat-warning">
            {counts.EN_ATTENTE}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Validées</div>
          <div className="stat-value stat-success">
            {counts.VALIDEE}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Rejetées</div>
          <div className="stat-value stat-danger">
            {counts.REJETEE}
          </div>
        </div>
      </div>

      {alert.msg && (
        <Alert type={alert.type} message={alert.msg} />
      )}

      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 24,
          flexWrap: "wrap",
        }}
      >
        {[
          { key: "ALL", label: "Toutes", icon: "📋" },
          { key: "EN_ATTENTE", label: "En attente", icon: "⏳" },
          { key: "VALIDEE", label: "Validées", icon: "✅" },
          { key: "REJETEE", label: "Rejetées", icon: "❌" },
        ].map((f) => (
          <button
            key={f.key}
            className={`btn btn-sm ${
              filter === f.key ? "btn-primary" : "btn-ghost"
            }`}
            onClick={() => setFilter(f.key)}
          >
            {f.icon} {f.label}

            <span
              style={{
                background: "rgba(255,255,255,0.15)",
                borderRadius: "100px",
                padding: "2px 7px",
                fontSize: 11,
                fontWeight: 700,
                marginLeft: 2,
              }}
            >
              {counts[f.key]}
            </span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon">📭</div>

            <div className="empty-title">
              Aucune demande
            </div>

            <div className="empty-sub">
              Il n'y a aucune demande correspondant à ce filtre.
            </div>
          </div>
        </div>
      ) : (
        filtered.map((d, i) => (
          <div
            key={d.id}
            className="card anim-fade-up"
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: 16,
                marginBottom: 14,
              }}
            >
              <div style={{ flex: 1 }}>
                <div
                  className="item-title"
                  style={{ fontSize: 16 }}
                >
                  {d.titreProjet}
                </div>

                <div
                  className="item-sub"
                  style={{
                    marginTop: 4,
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "6px 14px",
                  }}
                >
                  <span>🏢 {d.entreprise}</span>

                  <span>
                    👤{" "}
                    {d.etudiantNom ||
                      `Étudiant #${d.etudiantId}`}
                  </span>

                  {d.domaine && (
                    <span>🏷 {d.domaine}</span>
                  )}

                  {d.niveau && (
                    <span>
                      {NIVEAU_ICONS[d.niveau] || "📚"}{" "}
                      {d.niveau}
                    </span>
                  )}

                  {d.lieu && (
                    <span>📍 {d.lieu}</span>
                  )}
                </div>
              </div>

              <span
                className={`badge ${
                  STATUS_BADGE[d.status]?.cls
                }`}
              >
                {STATUS_BADGE[d.status]?.icon}{" "}
                {STATUS_BADGE[d.status]?.label}
              </span>
            </div>

            {d.descriptionProjet && (
              <p
                style={{
                  fontSize: 14,
                  color: "var(--text-soft)",
                  lineHeight: 1.65,
                  marginBottom: 14,
                  padding: "12px 16px",
                  background: "var(--dark-2)",
                  borderRadius: "var(--r-sm)",
                  border: "1px solid var(--border)",
                }}
              >
                {d.descriptionProjet}
              </p>
            )}

            {/* ✅ Document joint */}
            {d.imageDemandeUrl && (
              <div style={{ marginBottom: 14 }}>
                <a
                  href={getFileUrl(d.imageDemandeUrl)}
                  target="_blank"
                  rel="noreferrer"
                  className="doc-link"
                >
                  📄 Voir le document joint
                </a>
              </div>
            )}

            {d.commentaireAdmin && (
              <div
                className="comment-block"
                style={{ marginBottom: 14 }}
              >
                💬 {d.commentaireAdmin}
              </div>
            )}

            {d.encadrantNom && (
              <div
                style={{
                  fontSize: 13,
                  color: "var(--text-muted)",
                  marginBottom: 14,
                }}
              >
                <span
                  style={{
                    background: "var(--success-bg)",
                    border:
                      "1px solid var(--success-border)",
                    borderRadius: "100px",
                    padding: "3px 12px",
                    color: "var(--success)",
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  👨‍🏫 {d.encadrantNom}
                </span>
              </div>
            )}

            {d.createdAt && (
              <div
                style={{
                  fontSize: 12,
                  color: "var(--text-muted)",
                  marginBottom: 14,
                }}
              >
                📅 Soumise le{" "}
                {new Date(d.createdAt).toLocaleDateString(
                  "fr-FR",
                  {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  }
                )}

                {d.dateValidation && (
                  <span style={{ marginLeft: 16 }}>
                    · Traitée le{" "}
                    {new Date(
                      d.dateValidation
                    ).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                )}
              </div>
            )}

            {d.status === "EN_ATTENTE" && (
              <div
                style={{
                  display: "flex",
                  gap: 10,
                  paddingTop: 4,
                }}
              >
                <button
                  className="btn btn-success btn-sm"
                  onClick={() => setConfirmId(d.id)}
                >
                  ✅ Accepter
                </button>

                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => {
                    setRejectId(d.id);
                    setRejectComment("");
                  }}
                >
                  ❌ Refuser
                </button>
              </div>
            )}
          </div>
        ))
      )}

      {/* ── Modal Validation ── */}
      {confirmId && (
        <div
          className="modal-overlay"
          onClick={() => setConfirmId(null)}
        >
          <div
            className="modal card-success"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div className="modal-title">
                ✅ Confirmer la validation
              </div>

              <button
                className="modal-close"
                onClick={() => setConfirmId(null)}
              >
                ×
              </button>
            </div>

            <p
              style={{
                color: "var(--text-soft)",
                fontSize: 15,
                lineHeight: 1.65,
              }}
            >
              Êtes-vous sûr de vouloir{" "}
              <strong style={{ color: "var(--success)" }}>
                valider
              </strong>{" "}
              cette demande ?
            </p>

            <div className="modal-actions">
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setConfirmId(null)}
              >
                Annuler
              </button>

              <button
                className="btn btn-success btn-sm"
                onClick={handleValider}
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Rejet ── */}
      {rejectId && (
        <div
          className="modal-overlay"
          onClick={() => {
            setRejectId(null);
            setRejectComment("");
          }}
        >
          <div
            className="modal card-danger"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div className="modal-title">
                ❌ Motif du rejet
              </div>

              <button
                className="modal-close"
                onClick={() => {
                  setRejectId(null);
                  setRejectComment("");
                }}
              >
                ×
              </button>
            </div>

            <p
              style={{
                color: "var(--text-soft)",
                fontSize: 14,
                marginBottom: 16,
                lineHeight: 1.6,
              }}
            >
              Veuillez expliquer pourquoi cette
              demande est rejetée.
            </p>

            <textarea
              className="form-input"
              rows={4}
              placeholder="Ex : Le sujet ne correspond pas aux critères du programme..."
              value={rejectComment}
              onChange={(e) =>
                setRejectComment(e.target.value)
              }
              autoFocus
            />

            <div className="modal-actions">
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => {
                  setRejectId(null);
                  setRejectComment("");
                }}
              >
                Annuler
              </button>

              <button
                className="btn btn-danger btn-sm"
                onClick={handleRejeter}
              >
                Confirmer le rejet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}