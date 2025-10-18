// src/pages/SolicitudesPage.jsx
import React, { useEffect, useState } from "react";
import useSolicitudes from "../hooks/useSolicitudes";
import FilterBar from "../components/FilterBar";
import SolicitudesTable from "../components/SolicitudesTable";
import SolicitudForm from "../components/SolicitudForm";
import Modal from "../components/Modal";

export default function SolicitudesPage() {
  const {
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
  } = useSolicitudes();

  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchSolicitudes();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        if (!razon) return; // Si cancela el prompt, no continuar
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
          <h2 className="page-header">MIS SOLICITUDES CDT</h2>

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

          {/* Estado de carga y errores */}
          {cargando && <div className="text-muted">Cargando solicitudes...</div>}
          {error && <div className="text-error">Error: {error}</div>}

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