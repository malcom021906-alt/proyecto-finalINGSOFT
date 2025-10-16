// src/services/api.js
import axios from "axios";

/*
  Configuración global de axios para la app.
  - baseURL: toma la variable Vite VITE_API_BASE_URL si existe, si no usa localhost:4000/api
  - timeout: 8s por defecto
  - interceptors.request: añade Authorization si hay token en localStorage
  - interceptors.response: captura 401 para dos acciones comunes (logout/redirect)
*/

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api",
  timeout: 8000,
});

// Interceptor de petición: adjunta JWT (si existe)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // asumimos que login guarda token aquí
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`; // header Authorization
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor de respuesta: manejo básico de errores globales
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Si recibimos 401 --> sesión expirada o token inválido
    if (error.response?.status === 401) {
      console.warn("401 recibido: podría redirigirse al login o limpiar token.");
      // ejemplo (opcional): localStorage.removeItem("token"); window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
