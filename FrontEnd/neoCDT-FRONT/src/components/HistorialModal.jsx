import React from 'react';

export default function HistorialModal({ open, onClose, historial = [] }) {
  const show = typeof open === 'undefined' ? true : !!open;
  if (!show) return null;
  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ width: 420, marginLeft: 'auto', height: '100vh', borderRadius: '0 6px 6px 0', overflowY: 'auto' }}>
        <div style={{ padding: 16 }}>
          <h3>Historial</h3>
          {historial.length === 0 && <p>No hay eventos registrados.</p>}
          <ul>
            {historial.map((h, idx) => (
              <li key={idx} style={{ marginBottom: 10 }}>
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