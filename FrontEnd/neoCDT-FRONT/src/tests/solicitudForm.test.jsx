import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import SolicitudForm from "../components/SolicitudForm";

describe("SolicitudForm Component", () => {
  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // 🧪 TEST 1 — Renderiza modo creación correctamente
  test("renderiza correctamente en modo creación", () => {
    render(<SolicitudForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    expect(screen.getByText(/Nueva Solicitud/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Ingrese monto/i)).toBeInTheDocument();
    expect(screen.getByText(/Crear/i)).toBeInTheDocument();
  });

  // 🧪 TEST 2 — Renderiza modo edición correctamente
  test("renderiza correctamente en modo edición con datos iniciales", () => {
    const initialData = { monto: 100000, plazo: 30, tasaInteres: 5.5, estado: "Borrador" };

    render(
      <SolicitudForm
        initialData={initialData}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByDisplayValue("100000")).toBeInTheDocument();
    expect(screen.getByDisplayValue("30")).toBeInTheDocument();
    expect(screen.getByDisplayValue("5.5")).toBeInTheDocument();
    expect(screen.getByText(/Guardar cambios/i)).toBeInTheDocument();
  });

  // 🧪 TEST 3 — Muestra error si el monto es menor al mínimo
  test("muestra error cuando el monto es menor a 10000", () => {
    render(<SolicitudForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    fireEvent.change(screen.getByPlaceholderText(/Ingrese monto/i), { target: { value: "5000" } });
    fireEvent.change(screen.getByPlaceholderText(/Ejemplo: 30/i), { target: { value: "10" } });
    fireEvent.change(screen.getByPlaceholderText(/Ejemplo: 7.5/i), { target: { value: "5" } });

    fireEvent.click(screen.getByText(/Crear/i));

    expect(screen.getByText(/Monto mínimo es 10000/i)).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  // 🧪 TEST 4 — Envía el formulario correctamente con datos válidos
  test("llama a onSubmit con los valores correctos cuando los campos son válidos", () => {
    render(<SolicitudForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    fireEvent.change(screen.getByPlaceholderText(/Ingrese monto/i), { target: { value: "20000" } });
    fireEvent.change(screen.getByPlaceholderText(/Ejemplo: 30/i), { target: { value: "15" } });
    fireEvent.change(screen.getByPlaceholderText(/Ejemplo: 7.5/i), { target: { value: "7.5" } });

    fireEvent.click(screen.getByText(/Crear/i));

    expect(mockOnSubmit).toHaveBeenCalledWith({
      monto: 20000,
      plazo: 15,
      tasaInteres: 7.5,
      estado: "En validación",
    });
  });

  // 🧪 TEST 5 — Limpia el formulario después de crear una solicitud
  test("reinicia los campos tras creación exitosa (modo creación)", () => {
    render(<SolicitudForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    const montoInput = screen.getByPlaceholderText(/Ingrese monto/i);
    const plazoInput = screen.getByPlaceholderText(/Ejemplo: 30/i);
    const tasaInput = screen.getByPlaceholderText(/Ejemplo: 7.5/i);

    fireEvent.change(montoInput, { target: { value: "30000" } });
    fireEvent.change(plazoInput, { target: { value: "20" } });
    fireEvent.change(tasaInput, { target: { value: "8" } });

    fireEvent.click(screen.getByText(/Crear/i));

    expect(montoInput.value).toBe("");
    expect(plazoInput.value).toBe("");
    expect(tasaInput.value).toBe("");
  });

  // 🧪 TEST 6 — Ejecuta onCancel al hacer clic en "Cancelar"
  test("llama a onCancel al hacer clic en el botón Cancelar", () => {
    render(<SolicitudForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    fireEvent.click(screen.getByText(/Cancelar/i));
    expect(mockOnCancel).toHaveBeenCalled();
  });

  // 🧪 TEST 7 — Desactiva botones cuando submitting=true
  test("desactiva botones cuando submitting es true", () => {
    render(
      <SolicitudForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        submitting={true}
      />
    );

    const submitButton = screen.getByRole("button", { name: /Enviando/i });
    const cancelButton = screen.getByRole("button", { name: /Cancelar/i });

    expect(submitButton).toBeDisabled();
    expect(cancelButton).toBeDisabled();
  });
});
