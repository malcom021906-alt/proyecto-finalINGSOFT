// src/hooks/useSolicitudes.js
import { useState, useCallback, useRef } from "react";
import axios from "axios";

const API_BASE_URL = "http://localhost:8000"; // Ajusta según tu configuración

export default function useSolicitudes() {
  const [solicitudes, setSolicitudes] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filtros, setFiltros] = useState({});
  const limit = 10;

  // Ref para evitar llamadas duplicadas
  const isLoadingRef = useRef(false);

  // Agregar la barra final a la URL para evitar redirects
  const fetchSolicitudes = useCallback(async (options = {}) => {
    // Evitar llamadas duplicadas
    if (isLoadingRef.current) {
      console.log("Llamada duplicada evitada");
      return;
    }

    isLoadingRef.current = true;
    setCargando(true);
    setError(null);

    try {
      const currentPage = options.page || page;
      const currentFiltros = options.filtros || filtros;

      // Construir query params
      const params = new URLSearchParams({
        page: currentPage,
        limit: limit,
      });

      // Agregar filtros si existen
      if (currentFiltros.estado) params.append("estado", currentFiltros.estado);
      if (currentFiltros.desde) params.append("desde", currentFiltros.desde);
      if (currentFiltros.hasta) params.append("hasta", currentFiltros.hasta);
      if (currentFiltros.montoMin) params.append("montoMin", currentFiltros.montoMin);
      if (currentFiltros.q) params.append("q", currentFiltros.q);

      // IMPORTANTE: Agregar la barra final para evitar el redirect 307
      const url = `${API_BASE_URL}/solicitudes/?${params.toString()}`;
      
      console.log("Fetching solicitudes:", url);

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      console.log("Response:", response.data);

      // Actualizar estado con los datos
      setSolicitudes(response.data.items || []);
      setTotal(response.data.total || 0);

    } catch (err) {
      console.error("Error fetching solicitudes:", err);
      const errorMsg = err?.response?.data?.message || err.message || "Error al cargar solicitudes";
      setError(errorMsg);
      setSolicitudes([]);
      setTotal(0);
    } finally {
      setCargando(false);
      isLoadingRef.current = false;
    }
  }, [page, filtros, limit]);

  // Crear solicitud
  const createSolicitud = useCallback(async (solicitud) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/solicitudes/`, // Con barra final
        solicitud,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      return response.data;
    } catch (err) {
      console.error("Error creating solicitud:", err);
      throw err;
    }
  }, []);

  // Actualizar solicitud
  const updateSolicitud = useCallback(async (id, solicitud) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/solicitudes/${id}`, // Sin barra final para este caso
        solicitud,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      return response.data;
    } catch (err) {
      console.error("Error updating solicitud:", err);
      throw err;
    }
  }, []);

  // Cambiar estado
  const changeEstado = useCallback(async (id, nuevoEstado, razon = undefined) => {
    try {
      const response = await axios.patch(
        `${API_BASE_URL}/solicitudes/${id}/estado`,
        { estado: nuevoEstado, razon },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      return response.data;
    } catch (err) {
      console.error("Error changing estado:", err);
      throw err;
    }
  }, []);

  // Eliminar solicitud (lógico)
  const deleteSolicitud = useCallback(async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/solicitudes/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      // Refrescar lista después de eliminar
      await fetchSolicitudes();
    } catch (err) {
      console.error("Error deleting solicitud:", err);
      throw err;
    }
  }, [fetchSolicitudes]);

  return {
    solicitudes,
    cargando,
    error,
    total,
    page,
    limit,
    fetchSolicitudes,
    setFiltros,
    setPage,
    deleteSolicitud,
    changeEstado,
    createSolicitud,
    updateSolicitud,
  };
}