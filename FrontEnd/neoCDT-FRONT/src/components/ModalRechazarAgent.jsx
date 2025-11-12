/* eslint-disable react/prop-types */
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

export default function ModalRechazarAgent({ open, onClose, solicitud, onConfirm }) {
  const [motivo, setMotivo] = useState('');

  // ✅ FIX: Comparar directamente con undefined
  const show = open === undefined ? true : !!open;
  
  useEffect(() => { 
    if (show) setMotivo(''); 
  }, [show]);

  if (!show) return null;
  
  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ width: 520 }}>
        <h3>Rechazar solicitud</h3>
        <p>Indica el motivo del rechazo para <strong>{solicitud?.id}</strong></p>
        <textarea 
          value={motivo} 
          onChange={e => setMotivo(e.target.value)} 
          rows={5} 
          style={{ width: '100%' }} 
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
          <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button 
            className="btn btn-danger" 
            onClick={() => {
              if (!motivo.trim()) { 
                toast.warn('Ingrese un motivo'); 
                return; 
              }
              onConfirm(motivo.trim());
            }}
          >
            Confirmar rechazo
          </button>
        </div>
      </div>
    </div>
  );
}