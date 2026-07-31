/// <reference types="vite-react-ssg" />
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { writeFileSync } from "node:fs";
import { SITE_URL } from "./src/config";
import { SEO_PAGES } from "./src/seo/meta";
import { jsonLdFor } from "./src/seo/jsonld";
import { guideSeoForKey } from "./src/seo/guides";
import { buildSitemap } from "./src/seo/sitemap";
import { pageSlug, canonicalKey } from "./src/i18n/pages";
import { GUIDE_META, GUIDES_SEGMENT } from "./src/content/guides/registry";

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// Canonical URL for a page key in a language, with the localized slug and a trailing slash.
const urlFor = (lang: "en" | "pt", key: string) => {
  const prefix = lang === "pt" ? "/pt" : "";
  const slug = pageSlug(lang, key);
  return slug === "" ? `${SITE_URL}${prefix}/` : `${SITE_URL}${prefix}/${slug}/`;
};

// Inject per-route <title>, meta description, canonical, hreflang alternates, Open Graph/Twitter,
// JSON-LD and <html lang> into each prerendered page so crawlers see distinct, correct, per-language
// metadata (not the generic index.html template). Guides resolve through the registry (localized
// segment + slug); all other routes derive from SEO_PAGES by prefix. Build-time only.
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

  let lang: "en" | "pt";
  let canonical: string;
  let altEn: string;
  let altPt: string;
  let title: string;
  let description: string;
  let jsonLd: string;

  const guide = guideSeoForKey(key);
  if (guide) {
    ({ lang, canonical, altEn, altPt, title, description, jsonLd } = guide);
  } else {
    lang = /^\/pt(\/|$)/.test(key) ? "pt" : "en";
    // Map the localized route (e.g. "/pt/glossario") back to its canonical key ("/glossary").
    const rest = key.replace(/^\/pt(?=\/|$)/, "").replace(/^\/+/, "");
    const bare = canonicalKey(lang, rest.split("/")[0] ?? "");
    const meta = (SEO_PAGES[bare] ?? SEO_PAGES["/"])[lang];
    canonical = urlFor(lang, bare);
    altEn = urlFor("en", bare);
    altPt = urlFor("pt", bare);
    title = meta.title;
    description = meta.description;
    jsonLd = jsonLdFor(lang, bare, canonical);
  }

  const alternates = [
    `<link rel="alternate" hreflang="en" href="${altEn}" />`,
    `<link rel="alternate" hreflang="pt" href="${altPt}" />`,
    `<link rel="alternate" hreflang="x-default" href="${altEn}" />`,
  ].join("");
  const desc = `<meta name="description" content="${escapeHtml(description)}" />`;

  const ogImage = `${SITE_URL}/og.png`;
  const social = [
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="IMT Calculator" />`,
    `<meta property="og:title" content="${escapeHtml(title)}" />`,
    `<meta property="og:description" content="${escapeHtml(description)}" />`,
    `<meta property="og:url" content="${canonical}" />`,
    `<meta property="og:image" content="${ogImage}" />`,
    `<meta property="og:locale" content="${lang === "pt" ? "pt_PT" : "en_US"}" />`,
    `<meta property="og:locale:alternate" content="${lang === "pt" ? "en_US" : "pt_PT"}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${escapeHtml(title)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(description)}" />`,
    `<meta name="twitter:image" content="${ogImage}" />`,
  ].join("");

  let out = html.replace(/<html([^>]*)\slang="[^"]*"/i, `<html$1 lang="${lang}"`);
  out = out.replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(title)}</title>`);
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
    // Guide article routes are dynamic (:slug); enumerate the concrete localized slugs from the
    // registry so each is prerendered. Static routes (incl. the guides index and /404) pass through.
    includedRoutes(paths) {
      const staticPaths = paths.filter((p) => !p.includes(":") && !p.includes("*"));
      const guides = GUIDE_META.flatMap((m) => [
        `/${GUIDES_SEGMENT.en}/${m.slug.en}`,
        `/pt/${GUIDES_SEGMENT.pt}/${m.slug.pt}`,
      ]);
      return [...staticPaths, ...guides];
    },
    // Generate the sitemap from the registry once all pages are written (localized guide URLs +
    // hreflang), so it always matches what was prerendered.
    onFinished: (dir: string) => {
      const today = new Date().toISOString().slice(0, 10);
      writeFileSync(path.join(dir, "sitemap.xml"), buildSitemap(today));
      console.log("ssg: wrote sitemap.xml");
    },
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
        // Build-only SEO helpers (used by this config, not the app or tests).
        "src/seo/guides.ts",
        "src/seo/sitemap.ts",
      ],
    },
  },
});
