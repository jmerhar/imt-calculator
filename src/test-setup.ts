// Extends Vitest's `expect` with jest-dom matchers (toBeInTheDocument, toHaveValue, …) and
// unmounts rendered React trees between tests. Loaded via vite.config.ts `test.setupFiles`.
import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// jsdom does not expose localStorage in every environment (e.g. Node 26 locally, but present on CI).
// Provide a deterministic in-memory implementation so persistence (language/theme) is testable
// and consistent everywhere.
if (typeof localStorage === "undefined") {
  const store = new Map<string, string>();
  const mock: Storage = {
    getItem: (k) => (store.has(k) ? store.get(k)! : null),
    setItem: (k, v) => void store.set(k, String(v)),
    removeItem: (k) => void store.delete(k),
    clear: () => store.clear(),
    key: (i) => [...store.keys()][i] ?? null,
    get length() {
      return store.size;
    },
  };
  Object.defineProperty(globalThis, "localStorage", { value: mock, configurable: true });
}

afterEach(() => {
  cleanup();
  // The calculator persists inputs to the URL hash, and language/theme choices to localStorage;
  // jsdom keeps both across tests in a worker, so reset them to isolate each test's initial state.
  window.location.hash = "";
  if (typeof localStorage !== "undefined") localStorage.clear();
});
