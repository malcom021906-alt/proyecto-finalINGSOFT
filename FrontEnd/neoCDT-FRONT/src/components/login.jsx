// src/components/login.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/authContext";
import "../css/login.css";

export default function Login() {
  const navigate = useNavigate();
  const { login, error: contextError } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState("");

 const handleSubmit = async (e) => {
  e.preventDefault();
  setLocalError("");
  setLoading(true);
  try {
    const me = await login(email, password);
    if (me?.rol === "administrador") {
      navigate("/agente");
    } else {
      navigate("/solicitudes");
    }
  } catch (err) {
  console.error("Error en el login:", err); // ✅ registrar el error
  setLocalError(
    err?.message || "Credenciales inválidas. Verifica tu correo y contraseña."
  );
} finally {
  setLoading(false);
}
};




  return (
    <div className="login-container">
      <div className="login-left">
        <div className="logo">
          <div className="logo-circle"></div>
          <h1>NEO CDT</h1>
        </div>
      </div>
      <div className="login-right">
        <div className="form-container">
          <h2>Sign in</h2>
          <form onSubmit={handleSubmit}>
            <label>Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="username"
            />
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
            {(localError || contextError) && <p style={{ color: "crimson", marginTop: 8 }}>{localError || contextError}</p>}
            <p className="forgot-password">
              <Link to="/forgot-password">Forgot password?</Link>
            </p>
            <button type="submit" className="btn-login" disabled={loading}>
              {loading ? "Ingresando..." : "Sign in"}
            </button>
            <p className="signup-text">
              Don't have an account? <Link to="/register">Sign up</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}