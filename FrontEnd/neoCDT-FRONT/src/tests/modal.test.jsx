import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import Modal from "../components/Modal";

describe("Modal Component", () => {
  const onCloseMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // 🧪 TEST 1 — Renderiza el título y el contenido
  test("renderiza correctamente el título y el contenido", () => {
    render(
      <Modal title="Título de prueba" onClose={onCloseMock}>
        <p>Contenido del modal</p>
      </Modal>
    );

    expect(screen.getByText("Título de prueba")).toBeInTheDocument();
    expect(screen.getByText("Contenido del modal")).toBeInTheDocument();
  });

  // 🧪 TEST 2 — Ejecuta onClose al hacer clic en el botón ✕
  test("llama a onClose al hacer clic en el botón de cierre", () => {
    render(
      <Modal title="Cerrar modal" onClose={onCloseMock}>
        <p>Contenido</p>
      </Modal>
    );

    const closeButton = screen.getByRole("button");
    fireEvent.click(closeButton);

    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });
/*
  // 🧪 TEST 3 — Contiene el fondo semitransparente
  test("aplica estilo de fondo oscuro semitransparente", () => {
    render(
      <Modal title="Estilo modal" onClose={onCloseMock}>
        <p>Contenido</p>
      </Modal>
    );

    const overlay = screen.getByText("Estilo modal").closest("div").parentElement;
    expect(overlay).toHaveStyle({ backgroundColor: "rgba(0,0,0,0.5)" });
  });
*/
  // 🧪 TEST 4 — Renderiza los children dinámicamente
  test("renderiza los children correctamente", () => {
    render(
      <Modal title="Children test" onClose={onCloseMock}>
        <button>Botón interno</button>
      </Modal>
    );

    expect(screen.getByRole("button", { name: /Botón interno/i })).toBeInTheDocument();
  });
});
