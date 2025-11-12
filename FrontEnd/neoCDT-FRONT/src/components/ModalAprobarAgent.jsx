/* eslint-disable react/prop-types */
import React from 'react';

export default function ModalAprobarAgent({ open, onClose, solicitud, onConfirm }) {
  // ✅ FIX: Comparar directamente con undefined
  const show = open === undefined ? true : !!open;
  
  if (!show) return null;
  
  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ width: 420 }}>
        <h3>Confirmar aprobación</h3>
        <p>¿Deseas aprobar la solicitud <strong>{solicitud?.id}</strong> de {solicitud?.cliente} por {solicitud?.monto}?</p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn" onClick={onConfirm}>Confirmar</button>
        </div>
      </div>
    </div>
  );
}