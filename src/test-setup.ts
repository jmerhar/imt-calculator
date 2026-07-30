// Extends Vitest's `expect` with jest-dom matchers (toBeInTheDocument, toHaveValue, …) and
// unmounts rendered React trees between tests. Loaded via vite.config.ts `test.setupFiles`.
import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

afterEach(() => {
  cleanup();
  // The calculator persists inputs to the URL hash, and language/theme choices to localStorage;
  // jsdom keeps both across tests in a worker, so reset them to isolate each test's initial state.
  window.location.hash = "";
  if (typeof localStorage !== "undefined") localStorage.clear();
});
