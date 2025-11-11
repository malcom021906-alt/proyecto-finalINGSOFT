import React, { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import agenteService from "../services/agenteService";
import "../css/agentePage.css";

/**
 * 🏦 DASHBOARD DEL AGENTE BANCARIO
 * 
 * Cumple con las siguientes Historias de Usuario:
 * - HU-08: Ver solicitudes pendientes (estado "En validación")
 * - HU-09: Aprobar solicitudes con notificación al cliente
 * - HU-10: Rechazar solicitudes con motivo
 */

// ===============================
// 📊 COMPONENTE: FilterBar
// ===============================
// eslint-disable-next-line react/prop-types
function FilterBar({ initial = {}, onApply = () => {}, isAgentView = false }) {
  const [localFilters, setLocalFilters] = useState(initial);

  const handleChange = (field, value) => {
    setLocalFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleApply = () => {
    onApply(localFilters);
  };

  return (
    <div className="filter-bar">
      <select
        value={localFilters.estado || ""}
        onChange={(e) => handleChange("estado", e.target.value)}
      >
        <option value="">Todos los estados</option>
        {isAgentView ? (
          <>
            <option value="en_validacion">En validación</option>
            <option value="Aprobada">Aprobada</option>
            <option value="Rechazada">Rechazada</option>
          </>
        ) : (
          <>
            <option value="Borrador">Borrador</option>
            <option value="Enviada">Enviada</option>
            <option value="Aprobada">Aprobada</option>
            <option value="Rechazada">Rechazada</option>
            <option value="Cancelada">Cancelada</option>
          </>
        )}
      </select>

      <input
        type="number"
        placeholder="Monto mínimo"
        value={localFilters.montoMin || ""}
        onChange={(e) => handleChange("montoMin", e.target.value)}
      />

      <input
        type="number"
        placeholder="Monto máximo"
        value={localFilters.montoMax || ""}
        onChange={(e) => handleChange("montoMax", e.target.value)}
      />

      <input
        type="date"
        placeholder="Fecha desde"
        value={localFilters.fechaDesde || ""}
        onChange={(e) => handleChange("fechaDesde", e.target.value)}
      />

      <input
        type="date"
        placeholder="Fecha hasta"
        value={localFilters.fechaHasta || ""}
        onChange={(e) => handleChange("fechaHasta", e.target.value)}
      />

      <button onClick={handleApply}>Aplicar Filtros</button>
    </div>
  );
}

// ===============================
// 📋 COMPONENTE: AgentSolicitudesTable
// ===============================
// eslint-disable-next-line react/prop-types
function AgentSolicitudesTable({ items = [], onAprobar = () => {}, onRechazar = () => {}, onVerHistorial = () => {} }) {
  const formatMonto = (monto) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(monto);

  const formatFecha = (fecha) => {
    if (!fecha) return "N/A";
    const date = new Date(fecha);
    return date.toLocaleDateString("es-CO", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const normalizeEstado = (estado) => {
    if (!estado) return "";
    return String(estado).replace("_", " ");
  };

  // Error 4: Extraer lógica de renderizado condicional
  const renderTableContent = () => {
    if (items.length === 0) {
      return (
        <tr>
          <td colSpan="8" style={{ textAlign: "center", padding: "2rem" }}>
            No hay solicitudes para mostrar
          </td>
        </tr>
      );
    }

    return items.map((item) => {
      const estado = normalizeEstado(item.estado);
      const isEnValidacion =
        estado === "en_validacion" || estado === "En validación"

      return (
        <tr key={item.id}>
          <td>{item.id?.slice(-8) || "N/A"}</td>
          <td>{item.cliente_nombre || item.usuario_id || "N/A"}</td>
          <td>{formatMonto(item.monto || 0)}</td>
          <td>{item.plazo_meses || "N/A"}</td>
          <td>{item.tasa_interes || item.tasa || "N/A"}%</td>
          <td>
            <span className={`estado ${estado}`}>{estado}</span>
          </td>
          <td>{formatFecha(item.fecha_creacion || item.fechaCreacion)}</td>
          <td>
            <button
              className="btn-aprobar"
              onClick={() => onAprobar(item)}
              disabled={!isEnValidacion}
              title={
                isEnValidacion
                  ? "Aprobar solicitud"
                  : "Solo se pueden aprobar solicitudes pendientes"
              }
            >
              ✅ Aprobar
            </button>
            <button
              className="btn-rechazar"
              onClick={() => onRechazar(item)}
              disabled={!isEnValidacion}
              title={
                isEnValidacion
                  ? "Rechazar solicitud"
                  : "Solo se pueden rechazar solicitudes pendientes"
              }
            >
              ❌ Rechazar
            </button>
            <button
              className="btn-historial"
              onClick={() => onVerHistorial(item)}
              title="Ver historial de cambios"
            >
              📜 Historial
            </button>
          </td>
        </tr>
      );
    });
  };

  return (
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Cliente</th>
          <th>Monto</th>
          <th>Plazo (meses)</th>
          <th>Tasa (%)</th>
          <th>Estado</th>
          <th>Fecha</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {renderTableContent()}
      </tbody>
    </table>
  );
}

// ===============================
// 🎯 HOOK PERSONALIZADO: useDialogModal
// Solución para manejo de modales con dialog
// ===============================
function useDialogModal(onClose) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog) {
      dialog.showModal();
      dialog.focus();
    }

    // Manejar Escape key
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('keydown', handleEscape);
      if (dialog) {
        dialog.close();
      }
    };
  }, [onClose]);

  const handleBackdropClick = useCallback((e) => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const rect = dialog.getBoundingClientRect();
    const isInDialog = (
      rect.top <= e.clientY &&
      e.clientY <= rect.top + rect.height &&
      rect.left <= e.clientX &&
      e.clientX <= rect.left + rect.width
    );
    
    if (!isInDialog) {
      onClose();
    }
  }, [onClose]);

  return { dialogRef, handleBackdropClick };
}

