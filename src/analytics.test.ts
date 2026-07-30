import { describe, it, expect, vi, afterEach } from "vitest";
import { track, priceBand, rateBand } from "@/analytics";

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
