import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import SolicitudesTable from "../components/SolicitudesTable";

describe("SolicitudesTable Component", () => {
  const mockOnEdit = vi.fn();
  const mockOnChangeState = vi.fn();

  const mockItems = [
    {
      id: "abc123def456",
      monto: 5000000,
      plazo_meses: 6,
      tasa: 5.5,
      estado: "Borrador",
      fechaCreacion: "2025-10-17T12:00:00Z",
    },
    {
      id: "xyz789ghi012",
      monto: 10000000,
      plazo_meses: 12,
      tasa: 6.0,
      estado: "En validación",
      fechaCreacion: "2025-10-16T15:00:00Z",
    },
    {
      id: "qwe345rty678",
      monto: 2000000,
      plazo_meses: 3,
      tasa: 4.5,
      estado: "Aprobada",
      fechaCreacion: "2025-10-15T10:00:00Z",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // 🧪 TEST 1 — Renderiza correctamente encabezados y filas
  it("renderiza correctamente la tabla con encabezados y solicitudes", () => {
    render(
      <SolicitudesTable
        items={mockItems}
        onEdit={mockOnEdit}
        onChangeState={mockOnChangeState}
      />
    );

    // Encabezados principales
    expect(screen.getByText("ID")).toBeInTheDocument();
    expect(screen.getByText("MONTO")).toBeInTheDocument();
    expect(screen.getByText("PLAZO")).toBeInTheDocument();
    expect(screen.getByText("ESTADO")).toBeInTheDocument();
    expect(screen.getByText("ACCIONES")).toBeInTheDocument();

    // Contenido de las filas - buscar números y texto por separado
    expect(screen.getByText("6")).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getAllByText(/meses/i).length).toBeGreaterThan(0);
    expect(screen.getByText("Borrador")).toBeInTheDocument();
    expect(screen.getByText("En validación")).toBeInTheDocument();
    expect(screen.getByText("Aprobada")).toBeInTheDocument();
  });

  // 🧪 TEST 2 — No renderiza nada si no hay solicitudes
  it("no renderiza la tabla cuando no hay solicitudes", () => {
    const { container } = render(<SolicitudesTable items={[]} />);
    expect(container.querySelector('.table-container')).not.toBeInTheDocument();
  });

  // 🧪 TEST 3 — Ejecuta onEdit solo si el estado es Borrador
  it("ejecuta onEdit al hacer clic en Editar si el estado es 'Borrador'", () => {
    render(
      <SolicitudesTable
        items={mockItems}
        onEdit={mockOnEdit}
        onChangeState={mockOnChangeState}
      />
    );

    const editButton = screen.getByRole("button", { name: /Editar/i });
    fireEvent.click(editButton);

    expect(mockOnEdit).toHaveBeenCalledWith("abc123def456");
  });

  // 🧪 TEST 4 — Solo muestra botón Editar para estado Borrador
  it("solo muestra el botón Editar para solicitudes en estado Borrador", () => {
    render(
      <SolicitudesTable
        items={mockItems}
        onEdit={mockOnEdit}
        onChangeState={mockOnChangeState}
      />
    );

    // Solo debe haber 1 botón de Editar (para el estado Borrador)
    const editButtons = screen.queryAllByRole("button", { name: /Editar/i });
    expect(editButtons).toHaveLength(1);
  });

  // 🧪 TEST 5 — Ejecuta onChangeState para Enviar (Borrador → En validación)
  it("ejecuta onChangeState al hacer clic en Enviar desde estado Borrador", () => {
    render(
      <SolicitudesTable
        items={mockItems}
        onEdit={mockOnEdit}
        onChangeState={mockOnChangeState}
      />
    );

    const enviarButton = screen.getByRole("button", { name: /Enviar/i });
    fireEvent.click(enviarButton);

    expect(mockOnChangeState).toHaveBeenCalledWith("abc123def456", "en_validacion");
  });

  // 🧪 TEST 6 — Ejecuta onChangeState para Cancelar
  it("ejecuta onChangeState al hacer clic en Cancelar", () => {
    render(
      <SolicitudesTable
        items={mockItems}
        onEdit={mockOnEdit}
        onChangeState={mockOnChangeState}
      />
    );

    // Hay 2 botones Cancelar (Borrador y En validación)
    const cancelButtons = screen.getAllByRole("button", { name: /Cancelar/i });
    expect(cancelButtons).toHaveLength(2);

    // Click en el primero (Borrador)
    fireEvent.click(cancelButtons[0]);
    expect(mockOnChangeState).toHaveBeenCalledWith("abc123def456", "Cancelada");
  });

  // 🧪 TEST 7 — Formatea correctamente el monto
  it("formatea correctamente el monto en formato de moneda colombiana", () => {
    render(
      <SolicitudesTable
        items={mockItems}
        onEdit={mockOnEdit}
        onChangeState={mockOnChangeState}
      />
    );

    // Buscar montos formateados (COP usa puntos como separador de miles)
    expect(screen.getByText(/\$\s*5\.000\.000/)).toBeInTheDocument();
  });

  // 🧪 TEST 8 — Muestra la tasa correctamente
  it("muestra la tasa de interés cuando está disponible", () => {
    render(
      <SolicitudesTable
        items={mockItems}
        onEdit={mockOnEdit}
        onChangeState={mockOnChangeState}
      />
    );

    expect(screen.getByText("5.5%")).toBeInTheDocument();
    expect(screen.getByText("6%")).toBeInTheDocument();
  });
});