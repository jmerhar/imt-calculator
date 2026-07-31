// Write dist/404.html as a copy of the built index.html so GitHub Pages serves the SPA shell for
// any un-prerendered path (old hash links, typos). The client router then renders the matching
// route (or the catch-all). Real routes are prerendered to their own HTML and served directly.

import { copyFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const dist = resolve(process.cwd(), "dist");
const index = resolve(dist, "index.html");
const notFound = resolve(dist, "404.html");

if (!existsSync(index)) {
  console.error("postbuild: dist/index.html not found — did the SSG build run?");
  process.exit(1);
}

copyFileSync(index, notFound);
console.log("postbuild: wrote dist/404.html (SPA fallback)");
