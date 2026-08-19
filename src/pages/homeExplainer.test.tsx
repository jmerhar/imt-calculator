import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, useRoutes, type RouteObject } from "react-router-dom";
import { routes } from "@/routes";
import { en } from "@/i18n/en";
import { pt } from "@/i18n/pt";
import { homeExplainer, homeFaq } from "@/content/homeExplainer";
import { jsonLdFor } from "@/seo/jsonld";
import { SITE_URL } from "@/config";
import type { Lang } from "@/i18n/lang";

function RoutedApp() {
  return useRoutes(routes as RouteObject[]);
}
function renderHome(path = "/") {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <RoutedApp />
    </MemoryRouter>,
  );
}

/** The FAQPage questions a route emits, parsed out of the JSON-LD script tags. */
function faqQuestions(lang: Lang, bare: string, url: string): string[] {
  const html = jsonLdFor(lang, bare, url);
  const json = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(
    (m) => JSON.parse(m[1]) as { "@type": string; mainEntity?: { name: string }[] },
  );
  return json.find((b) => b["@type"] === "FAQPage")?.mainEntity?.map((q) => q.name) ?? [];
}

describe("home explainer", () => {
  it("renders every section heading and the FAQ", () => {
    const { container } = renderHome();
    expect(screen.getByText(en.pages.explainerHeading)).toBeInTheDocument();
    for (const s of homeExplainer) {
      expect(container.textContent).toContain(s.en.heading);
    }
    for (const f of homeFaq) expect(container.textContent).toContain(f.en.q);
  });

  it("renders the Portuguese explainer on /pt/", () => {
    const { container } = renderHome("/pt/");
    expect(screen.getByText(pt.pages.explainerHeading)).toBeInTheDocument();
    for (const s of homeExplainer) expect(container.textContent).toContain(s.pt.heading);
  });

  // Figures are {token}s resolved from the engine's precomputed values; a leaked token means the
  // prose is quoting a placeholder at a reader.
  it("resolves every figure token, leaving none raw", () => {
    const { container } = renderHome();
    expect(container.textContent).not.toMatch(/\{\w+\}/);
    // A precomputed figure proves resolution ran rather than the prose simply having no tokens.
    expect(container.textContent).toContain("18,236.65");
  });

  it("links through to the guides it summarizes", () => {
    renderHome();
    for (const [name, href] of [
      ["imt-tables", "/guides/imt-tables/"],
      ["imt-non-residents", "/guides/imt-non-residents/"],
      ["imt-jovem", "/guides/imt-jovem/"],
    ] as const) {
      const links = screen.getAllByRole("link").map((a) => a.getAttribute("href"));
      expect(links, name).toContain(href);
    }
  });

  // Google requires FAQPage content to be visible on the page. The markup and the prose come from one
  // declaration, and this is the assertion that keeps them that way.
  it.each(["en", "pt"] as const)("emits only FAQ questions the %s page renders", (lang) => {
    const path = lang === "en" ? "/" : "/pt/";
    const { container } = renderHome(path);
    const questions = faqQuestions(lang, "/", `${SITE_URL}${path}`);
    expect(questions).toHaveLength(homeFaq.length);
    for (const q of questions) expect(container.textContent).toContain(q);
  });

  it("keeps a single h1 and a heading outline with no skipped level", () => {
    const { container } = renderHome();
    expect(container.querySelectorAll("h1")).toHaveLength(1);
    const levels = [...container.querySelectorAll("h1,h2,h3,h4,h5,h6")].map((h) =>
      Number(h.tagName[1]),
    );
    for (let i = 1; i < levels.length; i++) {
      expect(levels[i] - levels[i - 1], `after h${levels[i - 1]}`).toBeLessThanOrEqual(1);
    }
  });
});
