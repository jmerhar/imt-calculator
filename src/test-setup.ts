// Extends Vitest's `expect` with jest-dom matchers (toBeInTheDocument, toHaveValue, …) and
// unmounts rendered React trees between tests. Loaded via vite.config.ts `test.setupFiles`.
import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

afterEach(() => {
  cleanup();
  // The calculator persists inputs to the URL hash; jsdom keeps window.location across tests,
  // so clear it to keep each test's initial state isolated.
  window.location.hash = "";
});
