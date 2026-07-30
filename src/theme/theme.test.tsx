import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ThemeProvider, useTheme } from "@/theme/theme";

function Probe() {
  const { theme, toggle, setTheme } = useTheme();
  return (
    <>
      <span data-testid="theme">{theme}</span>
      <button onClick={toggle}>toggle</button>
      <button onClick={() => setTheme("light")}>set light</button>
    </>
  );
}

afterEach(() => vi.unstubAllGlobals());

describe("theme", () => {
  it("initialises from a saved preference", () => {
    vi.stubGlobal("localStorage", { getItem: () => "dark", setItem: vi.fn() });
    render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>,
    );
    expect(screen.getByTestId("theme").textContent).toBe("dark");
    expect(document.documentElement.dataset.theme).toBe("dark");
  });

  it("falls back to the OS preference when nothing is saved", () => {
    vi.stubGlobal("localStorage", { getItem: () => null, setItem: vi.fn() });
    vi.stubGlobal("matchMedia", () => ({ matches: true }));
    render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>,
    );
    expect(screen.getByTestId("theme").textContent).toBe("dark");
  });

  it("toggles and sets the theme, persisting the choice", () => {
    const setItem = vi.fn();
    vi.stubGlobal("localStorage", { getItem: () => null, setItem });
    vi.stubGlobal("matchMedia", () => ({ matches: false }));
    render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>,
    );
    expect(screen.getByTestId("theme").textContent).toBe("light");

    fireEvent.click(screen.getByText("toggle"));
    expect(screen.getByTestId("theme").textContent).toBe("dark");
    expect(setItem).toHaveBeenCalledWith("imt-theme", "dark");

    fireEvent.click(screen.getByText("set light"));
    expect(screen.getByTestId("theme").textContent).toBe("light");
    expect(setItem).toHaveBeenCalledWith("imt-theme", "light");
  });
});
