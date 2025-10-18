// src/components/FilterBar.jsx
import React, { useState, useEffect } from "react";

export default function FilterBar({ initial = {}, onApply }) {
  const [estado, setEstado] = useState(initial.estado || "");
  const [desde, setDesde] = useState(initial.desde || "");
  const [hasta, setHasta] = useState(initial.hasta || "");
  const [montoMin, setMontoMin] = useState(initial.montoMin || "");
  const [q] = useState(initial.q || "");

  // Debounce: cuando cualquiera cambia, esperamos 400ms para enviar onApply
  useEffect(() => {
    const handler = setTimeout(() => {
      onApply({ estado, desde, hasta, montoMin: montoMin ? Number(montoMin) : "", q });
    }, 400);

    return () => clearTimeout(handler);
  }, [estado, desde, hasta, montoMin, q, onApply]);

  return (
    <div className="filter-bar">
      {/* Filtro por estado */}
      <select value={estado} onChange={(e) => setEstado(e.target.value)}>
        <option value="">Todos los estados</option>
        <option value="Borrador">Borrador</option>
        <option value="En validación">En validación</option>
        <option value="Aprobada">Aprobada</option>
        <option value="Rechazada">Rechazada</option>
        <option value="Cancelada">Cancelada</option>
      </select>

      {/* Fecha desde / hasta */}
      <input 
        type="date" 
        value={desde} 
        onChange={(e) => setDesde(e.target.value)}
        placeholder="Fecha desde"
      />
      <input 
        type="date" 
        value={hasta} 
        onChange={(e) => setHasta(e.target.value)}
        placeholder="Fecha hasta"
      />

      {/* Monto mínimo */}
      <input
        type="number"
        placeholder="Monto mínimo"
        value={montoMin}
        onChange={(e) => setMontoMin(e.target.value)}
      />

      {/* Botón aplicar */}
      <button
        onClick={() => onApply({ estado, desde, hasta, montoMin: montoMin ? Number(montoMin) : "", q })}
      >
        Aplicar Filtros
      </button>
    </div>
  );
}