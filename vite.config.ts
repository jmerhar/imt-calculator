/// <reference types="vite-react-ssg" />
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

// Absolute base "/" is required so nested prerendered pages (e.g. /glossary/index.html) reference
// assets from the domain root. The site is served at the custom domain calc-imt.online; reverting
// to a GitHub Pages project sub-path would need a matching base.
export default defineConfig({
  base: "/",
  plugins: [react()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
  // vite-react-ssg: prerender each static route to its own directory (/glossary/index.html) for
  // clean, crawlable URLs.
  ssgOptions: {
    dirStyle: "nested",
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
