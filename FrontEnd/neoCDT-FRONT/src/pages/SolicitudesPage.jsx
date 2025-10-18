// src/pages/SolicitudesPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useSolicitudes from "../hooks/useSolicitudes";
import FilterBar from "../components/FilterBar";
import SolicitudesTable from "../components/SolicitudesTable";
import SolicitudForm from "../components/SolicitudForm";
import Modal from "../components/Modal";

export default function SolicitudesPage() {
  const navigate = useNavigate();
  const {
    solicitudes,
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
  } = useSolicitudes();

  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchSolicitudes();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

<<<<<<< HEAD
=======
  const handleLogout = () => {
    if (confirm("¿Deseas cerrar sesión?")) {
      localStorage.removeItem("token");
      navigate("/login");
    }
  };

>>>>>>> 32565a7ac88048d5b222d8e75467d2c6482562f3
  const handleApplyFilters = (filtros) => {
    setFiltros(filtros);
    fetchSolicitudes({ filtros, page: 1 });
  };

  const handleEdit = (id) => {
    const item = solicitudes.find((s) => s.id === id);
    if (item && item.estado === "Borrador") {
      setEditingItem(item);
      setShowForm(true);
    } else {
      alert("Solo se pueden editar solicitudes en estado Borrador");
    }
  };

  const handleChangeState = async (id, newState) => {
    try {
      let razon = undefined;
      if (newState === "Cancelada") {
        razon = prompt("Indica el motivo de la cancelación:");
<<<<<<< HEAD
        if (!razon) return; // Si cancela el prompt, no continuar
=======
        if (!razon) return;
>>>>>>> 32565a7ac88048d5b222d8e75467d2c6482562f3
      }
      await changeEstado(id, newState, razon);
      await fetchSolicitudes();
      if (newState === "Cancelada") {
        alert("Solicitud cancelada exitosamente");
      }
    } catch (err) {
      console.error("Error cambiando estado:", err);
      const msg = err?.response?.data?.message || err?.message || "No se pudo cambiar el estado";
      alert(msg);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Confirmas eliminar (lógico) la solicitud?")) return;
    try {
      await deleteSolicitud(id);
      alert("Solicitud eliminada");
    } catch (err) {
      console.error("Error eliminando:", err);
      alert("No se pudo eliminar");
    }
  };

  const handleFormSubmit = async (solicitud) => {
    setSubmitting(true);
    try {
      if (editingItem) {
        await updateSolicitud(editingItem.id, solicitud);
        alert("Solicitud actualizada exitosamente");
      } else {
        await createSolicitud(solicitud);
        alert("Solicitud creada y enviada para validación");
      }
      setShowForm(false);
      setEditingItem(null);
      await fetchSolicitudes();
    } catch (err) {
      console.error("Error guardando:", err);
      const msg = err?.response?.data?.message || err?.message || "No se pudo guardar la solicitud";
      alert(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="app-container">
      <div className="page-card">
        <div className="content-inner">
          {/* Header con título y botón de cerrar sesión */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h2 className="page-header" style={{ margin: 0 }}>MIS SOLICITUDES CDT</h2>
            <button
              onClick={handleLogout}
              style={{
                backgroundColor: '#dc3545',
                color: 'white',
                padding: '0.5rem 1rem',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.9rem'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#c82333'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#dc3545'}
            >
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

<<<<<<< HEAD
          {/* Estado de carga y errores */}
          {cargando && <div className="text-muted">Cargando solicitudes...</div>}
          {error && <div className="text-error">Error: {error}</div>}

=======
>>>>>>> 32565a7ac88048d5b222d8e75467d2c6482562f3
          {/* Tabla de solicitudes */}
          <SolicitudesTable
            items={solicitudes}
            onEdit={handleEdit}
            onChangeState={handleChangeState}
            onDelete={handleDelete}
          />

          {/* Paginación */}
          <div className="pagination">
            <button
              onClick={() => {
                if (page > 1) {
                  setPage(page - 1);
                  fetchSolicitudes({ page: page - 1 });
                }
              }}
              disabled={page <= 1}
            >
              ← Anterior
            </button>
            
            <div className="pagination-info">
              <span className="pagination-current">Página {page}</span>
              <span className="pagination-total">Total: {total} solicitudes</span>
            </div>
            
            <button
              onClick={() => {
                const next = page + 1;
                setPage(next);
                fetchSolicitudes({ page: next });
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