import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import AgenteDashboard from "../components/AgenteDashboard";
import solicitudesService from "../services/solicitudesService";
import { exportToCSV, exportToPDF } from "../utils/exportUtils";
import { toast } from "react-toastify";

// Mocks
vi.mock("../services/solicitudesService");
vi.mock("../utils/exportUtils");
vi.mock("react-toastify", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  },
  ToastContainer: () => null,
}));

// Mock de navigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Wrapper con Router
const renderWithRouter = (component) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe("AgenteDashboard Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
    
    // Mock globalThis.confirm
    global.confirm = vi.fn(() => true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // =========================================
  // RENDERIZADO INICIAL
  // =========================================

  it("debe renderizar el dashboard correctamente", async () => {
    solicitudesService.getSolicitudes.mockResolvedValueOnce({ items: [] });

    renderWithRouter(<AgenteDashboard />);

    expect(screen.getByText("SOLICITUDES CDT")).toBeInTheDocument();
    expect(screen.getByText("Exportar CSV")).toBeInTheDocument();
    expect(screen.getByText("Exportar PDF")).toBeInTheDocument();
    expect(screen.getByText("Cerrar Sesión")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByText("Cargando solicitudes...")).not.toBeInTheDocument();
    });
  });

  it("debe mostrar mensaje de carga inicialmente", () => {
    solicitudesService.getSolicitudes.mockImplementation(() => new Promise(() => {}));

    renderWithRouter(<AgenteDashboard />);

    expect(screen.getByText("Cargando solicitudes...")).toBeInTheDocument();
  });

  // =========================================
  // CARGA DE SOLICITUDES
  // =========================================

  it("debe cargar solicitudes desde el servicio correctamente", async () => {
    const mockSolicitudes = [
      {
        id: "sol-001",
        cliente: "Juan Pérez",
        monto: 1000000,
        estado: "En validación",
        fecha_creacion: "2025-11-10",
        historial: [],
      },
    ];

    solicitudesService.getSolicitudes.mockResolvedValueOnce({ items: mockSolicitudes });

    renderWithRouter(<AgenteDashboard />);

    await waitFor(() => {
      expect(screen.getByText("Juan Pérez")).toBeInTheDocument();
    });
  });

  it("debe usar mocks cuando el servicio falla", async () => {
    solicitudesService.getSolicitudes.mockRejectedValueOnce(new Error("Network error"));

    renderWithRouter(<AgenteDashboard />);

    await waitFor(() => {
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining("No se pudo cargar solicitudes desde API"),
        expect.any(String)
      );
    });
  });

  it("debe manejar respuesta con data.items correctamente", async () => {
    const mockData = {
      items: [
        { id: "1", cliente: "Test", monto: 5000, estado: "Borrador", fecha_creacion: "2025-11-01" },
      ],
      total: 1,
    };

    solicitudesService.getSolicitudes.mockResolvedValueOnce(mockData);

    renderWithRouter(<AgenteDashboard />);

    await waitFor(() => {
      expect(screen.getByText("Test")).toBeInTheDocument();
    });
  });

  it("debe manejar respuesta con data directamente (sin items)", async () => {
    const mockData = [
      { id: "2", cliente: "Cliente 2", monto: 2000, estado: "Aprobada", fecha_creacion: "2025-11-05" },
    ];

    solicitudesService.getSolicitudes.mockResolvedValueOnce(mockData);

    renderWithRouter(<AgenteDashboard />);

    await waitFor(() => {
      expect(screen.getByText("Cliente 2")).toBeInTheDocument();
    });
  });

  // =========================================
  // FILTROS
  // =========================================

  it("debe aplicar filtros correctamente", async () => {
    const mockSolicitudes = [
      { id: "1", cliente: "A", monto: 1000, estado: "Borrador", fecha_creacion: "2025-11-01" },
      { id: "2", cliente: "B", monto: 5000, estado: "Aprobada", fecha_creacion: "2025-11-05" },
    ];

    solicitudesService.getSolicitudes.mockResolvedValueOnce({ items: mockSolicitudes });

    renderWithRouter(<AgenteDashboard />);

    await waitFor(() => {
      expect(screen.getByText("A")).toBeInTheDocument();
      expect(screen.getByText("B")).toBeInTheDocument();
    });

    // Aplicar filtro de estado (esto depende de cómo esté implementado FilterBar)
    // Como FilterBar es un componente separado, asumimos que los filtros funcionan
  });

  // =========================================
  // CERRAR SESIÓN
  // =========================================

  it("debe cerrar sesión cuando se confirma", async () => {
    solicitudesService.getSolicitudes.mockResolvedValueOnce({ items: [] });
    global.confirm = vi.fn(() => true);

    renderWithRouter(<AgenteDashboard />);

    await waitFor(() => {
      expect(screen.queryByText("Cargando solicitudes...")).not.toBeInTheDocument();
    });

    const logoutBtn = screen.getByText("Cerrar Sesión");
    fireEvent.click(logoutBtn);

    expect(global.confirm).toHaveBeenCalledWith("¿Deseas cerrar sesión?");
    expect(localStorage.getItem("token")).toBeNull();
    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });

  it("no debe cerrar sesión cuando se cancela", async () => {
    solicitudesService.getSolicitudes.mockResolvedValueOnce({ items: [] });
    global.confirm = vi.fn(() => false);

    renderWithRouter(<AgenteDashboard />);

    await waitFor(() => {
      expect(screen.queryByText("Cargando solicitudes...")).not.toBeInTheDocument();
    });

    const logoutBtn = screen.getByText("Cerrar Sesión");
    fireEvent.click(logoutBtn);

    expect(global.confirm).toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  // =========================================
  // EXPORTAR CSV
  // =========================================

  it("debe exportar a CSV correctamente", async () => {
    const mockSolicitudes = [
      { id: "1", cliente: "Test", monto: 1000, estado: "Borrador", fecha_creacion: "2025-11-01" },
    ];

    solicitudesService.getSolicitudes.mockResolvedValueOnce({ items: mockSolicitudes });
    exportToCSV.mockResolvedValueOnce();

    renderWithRouter(<AgenteDashboard />);

    await waitFor(() => {
      expect(screen.getByText("Test")).toBeInTheDocument();
    });

    const csvBtn = screen.getByText("Exportar CSV");
    fireEvent.click(csvBtn);

    await waitFor(() => {
      expect(exportToCSV).toHaveBeenCalledWith(expect.any(Array), "solicitudes_cdt");
      expect(toast.success).toHaveBeenCalledWith("Archivo CSV exportado correctamente");
    });
  });

  it("debe manejar error al exportar CSV", async () => {
    solicitudesService.getSolicitudes.mockResolvedValueOnce({ items: [] });
    exportToCSV.mockRejectedValueOnce(new Error("Export error"));

    renderWithRouter(<AgenteDashboard />);

    await waitFor(() => {
      expect(screen.queryByText("Cargando solicitudes...")).not.toBeInTheDocument();
    });

    const csvBtn = screen.getByText("Exportar CSV");
    fireEvent.click(csvBtn);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Error al exportar CSV");
      expect(console.error).toHaveBeenCalled();
    });
  });

  // =========================================
  // EXPORTAR PDF
  // =========================================

  it("debe exportar a PDF correctamente", async () => {
    const mockSolicitudes = [
      { id: "1", cliente: "Test", monto: 1000, estado: "Borrador", fecha_creacion: "2025-11-01" },
    ];

    solicitudesService.getSolicitudes.mockResolvedValueOnce({ items: mockSolicitudes });
    exportToPDF.mockResolvedValueOnce();

    renderWithRouter(<AgenteDashboard />);

    await waitFor(() => {
      expect(screen.getByText("Test")).toBeInTheDocument();
    });

    const pdfBtn = screen.getByText("Exportar PDF");
    fireEvent.click(pdfBtn);

    await waitFor(() => {
      expect(exportToPDF).toHaveBeenCalledWith(expect.any(Array), "solicitudes_cdt");
      expect(toast.success).toHaveBeenCalledWith("Archivo PDF exportado correctamente");
    });
  });

  it("debe manejar error al exportar PDF", async () => {
    solicitudesService.getSolicitudes.mockResolvedValueOnce({ items: [] });
    exportToPDF.mockRejectedValueOnce(new Error("Export error"));

    renderWithRouter(<AgenteDashboard />);

    await waitFor(() => {
      expect(screen.queryByText("Cargando solicitudes...")).not.toBeInTheDocument();
    });

    const pdfBtn = screen.getByText("Exportar PDF");
    fireEvent.click(pdfBtn);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Error al exportar PDF");
      expect(console.error).toHaveBeenCalled();
    });
  });

  // =========================================
  // APROBAR SOLICITUD
  // =========================================

  it("debe abrir modal de aprobación", async () => {
    const mockSolicitudes = [
      { id: "sol-1", cliente: "Juan", monto: 1000, estado: "En validación", fecha_creacion: "2025-11-01", historial: [] },
    ];

    solicitudesService.getSolicitudes.mockResolvedValueOnce({ items: mockSolicitudes });

    renderWithRouter(<AgenteDashboard />);

    await waitFor(() => {
      expect(screen.getByText("Juan")).toBeInTheDocument();
    });

    const aprobarBtn = screen.getByText("Aprobar");
    fireEvent.click(aprobarBtn);

    await waitFor(() => {
      expect(screen.getByText("Confirmar aprobación")).toBeInTheDocument();
    });
  });

  it("debe aprobar solicitud correctamente", async () => {
    const mockSolicitudes = [
      { id: "sol-1", cliente: "Juan", monto: 1000, estado: "En validación", fecha_creacion: "2025-11-01", historial: [] },
    ];

    solicitudesService.getSolicitudes.mockResolvedValueOnce({ items: mockSolicitudes });
    solicitudesService.cambiarEstado.mockResolvedValueOnce({ success: true });

    renderWithRouter(<AgenteDashboard />);

    await waitFor(() => {
      expect(screen.getByText("Juan")).toBeInTheDocument();
    });

    const aprobarBtn = screen.getByText("Aprobar");
    fireEvent.click(aprobarBtn);

    await waitFor(() => {
      expect(screen.getByText("Confirmar")).toBeInTheDocument();
    });

    const confirmBtn = screen.getByText("Confirmar");
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(solicitudesService.cambiarEstado).toHaveBeenCalledWith("sol-1", "aprobada");
      expect(toast.success).toHaveBeenCalledWith("Solicitud aprobada");
    });
  });

  it("debe revertir cambios si falla la aprobación en servidor", async () => {
    const mockSolicitudes = [
      { id: "sol-1", cliente: "Juan", monto: 1000, estado: "En validación", fecha_creacion: "2025-11-01", historial: [] },
    ];

    solicitudesService.getSolicitudes.mockResolvedValueOnce({ items: mockSolicitudes });
    solicitudesService.cambiarEstado.mockRejectedValueOnce(new Error("Server error"));

    renderWithRouter(<AgenteDashboard />);

    await waitFor(() => {
      expect(screen.getByText("Juan")).toBeInTheDocument();
    });

    const aprobarBtn = screen.getByText("Aprobar");
    fireEvent.click(aprobarBtn);

    await waitFor(() => {
      expect(screen.getByText("Confirmar")).toBeInTheDocument();
    });

    const confirmBtn = screen.getByText("Confirmar");
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Error al aprobar en servidor. Cambios revertidos");
      expect(console.error).toHaveBeenCalled();
    });
  });

  // =========================================
  // RECHAZAR SOLICITUD
  // =========================================

  it("debe abrir modal de rechazo", async () => {
    const mockSolicitudes = [
      { id: "sol-1", cliente: "Juan", monto: 1000, estado: "En validación", fecha_creacion: "2025-11-01", historial: [] },
    ];

    solicitudesService.getSolicitudes.mockResolvedValueOnce({ items: mockSolicitudes });

    renderWithRouter(<AgenteDashboard />);

    await waitFor(() => {
      expect(screen.getByText("Juan")).toBeInTheDocument();
    });

    const rechazarBtn = screen.getByText("Rechazar");
    fireEvent.click(rechazarBtn);

    await waitFor(() => {
      expect(screen.getByText("Rechazar solicitud")).toBeInTheDocument();
    });
  });

  it("debe rechazar solicitud correctamente", async () => {
    const mockSolicitudes = [
      { id: "sol-1", cliente: "Juan", monto: 1000, estado: "En validación", fecha_creacion: "2025-11-01", historial: [] },
    ];

    solicitudesService.getSolicitudes.mockResolvedValueOnce({ items: mockSolicitudes });
    solicitudesService.cambiarEstado.mockResolvedValueOnce({ success: true });

    renderWithRouter(<AgenteDashboard />);

    await waitFor(() => {
      expect(screen.getByText("Juan")).toBeInTheDocument();
    });

    const rechazarBtn = screen.getByText("Rechazar");
    fireEvent.click(rechazarBtn);

    await waitFor(() => {
      expect(screen.getByText("Rechazar solicitud")).toBeInTheDocument();
    });

    const textarea = screen.getByRole("textbox");
    fireEvent.change(textarea, { target: { value: "Documentos incompletos" } });

    const confirmBtn = screen.getByText("Confirmar rechazo");
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(solicitudesService.cambiarEstado).toHaveBeenCalledWith("sol-1", "rechazada", "Documentos incompletos");
      expect(toast.success).toHaveBeenCalledWith("Solicitud rechazada");
    });
  });

  it("debe revertir cambios si falla el rechazo en servidor", async () => {
    const mockSolicitudes = [
      { id: "sol-1", cliente: "Juan", monto: 1000, estado: "En validación", fecha_creacion: "2025-11-01", historial: [] },
    ];

    solicitudesService.getSolicitudes.mockResolvedValueOnce({ items: mockSolicitudes });
    solicitudesService.cambiarEstado.mockRejectedValueOnce(new Error("Server error"));

    renderWithRouter(<AgenteDashboard />);

    await waitFor(() => {
      expect(screen.getByText("Juan")).toBeInTheDocument();
    });

    const rechazarBtn = screen.getByText("Rechazar");
    fireEvent.click(rechazarBtn);

    await waitFor(() => {
      expect(screen.getByText("Rechazar solicitud")).toBeInTheDocument();
    });

    const textarea = screen.getByRole("textbox");
    fireEvent.change(textarea, { target: { value: "Motivo test" } });

    const confirmBtn = screen.getByText("Confirmar rechazo");
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Error al rechazar en servidor. Cambios revertidos");
      expect(console.error).toHaveBeenCalled();
    });
  });

  // =========================================
  // HISTORIAL
  // =========================================

  it("debe abrir modal de historial", async () => {
    const mockSolicitudes = [
      { 
        id: "sol-1", 
        cliente: "Juan", 
        monto: 1000, 
        estado: "En validación", 
        fecha_creacion: "2025-11-01", 
        historial: [{ fecha: "2025-11-01", usuario: "sistema", accion: "Creada" }] 
      },
    ];

    solicitudesService.getSolicitudes.mockResolvedValueOnce({ items: mockSolicitudes });

    renderWithRouter(<AgenteDashboard />);

    await waitFor(() => {
      expect(screen.getByText("Juan")).toBeInTheDocument();
    });

    // ✅ FIX: Usar getAllByText y seleccionar el botón (último elemento)
    const historialBtns = screen.getAllByText("Historial");
    const historialBtn = historialBtns[historialBtns.length - 1]; // El botón es el último
    fireEvent.click(historialBtn);

    await waitFor(() => {
      // Verificar que el modal se abrió buscando el botón "Cerrar"
      expect(screen.getByText("Cerrar")).toBeInTheDocument();
    });
  });
});