// ===============================
// ✅ COMPONENTE: ModalAprobarAgent
// ===============================
// eslint-disable-next-line react/prop-types
function ModalAprobarAgent({ solicitud = {}, onConfirm = () => {}, onClose = () => {} }) {
  const { dialogRef, handleBackdropClick } = useDialogModal(onClose);

  return (
    <dialog 
      ref={dialogRef}
      className="modal-overlay"
      aria-labelledby="modal-aprobar-title"
    >
      <button
        type="button"
        className="modal-backdrop-btn"
        onClick={handleBackdropClick}
        aria-label="Cerrar modal haciendo clic fuera"
        tabIndex={-1}
      />
      <div className="modal-content">
        <h3 id="modal-aprobar-title">✅ Aprobar Solicitud</h3>
        <div className="modal-body">
          <p><strong>ID:</strong> {solicitud.id || "N/A"}</p>
          <p><strong>Cliente:</strong> {solicitud.cliente_nombre || solicitud.usuario_id || "N/A"}</p>
          <p><strong>Monto:</strong> ${solicitud.monto?.toLocaleString('es-CO') || 0}</p>
          <p><strong>Plazo:</strong> {solicitud.plazo_meses || solicitud.plazo_dias || "N/A"} meses</p>
          <p style={{ marginTop: '1rem', color: '#065f46' }}>
            ¿Estás seguro de aprobar esta solicitud? Se enviará una notificación al cliente.
          </p>
        </div>
        <div className="modal-actions">
          <button className="btn-aprobar" onClick={onConfirm}>
            Confirmar Aprobación
          </button>
          <button className="btn-cancelar" onClick={onClose}>
            Cancelar
          </button>
        </div>
      </div>
    </dialog>
  );
}

