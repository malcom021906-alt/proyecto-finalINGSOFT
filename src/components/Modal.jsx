// src/components/Modal.jsx
import React from "react";

/*
  Modal genérico reutilizable.
  Props:
    - title: título del modal
    - children: contenido a renderizar (ej: un formulario)
    - onClose(): función para cerrar el modal
*/

export default function Modal({ title, children, onClose }) {
  return (
    <div
      style={{
        position: "fixed",
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: "rgba(0,0,0,0.5)", // fondo oscuro semitransparente
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          backgroundColor: "#fff",
          padding: 20,
          borderRadius: 8,
          width: "400px",
          maxWidth: "90%",
          boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
        }}
      >
        {/* Encabezado */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
          <h3 style={{ margin: 0 }}>{title}</h3>
          <button onClick={onClose} style={{ border: "none", background: "none", fontSize: 18 }}>
            ✕
          </button>
        </div>

        {/* Contenido dinámico */}
        <div>{children}</div>
      </div>
    </div>
  );
}
