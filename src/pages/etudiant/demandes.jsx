import { useEffect, useState } from "react";
import { Alert } from "../../components/UI";
import {
  getMesDemandes,
  getEncadrants,
  choisirEncadrant,
  soumettreDemande,
  deleteDemande,
  updateDemande,
  getFileUrl,
} from "../../services/stageService";

const STATUS_BADGE = {
  EN_ATTENTE: {
    label: "En attente",
    cls: "badge-warning",
    icon: "⏳",
  },
  VALIDEE: {
    label: "Validée",
    cls: "badge-success",
    icon: "✓",
  },
  REJETEE: {
    label: "Rejetée",
    cls: "badge-danger",
    icon: "✗",
  },
};

const DOMAINES = [
  "Développement Web",
  "Développement Mobile",
  "Intelligence Artificielle",
  "Data Science",
  "Cybersécurité",
  "Réseaux & Systèmes",
  "Cloud Computing",
  "Génie Logiciel",
  "Autre",
];

const NIVEAUX = [
  "Licence",
  "Master",
  "Ingénieur",
];

const EMPTY_FORM = {
  titreProjet: "",
  descriptionProjet: "",
  domaine: "",
  niveau: "",
  lieu: "",
  entreprise: "",
  imageFile: null,
};

export default function MesDemandes() {
  const [demandes, setDemandes] = useState([]);
  const [encadrants, setEncadrants] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState(EMPTY_FORM);

  const load = async () => {
    try {
      const [dem, enc] = await Promise.all([
        getMesDemandes(),
        getEncadrants(),
      ]);

      setDemandes(dem);
      setEncadrants(
        enc.filter((e) => e.disponible)
      );
    } catch {
      setError(
        "Impossible de charger les données."
      );
    }
  };

  useEffect(() => {
    load();
  }, []);

  const flash = (type, msg) => {
    if (type === "error") setError(msg);
    else setSuccess(msg);

    setTimeout(() => {
      setError("");
      setSuccess("");
    }, 3500);
  };

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditId(null);
    setShowForm(false);
  };

  const setField = (key, val) => {
    setForm((f) => ({
      ...f,
      [key]: val,
    }));
  };

  const submit = async (e) => {
    e.preventDefault();

    if (
      !form.titreProjet.trim() ||
      !form.entreprise.trim()
    ) {
      flash(
        "error",
        "Titre et entreprise sont obligatoires."
      );
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      if (editId) {
        await updateDemande(editId, form);

        flash(
          "success",
          "Demande mise à jour ✓"
        );
      } else {
        await soumettreDemande(form);

        flash(
          "success",
          "Demande soumise avec succès ✓"
        );
      }

      resetForm();
      await load();
    } catch {
      flash(
        "error",
        editId
          ? "Erreur lors de la mise à jour."
          : "Erreur lors de la soumission."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    try {
      await deleteDemande(deleteId);

      flash(
        "success",
        "Demande supprimée."
      );

      setDeleteId(null);
      await load();
    } catch {
      flash(
        "error",
        "Impossible de supprimer cette demande."
      );
    }
  };

  const handleChoisirEncadrant = async (
    demandeId,
    encadrantId
  ) => {
    if (!encadrantId) return;

    setError("");

    try {
      await choisirEncadrant(
        demandeId,
        Number(encadrantId)
      );

      flash(
        "success",
        "Encadrant choisi ✓"
      );

      load();
    } catch {
      flash(
        "error",
        "Impossible de choisir cet encadrant."
      );
    }
  };

  const openEdit = (d) => {
    setForm({
      titreProjet: d.titreProjet || "",
      descriptionProjet:
        d.descriptionProjet || "",
      domaine: d.domaine || "",
      niveau: d.niveau || "",
      lieu: d.lieu || "",
      entreprise: d.entreprise || "",
      imageFile: null,
    });

    setEditId(d.id);
    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <div className="page-body anim-fade-up">
      {/* ── Header ── */}
      <div
        className="page-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <div>
          <div className="page-eyebrow">
            Espace Étudiant
          </div>

          <h1 className="page-title">
            Mes demandes de stage
          </h1>

          <p className="page-sub">
            Soumettez et suivez vos demandes
            de stage.
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => {
            resetForm();
            setShowForm(!showForm);
          }}
          style={{ flexShrink: 0 }}
        >
          {showForm && !editId
            ? "✕ Annuler"
            : "➕ Nouvelle demande"}
        </button>
      </div>

      {error && (
        <Alert
          type="error"
          message={error}
        />
      )}

      {success && (
        <Alert
          type="success"
          message={success}
        />
      )}

      {/* ── Form ── */}
      {showForm && (
        <div
          className="card card-accent anim-slide-r"
          style={{ marginBottom: 28 }}
        >
          <div className="card-header">
            <div className="card-header-left">
              <div className="card-icon card-icon-accent">
                {editId ? "✏️" : "📝"}
              </div>

              <div>
                <div className="card-title">
                  {editId
                    ? "Modifier la demande"
                    : "Nouvelle demande"}
                </div>

                <div className="card-subtitle">
                  {editId
                    ? "Modifiez les informations de votre demande."
                    : "Remplissez les informations pour soumettre votre demande."}
                </div>
              </div>
            </div>

            <button
              className="btn btn-ghost btn-icon"
              onClick={resetForm}
            >
              ✕
            </button>
          </div>

          <form onSubmit={submit}>
            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">
                  Titre du projet *
                </label>

                <input
                  className="form-input"
                  placeholder="Ex: Développement d'une app mobile"
                  required
                  value={form.titreProjet}
                  onChange={(e) =>
                    setField(
                      "titreProjet",
                      e.target.value
                    )
                  }
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Entreprise *
                </label>

                <input
                  className="form-input"
                  placeholder="Nom de l'entreprise"
                  required
                  value={form.entreprise}
                  onChange={(e) =>
                    setField(
                      "entreprise",
                      e.target.value
                    )
                  }
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                Description du projet
              </label>

              <textarea
                className="form-input"
                placeholder="Décrivez brièvement le projet et vos objectifs..."
                rows={4}
                value={
                  form.descriptionProjet
                }
                onChange={(e) =>
                  setField(
                    "descriptionProjet",
                    e.target.value
                  )
                }
              />
            </div>

            <div className="form-row-3">
              <div className="form-group">
                <label className="form-label">
                  Domaine
                </label>

                <select
                  className="form-input form-select"
                  value={form.domaine}
                  onChange={(e) =>
                    setField(
                      "domaine",
                      e.target.value
                    )
                  }
                >
                  <option value="">
                    — Sélectionner —
                  </option>

                  {DOMAINES.map((d) => (
                    <option
                      key={d}
                      value={d}
                    >
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Niveau
                </label>

                <select
                  className="form-input form-select"
                  value={form.niveau}
                  onChange={(e) =>
                    setField(
                      "niveau",
                      e.target.value
                    )
                  }
                >
                  <option value="">
                    — Sélectionner —
                  </option>

                  {NIVEAUX.map((n) => (
                    <option
                      key={n}
                      value={n}
                    >
                      {n}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Lieu
                </label>

                <input
                  className="form-input"
                  placeholder="Ex: Tunis, Paris..."
                  value={form.lieu}
                  onChange={(e) =>
                    setField(
                      "lieu",
                      e.target.value
                    )
                  }
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                Document joint (optionnel)
              </label>

              <input
                type="file"
                className="form-input"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                onChange={(e) =>
                  setField(
                    "imageFile",
                    e.target.files[0]
                  )
                }
              />
            </div>

            <div
              style={{
                display: "flex",
                gap: 10,
                justifyContent: "flex-end",
                marginTop: 8,
              }}
            >
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={resetForm}
              >
                Annuler
              </button>

              <button
                type="submit"
                className="btn btn-primary btn-sm"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <span
                      className="spinner"
                      style={{
                        width: 14,
                        height: 14,
                      }}
                    />{" "}
                    Envoi...
                  </>
                ) : editId ? (
                  "💾 Enregistrer"
                ) : (
                  "📤 Soumettre"
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Liste ── */}
      {demandes.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon">
              📋
            </div>

            <div className="empty-title">
              Aucune demande
            </div>

            <div className="empty-sub">
              Vous n'avez pas encore soumis
              de demande.
            </div>
          </div>
        </div>
      ) : (
        demandes.map((d, i) => (
          <div
            key={d.id}
            className="card anim-fade-up"
            style={{
              animationDelay: `${i * 0.06}s`,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                alignItems: "flex-start",
                gap: 12,
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
                    gap: "5px 14px",
                  }}
                >
                  {d.entreprise && (
                    <span>
                      🏢 {d.entreprise}
                    </span>
                  )}

                  {d.domaine && (
                    <span>
                      🏷 {d.domaine}
                    </span>
                  )}

                  {d.niveau && (
                    <span>
                      📚 {d.niveau}
                    </span>
                  )}

                  {d.lieu && (
                    <span>
                      📍 {d.lieu}
                    </span>
                  )}
                </div>
              </div>

              <span
                className={`badge ${
                  STATUS_BADGE[d.status]
                    ?.cls
                }`}
              >
                {
                  STATUS_BADGE[d.status]
                    ?.icon
                }{" "}
                {
                  STATUS_BADGE[d.status]
                    ?.label
                }
              </span>
            </div>

            {d.descriptionProjet && (
              <p
                style={{
                  fontSize: 14,
                  color:
                    "var(--text-soft)",
                  lineHeight: 1.65,
                  marginBottom: 14,
                  padding: "12px 16px",
                  background:
                    "var(--dark-2)",
                  borderRadius:
                    "var(--r-sm)",
                  border:
                    "1px solid var(--border)",
                }}
              >
                {d.descriptionProjet}
              </p>
            )}

            {/* ✅ Document joint */}
            {d.imageDemandeUrl && (
              <div
                style={{ marginBottom: 14 }}
              >
                <a
                  href={getFileUrl(
                    d.imageDemandeUrl
                  )}
                  target="_blank"
                  rel="noreferrer"
                  className="doc-link"
                >
                  📎 Voir le document joint
                </a>
              </div>
            )}

            {d.commentaireAdmin && (
              <div
                className="comment-block"
                style={{ marginBottom: 14 }}
              >
                💬{" "}
                <strong>
                  Commentaire admin :
                </strong>{" "}
                {d.commentaireAdmin}
              </div>
            )}

            {d.encadrantNom && (
              <div
                style={{ marginBottom: 14 }}
              >
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 7,
                    background:
                      "var(--success-bg)",
                    border:
                      "1px solid var(--success-border)",
                    borderRadius: "100px",
                    padding: "4px 14px",
                    fontSize: 13,
                    color:
                      "var(--success)",
                    fontWeight: 600,
                  }}
                >
                  👨‍🏫 Encadrant :{" "}
                  {d.encadrantNom}
                </span>
              </div>
            )}

            {d.status === "VALIDEE" &&
              !d.encadrantId &&
              encadrants.length > 0 && (
                <div
                  style={{
                    marginBottom: 14,
                  }}
                >
                  <select
                    className="form-input form-select"
                    style={{
                      maxWidth: 280,
                    }}
                    defaultValue=""
                    onChange={(e) =>
                      handleChoisirEncadrant(
                        d.id,
                        e.target.value
                      )
                    }
                  >
                    <option value="">
                      👨‍🏫 Choisir un
                      encadrant...
                    </option>

                    {encadrants.map(
                      (enc) => (
                        <option
                          key={enc.id}
                          value={enc.id}
                        >
                          {enc.fullName ||
                            enc.nom ||
                            `Encadrant #${enc.id}`}

                          {enc.specialite
                            ? ` — ${enc.specialite}`
                            : ""}
                        </option>
                      )
                    )}
                  </select>
                </div>
              )}

            {d.createdAt && (
              <div
                style={{
                  fontSize: 12,
                  color:
                    "var(--text-muted)",
                  marginBottom: 12,
                }}
              >
                📅 Soumise le{" "}
                {new Date(
                  d.createdAt
                ).toLocaleDateString(
                  "fr-FR",
                  {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  }
                )}
              </div>
            )}

            {d.status ===
              "EN_ATTENTE" && (
              <div
                style={{
                  display: "flex",
                  gap: 10,
                  paddingTop: 4,
                }}
              >
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() =>
                    openEdit(d)
                  }
                >
                  ✏️ Modifier
                </button>

                <button
                  className="btn btn-danger btn-sm"
                  onClick={() =>
                    setDeleteId(d.id)
                  }
                >
                  🗑 Supprimer
                </button>
              </div>
            )}
          </div>
        ))
      )}

      {/* ── Modal Delete ── */}
      {deleteId && (
        <div
          className="modal-overlay"
          onClick={() =>
            setDeleteId(null)
          }
        >
          <div
            className="modal card-danger"
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <div className="modal-header">
              <div className="modal-title">
                🗑 Supprimer la demande
              </div>

              <button
                className="modal-close"
                onClick={() =>
                  setDeleteId(null)
                }
              >
                ×
              </button>
            </div>

            <p
              style={{
                color:
                  "var(--text-soft)",
                fontSize: 15,
                lineHeight: 1.65,
              }}
            >
              Êtes-vous sûr de vouloir{" "}
              <strong
                style={{
                  color:
                    "var(--danger)",
                }}
              >
                supprimer
              </strong>{" "}
              cette demande ? Cette
              action est{" "}
              <strong>
                irréversible
              </strong>
              .
            </p>

            <div className="modal-actions">
              <button
                className="btn btn-ghost btn-sm"
                onClick={() =>
                  setDeleteId(null)
                }
              >
                Annuler
              </button>

              <button
                className="btn btn-danger btn-sm"
                onClick={
                  confirmDelete
                }
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}