<<<<<<< HEAD
// src/hooks/useSolicitudes.js
import { useState, useCallback, useRef } from "react";
import axios from "axios";

const API_BASE_URL = "http://localhost:8000"; // Ajusta según tu configuración
=======
import { useState, useCallback, useRef } from "react";
import axios from "axios";

const API_BASE_URL = "http://localhost:8000";
>>>>>>> 32565a7ac88048d5b222d8e75467d2c6482562f3

export default function useSolicitudes() {
  const [solicitudes, setSolicitudes] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filtros, setFiltros] = useState({});
  const limit = 10;

<<<<<<< HEAD
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
=======
  const isLoadingRef = useRef(false);
  const pageRef = useRef(page);
  const filtrosRef = useRef(filtros);

  pageRef.current = page;
  filtrosRef.current = filtros;

  const getAuthHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  });

  const fetchSolicitudes = useCallback(async (options = {}) => {
    if (isLoadingRef.current) {
      console.log("⚠️ Llamada duplicada evitada");
      return;
    }

    isLoadingRef.current = true;
    setCargando(true);
    setError(null);

    try {
      const currentPage = options.page ?? pageRef.current;
      const currentFiltros = options.filtros ?? filtrosRef.current;

      const params = new URLSearchParams({
        page: currentPage,
        limit: limit,
      });

      if (currentFiltros.estado) {
        params.append("estado", currentFiltros.estado);
      }
      if (currentFiltros.desde) {
        params.append("desde", currentFiltros.desde);
      }
      if (currentFiltros.hasta) {
        params.append("hasta", currentFiltros.hasta);
      }
      if (currentFiltros.montoMin) {
        params.append("montoMin", currentFiltros.montoMin);
      }
      if (currentFiltros.q) {
        params.append("q", currentFiltros.q);
      }

      const url = `${API_BASE_URL}/solicitudes/?${params.toString()}`;
      
      console.log("🔍 Fetching solicitudes:", url);

      const response = await axios.get(url, {
        headers: getAuthHeaders(),
      });

      console.log("✅ Response:", response.data);

      setSolicitudes(response.data.items || []);
      setTotal(response.data.total || 0);

    } catch (err) {
      console.error("❌ Error fetching solicitudes:", err);
      console.error("📄 Error details:", err.response?.data);
      
      const errorMsg = err?.response?.data?.detail || 
                       err?.response?.data?.message || 
                       err.message || 
                       "Error al cargar solicitudes";
      setError(errorMsg);
      setSolicitudes([]);
      setTotal(0);
    } finally {
      setCargando(false);
      isLoadingRef.current = false;
    }
  }, []);

  const createSolicitud = useCallback(async (solicitud) => {
    try {
      console.log("➕ Creating solicitud with data:", solicitud);
      
      const payload = {
        monto: parseInt(solicitud.monto, 10),
        plazo_meses: parseInt(solicitud.plazo_meses, 10),
      };
      
      console.log("📤 Payload to send:", payload);
      
      const response = await axios.post(
        `${API_BASE_URL}/solicitudes/`,
        payload,
        {
          headers: getAuthHeaders(),
        }
      );
      
      console.log("✅ Created successfully:", response.data);
      return response.data;
    } catch (err) {
      console.error("❌ Error creating solicitud:", err);
      console.error("📄 Error response:", err.response?.data);
      throw err;
    }
  }, []);

  const updateSolicitud = useCallback(async (id, solicitud) => {
    try {
      console.log("✏️ Updating solicitud:", id, solicitud);
      
      const payload = {
        monto: parseInt(solicitud.monto, 10),
        plazo_meses: parseInt(solicitud.plazo_meses, 10),
      };
      
      console.log("📤 Update payload:", payload);
      
      const response = await axios.put(
        `${API_BASE_URL}/solicitudes/${id}`,
        payload,
        {
          headers: getAuthHeaders(),
        }
      );
      
      console.log("✅ Updated successfully:", response.data);
      return response.data;
    } catch (err) {
      console.error("❌ Error updating solicitud:", err);
      console.error("📄 Error response:", err.response?.data);
>>>>>>> 32565a7ac88048d5b222d8e75467d2c6482562f3
      throw err;
    }
  }, []);

<<<<<<< HEAD
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
=======
  const changeEstado = useCallback(async (id, nuevoEstado, razon = undefined) => {
    try {
      console.log("🔄 Changing state:", { id, nuevoEstado, razon });
      
      const params = new URLSearchParams({ estado: nuevoEstado });
      if (razon) {
        params.append("razon", razon);
      }
      
      const response = await axios.patch(
        `${API_BASE_URL}/solicitudes/${id}/estado?${params.toString()}`,
        {},
        {
          headers: getAuthHeaders(),
        }
      );
      
      console.log("✅ State changed successfully:", response.data);
      return response.data;
    } catch (err) {
      console.error("❌ Error changing estado:", err);
      console.error("📄 Error response:", err.response?.data);
>>>>>>> 32565a7ac88048d5b222d8e75467d2c6482562f3
      throw err;
    }
  }, []);

<<<<<<< HEAD
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
=======
  const deleteSolicitud = useCallback(async (id) => {
    try {
      console.log("🗑️ Deleting solicitud:", id);
      
      const response = await axios.delete(
        `${API_BASE_URL}/solicitudes/${id}`,
        {
          headers: getAuthHeaders(),
        }
      );
      
      console.log("✅ Deleted successfully:", response.data);
      
      // Actualizar la lista localmente eliminando el item
      setSolicitudes(prev => prev.filter(s => s.id !== id));
      setTotal(prev => Math.max(0, prev - 1));
      
      return response.data;
    } catch (err) {
      console.error("❌ Error deleting solicitud:", err);
      console.error("📄 Error response:", err.response?.data);
      
      const errorMsg = err?.response?.data?.detail || 
                       err?.response?.data?.message || 
                       err.message || 
                       "Error al eliminar la solicitud";
      throw new Error(errorMsg);
    }
  }, []);
>>>>>>> 32565a7ac88048d5b222d8e75467d2c6482562f3

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