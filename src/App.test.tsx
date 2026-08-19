import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, useLocation, useRoutes, type RouteObject } from "react-router-dom";
import { routes } from "@/routes";
import { en } from "@/i18n/en";
import { pt } from "@/i18n/pt";
import { glossary } from "@/content/glossary";
import { LANG_STORAGE_KEY, LANG_SUGGEST_DISMISSED_KEY } from "@/i18n/paths";
import { encodeToken } from "@/state/url";
import { defaultInput } from "@/state/defaults";
import { fmt } from "@/i18n";
import { LATEST_YEAR } from "@/engine/tables";

// The tax year in the subtitle / H1 is templated ({year}) and resolved with LATEST_YEAR at render,
// so tests match the resolved text rather than the raw template.
const y = { year: LATEST_YEAR };
const homeTitle = `${en.app.title} · ${fmt(en.app.subtitle, y)}`;
const calcH1 = (l: typeof en | typeof pt) => fmt(l.pages.calculatorH1, y);

/** Force the browser language for the language-suggestion tests (jsdom defaults to en-US). */
function setBrowserLang(value: string) {
  Object.defineProperty(navigator, "language", { value, configurable: true });
}

beforeEach(() => {
  window.history.replaceState(null, "", "/");
});

// Render the real route tree (its root layout supplies the theme/i18n providers). We use the
// non-data MemoryRouter + useRoutes, not createMemoryRouter: the data router builds a Request from
// a relative URL on navigation, which Node rejects under jsdom. Production uses the data router via
// vite-react-ssg (validated by the build and the live site).
function RoutedApp() {
  return useRoutes(routes as RouteObject[]);
}
function renderApp(initialPath = "/") {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <RoutedApp />
    </MemoryRouter>,
  );
}

// The router's location, surfaced for assertion. window.location is untouched by MemoryRouter and
// keeps whatever replaceState put there, so it cannot show whether a navigation carried the ?c=
// token — only the router's own URL can.
function RouterUrlProbe() {
  const { pathname, search } = useLocation();
  return <div data-testid="router-url">{pathname + search}</div>;
}
function renderAppWithUrlProbe(initialPath = "/") {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <RoutedApp />
      <RouterUrlProbe />
    </MemoryRouter>,
  );
}
const routerUrl = () => screen.getByTestId("router-url").textContent;

