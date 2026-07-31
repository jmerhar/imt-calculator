// Canonical site origin — used for share links, canonical tags, Open Graph, and the sitemap.
// It is a fixed value (not window.location) so server-prerendered and client-hydrated output match
// and shared links always point at the real site rather than whatever host served the page.
export const SITE_URL = "https://calc-imt.online";
