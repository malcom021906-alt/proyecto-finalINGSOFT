import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/register.css";
import { registerRequest } from "../services/auth";

export default function Register() {
  const navigate = useNavigate();

  // Estados para los campos del formulario
  const [formData, setFormData] = useState({
    nombre: "",
    correo: "",
    contraseña: "",
    confirmPassword: "",
    telefono: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.contraseña !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);
    try {
      // Llamada real al backend
      await registerRequest({
        nombre: formData.nombre,
        correo: formData.correo,
        contraseña: formData.contraseña,
        telefono: formData.telefono || "N/A",
      });

      alert("Cuenta creada exitosamente 🎉");
      navigate("/login");
    } catch (err) {
  console.error("Error en registro:", err.response?.data);

  const backendError = err.response?.data?.detail;

  // Si detail es un array, tomamos el primer mensaje legible
  if (Array.isArray(backendError) && backendError.length > 0) {
    setError(backendError[0].msg || "Error al registrar el usuario.");
  } else if (typeof backendError === "string") {
    setError(backendError);
  } else {
    setError("Error al registrar el usuario.");
  }
  } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-left">
        <div className="circle"></div>
        <h1>NEO CDT</h1>
      </div>

      <div className="register-right">
        <div className="register-box">
          <h2>Create Account</h2>

          <form onSubmit={handleSubmit}>
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="nombre"
              placeholder="Enter your full name"
              value={formData.nombre}
              onChange={handleChange}
              required
            />

            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="correo"
              placeholder="Enter your email"
              value={formData.correo}
              onChange={handleChange}
              required
            />

            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="contraseña"
              placeholder="Create a password"
              value={formData.contraseña}
              onChange={handleChange}
              required
            />

            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              placeholder="Re-enter your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />

            <label htmlFor="telefono">Phone</label>
            <input
              type="text"
              id="telefono"
              placeholder="Enter your phone number"
              value={formData.telefono}
              onChange={handleChange}
            />

            {error && <p style={{ color: "crimson" }}>{error}</p>}

            <button type="submit" className="register-btn" disabled={loading}>
              {loading ? "Creating..." : "Sign up"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
