// Post-build step: copy the prerendered /404 page to dist/404.html so GitHub Pages serves a real
// "not found" page (with a 404 status) for any unknown path; the client `*` route renders the same
// page. The sitemap is generated during the SSG build itself (vite.config.ts ssgOptions.onFinished),
// which can read the guide registry for the localized URLs.

import { copyFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const dist = resolve(process.cwd(), "dist");
const notFound = resolve(dist, "404", "index.html");

if (!existsSync(notFound)) {
  console.error("postbuild: dist/404/index.html not found — did the SSG build prerender /404?");
  process.exit(1);
}

copyFileSync(notFound, resolve(dist, "404.html"));
console.log("postbuild: wrote dist/404.html (prerendered not-found page)");
