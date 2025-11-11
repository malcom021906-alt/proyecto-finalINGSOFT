/**
 * 🏦 SERVICIO DE SOLICITUDES CDT - AGENTE
 * 
 * Maneja todas las llamadas al backend de FastAPI
 * para operaciones relacionadas con solicitudes CDT
 * específicas para agentes bancarios
 */

// ===============================
// 🔧 CONFIGURACIÓN
// ===============================
const API_BASE_URL = "http://localhost:8000";

/**
 * Obtener el token de autenticación del localStorage
 */
const getAuthToken = () => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("No hay sesión activa. Por favor, inicia sesión.");
  }
  return token;
};

/**
 * Configuración base para fetch con autenticación
 */
const getFetchConfig = (method = "GET", body = null) => {
  const config = {
    method,
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${getAuthToken()}`,
    },
  };

  if (body && (method === "POST" || method === "PUT" || method === "PATCH")) {
    config.body = JSON.stringify(body);
  }

  return config;
};

/**
 * Manejador de errores HTTP
 */
const handleResponse = async (response) => {
  if (!response.ok) {
    let errorMessage = "Error en la petición";
    
    try {
      const errorData = await response.json();
      errorMessage = errorData.detail || errorData.message || errorMessage;
    } catch {
      errorMessage = `Error ${response.status}: ${response.statusText}`;
    }

    const error = new Error(errorMessage);
    error.status = response.status;
    error.detail = errorMessage;
    throw error;
  }

  // Si la respuesta es 204 No Content, retornar objeto vacío
  if (response.status === 204) {
    return {};
  }

  return response.json();
};

// ===============================
// 🏦 OPERACIONES PARA AGENTES
// ===============================

/**
 * Obtener solicitudes pendientes de validación (solo para agentes)
 * @returns {Promise<Array>}
 */
const getSolicitudesPendientes = async () => {
  try {
    const url = `${API_BASE_URL}/solicitudes/agente/pendientes`;
    
    console.log("🔍 Fetching solicitudes from:", url);
    
    const response = await fetch(url, getFetchConfig("GET"));
    const data = await handleResponse(response);
    
    console.log("✅ Data received:", data);
    
    // Verificar si data es un array
    if (!Array.isArray(data)) {
      console.error("❌ Response is not an array:", data);
      return [];
    }
    
    // Transformar datos del backend al formato esperado en el frontend
    const transformedData = data.map(solicitud => {
      console.log("🔄 Transforming solicitud:", solicitud);
      
      return {
        id: solicitud.id,
        cliente_nombre: solicitud.usuario_id, // Temporal, hasta tener nombre real
        usuario_id: solicitud.usuario_id,
        monto: solicitud.monto,
        plazo_dias: solicitud.plazo_meses * 30, // Convertir meses a días
        plazo_meses: solicitud.plazo_meses,
        tasa_interes: solicitud.tasa,
        tasa: solicitud.tasa,
        estado: mapEstadoBackendToFrontend(solicitud.estado),
        fecha_creacion: solicitud.fechaCreacion,
        fecha: solicitud.fechaCreacion,
        fechaCreacion: solicitud.fechaCreacion,
        fechaActualizacion: solicitud.fechaActualizacion,
        historial: solicitud.historial || []
      };
    });
    
    console.log("✅ Transformed data:", transformedData);
    
    return transformedData;
  } catch (error) {
    console.error("❌ Error al obtener solicitudes pendientes:", error);
    console.error("Error details:", {
      message: error.message,
      status: error.status,
      detail: error.detail
    });
    throw error;
  }
};

/**
 * Aprobar una solicitud CDT (solo para agentes)
 * @param {string} solicitudId - ID de la solicitud
 * @returns {Promise<Object>}
 */
const aprobarSolicitud = async (solicitudId) => {
  try {
    const url = `${API_BASE_URL}/solicitudes/agente/${solicitudId}/aprobar`;
    
    console.log("✅ Aprobando solicitud:", solicitudId);
    
    const response = await fetch(url, getFetchConfig("PUT"));
    const data = await handleResponse(response);
    
    console.log("✅ Solicitud aprobada:", data);
    
    return data;
  } catch (error) {
    console.error("❌ Error al aprobar solicitud:", error);
    throw error;
  }
};

/**
 * Rechazar una solicitud CDT con motivo (solo para agentes)
 * @param {string} solicitudId - ID de la solicitud
 * @param {string} motivo - Motivo del rechazo
 * @returns {Promise<Object>}
 */
const rechazarSolicitud = async (solicitudId, motivo) => {
  try {
    const url = `${API_BASE_URL}/solicitudes/agente/${solicitudId}/rechazar`;
    const body = { motivo };
    
    console.log("❌ Rechazando solicitud:", solicitudId, "Motivo:", motivo);
    
    const response = await fetch(url, getFetchConfig("PUT", body));
    const data = await handleResponse(response);
    
    console.log("✅ Solicitud rechazada:", data);
    
    return data;
  } catch (error) {
    console.error("❌ Error al rechazar solicitud:", error);
    throw error;
  }
};

// ===============================
// 🔄 FUNCIONES AUXILIARES
// ===============================

/**
 * Mapear estados del backend (snake_case) al frontend (capitalizado)
 * @param {string} estadoBackend - Estado en formato backend
 * @returns {string} Estado en formato frontend
 */
const mapEstadoBackendToFrontend = (estadoBackend) => {
  const mapeo = {
    "borrador": "Borrador",
    "en_validacion": "En validación",
    "aprobada": "Aprobada",
    "rechazada": "Rechazada",
    "cancelada": "Cancelada",
    "enviada": "Enviada"
  };
  return mapeo[estadoBackend] || estadoBackend;
};

/**
 * Mapear estados del frontend al backend
 * @param {string} estadoFrontend - Estado en formato frontend
 * @returns {string} Estado en formato backend
 */
const mapEstadoFrontendToBackend = (estadoFrontend) => {
  const mapeo = {
    "Borrador": "borrador",
    "En validación": "en_validacion",
    "Aprobada": "aprobada",
    "Rechazada": "rechazada",
    "Cancelada": "cancelada",
    "Enviada": "enviada"
  };
  return mapeo[estadoFrontend] || estadoFrontend.toLowerCase().replace(" ", "_");
};

// ===============================
// 📤 EXPORTAR SERVICIO
// ===============================
const agenteService = {
  // Operaciones para agentes
  getSolicitudesPendientes,
  aprobarSolicitud,
  rechazarSolicitud,
  
  // Utilidades
  mapEstadoBackendToFrontend,
  mapEstadoFrontendToBackend,
};

export default agenteService;