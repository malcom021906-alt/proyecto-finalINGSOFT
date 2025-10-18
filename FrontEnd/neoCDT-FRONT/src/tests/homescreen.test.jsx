import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import HomeScreen from "../components/homescreen";

vi.mock("lottie-react", () => ({
  __esModule: true,
  default: () => <div data-testid="mock-lottie" />
}));


const renderWithRouter = (ui) => render(<BrowserRouter>{ui}</BrowserRouter>);

describe("HomeScreen Component", () => {
  it("Debe renderizar el título y el botón correctamente", () => {
    renderWithRouter(<HomeScreen />);
    
    expect(screen.getByText(/Gestiona tu/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Get Started/i })).toBeInTheDocument();
  });

  it("Debe permitir hacer click en el botón Get Started", () => {
    renderWithRouter(<HomeScreen />);
    
    const button = screen.getByRole("button", { name: /Get Started/i });
    fireEvent.click(button);
    
    // No validamos navegación aún, solo que el botón responde al click sin romper
    expect(button).toBeInTheDocument();
  });
});
