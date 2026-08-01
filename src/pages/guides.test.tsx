import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, useRoutes, type RouteObject } from "react-router-dom";
import { routes } from "@/routes";
import { en as EN } from "@/i18n/en";
import { GUIDE_META } from "@/content/guides/registry";
import { GUIDE_BODIES } from "@/content/guides";
import { guidePath, guidesIndexPath, guideFromPath, switchLangPath } from "@/i18n/paths";
import { decodeToken } from "@/state/url";
import { getYearData, LATEST_YEAR } from "@/engine/tables";
import { formatAmount } from "@/format";

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

const nonResidents = GUIDE_META.find((g) => g.id === "imt-non-residents")!;

describe("guides — path helpers", () => {
  it("builds localized index and article paths", () => {
    expect(guidesIndexPath("en")).toBe("/guides/");
    expect(guidesIndexPath("pt")).toBe("/pt/guias/");
    expect(guidePath("en", "imt-tables")).toBe("/guides/imt-tables/");
    expect(guidePath("pt", "imt-tables")).toBe("/pt/guias/tabelas-imt/");
  });

  it("falls back to the index for an unknown guide id", () => {
    expect(guidePath("en", "does-not-exist")).toBe("/guides/");
  });

  it("resolves a pathname to a guide (index, article, unknown slug, non-guide)", () => {
    expect(guideFromPath("/guides/")).toEqual({ lang: "en", kind: "index", id: null });
    expect(guideFromPath("/pt/guias/imt-nao-residentes/")).toEqual({
      lang: "pt",
      kind: "article",
      id: "imt-non-residents",
    });
    expect(guideFromPath("/guides/nope")).toEqual({ lang: "en", kind: "article", id: null });
    expect(guideFromPath("/glossary")).toBeNull();
  });

  it("switches language across localized guide slugs and leaves other pages prefix-based", () => {
    expect(switchLangPath("/guides/imt-tables/", "pt")).toBe("/pt/guias/tabelas-imt/");
    expect(switchLangPath("/pt/guias/", "en")).toBe("/guides/");
    expect(switchLangPath("/glossary/", "pt")).toBe("/pt/glossario/");
  });
});

describe("guides — pages", () => {
  beforeEach(() => window.history.replaceState(null, "", "/"));

  it("lists the guides on the index with links to each article", () => {
    renderApp("/guides");
    expect(screen.getByText(EN.pages.guidesTitle)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: nonResidents.navLabel.en })).toHaveAttribute(
      "href",
      guidePath("en", nonResidents.id),
    );
  });

  it("renders an English guide article with its title, an FAQ, and a prefilled calculator CTA", () => {
    renderApp("/guides/imt-non-residents");
    expect(screen.getByRole("heading", { level: 1, name: nonResidents.title.en })).toBeInTheDocument();
    const faqQ = GUIDE_BODIES["imt-non-residents"].en.faq![0].q;
    expect(screen.getByText(faqQ)).toBeInTheDocument();
    // The CTA deep-links to the calculator with the article's scenario pre-filled (?c= token).
    const cta = screen.getByRole("link", { name: GUIDE_BODIES["imt-non-residents"].en.cta });
    const href = cta.getAttribute("href")!;
    expect(href).toMatch(/^\/\?c=.+/);
    const decoded = decodeToken(new URLSearchParams(href.slice(href.indexOf("?"))).get("c")!);
    expect(decoded?.price).toBe(400000);
    expect(decoded?.buyers[0].residency).toBe("non_resident");
  });

  it("resolves precomputed figures and the year in guide prose, leaving no raw tokens", () => {
    const { container } = renderApp("/guides/imt-jovem");
    // Worked-example figures come from computed.ts (the engine), interpolated at render.
    expect(container.textContent).toContain("€5,556.88");
    expect(container.textContent).toContain("€330,539");
    // No {token} placeholder must leak into the rendered output.
    expect(container.textContent).not.toMatch(/\{\w+\}/);
  });

  it("renders the six rate tables in the tables guide from live engine data", () => {
    renderApp("/guides/imt-tables");
    expect(screen.getAllByRole("table")).toHaveLength(6);
    // A Table I threshold for the latest year, locale-formatted, proves the live engine data is
    // rendered — derived from the engine so it stays valid after a year bump.
    const threshold = formatAmount(getYearData(LATEST_YEAR)!.tables.I[1].lower, "en", 0);
    expect(screen.getAllByText(threshold).length).toBeGreaterThan(0);
  });

  it("renders the Portuguese article at its localized slug", () => {
    renderApp("/pt/guias/imt-nao-residentes");
    expect(screen.getByRole("heading", { level: 1, name: nonResidents.title.pt })).toBeInTheDocument();
  });

  it("shows the not-found page for an unknown guide slug", () => {
    renderApp("/guides/no-such-guide");
    expect(screen.getByText(EN.pages.notFoundTitle)).toBeInTheDocument();
  });

  it("language toggle on a guide navigates to the localized twin", async () => {
    const user = userEvent.setup();
    renderApp("/guides/imt-non-residents");
    await user.click(screen.getByRole("button", { name: "PT" }));
    expect(screen.getByRole("heading", { level: 1, name: nonResidents.title.pt })).toBeInTheDocument();
  });
});
