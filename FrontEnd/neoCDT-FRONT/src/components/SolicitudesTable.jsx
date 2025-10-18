// src/components/SolicitudesTable.jsx
import React from "react";

export default function SolicitudesTable({ items = [], onEdit, onChangeState, onDelete }) {
  const getStatusClass = (estado) => {
    const statusMap = {
      "Borrador": "status-borrador",
      "En validación": "status-validacion",
      "Aprobada": "status-aprobada",
      "Rechazada": "status-rechazada",
      "Cancelada": "status-cancelada"
    };
    return `status-badge ${statusMap[estado] || ""}`;
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(value);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Monto</th>
          <th>Plazo</th>
          <th>Tasa</th>
          <th>Estado</th>
          <th>Fecha de Creación</th>
          <th>Acciones</th>
        </tr>
      </thead>

      <tbody>
        {items.length === 0 ? (
          <tr>
            <td colSpan={7} className="table-empty">
              No hay solicitudes para mostrar
            </td>
          </tr>
        ) : (
          items.map((s) => (
            <tr key={s.id}>
              <td>#{s.id}</td>
              <td>{formatCurrency(s.monto)}</td>
              <td>{s.plazo} días</td>
              <td>{s.tasaInteres}%</td>
              <td>
                <span className={getStatusClass(s.estado)}>
                  {s.estado}
                </span>
              </td>
              <td>{formatDate(s.fechaCreacion)}</td>
              <td>
                <button
                  onClick={() => onEdit?.(s.id)}
                  disabled={s.estado !== "Borrador"}
                  title={s.estado !== "Borrador" ? "No editable" : "Editar"}
                >
                  Editar
                </button>

                <button
                  onClick={() => onChangeState?.(s.id, "Cancelada")}
                  disabled={s.estado !== "En validación"}
                  title={s.estado !== "En validación" ? "Sólo se puede cancelar si está en 'En validación'" : "Cancelar"}
                  className="secondary"
                >
                  Cancelar
                </button>

                <button 
                  onClick={() => onDelete?.(s.id)}
                  className="danger"
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}