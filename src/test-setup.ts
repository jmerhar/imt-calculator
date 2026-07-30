// Extends Vitest's `expect` with jest-dom matchers (toBeInTheDocument, toHaveValue, …) and
// unmounts rendered React trees between tests. Loaded via vite.config.ts `test.setupFiles`.
import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

afterEach(() => cleanup());
