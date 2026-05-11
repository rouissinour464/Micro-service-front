import { createContext, useContext, useState, useCallback } from "react";
import {
  loginUser,
  registerAdmin,
  getProfile,
  updateProfile,
  createUser,
} from "../services/authService";

const AuthContext = createContext(null);

// ✅ extractError — affiche les vrais messages backend
export const extractError = (err) => {
  const data = err?.response?.data;
  if (!data) return "Une erreur est survenue.";

  if (data.error) return data.error;       // ex: email déjà utilisé
  if (data.message) return data.message;
  if (data.details) return Object.values(data.details).join(" • ");

  return "Une erreur est survenue.";
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      localStorage.clear();
      return null;
    }
  });

  const normalizeRole = (role) =>
    role?.startsWith("ROLE_") ? role.replace("ROLE_", "") : role;

  // ✅ LOGIN
  const login = useCallback(async ({ email, password }) => {
    const res = await loginUser({ email, password });

    if (!res?.token) {
      throw new Error("Identifiants invalides.");
    }

    const cleanRole = normalizeRole(res.role);

    localStorage.setItem("token", res.token);
    localStorage.setItem("role", cleanRole);

    const profile = await getProfile();
    profile.role = cleanRole;

    localStorage.setItem("user", JSON.stringify(profile));
    setUser(profile);

    return profile;
  }, []);

  // ✅ REGISTER ADMIN
  const registerAdminAction = useCallback(async (payload) => {
    const res = await registerAdmin(payload);

    if (!res?.token) {
      throw new Error("Erreur lors de la création du compte.");
    }

    const cleanRole = normalizeRole(res.role);

    localStorage.setItem("token", res.token);
    localStorage.setItem("role", cleanRole);

    const profile = await getProfile();
    profile.role = cleanRole;

    localStorage.setItem("user", JSON.stringify(profile));
    setUser(profile);

    return profile;
  }, []);

  // ✅ GET / RELOAD PROFILE
  const reloadProfile = useCallback(async () => {
    const profile = await getProfile();
    profile.role = normalizeRole(profile.role);

    localStorage.setItem("user", JSON.stringify(profile));
    setUser(profile);

    return profile;
  }, []);

  // ✅ UPDATE PROFILE
  const updateProfileAction = useCallback(async (data) => {
    const updated = await updateProfile(data);
    updated.role = normalizeRole(updated.role);

    localStorage.setItem("user", JSON.stringify(updated));
    setUser(updated);

    return updated;
  }, []);

  // ✅ CREATE USER (teacher / student)
  const createUserAction = useCallback(async (data) => {
    return await createUser(data);
  }, []);

  // ✅ LOGOUT
  const logout = useCallback(() => {
    localStorage.clear();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        registerAdmin: registerAdminAction,
        getProfile: reloadProfile,
        updateProfile: updateProfileAction,
        createUser: createUserAction,
        reloadProfile,
        extractError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ✅ Hook sécurisé
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return ctx;
};