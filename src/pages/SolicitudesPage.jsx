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

  // Estado local para modal y edición
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  /* Fetch inicial
  useEffect(() => {
    fetchSolicitudes();
  }, [fetchSolicitudes]);*/
  
  useEffect(() => {
    fetchSolicitudes();
  // ⚠️ ignorar dependencias aquí para que no se repita en bucle
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);



  // Filtros
  const handleApplyFilters = (filtros) => {
    setFiltros(filtros);
    fetchSolicitudes({ filtros, page: 1 });
  };

  // Editar
  const handleEdit = (id) => {
    const item = solicitudes.find((s) => s.id === id);
    if (item && item.estado === "Borrador") {
      setEditingItem(item);
      setShowForm(true);
    } else {
      alert("Solo se pueden editar solicitudes en estado Borrador");
    }
  };

  // Cambiar estado
  const handleChangeState = async (id, newState) => {
    try {
      let razon = undefined;
      if (newState === "Cancelada") {
        // pedir motivo al usuario (simple prompt)
        razon = prompt("Indica el motivo de la cancelación:");
      }
      await changeEstado(id, newState, razon);
      await fetchSolicitudes();
      if (newState === "Cancelada") {
        alert("Solicitud cancelada");
      }
    } catch (err) {
      console.error("Error cambiando estado:", err);
      const msg = err?.response?.data?.message || err?.message || "No se pudo cambiar el estado";
      alert(msg);
    }
  };

  // Eliminar
  const handleDelete = async (id) => {
    if (!confirm("¿Confirmas eliminar (lógico) la solicitud?")) return;
    try {
      await deleteSolicitud(id);
    } catch (err) {
      console.error("Error eliminando:", err);
      alert("No se pudo eliminar");
    }
  };

  // Guardar desde el formulario
  const handleFormSubmit = async (solicitud) => {
    setSubmitting(true);
    try {
      if (editingItem) {
        await updateSolicitud(editingItem.id, solicitud);
      } else {
        await createSolicitud(solicitud);
        alert('Solicitud creada y enviada para validación');
      }
      setShowForm(false);
      setEditingItem(null);
      await fetchSolicitudes();
    } catch (err) {
      console.error("Error guardando:", err);
      // mostrar error al usuario de forma amigable
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

          {/* Botón para abrir modal */}
      <button
        onClick={() => {
          setShowForm(true);
          setEditingItem(null);
        }}
            style={{ marginBottom: 12 }}
      >
        Nueva Solicitud
      </button>

      {/* Modal con el formulario */}
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

      {/* Estado */}
      {cargando && <div>Cargando solicitudes...</div>}
      {error && <div style={{ color: "red" }}>Error: {error}</div>}

      {/* Tabla */}
      <SolicitudesTable
        items={solicitudes}
        onEdit={handleEdit}
        onChangeState={handleChangeState}
        onDelete={handleDelete}
      />

      {/* Paginación */}
      <div style={{ marginTop: 12 }}>
        <button
          onClick={() => {
            if (page > 1) {
              setPage(page - 1);
              fetchSolicitudes({ page: page - 1 });
            }
          }}
          disabled={page <= 1}
        >
          Anterior
        </button>
        <span style={{ margin: "0 8px" }}>Página {page}</span>
        <button
          onClick={() => {
            const next = page + 1;
            setPage(next);
            fetchSolicitudes({ page: next });
          }}
          disabled={solicitudes.length < limit}
        >
          Siguiente
        </button>
        <span style={{ marginLeft: 12 }}>Total: {total}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
