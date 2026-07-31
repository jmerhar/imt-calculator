import { describe, it, expect } from "vitest";
import { en } from "@/i18n/en";
import { pt } from "@/i18n/pt";
import { fmt } from "@/i18n";

function paths(obj: unknown, prefix = ""): string[] {
  if (obj && typeof obj === "object") {
    return Object.entries(obj).flatMap(([k, v]) => paths(v, prefix ? `${prefix}.${k}` : k));
  }
  return [prefix];
}

describe("i18n dictionaries", () => {
  it("English and Portuguese have identical key sets", () => {
    expect(paths(pt).sort()).toEqual(paths(en).sort());
  });

  it("no Portuguese string is left as the English original", () => {
    // Guards against copy-paste stubs; the shared "IMT" / "Portugal · 2026" values are expected.
    const shared = new Set(["IMT", "Portugal · 2026", "Madeira", "Subtotal", "Menu"]);
    const enFlat = Object.fromEntries(paths(en).map((p) => [p, get(en, p)]));
    for (const p of paths(pt)) {
      const ptVal = get(pt, p);
      if (ptVal === enFlat[p] && !shared.has(ptVal)) {
        throw new Error(`pt["${p}"] is still the English string: "${ptVal}"`);
      }
    }
  });
});

describe("fmt", () => {
  it("substitutes named placeholders", () => {
    expect(fmt("Rates for {year}.", { year: 2026 })).toBe("Rates for 2026.");
  });
  it("leaves unknown placeholders intact", () => {
    expect(fmt("Hi {name}", {})).toBe("Hi {name}");
  });
});

function get(obj: unknown, path: string): string {
  return path.split(".").reduce<unknown>((o, k) => (o as Record<string, unknown>)?.[k], obj) as string;
}
