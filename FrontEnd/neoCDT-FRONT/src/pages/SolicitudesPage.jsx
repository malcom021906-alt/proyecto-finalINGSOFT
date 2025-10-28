import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import solicitudesService from "../services/solicitudesService";
import FilterBar from "../components/FilterBar";
import SolicitudesTable from "../components/SolicitudesTable";
import SolicitudForm from "../components/SolicitudForm";
import Modal from "../components/Modal";
import "../css/solicitudesPage.css"

export default function SolicitudesPage() {
  const navigate = useNavigate();

  // ===============================
  // 📦 Estados principales
  // ===============================
  const [solicitudes, setSolicitudes] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [filtros, setFiltros] = useState({});
  const [loading, setLoading] = useState(false);

  // Modal y formulario
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // ===============================
  // 🔄 Cargar solicitudes (optimizado)
  // ===============================
  const fetchSolicitudes = useCallback(async (extraParams = {}) => {
    setLoading(true);
    try {
      const params = { ...filtros, page, limit, ...extraParams };
      const data = await solicitudesService.getSolicitudes(params);
      setSolicitudes(data.items || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error("Error al cargar solicitudes:", err);
      alert("No se pudieron cargar las solicitudes");
    } finally {
      setLoading(false);
    }
  }, [page, limit, filtros]);

  useEffect(() => {
    fetchSolicitudes();
  }, [fetchSolicitudes]);

  // ===============================
  // 🚪 Cerrar sesión
  // ===============================
  const handleLogout = () => {
    if (confirm("¿Deseas cerrar sesión?")) {
      localStorage.removeItem("token");
      navigate("/login");
    }
  };

  // ===============================
  // 🔍 Filtros
  // ===============================
  const handleApplyFilters = (newFilters) => {
    const same = JSON.stringify(filtros) === JSON.stringify(newFilters);
    if (!same) {
      setFiltros(newFilters);
      setPage(1);
    }
  };

  // ===============================
  // ✏️ Editar solicitud
  // ===============================
  const handleEdit = (id) => {
    const item = solicitudes.find((s) => s.id === id);
    if (item && item.estado === "Borrador") {
      setEditingItem(item);
      setShowForm(true);
    } else {
      alert("Solo se pueden editar solicitudes en estado Borrador");
    }
  };

  // ===============================
  // 🔄 Cambiar estado
  // ===============================
  const handleChangeState = async (id, newState) => {
    try {
      let razon = undefined;
      if (newState === "Cancelada") {
        razon = prompt("Indica el motivo de la cancelación:");
        if (!razon) return;
      }

      await solicitudesService.cambiarEstado(id, newState, razon);
      await fetchSolicitudes();
      if (newState === "Cancelada") alert("Solicitud cancelada exitosamente");
    } catch (err) {
      console.error("Error cambiando estado:", err);
      alert(err?.detail || "No se pudo cambiar el estado");
    }
  };

  // ===============================
  // 🗑️ Eliminar solicitud
  // ===============================
  const handleDelete = async (id) => {
    if (!confirm("¿Confirmas eliminar la solicitud?")) return;
    try {
      await solicitudesService.eliminarSolicitud(id);
      alert("Solicitud eliminada correctamente");
      await fetchSolicitudes();
    } catch (err) {
      console.error("Error eliminando solicitud:", err);
      alert(err?.detail || "No se pudo eliminar la solicitud");
    }
  };

  // ===============================
  // 💾 Crear o actualizar
  // ===============================
  const handleFormSubmit = async (solicitud) => {
    setSubmitting(true);
    try {
      if (editingItem) {
        await solicitudesService.actualizarSolicitud(editingItem.id, solicitud);
        alert("Solicitud actualizada exitosamente");
      } else {
        await solicitudesService.crearSolicitud(solicitud);
        alert("Solicitud creada correctamente");
      }

      setShowForm(false);
      setEditingItem(null);
      await fetchSolicitudes();
    } catch (err) {
      console.error("Error guardando solicitud:", err);
      alert(err?.detail || "No se pudo guardar la solicitud");
    } finally {
      setSubmitting(false);
    }
  };

  // ===============================
  // 🧱 Renderizado principal
  // ===============================
  return (
    <div className="app-container">
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
            <span className="nav-icon">🏠</span>
            <span>Home</span>
          </div>
          <div className="nav-item">
            <span className="nav-icon">🔄</span>
            <span>Transactions</span>
          </div>
          <div className="nav-item">
            <span className="nav-icon">📊</span>
            <span>Investments</span>
          </div>
          <div className="nav-item">
            <span className="nav-icon">⚙️</span>
            <span>Settings</span>
          </div>
        </nav>
      </div>

      <div className="page-card">
        <div className="content-inner">
          {/* Header */}
           <div className="header-container">
          <h2 className="page-header">MIS SOLICITUDES CDT</h2>
          <button className="logout-btn" onClick={handleLogout}>
            Cerrar Sesión
          </button>
        </div>

          {/* Botón Nueva Solicitud */}
          <button
            onClick={() => {
              setShowForm(true);
              setEditingItem(null);
            }}
            className="mb-lg"
          >
            + Nueva Solicitud
          </button>

          {/* Modal con formulario */}
          {showForm && (
            <Modal
              title={editingItem ? "Editar Solicitud" : "Nueva Solicitud"}
              onClose={() => {
                setShowForm(false);
                setEditingItem(null);
              }}
            >
              <SolicitudForm
                initialData={editingItem}
                onSubmit={handleFormSubmit}
                submitting={submitting}
                onCancel={() => {
                  setShowForm(false);
                  setEditingItem(null);
                }}
              />
            </Modal>
          )}

          {/* Barra de filtros */}
          <FilterBar onApply={handleApplyFilters} />

          {/* Tabla de solicitudes */}
          {loading ? (
            <p>Cargando solicitudes...</p>
          ) : (
            <SolicitudesTable
              items={solicitudes}
              onEdit={handleEdit}
              onChangeState={handleChangeState}
              onDelete={handleDelete}
            />
          )}

          {/* Paginación */}
          <div className="pagination">
            <button
              onClick={() => {
                if (page > 1) setPage(page - 1);
              }}
              disabled={page <= 1}
            >
              ← Anterior
            </button>

            <div className="pagination-info">
              <span className="pagination-current">Página {page}</span>
              <span className="pagination-total">
                Total: {total} solicitudes
              </span>
            </div>

            <button
              onClick={() => {
                const next = page + 1;
                if (solicitudes.length >= limit) setPage(next);
              }}
              disabled={solicitudes.length < limit}
            >
              Siguiente →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
