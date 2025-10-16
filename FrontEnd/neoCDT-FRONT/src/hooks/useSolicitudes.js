// src/hooks/useSolicitudes.js
import { useReducer, useCallback } from "react";
import api from "../services/api";

/*
  Estado inicial y reducer que controla:
  - solicitudes (array)
  - cargando (boolean)
  - error (string|null)
  - total (número total para paginación)
  - page, limit (paginación)
  - filtros (objeto con los filtros)
*/

const initialState = {
  solicitudes: [],
  cargando: false,
  error: null,
  total: 0,
  page: 1,
  limit: 10,
   filtros: { estado: "", desde: "", hasta: "", montoMin: "", q: "" }, // q = búsqueda libre
   offline: false, // si no hay backend, trabajamos con localStorage
};

function reducer(state, action) {
  switch (action.type) {
    case "FETCH_START":
      return { ...state, cargando: true, error: null };
    case "FETCH_SUCCESS":
      // payload: { items: [], total: N }
      return {
        ...state,
        cargando: false,
        solicitudes: action.payload.items,
        total: action.payload.total,
      };
    case "FETCH_ERROR":
      return { ...state, cargando: false, error: action.payload };
    case "SET_LOADING":
      return { ...state, cargando: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload };
    case "SET_PAGE":
      return { ...state, page: action.payload };
    case "SET_LIMIT":
      return { ...state, limit: action.payload };
      case "SET_OFFLINE":
        return { ...state, offline: action.payload };
    case "SET_FILTROS":
      // al cambiar filtros reseteamos la página a 1
      return { ...state, filtros: { ...state.filtros, ...action.payload }, page: 1 };
    case "ADD_ITEM":
      // crear: añadimos al inicio de la lista
      return { ...state, solicitudes: [action.payload, ...state.solicitudes] };
    case "UPDATE_ITEM":
      // update: reemplazamos el elemento por id
      return {
        ...state,
        solicitudes: state.solicitudes.map((s) =>
          s.id === action.payload.id ? action.payload : s
        ),
      };
    case "REMOVE_ITEM":
      // delete lógico: eliminamos de la vista (backend debería marcarlo como cancelado)
      return { ...state, solicitudes: state.solicitudes.filter((s) => s.id !== action.payload) };
    default:
      return state;
  }
}

