import React, { useEffect, useState } from "react";
import { Spinner, Alert } from "../../components/UI";
import {
  getAllOffres,
  createOffre,
  updateOffre,
  toggleOffre,
  deleteOffre,
} from "../../services/stageService";
import { extractError } from "../../context/AuthContext";

export default function AdminOffres() {
  const [offres, setOffres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    titre: "",
    description: "",
    entreprise: "",
    lieu: "",
    dateDebut: "",
    dateFin: "",
    domaine: "",
    competencesRequises: "",
  });

  const [alert, setAlert] = useState({ type: "", msg: "" });

  /* ───── util ───── */

  const flash = (type, msg) => {
    setAlert({ type, msg });
    setTimeout(() => setAlert({ type: "", msg: "" }), 4000);
  };

  const resetForm = () => {
    setForm({
      titre: "",
      description: "",
      entreprise: "",
      lieu: "",
      dateDebut: "",
      dateFin: "",
      domaine: "",
      competencesRequises: "",
    });
    setEditingId(null);
  };

  /* ───── load ───── */

  const loadOffres = async () => {
    try {
      setLoading(true);
      setOffres(await getAllOffres());
    } catch (e) {
      flash("error", extractError(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOffres();
  }, []);

  /* ───── actions ───── */

  const edit = (o) => {
    setEditingId(o.id);
    setForm({
      titre: o.titre,
      description: o.description,
      entreprise: o.entreprise,
      lieu: o.lieu,
      dateDebut: o.dateDebut,
      dateFin: o.dateFin,
      domaine: o.domaine || "",
      competencesRequises: o.competencesRequises || "",
    });
  };

  const submit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateOffre(editingId, form);
        flash("success", "Offre modifiée");
      } else {
        await createOffre(form);
        flash("success", "Offre créée");
      }
      resetForm();
      loadOffres();
    } catch (e) {
      flash("error", extractError(e));
    }
  };

  const toggle = async (id) => {
    await toggleOffre(id);
    loadOffres();
  };

  const remove = async (id) => {
    if (window.confirm("Supprimer cette offre ?")) {
      await deleteOffre(id);
      loadOffres();
    }
  };

  /* ───── render ───── */

  if (loading) return <Spinner />;

  return (
    <div className="card">
      <h2 className="card-title">🏢 Offres de Stage</h2>

      {alert.msg && <Alert type={alert.type} message={alert.msg} />}

      {/* ───── FORMULAIRE ───── */}
      <form onSubmit={submit} className="form-grid">
        <input
          className="form-input"
          placeholder="Titre"
          value={form.titre}
          onChange={(e) => setForm({ ...form, titre: e.target.value })}
          required
        />

        <input
          className="form-input"
          placeholder="Entreprise"
          value={form.entreprise}
          onChange={(e) => setForm({ ...form, entreprise: e.target.value })}
          required
        />

        <input
          className="form-input"
          placeholder="Lieu"
          value={form.lieu}
          onChange={(e) => setForm({ ...form, lieu: e.target.value })}
          required
        />

        <input
          type="date"
          className="form-input"
          value={form.dateDebut}
          onChange={(e) => setForm({ ...form, dateDebut: e.target.value })}
          required
        />

        <input
          type="date"
          className="form-input"
          value={form.dateFin}
          onChange={(e) => setForm({ ...form, dateFin: e.target.value })}
          required
        />

        <textarea
          className="form-input"
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          required
        />

        <input
          className="form-input"
          placeholder="Domaine"
          value={form.domaine}
          onChange={(e) => setForm({ ...form, domaine: e.target.value })}
        />

        <input
          className="form-input"
          placeholder="Compétences requises"
          value={form.competencesRequises}
          onChange={(e) =>
            setForm({ ...form, competencesRequises: e.target.value })
          }
        />

        <button type="submit" className="btn btn-primary">
          {editingId ? "Modifier" : "Créer"}
        </button>

        {editingId && (
          <button
            type="button"
            className="btn btn-secondary"
            onClick={resetForm}
          >
            Annuler
          </button>
        )}
      </form>

      {/* ───── LISTE ───── */}
      <ul className="list">
        {offres.map((o) => (
          <li key={o.id} className="list-item">
            <span>
              <strong>{o.titre}</strong> — {o.entreprise}
            </span>

            <div style={{ display: "flex", gap: 8 }}>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => edit(o)}
              >
                ✏️
              </button>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => toggle(o.id)}
              >
                🔄
              </button>
              <button
                className="btn btn-danger btn-sm"
                onClick={() => remove(o.id)}
              >
                🗑️
              </button>
            </div>
          </li>
        ))}

        {offres.length === 0 && (
          <li style={{ color: "var(--text-muted)" }}>
            Aucune offre trouvée.
          </li>
        )}
      </ul>
    </div>
  );
}
