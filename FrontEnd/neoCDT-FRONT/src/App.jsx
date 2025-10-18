import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import HomeScreen from "./components/homescreen";
import Login from "./components/login";
import Register from "./components/register";
import ForgotPassword from "./components/forgotPassword";
import SolicitudesPage from "./pages/SolicitudesPage";
import ProtectedRoute from "./router/protectedroute";

import "./css/global.css";
import "./css/table.css";
import "./css/form.css";
import "./css/modal.css";
import "./css/filterbar.css";

export default function App() {
  return (
    <Routes>
      {/* Redirige la raíz según sesión */}
      <Route path="/" element={<Navigate to="/solicitudes" replace />} />

      {/* Públicas */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Privadas */}
      <Route element={<ProtectedRoute />}>
        <Route path="/solicitudes" element={<SolicitudesPage />} />
        <Route path="/home" element={<HomeScreen />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<div style={{ padding: 24 }}>404</div>} />
    </Routes>
  );
}
