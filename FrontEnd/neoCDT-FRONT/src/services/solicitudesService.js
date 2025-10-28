// src/services/solicitudesService.js
import axios from "axios";

const API_BASE_URL = "http://localhost:8000/solicitudes";

// --- Función auxiliar para incluir token ---
function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return {
    Authorization: `Bearer ${token}`,
  };
}

// --- Servicio principal de solicitudes ---
const solicitudesService = {
  /**
   * Obtener todas las solicitudes con paginación y filtros
   * @param {Object} params - filtros opcionales
   * @param {number} params.page - página actual
   * @param {number} params.limit - cantidad por página
   * @param {string} params.estado - estado (Borrador, En validación, etc)
   * @param {string} params.desde - fecha ISO inicial
   * @param {string} params.hasta - fecha ISO final
   * @param {number} params.montoMin - monto mínimo
   * @param {string} params.q - búsqueda de texto
   */
  async getSolicitudes(params = {}) {
    try {
      const query = new URLSearchParams();

      if (params.page) query.append("page", params.page);
      if (params.limit) query.append("limit", params.limit);
      if (params.estado) query.append("estado", params.estado);
      if (params.desde) query.append("desde", params.desde);
      if (params.hasta) query.append("hasta", params.hasta);
      if (params.montoMin) query.append("montoMin", params.montoMin);
      if (params.q) query.append("q", params.q);

      const response = await axios.get(`${API_BASE_URL}/?${query.toString()}`, {
        headers: getAuthHeaders(),
      });

      return response.data; // { items: [], total, page, limit }
    } catch (error) {
      console.error("❌ Error al obtener solicitudes:", error.response?.data || error.message);
      throw error.response?.data || { detail: "Error al cargar solicitudes" };
    }
  },

  /**
   * Crear nueva solicitud (POST /solicitudes)
   */
  async crearSolicitud(data) {
    try {
      const payload = {
        monto: parseInt(data.monto, 10),
        plazo_meses: parseInt(data.plazo_meses, 10),
      };

      const response = await axios.post(`${API_BASE_URL}/`, payload, {
        headers: getAuthHeaders(),
      });

      return response.data;
    } catch (error) {
      console.error("❌ Error al crear solicitud:", error.response?.data || error.message);
      throw error.response?.data || { detail: "Error al crear solicitud" };
    }
  },

  /**
   * Actualizar una solicitud existente (PUT /solicitudes/{id})
   */
  async actualizarSolicitud(id, data) {
    try {
      const payload = {
        monto: parseInt(data.monto, 10),
        plazo_meses: parseInt(data.plazo_meses, 10),
      };

      const response = await axios.put(`${API_BASE_URL}/${id}`, payload, {
        headers: getAuthHeaders(),
      });

      return response.data;
    } catch (error) {
      console.error("❌ Error al actualizar solicitud:", error.response?.data || error.message);
      throw error.response?.data || { detail: "Error al actualizar solicitud" };
    }
  },

  /**
   * Cambiar el estado de una solicitud (PATCH /solicitudes/{id}/estado)
   * Ejemplo: estado = "en_validacion" o "cancelada"
   */
  async cambiarEstado(id, estado, razon = null) {
    try {
      const params = new URLSearchParams({ estado });
      if (razon) params.append("razon", razon);

      const response = await axios.patch(
        `${API_BASE_URL}/${id}/estado?${params.toString()}`,
        {},
        { headers: getAuthHeaders() }
      );

      return response.data;
    } catch (error) {
      console.error("❌ Error al cambiar estado:", error.response?.data || error.message);
      throw error.response?.data || { detail: "Error al cambiar estado" };
    }
  },

  /**
   * Eliminar solicitud (DELETE /solicitudes/{id})
   */
  async eliminarSolicitud(id) {
    try {
      const response = await axios.delete(`${API_BASE_URL}/${id}`, {
        headers: getAuthHeaders(),
      });

      return response.data;
    } catch (error) {
      console.error("❌ Error al eliminar solicitud:", error.response?.data || error.message);
      throw error.response?.data || { detail: "Error al eliminar solicitud" };
    }
  },
};

export default solicitudesService;
