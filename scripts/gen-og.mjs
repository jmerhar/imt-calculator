// Generate the Open Graph share image (1200×630 PNG) from an SVG, using sharp. Run once and commit
// the result to public/og.png; the build/deploy never needs sharp. Regenerate with `make og-image`.

import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import sharp from "sharp";

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#14345E"/>
  <rect width="1200" height="12" fill="#2B5FA0"/>
  <g transform="translate(96 150)">
    <rect width="150" height="150" rx="28" fill="#2B5FA0"/>
    <path d="M20 78 L75 30 L130 78 L112 78 L112 128 L38 128 L38 78 Z" fill="#ffffff"/>
    <text x="75" y="120" font-family="Georgia, 'Times New Roman', serif" font-size="46" font-weight="700" fill="#2B5FA0" text-anchor="middle">€</text>
  </g>
  <text x="286" y="238" font-family="Helvetica, Arial, sans-serif" font-size="88" font-weight="700" fill="#ffffff">IMT Calculator</text>
  <text x="290" y="300" font-family="Helvetica, Arial, sans-serif" font-size="40" fill="#B9CCE6">Calculadora de IMT · Portugal · 2026</text>
  <text x="96" y="430" font-family="Helvetica, Arial, sans-serif" font-size="42" fill="#E8EEF6">Property-transfer tax (IMT) &amp; stamp duty,</text>
  <text x="96" y="486" font-family="Helvetica, Arial, sans-serif" font-size="42" fill="#E8EEF6">computed in your browser — 2026 rules.</text>
  <text x="96" y="574" font-family="Helvetica, Arial, sans-serif" font-size="30" font-weight="600" fill="#5B8CC4">calc-imt.online</text>
</svg>`;

const out = resolve(process.cwd(), "public/og.png");
await sharp(Buffer.from(svg)).png().toFile(out);
writeFileSync(resolve(process.cwd(), "public/og.svg"), svg); // keep the source alongside
console.log(`gen-og: wrote ${out} (1200×630)`);
