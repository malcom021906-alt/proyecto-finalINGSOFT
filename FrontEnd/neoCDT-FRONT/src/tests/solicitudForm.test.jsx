import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import SolicitudForm from "../components/SolicitudForm";

describe("SolicitudForm Component", () => {
  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // 🧪 TEST 1 — Renderiza modo creación correctamente
  it("renderiza correctamente en modo creación", () => {
    render(<SolicitudForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    expect(screen.getByLabelText(/Monto del CDT/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Ej: 50000/i)).toBeInTheDocument();
    expect(screen.getByText(/Crear Solicitud/i)).toBeInTheDocument();
  });

  // 🧪 TEST 2 — Renderiza modo edición correctamente
  it("renderiza correctamente en modo edición con datos iniciales", () => {
    const initialData = { monto: 100000, plazo_meses: 30, tasa: 5.5, estado: "Borrador" };

    render(
      <SolicitudForm
        initialData={initialData}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByDisplayValue("100000")).toBeInTheDocument();
    expect(screen.getByDisplayValue("30")).toBeInTheDocument();
    expect(screen.getByText(/Actualizar/i)).toBeInTheDocument();
    expect(screen.getByText(/Estado actual:/i)).toBeInTheDocument();
  });

  // 🧪 TEST 3 — Envía el formulario correctamente con datos válidos
  it("llama a onSubmit con los valores correctos cuando los campos son válidos", () => {
    render(<SolicitudForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    const montoInput = screen.getByPlaceholderText(/Ej: 50000/i);
    const plazoInput = screen.getByPlaceholderText(/Ej: 12/i);

    fireEvent.change(montoInput, { target: { value: "20000" } });
    fireEvent.change(plazoInput, { target: { value: "15" } });

    fireEvent.click(screen.getByText(/Crear Solicitud/i));

    expect(mockOnSubmit).toHaveBeenCalledWith({
      monto: 20000,
      plazo_meses: 15,
    });
  });

  // 🧪 TEST 4 — Ejecuta onCancel al hacer clic en "Cancelar"
  it("llama a onCancel al hacer clic en el botón Cancelar", () => {
    render(<SolicitudForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    fireEvent.click(screen.getByText(/Cancelar/i));
    expect(mockOnCancel).toHaveBeenCalled();
  });

  // 🧪 TEST 5 — Desactiva botones cuando submitting=true
  it("desactiva botones cuando submitting es true", () => {
    render(
      <SolicitudForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        submitting={true}
      />
    );

    const submitButton = screen.getByText(/Guardando.../i);
    const cancelButton = screen.getByText(/Cancelar/i);

    expect(submitButton).toBeDisabled();
    expect(cancelButton).toBeDisabled();
  });

  // 🧪 TEST 6 — Valida campos requeridos (vacíos)
  it("muestra errores cuando los campos están vacíos", () => {
    render(<SolicitudForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    fireEvent.click(screen.getByText(/Crear Solicitud/i));

    expect(screen.getByText(/El monto es requerido/i)).toBeInTheDocument();
    expect(screen.getByText(/El plazo es requerido/i)).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  // 🧪 TEST 7 — Valida que el formulario tenga los atributos HTML correctos
  it("tiene las restricciones HTML correctas en los inputs", () => {
    render(<SolicitudForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    const montoInput = screen.getByPlaceholderText(/Ej: 50000/i);
    const plazoInput = screen.getByPlaceholderText(/Ej: 12/i);

    expect(montoInput).toHaveAttribute('min', '10000');
    expect(montoInput).toHaveAttribute('step', '1000');
    expect(plazoInput).toHaveAttribute('min', '1');
    expect(plazoInput).toHaveAttribute('max', '60');
  });
});