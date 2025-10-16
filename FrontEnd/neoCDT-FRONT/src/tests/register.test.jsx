import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Register from "../components/register";

const mockedUsedNavigate = vi.fn();

// ✅ Mock corregido para no romper BrowserRouter
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockedUsedNavigate
  };
});

const renderWithRouter = (ui) => render(<BrowserRouter>{ui}</BrowserRouter>);

describe("Register Component", () => {
  
  it("Debe permitir escribir en los campos", () => {
    renderWithRouter(<Register />);

    fireEvent.change(screen.getByPlaceholderText(/Enter your full name/i), {
      target: { value: "John Doe" }
    });
    fireEvent.change(screen.getByPlaceholderText(/Enter your email/i), {
      target: { value: "test@mail.com" }
    });
    fireEvent.change(screen.getByPlaceholderText(/Create a password/i), {
      target: { value: "123456" }
    });
    fireEvent.change(screen.getByPlaceholderText(/Re-enter your password/i), {
      target: { value: "123456" }
    });

    expect(screen.getByPlaceholderText(/Enter your full name/i).value).toBe("John Doe");
    expect(screen.getByPlaceholderText(/Enter your email/i).value).toBe("test@mail.com");
    expect(screen.getByPlaceholderText(/Create a password/i).value).toBe("123456");
    expect(screen.getByPlaceholderText(/Re-enter your password/i).value).toBe("123456");
  });

  
});
