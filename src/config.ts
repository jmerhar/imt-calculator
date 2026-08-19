// Canonical site origin — used for share links, canonical tags, Open Graph, and the sitemap.
// It is a fixed value (not window.location) so server-prerendered and client-hydrated output match
// and shared links always point at the real site rather than whatever host served the page.
export const SITE_URL = "https://calc-imt.online";

/**
 * The site's name per language — the brand shown in the header, used as the suffix of every sub-page
 * title, as `og:site_name`, and as the JSON-LD `WebSite`/`Organization` name and breadcrumb root.
 * Declared once here because the build (vite.config.ts) and the SEO modules all need it, and three
 * copies of a brand name drift apart.
 */
export const SITE_NAME: Record<"en" | "pt", string> = {
  en: "IMT Calculator",
  pt: "Calculadora de IMT",
};
