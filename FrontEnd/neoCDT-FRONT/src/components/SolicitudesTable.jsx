// src/components/SolicitudesTable.jsx
import React from "react";

/*
  SolicitudesTable:
  Props:
    - items: array de solicitudes
    - onEdit(id): abrir edición
    - onChangeState(id, newState): cambiar estado (ej. cancelar)
    - onDelete(id): eliminar (borrado lógico)
  Muestra columnas: ID, Monto, Plazo, Estado, Fecha, Acciones
*/

export default function SolicitudesTable({ items = [], onEdit, onChangeState, onDelete }) {
  return (
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr>
          <th style={{ borderBottom: "1px solid #ccc", padding: 8 }}>ID</th>
          <th style={{ borderBottom: "1px solid #ccc", padding: 8 }}>Monto</th>
          <th style={{ borderBottom: "1px solid #ccc", padding: 8 }}>Plazo</th>
          <th style={{ borderBottom: "1px solid #ccc", padding: 8 }}>Estado</th>
          <th style={{ borderBottom: "1px solid #ccc", padding: 8 }}>Fecha de creación</th>
          <th style={{ borderBottom: "1px solid #ccc", padding: 8 }}>Acciones</th>
        </tr>
      </thead>

      <tbody>
        {items.length === 0 ? (
          <tr>
            <td colSpan={8} style={{ padding: 12, textAlign: "center" }}>
              No hay solicitudes para mostrar
            </td>
          </tr>
        ) : (
          items.map((s) => (
            <tr key={s.id}>
              <td style={{ borderBottom: "1px solid #eee", padding: 8 }}>{s.id}</td>
              <td style={{ borderBottom: "1px solid #eee", padding: 8 }}>{s.monto?.toLocaleString?.() ?? s.monto}</td>
              <td style={{ borderBottom: "1px solid #eee", padding: 8 }}>{s.plazo}</td>
              <td style={{ borderBottom: "1px solid #eee", padding: 8 }}>{s.estado}</td>
              <td style={{ borderBottom: "1px solid #eee", padding: 8 }}>
                {s.fechaCreacion ? new Date(s.fechaCreacion).toLocaleString() : "-"}
              </td>
              <td style={{ borderBottom: "1px solid #eee", padding: 8 }}>
                {/* Editar: solo si está en Borrador (UI puede decidir habilitar o no) */}
                <button
                  onClick={() => onEdit?.(s.id)}
                  disabled={s.estado !== "Borrador"}
                  title={s.estado !== "Borrador" ? "No editable" : "Editar"}
                  style={{ marginRight: 6 }}
                >
                  Editar
                </button>

                {/* Cancelar: solo permitido cuando está en 'En validación' (HU-07) */}
                <button
                  onClick={() => onChangeState?.(s.id, "Cancelada")}
                  disabled={s.estado !== "En validación"}
                  title={s.estado !== "En validación" ? "Sólo se puede cancelar si está en 'En validación'" : "Cancelar"}
                  style={{ marginRight: 6 }}
                >
                  Cancelar
                </button>

                {/* Eliminar (lógico) */}
                <button onClick={() => onDelete?.(s.id)}>Eliminar</button>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}
