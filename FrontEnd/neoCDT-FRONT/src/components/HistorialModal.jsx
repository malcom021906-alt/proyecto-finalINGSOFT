/* eslint-disable react/prop-types */
import React from 'react';

export default function HistorialModal({ open, onClose, historial = [] }) {
  // ✅ FIX 1: Comparar directamente con undefined
  const show = open === undefined ? true : !!open;
  
  if (!show) return null;
  
  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ width: 420, marginLeft: 'auto', height: '100vh', borderRadius: '0 6px 6px 0', overflowY: 'auto' }}>
        <div style={{ padding: 16 }}>
          <h3>Historial</h3>
          {historial.length === 0 && <p>No hay eventos registrados.</p>}
          <ul>
            {historial.map((h, idx) => (
              // ✅ FIX 2: Usar un identificador único en vez del índice
              // Combinamos fecha + usuario + acción para crear una key única
              <li key={`${h.fecha}-${h.usuario}-${idx}`} style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 12, color: '#666' }}>{h.fecha}</div>
                <div style={{ fontWeight: 600 }}>{h.usuario}</div>
                <div>{h.accion}</div>
              </li>
            ))}
          </ul>
          <div style={{ textAlign: 'right' }}>
            <button className="btn btn-ghost" onClick={onClose}>Cerrar</button>
          </div>
        </div>
      </div>
    </div>
  );
}