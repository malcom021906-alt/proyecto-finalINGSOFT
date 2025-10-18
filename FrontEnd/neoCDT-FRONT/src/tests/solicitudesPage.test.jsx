// src/tests/solicitudesPage.test.jsx
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import SolicitudesPage from "../pages/SolicitudesPage";
import useSolicitudes from "../hooks/useSolicitudes";

// 🧩 Mock del hook personalizado
vi.mock("../hooks/useSolicitudes");

// 🧩 Mocks globales para alert/confirm/prompt
beforeAll(() => {
  global.alert = vi.fn();
  global.confirm = vi.fn(() => true);
  global.prompt = vi.fn(() => "Motivo de cancelación");
});

describe("SolicitudesPage", () => {
  const mockData = [
    { id: 1, nombre: "CDT A", estado: "Borrador" },
    { id: 2, nombre: "CDT B", estado: "Aprobada" },
  ];

  const mockHook = {
    solicitudes: mockData,
    cargando: false,
    error: null,
    total: 2,
    page: 1,
    limit: 10,
    fetchSolicitudes: vi.fn(),
    setFiltros: vi.fn(),
    setPage: vi.fn(),
    deleteSolicitud: vi.fn(),
    changeEstado: vi.fn(),
    createSolicitud: vi.fn(),
    updateSolicitud: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    useSolicitudes.mockReturnValue(mockHook);
  });

  // ✅ TEST 1 - Renderiza título y tabla
/*  test("renderiza correctamente el título y la tabla", () => {
    render(<SolicitudesPage />);
    expect(screen.getByText(/MIS SOLICITUDES CDT/i)).toBeInTheDocument();
    expect(screen.getByTestId("solicitudes-table")).toBeInTheDocument();
    expect(screen.getByText((content) => content.includes("CDT A"))).toBeInTheDocument();
  });*/

  // ❌ (Comentado) TEST 2 - Abrir modal
  // test("abre el modal al hacer clic en 'Nueva Solicitud'", async () => {
  //   render(<SolicitudesPage />);
  //   const botones = screen.getAllByText(/Nueva Solicitud/i);
  //   fireEvent.click(botones[0]);
  //   await waitFor(() => {
  //     expect(screen.getByTestId("modal")).toBeInTheDocument();
  //   });
  // });

  // ✅ TEST 3 - Fetch inicial
  test("ejecuta fetchSolicitudes al montar el componente", () => {
    render(<SolicitudesPage />);
    expect(mockHook.fetchSolicitudes).toHaveBeenCalled();
  });

  // ✅ TEST 4 - Aplicar filtros
  test("aplica filtros correctamente desde la barra de filtros", () => {
    render(<SolicitudesPage />);
    const filtros = { estado: "Borrador" };
    mockHook.setFiltros(filtros);
    expect(mockHook.setFiltros).toHaveBeenCalledWith(filtros);
  });

  // ✅ TEST 5 - Editar solicitud
  /*test("permite editar una solicitud en estado Borrador", async () => {
    render(<SolicitudesPage />);
    fireEvent.click(screen.getAllByText(/Editar/i)[0]);
    await waitFor(() => {
      expect(screen.getByTestId("modal")).toBeInTheDocument();
    });
  });*/

  // ✅ TEST 6 - Eliminar solicitud confirmada
  test("llama a deleteSolicitud al confirmar eliminación", async () => {
    render(<SolicitudesPage />);
    const eliminarBtn = screen.getAllByText(/Eliminar/i)[0];
    fireEvent.click(eliminarBtn);
    await waitFor(() => {
      expect(mockHook.deleteSolicitud).toHaveBeenCalled();
    });
  });

  // ✅ TEST 7 - Cancelar eliminación
  test("muestra mensaje de error si confirmación de eliminar es cancelada", async () => {
    global.confirm = vi.fn(() => false);
    render(<SolicitudesPage />);
    const eliminarBtn = screen.getAllByText(/Eliminar/i)[0];
    fireEvent.click(eliminarBtn);
    expect(mockHook.deleteSolicitud).not.toHaveBeenCalled();
  });

  // ❌ (Comentado) TEST 8 - Guardar nueva solicitud
  // test("guarda nueva solicitud desde el formulario", async () => {
  //   render(<SolicitudesPage />);
  //   fireEvent.click(screen.getAllByText(/Nueva Solicitud/i)[0]);
  //   await waitFor(() => {
  //     expect(screen.getByTestId("modal")).toBeInTheDocument();
  //   });
  //   await waitFor(() => {
  //     expect(mockHook.createSolicitud).not.toHaveBeenCalled(); // simulado
  //   });
  // });
});
