import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
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
  default: ({ items, onEdit, onDelete, onChangeState }) => (
    <div data-testid="solicitudes-table">
      {items.length === 0 ? (
        <p>No hay solicitudes</p>
      ) : (
        items.map((item) => (
          <div key={item.id}>
            <span>{item.id}</span>
            <button onClick={() => onEdit(item.id)}>Editar</button>
            <button onClick={() => onDelete(item.id)}>Eliminar</button>
            <button onClick={() => onChangeState(item.id, "Enviada")}>Enviar</button>
            <button onClick={() => onChangeState(item.id, "Cancelada")}>Cancelar</button>
          </div>
        ))
      )}
    </div>
  )
}));

vi.mock("../components/SolicitudForm", () => ({
  default: ({ onSubmit, onCancel, initialData }) => (
    <form data-testid="solicitud-form" onSubmit={(e) => {
      e.preventDefault();
      onSubmit({ monto: 10000, plazo_meses: 12 });
    }}>
      <input data-testid="form-monto" defaultValue={initialData?.monto || ""} />
      <button type="submit">Guardar</button>
      <button type="button" onClick={onCancel}>Cancelar Formulario</button>
    </form>
  )
}));

vi.mock("../components/Modal", () => ({
  default: ({ children, onClose, title }) => (
    <div data-testid="modal">
      <h3>{title}</h3>
      <button onClick={onClose}>Cerrar Modal</button>
      {children}
    </div>
  )
}));

// Mocks globales
global.alert = vi.fn();
global.confirm = vi.fn(() => true);
global.prompt = vi.fn(() => "Motivo de prueba");

