import React, { useEffect, useState } from "react";
import {
  planifierSoutenance,
  getAllSoutenances,
  deleteSoutenance,
  getUsersByRole,
} from "../../services/stageService";
import { Alert, Spinner } from "../../components/UI";
import { extractError } from "../../context/AuthContext";

const EMPTY_FORM = {
  etudiantId:  "",
  encadrantId: "",
  rapporteurId:"",
  presidentId: "",
  dateHeure:   "",
  salle:       "",
};

export default function AdminSoutenances() {
  const [list, setList]           = useState([]);
  const [etudiants, setEtudiants] = useState([]);
  const [enseignants, setEnseignants] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [alert, setAlert]         = useState({ type:"", msg:"" });
  const [form, setForm]           = useState(EMPTY_FORM);

  const flash = (type, msg) => {
    setAlert({ type, msg });
    setTimeout(() => setAlert({ type:"", msg:"" }), 4000);
  };

  const load = async () => {
    try {
      setLoading(true);
      const [s, etu, ens] = await Promise.all([
        getAllSoutenances(),
        getUsersByRole("ETUDIANT"),
        getUsersByRole("ENSEIGNANT"),
      ]);
      setList(s);
      setEtudiants(etu);
      setEnseignants(ens);
    } catch (e) {
      flash("error", extractError(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    const { etudiantId, encadrantId, rapporteurId, presidentId, dateHeure, salle } = form;

    if (!etudiantId || !encadrantId || !rapporteurId || !presidentId || !dateHeure || !salle) {
      flash("error", "Tous les champs sont obligatoires.");
      return;
    }
    if (encadrantId === rapporteurId || encadrantId === presidentId || rapporteurId === presidentId) {
      flash("error", "Les membres du jury doivent être différents.");
      return;
    }

    try {
      await planifierSoutenance({
        etudiantId:   Number(etudiantId),
        encadrantId:  Number(encadrantId),
        rapporteurId: Number(rapporteurId),
        presidentId:  Number(presidentId),
        dateHeure,
        salle,
      });
      flash("success", "✅ Soutenance planifiée");
      setForm(EMPTY_FORM);
      load();
    } catch (e) {
      flash("error", extractError(e));
    }
  };

  if (loading) return <Spinner />;

  return (
    <>
      {/* FORMULAIRE */}
      <div className="card">
        <h2 className="card-title">🎤 Planifier une soutenance</h2>
        {alert.msg && <Alert type={alert.type} message={alert.msg} />}

        <form onSubmit={submit} className="form-grid">
          {/* ✅ Controlled selects with value prop */}
          <select className="form-input" value={form.etudiantId}
            onChange={(e) => setForm({ ...form, etudiantId: e.target.value })}>
            <option value="">👨‍🎓 Étudiant</option>
            {etudiants.map((u) => (
              <option key={u.id} value={u.id}>{u.fullName}</option>
            ))}
          </select>

          <select className="form-input" value={form.encadrantId}
            onChange={(e) => setForm({ ...form, encadrantId: e.target.value })}>
            <option value="">👨‍🏫 Encadrant</option>
            {enseignants.map((u) => (
              <option key={u.id} value={u.id}>{u.fullName}</option>
            ))}
          </select>

          <select className="form-input" value={form.rapporteurId}
            onChange={(e) => setForm({ ...form, rapporteurId: e.target.value })}>
            <option value="">📋 Rapporteur</option>
            {enseignants.map((u) => (
              <option key={u.id} value={u.id}>{u.fullName}</option>
            ))}
          </select>

          <select className="form-input" value={form.presidentId}
            onChange={(e) => setForm({ ...form, presidentId: e.target.value })}>
            <option value="">👑 Président</option>
            {enseignants.map((u) => (
              <option key={u.id} value={u.id}>{u.fullName}</option>
            ))}
          </select>

          <input type="datetime-local" className="form-input" value={form.dateHeure}
            onChange={(e) => setForm({ ...form, dateHeure: e.target.value })} />

          <input className="form-input" placeholder="Salle" value={form.salle}
            onChange={(e) => setForm({ ...form, salle: e.target.value })} />

          <button className="btn btn-primary" type="submit">Planifier</button>
        </form>
      </div>

      {/* LISTE */}
      <div className="card">
        <h2 className="card-title">📋 Soutenances planifiées</h2>

        {list.length === 0 ? (
          <p style={{ textAlign:"center", color:"var(--text-muted)", padding:20 }}>
            Aucune soutenance planifiée.
          </p>
        ) : (
          list.map((s) => (
            <div key={s.id} className="card-item">
              <div style={{ width:"100%" }}>
                {/* ✅ Shows full names from SoutenanceResponse */}
                <div><b>🎓 Étudiant :</b>   {s.etudiantNom   || `User #${s.etudiantId}`}</div>
                <div><b>👨‍🏫 Encadrant :</b>  {s.encadrantNom  || `User #${s.encadrantId}`}</div>
                <div><b>📋 Rapporteur :</b>  {s.rapporteurNom || `User #${s.rapporteurId}`}</div>
                <div><b>👑 Président :</b>   {s.presidentNom  || `User #${s.presidentId}`}</div>
                <div style={{ marginTop:6 }}>
                  📅 {new Date(s.dateHeure).toLocaleString("fr-FR")} — 🏛 {s.salle}
                </div>
              </div>
              <button
                className="btn btn-danger btn-sm"
                onClick={() => deleteSoutenance(s.id).then(load)}
              >
                Supprimer
              </button>
            </div>
          ))
        )}
      </div>
    </>
  );
}
