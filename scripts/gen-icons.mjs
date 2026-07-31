// Generate the PNG app icons (apple-touch-icon + PWA manifest icons) from public/favicon.svg using
// sharp. Run once and commit the results; the build/deploy never needs sharp. Regenerate with
// `make icons`. Transparent corners are flattened to the brand blue so the icons are solid squares
// (iOS/Android round the corners themselves) rather than showing transparent notches.

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import sharp from "sharp";

const BRAND = "#2B5FA0"; // matches the favicon's rounded-rect background
const src = resolve(process.cwd(), "public/favicon.svg");
const svg = readFileSync(src);

const icons = {
  "apple-touch-icon.png": 180, // iOS home screen
  "icon-192.png": 192, // PWA manifest
  "icon-512.png": 512, // PWA manifest + Organization/WebSite logo
};

for (const [name, size] of Object.entries(icons)) {
  const out = resolve(process.cwd(), "public", name);
  // density rasterizes the small (32px) SVG viewBox crisply before resizing.
  await sharp(svg, { density: 512 }).resize(size, size).flatten({ background: BRAND }).png().toFile(out);
  console.log(`gen-icons: wrote ${out} (${size}×${size})`);
}
