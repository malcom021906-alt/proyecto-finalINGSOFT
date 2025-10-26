// src/components/Modal.jsx
import React from "react";
import "../css/modal.css"

/*
  Modal genérico reutilizable.
  Props:
    - title: título del modal
    - children: contenido a renderizar (ej: un formulario)
    - onClose(): función para cerrar el modal
*/

export default function Modal({ title, children, onClose }) {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        {/* Encabezado */}
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="modal-close" onClick={onClose} type="button">
            ✕
          </button>
        </div>

        {/* Contenido dinámico */}
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}