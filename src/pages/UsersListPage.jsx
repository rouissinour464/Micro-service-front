import React, { useEffect, useState } from "react";
import {
  getUsers,
  searchUsers,
  updateUser,
  deleteUser,
} from "../services/usersService";
import { Alert, Spinner } from "../components/UI";
import { extractError } from "../context/AuthContext";

export default function UsersListPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState("");
  const [alert, setAlert] = useState({ type: "", msg: "" });

  const [editingId, setEditingId] = useState(null);
  const [showPass, setShowPass] = useState(false);

  const [editForm, setEditForm] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  // ── Charger les utilisateurs (sans ADMIN) ───────────
  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await getUsers();
      setUsers(data.filter((u) => u.role !== "ROLE_ADMIN"));
    } catch (e) {
      setAlert({ type: "error", msg: extractError(e) });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // ── Recherche ───────────────────────────────────────
  const onSearch = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const data = keyword
        ? await searchUsers(keyword)
        : await getUsers();

      setUsers(data.filter((u) => u.role !== "ROLE_ADMIN"));
    } catch (e) {
      setAlert({ type: "error", msg: extractError(e) });
    } finally {
      setLoading(false);
    }
  };

  // ── Supprimer ───────────────────────────────────────
  const onDelete = async (id) => {
    if (!window.confirm("Supprimer cet utilisateur ?")) return;
    try {
      await deleteUser(id);
      setUsers(users.filter((u) => u.id !== id));
    } catch (e) {
      setAlert({ type: "error", msg: extractError(e) });
    }
  };

  // ── Activer édition ─────────────────────────────────
  const startEdit = (u) => {
    setEditingId(u.id);
    setShowPass(false);
    setEditForm({
      fullName: u.fullName,
      email: u.email,
      password: "",
    });
  };

  // ── Enregistrer modification ───────────────────────
  const saveEdit = async (id) => {
    try {
      const payload = {
        fullName: editForm.fullName,
        email: editForm.email,
        password: editForm.password || null,
      };

      const updated = await updateUser(id, payload);
      setUsers(users.map((u) => (u.id === id ? updated : u)));
      setEditingId(null);
      setEditForm({ fullName: "", email: "", password: "" });
    } catch (e) {
      setAlert({ type: "error", msg: extractError(e) });
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-icon">📄</div>
        <div>
          <div className="card-title">Liste des comptes</div>
          <div className="card-subtitle">
            {users.length} utilisateur(s)
          </div>
        </div>
      </div>

      {alert.msg && <Alert type={alert.type} message={alert.msg} />}

      {/* Recherche */}
      <form onSubmit={onSearch} style={{ marginBottom: 16 }}>
        <input
          className="form-input"
          placeholder="Rechercher par nom ou email"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
      </form>

      {loading ? (
        <Spinner />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {users.map((u) => (
            <div
              key={u.id}
              style={{
                background: "var(--dark-2)",
                borderRadius: "var(--r-md)",
                padding: 16,
              }}
            >
              {editingId === u.id ? (
                // ── MODE ÉDITION ──────────────────────
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <input
                    className="form-input"
                    placeholder="Nom complet"
                    value={editForm.fullName}
                    onChange={(e) =>
                      setEditForm({ ...editForm, fullName: e.target.value })
                    }
                  />

                  <input
                    className="form-input"
                    placeholder="Email"
                    value={editForm.email}
                    onChange={(e) =>
                      setEditForm({ ...editForm, email: e.target.value })
                    }
                  />

                  {/* Mot de passe avec toggle */}
                  <div style={{ position: "relative", minWidth: 240 }}>
                    <input
                      className="form-input"
                      type={showPass ? "text" : "password"}
                      placeholder="Nouveau mot de passe (optionnel)"
                      value={editForm.password}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          password: e.target.value,
                        })
                      }
                      style={{ paddingRight: 44 }}
                    />

                    <button
                      type="button"
                      onClick={() => setShowPass((s) => !s)}
                      style={{
                        position: "absolute",
                        right: 12,
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "var(--text-muted)",
                      }}
                      title={
                        showPass
                          ? "Masquer le mot de passe"
                          : "Afficher le mot de passe"
                      }
                    >
                      {showPass ? "🙈" : "👁"}
                    </button>
                  </div>

                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => saveEdit(u.id)}
                  >
                    💾
                  </button>

                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => setEditingId(null)}
                  >
                    ✖
                  </button>
                </div>
              ) : (
                // ── MODE AFFICHAGE ───────────────────
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600 }}>{u.fullName}</div>
                    <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
                      {u.email}
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => startEdit(u)}
                    >
                      ✏
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => onDelete(u.id)}
                    >
                      🗑
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}