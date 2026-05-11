import { useEffect, useState } from "react";
import { Alert } from "../../components/UI";
import {
  getMesDemandes,
  getEncadrants,
  choisirEncadrant,
  soumettreDemande,
} from "../../services/stageService";

const STATUS_BADGE = {
  EN_ATTENTE: { label: "En attente ⏳", cls: "badge-warning" },
  VALIDEE:    { label: "Validée ✓",     cls: "badge-success" },
  REJETEE:    { label: "Rejetée ✗",     cls: "badge-danger"  },
};

export default function MesDemandes() {
  const [demandes, setDemandes] = useState([]);
  const [encadrants, setEncadrants] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    titreProjet: "", descriptionProjet: "",
    domaine: "", niveau: "", lieu: "",
    entreprise: "", imageFile: null,
  });

  const apiUrl =
    (process.env.REACT_APP_API_URL || "http://localhost:8080")
      .replace(/\/$/, "");

  const load = async () => {
    try {
      const [demandesData, encadrantsData] = await Promise.all([
        getMesDemandes(),
        getEncadrants(),
      ]);
      setDemandes(demandesData);
      setEncadrants(encadrantsData.filter((enc) => enc.disponible));
    } catch {
      setError("Impossible de charger les données.");
    }
  };

  useEffect(() => { load(); }, []);

  const resetForm = () => setForm({
    titreProjet: "", descriptionProjet: "",
    domaine: "", niveau: "", lieu: "",
    entreprise: "", imageFile: null,
  });

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await soumettreDemande(form);
      setSuccess("Demande soumise avec succès ✓");
      setShowForm(false);
      resetForm();
      setTimeout(() => setSuccess(""), 3000);
      await load();
    } catch {
      setError("Erreur lors de la soumission.");
    }
  };

  const handleChoisirEncadrant = async (demandeId, encadrantId) => {
    if (!encadrantId) return;
    setError("");
    try {
      await choisirEncadrant(demandeId, Number(encadrantId));
      setSuccess("Encadrant choisi ✓");
      setTimeout(() => setSuccess(""), 3000);
      load();
    } catch {
      setError("Impossible de choisir cet encadrant.");
    }
  };

  return (
    <div className="page-body">

      {error && <Alert type="error" message={error} />}
      {success && <Alert type="success" message={success} />}

      <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
        ➕ Nouvelle demande
      </button>

      {showForm && (
        <form className="card" onSubmit={submit} style={{ marginTop: 16 }}>
          <input className="form-input" placeholder="Titre du projet" required
            value={form.titreProjet}
            onChange={(e) => setForm({ ...form, titreProjet: e.target.value })} />

          <textarea className="form-input" placeholder="Description du projet" required
            value={form.descriptionProjet}
            onChange={(e) => setForm({ ...form, descriptionProjet: e.target.value })} />

          <input className="form-input" placeholder="Domaine"
            value={form.domaine}
            onChange={(e) => setForm({ ...form, domaine: e.target.value })} />

          <input className="form-input" placeholder="Niveau"
            value={form.niveau}
            onChange={(e) => setForm({ ...form, niveau: e.target.value })} />

          <input className="form-input" placeholder="Lieu"
            value={form.lieu}
            onChange={(e) => setForm({ ...form, lieu: e.target.value })} />

          <input className="form-input" placeholder="Entreprise"
            value={form.entreprise}
            onChange={(e) => setForm({ ...form, entreprise: e.target.value })} />

          <input type="file" className="form-input"
            onChange={(e) => setForm({ ...form, imageFile: e.target.files[0] })} />

          <button className="btn btn-primary">Envoyer</button>
        </form>
      )}

      {demandes.map((d) => (
        <div key={d.id} className="card">

          <div className="card-title">{d.titreProjet}</div>

          {/* ✅ FIX FINAL */}
          {d.imageDemandeUrl && (
            <a
              href={`${apiUrl}/files/${d.imageDemandeUrl}`}
              target="_blank"
              rel="noreferrer"
              className="btn btn-ghost btn-sm"
              style={{ marginTop: 10 }}
            >
              📎 Voir le document joint
            </a>
          )}

        </div>
      ))}
    </div>
  );
}