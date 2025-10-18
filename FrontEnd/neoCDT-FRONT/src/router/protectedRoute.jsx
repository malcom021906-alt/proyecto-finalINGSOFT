import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/authContext"; // <- IMPORTACIÓN CORRECTA (named)

export default function ProtectedRoute() {
  const { user, initializing } = useAuth();

  if (initializing) return <div style={{ padding: 24 }}>Cargando…</div>;
  if (!user) return <Navigate to="/login" replace />;

  return <Outlet />;
}
