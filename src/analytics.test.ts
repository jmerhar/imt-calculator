import { describe, it, expect, vi, afterEach } from "vitest";
import { track, priceBand, rateBand, vptRatioBand, vptRatioPct } from "@/analytics";

afterEach(() => {
  delete window.gtag;
});

describe("priceBand", () => {
  it("maps values to coarse bands", () => {
    expect(priceBand(0)).toBe("none");
    expect(priceBand(-5)).toBe("none");
    expect(priceBand(50_000)).toBe("<100k");
    expect(priceBand(100_000)).toBe("100-250k");
    expect(priceBand(250_000)).toBe("250-500k");
    expect(priceBand(500_000)).toBe("500k-1M");
    expect(priceBand(1_000_000)).toBe(">1M");
  });
});

describe("rateBand", () => {
  it("maps rates to coarse bands", () => {
    expect(rateBand(0.005)).toBe("<1%");
    expect(rateBand(0.02)).toBe("1-3%");
    expect(rateBand(0.04)).toBe("3-5%");
    expect(rateBand(0.06)).toBe("5-7%");
    expect(rateBand(0.075)).toBe(">=7%");
  });

  it("puts each exact boundary in the upper band", () => {
    expect(rateBand(0.01)).toBe("1-3%");
    expect(rateBand(0.03)).toBe("3-5%");
    expect(rateBand(0.05)).toBe("5-7%");
    expect(rateBand(0.07)).toBe(">=7%");
  });
});

describe("vptRatioBand", () => {
  it("returns 'none' without a usable VPT or price", () => {
    expect(vptRatioBand(undefined, 300_000)).toBe("none");
    expect(vptRatioBand(0, 300_000)).toBe("none");
    expect(vptRatioBand(200_000, 0)).toBe("none");
  });

  it("maps the VPT/price ratio to coarse bands", () => {
    expect(vptRatioBand(120_000, 300_000)).toBe("<50%"); // 0.40
    expect(vptRatioBand(165_000, 300_000)).toBe("50-60%"); // 0.55
    expect(vptRatioBand(195_000, 300_000)).toBe("60-70%"); // 0.65
    expect(vptRatioBand(225_000, 300_000)).toBe("70-80%"); // 0.75
    expect(vptRatioBand(255_000, 300_000)).toBe("80-90%"); // 0.85
    expect(vptRatioBand(285_000, 300_000)).toBe("90-100%"); // 0.95
    expect(vptRatioBand(360_000, 300_000)).toBe(">=100%"); // 1.20 → base is the VPT
  });

  it("puts each exact boundary in the upper band", () => {
    expect(vptRatioBand(150_000, 300_000)).toBe("50-60%"); // 0.50
    expect(vptRatioBand(180_000, 300_000)).toBe("60-70%"); // 0.60
    expect(vptRatioBand(210_000, 300_000)).toBe("70-80%"); // 0.70
    expect(vptRatioBand(240_000, 300_000)).toBe("80-90%"); // 0.80
    expect(vptRatioBand(270_000, 300_000)).toBe("90-100%"); // 0.90
    expect(vptRatioBand(300_000, 300_000)).toBe(">=100%"); // 1.00
  });
});

describe("vptRatioPct", () => {
  it("returns undefined without a usable VPT or price", () => {
    expect(vptRatioPct(undefined, 300_000)).toBeUndefined();
    expect(vptRatioPct(0, 300_000)).toBeUndefined();
    expect(vptRatioPct(200_000, 0)).toBeUndefined();
  });

  it("returns the percentage rounded to one decimal", () => {
    expect(vptRatioPct(240_000, 300_000)).toBe(80);
    expect(vptRatioPct(300_000, 300_000)).toBe(100);
    expect(vptRatioPct(123_456, 300_000)).toBe(41.2); // 0.41152 → 41.2
    expect(vptRatioPct(360_000, 300_000)).toBe(120);
  });
});

describe("track", () => {
  it("forwards the event to gtag when present", () => {
    const gtag = vi.fn();
    window.gtag = gtag;
    track("calculate", { value: 1 });
    expect(gtag).toHaveBeenCalledWith("event", "calculate", { value: 1 });
  });

  it("is a silent no-op when gtag is absent", () => {
    expect(() => track("calculate")).not.toThrow();
  });
});
