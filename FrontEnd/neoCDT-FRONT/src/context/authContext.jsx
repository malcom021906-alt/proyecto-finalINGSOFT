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
      const tokenData = await loginRequest(email, password);
      localStorage.setItem("token", tokenData.access_token);
      const me = await meRequest();
      setUser(me);
      setError(null);
      return me;
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