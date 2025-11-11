import React, { createContext, useContext, useEffect, useState } from "react";
import { loginRequest, meRequest } from "../services/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setInitializing(false);
      return;
    }
    meRequest()
      .then(setUser)
      .catch((err) => {
        console.error("Auth init error:", err.message);
        setError("Error loading user session");
        localStorage.removeItem("token");
        setUser(null);
      })
      .finally(() => setInitializing(false));
  }, []);

  const login = async (email, password) => {
  try {
    const me = await loginRequest(email, password);
    const yo = await meRequest();
    console.log("🧩 Usuario cargado desde /auth/me:", yo);
    setUser(me);
    setUser(me);
    setError(null);
    return me; // importante: devolvemos el usuario con rol
  } catch (err) {
    console.error("Login error:", err.message);
    setError("Invalid credentials");
    throw err;
  }
};


  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setError(null);
  };

  return (
    <AuthContext.Provider value={{ user, initializing, login, logout, error }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}