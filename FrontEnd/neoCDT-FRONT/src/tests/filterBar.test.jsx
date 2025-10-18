import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import FilterBar from "../components/FilterBar";

describe("FilterBar Component", () => {
  let onApplyMock;

  beforeEach(() => {
    onApplyMock = vi.fn();
  });
/*
  // 🧪 TEST 1 — Renderiza correctamente los elementos
  test("renderiza todos los campos y el botón Aplicar", () => {
    render(<FilterBar onApply={onApplyMock} />);

    expect(screen.getByRole("combobox")).toBeInTheDocument(); // select
    expect(screen.getAllByRole("textbox").length).toBe(0); // no hay textboxes (solo dates y number)
    expect(screen.getAllByRole("spinbutton").length).toBe(1); // input number
    expect(screen.getAllByRole("button", { name: /Aplicar/i }).length).toBe(1);
  });
*/
  // 🧪 TEST 2 — Cambiar valores y hacer clic en "Aplicar"
  test("llama a onApply con los filtros seleccionados al hacer clic en Aplicar", () => {
    render(<FilterBar onApply={onApplyMock} />);

    // Cambiamos estado y monto
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "Aprobada" } });
    fireEvent.change(screen.getByRole("spinbutton"), { target: { value: "5000" } });

    // Clic en aplicar
    fireEvent.click(screen.getByRole("button", { name: /Aplicar/i }));

    expect(onApplyMock).toHaveBeenCalledWith(
      expect.objectContaining({
        estado: "Aprobada",
        montoMin: 5000,
      })
    );
  });

  // 🧪 TEST 3 — Ejecuta debounce automático (espera 400ms)
  /*test("ejecuta onApply automáticamente después de 400ms (debounce)", async () => {
    vi.useFakeTimers(); // simulamos el tiempo
    render(<FilterBar onApply={onApplyMock} />);

    fireEvent.change(screen.getByRole("combobox"), { target: { value: "Borrador" } });

    // avanzamos el tiempo virtual
    vi.advanceTimersByTime(400);

    await waitFor(() => {
      expect(onApplyMock).toHaveBeenCalledWith(
        expect.objectContaining({ estado: "Borrador" })
      );
    });

    vi.useRealTimers();
  });*/

  // 🧪 TEST 4 — Usa valores iniciales correctamente
  test("usa los valores iniciales proporcionados", () => {
    const initial = { estado: "Cancelada", montoMin: 10000 };
    render(<FilterBar onApply={onApplyMock} initial={initial} />);

    expect(screen.getByRole("combobox")).toHaveValue("Cancelada");
    expect(screen.getByRole("spinbutton")).toHaveValue(10000);
  });
});
