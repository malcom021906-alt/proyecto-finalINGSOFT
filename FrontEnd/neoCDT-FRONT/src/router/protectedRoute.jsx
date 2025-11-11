import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/authContext"; // <- IMPORTACIÓN CORRECTA (named)

export default function ProtectedRoute({ allowedRoles}) {
  const { user, initializing } = useAuth();

  if (initializing) return <div style={{ padding: 24 }}>Cargando…</div>;
  if (!user) return <Navigate to="/login" replace />;

    // Restringir por rol si se especifica
  if (Array.isArray(allowedRoles) && allowedRoles.length > 0) {
    if (!allowedRoles.includes(user.rol)) {
      return <Navigate to="/" replace />;
    }
  }

  return <Outlet />;
}