// ===============================
// ❌ COMPONENTE: ModalRechazarAgent
// ===============================
// eslint-disable-next-line react/prop-types
function ModalRechazarAgent({ solicitud = {}, onConfirm = () => {}, onClose = () => {} }) {
  const [motivo, setMotivo] = useState("");
  const { dialogRef, handleBackdropClick } = useDialogModal(onClose);

  const handleConfirm = () => {
    if (motivo.trim().length === 0) {
      alert("Debes proporcionar un motivo para rechazar");
      return;
    }
    onConfirm(motivo);
  };

  return (
    <dialog 
      ref={dialogRef}
      className="modal-overlay"
      aria-labelledby="modal-rechazar-title"
    >
      <button
        type="button"
        className="modal-backdrop-btn"
        onClick={handleBackdropClick}
        aria-label="Cerrar modal haciendo clic fuera"
        tabIndex={-1}
      />
      <div className="modal-content">
        <h3 id="modal-rechazar-title">❌ Rechazar Solicitud</h3>
        <div className="modal-body">
          <p><strong>ID:</strong> {solicitud.id || "N/A"}</p>
          <p><strong>Cliente:</strong> {solicitud.cliente_nombre || solicitud.usuario_id || "N/A"}</p>
          <p><strong>Monto:</strong> ${solicitud.monto?.toLocaleString('es-CO') || 0}</p>
          
          <label htmlFor="motivo-rechazo" style={{ display: 'block', marginTop: '1rem', fontWeight: 600 }}>
            Motivo del rechazo: *
          </label>
          <textarea
            id="motivo-rechazo"
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            placeholder="Ingresa el motivo del rechazo..."
            rows={4}
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: '8px',
              border: '2px solid #e5e7eb',
              fontSize: '0.95rem',
              marginTop: '0.5rem',
              resize: 'vertical'
            }}
          />
        </div>
        <div className="modal-actions">
          <button className="btn-rechazar" onClick={handleConfirm}>
            Confirmar Rechazo
          </button>
          <button className="btn-cancelar" onClick={onClose}>
            Cancelar
          </button>
        </div>
      </div>
    </dialog>
  );
}

