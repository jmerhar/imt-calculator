import { describe, it, expect } from "vitest";
import { buildSitemap } from "@/seo/sitemap";
import { GUIDE_META } from "@/content/guides/registry";

/** Every <loc>…</loc> in document order. */
function locs(xml: string): string[] {
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
}

/** The <lastmod> paired with each <loc>, keyed by URL. */
function lastmods(xml: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const m of xml.matchAll(/<loc>([^<]+)<\/loc>[\s\S]*?<lastmod>([^<]+)<\/lastmod>/g)) {
    out[m[1]] = m[2];
  }
  return out;
}

describe("buildSitemap", () => {
  const xml = buildSitemap();

  it("emits every page in both languages", () => {
    // Three core pages + the guides index + one entry per guide, each in EN and PT.
    expect(locs(xml)).toHaveLength((3 + 1 + GUIDE_META.length) * 2);
  });

  it("uses canonical trailing-slash URLs, matching what Pages serves", () => {
    for (const loc of locs(xml)) expect(loc).toMatch(/\/$/);
  });

  it("lists no URL twice", () => {
    const all = locs(xml);
    expect(new Set(all).size).toBe(all.length);
  });

  // A build-clock <lastmod> re-announces unchanged pages on every deploy until search engines stop
  // trusting the field, so each URL has to carry its own content date.
  it("dates each guide by its own last update, not one shared date", () => {
    const dated = lastmods(xml);
    for (const m of GUIDE_META) {
      expect(dated[`https://calc-imt.online/guides/${m.slug.en}/`]).toBe(m.updated);
      expect(dated[`https://calc-imt.online/pt/guias/${m.slug.pt}/`]).toBe(m.updated);
    }
  });

  it("dates the guides index by the newest guide it lists", () => {
    const newest = GUIDE_META.map((m) => m.updated).sort().at(-1);
    expect(lastmods(xml)["https://calc-imt.online/guides/"]).toBe(newest);
    expect(lastmods(xml)["https://calc-imt.online/pt/guias/"]).toBe(newest);
  });

  it("gives every URL a valid ISO date", () => {
    const dated = lastmods(xml);
    expect(Object.keys(dated)).toHaveLength(locs(xml).length);
    for (const d of Object.values(dated)) expect(d).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("pairs each page with its other-language alternate reciprocally", () => {
    const home = xml.match(/<url>\s*<loc>https:\/\/calc-imt\.online\/<\/loc>[\s\S]*?<\/url>/)![0];
    expect(home).toContain('hreflang="en" href="https://calc-imt.online/"');
    expect(home).toContain('hreflang="pt" href="https://calc-imt.online/pt/"');
    expect(home).toContain('hreflang="x-default" href="https://calc-imt.online/"');
  });
});
