import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { I18nProvider } from "@/i18n";
import { ThemeProvider } from "@/theme/theme";
import { App } from "@/App";
import { en } from "@/i18n/en";
import { glossary } from "@/content/glossary";

function renderApp(initialPath = "/") {
  return render(
    <ThemeProvider>
      <I18nProvider>
        <MemoryRouter initialEntries={[initialPath]}>
          <App />
        </MemoryRouter>
      </I18nProvider>
    </ThemeProvider>,
  );
}

describe("App", () => {
  it("renders the calculator by default", () => {
    renderApp();
    expect(screen.getByText(en.form.heading)).toBeInTheDocument();
  });

  it("switches language to Portuguese", async () => {
    const user = userEvent.setup();
    renderApp();
    await user.click(screen.getByRole("button", { name: "PT" }));
    expect(screen.getAllByText("Calculadora").length).toBeGreaterThan(0);
  });

  it("toggles the theme", async () => {
    const user = userEvent.setup();
    renderApp();
    await user.click(screen.getByRole("button", { name: en.controls.toDark }));
    expect(document.documentElement.dataset.theme).toBe("dark");
  });

  it("navigates to the glossary", async () => {
    const user = userEvent.setup();
    renderApp();
    await user.click(screen.getByRole("link", { name: en.nav.glossary }));
    expect(screen.getByText(glossary[0].en.term)).toBeInTheDocument();
  });

  it("renders the how-it-works page in both languages", async () => {
    const user = userEvent.setup();
    renderApp("/how-it-works");
    expect(screen.getByText(en.pages.howtoIntro)).toBeInTheDocument();
    // Switch to Portuguese and confirm the localized intro renders.
    await user.click(screen.getByRole("button", { name: "PT" }));
    expect(screen.getByText(/O que esta ferramenta calcula/)).toBeInTheDocument();
  });

  it("renders the glossary in Portuguese", async () => {
    const user = userEvent.setup();
    renderApp("/glossary");
    await user.click(screen.getByRole("button", { name: "PT" }));
    expect(screen.getByText(glossary[0].pt.term)).toBeInTheDocument();
  });

  it("sends a Google Analytics page_view per route", async () => {
    const gtag = vi.fn();
    window.gtag = gtag;
    const user = userEvent.setup();
    renderApp();
    expect(gtag).toHaveBeenCalledWith("event", "page_view", expect.objectContaining({ page_path: "/" }));
    await user.click(screen.getByRole("link", { name: en.nav.glossary }));
    expect(gtag).toHaveBeenCalledWith("event", "page_view", expect.objectContaining({ page_path: "/glossary" }));
  });
});

afterEach(() => {
  delete window.gtag;
});