// ===============================
// 📜 COMPONENTE: HistorialModal
// ===============================
// eslint-disable-next-line react/prop-types
function HistorialModal({ solicitud = {}, onClose = () => {} }) {
  const { dialogRef, handleBackdropClick } = useDialogModal(onClose);

  const renderHistorialContent = () => {
    const historial = solicitud.historial || [];
    
    if (historial.length === 0) {
      return (
        <p style={{ color: '#6b7280', fontStyle: 'italic' }}>
          No hay historial registrado para esta solicitud
        </p>
      );
    }

    return (
      <div className="historial-list">
        {historial.map((item) => (
          <div key={`${item.fecha}-${item.accion}-${item.usuario || 'sistema'}`} className="historial-item">
            <div className="historial-fecha">
              {new Date(item.fecha).toLocaleString('es-CO')}
            </div>
            <div className="historial-detalle">
              <strong>{item.usuario || "Sistema"}:</strong> {item.accion}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <dialog 
      ref={dialogRef}
      className="modal-overlay modal-historial"
      aria-labelledby="modal-historial-title"
    >
      <button
        type="button"
        className="modal-backdrop-btn"
        onClick={handleBackdropClick}
        aria-label="Cerrar modal haciendo clic fuera"
        tabIndex={-1}
      />
      <div className="modal-content">
        <h3 id="modal-historial-title">📜 Historial de Cambios</h3>
        <div className="modal-body">
          <p><strong>Solicitud ID:</strong> {solicitud.id || "N/A"}</p>
          <p><strong>Cliente:</strong> {solicitud.cliente_nombre || solicitud.usuario_id || "N/A"}</p>
          
          <div style={{ marginTop: '1.5rem' }}>
            <h4 style={{ marginBottom: '1rem', color: '#1a2e2e' }}>Registro de Actividad:</h4>
            {renderHistorialContent()}
          </div>
        </div>
        <div className="modal-actions">
          <button className="btn-cancelar" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </dialog>
  );
}

// ===============================
// 🔔 COMPONENTE: SimpleToast
// ===============================
// eslint-disable-next-line react/prop-types
function SimpleToast({ message = "", type = "success", onClose = () => {} }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`simple-toast simple-toast-${type}`} role="alert">
      <span>{message}</span>
      <button onClick={onClose} className="toast-close" aria-label="Cerrar notificación">×</button>
    </div>
  );
}

// ===============================
// 🏦 COMPONENTE PRINCIPAL: AgenteDashboard
// ===============================
export default function AgenteDashboard() {
  const navigate = useNavigate();

  // Estados principales
  const [solicitudes, setSolicitudes] = useState([]);
  const [filteredSolicitudes, setFilteredSolicitudes] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [filtros, setFiltros] = useState({ estado: "" });
  const [loading, setLoading] = useState(false);

  // Estados para modales
  const [openAprobar, setOpenAprobar] = useState(false);
  const [openRechazar, setOpenRechazar] = useState(false);
  const [openHistorial, setOpenHistorial] = useState(false);
  const [selectedSolicitud, setSelectedSolicitud] = useState(null);

  // Estado para toast notifications
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
  }, []);

  // Cargar solicitudes desde el backend
  const fetchSolicitudes = useCallback(async () => {
    setLoading(true);
    try {
      const data = await agenteService.getSolicitudesPendientes();
      console.log("📥 Solicitudes cargadas:", data);
      setSolicitudes(data);
    } catch (err) {
      console.error("Error al cargar solicitudes:", err);
      showToast("No se pudieron cargar las solicitudes. " + (err.message || ""), 'error');
      setSolicitudes([]);
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchSolicitudes();
  }, [fetchSolicitudes]);

  // Aplicar filtros
  const applyFilters = useCallback(() => {
    let filtered = [...solicitudes];

    if (filtros.estado) {
      filtered = filtered.filter(s => s.estado?.toLowerCase().includes(filtros.estado.toLowerCase()));
    }
    if (filtros.montoMin) {
      filtered = filtered.filter(s => s.monto >= Number(filtros.montoMin));
    }
    if (filtros.montoMax) {
      filtered = filtered.filter(s => s.monto <= Number(filtros.montoMax));
    }
    if (filtros.fechaDesde) {
      filtered = filtered.filter(s => {
        const fecha = new Date(s.fecha_creacion || s.fechaCreacion).toISOString().split('T')[0];
        return fecha >= filtros.fechaDesde;
      });
    }
    if (filtros.fechaHasta) {
      filtered = filtered.filter(s => {
        const fecha = new Date(s.fecha_creacion || s.fechaCreacion).toISOString().split('T')[0];
        return fecha <= filtros.fechaHasta;
      });
    }

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginated = filtered.slice(startIndex, endIndex);

    setFilteredSolicitudes(paginated);
    setTotal(filtered.length);
  }, [solicitudes, filtros, page, limit]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const handleLogout = () => {
    if (globalThis.confirm("¿Deseas cerrar sesión?")) {
      localStorage.removeItem("token");
      navigate("/login");
    }
  };

  const handleApplyFilters = (newFilters) => {
    setFiltros(newFilters);
    setPage(1);
  };

  // ✅ APROBAR SOLICITUD
  const handleOpenAprobar = (solicitud) => {
    console.log("✅ Abriendo modal aprobar:", solicitud);
    setSelectedSolicitud(solicitud);
    setOpenAprobar(true);
  };

  const handleConfirmAprobar = async () => {
    if (selectedSolicitud === null) return;

    const id = selectedSolicitud.id;
    console.log("✅ Aprobando solicitud ID:", id);
    
    try {
      setLoading(true);
      await agenteService.aprobarSolicitud(id);
      
      showToast('✅ Solicitud aprobada. Se ha notificado al cliente.', 'success');
      
      setOpenAprobar(false);
      setSelectedSolicitud(null);
      
      await fetchSolicitudes();
    } catch (err) {
      console.error("Error al aprobar solicitud:", err);
      showToast(err.detail || err.message || 'Error al aprobar solicitud. Intenta nuevamente.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // ❌ RECHAZAR SOLICITUD
  const handleOpenRechazar = (solicitud) => {
    console.log("❌ Abriendo modal rechazar:", solicitud);
    setSelectedSolicitud(solicitud);
    setOpenRechazar(true);
  };

  const handleConfirmRechazar = async (motivo) => {
    if (selectedSolicitud === null) return;

    const id = selectedSolicitud.id;
    console.log("❌ Rechazando solicitud ID:", id, "Motivo:", motivo);
    
    try {
      setLoading(true);
      await agenteService.rechazarSolicitud(id, motivo);
      
      showToast('❌ Solicitud rechazada. Se ha notificado al cliente.', 'success');
      
      setOpenRechazar(false);
      setSelectedSolicitud(null);
      
      await fetchSolicitudes();
    } catch (err) {
      console.error("Error al rechazar solicitud:", err);
      showToast(err.detail || err.message || 'Error al rechazar solicitud. Intenta nuevamente.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // 📜 VER HISTORIAL
  const handleOpenHistorial = (solicitud) => {
    console.log("📜 Abriendo historial:", solicitud);
    setSelectedSolicitud(solicitud);
    setOpenHistorial(true);
  };

  const handleExportCSV = () => {
    showToast("✅ Función de exportar CSV (pendiente de implementar)", 'success');
    console.log("Exportar CSV:", filteredSolicitudes);
  };

  const handleExportPDF = () => {
    showToast("✅ Función de exportar PDF (pendiente de implementar)", 'success');
    console.log("Exportar PDF:", filteredSolicitudes);
  };

  const renderPaginationButton = () => {
    const totalPages = Math.ceil(total / limit);
    const isLastPage = page >= totalPages;
    
    return (
      <button
        onClick={() => {
          if (!isLastPage) {
            setPage(page + 1);
          }
        }}
        disabled={isLastPage}
        className="pagination-btn"
      >
        Siguiente →
      </button>
    );
  };

  // Extraer lógica de renderizado condicional de solicitudes
  const renderSolicitudesContent = () => {
    if (loading) {
      return (
        <div className="loading-container">
          <p>⏳ Cargando solicitudes pendientes...</p>
        </div>
      );
    }

    if (filteredSolicitudes.length === 0) {
      return (
        <div className="empty-state">
          <p>✅ No hay solicitudes pendientes de validación</p>
        </div>
      );
    }

    return (
      <AgentSolicitudesTable 
        items={filteredSolicitudes}
        onAprobar={handleOpenAprobar}
        onRechazar={handleOpenRechazar}
        onVerHistorial={handleOpenHistorial}
      />
    );
  };

  return (
    <div className="app-container">
      {toast && (
        <SimpleToast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-circle"></div>
          <div className="logo-text">
            <span>CDT</span>
            <span>BANKING</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-item active">
            <span className="nav-icon">🏦</span>
            <span>Solicitudes Pendientes</span>
          </div>
          <div className="nav-item">
            <span className="nav-icon">✅</span>
            <span>Aprobadas</span>
          </div>
          <div className="nav-item">
            <span className="nav-icon">❌</span>
            <span>Rechazadas</span>
          </div>
          <div className="nav-item">
            <span className="nav-icon">⚙️</span>
            <span>Configuración</span>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            🚪 Cerrar Sesión
          </button>
        </nav>
      </div>

      <div className="page-card">
        <div className="content-inner">
          <div className="agente-header-container">
            <h2 className="page-header">🏦 PANEL DE VALIDACIÓN - SOLICITUDES CDT</h2>
            <div className="header-actions">
              <button className="btn-export" onClick={handleExportCSV}>📊 Exportar CSV</button>
              <button className="btn-export" onClick={handleExportPDF}>📄 Exportar PDF</button>
            </div>
          </div>

          <div className="stats-banner">
            <div className="stat-item">
              <span className="stat-label">Solicitudes Pendientes:</span>
              <span className="stat-value">{total}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Página:</span>
              <span className="stat-value">{page}</span>
            </div>
          </div>

          <FilterBar 
            initial={filtros}
            onApply={handleApplyFilters}
            isAgentView={true}
          />

          {renderSolicitudesContent()}

          <div className="pagination">
            <button
              onClick={() => { if (page > 1) setPage(page - 1); }}
              disabled={page <= 1}
              className="pagination-btn"
            >
              ← Anterior
            </button>
            <div className="pagination-info">
              <span className="pagination-current">Página {page}</span>
              <span className="pagination-total">Total: {total} solicitudes</span>
            </div>
            {renderPaginationButton()}
          </div>
        </div>
      </div>

      {/* MODALES */}
      {openAprobar && selectedSolicitud && (
        <ModalAprobarAgent
          solicitud={selectedSolicitud}
          onConfirm={handleConfirmAprobar}
          onClose={() => {
            setOpenAprobar(false);
            setSelectedSolicitud(null);
          }}
        />
      )}

      {openRechazar && selectedSolicitud && (
        <ModalRechazarAgent
          solicitud={selectedSolicitud}
          onConfirm={handleConfirmRechazar}
          onClose={() => {
            setOpenRechazar(false);
            setSelectedSolicitud(null);
          }}
        />
      )}

      {openHistorial && selectedSolicitud && (
        <HistorialModal
          solicitud={selectedSolicitud}
          onClose={() => {
            setOpenHistorial(false);
            setSelectedSolicitud(null);
          }}
        />
      )}
    </div>
  );
}