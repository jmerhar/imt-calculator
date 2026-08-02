import { describe, it, expect, beforeEach } from "vitest";
import {
  encodeState,
  decodeState,
  encodeToken,
  decodeToken,
  encodeCompact,
  readStateFromUrl,
  writeStateToUrl,
} from "@/state/url";
import { defaultInput } from "@/state/defaults";
import type { CalcInput } from "@/engine/types";

const roundTrip = (input: CalcInput) => decodeState(encodeState(input));

describe("url state", () => {
  it("round-trips the default input", () => {
    expect(roundTrip(defaultInput())).toEqual(defaultInput());
  });

  it("round-trips a full multi-buyer input with VPT and mortgage", () => {
    const input: CalcInput = {
      year: 2026,
      location: "madeira",
      intendedUse: "secondary",
      price: 400000,
      vpt: 420000,
      mortgage: { amount: 320000, term: "ge5" },
      buyers: [
        { share: 0.5, type: "individual", taxHaven: false, residency: "non_resident", exception: "former_resident", jovem: false },
        { share: 0.5, type: "entity", taxHaven: true, residency: "resident", exception: "none", jovem: false },
      ],
    };
    expect(roundTrip(input)).toEqual(input);
  });

  it("round-trips a short-term mortgage with a months value", () => {
    const input: CalcInput = {
      ...defaultInput(),
      mortgage: { amount: 50000, term: "lt1", months: 6 },
    };
    expect(roundTrip(input)).toEqual(input);
  });

  it("returns null for malformed or empty query strings", () => {
    expect(decodeState("")).toBeNull();
    expect(decodeState("y=2026")).toBeNull(); // missing required fields
    expect(decodeState("y=2026&loc=zz&use=o&p=100000&b=1,i,0,r,n,0")).toBeNull(); // bad location
    expect(decodeState("y=2026&loc=m&use=o&p=-5&b=1,i,0,r,n,0")).toBeNull(); // negative price
    expect(decodeState("y=2026&loc=m&use=o&p=100000&b=9,i,0,r,n,0")).toBeNull(); // share > 1
    expect(decodeState("y=2099&loc=m&use=o&p=100000&b=1,i,0,r,n,0")).toBeNull(); // no table for that year
  });

  it("produces a compact query string", () => {
    const qs = encodeState(defaultInput());
    expect(qs).toContain("y=2026");
    expect(qs).toContain("loc=m");
  });

  it("round-trips through the compact share token", () => {
    const input: CalcInput = {
      year: 2026,
      location: "madeira",
      intendedUse: "secondary",
      price: 400000,
      vpt: 420000,
      mortgage: { amount: 320000, term: "ge5" },
      buyers: [
        { share: 0.5, type: "individual", taxHaven: false, residency: "non_resident", exception: "former_resident", jovem: false },
        { share: 0.5, type: "entity", taxHaven: true, residency: "resident", exception: "none", jovem: false },
      ],
    };
    const token = encodeToken(input);
    expect(token).not.toContain("="); // opaque, single code — no readable params
    expect(decodeToken(token)).toEqual(input);
  });

  it("round-trips buyer names through the token, even with delimiter/flag characters", () => {
    const input: CalcInput = {
      ...defaultInput(),
      price: 400000,
      intendedUse: "secondary",
      buyers: [
        { name: "Maria | Silva; Lda,", share: 0.5, type: "individual", taxHaven: false, residency: "non_resident", exception: "accessible_rent", jovem: false },
        { name: "José", share: 0.5, type: "entity", taxHaven: true, residency: "resident", exception: "none", jovem: false },
      ],
    };
    const decoded = decodeToken(encodeToken(input))!;
    expect(decoded).toEqual(input);
    // A name full of delimiters and flag letters ("a" = accessible_rent) must not corrupt the
    // flags it is stored next to.
    expect(decoded.buyers[0].residency).toBe("non_resident");
    expect(decoded.buyers[0].exception).toBe("accessible_rent");
  });

  it("encodes a lone named default buyer instead of omitting it as a plain default", () => {
    const input: CalcInput = {
      ...defaultInput(),
      buyers: [{ name: "Ana", share: 1, type: "individual", taxHaven: false, residency: "resident", exception: "none", jovem: false }],
    };
    expect(encodeCompact(input)).toContain("b100~Ana");
    expect(decodeToken(encodeToken(input))).toEqual(input);
  });

  it("drops a blank/whitespace-only name so it stays a plain default buyer", () => {
    const input: CalcInput = {
      ...defaultInput(),
      buyers: [{ name: "   ", share: 1, type: "individual", taxHaven: false, residency: "resident", exception: "none", jovem: false }],
    };
    expect(encodeCompact(input)).toBe("p250000");
  });

  it("keeps the common case tiny (defaults omitted, no percent-encoding)", () => {
    // One resident individual buying an own home: only the price survives.
    expect(encodeCompact(defaultInput())).toBe("p250000");
    // A mixed two-buyer purchase is compact and free of %2C/%3B bloat.
    const two = encodeCompact({
      ...defaultInput(),
      price: 400000,
      intendedUse: "secondary",
      buyers: [
        { share: 0.5, type: "individual", taxHaven: false, residency: "non_resident", exception: "former_resident", jovem: false },
        { share: 0.5, type: "individual", taxHaven: false, residency: "non_resident", exception: "none", jovem: true },
      ],
    });
    expect(two).toBe("p400000;us;b50nf|50nj");
  });

  it("still decodes older (readable-query) tokens", () => {
    const input = defaultInput();
    const b64url = (s: string) =>
      btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    const legacyToken = b64url(encodeState(input));
    expect(decodeToken(legacyToken)).toEqual(input);
  });

  it("returns null for a malformed token", () => {
    expect(decodeToken("!!!not-base64!!!")).toBeNull();
  });

  it("round-trips every non-resident exception through the token", () => {
    for (const exception of ["former_resident", "becomes_resident", "accessible_rent"] as const) {
      const input: CalcInput = {
        ...defaultInput(),
        buyers: [{ share: 1, type: "individual", taxHaven: false, residency: "non_resident", exception, jovem: false }],
      };
      expect(decodeToken(encodeToken(input))).toEqual(input);
    }
  });

  it("round-trips fractional equal shares exactly (no float drift)", () => {
    // Three-way split: 0.3333 / 0.3333 / 0.3334. Decoding must return those exact values.
    const input: CalcInput = {
      ...defaultInput(),
      buyers: [0.3333, 0.3333, 0.3334].map((share) => ({
        share,
        type: "individual" as const,
        taxHaven: false,
        residency: "resident" as const,
        exception: "none" as const,
        jovem: false,
      })),
    };
    expect(decodeToken(encodeToken(input))).toEqual(input);
  });

  it("rejects a token with a corrupted location rather than defaulting it", () => {
    const b64url = (s: string) => btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    expect(decodeToken(b64url("p100000;lZZ"))).toBeNull();
  });
});

describe("url read/write (query string)", () => {
  beforeEach(() => {
    // Clear both the search and the hash between cases so each starts from a bare path.
    window.history.replaceState(null, "", "/");
  });

  it("writes state to the query string and reads it back", () => {
    const input = { ...defaultInput(), price: 500000 };
    writeStateToUrl(input);
    expect(window.location.search).toContain("c=");
    expect(window.location.hash).toBe(""); // token lives in the real query, not the hash
    expect(readStateFromUrl()).toEqual(input);
  });

  it("still reads a legacy hash token (links shared during the HashRouter era)", () => {
    window.location.hash = "#/?c=" + encodeToken({ ...defaultInput(), price: 500000 });
    expect(readStateFromUrl()).toEqual({ ...defaultInput(), price: 500000 });
  });

  it("still reads a legacy readable-query hash", () => {
    window.location.hash = "#/?" + encodeState(defaultInput());
    expect(readStateFromUrl()).toEqual(defaultInput());
  });

  it("returns null when the URL carries no state", () => {
    expect(readStateFromUrl()).toBeNull();
  });
});
