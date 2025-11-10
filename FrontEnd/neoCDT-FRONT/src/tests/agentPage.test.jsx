import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import AgenteDashboard from "../pages/agentPage";
import agenteService from "../services/agenteService";

// Mock del servicio de agente
vi.mock("../services/agenteService", () => ({
  default: {
    getSolicitudesPendientes: vi.fn(),
    aprobarSolicitud: vi.fn(),
    rechazarSolicitud: vi.fn(),
  }
}));

// Mock de react-router-dom navigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock de HTMLDialogElement para jsdom
beforeEach(() => {
  // Mock de dialog.showModal()
  HTMLDialogElement.prototype.showModal = vi.fn(function() {
    this.open = true;
  });
  
  // Mock de dialog.close()
  HTMLDialogElement.prototype.close = vi.fn(function() {
    this.open = false;
  });
  
  // Mock de dialog.focus()
  HTMLDialogElement.prototype.focus = vi.fn();
});

const renderWithRouter = (ui) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

// Datos de prueba
const mockSolicitudes = [
  {
    id: "sol-12345678",
    cliente_nombre: "Juan Pérez",
    monto: 50000000,
    plazo_meses: 12,
    tasa_interes: 8.5,
    estado: "En validación",
    fecha_creacion: "2025-01-15T10:30:00Z",
    historial: [
      {
        fecha: "2025-01-15T10:30:00Z",
        usuario: "Sistema",
        accion: "Solicitud creada"
      }
    ]
  },
  {
    id: "sol-87654321",
    cliente_nombre: "María García",
    monto: 30000000,
    plazo_meses: 6,
    tasa_interes: 7.5,
    estado: "Aprobada",
    fecha_creacion: "2025-01-10T14:20:00Z",
    historial: []
  }
];

