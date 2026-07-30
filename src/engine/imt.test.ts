import { describe, it, expect } from "vitest";
import { calculate, ordinaryImt, pickTable } from "@/engine/imt";
import { data2026 } from "@/engine/tables/2026";
import { calcId } from "@/engine/hash";
import type { Buyer, CalcInput } from "@/engine/types";

const buyer = (o: Partial<Buyer> = {}): Buyer => ({
  share: 1,
  type: "individual",
  taxHaven: false,
  residency: "resident",
  exception: "none",
  jovem: false,
  ...o,
});

const input = (o: Partial<CalcInput> = {}): CalcInput => ({
  year: 2026,
  location: "mainland",
  intendedUse: "secondary",
  price: 400000,
  buyers: [buyer()],
  ...o,
});

describe("ordinaryImt", () => {
  it("computes the AT bracket formula on the mainland secondary table", () => {
    // €400k in Table III bracket 330 539–633 931: 8% − 12 699.89.
    expect(ordinaryImt(400000, data2026.tables.III)).toBeCloseTo(19300.11, 2);
  });

  it("treats a value exactly on a threshold as the lower 'até X' bracket", () => {
    // 106 346 is the top of the 1% band in Table III, not the start of the 2% band.
    expect(ordinaryImt(106346, data2026.tables.III)).toBeCloseTo(1063.46, 2);
    expect(ordinaryImt(106346.01, data2026.tables.III)).toBeCloseTo(1063.4602, 2);
  });

  it("applies flat ('taxa única') brackets on the whole value", () => {
    // Table I above 660 982: flat 6%.
    expect(ordinaryImt(800000, data2026.tables.I)).toBeCloseTo(48000, 2);
  });

  it("is zero at or below zero", () => {
    expect(ordinaryImt(0, data2026.tables.I)).toBe(0);
    expect(ordinaryImt(-5, data2026.tables.III)).toBe(0);
  });
});

describe("pickTable", () => {
  it("derives the table from location, use and Jovem eligibility", () => {
    expect(pickTable("mainland", "own_permanent", false)).toBe("I");
    expect(pickTable("mainland", "own_permanent", true)).toBe("II");
    expect(pickTable("mainland", "secondary", false)).toBe("III");
    expect(pickTable("azores", "own_permanent", false)).toBe("IV");
    expect(pickTable("madeira", "own_permanent", true)).toBe("V");
    expect(pickTable("madeira", "secondary", false)).toBe("VI");
  });
});

describe("calculate — headline scenarios", () => {
  it("single resident buyer, mainland secondary, €400k", () => {
    const r = calculate(input());
    expect(r.totalImt).toBeCloseTo(19300.11, 2);
    expect(r.totalStampDutyTransfer).toBeCloseTo(3200, 2);
    expect(r.grandTotal).toBeCloseTo(22500.11, 2);
    expect(r.baseSource).toBe("price");
    expect(r.buyers[0].table).toBe("III");
  });

  it("former resident + non-resident, 50/50, secondary → €27,850.06 total", () => {
    const r = calculate(
      input({
        buyers: [
          buyer({ share: 0.5, residency: "non_resident", exception: "former_resident" }),
          buyer({ share: 0.5, residency: "non_resident", exception: "none" }),
        ],
      }),
    );
    expect(r.buyers[0].imt).toBeCloseTo(9650.06, 2); // ordinary via totality rate
    expect(r.buyers[0].rule).toBe("ordinary");
    expect(r.buyers[1].imt).toBeCloseTo(15000, 2); // flat 7.5%
    expect(r.buyers[1].rule).toBe("non_resident_7_5");
    expect(r.totalImt).toBeCloseTo(24650.06, 2);
    expect(r.totalStampDuty).toBeCloseTo(3200, 2);
    expect(r.grandTotal).toBeCloseTo(27850.06, 2);
  });

  it("same pair but own-permanent-home (Table I) → €24,118.33 IMT", () => {
    const r = calculate(
      input({
        intendedUse: "own_permanent",
        buyers: [
          buyer({ share: 0.5, residency: "non_resident", exception: "former_resident" }),
          buyer({ share: 0.5, residency: "non_resident", exception: "none" }),
        ],
      }),
    );
    expect(r.buyers[0].imt).toBeCloseTo(9118.33, 2);
    expect(r.totalImt).toBeCloseTo(24118.33, 2);
    expect(r.grandTotal).toBeCloseTo(27318.33, 2);
  });
});

describe("calculate — rule precedence & special cases", () => {
  it("tax-haven entity pays a flat 10%", () => {
    const r = calculate(input({ buyers: [buyer({ type: "entity", taxHaven: true })] }));
    expect(r.buyers[0].rule).toBe("tax_haven_10");
    expect(r.totalImt).toBeCloseTo(40000, 2);
  });

  it("IMT Jovem zeroes IMT below the exemption ceiling", () => {
    const r = calculate(
      input({ intendedUse: "own_permanent", price: 300000, buyers: [buyer({ jovem: true })] }),
    );
    expect(r.buyers[0].table).toBe("II");
    expect(r.totalImt).toBe(0);
    expect(r.totalStampDutyTransfer).toBeCloseTo(2400, 2);
  });

  it("autonomous-region secondary uses Table VI", () => {
    const r = calculate(input({ location: "madeira" }));
    expect(r.buyers[0].table).toBe("VI");
    expect(r.totalImt).toBeCloseTo(16256.85, 2);
  });

  it("uses VPT as the base when it exceeds the price", () => {
    const r = calculate(input({ price: 300000, vpt: 350000 }));
    expect(r.taxBase).toBe(350000);
    expect(r.baseSource).toBe("vpt");
  });

  it("non-resident who will become resident pays 7.5% now, reclaimable to ordinary", () => {
    const r = calculate(input({ buyers: [buyer({ residency: "non_resident", exception: "becomes_resident" })] }));
    expect(r.buyers[0].imt).toBeCloseTo(30000, 2);
    expect(r.buyers[0].reclaimableTo).toBeCloseTo(19300.11, 2);
    expect(r.reclaimableTotal).toBeCloseTo(10699.89, 2);
  });

  it("adds mortgage stamp duty (verba 17.1.3, ≥5yr = 0.6%)", () => {
    const r = calculate(input({ mortgage: { amount: 320000, term: "ge5" } }));
    expect(r.mortgageStampDuty).toBeCloseTo(1920, 2);
    expect(r.totalStampDuty).toBeCloseTo(3200 + 1920, 2);
  });

  it("flags shares that do not total 100%", () => {
    const r = calculate(input({ buyers: [buyer({ share: 0.5 }), buyer({ share: 0.3 })] }));
    expect(r.warnings).toContain("shares_not_100");
  });
});

describe("calcId", () => {
  it("is deterministic and input-sensitive", () => {
    expect(calcId(input())).toBe(calcId(input()));
    expect(calcId(input())).not.toBe(calcId(input({ price: 400001 })));
    expect(calcId(input())).toMatch(/^IMT-[0-9A-Z]{10}$/);
  });
});
