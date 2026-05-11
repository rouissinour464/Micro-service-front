import React, { useEffect, useState } from "react";
import { getAllDemandes, validerDemande } from "../../services/stageService";
import { Alert, Spinner } from "../../components/UI";
import { extractError } from "../../context/AuthContext";

const STATUS_BADGE = {
  EN_ATTENTE: { label: "En attente ⏳", cls: "badge-warning" },
  VALIDEE:    { label: "Validée ✓",     cls: "badge-success" },
  REJETEE:    { label: "Rejetée ✗",     cls: "badge-danger"  },
};

export default function AdminDemandes() {
  const [demandes, setDemandes]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [alert, setAlert]               = useState({ type: "", msg: "" });
  const [rejectId, setRejectId]         = useState(null);
  const [rejectComment, setRejectComment] = useState("");

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

  useEffect(() => { load(); }, []);

  const handleValider = async (id) => {
    try {
      await validerDemande(id, { status: "VALIDEE", commentaire: "" });
      flash("success", "Demande validée ✓");
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
      await validerDemande(rejectId, { status: "REJETEE", commentaire: rejectComment });
      flash("success", "Demande rejetée.");
      setRejectId(null);
      setRejectComment("");
      load();
    } catch (e) {
      flash("error", extractError(e));
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="page-body">
      <div className="card">
        <h2 className="card-title">📝 Demandes de stage</h2>
        {alert.msg && <Alert type={alert.type} message={alert.msg} />}

        {rejectId && (
          <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)",
                        display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000 }}>
            <div className="card" style={{ width:420, padding:24 }}>
              <h3 style={{ marginBottom:16 }}>❌ Motif du rejet</h3>
              <textarea
                className="form-input"
                rows={4}
                placeholder="Expliquez pourquoi cette demande est rejetée..."
                value={rejectComment}
                onChange={(e) => setRejectComment(e.target.value)}
                style={{ marginBottom:12 }}
              />
              <div style={{ display:"flex", gap:8 }}>
                <button className="btn btn-danger" onClick={handleRejeter}>Confirmer</button>
                <button className="btn btn-ghost" onClick={() => { setRejectId(null); setRejectComment(""); }}>
                  Annuler
                </button>
              </div>
            </div>
          </div>
        )}

        {demandes.length === 0 ? (
          <p style={{ textAlign:"center", padding:32, color:"var(--text-muted)" }}>Aucune demande.</p>
        ) : (
          demandes.map((d) => (
            <div key={d.id} className="card-item"
                 style={{ flexDirection:"column", alignItems:"flex-start", gap:10 }}>

              <div style={{ display:"flex", justifyContent:"space-between", width:"100%" }}>
                <div>
                  <div className="item-title">{d.titreProjet}</div>
                  <div className="item-sub">
                    {d.entreprise} · {d.etudiantNom || `Étudiant #${d.etudiantId}`}
                  </div>
                </div>
                <span className={`badge ${STATUS_BADGE[d.status]?.cls}`}>
                  {STATUS_BADGE[d.status]?.label}
                </span>
              </div>

              {d.imageDemandeUrl && (
                <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                  <span style={{ fontSize:13, color:"var(--text-muted)" }}>📄 Document :</span>

                  {/* 🔥 FIX ICI */}
                  <a
                    href={`${process.env.REACT_APP_API_URL.replace(/\/$/, "")}/files/${d.imageDemandeUrl}`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-ghost btn-sm"
                  >
                    👁 Voir
                  </a>
                </div>
              )}

              {d.commentaireAdmin && (
                <div style={{ background:"#fff3cd", padding:"6px 10px", borderRadius:6, fontSize:13 }}>
                  💬 {d.commentaireAdmin}
                </div>
              )}

              {d.status === "EN_ATTENTE" && (
                <div style={{ display:"flex", gap:8 }}>
                  <button className="btn btn-success btn-sm" onClick={() => handleValider(d.id)}>
                    ✅ Accepter
                  </button>
                  <button className="btn btn-danger btn-sm" onClick={() => setRejectId(d.id)}>
                    ❌ Refuser
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}