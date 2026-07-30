import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

// GitHub Pages serves this project at https://jmerhar.github.io/imt-calculator/, so the
// production bundle must be built under that sub-path; the dev server stays at the root.
export default defineConfig(({ mode }) => ({
  base: mode === "production" ? "/imt-calculator/" : "/",
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
        // Type-only module: compiles to nothing, so coverage of it is meaningless.
        "src/engine/types.ts",
        // Application entrypoint: mounts <App/> onto the DOM root. Pure bootstrap glue
        // with no logic to unit-test.
        "src/main.tsx",
      ],
    },
  },
}));
