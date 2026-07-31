import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { I18nProvider } from "@/i18n";
import { ThemeProvider } from "@/theme/theme";
import { App } from "@/App";
import { en } from "@/i18n/en";
import { pt } from "@/i18n/pt";
import { glossary } from "@/content/glossary";
import { encodeToken } from "@/state/url";
import { defaultInput } from "@/state/defaults";

beforeEach(() => {
  window.history.replaceState(null, "", "#/");
});

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

  it("sends a Google Analytics page_view per route with a path-based location", async () => {
    const gtag = vi.fn();
    window.gtag = gtag;
    const user = userEvent.setup();
    const origin = window.location.origin;
    renderApp();
    // page_location must carry the route in its PATH (not the hash), because that is what GA uses
    // to distinguish pages — a hash-based location would collapse every route to "/".
    expect(gtag).toHaveBeenCalledWith(
      "event",
      "page_view",
      expect.objectContaining({
        page_path: "/",
        page_location: `${origin}/`,
        ui_language: "en",
        ui_theme: "light",
        page_title: `${en.app.title} · ${en.app.subtitle}`,
      }),
    );
    await user.click(screen.getByRole("link", { name: en.nav.glossary }));
    expect(gtag).toHaveBeenCalledWith(
      "event",
      "page_view",
      expect.objectContaining({ page_path: "/glossary", page_location: `${origin}/glossary` }),
    );
  });

  it("carries the active UI language on the page_view after a language switch", async () => {
    const gtag = vi.fn();
    window.gtag = gtag;
    const user = userEvent.setup();
    renderApp();
    await user.click(screen.getByRole("button", { name: "PT" }));
    // Switching keeps the same route, so no extra page_view fires for the switch itself…
    const pageViews = gtag.mock.calls.filter((c) => c[1] === "page_view");
    expect(pageViews).toHaveLength(1);
    // …but the next navigation's page_view reports the now-active language.
    await user.click(screen.getByRole("link", { name: /Glossário|Glossary/ }));
    expect(gtag).toHaveBeenCalledWith(
      "event",
      "page_view",
      expect.objectContaining({ page_path: "/glossary", ui_language: "pt" }),
    );
  });

  it("sets a localized document title per route", async () => {
    const user = userEvent.setup();
    renderApp();
    expect(document.title).toBe(`${en.app.title} · ${en.app.subtitle}`);
    await user.click(screen.getByRole("link", { name: en.nav.glossary }));
    expect(document.title).toBe(`${en.nav.glossary} · ${en.app.title}`);
    // Localized and reactive: switching language updates the tab title without navigating.
    await user.click(screen.getByRole("button", { name: "PT" }));
    expect(document.title).toBe(`${pt.nav.glossary} · ${pt.app.title}`);
  });

  it("carries the active theme on the page_view after a theme toggle", async () => {
    const gtag = vi.fn();
    window.gtag = gtag;
    const user = userEvent.setup();
    renderApp();
    await user.click(screen.getByRole("button", { name: en.controls.toDark }));
    // Toggling keeps the same route, so no extra page_view fires for the toggle itself…
    expect(gtag.mock.calls.filter((c) => c[1] === "page_view")).toHaveLength(1);
    // …but the next navigation's page_view reports the now-active theme.
    await user.click(screen.getByRole("link", { name: en.nav.glossary }));
    expect(gtag).toHaveBeenCalledWith(
      "event",
      "page_view",
      expect.objectContaining({ page_path: "/glossary", ui_theme: "dark" }),
    );
  });

  it("tracks the language switch", async () => {
    const gtag = vi.fn();
    window.gtag = gtag;
    const user = userEvent.setup();
    renderApp();
    await user.click(screen.getByRole("button", { name: "PT" }));
    expect(gtag).toHaveBeenCalledWith("event", "language_switch", { language: "pt" });
  });

  it("tracks the theme toggle", async () => {
    const gtag = vi.fn();
    window.gtag = gtag;
    const user = userEvent.setup();
    renderApp();
    await user.click(screen.getByRole("button", { name: en.controls.toDark }));
    expect(gtag).toHaveBeenCalledWith("event", "theme_toggle", { theme: "dark" });
  });

  it("tracks the outbound GitHub link", async () => {
    const gtag = vi.fn();
    window.gtag = gtag;
    const user = userEvent.setup();
    renderApp();
    await user.click(screen.getByRole("link", { name: en.footer.github }));
    expect(gtag).toHaveBeenCalledWith("event", "outbound", { target: "github" });
  });

  it("shows the privacy note in the footer", () => {
    renderApp();
    expect(screen.getByText(en.footer.privacy)).toBeInTheDocument();
  });

  it("reports a share arrival once when the URL carries a valid token", async () => {
    const gtag = vi.fn();
    window.gtag = gtag;
    window.history.replaceState(null, "", `#/?c=${encodeToken(defaultInput())}`);
    const user = userEvent.setup();
    renderApp();
    // Navigating between pages must NOT re-fire it: arrival is a once-per-load signal, not per view.
    await user.click(screen.getByRole("link", { name: en.nav.glossary }));
    await user.click(screen.getByRole("link", { name: en.nav.calculator }));
    const arrivals = gtag.mock.calls.filter((c) => c[1] === "arrived_via_share");
    expect(arrivals).toHaveLength(1);
  });

  it("reports a broken shared link", () => {
    const gtag = vi.fn();
    window.gtag = gtag;
    window.history.replaceState(null, "", "#/?c=!!!!");
    renderApp();
    expect(gtag).toHaveBeenCalledWith("event", "bad_share_link", undefined);
  });

  it("does not report a share arrival on a plain visit", () => {
    const gtag = vi.fn();
    window.gtag = gtag;
    renderApp();
    expect(gtag).not.toHaveBeenCalledWith("event", "arrived_via_share", undefined);
  });

  it("does not count a reload of one's own link as a share arrival", () => {
    const gtag = vi.fn();
    window.gtag = gtag;
    window.history.replaceState(null, "", `#/?c=${encodeToken(defaultInput())}`);
    const nav = vi
      .spyOn(performance, "getEntriesByType")
      .mockReturnValue([{ type: "reload" } as unknown as PerformanceEntry]);
    renderApp();
    expect(gtag).not.toHaveBeenCalledWith("event", "arrived_via_share", undefined);
    nav.mockRestore();
  });
});

afterEach(() => {
  delete window.gtag;
});
