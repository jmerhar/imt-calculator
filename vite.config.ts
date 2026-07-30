import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

// Served at the root of the custom domain (calc-imt.online); the github.io project URL
// redirects there, so assets are referenced from "/".
export default defineConfig({
  base: "/",
  plugins: [react()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test-setup.ts"],
    coverage: {
      provider: "v8",
      // text/text-summary → terminal; html → the published jmerhar/coverage report;
      // json-summary → scripts/coverage-report.py aggregation; lcov → Codecov upload.
      reporter: ["text", "text-summary", "html", "json-summary", "lcov"],
      reportsDirectory: "./coverage",
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/**/*.test.*",
        "src/**/__tests__/**",
        "src/test-setup.ts",
        "src/vite-env.d.ts",
        "src/engine/types.ts",
        "src/main.tsx",
      ],
    },
  },
});