export default function useSolicitudes() {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Función para construir y limpiar params para la petición
  const buildParams = (overrides = {}) => {
    const params = {
      page: overrides.page ?? state.page,
      limit: overrides.limit ?? state.limit,
      ...state.filtros,
      ...(overrides.filtros || {}),
    };

      // Helpers para modo offline (localStorage)
      const LOCAL_KEY = "neoCDT_solicitudes";
      const loadLocal = () => {
        try {
          const raw = localStorage.getItem(LOCAL_KEY);
          if (!raw) return [];
          return JSON.parse(raw);
        } catch (e) {
          console.warn("No se pudo leer localStorage:", e);
          return [];
        }
      };
      const saveLocal = (items) => {
        try {
          localStorage.setItem(LOCAL_KEY, JSON.stringify(items));
        } catch (e) {
          console.warn("No se pudo guardar en localStorage:", e);
        }
      };

      const applyFiltersClient = (items, params) => {
        let res = items.slice();
        if (params.estado) res = res.filter((s) => s.estado === params.estado);
        if (params.montoMin != null && params.montoMin !== "") res = res.filter((s) => Number(s.monto) >= Number(params.montoMin));
        if (params.desde) res = res.filter((s) => new Date(s.fechaCreacion) >= new Date(params.desde));
        if (params.hasta) res = res.filter((s) => new Date(s.fechaCreacion) <= new Date(params.hasta));
        if (params.q) {
          const q = String(params.q).toLowerCase();
          res = res.filter((s) => String(s.id).includes(q) || String(s.monto).includes(q) || (s.clienteNombre && s.clienteNombre.toLowerCase().includes(q)) );
        }
        return res;
      };
    // eliminar claves vacías para no enviar filtros vacíos
    Object.keys(params).forEach((k) => {
      if (params[k] === "" || params[k] == null) delete params[k];
    });
    return params;
  };

  // ===== LISTAR (READ) =====
  const fetchSolicitudes = useCallback(
    async (overrides = {}) => {
      dispatch({ type: "FETCH_START" });
      try {
        const params = buildParams(overrides);
        // axios soporta 'params' que convierte a query string
        const res = await api.get("/solicitudes", { params });
        const data = res.data;

        // El backend puede devolver { items, total } o un array.
        if (Array.isArray(data)) {
          dispatch({ type: "FETCH_SUCCESS", payload: { items: data, total: data.length } });
        } else {
          dispatch({
            type: "FETCH_SUCCESS",
            payload: { items: data.items || [], total: data.total ?? 0 },
          });
        }
      } catch (err) {
          // Si hay error de red (no response) o timeout, entramos en modo offline y usamos localStorage
          if (!err.response || err.code === "ECONNABORTED" || /timeout/i.test(err.message) || /Network Error/i.test(err.message)) {
            console.warn("Falling back to offline mode for solicitudes:", err.message || err);
            const params = buildParams(overrides);
            const items = loadLocal();
            const filtered = applyFiltersClient(items, params);
            dispatch({ type: "SET_OFFLINE", payload: true });
            dispatch({ type: "FETCH_SUCCESS", payload: { items: filtered.slice(0, params.limit || state.limit), total: filtered.length } });
            return;
          }

          // err.response?.data?.message si el backend manda ese formato
          const message = err?.response?.data?.message || err.message || "Error desconocido";
          dispatch({ type: "FETCH_ERROR", payload: message });
      }
    },
    // dependencias: si cambian page/limit/filtros se re-creará la función
    [state.page, state.limit, state.filtros]
  );

  // ===== CREATE =====
  const createSolicitud = async (payload) => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      // Asegurar estado por defecto en payload si no viene del form
      const body = { ...payload, estado: payload.estado || "En validación" };
      const res = await api.post("/solicitudes", body);
      const created = res.data || body; // si el backend no devuelve, usamos body
      dispatch({ type: "ADD_ITEM", payload: created });
      dispatch({ type: "SET_ERROR", payload: null });
      return created;
    } catch (err) {
        // fallback offline
        if (!err.response || err.code === "ECONNABORTED" || /timeout/i.test(err.message) || /Network Error/i.test(err.message)) {
          const items = loadLocal();
          const id = Date.now();
          const created = { id, ...body, fechaCreacion: new Date().toISOString() };
          const next = [created, ...items];
          saveLocal(next);
          dispatch({ type: "SET_OFFLINE", payload: true });
          dispatch({ type: "ADD_ITEM", payload: created });
          dispatch({ type: "SET_ERROR", payload: null });
          return created;
        }

        const message = err?.response?.data?.message || err.message || "Error creando solicitud";
        dispatch({ type: "SET_ERROR", payload: message });
        throw err;
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  // ===== UPDATE =====
  const updateSolicitud = async (id, payload) => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const res = await api.put(`/solicitudes/${id}`, payload);
      const updated = res.data;
      dispatch({ type: "UPDATE_ITEM", payload: updated });
      dispatch({ type: "SET_ERROR", payload: null });
      return updated;
    } catch (err) {
        // fallback offline: actualizar en localStorage
        if (!err.response || err.code === "ECONNABORTED" || /timeout/i.test(err.message) || /Network Error/i.test(err.message)) {
          const items = loadLocal();
          const next = items.map((s) => (s.id === id ? { ...s, ...payload } : s));
          saveLocal(next);
          const updated = next.find((s) => s.id === id);
          dispatch({ type: "SET_OFFLINE", payload: true });
          dispatch({ type: "UPDATE_ITEM", payload: updated });
          dispatch({ type: "SET_ERROR", payload: null });
          return updated;
        }

        const message = err?.response?.data?.message || err.message || "Error actualizando solicitud";
        dispatch({ type: "SET_ERROR", payload: message });
        throw err;
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
    };

  // ===== CHANGE STATE / DELETE (lógico) =====
  const changeEstado = async (id, nuevoEstado, razon) => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const res = await api.patch(`/solicitudes/${id}/state`, { estado: nuevoEstado, razon });
      const updated = res.data;
      dispatch({ type: "UPDATE_ITEM", payload: updated });
      dispatch({ type: "SET_ERROR", payload: null });
      return updated;
    } catch (err) {
        // fallback offline
        if (!err.response || err.code === "ECONNABORTED" || /timeout/i.test(err.message) || /Network Error/i.test(err.message)) {
          const items = loadLocal();
          const next = items.map((s) => (s.id === id ? { ...s, estado: nuevoEstado, razon } : s));
          saveLocal(next);
          const updated = next.find((s) => s.id === id);
          dispatch({ type: "SET_OFFLINE", payload: true });
          dispatch({ type: "UPDATE_ITEM", payload: updated });
          dispatch({ type: "SET_ERROR", payload: null });
          return updated;
        }

        const message = err?.response?.data?.message || err.message || "Error cambiando estado";
        dispatch({ type: "SET_ERROR", payload: message });
        throw err;
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  // Borrar de la vista (si backend hace borrado lógico, este endpoint marcaría como cancelado)
  const deleteSolicitud = async (id) => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      await api.delete(`/solicitudes/${id}`);
      dispatch({ type: "REMOVE_ITEM", payload: id });
      dispatch({ type: "SET_ERROR", payload: null });
    } catch (err) {
        // fallback offline
        if (!err.response || err.code === "ECONNABORTED" || /timeout/i.test(err.message) || /Network Error/i.test(err.message)) {
          const items = loadLocal();
          const next = items.filter((s) => s.id !== id);
          saveLocal(next);
          dispatch({ type: "SET_OFFLINE", payload: true });
          dispatch({ type: "REMOVE_ITEM", payload: id });
          dispatch({ type: "SET_ERROR", payload: null });
          return;
        }

        const message = err?.response?.data?.message || err.message || "Error eliminando solicitud";
        dispatch({ type: "SET_ERROR", payload: message });
        throw err;
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  // setters para paginación / filtros expuestos al componente
  const setPage = (p) => dispatch({ type: "SET_PAGE", payload: p });
  const setLimit = (l) => dispatch({ type: "SET_LIMIT", payload: l });
  const setFiltros = (f) => dispatch({ type: "SET_FILTROS", payload: f });

  return {
    // estado
    solicitudes: state.solicitudes,
    cargando: state.cargando,
    error: state.error,
    total: state.total,
    page: state.page,
    limit: state.limit,
    filtros: state.filtros,
    // acciones
    fetchSolicitudes,
    createSolicitud,
    updateSolicitud,
    changeEstado,
    deleteSolicitud,
    setPage,
    setLimit,
    setFiltros,
  };
}
