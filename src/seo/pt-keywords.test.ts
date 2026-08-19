import { describe, it, expect } from "vitest";
import { pt } from "@/i18n/pt";
import { fmt } from "@/i18n/lang";
import { SEO_PAGES } from "@/seo/meta";
import { LATEST_YEAR } from "@/engine/tables";

// Portuguese search demand for this tool splits across two word families, and the page has to answer
// both: "simulador"/"simular" and "calculadora"/"calcular". Losing either makes the page invisible
// for that half of the queries rather than merely outranked, which is what happened when "simulador"
// appeared nowhere on the site. These are the surfaces a crawler weighs most heavily on the
// Portuguese home page, so a copy edit that drops a family should fail here rather than quietly ship.

const SIMULAR = /simulad|simule|simula/i;
const CALCULAR = /calculadora|calcule|calcular|calculado|cálculo/i;

/** The Portuguese home page's keyword-bearing surfaces, read from the strings the site actually uses. */
const surfaces: [name: string, value: string][] = [
  ["SEO title", SEO_PAGES["/"].pt.title],
  ["SEO description", SEO_PAGES["/"].pt.description],
  ["h1", fmt(pt.pages.calculatorH1, { year: LATEST_YEAR })],
  ["intro", fmt(pt.pages.calculatorIntro, { year: LATEST_YEAR })],
];

/** The surfaces matching `re`, by name — reported on failure so it is clear what is missing. */
const matching = (re: RegExp) => surfaces.filter(([, v]) => re.test(v)).map(([n]) => n);

describe("Portuguese home page covers both keyword families", () => {
  // Pinned so removing a surface fails loudly instead of silently checking fewer of them.
  it("checks every keyword-bearing surface", () => {
    expect(surfaces).toHaveLength(4);
    for (const [name, value] of surfaces) expect(value, name).toBeTruthy();
  });

  it("leads the title with the simulador form, which is how the query is typed", () => {
    expect(SEO_PAGES["/"].pt.title).toMatch(/^Simulador/);
  });

  // Named individually, not as an "at least one surface" check: the title and the heading are the two
  // most heavily weighted slots, so a revert of either has to fail here. A looser check passes while
  // the heading quietly loses the word.
  it.each([["SEO title"], ["h1"]])("names the simulador family in the %s", (name) => {
    const [, value] = surfaces.find(([n]) => n === name)!;
    expect(value).toMatch(SIMULAR);
  });

  it("keeps the calculadora family, the larger of the two, somewhere on the page", () => {
    expect(matching(CALCULAR)).not.toHaveLength(0);
  });

  // The English page targets English queries; "simulador" there would be noise.
  it("leaves the English home page out of it", () => {
    expect(SEO_PAGES["/"].en.title).not.toMatch(SIMULAR);
    expect(SEO_PAGES["/"].en.description).not.toMatch(SIMULAR);
  });
});
