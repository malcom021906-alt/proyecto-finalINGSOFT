import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import SolicitudesTable from "../components/SolicitudesTable";

describe("SolicitudesTable Component", () => {
  const mockOnEdit = vi.fn();
  const mockOnChangeState = vi.fn();
  const mockOnDelete = vi.fn();

  const mockItems = [
    {
      id: 1,
      monto: 5000000,
      plazo: "6 meses",
      estado: "Borrador",
      fechaCreacion: "2025-10-17T12:00:00Z",
    },
    {
      id: 2,
      monto: 10000000,
      plazo: "12 meses",
      estado: "En validación",
      fechaCreacion: "2025-10-16T15:00:00Z",
    },
    {
      id: 3,
      monto: 2000000,
      plazo: "3 meses",
      estado: "Aprobada",
      fechaCreacion: null,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // 🧪 TEST 1 — Renderiza correctamente encabezados y filas
  test("renderiza correctamente la tabla con encabezados y solicitudes", () => {
    render(
      <SolicitudesTable
        items={mockItems}
        onEdit={mockOnEdit}
        onChangeState={mockOnChangeState}
        onDelete={mockOnDelete}
      />
    );

    // Encabezados principales
    expect(screen.getByText("ID")).toBeInTheDocument();
    expect(screen.getByText("Monto")).toBeInTheDocument();
    expect(screen.getByText("Acciones")).toBeInTheDocument();

    // Contenido de las filas
    expect(screen.getByText("6 meses")).toBeInTheDocument();
    expect(screen.getByText("En validación")).toBeInTheDocument();
    expect(screen.getByText("Aprobada")).toBeInTheDocument();
  });

  // 🧪 TEST 2 — Muestra mensaje si no hay solicitudes
  test("muestra mensaje cuando no hay solicitudes", () => {
    render(<SolicitudesTable items={[]} />);
    expect(screen.getByText(/No hay solicitudes para mostrar/i)).toBeInTheDocument();
  });

  // 🧪 TEST 3 — Ejecuta onEdit solo si el estado es Borrador
  test("ejecuta onEdit al hacer clic en Editar si el estado es 'Borrador'", () => {
    render(
      <SolicitudesTable
        items={mockItems}
        onEdit={mockOnEdit}
        onChangeState={mockOnChangeState}
        onDelete={mockOnDelete}
      />
    );

    const editButtons = screen.getAllByRole("button", { name: /Editar/i });
    fireEvent.click(editButtons[0]); // primera fila = Borrador

    expect(mockOnEdit).toHaveBeenCalledWith(1);
    expect(editButtons[1]).toBeDisabled(); // segunda fila no editable
  });

  // 🧪 TEST 4 — Ejecuta onChangeState sólo si está "En validación"
  test("ejecuta onChangeState al hacer clic en Cancelar si el estado es 'En validación'", () => {
    render(
      <SolicitudesTable
        items={mockItems}
        onEdit={mockOnEdit}
        onChangeState={mockOnChangeState}
        onDelete={mockOnDelete}
      />
    );

    const cancelButtons = screen.getAllByRole("button", { name: /Cancelar/i });

    // Primera fila (Borrador) no puede cancelar
    expect(cancelButtons[0]).toBeDisabled();

    // Segunda fila (En validación) sí puede cancelar
    fireEvent.click(cancelButtons[1]);
    expect(mockOnChangeState).toHaveBeenCalledWith(2, "Cancelada");
  });

  // 🧪 TEST 5 — Ejecuta onDelete en cualquier solicitud
  test("ejecuta onDelete al hacer clic en Eliminar", () => {
    render(
      <SolicitudesTable
        items={mockItems}
        onEdit={mockOnEdit}
        onChangeState={mockOnChangeState}
        onDelete={mockOnDelete}
      />
    );

    const deleteButtons = screen.getAllByRole("button", { name: /Eliminar/i });
    fireEvent.click(deleteButtons[0]);
    expect(mockOnDelete).toHaveBeenCalledWith(1);
  });
});
