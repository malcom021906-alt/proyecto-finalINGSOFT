// src/components/FilterBar.jsx
import React, { useState, useEffect } from "react";

/*
  FilterBar: recibe props:
  - initial (objeto con valores iniciales)
  - onApply(filtros): función que se llama cuando hay que aplicar los filtros
  Implementación sin librerías externas: debounce con setTimeout y cleanup en useEffect.
*/

export default function FilterBar({ initial = {}, onApply }) {
  // estados locales para inputs controlados
  const [estado, setEstado] = useState(initial.estado || "");
  const [desde, setDesde] = useState(initial.desde || "");
  const [hasta, setHasta] = useState(initial.hasta || "");
  const [montoMin, setMontoMin] = useState(initial.montoMin || "");
  const [q, setQ] = useState(initial.q || ""); // búsqueda libre

  // Debounce: cuando cualquiera cambia, esperamos 400ms para enviar onApply
  useEffect(() => {
    const handler = setTimeout(() => {
      onApply({ estado, desde, hasta, montoMin: montoMin ? Number(montoMin) : "", q });
    }, 400);

    // cleanup: si el usuario escribe antes de 400ms, limpiamos el timeout
    return () => clearTimeout(handler);
  }, [estado, desde, hasta, montoMin, q, onApply]);

  return (
    <div className="filter-bar" style={{ marginBottom: 12 }}>

      {/* Filtro por estado */}
      <select value={estado} onChange={(e) => setEstado(e.target.value)} style={{ marginRight: 8 }}>
        <option value="">Todos los estados</option>
        <option value="Borrador">Borrador</option>
        <option value="En validación">En validación</option>
        <option value="Aprobada">Aprobada</option>
        <option value="Rechazada">Rechazada</option>
        <option value="Cancelada">Cancelada</option>
      </select>

      {/* Fecha desde / hasta (inputs de tipo date) */}
      <input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} style={{ marginRight: 8 }} />
      <input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} style={{ marginRight: 8 }} />

      {/* Monto mínimo */}
      <input
        type="number"
        placeholder="Monto mínimo"
        value={montoMin}
        onChange={(e) => setMontoMin(e.target.value)}
        style={{ marginRight: 8, width: 120 }}
      />

      {/* Botón aplicar: aplica inmediatamente (útil si no quieres debounce) */}
      <button
        onClick={() => onApply({ estado, desde, hasta, montoMin: montoMin ? Number(montoMin) : "", q })}
      >
        Aplicar
      </button>
    </div>
  );
}
