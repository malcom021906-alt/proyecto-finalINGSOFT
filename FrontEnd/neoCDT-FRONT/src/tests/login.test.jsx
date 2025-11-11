import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Login from "../components/login";

// Mock del contexto de autenticación
const mockLogin = vi.fn();
const mockNavigate = vi.fn();

vi.mock("../context/authContext", () => ({
  useAuth: () => ({
    login: mockLogin,
    error: null
  })
}));

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

describe("Login Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ==========================================
  // PRUEBAS DE RENDERIZADO
  // ==========================================
  it("Debe renderizar correctamente el formulario", () => {
    renderWithRouter(<Login />);
    expect(screen.getByRole("heading", { name: /Sign in/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Enter your email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Enter your password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Sign in/i })).toBeInTheDocument();
  });

  it("Debe mostrar el logo y título NEO CDT", () => {
    renderWithRouter(<Login />);
    expect(screen.getByText(/NEO CDT/i)).toBeInTheDocument();
  });

  it("Debe mostrar enlaces de registro y recuperación", () => {
    renderWithRouter(<Login />);
    expect(screen.getByText(/Forgot password\?/i)).toBeInTheDocument();
    expect(screen.getByText(/Don't have an account\?/i)).toBeInTheDocument();
    expect(screen.getByText(/Sign up/i)).toBeInTheDocument();
  });

  // ==========================================
  // PRUEBAS DE INTERACCIÓN
  // ==========================================
  it("Debe permitir escribir en los campos", () => {
    renderWithRouter(<Login />);
    const emailInput = screen.getByPlaceholderText(/Enter your email/i);
    const passwordInput = screen.getByPlaceholderText(/Enter your password/i);

    fireEvent.change(emailInput, { target: { value: "user@test.com" } });
    fireEvent.change(passwordInput, { target: { value: "123456" } });

    expect(emailInput.value).toBe("user@test.com");
    expect(passwordInput.value).toBe("123456");
  });

  it("Debe mostrar estado de carga al enviar", async () => {
    mockLogin.mockImplementation(() => new Promise(() => {})); // Promise que nunca se resuelve
    
    renderWithRouter(<Login />);
    
    const emailInput = screen.getByPlaceholderText(/Enter your email/i);
    const passwordInput = screen.getByPlaceholderText(/Enter your password/i);
    const submitButton = screen.getByRole("button", { name: /Sign in/i });

    fireEvent.change(emailInput, { target: { value: "user@test.com" } });
    fireEvent.change(passwordInput, { target: { value: "123456" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Ingresando.../i)).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
    });
  });

  // ==========================================
  // PRUEBAS DE LOGIN EXITOSO
  // ==========================================
  it("Debe redirigir a /agente si el rol es administrador", async () => {
    mockLogin.mockResolvedValue({ rol: "administrador" });
    
    renderWithRouter(<Login />);
    
    const emailInput = screen.getByPlaceholderText(/Enter your email/i);
    const passwordInput = screen.getByPlaceholderText(/Enter your password/i);
    const submitButton = screen.getByRole("button", { name: /Sign in/i });

    fireEvent.change(emailInput, { target: { value: "admin@test.com" } });
    fireEvent.change(passwordInput, { target: { value: "admin123" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith("admin@test.com", "admin123");
      expect(mockNavigate).toHaveBeenCalledWith("/agente");
    });
  });

  it("Debe redirigir a /solicitudes si el rol es cliente", async () => {
    mockLogin.mockResolvedValue({ rol: "cliente" });
    
    renderWithRouter(<Login />);
    
    const emailInput = screen.getByPlaceholderText(/Enter your email/i);
    const passwordInput = screen.getByPlaceholderText(/Enter your password/i);
    const submitButton = screen.getByRole("button", { name: /Sign in/i });

    fireEvent.change(emailInput, { target: { value: "user@test.com" } });
    fireEvent.change(passwordInput, { target: { value: "user123" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith("user@test.com", "user123");
      expect(mockNavigate).toHaveBeenCalledWith("/solicitudes");
    });
  });

  it("Debe redirigir a /solicitudes si no hay rol definido", async () => {
    mockLogin.mockResolvedValue({ rol: null });
    
    renderWithRouter(<Login />);
    
    const emailInput = screen.getByPlaceholderText(/Enter your email/i);
    const passwordInput = screen.getByPlaceholderText(/Enter your password/i);
    const submitButton = screen.getByRole("button", { name: /Sign in/i });

    fireEvent.change(emailInput, { target: { value: "user@test.com" } });
    fireEvent.change(passwordInput, { target: { value: "user123" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/solicitudes");
    });
  });

  // ==========================================
  // PRUEBAS DE ERRORES
  // ==========================================
  it("Debe mostrar error cuando el login falla", async () => {
    mockLogin.mockRejectedValue(new Error("Credenciales inválidas"));
    
    renderWithRouter(<Login />);
    
    const emailInput = screen.getByPlaceholderText(/Enter your email/i);
    const passwordInput = screen.getByPlaceholderText(/Enter your password/i);
    const submitButton = screen.getByRole("button", { name: /Sign in/i });

    fireEvent.change(emailInput, { target: { value: "wrong@test.com" } });
    fireEvent.change(passwordInput, { target: { value: "wrong" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Credenciales inválidas/i)).toBeInTheDocument();
    });
  });

  it("Debe mostrar mensaje de error genérico si no hay mensaje específico", async () => {
    mockLogin.mockRejectedValue({ message: null });
    
    renderWithRouter(<Login />);
    
    const emailInput = screen.getByPlaceholderText(/Enter your email/i);
    const passwordInput = screen.getByPlaceholderText(/Enter your password/i);
    const submitButton = screen.getByRole("button", { name: /Sign in/i });

    fireEvent.change(emailInput, { target: { value: "user@test.com" } });
    fireEvent.change(passwordInput, { target: { value: "123456" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Credenciales inválidas. Verifica tu correo y contraseña./i)).toBeInTheDocument();
    });
  });

  it("Debe limpiar el error al enviar de nuevo", async () => {
    mockLogin.mockRejectedValueOnce(new Error("Error de red"));
    
    renderWithRouter(<Login />);
    
    const emailInput = screen.getByPlaceholderText(/Enter your email/i);
    const passwordInput = screen.getByPlaceholderText(/Enter your password/i);
    const submitButton = screen.getByRole("button", { name: /Sign in/i });

    // Primer intento fallido
    fireEvent.change(emailInput, { target: { value: "user@test.com" } });
    fireEvent.change(passwordInput, { target: { value: "123456" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Error de red/i)).toBeInTheDocument();
    });

    // Segundo intento
    mockLogin.mockResolvedValue({ rol: "cliente" });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.queryByText(/Error de red/i)).not.toBeInTheDocument();
    });
  });

  it("Debe deshabilitar el botón mientras carga", async () => {
    mockLogin.mockImplementation(() => new Promise((resolve) => {
      setTimeout(() => resolve({ rol: "cliente" }), 100);
    }));
    
    renderWithRouter(<Login />);
    
    const emailInput = screen.getByPlaceholderText(/Enter your email/i);
    const passwordInput = screen.getByPlaceholderText(/Enter your password/i);
    const submitButton = screen.getByRole("button", { name: /Sign in/i });

    fireEvent.change(emailInput, { target: { value: "user@test.com" } });
    fireEvent.change(passwordInput, { target: { value: "123456" } });
    
    expect(submitButton).not.toBeDisabled();
    
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(submitButton).toBeDisabled();
    });

    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    }, { timeout: 500 });
  });

  // ==========================================
  // PRUEBAS DE VALIDACIÓN
  // ==========================================
  it("Debe tener el atributo required en los campos", () => {
    renderWithRouter(<Login />);
    
    const emailInput = screen.getByPlaceholderText(/Enter your email/i);
    const passwordInput = screen.getByPlaceholderText(/Enter your password/i);

    expect(emailInput).toHaveAttribute('required');
    expect(passwordInput).toHaveAttribute('required');
  });

  it("Debe tener el tipo email en el campo de correo", () => {
    renderWithRouter(<Login />);
    
    const emailInput = screen.getByPlaceholderText(/Enter your email/i);
    expect(emailInput).toHaveAttribute('type', 'email');
  });

  it("Debe tener el tipo password en el campo de contraseña", () => {
    renderWithRouter(<Login />);
    
    const passwordInput = screen.getByPlaceholderText(/Enter your password/i);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it("Debe tener atributos de autocompletado correctos", () => {
    renderWithRouter(<Login />);
    
    const emailInput = screen.getByPlaceholderText(/Enter your email/i);
    const passwordInput = screen.getByPlaceholderText(/Enter your password/i);

    expect(emailInput).toHaveAttribute('autocomplete', 'username');
    expect(passwordInput).toHaveAttribute('autocomplete', 'current-password');
  });
});