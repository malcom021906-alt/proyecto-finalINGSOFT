import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import ForgotPassword from "../components/forgotPassword";

const renderWithRouter = (ui) => render(<BrowserRouter>{ui}</BrowserRouter>);

describe("ForgotPassword Component", () => {
  it("Debe renderizar correctamente el formulario", () => {
    renderWithRouter(<ForgotPassword />);
    
    expect(screen.getByText(/Reset Password/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Enter your email/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Send recovery link/i })).toBeInTheDocument();
  });

  it("Debe permitir escribir en el campo de email", () => {
    renderWithRouter(<ForgotPassword />);

    const emailInput = screen.getByPlaceholderText(/Enter your email/i);
    fireEvent.change(emailInput, { target: { value: "test@mail.com" } });

    expect(emailInput.value).toBe("test@mail.com");
  });

  it("Debe mostrar el enlace para iniciar sesión", () => {
    renderWithRouter(<ForgotPassword />);
    
    expect(screen.getByText(/Sign in/i)).toBeInTheDocument();
  });
});
