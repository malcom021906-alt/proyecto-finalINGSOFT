import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import SolicitudesPage from "../pages/SolicitudesPage";
import solicitudesService from "../services/solicitudesService";

// Mock del servicio
vi.mock("../services/solicitudesService");

// Mock de los componentes hijos para simplificar las pruebas
vi.mock("../components/FilterBar", () => ({
  default: ({ onApply }) => (
    <div data-testid="filter-bar">
      <button onClick={() => onApply({ estado: "Borrador" })}>Aplicar Filtros</button>
    </div>
  )
}));

vi.mock("../components/SolicitudesTable", () => ({
  default: ({ items, onEdit, onDelete }) => (
    <div data-testid="solicitudes-table">
      {items.length === 0 ? (
        <p>No hay solicitudes</p>
      ) : (
        items.map((item) => (
          <div key={item.id}>
            <span>{item.id}</span>
            <button onClick={() => onEdit(item.id)}>Editar</button>
            <button onClick={() => onDelete(item.id)}>Eliminar</button>
          </div>
        ))
      )}
    </div>
  )
}));

vi.mock("../components/SolicitudForm", () => ({
  default: ({ onSubmit, onCancel }) => (
    <form data-testid="solicitud-form" onSubmit={(e) => {
      e.preventDefault();
      onSubmit({ monto: 10000, plazo_meses: 12 });
    }}>
      <button type="submit">Guardar</button>
      <button type="button" onClick={onCancel}>Cancelar</button>
    </form>
  )
}));

vi.mock("../components/Modal", () => ({
  default: ({ children, onClose }) => (
    <div data-testid="modal">
      <button onClick={onClose}>Cerrar Modal</button>
      {children}
    </div>
  )
}));

// Mocks globales
global.alert = vi.fn();
global.confirm = vi.fn(() => true);
global.prompt = vi.fn(() => "Motivo de prueba");

const renderWithRouter = (ui) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe("SolicitudesPage", () => {
  const mockSolicitudes = {
    items: [
      { id: "1", estado: "Borrador", monto: 10000, plazo_meses: 12 },
      { id: "2", estado: "En validación", monto: 20000, plazo_meses: 24 }
    ],
    total: 2
  };

  beforeEach(() => {
    vi.clearAllMocks();
    solicitudesService.getSolicitudes.mockResolvedValue(mockSolicitudes);
    solicitudesService.crearSolicitud.mockResolvedValue({});
    solicitudesService.actualizarSolicitud.mockResolvedValue({});
    solicitudesService.eliminarSolicitud.mockResolvedValue({});
    solicitudesService.cambiarEstado.mockResolvedValue({});
  });

  it("Debe renderizar el título de la página", async () => {
    renderWithRouter(<SolicitudesPage />);
    
    await waitFor(() => {
      expect(screen.getByText(/MIS SOLICITUDES CDT/i)).toBeInTheDocument();
    });
  });

  it("Debe cargar y mostrar las solicitudes al montar", async () => {
    renderWithRouter(<SolicitudesPage />);

    await waitFor(() => {
      expect(solicitudesService.getSolicitudes).toHaveBeenCalled();
      expect(screen.getByTestId("solicitudes-table")).toBeInTheDocument();
    });
  });

  it("Debe abrir el modal al hacer clic en Nueva Solicitud", async () => {
    renderWithRouter(<SolicitudesPage />);

    await waitFor(() => {
      expect(screen.getByText(/\+ Nueva Solicitud/i)).toBeInTheDocument();
    });

    const newButton = screen.getByText(/\+ Nueva Solicitud/i);
    fireEvent.click(newButton);

    await waitFor(() => {
      expect(screen.getByTestId("modal")).toBeInTheDocument();
    });
  });

  it("Debe aplicar filtros correctamente", async () => {
    renderWithRouter(<SolicitudesPage />);

    await waitFor(() => {
      expect(screen.getByTestId("filter-bar")).toBeInTheDocument();
    });

    const applyButton = screen.getByText(/Aplicar Filtros/i);
    fireEvent.click(applyButton);

    await waitFor(() => {
      expect(solicitudesService.getSolicitudes).toHaveBeenCalledWith(
        expect.objectContaining({ estado: "Borrador" })
      );
    });
  });

  it("Debe eliminar una solicitud cuando se confirma", async () => {
    renderWithRouter(<SolicitudesPage />);

    await waitFor(() => {
      expect(screen.getByTestId("solicitudes-table")).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByText(/Eliminar/i);
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(global.confirm).toHaveBeenCalled();
      expect(solicitudesService.eliminarSolicitud).toHaveBeenCalledWith("1");
    });
  });

  it("No debe eliminar si se cancela la confirmación", async () => {
    global.confirm = vi.fn(() => false);
    renderWithRouter(<SolicitudesPage />);

    await waitFor(() => {
      expect(screen.getByTestId("solicitudes-table")).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByText(/Eliminar/i);
    fireEvent.click(deleteButtons[0]);

    expect(solicitudesService.eliminarSolicitud).not.toHaveBeenCalled();
  });
});