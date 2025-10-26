import React from "react";
import { Routes, Route} from "react-router-dom";

import HomeScreen from "./components/homescreen";
import Login from "./components/login";
import Register from "./components/register";
import ForgotPassword from "./components/forgotPassword";
import SolicitudesPage from "./pages/SolicitudesPage";
import ProtectedRoute from "./router/protectedroute";



export default function App() {
  return (
    <Routes>
      {/* Redirige la raíz a HomeScreen */}
      <Route path="/" element={<HomeScreen />} />,

      {/* Rutas públicas */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Rutas privadas */}
      <Route element={<ProtectedRoute />}>
        <Route path="/solicitudes" element={<SolicitudesPage />} />
      </Route>

      {/* Página no encontrada */}
      <Route path="*" element={<div style={{ padding: 24 }}>404</div>} />
    </Routes>
  );
}
