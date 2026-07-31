/// <reference types="vite-react-ssg" />
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { SITE_URL } from "./src/config";
import { SEO_PAGES } from "./src/seo/meta";

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// Inject per-route <title>, meta description and canonical into each prerendered page so crawlers
// see distinct, correct metadata (not the generic index.html template). Build-time only.
function injectSeo(route: string, html: string): string {
  // vite-react-ssg passes routes without a leading slash ("glossary"); normalize to "/glossary".
  const clean = route.replace(/^\/+|\/+$/g, "");
  const key = clean ? `/${clean}` : "/";
  const meta = SEO_PAGES[key] ?? SEO_PAGES["/"];
  const canonical = clean ? `${SITE_URL}/${clean}/` : `${SITE_URL}/`;
  const desc = `<meta name="description" content="${escapeHtml(meta.description)}" />`;
  let out = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(meta.title)}</title>`);
  out = /<meta\s+name="description"[^>]*>/i.test(out)
    ? out.replace(/<meta\s+name="description"[^>]*>/i, desc)
    : out.replace("</head>", `${desc}</head>`);
  return out.replace("</head>", `<link rel="canonical" href="${canonical}" /></head>`);
}

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
    onPageRendered: (route, html) => injectSeo(route, html),
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
        "src/seo/meta.ts",
      ],
    },
  },
});
