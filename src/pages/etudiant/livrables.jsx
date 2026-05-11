import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Spinner, Alert } from "../../components/UI";
import {
  getMesLivrables,
  deleteLivrable,
  deposerLivrable,
  getMesDemandes,
} from "../../services/stageService";

export default function Livrables() {
  const [livrables, setLivrables] = useState([]);
  const [demandes, setDemandes]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [error, setError]         = useState("");
  const [success, setSuccess]     = useState("");
  const navigate = useNavigate();

  const [form, setForm] = useState({
    titre: "", description: "",
    typeLivrable: "RAPPORT", demandeId: "", file: null,
  });

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const [l, d] = await Promise.all([getMesLivrables(), getMesDemandes()]);
      setLivrables(l);
      setDemandes(d.filter((dem) => dem.status === "VALIDEE"));
    } catch {
      setError("Impossible de charger les données.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.demandeId) { setError("Sélectionnez un stage validé."); return; }
    if (!form.file)      { setError("Joignez un fichier."); return; }

    try {
      const data = new FormData();
      data.append("demandeId",    form.demandeId);
      data.append("titre",        form.titre);
      data.append("description",  form.description);
      data.append("typeLivrable", form.typeLivrable);
      data.append("file",         form.file);

      await deposerLivrable(data);
      setSuccess("Livrable déposé ✓");
      setShowForm(false);
      setForm({ titre:"", description:"", typeLivrable:"RAPPORT", demandeId:"", file:null });
      setTimeout(() => setSuccess(""), 3000);
      load();
    } catch (e) {
      setError(e?.response?.data?.error || "Erreur lors du dépôt.");
    }
  };

  const supprimer = async (id) => {
    if (!window.confirm("Supprimer ce livrable ?")) return;
    try {
      await deleteLivrable(id);
      load();
    } catch {
      setError("Impossible de supprimer.");
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="page-body">
      <div className="page-header">
        <div className="page-eyebrow">Livrables</div>
        <h1 className="page-title">Mes livrables</h1>
      </div>

      {error   && <Alert type="error"   message={error}   />}
      {success && <Alert type="success" message={success} />}

      <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
        ➕ Déposer un livrable
      </button>

      {showForm && (
        <form className="card" onSubmit={submit} style={{ marginTop:20 }}>
          <select className="form-input" value={form.demandeId} required style={{ marginTop:12 }}
            onChange={(e) => setForm({ ...form, demandeId: e.target.value })}>
            <option value="">-- Sélectionner un stage --</option>
            {demandes.length === 0 && <option disabled>Aucune demande validée</option>}
            {demandes.map((d) => (
              <option key={d.id} value={d.id}>
                {d.titreProjet} ({d.entreprise})
              </option>
            ))}
          </select>

          <input className="form-input" placeholder="Titre" required
            value={form.titre} style={{ marginTop:12 }}
            onChange={(e) => setForm({ ...form, titre: e.target.value })} />

          <textarea className="form-input" rows={3} placeholder="Description"
            value={form.description} style={{ marginTop:12 }}
            onChange={(e) => setForm({ ...form, description: e.target.value })} />

          <select className="form-input" value={form.typeLivrable} style={{ marginTop:12 }}
            onChange={(e) => setForm({ ...form, typeLivrable: e.target.value })}>
            <option value="RAPPORT">Rapport</option>
            <option value="DOCUMENT">Document</option>
            <option value="PRESENTATION">Présentation</option>
          </select>

          <input type="file" className="form-input" required style={{ marginTop:12 }}
            onChange={(e) => setForm({ ...form, file: e.target.files[0] })} />

          <button className="btn btn-primary" type="submit" style={{ marginTop:12 }}>
            Envoyer
          </button>
        </form>
      )}

      {livrables.length === 0 ? (
        <p style={{ color:"var(--text-muted)", marginTop:20 }}>Aucun livrable déposé.</p>
      ) : (
        livrables.map((l) => (
          <div key={l.id} className="card">
            <div className="card-title">{l.titre}</div>
            <div className="card-subtitle">
              {l.typeLivrable} · {new Date(l.createdAt).toLocaleDateString("fr-FR")}
            </div>
            <div style={{ display:"flex", gap:8, marginTop:12 }}>
              <button className="btn btn-sm btn-ghost"
                onClick={() => navigate(`/livrables/${l.id}`)}>
                👁 Voir
              </button>
              <button className="btn btn-danger-ghost" onClick={() => supprimer(l.id)}>
                🗑 Supprimer
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}