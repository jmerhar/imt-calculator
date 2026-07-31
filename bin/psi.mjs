// Run a PageSpeed Insights (Lighthouse) report from the terminal and print a compact summary —
// scores, the core metrics, and the opportunities/diagnostics with their estimated savings — so
// performance can be checked without pasting screenshots.
//
// Reuses the service-account key (./ga-key.json) that ga-setup uses: it mints an OAuth token with
// the `openid` scope (PSI accepts it and attributes quota to the project, which must have the
// PageSpeed Insights API enabled). Dependency-free (Node 18+ built-ins).
//
// Usage:
//   node bin/psi.mjs [url] [--strategy mobile|desktop] [--key <path>]
//   make psi                       # mobile, https://calc-imt.online/
//   make psi URL=https://calc-imt.online/glossary/ STRATEGY=desktop

import { readFileSync } from "node:fs";
import { createSign } from "node:crypto";
import { fileURLToPath } from "node:url";

const DEFAULT_URL = "https://calc-imt.online/";
const DEFAULT_KEY = fileURLToPath(new URL("../ga-key.json", import.meta.url));
const b64url = (input) => Buffer.from(input).toString("base64url");

function fail(msg) {
  console.error(`✗ ${msg}`);
  process.exit(1);
}

async function accessToken(keyPath) {
  let key;
  try {
    key = JSON.parse(readFileSync(keyPath, "utf8"));
  } catch (e) {
    fail(`cannot read the service-account key at ${keyPath}: ${e.message}`);
  }
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claims = b64url(
    JSON.stringify({ iss: key.client_email, scope: "openid", aud: key.token_uri, iat: now, exp: now + 3600 }),
  );
  const signer = createSign("RSA-SHA256");
  signer.update(`${header}.${claims}`);
  signer.end();
  const assertion = `${header}.${claims}.${signer.sign(key.private_key).toString("base64url")}`;
  const res = await fetch(key.token_uri, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion }),
  });
  const data = await res.json().catch(() => ({}));
  if (!data.access_token) fail(`token mint failed: ${data.error_description ?? data.error ?? res.status}`);
  return data.access_token;
}

function parseArgs(argv) {
  const out = { url: DEFAULT_URL, strategy: "mobile", key: DEFAULT_KEY };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--strategy") out.strategy = argv[++i];
    else if (argv[i] === "--key") out.key = argv[++i];
    else if (!argv[i].startsWith("--")) out.url = argv[i];
  }
  return out;
}

const METRICS = [
  "first-contentful-paint",
  "largest-contentful-paint",
  "total-blocking-time",
  "cumulative-layout-shift",
  "speed-index",
  "interactive",
];

async function main() {
  const { url, strategy, key } = parseArgs(process.argv.slice(2));
  const token = await accessToken(key);
  const api = new URL("https://www.googleapis.com/pagespeedonline/v5/runPagespeed");
  api.searchParams.set("url", url);
  api.searchParams.set("strategy", strategy);
  for (const c of ["performance", "accessibility", "best-practices", "seo"]) api.searchParams.append("category", c);

  const res = await fetch(api, { headers: { Authorization: `Bearer ${token}` } });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.error) fail(`PSI request failed: ${data.error?.message ?? res.status}`);

  const lr = data.lighthouseResult;
  console.log(`\n${strategy.toUpperCase()}  ${url}`);
  const cats = lr.categories;
  console.log(
    "  scores  " +
      ["performance", "accessibility", "best-practices", "seo"]
        .map((c) => `${c[0].toUpperCase()}${c.slice(1, 4)} ${cats[c] ? Math.round(cats[c].score * 100) : "–"}`)
        .join("   "),
  );
  console.log("  metrics");
  for (const m of METRICS) {
    const a = lr.audits[m];
    if (a) console.log(`    ${a.title.padEnd(26)} ${a.displayValue ?? "-"}`);
  }

  const opps = Object.values(lr.audits)
    .filter((a) => a.details && (a.details.overallSavingsMs > 0 || a.details.overallSavingsBytes > 0))
    .map((a) => ({
      title: a.title,
      ms: a.details.overallSavingsMs ?? 0,
      kib: a.details.overallSavingsBytes ? Math.round(a.details.overallSavingsBytes / 1024) : 0,
    }))
    .sort((x, y) => y.ms - x.ms || y.kib - x.kib);
  if (opps.length) {
    console.log("  opportunities / diagnostics (est. savings)");
    for (const o of opps) {
      const s = [o.ms ? `${Math.round(o.ms)} ms` : "", o.kib ? `${o.kib} KiB` : ""].filter(Boolean).join(", ");
      console.log(`    ${o.title.padEnd(40)} ${s}`);
    }
  }
  console.log();
}

main().catch((e) => fail(e.message));
