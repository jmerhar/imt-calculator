// Thin wrapper over Google Analytics (gtag). All events are aggregate and privacy-safe: money is
// reported as coarse bands, never the raw figure. gtag is injected by index.html; when it is
// absent (tests, blockers) every call is a silent no-op.

declare global {
  interface Window {
    gtag?: (command: string, ...args: unknown[]) => void;
  }
}

/** Send a GA event. No-op when gtag is absent (tests, ad blockers, or dev off the live domain). */
export function track(name: string, params?: Record<string, unknown>): void {
  window.gtag?.("event", name, params);
}

/** Coarse price/VPT band — avoids sending an exact amount to analytics. */
export function priceBand(value: number): string {
  if (value <= 0) return "none";
  if (value < 100_000) return "<100k";
  if (value < 250_000) return "100-250k";
  if (value < 500_000) return "250-500k";
  if (value < 1_000_000) return "500k-1M";
  return ">1M";
}

/** Coarse effective-rate band. */
export function rateBand(rate: number): string {
  const pct = rate * 100;
  if (pct < 1) return "<1%";
  if (pct < 3) return "1-3%";
  if (pct < 5) return "3-5%";
  if (pct < 7) return "5-7%";
  return ">=7%";
}

/**
 * Coarse VPT-to-price ratio band. Portuguese VPT typically falls in ~50–90% of the purchase price
 * (roughly 40–80% per market commentary, up to ~80–90% for values aligned in the tax reforms), so
 * the 50–100% range gets 10-point resolution, with a `<50%` tail for older under-assessed property.
 * `"none"` when no VPT was entered (or price is non-positive); `">=100%"` means the VPT met or
 * exceeded the price, so the tax base was the VPT, not the price. A ratio carries no absolute figure.
 */
export function vptRatioBand(vpt: number | undefined, price: number): string {
  if (!vpt || vpt <= 0 || price <= 0) return "none";
  const ratio = vpt / price;
  if (ratio < 0.5) return "<50%";
  if (ratio < 0.6) return "50-60%";
  if (ratio < 0.7) return "60-70%";
  if (ratio < 0.8) return "70-80%";
  if (ratio < 0.9) return "80-90%";
  if (ratio < 1) return "90-100%";
  return ">=100%";
}

/**
 * VPT as a percentage of price (e.g. 82.5), rounded to one decimal, or undefined when there is no
 * usable VPT/price. Sent as a numeric GA metric so reports can show an average VPT ratio and its
 * full distribution rather than just band counts; a ratio carries no absolute amount.
 */
export function vptRatioPct(vpt: number | undefined, price: number): number | undefined {
  if (!vpt || vpt <= 0 || price <= 0) return undefined;
  return Math.round((vpt / price) * 1000) / 10;
}
