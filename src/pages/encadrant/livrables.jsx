import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Spinner, Alert } from "../../components/UI";
import { getLivrablesEncadrant, deleteLivrableEncadrant } from "../../services/stageService";

/* ── helpers ─────────────────────────────────────────────── */
function initials(name) {
  if (!name) return "?";
  const p = name.trim().split(" ");
  return (p[0][0] + (p[1] ? p[1][0] : "")).toUpperCase();
}
function formatSize(bytes) {
  if (!bytes) return "";
  if (bytes < 1048576) return Math.round(bytes / 1024) + " Ko";
  return (bytes / 1048576).toFixed(1) + " Mo";
}
function formatDate(d) {
  return new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}

const TYPE_META = {
  RAPPORT:      { label: "Rapport",      color: "var(--accent)",  bg: "#5b6ef518", border: "#5b6ef530" },
  DOCUMENT:     { label: "Document",     color: "var(--warning)", bg: "#f5a62312", border: "#f5a62330" },
  PRESENTATION: { label: "Présentation", color: "var(--success)", bg: "#22d3a012", border: "#22d3a030" },
};

/* ── component ───────────────────────────────────────────── */
export default function LivrablesEncadrant() {
  const [livrables, setLivrables]     = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState("");
  const [success, setSuccess]         = useState("");
  const [downloading, setDownloading] = useState(null);
  const [deleteId, setDeleteId]       = useState(null);

  const [search, setSearch]           = useState("");
  const [filterType, setFilterType]   = useState("");
  const [sortBy, setSortBy]           = useState("date-desc");

  const navigate = useNavigate();

  const load = () => {
    setLoading(true);
    setError("");
    getLivrablesEncadrant()
      .then(setLivrables)
      .catch(() => setError("Impossible de charger les livrables."))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const stats = useMemo(() => ({
    total:        livrables.length,
    rapport:      livrables.filter(l => l.typeLivrable === "RAPPORT").length,
    document:     livrables.filter(l => l.typeLivrable === "DOCUMENT").length,
    presentation: livrables.filter(l => l.typeLivrable === "PRESENTATION").length,
  }), [livrables]);

  const filtered = useMemo(() => {
    let out = [...livrables];
    if (search.trim()) {
      const q = search.toLowerCase();
      out = out.filter(l =>
        l.titre.toLowerCase().includes(q) ||
        (l.etudiantFullName || "").toLowerCase().includes(q)
      );
    }
    if (filterType) out = out.filter(l => l.typeLivrable === filterType);
    if (sortBy === "date-asc")  out.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    else if (sortBy === "az")   out.sort((a, b) => a.titre.localeCompare(b.titre));
    else                        out.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return out;
  }, [livrables, search, filterType, sortBy]);

  const handleDownload = async (l) => {
    setDownloading(l.id);
    try {
      const token  = localStorage.getItem("token");
      const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:8080/api";
      const res    = await fetch(`${apiUrl}/livrables/${l.id}/download`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url  = window.URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href = url; a.download = l.nomFichier || "fichier"; a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      setError("Impossible de télécharger le fichier.");
    } finally {
      setDownloading(null);
    }
  };

  const confirmDelete = async () => {
    try {
      await deleteLivrableEncadrant(deleteId);
      setDeleteId(null);
      setSuccess("Livrable supprimé.");
      setTimeout(() => setSuccess(""), 3000);
      load();
    } catch {
      setError("Impossible de supprimer.");
      setDeleteId(null);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="page-body">

      <div className="page-header">
        <div className="page-eyebrow">Supervision</div>
        <h1 className="page-title">Livrables des étudiants</h1>
        <p className="page-sub">Consultez, téléchargez et supprimez les travaux de vos stagiaires</p>
      </div>

      {error   && <Alert type="error"   message={error}   />}
      {success && <Alert type="success" message={success} />}

      {/* stats */}
      <div className="stats-grid" style={{ marginBottom: 24 }}>
        {[
          { label: "Total",         value: stats.total,        cls: "stat-accent"  },
          { label: "Rapports",      value: stats.rapport,      cls: ""             },
          { label: "Documents",     value: stats.document,     cls: "stat-warning" },
          { label: "Présentations", value: stats.presentation, cls: "stat-success" },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-label">{s.label}</div>
            <div className={`stat-value ${s.cls}`}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* toolbar */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 180 }}>
          <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }}>🔍</span>
          <input
            className="form-input"
            style={{ paddingLeft: 38, height: 42 }}
            placeholder="Rechercher par titre ou étudiant…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select className="form-input" style={{ width: "auto", height: 42 }} value={filterType} onChange={e => setFilterType(e.target.value)}>
          <option value="">Tous les types</option>
          <option value="RAPPORT">Rapport</option>
          <option value="DOCUMENT">Document</option>
          <option value="PRESENTATION">Présentation</option>
        </select>
        <select className="form-input" style={{ width: "auto", height: 42 }} value={sortBy} onChange={e => setSortBy(e.target.value)}>
          <option value="date-desc">Plus récent</option>
          <option value="date-asc">Plus ancien</option>
          <option value="az">A → Z</option>
        </select>
        <span style={{ padding: "6px 14px", background: "var(--dark-3)", border: "1px solid var(--border)", borderRadius: 100, fontSize: 12, color: "var(--text-muted)", whiteSpace: "nowrap" }}>
          {filtered.length} livrable{filtered.length > 1 ? "s" : ""}
        </span>
      </div>

      {/* list */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 24px", color: "var(--text-muted)" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
          <p style={{ fontSize: 16, fontWeight: 600, color: "var(--text-soft)", marginBottom: 6 }}>Aucun livrable trouvé</p>
          <p style={{ fontSize: 13 }}>Modifiez vos filtres ou attendez de nouveaux dépôts.</p>
        </div>
      ) : (
        filtered.map(l => {
          const meta = TYPE_META[l.typeLivrable] || { label: l.typeLivrable, color: "var(--text-muted)", bg: "var(--dark-3)", border: "var(--border)" };
          const isDl = downloading === l.id;
          return (
            <div key={l.id} className="card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>

                <div style={{ display: "flex", gap: 14, alignItems: "flex-start", flex: 1, minWidth: 0 }}>
                  {/* avatar */}
                  <div style={{
                    width: 36, height: 36, borderRadius: "var(--r-sm)", flexShrink: 0,
                    background: "linear-gradient(135deg, var(--accent), #22d3a0)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontWeight: 700, fontSize: 12, color: "#fff",
                  }}>
                    {initials(l.etudiantFullName || "E" + l.etudiantId)}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", marginBottom: 5 }}>
                      <span style={{ padding: "3px 10px", borderRadius: 100, fontSize: 11, fontWeight: 700, letterSpacing: ".05em", textTransform: "uppercase", color: meta.color, background: meta.bg, border: `1px solid ${meta.border}` }}>
                        {meta.label}
                      </span>
                      <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                        👨‍🎓 {l.etudiantFullName || `Étudiant #${l.etudiantId}`}
                      </span>
                    </div>
                    <div className="card-title" style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginBottom: 5 }}>
                      {l.titre}
                    </div>
                    <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                      {l.nomFichier && (
                        <span style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "monospace", maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          📎 {l.nomFichier}{l.tailleFichier ? <span style={{ marginLeft: 6 }}>{formatSize(l.tailleFichier)}</span> : null}
                        </span>
                      )}
                      <span style={{ fontSize: 12, color: "var(--text-muted)" }}>🗓 {formatDate(l.createdAt)}</span>
                    </div>
                  </div>
                </div>

                {/* actions : voir + télécharger + supprimer SEULEMENT */}
                <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                  <button className="btn btn-sm btn-ghost" disabled={isDl} onClick={() => handleDownload(l)} style={{ padding: "8px 12px" }} title="Télécharger">
                    {isDl ? "⏳" : "⬇"}
                  </button>
                  <button className="btn btn-sm btn-ghost" onClick={() => navigate(`/livrables/${l.id}`)}>
                    👁 Voir
                  </button>
                  <button className="btn btn-sm btn-danger-ghost" onClick={() => setDeleteId(l.id)} title="Supprimer">
                    🗑
                  </button>
                </div>

              </div>
            </div>
          );
        })
      )}

      {/* modale suppression */}
      {deleteId !== null && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(8,8,16,.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 24 }}>
          <div className="card" style={{ maxWidth: 400, width: "100%", margin: 0 }}>
            <div className="card-title" style={{ marginBottom: 10 }}>🗑 Supprimer ce livrable ?</div>
            <p style={{ fontSize: 14, color: "var(--text-soft)", marginBottom: 20 }}>
              Cette action est irréversible. Le fichier et tous les commentaires seront supprimés définitivement.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn btn-danger-ghost" style={{ flex: 1 }} onClick={confirmDelete}>Oui, supprimer</button>
              <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setDeleteId(null)}>Annuler</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
