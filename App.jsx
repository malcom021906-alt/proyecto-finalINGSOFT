import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Estilos (ruta ./styles/ en este proyecto)
import "./styles/global.css";
import "./styles/table.css";
import "./styles/form.css";
import "./styles/modal.css";
import "./styles/filterbar.css";

// Componentes y páginas
import HomeScreen from "./components/homescreen";
import Login from "./components/login";
import SolicitudesPage from "./pages/SolicitudesPage";

export default function App() {
  return (
    <Routes>
      {/* Página principal */}
      <Route path="/" element={<HomeScreen />} />

      {/* Login */}
      <Route path="/login" element={<Login />} />

      {/* Lista de solicitudes */}
      <Route path="/solicitudes" element={<SolicitudesPage />} />

      {/* Ruta comodín: redirige a la raíz */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