// Mock de navigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

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
    localStorage.clear();
    vi.spyOn(console, "error").mockImplementation(() => {});
    
    // Reset mocks globales
    global.alert = vi.fn();
    global.confirm = vi.fn(() => true);
    global.prompt = vi.fn(() => "Motivo de prueba");
    
    solicitudesService.getSolicitudes.mockResolvedValue(mockSolicitudes);
    solicitudesService.crearSolicitud.mockResolvedValue({});
    solicitudesService.actualizarSolicitud.mockResolvedValue({});
    solicitudesService.eliminarSolicitud.mockResolvedValue({});
    solicitudesService.cambiarEstado.mockResolvedValue({});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // =========================================
  // RENDERIZADO INICIAL
  // =========================================

  it("debe renderizar el título de la página", async () => {
    renderWithRouter(<SolicitudesPage />);
    
    await waitFor(() => {
      expect(screen.getByText(/MIS SOLICITUDES CDT/i)).toBeInTheDocument();
    });
  });

  it("debe cargar y mostrar las solicitudes al montar", async () => {
    renderWithRouter(<SolicitudesPage />);

    await waitFor(() => {
      expect(solicitudesService.getSolicitudes).toHaveBeenCalled();
      expect(screen.getByTestId("solicitudes-table")).toBeInTheDocument();
    });
  });

  it("debe mostrar mensaje de carga mientras se cargan solicitudes", () => {
    solicitudesService.getSolicitudes.mockImplementation(() => new Promise(() => {}));
    
    renderWithRouter(<SolicitudesPage />);

    expect(screen.getByText("Cargando solicitudes...")).toBeInTheDocument();
  });

  it("debe manejar error al cargar solicitudes", async () => {
    solicitudesService.getSolicitudes.mockRejectedValueOnce(new Error("Network error"));

    renderWithRouter(<SolicitudesPage />);

    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith("Error al cargar solicitudes:", expect.any(Error));
      expect(global.alert).toHaveBeenCalledWith("No se pudieron cargar las solicitudes");
    });
  });

  // =========================================
  // CREAR SOLICITUD
  // =========================================

  it("debe abrir el modal al hacer clic en Nueva Solicitud", async () => {
    renderWithRouter(<SolicitudesPage />);

    await waitFor(() => {
      expect(screen.getByText(/\+ Nueva Solicitud/i)).toBeInTheDocument();
    });

    const newButton = screen.getByText(/\+ Nueva Solicitud/i);
    fireEvent.click(newButton);

    await waitFor(() => {
      expect(screen.getByTestId("modal")).toBeInTheDocument();
      expect(screen.getByText("Nueva Solicitud")).toBeInTheDocument();
    });
  });

  it("debe crear una solicitud correctamente", async () => {
    renderWithRouter(<SolicitudesPage />);

    await waitFor(() => {
      expect(screen.getByText(/\+ Nueva Solicitud/i)).toBeInTheDocument();
    });

    // Abrir modal
    fireEvent.click(screen.getByText(/\+ Nueva Solicitud/i));

    await waitFor(() => {
      expect(screen.getByTestId("solicitud-form")).toBeInTheDocument();
    });

    // Submit form
    const form = screen.getByTestId("solicitud-form");
    fireEvent.submit(form);

    await waitFor(() => {
      expect(solicitudesService.crearSolicitud).toHaveBeenCalledWith({ monto: 10000, plazo_meses: 12 });
      expect(global.alert).toHaveBeenCalledWith("Solicitud creada correctamente");
      expect(screen.queryByTestId("modal")).not.toBeInTheDocument();
    });
  });

  it("debe manejar error al crear solicitud", async () => {
    solicitudesService.crearSolicitud.mockRejectedValueOnce({ detail: "Error de validación" });

    renderWithRouter(<SolicitudesPage />);

    await waitFor(() => {
      expect(screen.getByText(/\+ Nueva Solicitud/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText(/\+ Nueva Solicitud/i));

    await waitFor(() => {
      expect(screen.getByTestId("solicitud-form")).toBeInTheDocument();
    });

    const form = screen.getByTestId("solicitud-form");
    fireEvent.submit(form);

    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith("Error guardando solicitud:", expect.any(Object));
      expect(global.alert).toHaveBeenCalledWith("Error de validación");
    });
  });

  it("debe manejar error sin detail al crear solicitud", async () => {
    solicitudesService.crearSolicitud.mockRejectedValueOnce(new Error("Generic error"));

    renderWithRouter(<SolicitudesPage />);

    await waitFor(() => {
      expect(screen.getByText(/\+ Nueva Solicitud/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText(/\+ Nueva Solicitud/i));

    await waitFor(() => {
      expect(screen.getByTestId("solicitud-form")).toBeInTheDocument();
    });

    const form = screen.getByTestId("solicitud-form");
    fireEvent.submit(form);

    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith("No se pudo guardar la solicitud");
    });
  });

  // =========================================
  // EDITAR SOLICITUD
  // =========================================

  it("debe abrir modal para editar solicitud en estado Borrador", async () => {
    renderWithRouter(<SolicitudesPage />);

    await waitFor(() => {
      expect(screen.getByTestId("solicitudes-table")).toBeInTheDocument();
    });

    const editButtons = screen.getAllByText(/Editar/i);
    fireEvent.click(editButtons[0]); // Primera solicitud (Borrador)

    await waitFor(() => {
      expect(screen.getByTestId("modal")).toBeInTheDocument();
      expect(screen.getByText("Editar Solicitud")).toBeInTheDocument();
    });
  });

  it("debe actualizar solicitud correctamente", async () => {
    renderWithRouter(<SolicitudesPage />);

    await waitFor(() => {
      expect(screen.getByTestId("solicitudes-table")).toBeInTheDocument();
    });

    const editButtons = screen.getAllByText(/Editar/i);
    fireEvent.click(editButtons[0]);

    await waitFor(() => {
      expect(screen.getByTestId("solicitud-form")).toBeInTheDocument();
    });

    const form = screen.getByTestId("solicitud-form");
    fireEvent.submit(form);

    await waitFor(() => {
      expect(solicitudesService.actualizarSolicitud).toHaveBeenCalledWith("1", { monto: 10000, plazo_meses: 12 });
      expect(global.alert).toHaveBeenCalledWith("Solicitud actualizada exitosamente");
    });
  });

  it("no debe permitir editar solicitudes que no están en Borrador", async () => {
    renderWithRouter(<SolicitudesPage />);

    await waitFor(() => {
      expect(screen.getByTestId("solicitudes-table")).toBeInTheDocument();
    });

    const editButtons = screen.getAllByText(/Editar/i);
    fireEvent.click(editButtons[1]); // Segunda solicitud (En validación)

    expect(global.alert).toHaveBeenCalledWith("Solo se pueden editar solicitudes en estado Borrador");
    expect(screen.queryByTestId("modal")).not.toBeInTheDocument();
  });

  // =========================================
  // ELIMINAR SOLICITUD
  // =========================================

  it("debe eliminar una solicitud cuando se confirma", async () => {
    renderWithRouter(<SolicitudesPage />);

    await waitFor(() => {
      expect(screen.getByTestId("solicitudes-table")).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByText(/Eliminar/i);
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(global.confirm).toHaveBeenCalled();
      expect(solicitudesService.eliminarSolicitud).toHaveBeenCalledWith("1");
      expect(global.alert).toHaveBeenCalledWith("Solicitud eliminada correctamente");
    });
  });

  it("no debe eliminar si se cancela la confirmación", async () => {
    global.confirm = vi.fn(() => false);
    renderWithRouter(<SolicitudesPage />);

    await waitFor(() => {
      expect(screen.getByTestId("solicitudes-table")).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByText(/Eliminar/i);
    fireEvent.click(deleteButtons[0]);

    expect(solicitudesService.eliminarSolicitud).not.toHaveBeenCalled();
  });

  it("debe manejar error al eliminar solicitud", async () => {
    solicitudesService.eliminarSolicitud.mockRejectedValueOnce({ detail: "No se puede eliminar" });

    renderWithRouter(<SolicitudesPage />);

    await waitFor(() => {
      expect(screen.getByTestId("solicitudes-table")).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByText(/Eliminar/i);
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith("Error eliminando solicitud:", expect.any(Object));
      expect(global.alert).toHaveBeenCalledWith("No se puede eliminar");
    });
  });

  it("debe manejar error sin detail al eliminar", async () => {
    solicitudesService.eliminarSolicitud.mockRejectedValueOnce(new Error("Generic error"));

    renderWithRouter(<SolicitudesPage />);

    await waitFor(() => {
      expect(screen.getByTestId("solicitudes-table")).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByText(/Eliminar/i);
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith("Error eliminando solicitud:", expect.any(Error));
      expect(global.alert).toHaveBeenCalledWith("No se pudo eliminar la solicitud");
    });
  });

  // =========================================
  // CAMBIAR ESTADO
  // =========================================

  it("debe cambiar estado a Enviada", async () => {
    renderWithRouter(<SolicitudesPage />);

    await waitFor(() => {
      expect(screen.getByTestId("solicitudes-table")).toBeInTheDocument();
    });

    const enviarButtons = screen.getAllByText(/Enviar/i);
    fireEvent.click(enviarButtons[0]);

    await waitFor(() => {
      expect(solicitudesService.cambiarEstado).toHaveBeenCalledWith("1", "Enviada", undefined);
    });
  });

  it("debe cambiar estado a Cancelada con motivo", async () => {
    global.prompt = vi.fn(() => "No me interesa");

    renderWithRouter(<SolicitudesPage />);

    await waitFor(() => {
      expect(screen.getByTestId("solicitudes-table")).toBeInTheDocument();
    });

    const cancelarButtons = screen.getAllByText(/Cancelar/i);
    fireEvent.click(cancelarButtons[0]);

    await waitFor(() => {
      expect(global.prompt).toHaveBeenCalledWith("Indica el motivo de la cancelación:");
      expect(solicitudesService.cambiarEstado).toHaveBeenCalledWith("1", "Cancelada", "No me interesa");
      expect(global.alert).toHaveBeenCalledWith("Solicitud cancelada exitosamente");
    });
  });

  it("no debe cancelar si no se proporciona motivo", async () => {
    global.prompt = vi.fn(() => null);

    renderWithRouter(<SolicitudesPage />);

    await waitFor(() => {
      expect(screen.getByTestId("solicitudes-table")).toBeInTheDocument();
    });

    const cancelarButtons = screen.getAllByText(/Cancelar/i);
    fireEvent.click(cancelarButtons[0]);

    expect(global.prompt).toHaveBeenCalled();
    expect(solicitudesService.cambiarEstado).not.toHaveBeenCalled();
  });

  it("debe manejar error al cambiar estado", async () => {
    solicitudesService.cambiarEstado.mockRejectedValueOnce({ detail: "Estado inválido" });

    renderWithRouter(<SolicitudesPage />);

    await waitFor(() => {
      expect(screen.getByTestId("solicitudes-table")).toBeInTheDocument();
    });

    const enviarButtons = screen.getAllByText(/Enviar/i);
    fireEvent.click(enviarButtons[0]);

    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith("Error cambiando estado:", expect.any(Object));
      expect(global.alert).toHaveBeenCalledWith("Estado inválido");
    });
  });

  it("debe manejar error sin detail al cambiar estado", async () => {
    solicitudesService.cambiarEstado.mockRejectedValueOnce(new Error("Generic error"));

    renderWithRouter(<SolicitudesPage />);

    await waitFor(() => {
      expect(screen.getByTestId("solicitudes-table")).toBeInTheDocument();
    });

    const enviarButtons = screen.getAllByText(/Enviar/i);
    fireEvent.click(enviarButtons[0]);

    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith("No se pudo cambiar el estado");
    });
  });

  // =========================================
  // FILTROS
  // =========================================

  it("debe aplicar filtros correctamente", async () => {
    renderWithRouter(<SolicitudesPage />);

    await waitFor(() => {
      expect(screen.getByTestId("filter-bar")).toBeInTheDocument();
    });

    const applyButton = screen.getByText(/Aplicar Filtros/i);
    fireEvent.click(applyButton);

    await waitFor(() => {
      expect(solicitudesService.getSolicitudes).toHaveBeenCalledWith(
        expect.objectContaining({ estado: "Borrador", page: 1 })
      );
    });
  });

  it("no debe recargar si los filtros son iguales", async () => {
    renderWithRouter(<SolicitudesPage />);

    await waitFor(() => {
      expect(screen.getByTestId("filter-bar")).toBeInTheDocument();
    });

    const initialCalls = solicitudesService.getSolicitudes.mock.calls.length;

    // Aplicar filtros por primera vez
    const applyButton = screen.getByText(/Aplicar Filtros/i);
    fireEvent.click(applyButton);
    
    await waitFor(() => {
      expect(solicitudesService.getSolicitudes).toHaveBeenCalledTimes(initialCalls + 1);
    });

    // Aplicar los mismos filtros otra vez (ya están aplicados)
    fireEvent.click(applyButton);
    
    // No debe llamar de nuevo porque los filtros son iguales
    expect(solicitudesService.getSolicitudes).toHaveBeenCalledTimes(initialCalls + 1);
  });

  // =========================================
  // PAGINACIÓN
  // =========================================

  it("debe cambiar a la página siguiente", async () => {
    // Mock con suficientes items para tener paginación
    solicitudesService.getSolicitudes.mockResolvedValue({
      items: Array(10).fill(null).map((_, i) => ({
        id: `${i + 1}`,
        estado: "Borrador",
        monto: 10000,
        plazo_meses: 12
      })),
      total: 20
    });

    renderWithRouter(<SolicitudesPage />);

    await waitFor(() => {
      const pageText = screen.getByText(/Página 1/i);
      expect(pageText).toBeInTheDocument();
    });

    const nextButton = screen.getByText(/Siguiente →/i);
    expect(nextButton).not.toBeDisabled();
    
    fireEvent.click(nextButton);

    await waitFor(() => {
      const pageText = screen.getByText(/Página 2/i);
      expect(pageText).toBeInTheDocument();
    });
  });

  it("debe cambiar a la página anterior", async () => {
    // Mock con suficientes items
    solicitudesService.getSolicitudes.mockResolvedValue({
      items: Array(10).fill(null).map((_, i) => ({
        id: `${i + 1}`,
        estado: "Borrador",
        monto: 10000,
        plazo_meses: 12
      })),
      total: 20
    });

    renderWithRouter(<SolicitudesPage />);

    await waitFor(() => {
      expect(screen.getByText(/Página 1/i)).toBeInTheDocument();
    });

    // Ir a página 2
    const nextButton = screen.getByText(/Siguiente →/i);
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(screen.getByText(/Página 2/i)).toBeInTheDocument();
    });

    // Volver a página 1
    const prevButton = screen.getByText(/← Anterior/i);
    fireEvent.click(prevButton);

    await waitFor(() => {
      expect(screen.getByText(/Página 1/i)).toBeInTheDocument();
    });
  });

  it("debe deshabilitar botón Anterior en página 1", async () => {
    renderWithRouter(<SolicitudesPage />);

    await waitFor(() => {
      const prevButton = screen.getByText(/← Anterior/i);
      expect(prevButton).toBeDisabled();
    });
  });

  it("debe deshabilitar botón Siguiente cuando no hay más páginas", async () => {
    solicitudesService.getSolicitudes.mockResolvedValueOnce({
      items: [{ id: "1", estado: "Borrador", monto: 10000 }], // Solo 1 item (menos que limit=10)
      total: 1
    });

    renderWithRouter(<SolicitudesPage />);

    await waitFor(() => {
      const nextButton = screen.getByText(/Siguiente →/i);
      expect(nextButton).toBeDisabled();
    });
  });

  // =========================================
  // CERRAR SESIÓN
  // =========================================

  it("debe cerrar sesión cuando se confirma", async () => {
    global.confirm = vi.fn(() => true);

    renderWithRouter(<SolicitudesPage />);

    await waitFor(() => {
      expect(screen.getByText(/Cerrar Sesión/i)).toBeInTheDocument();
    });

    const logoutButton = screen.getByText(/Cerrar Sesión/i);
    fireEvent.click(logoutButton);

    expect(global.confirm).toHaveBeenCalledWith("¿Deseas cerrar sesión?");
    expect(localStorage.getItem("token")).toBeNull();
    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });

  it("no debe cerrar sesión si se cancela", async () => {
    global.confirm = vi.fn(() => false);

    renderWithRouter(<SolicitudesPage />);

    await waitFor(() => {
      expect(screen.getByText(/Cerrar Sesión/i)).toBeInTheDocument();
    });

    const logoutButton = screen.getByText(/Cerrar Sesión/i);
    fireEvent.click(logoutButton);

    expect(global.confirm).toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  // =========================================
  // MODAL
  // =========================================

  it("debe cerrar modal al hacer clic en Cerrar", async () => {
    renderWithRouter(<SolicitudesPage />);

    await waitFor(() => {
      expect(screen.getByText(/\+ Nueva Solicitud/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText(/\+ Nueva Solicitud/i));

    await waitFor(() => {
      expect(screen.getByTestId("modal")).toBeInTheDocument();
    });

    const closeButton = screen.getByText("Cerrar Modal");
    fireEvent.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByTestId("modal")).not.toBeInTheDocument();
    });
  });

  it("debe cerrar modal al hacer clic en Cancelar del formulario", async () => {
    renderWithRouter(<SolicitudesPage />);

    await waitFor(() => {
      expect(screen.getByText(/\+ Nueva Solicitud/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText(/\+ Nueva Solicitud/i));

    await waitFor(() => {
      expect(screen.getByTestId("solicitud-form")).toBeInTheDocument();
    });

    // Usar el botón específico del formulario
    const cancelButton = screen.getByText("Cancelar Formulario");
    fireEvent.click(cancelButton);

    await waitFor(() => {
      expect(screen.queryByTestId("modal")).not.toBeInTheDocument();
    });
  });

  // =========================================
  // CASOS EDGE
  // =========================================

  it("debe manejar items undefined en respuesta del servicio", async () => {
    solicitudesService.getSolicitudes.mockResolvedValueOnce({
      items: undefined,
      total: undefined
    });

    renderWithRouter(<SolicitudesPage />);

    await waitFor(() => {
      expect(screen.getByText("No hay solicitudes")).toBeInTheDocument();
    });
  });

  it("debe intentar editar una solicitud inexistente", async () => {
    renderWithRouter(<SolicitudesPage />);

    await waitFor(() => {
      expect(screen.getByTestId("solicitudes-table")).toBeInTheDocument();
    });

    // Simular editar con ID que no existe
    const editButtons = screen.getAllByText(/Editar/i);
    
    // Cambiar temporalmente el mock para que no encuentre la solicitud
    const originalFind = Array.prototype.find;
    Array.prototype.find = vi.fn(() => null);
    
    fireEvent.click(editButtons[0]);

    // Como no encuentra el item, no debería abrir el modal
    expect(screen.queryByTestId("modal")).not.toBeInTheDocument();
    
    Array.prototype.find = originalFind;
  });
});