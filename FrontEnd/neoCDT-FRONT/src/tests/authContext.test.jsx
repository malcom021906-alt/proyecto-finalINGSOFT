import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import { AuthProvider, useAuth } from "../context/authContext";
import { loginRequest, meRequest } from "../services/auth";

// Mock de los servicios
vi.mock("../services/auth", () => ({
  loginRequest: vi.fn(),
  meRequest: vi.fn(),
}));

// Helper para usar el hook dentro de un componente de prueba
function TestComponent() {
  const { user, initializing, login, logout, error } = useAuth();

  const handleLogin = async () => {
    try {
      await login("test@mail.com", "1234");
    } catch (err) {
      // Error manejado por el contexto
    }
  };

  return (
    <div>
      <p data-testid="user">{user ? user.email : "no-user"}</p>
      <p data-testid="initializing">{initializing ? "true" : "false"}</p>
      <p data-testid="error">{error || "no-error"}</p>
      <button onClick={handleLogin}>Login</button>
      <button onClick={() => logout()}>Logout</button>
    </div>
  );
}

describe("AuthContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("debe inicializar sin token", async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("initializing").textContent).toBe("false");
      expect(screen.getByTestId("user").textContent).toBe("no-user");
    });
  });

  it("debe inicializar con token y meRequest exitoso", async () => {
    const mockUser = { email: "user@mail.com" };
    localStorage.setItem("token", "123");
    meRequest.mockResolvedValueOnce(mockUser);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("user").textContent).toBe("user@mail.com");
      expect(screen.getByTestId("initializing").textContent).toBe("false");
    });
  });

  it("debe manejar error en meRequest y limpiar token", async () => {
    localStorage.setItem("token", "fake");
    meRequest.mockRejectedValueOnce(new Error("session error"));
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("error").textContent).toBe("Error loading user session");
      expect(localStorage.getItem("token")).toBeNull();
      expect(screen.getByTestId("user").textContent).toBe("no-user");
    });

    spy.mockRestore();
  });

  it("debe loguear correctamente (login exitoso)", async () => {
    const mockUser = { email: "logged@mail.com", role: "admin" };
    loginRequest.mockResolvedValueOnce(mockUser);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await act(async () => {
      screen.getByText("Login").click();
    });

    await waitFor(() => {
      expect(screen.getByTestId("user").textContent).toBe("logged@mail.com");
      expect(screen.getByTestId("error").textContent).toBe("no-error");
    });
  });

  it("debe manejar error en login", async () => {
    loginRequest.mockRejectedValueOnce(new Error("invalid credentials"));
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Simplemente clickeamos - el error ya está manejado en handleLogin
    await act(async () => {
      screen.getByText("Login").click();
    });

    await waitFor(() => {
      expect(screen.getByTestId("error").textContent).toBe("Invalid credentials");
      expect(screen.getByTestId("user").textContent).toBe("no-user");
    });

    spy.mockRestore();
  });

  it("debe cerrar sesión (logout)", async () => {
    const mockUser = { email: "logout@mail.com" };
    loginRequest.mockResolvedValueOnce(mockUser);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await act(async () => {
      screen.getByText("Login").click();
    });

    await waitFor(() => {
      expect(screen.getByTestId("user").textContent).toBe("logout@mail.com");
    });

    act(() => {
      screen.getByText("Logout").click();
    });

    await waitFor(() => {
      expect(screen.getByTestId("user").textContent).toBe("no-user");
      expect(screen.getByTestId("error").textContent).toBe("no-error");
    });
  });

  it("debe devolver el contexto correctamente con useAuth()", () => {
    const TestHook = () => {
      const auth = useAuth();
      expect(auth).toHaveProperty("login");
      expect(auth).toHaveProperty("logout");
      expect(auth).toHaveProperty("user");
      expect(auth).toHaveProperty("error");
      expect(auth).toHaveProperty("initializing");
      return <div>ok</div>;
    };

    render(
      <AuthProvider>
        <TestHook />
      </AuthProvider>
    );

    screen.getByText("ok");
  });
});