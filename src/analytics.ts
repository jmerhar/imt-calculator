// Thin wrapper over Google Analytics (gtag). All events are aggregate and privacy-safe: money is
// reported as coarse bands, never the raw figure. gtag is injected by index.html; when it is
// absent (tests, blockers) every call is a silent no-op.

declare global {
  interface Window {
    gtag?: (command: string, ...args: unknown[]) => void;
  }
}

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
