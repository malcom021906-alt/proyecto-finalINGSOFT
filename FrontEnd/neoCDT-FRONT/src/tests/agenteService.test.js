import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import agenteService from "../services/agenteService";

// Mock global fetch
global.fetch = vi.fn();

describe("agenteService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    // Suprimir console.log y console.error para tests más limpios
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // =====================================================
  // TESTS PARA getAuthToken (función privada)
  // Testeamos indirectamente a través de las funciones públicas
  // =====================================================

  it("debe lanzar error cuando no hay token en localStorage", async () => {
    // No hay token en localStorage
    localStorage.removeItem("token");

    // Intentamos llamar a getSolicitudesPendientes que usa getAuthToken
    await expect(agenteService.getSolicitudesPendientes()).rejects.toThrow(
      "No hay sesión activa. Por favor, inicia sesión."
    );
  });

  // =====================================================
  // TESTS PARA getFetchConfig (función privada)
  // Testeamos indirectamente verificando las llamadas a fetch
  // =====================================================

  it("debe incluir Authorization header con Bearer token", async () => {
    localStorage.setItem("token", "test-token-123");

    fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => [],
    });

    await agenteService.getSolicitudesPendientes();

    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:8000/solicitudes/agente/pendientes",
      expect.objectContaining({
        method: "GET",
        headers: expect.objectContaining({
          "Content-Type": "application/json",
          Authorization: "Bearer test-token-123",
        }),
      })
    );
  });

  it("debe agregar body en peticiones POST", async () => {
    localStorage.setItem("token", "test-token");

    fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ success: true }),
    });

    await agenteService.rechazarSolicitud("123", "motivo test");

    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:8000/solicitudes/agente/123/rechazar",
      expect.objectContaining({
        method: "PUT",
        body: JSON.stringify({ motivo: "motivo test" }),
      })
    );
  });

  // =====================================================
  // TESTS PARA handleResponse (función privada)
  // Testeamos todos los casos de respuesta HTTP
  // =====================================================

  it("handleResponse: debe lanzar error con detalle del backend", async () => {
    localStorage.setItem("token", "test-token");

    fetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({ detail: "Error específico del backend" }),
    });

    await expect(agenteService.getSolicitudesPendientes()).rejects.toThrow(
      "Error específico del backend"
    );
  });

  it("handleResponse: debe lanzar error con message del backend", async () => {
    localStorage.setItem("token", "test-token");

    fetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ message: "No autorizado" }),
    });

    await expect(agenteService.aprobarSolicitud("123")).rejects.toThrow(
      "No autorizado"
    );
  });

  it("handleResponse: debe lanzar error genérico cuando no hay JSON válido", async () => {
    localStorage.setItem("token", "test-token");

    fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
      json: async () => {
        throw new Error("Invalid JSON");
      },
    });

    await expect(agenteService.getSolicitudesPendientes()).rejects.toThrow(
      "Error 500: Internal Server Error"
    );
  });

  it("handleResponse: debe retornar {} cuando status es 204", async () => {
    localStorage.setItem("token", "test-token");

    fetch.mockResolvedValueOnce({
      ok: true,
      status: 204,
    });

    const result = await agenteService.aprobarSolicitud("123");
    expect(result).toEqual({});
  });

  it("handleResponse: debe retornar JSON en respuesta exitosa", async () => {
    localStorage.setItem("token", "test-token");

    const mockData = { id: "123", estado: "aprobada" };
    fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockData,
    });

    const result = await agenteService.aprobarSolicitud("123");
    expect(result).toEqual(mockData);
  });

  // =====================================================
  // TESTS PARA mapEstadoBackendToFrontend
  // =====================================================

  it("mapEstadoBackendToFrontend: debe convertir 'borrador' a 'Borrador'", () => {
    expect(agenteService.mapEstadoBackendToFrontend("borrador")).toBe("Borrador");
  });

  it("mapEstadoBackendToFrontend: debe convertir 'en_validacion' a 'En validación'", () => {
    expect(agenteService.mapEstadoBackendToFrontend("en_validacion")).toBe("En validación");
  });

  it("mapEstadoBackendToFrontend: debe convertir 'aprobada' a 'Aprobada'", () => {
    expect(agenteService.mapEstadoBackendToFrontend("aprobada")).toBe("Aprobada");
  });

  it("mapEstadoBackendToFrontend: debe convertir 'rechazada' a 'Rechazada'", () => {
    expect(agenteService.mapEstadoBackendToFrontend("rechazada")).toBe("Rechazada");
  });

  it("mapEstadoBackendToFrontend: debe convertir 'cancelada' a 'Cancelada'", () => {
    expect(agenteService.mapEstadoBackendToFrontend("cancelada")).toBe("Cancelada");
  });

  it("mapEstadoBackendToFrontend: debe convertir 'enviada' a 'Enviada'", () => {
    expect(agenteService.mapEstadoBackendToFrontend("enviada")).toBe("Enviada");
  });

  it("mapEstadoBackendToFrontend: debe retornar el valor original si no está mapeado", () => {
    expect(agenteService.mapEstadoBackendToFrontend("estado_desconocido")).toBe("estado_desconocido");
  });

  // =====================================================
  // TESTS PARA mapEstadoFrontendToBackend
  // =====================================================

  it("mapEstadoFrontendToBackend: debe convertir 'Borrador' a 'borrador'", () => {
    expect(agenteService.mapEstadoFrontendToBackend("Borrador")).toBe("borrador");
  });

  it("mapEstadoFrontendToBackend: debe convertir 'En validación' a 'en_validacion'", () => {
    expect(agenteService.mapEstadoFrontendToBackend("En validación")).toBe("en_validacion");
  });

  it("mapEstadoFrontendToBackend: debe convertir 'Aprobada' a 'aprobada'", () => {
    expect(agenteService.mapEstadoFrontendToBackend("Aprobada")).toBe("aprobada");
  });

  it("mapEstadoFrontendToBackend: debe convertir estado desconocido correctamente", () => {
    expect(agenteService.mapEstadoFrontendToBackend("Nuevo Estado")).toBe("nuevo_estado");
  });

  // =====================================================
  // TESTS PARA getSolicitudesPendientes
  // =====================================================

  it("getSolicitudesPendientes: debe retornar datos transformados correctamente", async () => {
    localStorage.setItem("token", "test-token");

    const mockBackendData = [
      {
        id: "sol-001",
        usuario_id: "user-123",
        monto: 1000000,
        plazo_meses: 12,
        tasa: 5.5,
        estado: "en_validacion",
        fechaCreacion: "2025-11-09T10:00:00Z",
        fechaActualizacion: "2025-11-09T11:00:00Z",
        historial: [{ accion: "Creada" }],
      },
    ];

    fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockBackendData,
    });

    const result = await agenteService.getSolicitudesPendientes();

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      id: "sol-001",
      cliente_nombre: "user-123",
      usuario_id: "user-123",
      monto: 1000000,
      plazo_dias: 360, // 12 meses * 30
      plazo_meses: 12,
      tasa_interes: 5.5,
      tasa: 5.5,
      estado: "En validación",
      fecha_creacion: "2025-11-09T10:00:00Z",
      fecha: "2025-11-09T10:00:00Z",
      fechaCreacion: "2025-11-09T10:00:00Z",
      fechaActualizacion: "2025-11-09T11:00:00Z",
      historial: [{ accion: "Creada" }],
    });
  });

  it("getSolicitudesPendientes: debe manejar respuesta que no es array", async () => {
    localStorage.setItem("token", "test-token");

    fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ error: "Not an array" }),
    });

    const result = await agenteService.getSolicitudesPendientes();
    expect(result).toEqual([]);
  });

  it("getSolicitudesPendientes: debe manejar array vacío", async () => {
    localStorage.setItem("token", "test-token");

    fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => [],
    });

    const result = await agenteService.getSolicitudesPendientes();
    expect(result).toEqual([]);
  });

  it("getSolicitudesPendientes: debe propagar error de fetch", async () => {
    localStorage.setItem("token", "test-token");

    fetch.mockRejectedValueOnce(new Error("Network error"));

    await expect(agenteService.getSolicitudesPendientes()).rejects.toThrow("Network error");
  });

  it("getSolicitudesPendientes: debe transformar múltiples solicitudes", async () => {
    localStorage.setItem("token", "test-token");

    const mockBackendData = [
      {
        id: "1",
        usuario_id: "u1",
        monto: 500000,
        plazo_meses: 6,
        tasa: 4.5,
        estado: "borrador",
        fechaCreacion: "2025-11-01",
        fechaActualizacion: "2025-11-01",
        historial: [],
      },
      {
        id: "2",
        usuario_id: "u2",
        monto: 2000000,
        plazo_meses: 24,
        tasa: 6.0,
        estado: "aprobada",
        fechaCreacion: "2025-11-05",
        fechaActualizacion: "2025-11-06",
        historial: [],
      },
    ];

    fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockBackendData,
    });

    const result = await agenteService.getSolicitudesPendientes();

    expect(result).toHaveLength(2);
    expect(result[0].plazo_dias).toBe(180); // 6 * 30
    expect(result[1].plazo_dias).toBe(720); // 24 * 30
    expect(result[0].estado).toBe("Borrador");
    expect(result[1].estado).toBe("Aprobada");
  });

  // =====================================================
  // TESTS PARA aprobarSolicitud
  // =====================================================

  it("aprobarSolicitud: debe aprobar correctamente", async () => {
    localStorage.setItem("token", "test-token");

    const mockResponse = { id: "sol-123", estado: "aprobada" };
    fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockResponse,
    });

    const result = await agenteService.aprobarSolicitud("sol-123");

    expect(result).toEqual(mockResponse);
    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:8000/solicitudes/agente/sol-123/aprobar",
      expect.objectContaining({
        method: "PUT",
      })
    );
  });

  it("aprobarSolicitud: debe propagar error de fetch", async () => {
    localStorage.setItem("token", "test-token");

    fetch.mockRejectedValueOnce(new Error("Server error"));

    await expect(agenteService.aprobarSolicitud("sol-123")).rejects.toThrow("Server error");
  });

  it("aprobarSolicitud: debe manejar respuesta de error HTTP", async () => {
    localStorage.setItem("token", "test-token");

    fetch.mockResolvedValueOnce({
      ok: false,
      status: 403,
      json: async () => ({ detail: "No autorizado para aprobar" }),
    });

    await expect(agenteService.aprobarSolicitud("sol-123")).rejects.toThrow(
      "No autorizado para aprobar"
    );
  });

  // =====================================================
  // TESTS PARA rechazarSolicitud
  // =====================================================

  it("rechazarSolicitud: debe rechazar con motivo correctamente", async () => {
    localStorage.setItem("token", "test-token");

    const mockResponse = { id: "sol-456", estado: "rechazada" };
    fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockResponse,
    });

    const result = await agenteService.rechazarSolicitud("sol-456", "Documentación incompleta");

    expect(result).toEqual(mockResponse);
    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:8000/solicitudes/agente/sol-456/rechazar",
      expect.objectContaining({
        method: "PUT",
        body: JSON.stringify({ motivo: "Documentación incompleta" }),
      })
    );
  });

  it("rechazarSolicitud: debe propagar error de fetch", async () => {
    localStorage.setItem("token", "test-token");

    fetch.mockRejectedValueOnce(new Error("Connection refused"));

    await expect(
      agenteService.rechazarSolicitud("sol-456", "motivo")
    ).rejects.toThrow("Connection refused");
  });

  it("rechazarSolicitud: debe manejar respuesta de error HTTP", async () => {
    localStorage.setItem("token", "test-token");

    fetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => ({ detail: "Solicitud no encontrada" }),
    });

    await expect(
      agenteService.rechazarSolicitud("sol-999", "motivo")
    ).rejects.toThrow("Solicitud no encontrada");
  });

  // =====================================================
  // TESTS DE COBERTURA ADICIONALES
  // =====================================================

  it("debe incluir todas las propiedades en el objeto exportado", () => {
    expect(agenteService).toHaveProperty("getSolicitudesPendientes");
    expect(agenteService).toHaveProperty("aprobarSolicitud");
    expect(agenteService).toHaveProperty("rechazarSolicitud");
    expect(agenteService).toHaveProperty("mapEstadoBackendToFrontend");
    expect(agenteService).toHaveProperty("mapEstadoFrontendToBackend");
  });
});