describe("AgenteDashboard Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  // ==========================================
  // PRUEBAS BÁSICAS DE RENDERIZADO
  // ==========================================
  describe("Renderizado inicial", () => {
    it("Debe renderizar correctamente el dashboard", async () => {
      agenteService.getSolicitudesPendientes.mockResolvedValue(mockSolicitudes);
      
      renderWithRouter(<AgenteDashboard />);
      
      expect(screen.getByText(/PANEL DE VALIDACIÓN - SOLICITUDES CDT/i)).toBeInTheDocument();
      expect(screen.getByText(/Cerrar Sesión/i)).toBeInTheDocument();
    });

    it("Debe cargar y mostrar las solicitudes", async () => {
      agenteService.getSolicitudesPendientes.mockResolvedValue(mockSolicitudes);
      
      renderWithRouter(<AgenteDashboard />);
      
      await waitFor(() => {
        expect(screen.getByText(/Juan Pérez/i)).toBeInTheDocument();
        expect(screen.getByText(/María García/i)).toBeInTheDocument();
      });
    });

    it("Debe mostrar mensaje cuando no hay solicitudes", async () => {
      agenteService.getSolicitudesPendientes.mockResolvedValue([]);
      
      renderWithRouter(<AgenteDashboard />);
      
      await waitFor(() => {
        expect(screen.getByText(/No hay solicitudes pendientes/i)).toBeInTheDocument();
      });
    });
  });

  // ==========================================
  // PRUEBAS DE FILTROS
  // ==========================================
  describe("Filtros", () => {
    it("Debe mostrar los controles de filtro", async () => {
      agenteService.getSolicitudesPendientes.mockResolvedValue(mockSolicitudes);
      
      renderWithRouter(<AgenteDashboard />);
      
      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Monto mínimo/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/Monto máximo/i)).toBeInTheDocument();
        expect(screen.getByText(/Aplicar Filtros/i)).toBeInTheDocument();
      });
    });

    it("Debe filtrar por estado", async () => {
      agenteService.getSolicitudesPendientes.mockResolvedValue(mockSolicitudes);
      
      renderWithRouter(<AgenteDashboard />);
      
      await waitFor(() => {
        expect(screen.getByText(/Juan Pérez/i)).toBeInTheDocument();
      });
      
      const estadoSelect = screen.getByDisplayValue(/Todos los estados/i);
      fireEvent.change(estadoSelect, { target: { value: "Aprobada" } });
      
      const aplicarButton = screen.getByText(/Aplicar Filtros/i);
      fireEvent.click(aplicarButton);
      
      await waitFor(() => {
        expect(screen.queryByText(/Juan Pérez/i)).not.toBeInTheDocument();
        expect(screen.getByText(/María García/i)).toBeInTheDocument();
      });
    });

    it("Debe filtrar por monto mínimo", async () => {
      agenteService.getSolicitudesPendientes.mockResolvedValue(mockSolicitudes);
      
      renderWithRouter(<AgenteDashboard />);
      
      await waitFor(() => {
        expect(screen.getByText(/Juan Pérez/i)).toBeInTheDocument();
      });
      
      const montoMinInput = screen.getByPlaceholderText(/Monto mínimo/i);
      fireEvent.change(montoMinInput, { target: { value: "40000000" } });
      
      const aplicarButton = screen.getByText(/Aplicar Filtros/i);
      fireEvent.click(aplicarButton);
      
      await waitFor(() => {
        expect(screen.queryByText(/María García/i)).not.toBeInTheDocument();
        expect(screen.getByText(/Juan Pérez/i)).toBeInTheDocument();
      });
    });
  });

  // ==========================================
  // PRUEBAS DE APROBAR SOLICITUD
  // ==========================================
  describe("Aprobar solicitud", () => {
    it("Debe abrir el modal de aprobación", async () => {
      agenteService.getSolicitudesPendientes.mockResolvedValue(mockSolicitudes);
      
      renderWithRouter(<AgenteDashboard />);
      
      await waitFor(() => {
        expect(screen.getByText(/Juan Pérez/i)).toBeInTheDocument();
      });
      
      const aprobarButtons = screen.getAllByRole('button', { name: /✅ Aprobar/i });
      fireEvent.click(aprobarButtons[0]);
      
      await waitFor(() => {
        expect(screen.getByText(/¿Estás seguro de aprobar esta solicitud\?/i)).toBeInTheDocument();
        expect(screen.getByText(/Confirmar Aprobación/i)).toBeInTheDocument();
      });
    });

    it("Debe cerrar el modal al cancelar", async () => {
      agenteService.getSolicitudesPendientes.mockResolvedValue(mockSolicitudes);
      
      renderWithRouter(<AgenteDashboard />);
      
      await waitFor(() => {
        expect(screen.getByText(/Juan Pérez/i)).toBeInTheDocument();
      });
      
      const aprobarButtons = screen.getAllByRole('button', { name: /✅ Aprobar/i });
      fireEvent.click(aprobarButtons[0]);
      
      await waitFor(() => {
        expect(screen.getByText(/Confirmar Aprobación/i)).toBeInTheDocument();
      });
      
      const cancelarButtons = screen.getAllByRole('button', { name: /Cancelar/i });
      const cancelarButton = cancelarButtons.find(btn => 
        btn.closest('.modal-actions') !== null
      );
      fireEvent.click(cancelarButton);
      
      await waitFor(() => {
        expect(screen.queryByText(/¿Estás seguro de aprobar/i)).not.toBeInTheDocument();
      });
    });

    it("Debe aprobar la solicitud correctamente", async () => {
      agenteService.getSolicitudesPendientes.mockResolvedValue(mockSolicitudes);
      agenteService.aprobarSolicitud.mockResolvedValue({ success: true });
      
      renderWithRouter(<AgenteDashboard />);
      
      await waitFor(() => {
        expect(screen.getByText(/Juan Pérez/i)).toBeInTheDocument();
      });
      
      const aprobarButtons = screen.getAllByRole('button', { name: /✅ Aprobar/i });
      fireEvent.click(aprobarButtons[0]);
      
      const confirmarButton = await screen.findByRole('button', { name: /Confirmar Aprobación/i });
      fireEvent.click(confirmarButton);
      
      await waitFor(() => {
        expect(agenteService.aprobarSolicitud).toHaveBeenCalledWith("sol-12345678");
        expect(screen.getByText(/Solicitud aprobada/i)).toBeInTheDocument();
      });
    });
  });

  // ==========================================
  // PRUEBAS DE RECHAZAR SOLICITUD
  // ==========================================
  describe("Rechazar solicitud", () => {
    it("Debe abrir el modal de rechazo", async () => {
      agenteService.getSolicitudesPendientes.mockResolvedValue(mockSolicitudes);
      
      renderWithRouter(<AgenteDashboard />);
      
      await waitFor(() => {
        expect(screen.getByText(/Juan Pérez/i)).toBeInTheDocument();
      });
      
      const rechazarButtons = screen.getAllByRole('button', { name: /❌ Rechazar/i });
      fireEvent.click(rechazarButtons[0]);
      
      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Ingresa el motivo del rechazo/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Confirmar Rechazo/i })).toBeInTheDocument();
      });
    });

    it("Debe requerir un motivo para rechazar", async () => {
      const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});
      agenteService.getSolicitudesPendientes.mockResolvedValue(mockSolicitudes);
      
      renderWithRouter(<AgenteDashboard />);
      
      await waitFor(() => {
        expect(screen.getByText(/Juan Pérez/i)).toBeInTheDocument();
      });
      
      const rechazarButtons = screen.getAllByRole('button', { name: /❌ Rechazar/i });
      fireEvent.click(rechazarButtons[0]);
      
      const confirmarButton = await screen.findByRole('button', { name: /Confirmar Rechazo/i });
      fireEvent.click(confirmarButton);
      
      expect(alertMock).toHaveBeenCalledWith("Debes proporcionar un motivo para rechazar");
      alertMock.mockRestore();
    });

    it("Debe rechazar la solicitud con motivo", async () => {
      agenteService.getSolicitudesPendientes.mockResolvedValue(mockSolicitudes);
      agenteService.rechazarSolicitud.mockResolvedValue({ success: true });
      
      renderWithRouter(<AgenteDashboard />);
      
      await waitFor(() => {
        expect(screen.getByText(/Juan Pérez/i)).toBeInTheDocument();
      });
      
      const rechazarButtons = screen.getAllByRole('button', { name: /❌ Rechazar/i });
      fireEvent.click(rechazarButtons[0]);
      
      const motivoTextarea = await screen.findByPlaceholderText(/Ingresa el motivo del rechazo/i);
      fireEvent.change(motivoTextarea, { target: { value: "Documentos incompletos" } });
      
      const confirmarButton = screen.getByRole('button', { name: /Confirmar Rechazo/i });
      fireEvent.click(confirmarButton);
      
      await waitFor(() => {
        expect(agenteService.rechazarSolicitud).toHaveBeenCalledWith(
          "sol-12345678",
          "Documentos incompletos"
        );
        expect(screen.getByText(/Solicitud rechazada/i)).toBeInTheDocument();
      });
    });
  });

  // ==========================================
  // PRUEBAS DE HISTORIAL
  // ==========================================
  describe("Ver historial", () => {
    it("Debe abrir el modal de historial", async () => {
      agenteService.getSolicitudesPendientes.mockResolvedValue(mockSolicitudes);
      
      renderWithRouter(<AgenteDashboard />);
      
      await waitFor(() => {
        expect(screen.getByText(/Juan Pérez/i)).toBeInTheDocument();
      });
      
      const historialButtons = screen.getAllByRole('button', { name: /📜 Historial/i });
      fireEvent.click(historialButtons[0]);
      
      await waitFor(() => {
        expect(screen.getByText(/Historial de Cambios/i)).toBeInTheDocument();
        expect(screen.getByText(/Solicitud creada/i)).toBeInTheDocument();
      });
    });

    it("Debe mostrar mensaje cuando no hay historial", async () => {
      agenteService.getSolicitudesPendientes.mockResolvedValue(mockSolicitudes);
      
      renderWithRouter(<AgenteDashboard />);
      
      await waitFor(() => {
        expect(screen.getByText(/María García/i)).toBeInTheDocument();
      });
      
      const historialButtons = screen.getAllByRole('button', { name: /📜 Historial/i });
      fireEvent.click(historialButtons[1]);
      
      await waitFor(() => {
        expect(screen.getByText(/No hay historial registrado/i)).toBeInTheDocument();
      });
    });
  });

  // ==========================================
  // PRUEBAS DE PAGINACIÓN
  // ==========================================
  describe("Paginación", () => {
    it("Debe mostrar los controles de paginación", async () => {
      agenteService.getSolicitudesPendientes.mockResolvedValue(mockSolicitudes);
      
      renderWithRouter(<AgenteDashboard />);
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /← Anterior/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Siguiente →/i })).toBeInTheDocument();
      });
    });

    it("Debe deshabilitar botón Anterior en primera página", async () => {
      agenteService.getSolicitudesPendientes.mockResolvedValue(mockSolicitudes);
      
      renderWithRouter(<AgenteDashboard />);
      
      await waitFor(() => {
        const anteriorButton = screen.getByRole('button', { name: /← Anterior/i });
        expect(anteriorButton).toBeDisabled();
      });
    });
  });

  // ==========================================
  // PRUEBAS DE CIERRE DE SESIÓN
  // ==========================================
  describe("Cerrar sesión", () => {
    it("Debe cerrar sesión al confirmar", async () => {
      const confirmMock = vi.spyOn(globalThis, 'confirm').mockReturnValue(true);
      agenteService.getSolicitudesPendientes.mockResolvedValue(mockSolicitudes);
      
      localStorage.setItem("token", "test-token");
      
      renderWithRouter(<AgenteDashboard />);
      
      await waitFor(() => {
        expect(screen.getByText(/Juan Pérez/i)).toBeInTheDocument();
      });
      
      const logoutButton = screen.getByRole('button', { name: /🚪 Cerrar Sesión/i });
      fireEvent.click(logoutButton);
      
      expect(localStorage.getItem("token")).toBeNull();
      expect(mockNavigate).toHaveBeenCalledWith("/login");
      
      confirmMock.mockRestore();
    });

    it("No debe cerrar sesión si se cancela", async () => {
      const confirmMock = vi.spyOn(globalThis, 'confirm').mockReturnValue(false);
      agenteService.getSolicitudesPendientes.mockResolvedValue(mockSolicitudes);
      
      localStorage.setItem("token", "test-token");
      
      renderWithRouter(<AgenteDashboard />);
      
      await waitFor(() => {
        expect(screen.getByText(/Juan Pérez/i)).toBeInTheDocument();
      });
      
      const logoutButton = screen.getByRole('button', { name: /🚪 Cerrar Sesión/i });
      fireEvent.click(logoutButton);
      
      expect(localStorage.getItem("token")).toBe("test-token");
      expect(mockNavigate).not.toHaveBeenCalled();
      
      confirmMock.mockRestore();
    });
  });

  // ==========================================
  // PRUEBAS DE EXPORTACIÓN
  // ==========================================
  describe("Exportación", () => {
    it("Debe mostrar toast al exportar CSV", async () => {
      agenteService.getSolicitudesPendientes.mockResolvedValue(mockSolicitudes);
      
      renderWithRouter(<AgenteDashboard />);
      
      await waitFor(() => {
        expect(screen.getByText(/Juan Pérez/i)).toBeInTheDocument();
      });
      
      const exportButton = screen.getByRole('button', { name: /📊 Exportar CSV/i });
      fireEvent.click(exportButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Función de exportar CSV/i)).toBeInTheDocument();
      });
    });
  });
});