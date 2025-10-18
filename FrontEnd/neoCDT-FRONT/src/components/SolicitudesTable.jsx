// src/components/SolicitudesTable.jsx s
import React from "react";

export default function SolicitudesTable({ items, onEdit, onChangeState }) {
  const formatMonto = (monto) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(monto);
  };

  const formatFecha = (fecha) => {
    if (!fecha) return 'N/A';
    try {
      const date = new Date(fecha);
      return date.toLocaleString('es-CO', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'N/A';
    }
  };

  const getEstadoBadgeClass = (estado) => {
    const baseClass = "badge ";
    switch (estado?.toLowerCase()) {
      case 'borrador':
        return baseClass + "badge-draft";
      case 'en validación':
      case 'en_validacion':
        return baseClass + "badge-pending";
      case 'aprobada':
        return baseClass + "badge-approved";
      case 'rechazada':
        return baseClass + "badge-rejected";
      case 'cancelada':
        return baseClass + "badge-cancelled";
      default:
        return baseClass + "badge-default";
    }
  };

  const getAccionesDisponibles = (estado) => {
    const estadoLower = estado?.toLowerCase();
    return {
      puedeEditar: estadoLower === 'borrador',
      puedeEnviar: estadoLower === 'borrador',
      puedeCancelar: estadoLower === 'borrador' || estadoLower === 'en validación' || estadoLower === 'en_validacion',
      puedeEliminar: estadoLower === 'borrador'
    };
  };

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className="table-container" style={{ overflowX: 'auto' }}>
      <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f5f5f5', borderBottom: '2px solid #ddd' }}>
            <th style={{ padding: '12px 8px', textAlign: 'left' }}>ID</th>
            <th style={{ padding: '12px 8px', textAlign: 'right' }}>MONTO</th>
            <th style={{ padding: '12px 8px', textAlign: 'center' }}>PLAZO</th>
            <th style={{ padding: '12px 8px', textAlign: 'center' }}>TASA</th>
            <th style={{ padding: '12px 8px', textAlign: 'center' }}>ESTADO</th>
            <th style={{ padding: '12px 8px', textAlign: 'left' }}>FECHA DE CREACIÓN</th>
            <th style={{ padding: '12px 8px', textAlign: 'center' }}>ACCIONES</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const acciones = getAccionesDisponibles(item.estado);
            
            return (
              <tr key={item.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '12px 8px', fontSize: '0.85rem', color: '#666' }}>
                  {item.id.substring(0, 8)}...
                </td>
                <td style={{ padding: '12px 8px', textAlign: 'right', fontWeight: '600' }}>
                  {formatMonto(item.monto)}
                </td>
                <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                  <strong>{item.plazo_meses}</strong> {item.plazo_meses === 1 ? 'mes' : 'meses'}
                </td>
                <td style={{ padding: '12px 8px', textAlign: 'center', fontWeight: '600', color: '#2563eb' }}>
                  {item.tasa ? `${item.tasa}%` : 'N/A'}
                </td>
                <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                  <span className={getEstadoBadgeClass(item.estado)}>
                    {item.estado}
                  </span>
                </td>
                <td style={{ padding: '12px 8px', fontSize: '0.9rem' }}>
                  {formatFecha(item.fechaCreacion)}
                </td>
                <td style={{ padding: '12px 8px' }}>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
                    {acciones.puedeEditar && (
                      <button
                        onClick={() => onEdit(item.id)}
                        className="btn-action btn-edit"
                        title="Editar"
                        style={{
                          padding: '6px 12px',
                          fontSize: '0.85rem',
                          background: '#d4a373',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        Editar
                      </button>
                    )}
                    
                    {acciones.puedeEnviar && (
                      <button
                        onClick={() => onChangeState(item.id, "En validación")}
                        className="btn-action btn-send"
                        title="Enviar a validación"
                        style={{
                          padding: '6px 12px',
                          fontSize: '0.85rem',
                          background: '#3b82f6',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        Enviar
                      </button>
                    )}
                    
                    {acciones.puedeCancelar && (
                      <button
                        onClick={() => onChangeState(item.id, "Cancelada")}
                        className="btn-action btn-cancel"
                        title="Cancelar"
                        style={{
                          padding: '6px 12px',
                          fontSize: '0.85rem',
                          background: '#ff0101ff',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        Cancelar
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      
      <style jsx>{`
        .badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 0.85rem;
          font-weight: 600;
          text-transform: capitalize;
        }
        
        .badge-draft {
          background: #dbeafe;
          color: #1e40af;
        }
        
        .badge-pending {
          background: #fef3c7;
          color: #92400e;
        }
        
        .badge-approved {
          background: #d1fae5;
          color: #065f46;
        }
        
        .badge-rejected {
          background: #fee2e2;
          color: #991b1b;
        }
        
        .badge-cancelled {
          background: #f3f4f6;
          color: #4b5563;
        }
        
        .badge-default {
          background: #e5e7eb;
          color: #374151;
        }
        
        .btn-action:hover {
          opacity: 0.85;
          transform: translateY(-1px);
          transition: all 0.2s;
        }
        
        .btn-action:active {
          transform: translateY(0);
        }
        
        .table-container {
          margin-top: 1rem;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
          background: white;
        }
        
        tr:hover {
          background: #f9fafb;
        }
      `}</style>
    </div>
  );
}