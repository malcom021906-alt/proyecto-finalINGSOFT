// Datos de prueba para solicitudes
export const mockSolicitudes = [
  {
    id: "1",
    cliente: "Juan Pérez",
    monto: 5000000,
    fecha_creacion: "2025-11-06T10:00:00Z",
    estado: "en_validacion",
    asignado: "",
    historial: [
      { fecha: "2025-11-06T10:00:00Z", usuario: "cliente", accion: "Creada" }
    ]
  },
  {
    id: "2",
    cliente: "María López",
    monto: 10000000,
    fecha_creacion: "2025-11-05T15:30:00Z",
    estado: "Aprobada",
    asignado: "agente1",
    historial: [
      { fecha: "2025-11-05T15:30:00Z", usuario: "cliente", accion: "Creada" },
      { fecha: "2025-11-05T16:00:00Z", usuario: "agente", accion: "Aprobada" }
    ]
  }
];

// Datos de prueba para agentes
export const mockAgentes = [
  { id: "agente1", nombre: "Carlos Agente" },
  { id: "agente2", nombre: "Ana Agente" }
];