describe("App", () => {
  it("renders the calculator by default", () => {
    renderApp();
    expect(screen.getByText(en.form.heading)).toBeInTheDocument();
  });

  it("switches language to Portuguese", async () => {
    const user = userEvent.setup();
    renderApp();
    await user.click(screen.getByRole("link", { name: "PT" }));
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
    await user.click(screen.getByRole("link", { name: "PT" }));
    expect(screen.getByText(/O que esta ferramenta calcula/)).toBeInTheDocument();
  });

  it("renders the glossary in Portuguese", async () => {
    const user = userEvent.setup();
    renderApp("/glossary");
    await user.click(screen.getByRole("link", { name: "PT" }));
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
        page_title: homeTitle,
      }),
    );
    await user.click(screen.getByRole("link", { name: en.nav.glossary }));
    expect(gtag).toHaveBeenCalledWith(
      "event",
      "page_view",
      expect.objectContaining({ page_path: "/glossary/", page_location: `${origin}/glossary/` }),
    );
  });

  it("switches language by navigating to the /pt URL, with a page_view in the new language", async () => {
    const gtag = vi.fn();
    window.gtag = gtag;
    const user = userEvent.setup();
    renderApp("/glossary");
    await user.click(screen.getByRole("link", { name: "PT" }));
    // Language is a route: the switch navigates to the localized PT slug (/pt/glossario) and fires a
    // page_view for it in PT.
    expect(gtag).toHaveBeenCalledWith(
      "event",
      "page_view",
      expect.objectContaining({ page_path: "/pt/glossario/", ui_language: "pt" }),
    );
  });

  it("renders Portuguese directly at a /pt URL", () => {
    renderApp("/pt/glossario");
    expect(screen.getByText(glossary[0].pt.term)).toBeInTheDocument();
    expect(document.documentElement.lang).toBe("pt");
  });

  it("shows a not-found page for an unknown path, not the calculator", () => {
    renderApp("/does-not-exist");
    expect(screen.getByText(en.pages.notFoundTitle)).toBeInTheDocument();
    expect(screen.queryByText(en.form.heading)).not.toBeInTheDocument();
  });

  // The English page must keep serving English to a Portuguese-preferring visitor and merely offer
  // the alternative: an automatic redirect is what made search engines treat these URLs as
  // redirecting rather than indexing them.
  it("offers Portuguese to a Portuguese-preferring visitor without navigating away", async () => {
    setBrowserLang("pt-PT");
    renderApp("/");
    expect(await screen.findByRole("link", { name: pt.langSuggest.cta })).toHaveAttribute(
      "href",
      "/pt/",
    );
    expect(screen.getByText(calcH1(en))).toBeInTheDocument();
    expect(screen.queryByText(calcH1(pt))).not.toBeInTheDocument();
  });

  it("offers the Portuguese twin of a sub-page, not the Portuguese home page", async () => {
    setBrowserLang("pt-PT");
    renderApp("/glossary/");
    expect(await screen.findByRole("link", { name: pt.langSuggest.cta })).toHaveAttribute(
      "href",
      "/pt/glossario/",
    );
  });

  it("does not offer Portuguese when the visitor explicitly chose English", () => {
    setBrowserLang("pt-PT");
    localStorage.setItem(LANG_STORAGE_KEY, "en"); // a deliberate choice must win over the browser
    renderApp("/");
    expect(screen.queryByRole("link", { name: pt.langSuggest.cta })).not.toBeInTheDocument();
    localStorage.removeItem(LANG_STORAGE_KEY);
  });

  it("does not offer another language to an English-preferring visitor", () => {
    renderApp("/");
    expect(screen.getByText(calcH1(en))).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: pt.langSuggest.cta })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: en.langSuggest.cta })).not.toBeInTheDocument();
  });

  it("stops offering Portuguese once the banner is closed", async () => {
    setBrowserLang("pt-PT");
    const user = userEvent.setup();
    renderApp("/");
    await user.click(await screen.findByRole("button", { name: pt.langSuggest.dismiss }));
    expect(screen.queryByRole("link", { name: pt.langSuggest.cta })).not.toBeInTheDocument();

    // The refusal has to outlive the page: a fresh load must not re-offer what was just declined.
    renderApp("/");
    expect(screen.queryByRole("link", { name: pt.langSuggest.cta })).not.toBeInTheDocument();
    localStorage.removeItem(LANG_SUGGEST_DISMISSED_KEY);
  });

  it("takes the visitor to the Portuguese page when the offer is accepted, and stops offering", async () => {
    setBrowserLang("pt-PT");
    const user = userEvent.setup();
    renderApp("/");
    await user.click(await screen.findByRole("link", { name: pt.langSuggest.cta }));
    expect(screen.getByText(calcH1(pt))).toBeInTheDocument();
    // Accepting is as deliberate as using the switcher, so it is remembered.
    expect(localStorage.getItem(LANG_STORAGE_KEY)).toBe("pt");
    expect(screen.queryByRole("link", { name: pt.langSuggest.cta })).not.toBeInTheDocument();
    localStorage.removeItem(LANG_STORAGE_KEY);
  });

  // The switcher's href is crawlable, so on a page that has no twin it must not invent one: a link to
  // /pt/404/ would send a crawler from one not-found page to another.
  it("points the switcher at the language home on a page with no twin", () => {
    renderApp("/does-not-exist");
    expect(screen.getByRole("link", { name: "PT" })).toHaveAttribute("href", "/pt/");
  });

  it("keeps the shared-link token when the language offer is accepted", async () => {
    setBrowserLang("pt-PT");
    const token = encodeToken({ ...defaultInput(), price: 412345 });
    window.history.replaceState(null, "", `/?c=${token}`);
    const user = userEvent.setup();
    renderAppWithUrlProbe("/");
    await user.click(await screen.findByRole("link", { name: pt.langSuggest.cta }));
    expect(routerUrl()).toBe(`/pt/?c=${token}`);
    localStorage.removeItem(LANG_STORAGE_KEY);
  });

  // hreflang marks the alternates but does not link them, so without a real href here the Portuguese
  // subtree has no inbound link from the English one for a crawler to follow.
  it("links to the other language with a followable, token-free href", () => {
    renderApp("/glossary/");
    const ptLink = screen.getByRole("link", { name: "PT" });
    expect(ptLink).toHaveAttribute("href", "/pt/glossario/");
    expect(ptLink).toHaveAttribute("hreflang", "pt");
  });

  // The active language is still a link so both alternates stay crawlable, so clicking it must be
  // inert rather than a self-navigation that would discard the shared-link token.
  it("does nothing when the language already being read is clicked", async () => {
    const user = userEvent.setup();
    renderApp("/glossary/");
    await user.click(screen.getByRole("link", { name: "EN" }));
    expect(screen.getByText(en.pages.glossaryIntro)).toBeInTheDocument();
    expect(localStorage.getItem(LANG_STORAGE_KEY)).toBeNull();
  });

  // The href is deliberately token-free so only canonical URLs are advertised, so the switch has to
  // re-attach the live token itself or a shared link loses its purchase on a language change.
  it("keeps the shared-link token when switching language", async () => {
    const token = encodeToken({ ...defaultInput(), price: 412345 });
    window.history.replaceState(null, "", `/?c=${token}`);
    const user = userEvent.setup();
    renderAppWithUrlProbe("/glossary/");
    await user.click(screen.getByRole("link", { name: "PT" }));
    expect(routerUrl()).toBe(`/pt/glossario/?c=${token}`);
    localStorage.removeItem(LANG_STORAGE_KEY);
  });

  it("sets a localized document title per route", async () => {
    const user = userEvent.setup();
    renderApp();
    expect(document.title).toBe(homeTitle);
    await user.click(screen.getByRole("link", { name: en.nav.glossary }));
    expect(document.title).toBe(`${en.nav.glossary} · ${en.app.title}`);
    // Switching language navigates to /pt/glossario; the tab title becomes the Portuguese one.
    await user.click(screen.getByRole("link", { name: "PT" }));
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
      expect.objectContaining({ page_path: "/glossary/", ui_theme: "dark" }),
    );
  });

  it("tracks the language switch", async () => {
    const gtag = vi.fn();
    window.gtag = gtag;
    const user = userEvent.setup();
    renderApp();
    await user.click(screen.getByRole("link", { name: "PT" }));
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
    window.history.replaceState(null, "", `/?c=${encodeToken(defaultInput())}`);
    const user = userEvent.setup();
    renderApp();
    // Navigating between pages must NOT re-fire it: arrival is a once-per-load signal, not per view.
    await user.click(screen.getByRole("link", { name: en.nav.glossary }));
    // The glossary page also has a "Calculator" breadcrumb link; the header-nav one is first in DOM.
    await user.click(screen.getAllByRole("link", { name: en.nav.calculator })[0]);
    const arrivals = gtag.mock.calls.filter((c) => c[1] === "arrived_via_share");
    expect(arrivals).toHaveLength(1);
  });

  it("reports a broken shared link", () => {
    const gtag = vi.fn();
    window.gtag = gtag;
    window.history.replaceState(null, "", "/?c=!!!!");
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
    window.history.replaceState(null, "", `/?c=${encodeToken(defaultInput())}`);
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
  setBrowserLang("en-US"); // reset so language-preference state doesn't leak between tests
});
