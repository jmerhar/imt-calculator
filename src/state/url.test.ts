import { describe, it, expect } from "vitest";
import { encodeState, decodeState, encodeToken, decodeToken, encodeCompact } from "@/state/url";
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
});
