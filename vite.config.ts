/// <reference types="vite-react-ssg" />
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { SITE_URL } from "./src/config";
import { SEO_PAGES } from "./src/seo/meta";
import { jsonLdFor } from "./src/seo/jsonld";

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// URL for a bare (language-neutral) path in a given language: EN at root, PT under /pt, trailing slash.
const urlFor = (lang: "en" | "pt", bare: string) => {
  const suffix = bare === "/" ? "" : bare;
  return lang === "en" ? `${SITE_URL}${suffix}/` : `${SITE_URL}/pt${suffix === "" ? "" : suffix}/`;
};

// Inject per-route <title>, meta description, canonical, hreflang alternates and <html lang> into
// each prerendered page so crawlers see distinct, correct, per-language metadata (not the generic
// index.html template). Build-time only.
function injectSeo(route: string, html: string): string {
  // vite-react-ssg passes routes without a leading slash ("glossary", "pt/glossary"); normalize.
  const clean = route.replace(/^\/+|\/+$/g, "");
  const key = clean ? `/${clean}` : "/";

  // The 404 page must not be indexed or canonicalized; just set a title + robots noindex.
  if (key === "/404") {
    return html
      .replace(/<title>[\s\S]*?<\/title>/, `<title>Page not found · IMT Calculator</title>`)
      .replace("</head>", `<meta name="robots" content="noindex" /></head>`);
  }

  const meta = SEO_PAGES[key] ?? SEO_PAGES["/"];
  const lang: "en" | "pt" = /^\/pt(\/|$)/.test(key) ? "pt" : "en";
  const bare = key.replace(/^\/pt(?=\/|$)/, "") || "/";

  const canonical = urlFor(lang, bare);
  const alternates = [
    `<link rel="alternate" hreflang="en" href="${urlFor("en", bare)}" />`,
    `<link rel="alternate" hreflang="pt" href="${urlFor("pt", bare)}" />`,
    `<link rel="alternate" hreflang="x-default" href="${urlFor("en", bare)}" />`,
  ].join("");
  const desc = `<meta name="description" content="${escapeHtml(meta.description)}" />`;

  const ogImage = `${SITE_URL}/og.png`;
  const social = [
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="IMT Calculator" />`,
    `<meta property="og:title" content="${escapeHtml(meta.title)}" />`,
    `<meta property="og:description" content="${escapeHtml(meta.description)}" />`,
    `<meta property="og:url" content="${canonical}" />`,
    `<meta property="og:image" content="${ogImage}" />`,
    `<meta property="og:locale" content="${lang === "pt" ? "pt_PT" : "en_US"}" />`,
    `<meta property="og:locale:alternate" content="${lang === "pt" ? "en_US" : "pt_PT"}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${escapeHtml(meta.title)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(meta.description)}" />`,
    `<meta name="twitter:image" content="${ogImage}" />`,
  ].join("");
  const jsonLd = jsonLdFor(lang, bare, canonical);

  let out = html.replace(/<html([^>]*)\slang="[^"]*"/i, `<html$1 lang="${lang}"`);
  out = out.replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(meta.title)}</title>`);
  out = /<meta\s+name="description"[^>]*>/i.test(out)
    ? out.replace(/<meta\s+name="description"[^>]*>/i, desc)
    : out.replace("</head>", `${desc}</head>`);
  const head = `<link rel="canonical" href="${canonical}" />${alternates}${social}${jsonLd}`;
  return out.replace("</head>", `${head}</head>`);
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
        "src/seo/jsonld.ts",
      ],
    },
  },
});
