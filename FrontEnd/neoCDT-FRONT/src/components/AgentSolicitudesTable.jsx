import React from 'react';
import '../css/table.css';

function formatMonto(monto) {
  try {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(monto);
  } catch { return monto; }
}

export default function AgentSolicitudesTable(props) {
  // aceptar múltiples nombres de props para compatibilidad:
  const solicitudes = props.solicitudes ?? props.items ?? [];
  const agentes = props.agentes ?? props.agents ?? [];
  const onApprove = props.onApprove ?? props.onAprobar ?? props.onAprob;
  const onReject = props.onReject ?? props.onRechazar ?? props.onRejectar ?? props.onRechaz;
  const onAssign = props.onAssign ?? props.onAsignar ?? props.onAssignAgent ?? (() => {});
  const onOpenHist = props.onOpenHist ?? props.onVerHistorial ?? props.onOpenHistory ?? (() => {});

  if (!solicitudes || solicitudes.length === 0) {
    return <div style={{ padding: 12 }}>No hay solicitudes.</div>;
  }

  return (
    <div style={{ overflowX: 'auto', marginTop: 12 }}>
  <table className="agente-table" style={{ width: '100%' }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Cliente</th>
            <th>MONTO</th>
            <th>Fecha</th>
            <th>Estado</th>
            <th>Asignado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {solicitudes.map(s => (
            <tr key={s.id}>
              <td>{String(s.id).slice(0, 12)}</td>
              <td>{s.cliente || s.nombre || 'N/A'}</td>
              <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatMonto(s.monto)}</td>
              <td>{(s.fecha_creacion || s.fecha || '').slice(0, 10)}</td>
              <td>
                {(() => {
                  const raw = String(s.estado || '').toLowerCase();
                  let clase = '';
                  let label = s.estado || '';
                  if (raw.includes('aprob')) { clase = 'Aprobada'; label = 'Aprobada'; }
                  else if (raw.includes('rechaz')) { clase = 'Rechazada'; label = 'Rechazada'; }
                  else if (raw.includes('valid')) { clase = 'Pendiente'; label = 'Pendiente'; }
                  else if (raw.includes('pend')) { clase = 'Pendiente'; label = 'Pendiente'; }
                  else { clase = '' }
                  return <span className={`agente-estado ${clase}`}>{label}</span>
                })()}
              </td>
              <td>
                <select className="input" value={s.asignado || ''} onChange={e => onAssign(s.id, e.target.value)}>
                  <option value="">-- Sin asignar --</option>
                  {agentes.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
                </select>
              </td>
              <td>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button className="btn" disabled={String(s.estado).toLowerCase() !== 'en validación' && String(s.estado).toLowerCase() !== 'en_validacion'} onClick={() => onApprove(s)}>Aprobar</button>
                  <button className="btn btn-danger" disabled={String(s.estado).toLowerCase() !== 'en validación' && String(s.estado).toLowerCase() !== 'en_validacion'} onClick={() => onReject(s)}>Rechazar</button>
                  <button className="btn btn-ghost" onClick={() => onOpenHist(s)}>Historial</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}