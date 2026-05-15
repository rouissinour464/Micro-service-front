import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Spinner, Alert } from "../../components/UI";
import {
  getMesLivrables,
  deleteLivrable,
  deposerLivrable,
  updateLivrable,
  getMesDemandes,
} from "../../services/stageService";

/* ── helpers ─────────────────────────────────────────────── */
function formatSize(bytes) {
  if (!bytes) return "";
  if (bytes < 1048576) return Math.round(bytes / 1024) + " Ko";
  return (bytes / 1048576).toFixed(1) + " Mo";
}
function formatDate(d) {
  return new Date(d).toLocaleDateString("fr-FR", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

const TYPE_META = {
  RAPPORT:      { label: "Rapport",      color: "var(--accent)",   bg: "#5b6ef518", border: "#5b6ef530" },
  DOCUMENT:     { label: "Document",     color: "var(--warning)",  bg: "#f5a62312", border: "#f5a62330" },
  PRESENTATION: { label: "Présentation", color: "var(--success)",  bg: "#22d3a012", border: "#22d3a030" },
};

const EMPTY_FORM = { titre: "", description: "", typeLivrable: "RAPPORT", demandeId: "", file: null };

/* ── component ───────────────────────────────────────────── */
export default function Livrables() {
  const [livrables, setLivrables] = useState([]);
  const [demandes, setDemandes]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]         = useState("");
  const [success, setSuccess]     = useState("");

  // "create" | "edit" | null
  const [mode, setMode]       = useState(null);
  const [editId, setEditId]   = useState(null);
  const [form, setForm]       = useState(EMPTY_FORM);
  const [deleteId, setDeleteId] = useState(null); // confirmation

  const navigate = useNavigate();

  /* ── load ─────────────────────────────────────────────── */
  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const [l, d] = await Promise.all([getMesLivrables(), getMesDemandes()]);
      setLivrables(l);
      setDemandes(d.filter(dem => dem.status === "VALIDEE"));
    } catch {
      setError("Impossible de charger les données.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  /* ── stats ─────────────────────────────────────────────── */
  const stats = useMemo(() => ({
    total:        livrables.length,
    rapport:      livrables.filter(l => l.typeLivrable === "RAPPORT").length,
    document:     livrables.filter(l => l.typeLivrable === "DOCUMENT").length,
    presentation: livrables.filter(l => l.typeLivrable === "PRESENTATION").length,
  }), [livrables]);

  /* ── open forms ───────────────────────────────────────── */
  const openCreate = () => {
    setForm(EMPTY_FORM);
    setEditId(null);
    setMode("create");
    setError("");
  };

  const openEdit = (l) => {
    setForm({
      titre: l.titre,
      description: l.description || "",
      typeLivrable: l.typeLivrable,
      demandeId: l.demandeId,
      file: null,
    });
    setEditId(l.id);
    setMode("edit");
    setError("");
  };

  const closeForm = () => { setMode(null); setEditId(null); setForm(EMPTY_FORM); };

  /* ── submit create ────────────────────────────────────── */
  const submitCreate = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.demandeId) { setError("Sélectionnez un stage validé."); return; }
    if (!form.file)      { setError("Joignez un fichier."); return; }
    setSubmitting(true);
    try {
      const data = new FormData();
      data.append("demandeId",    form.demandeId);
      data.append("titre",        form.titre);
      data.append("description",  form.description);
      data.append("typeLivrable", form.typeLivrable);
      data.append("file",         form.file);
      await deposerLivrable(data);
      flash("Livrable déposé ✓");
      closeForm();
      load();
    } catch (err) {
      setError(err?.response?.data?.error || "Erreur lors du dépôt.");
    } finally {
      setSubmitting(false);
    }
  };

  /* ── submit edit ──────────────────────────────────────── */
  const submitEdit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const data = new FormData();
      data.append("titre",        form.titre);
      data.append("description",  form.description);
      data.append("typeLivrable", form.typeLivrable);
      if (form.file) data.append("file", form.file);
      await updateLivrable(editId, data);
      flash("Livrable mis à jour ✓");
      closeForm();
      load();
    } catch (err) {
      setError(err?.response?.data?.error || "Erreur lors de la modification.");
    } finally {
      setSubmitting(false);
    }
  };

  /* ── delete ───────────────────────────────────────────── */
  const confirmDelete = async () => {
    try {
      await deleteLivrable(deleteId);
      setDeleteId(null);
      flash("Livrable supprimé.");
      load();
    } catch {
      setError("Impossible de supprimer.");
      setDeleteId(null);
    }
  };

  /* ── flash ────────────────────────────────────────────── */
  const flash = (msg) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(""), 3000);
  };

  /* ── render ───────────────────────────────────────────── */
  if (loading) return <Spinner />;

  const isEdit = mode === "edit";

  return (
    <div className="page-body">

      {/* header */}
      <div className="page-header">
        <div className="page-eyebrow">Mes travaux</div>
        <h1 className="page-title">Mes livrables</h1>
        <p className="page-sub">Déposez, modifiez et gérez vos documents de stage</p>
      </div>

      {error   && <Alert type="error"   message={error}   />}
      {success && <Alert type="success" message={success} />}

      {/* stats */}
      <div className="stats-grid" style={{ marginBottom: 24 }}>
        {[
          { label: "Total",         value: stats.total,        cls: "stat-accent"   },
          { label: "Rapports",      value: stats.rapport,      cls: ""              },
          { label: "Documents",     value: stats.document,     cls: "stat-warning"  },
          { label: "Présentations", value: stats.presentation, cls: "stat-success"  },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-label">{s.label}</div>
            <div className={`stat-value ${s.cls}`}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* CTA */}
      {mode === null && (
        <button
          className="btn btn-primary"
          style={{ width: "auto", marginBottom: 24 }}
          onClick={openCreate}
        >
          ➕ Déposer un livrable
        </button>
      )}

      {/* ── FORM (create ou edit) ─────────────────────── */}
      {mode !== null && (
        <div className="card" style={{ marginBottom: 24, borderColor: "var(--accent)", borderWidth: 1.5 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div className="card-title">
              {isEdit ? "✏️ Modifier le livrable" : "📤 Nouveau livrable"}
            </div>
            <button
              className="btn btn-sm btn-ghost"
              onClick={closeForm}
              style={{ padding: "6px 12px" }}
            >
              ✕ Annuler
            </button>
          </div>

          <form onSubmit={isEdit ? submitEdit : submitCreate}>

            {/* stage — seulement à la création */}
            {!isEdit && (
              <div className="form-group">
                <label className="form-label">Stage associé *</label>
                <select
                  className="form-input"
                  value={form.demandeId}
                  required
                  onChange={e => setForm({ ...form, demandeId: e.target.value })}
                >
                  <option value="">-- Sélectionner un stage validé --</option>
                  {demandes.length === 0 && <option disabled>Aucune demande validée</option>}
                  {demandes.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.titreProjet} — {d.entreprise}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="form-row-2" style={{ marginBottom: 16 }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Titre *</label>
                <input
                  className="form-input"
                  placeholder="Titre du livrable"
                  required
                  value={form.titre}
                  onChange={e => setForm({ ...form, titre: e.target.value })}
                />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Type</label>
                <select
                  className="form-input"
                  value={form.typeLivrable}
                  onChange={e => setForm({ ...form, typeLivrable: e.target.value })}
                >
                  <option value="RAPPORT">Rapport</option>
                  <option value="DOCUMENT">Document</option>
                  <option value="PRESENTATION">Présentation</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="form-input"
                rows={3}
                placeholder="Description (optionnelle)"
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Fichier {isEdit ? "(laisser vide pour conserver l'actuel)" : "*"}
              </label>
              <input
                type="file"
                className="form-input"
                required={!isEdit}
                onChange={e => setForm({ ...form, file: e.target.files[0] })}
              />
              {form.file && (
                <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 6 }}>
                  📎 {form.file.name} ({formatSize(form.file.size)})
                </p>
              )}
            </div>

            <button
              className="btn btn-primary"
              type="submit"
              disabled={submitting}
              style={{ marginTop: 4 }}
            >
              {submitting ? "⏳ Envoi…" : isEdit ? "💾 Enregistrer" : "📤 Déposer"}
            </button>
          </form>
        </div>
      )}

      {/* ── LISTE ──────────────────────────────────────── */}
      {livrables.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 24px", color: "var(--text-muted)" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
          <p style={{ fontSize: 16, fontWeight: 600, color: "var(--text-soft)", marginBottom: 6 }}>
            Aucun livrable déposé
          </p>
          <p style={{ fontSize: 13 }}>Commencez par déposer votre premier document.</p>
        </div>
      ) : (
        livrables.map(l => {
          const meta = TYPE_META[l.typeLivrable] || { label: l.typeLivrable, color: "var(--text-muted)", bg: "var(--dark-3)", border: "var(--border)" };
          const isBeingEdited = editId === l.id && mode === "edit";

          return (
            <div
              key={l.id}
              className="card"
              style={isBeingEdited ? { borderColor: "var(--accent)", borderWidth: 1.5 } : {}}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>

                {/* left */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                    <span style={{
                      padding: "3px 10px", borderRadius: 100, fontSize: 11, fontWeight: 700,
                      letterSpacing: ".05em", textTransform: "uppercase",
                      color: meta.color, background: meta.bg, border: `1px solid ${meta.border}`,
                    }}>
                      {meta.label}
                    </span>
                    <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                      🗓 {formatDate(l.createdAt)}
                    </span>
                  </div>

                  <div
                    className="card-title"
                    style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginBottom: 4 }}
                  >
                    {l.titre}
                  </div>

                  {l.description && (
                    <p style={{ fontSize: 13, color: "var(--text-soft)", marginBottom: 6, lineHeight: 1.5 }}>
                      {l.description}
                    </p>
                  )}

                  {l.nomFichier && (
                    <span style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "monospace" }}>
                      📎 {l.nomFichier}
                      {l.tailleFichier ? <span style={{ marginLeft: 6 }}>{formatSize(l.tailleFichier)}</span> : null}
                    </span>
                  )}
                </div>

                {/* actions */}
                <div style={{ display: "flex", gap: 8, flexShrink: 0, flexWrap: "wrap", justifyContent: "flex-end" }}>
                  <button
                    className="btn btn-sm btn-ghost"
                    onClick={() => navigate(`/livrables/${l.id}`)}
                  >
                    👁 Voir
                  </button>
                  <button
                    className="btn btn-sm btn-ghost"
                    onClick={() => openEdit(l)}
                    disabled={mode === "edit" && editId !== l.id}
                  >
                    ✏️ Modifier
                  </button>
                  <button
                    className="btn btn-sm btn-danger-ghost"
                    onClick={() => setDeleteId(l.id)}
                  >
                    🗑 Supprimer
                  </button>
                </div>

              </div>
            </div>
          );
        })
      )}

      {/* ── MODALE CONFIRMATION SUPPRESSION ────────────── */}
      {deleteId !== null && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(8,8,16,.8)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 200, padding: 24,
        }}>
          <div className="card" style={{ maxWidth: 400, width: "100%", margin: 0 }}>
            <div className="card-title" style={{ marginBottom: 10 }}>🗑 Supprimer ce livrable ?</div>
            <p style={{ fontSize: 14, color: "var(--text-soft)", marginBottom: 20 }}>
              Cette action est irréversible. Le fichier et tous les commentaires associés seront supprimés.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                className="btn btn-danger-ghost"
                style={{ flex: 1 }}
                onClick={confirmDelete}
              >
                Oui, supprimer
              </button>
              <button
                className="btn btn-ghost"
                style={{ flex: 1 }}
                onClick={() => setDeleteId(null)}
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
