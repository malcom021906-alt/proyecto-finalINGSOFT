// src/components/SolicitudForm.jsx
import React, { useState, useEffect } from "react";

<<<<<<< HEAD
export default function SolicitudForm({ initialData = null, onSubmit, onCancel, submitting = false }) {
  const [monto, setMonto] = useState("");
  const [plazo, setPlazo] = useState("");
  const [tasaInteres, setTasaInteres] = useState("");
  const [error, setError] = useState(null);
=======
export default function SolicitudForm({ initialData, onSubmit, submitting, onCancel }) {
  const [formData, setFormData] = useState({
    monto: "",
    plazo_meses: "",
  });

  const [errors, setErrors] = useState({});
>>>>>>> 32565a7ac88048d5b222d8e75467d2c6482562f3

  useEffect(() => {
    if (initialData) {
      setFormData({
        monto: initialData.monto || "",
        plazo_meses: initialData.plazo_meses || "",
      });
    }
  }, [initialData]);

  const validate = () => {
<<<<<<< HEAD
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
=======
    const newErrors = {};

    // Validar monto
    const monto = parseInt(formData.monto);
    if (!formData.monto || isNaN(monto)) {
      newErrors.monto = "El monto es requerido";
    } else if (monto < 10000) {
      newErrors.monto = "El monto mínimo es 10,000";
    }

    // Validar plazo
    const plazo = parseInt(formData.plazo_meses);
    if (!formData.plazo_meses || isNaN(plazo)) {
      newErrors.plazo_meses = "El plazo es requerido";
    } else if (plazo < 1) {
      newErrors.plazo_meses = "El plazo debe ser al menos 1 mes";
    } else if (plazo > 60) {
      newErrors.plazo_meses = "El plazo máximo es 60 meses";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
>>>>>>> 32565a7ac88048d5b222d8e75467d2c6482562f3
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

<<<<<<< HEAD
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
=======
    // Enviar datos con números parseados
    onSubmit({
      monto: parseInt(formData.monto),
      plazo_meses: parseInt(formData.plazo_meses),
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Limpiar error del campo cuando el usuario escribe
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
>>>>>>> 32565a7ac88048d5b222d8e75467d2c6482562f3
    }
  };

  return (
<<<<<<< HEAD
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
=======
    <form onSubmit={handleSubmit} className="solicitud-form">
      <div className="form-group">
        <label htmlFor="monto">
          Monto del CDT *
          <span className="form-hint">Mínimo: $10,000</span>
        </label>
        <input
          type="number"
          id="monto"
          name="monto"
          value={formData.monto}
          onChange={handleChange}
          placeholder="Ej: 50000"
          min="10000"
          step="1000"
          disabled={submitting}
          className={errors.monto ? "error" : ""}
        />
        {errors.monto && <span className="error-message">{errors.monto}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="plazo_meses">
          Plazo en meses *
          <span className="form-hint">Entre 1 y 60 meses</span>
        </label>
        <input
          type="number"
          id="plazo_meses"
          name="plazo_meses"
          value={formData.plazo_meses}
          onChange={handleChange}
          placeholder="Ej: 12"
          min="1"
          max="60"
          disabled={submitting}
          className={errors.plazo_meses ? "error" : ""}
        />
        {errors.plazo_meses && <span className="error-message">{errors.plazo_meses}</span>}
      </div>

      {initialData && (
        <div className="form-info">
          <p><strong>Estado actual:</strong> {initialData.estado}</p>
          <p><strong>Tasa actual:</strong> {initialData.tasa}%</p>
        </div>
      )}

      <div className="form-actions">
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="btn-secondary"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="btn-primary"
        >
          {submitting ? "Guardando..." : (initialData ? "Actualizar" : "Crear Solicitud")}
        </button>
      </div>
>>>>>>> 32565a7ac88048d5b222d8e75467d2c6482562f3
    </form>
  );
}