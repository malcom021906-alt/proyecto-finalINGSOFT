// src/components/SolicitudForm.jsx
import React, { useState, useEffect } from "react";

/*
  SolicitudForm:
  Props:
    - initialData: objeto con datos iniciales (para editar). Si es null => modo creación.
    - onSubmit(solicitud): callback cuando el formulario se envía correctamente.
    - onCancel(): callback cuando se cancela la acción.
*/

export default function SolicitudForm({ initialData = null, onSubmit, onCancel, submitting = false }) {
  // Estados controlados para cada campo del formulario
  const [monto, setMonto] = useState("");
  const [plazo, setPlazo] = useState("");
  const [tasaInteres, setTasaInteres] = useState("");
  const [error, setError] = useState(null);

  // Al montar, si hay datos iniciales => modo edición: rellenar inputs
  useEffect(() => {
    if (initialData) {
      setMonto(initialData.monto || "");
      setPlazo(initialData.plazo || "");
      setTasaInteres(initialData.tasaInteres || "");
    }
  }, [initialData]);

  // Validaciones de los campos antes de enviar
  const validate = () => {
    if (!monto || Number(monto) < 10000) {
      return "Monto mínimo es 10000";
    }
    if (!plazo || plazo <= 0) {
      return "El plazo debe ser mayor a 0";
    }
    if (tasaInteres < 0) {
      return "La tasa de interés no puede ser negativa";
    }
    return null; // si no hay errores
  };

  // Manejo del submit
  const handleSubmit = (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    // Construimos el objeto solicitud con los valores del form
    const solicitud = {
      monto: Number(monto),
      plazo: Number(plazo),
      tasaInteres: Number(tasaInteres),
      estado: initialData?.estado || "En validación", // por defecto al crear -> En validación según HU-03
    };

    // Llamamos al callback que viene desde la página
    onSubmit?.(solicitud);

    // Reiniciamos el form solo si es creación
    if (!initialData) {
      setMonto("");
      setPlazo("");
      setTasaInteres("");
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ padding: 16, border: "1px solid #ccc", borderRadius: 8 }}>
      <h3>{initialData ? "Editar Solicitud" : "Nueva Solicitud"}</h3>

      {/* Monto */}
      <div style={{ marginBottom: 12 }}>
        <label>Monto (COP):</label>
        <input
          type="number"
          value={monto}
          onChange={(e) => setMonto(e.target.value)}
          placeholder="Ingrese monto"
          style={{ marginLeft: 8 }}
        />
      </div>

      {/* Plazo */}
      <div style={{ marginBottom: 12 }}>
        <label>Plazo (días):</label>
        <input
          type="number"
          value={plazo}
          onChange={(e) => setPlazo(e.target.value)}
          placeholder="Ejemplo: 30"
          style={{ marginLeft: 8 }}
        />
      </div>

      {/* Tasa */}
      <div style={{ marginBottom: 12 }}>
        <label>Tasa de Interés (%):</label>
        <input
          type="number"
          step="0.01"
          value={tasaInteres}
          onChange={(e) => setTasaInteres(e.target.value)}
          placeholder="Ejemplo: 7.5"
          style={{ marginLeft: 8 }}
        />
      </div>

      {/* Mensaje de error si la validación falla */}
      {error && <div style={{ color: "red", marginBottom: 12 }}>{error}</div>}

      {/* Botones de acción */}
      <button type="submit" style={{ marginRight: 8 }} disabled={submitting}>
        {submitting ? "Enviando..." : initialData ? "Guardar cambios" : "Crear"}
      </button>
      <button type="button" onClick={onCancel} disabled={submitting}>
        Cancelar
      </button>
    </form>
  );
}
