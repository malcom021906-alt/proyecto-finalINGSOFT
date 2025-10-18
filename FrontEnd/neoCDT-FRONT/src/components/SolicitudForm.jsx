// src/components/SolicitudForm.jsx
import React, { useState, useEffect } from "react";

export default function SolicitudForm({ initialData = null, onSubmit, onCancel, submitting = false }) {
  const [monto, setMonto] = useState("");
  const [plazo, setPlazo] = useState("");
  const [tasaInteres, setTasaInteres] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    if (initialData) {
      setMonto(initialData.monto || "");
      setPlazo(initialData.plazo || "");
      setTasaInteres(initialData.tasaInteres || "");
    }
  }, [initialData]);

  const validate = () => {
    if (!monto || Number(monto) < 10000) {
      return "Monto mínimo es 10,000 COP";
    }
    if (!plazo || plazo <= 0) {
      return "El plazo debe ser mayor a 0 días";
    }
    if (tasaInteres < 0) {
      return "La tasa de interés no puede ser negativa";
    }
    return null;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    const solicitud = {
      monto: Number(monto),
      plazo: Number(plazo),
      tasaInteres: Number(tasaInteres),
      estado: initialData?.estado || "En validación",
    };

    onSubmit?.(solicitud);

    if (!initialData) {
      setMonto("");
      setPlazo("");
      setTasaInteres("");
      setError(null);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Mensaje de error */}
      {error && <div className="form-error">{error}</div>}

      {/* Monto */}
      <div className="form-group">
        <label className="required">Monto (COP)</label>
        <input
          type="number"
          value={monto}
          onChange={(e) => {
            setMonto(e.target.value);
            setError(null);
          }}
          placeholder="Ej: 50000000"
          className={error && !monto ? "error" : ""}
        />
        <div className="form-helper">Monto mínimo: $10,000 COP</div>
      </div>

      {/* Plazo */}
      <div className="form-group">
        <label className="required">Plazo (días)</label>
        <input
          type="number"
          value={plazo}
          onChange={(e) => {
            setPlazo(e.target.value);
            setError(null);
          }}
          placeholder="Ej: 30"
          className={error && !plazo ? "error" : ""}
        />
        <div className="form-helper">Plazo en días para el CDT</div>
      </div>

      {/* Tasa */}
      <div className="form-group">
        <label className="required">Tasa de Interés (%)</label>
        <input
          type="number"
          step="0.01"
          value={tasaInteres}
          onChange={(e) => {
            setTasaInteres(e.target.value);
            setError(null);
          }}
          placeholder="Ej: 7.5"
          className={error && !tasaInteres ? "error" : ""}
        />
        <div className="form-helper">Tasa de interés anual efectiva</div>
      </div>

      {/* Botones de acción */}
      <div className="form-actions">
        <button type="submit" disabled={submitting}>
          {submitting ? "Enviando..." : initialData ? "Guardar cambios" : "Crear solicitud"}
        </button>
        <button type="button" onClick={onCancel} disabled={submitting}>
          Cancelar
        </button>
      </div>
    </form>
  );
}