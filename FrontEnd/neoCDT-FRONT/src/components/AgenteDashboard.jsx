import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import FilterBar from "./FilterBar";
import AgentSolicitudesTable from "./AgentSolicitudesTable";
import ModalAprobarAgent from "./ModalAprobarAgent";
import ModalRechazarAgent from "./ModalRechazarAgent";
import HistorialModal from "./HistorialModal";
import { exportToCSV, exportToPDF } from "../utils/exportUtils";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import solicitudesService from "../services/solicitudesService";
import { mockSolicitudes, mockAgentes } from "../mocks/agenteMocks";
import "../css/agenteDashboard.css";

// Vista principal del panel de agente.
// Reutiliza componentes específicos para el agente creados en /src/components
export default function AgenteDashboard() {
  const [solicitudes, setSolicitudes] = useState([]);
  const [agentes, setAgentes] = useState(mockAgentes || []);
  const [loading, setLoading] = useState(true);

  // Filtros controlados
  const [filters, setFilters] = useState({ estado: "", montoMin: "", montoMax: "", fechaDesde: "", fechaHasta: "" });

  // Estados para modales
  const [openAprobar, setOpenAprobar] = useState(false);
  const [openRechazar, setOpenRechazar] = useState(false);
  const [openHist, setOpenHist] = useState(false);
  const [selected, setSelected] = useState(null);

  // Navegación
  const navigate = useNavigate();

  // Cerrar sesión
  const handleLogout = () => {
    if (window.confirm("¿Deseas cerrar sesión?")) {
      localStorage.removeItem("token");
      navigate("/login");
    }
  };

  // Exportar
  const handleExportCSV = async () => {
    try {
      await exportToCSV(filtered, "solicitudes_cdt");
      toast.success("Archivo CSV exportado correctamente");
    } catch (err) {
      toast.error("Error al exportar CSV");
      console.error(err);
    }
  };

  const handleExportPDF = async () => {
    try {
      await exportToPDF(filtered, "solicitudes_cdt");
      toast.success("Archivo PDF exportado correctamente");
    } catch (err) {
      toast.error("Error al exportar PDF");
      console.error(err);
    }
  };

  // Cargar solicitudes (intentamos backend, si falla usamos mocks)
  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const data = await solicitudesService.getSolicitudes({ limit: 200 });
        if (!mounted) return;
        // data puede contener { items, total }
        const items = data?.items ?? data ?? [];
        setSolicitudes(items);
      } catch (err) {
        // fallback a mock
        console.warn("No se pudo cargar solicitudes desde API, usando mocks.", err?.message || err);
        setSolicitudes(mockSolicitudes);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => (mounted = false);
  }, []);

  // Aplicar filtros
  const filtered = useMemo(() => {
    return solicitudes.filter((s) => {
      // estado
      if (filters.estado && String(s.estado).toLowerCase() !== String(filters.estado).toLowerCase()) return false;
      // monto
      if (filters.montoMin !== "" && Number(s.monto) < Number(filters.montoMin)) return false;
      if (filters.montoMax !== "" && Number(s.monto) > Number(filters.montoMax)) return false;
      // fecha (comparamos YYYY-MM-DD)
      if (filters.fechaDesde && String(s.fecha_creacion ?? s.fecha ?? s.fechaCreacion).slice(0, 10) < filters.fechaDesde) return false;
      if (filters.fechaHasta && String(s.fecha_creacion ?? s.fecha ?? s.fechaCreacion).slice(0, 10) > filters.fechaHasta) return false;
      return true;
    });
  }, [solicitudes, filters]);

  // Acciones: aprobar
  function handleOpenAprobar(solicitud) {
    setSelected(solicitud);
    setOpenAprobar(true);
  }
  async function handleConfirmAprobar() {
    const id = selected?.id;
    // Guardar snapshot para rollback
    const snapshot = solicitudes.slice();
    // Actualización optimista en UI
    setSolicitudes((prev) => prev.map((p) => (p.id === id ? { ...p, estado: "Aprobada", historial: [...(p.historial || []), { fecha: new Date().toISOString(), usuario: "agente", accion: "Aprobada" }] } : p)));
    setOpenAprobar(false);
    try {
      await solicitudesService.cambiarEstado(id, "aprobada");
      toast.success('Solicitud aprobada');
    } catch (err) {
      // rollback
      setSolicitudes(snapshot);
      toast.error('Error al aprobar en servidor. Cambios revertidos');
      console.error(err);
    }
  }

  // Acciones: rechazar
  function handleOpenRechazar(solicitud) {
    setSelected(solicitud);
    setOpenRechazar(true);
  }
  async function handleConfirmRechazar(motivo) {
    const id = selected?.id;
    const snapshot = solicitudes.slice();
    setSolicitudes((prev) => prev.map((p) => (p.id === id ? { ...p, estado: "Rechazada", historial: [...(p.historial || []), { fecha: new Date().toISOString(), usuario: "agente", accion: `Rechazada: ${motivo}` }] } : p)));
    setOpenRechazar(false);
    try {
      await solicitudesService.cambiarEstado(id, "rechazada", motivo);
      toast.success('Solicitud rechazada');
    } catch (err) {
      setSolicitudes(snapshot);
      toast.error('Error al rechazar en servidor. Cambios revertidos');
      console.error(err);
    }
  }

  // Asignar agente (UI local)
  function handleAssign(solicitudId, agenteId) {
    setSolicitudes((prev) => prev.map((p) => (p.id === solicitudId ? { ...p, asignado: agenteId, historial: [...(p.historial || []), { fecha: new Date().toISOString(), usuario: "agente", accion: `Asignada a ${agenteId}` }] } : p)));
  }

  function handleOpenHist(s) {
    setSelected(s);
    setOpenHist(true);
  }

  return (
    <div className="agente-container">
      {/* Toasts */}
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
      {/* Sidebar */}
      <div className="agente-sidebar">
        <div className="agente-sidebar-logo">
          <div className="agente-logo-circle"></div>
          <div className="agente-logo-text">
            <span>CDT</span>
            <span>BANKING</span>
          </div>
        </div>
        
        <nav className="agente-sidebar-nav">
          <div className="agente-nav-item active">
            <span className="agente-nav-icon">🏠</span>
            <span>Dashboard</span>
          </div>
          <div className="agente-nav-item">
            <span className="agente-nav-icon">⚙️</span>
            <span>Configuración</span>
          </div>
        </nav>
      </div>

      {/* Contenido Principal */}
      <div className="agente-page-card">
        <div className="agente-content-inner">
          {/* Header */}
          <div className="agente-header-container">
            <h2 className="agente-page-header">SOLICITUDES CDT</h2>
            <div>
              <button className="agente-btn-export" onClick={handleExportCSV}>
                Exportar CSV
              </button>
              <button className="agente-btn-export" onClick={handleExportPDF}>
                Exportar PDF
              </button>
              <button className="agente-btn-logout" onClick={handleLogout}>
                Cerrar Sesión
              </button>
            </div>
          </div>

          {/* Barra de filtros */}
          <FilterBar initial={filters} onApply={setFilters} />

          {/* Tabla de solicitudes */}
          {loading ? (
            <p>Cargando solicitudes...</p>
          ) : (
            <AgentSolicitudesTable
              solicitudes={filtered}
              agentes={agentes}
              onAprobar={handleOpenAprobar}
              onRechazar={handleOpenRechazar}
              onVerHistorial={(s) => {
                setSelected(s);
                setOpenHist(true);
              }}
            />
          )}

          {/* Modales */}
          {openAprobar && (
            <ModalAprobarAgent
              solicitud={selected}
              onConfirm={handleConfirmAprobar}
              onClose={() => setOpenAprobar(false)}
            />
          )}

          {openRechazar && (
            <ModalRechazarAgent
              solicitud={selected}
              onConfirm={handleConfirmRechazar}
              onClose={() => setOpenRechazar(false)}
            />
          )}

          {openHist && (
            <HistorialModal
              solicitud={selected}
              onClose={() => setOpenHist(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
}