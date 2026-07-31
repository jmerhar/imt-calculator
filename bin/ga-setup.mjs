// Register the calculator's custom dimensions and metrics in a GA4 property, idempotently.
//
// GA4 collects custom event parameters but won't expose them in reports until they are registered
// as custom definitions. This script creates every definition the app sends (see DIMENSIONS and
// METRICS below), skipping any that already exist, so it is safe to re-run whenever new parameters
// are added. Explorations themselves have no public API and must still be built in the GA UI.
//
// Dependency-free (Node 18+ built-ins only): it mints an OAuth token from a service-account key via
// the JWT bearer flow and calls the Analytics Admin API directly.
//
// Usage (zero-config — defaults to ./ga-key.json and the calc-imt property):
//   node bin/ga-setup.mjs              # apply
//   node bin/ga-setup.mjs --dry-run    # preview, write nothing
// Overrides: --key <path> or GOOGLE_APPLICATION_CREDENTIALS; --property <id> or GA_PROPERTY_ID.
//
// The service account needs the Editor role on the property (Admin → Property access management)
// and the Analytics Admin API enabled in its Google Cloud project.

import { readFileSync } from "node:fs";
import { createSign } from "node:crypto";
import { fileURLToPath } from "node:url";

const ADMIN = "https://analyticsadmin.googleapis.com/v1beta";
// The calc-imt.online GA4 property, and the gitignored key at the repo root — so `make ga-setup`
// needs no arguments. A property id is not a secret; the key must never be committed.
const DEFAULT_PROPERTY_ID = "547888811";
const DEFAULT_KEY_PATH = fileURLToPath(new URL("../ga-key.json", import.meta.url));

// Categorical / boolean / low-cardinality parameters → GA dimensions (for grouping).
const DIMENSIONS = [
  ["intended_use", "Intended use", "Own permanent home vs secondary/rental"],
  ["location", "Location", "Mainland / Açores / Madeira"],
  ["year", "Year", "Tax-table year used for the calculation"],
  ["buyer_count", "Buyer count", "Number of buyers on the deed"],
  ["price_band", "Price band", "Coarse purchase-price bucket"],
  ["rate_band", "Rate band", "Coarse effective-tax-rate bucket"],
  ["vpt_ratio_band", "VPT ratio band", "Coarse VPT-to-price ratio bucket"],
  // "Has nonresident", not "Has non-resident": GA display names forbid hyphens (see NAME_RE).
  ["has_non_resident", "Has nonresident", "Any buyer is a non-resident"],
  ["has_entity", "Has entity", "Any buyer is a company"],
  ["has_tax_haven", "Has tax haven", "Any buyer is a tax-haven entity"],
  ["has_jovem", "Has Jovem", "IMT Jovem relief was applied"],
  ["has_mortgage", "Has mortgage", "Mortgage stamp duty was included"],
  ["has_vpt", "Has VPT", "A VPT was entered"],
  ["shares_valid", "Shares valid", "Buyer shares summed to 100%"],
  ["language", "Language switch", "Language switched to (en / pt), on language_switch"],
  ["ui_language", "UI language", "Active in-app language (en / pt) at each page view"],
  ["theme", "Theme switch", "Theme switched to (light / dark), on theme_toggle"],
  ["ui_theme", "UI theme", "Active theme (light / dark) at each page view"],
  ["target", "Outbound target", "Which external link was clicked"],
];

// Exact aggregate figures → GA metrics (for averages and distributions). All STANDARD: GA's CURRENCY
// unit forces a restrictedMetricType (revenue/cost), which would gate the figure behind a "view
// revenue" permission — unwanted here, since these are plain property values. STANDARD numbers
// average and sum the same; they just render without a € symbol. (The two ratios are percentages.)
const METRICS = [
  ["price", "Price", "STANDARD", "Purchase price entered (EUR)"],
  ["tax_base", "Tax base", "STANDARD", "max(price, VPT) — the IMT base (EUR)"],
  ["imt", "IMT", "STANDARD", "Total IMT (EUR)"],
  ["stamp_duty", "Stamp duty", "STANDARD", "Total stamp duty (EUR)"],
  ["grand_total", "Total tax", "STANDARD", "IMT + stamp duty (EUR)"],
  ["mortgage_amount", "Mortgage amount", "STANDARD", "Loan amount when a mortgage is included (EUR)"],
  ["vpt", "VPT", "STANDARD", "VPT entered (EUR)"],
  ["effective_rate", "Effective rate", "STANDARD", "Total tax as a percentage of price"],
  ["vpt_ratio", "VPT ratio", "STANDARD", "VPT as a percentage of price"],
];

// GA4 display-name rule: start with a letter, then only letters, digits, spaces or underscores
// (no hyphens or punctuation), max 82 chars. Used to catch a bad name before any API call.
const NAME_RE = /^[A-Za-z][A-Za-z0-9_ ]{0,81}$/;

/** Fail fast if any definition's display name would be rejected by GA (so it never fails mid-run). */
function assertValidNames() {
  const bad = [...DIMENSIONS, ...METRICS].map(([, name]) => name).filter((n) => !NAME_RE.test(n));
  if (bad.length) {
    fail(
      `invalid display name(s) — GA allows letters, digits, spaces and underscores, ` +
        `starting with a letter: ${bad.map((n) => `"${n}"`).join(", ")}`,
    );
  }
}

/** Parse `--flag value` / `--flag` args into a plain object. */
function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    if (!argv[i].startsWith("--")) continue;
    const key = argv[i].slice(2);
    const next = argv[i + 1];
    if (next && !next.startsWith("--")) {
      out[key] = next;
      i++;
    } else {
      out[key] = true;
    }
  }
  return out;
}

function fail(msg) {
  console.error(`✗ ${msg}`);
  process.exit(1);
}

const b64url = (input) => Buffer.from(input).toString("base64url");

/** Mint an OAuth access token from a service-account key using the JWT bearer flow. */
async function getAccessToken(key, scope) {
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claims = b64url(
    JSON.stringify({ iss: key.client_email, scope, aud: key.token_uri, iat: now, exp: now + 3600 }),
  );
  const signingInput = `${header}.${claims}`;
  const signer = createSign("RSA-SHA256");
  signer.update(signingInput);
  signer.end();
  const assertion = `${signingInput}.${signer.sign(key.private_key).toString("base64url")}`;

  const res = await fetch(key.token_uri, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.access_token) {
    fail(`could not mint a token: ${data.error ?? res.status} ${data.error_description ?? ""}`);
  }
  return data.access_token;
}

/** List every custom definition of a resource, following pagination. */
async function listAll(token, property, resource) {
  const items = [];
  let pageToken = "";
  do {
    const url = `${ADMIN}/properties/${property}/${resource}?pageSize=200${pageToken ? `&pageToken=${pageToken}` : ""}`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) fail(`listing ${resource} failed: ${data.error?.message ?? res.status}`);
    items.push(...(data[resource] ?? []));
    pageToken = data.nextPageToken ?? "";
  } while (pageToken);
  return items;
}

/** Create one custom definition. */
async function createDefinition(token, property, resource, body) {
  const res = await fetch(`${ADMIN}/properties/${property}/${resource}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) fail(`creating ${body.parameterName} failed: ${data.error?.message ?? res.status}`);
  return data;
}

/** Update an existing definition's display name (resourceName is the full `properties/…/…/id`). */
async function renameDefinition(token, resourceName, displayName) {
  const res = await fetch(`${ADMIN}/${resourceName}?updateMask=displayName`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ displayName }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) fail(`renaming ${resourceName} failed: ${data.error?.message ?? res.status}`);
}

/**
 * Bring a resource's definitions in line with the canonical list: create the missing ones and
 * rename any whose display name has drifted, leaving the rest untouched. `existing` maps parameter
 * name → the live definition object.
 */
async function reconcile(token, property, resource, label, defs, existing, dryRun) {
  const stats = { created: 0, renamed: 0, unchanged: 0 };
  for (const def of defs) {
    const cur = existing.get(def.parameterName);
    if (!cur) {
      if (!dryRun) await createDefinition(token, property, resource, def);
      console.log(`  + ${label} ${def.parameterName} (${dryRun ? "would create" : "created"})`);
      stats.created++;
    } else if (cur.displayName !== def.displayName) {
      if (!dryRun) await renameDefinition(token, cur.name, def.displayName);
      const how = dryRun ? "would rename" : "renamed";
      console.log(`  ~ ${label} ${def.parameterName} (${how}: "${cur.displayName}" → "${def.displayName}")`);
      stats.renamed++;
    } else {
      console.log(`  = ${label} ${def.parameterName} (unchanged)`);
      stats.unchanged++;
    }
  }
  return stats;
}

async function main() {
  assertValidNames();
  const args = parseArgs(process.argv.slice(2));
  const dryRun = Boolean(args["dry-run"]);
  const property = args.property ?? process.env.GA_PROPERTY_ID ?? DEFAULT_PROPERTY_ID;
  const keyPath = args.key ?? process.env.GOOGLE_APPLICATION_CREDENTIALS ?? DEFAULT_KEY_PATH;

  let key;
  try {
    key = JSON.parse(readFileSync(keyPath, "utf8"));
  } catch (e) {
    fail(`cannot read the service-account key at ${keyPath} (put it there or pass --key): ${e.message}`);
  }

  // Read-only scope suffices for a dry run; applying needs edit.
  const scope = dryRun
    ? "https://www.googleapis.com/auth/analytics.readonly"
    : "https://www.googleapis.com/auth/analytics.edit";
  const token = await getAccessToken(key, scope);

  const dims = DIMENSIONS.map(([parameterName, displayName, description]) => ({
    parameterName,
    displayName,
    description,
    scope: "EVENT",
  }));
  const metrics = METRICS.map(([parameterName, displayName, measurementUnit, description]) => ({
    parameterName,
    displayName,
    description,
    measurementUnit,
    scope: "EVENT",
  }));

  const existingDims = new Map((await listAll(token, property, "customDimensions")).map((d) => [d.parameterName, d]));
  const existingMetrics = new Map((await listAll(token, property, "customMetrics")).map((m) => [m.parameterName, m]));

  console.log(`Property ${property}${dryRun ? "  (dry run — nothing will be written)" : ""}`);
  const d = await reconcile(token, property, "customDimensions", "dimension", dims, existingDims, dryRun);
  const m = await reconcile(token, property, "customMetrics", "metric", metrics, existingMetrics, dryRun);

  const created = d.created + m.created;
  const renamed = d.renamed + m.renamed;
  const unchanged = d.unchanged + m.unchanged;
  console.log(
    `\n✓ ${created} ${dryRun ? "to create" : "created"}, ` +
      `${renamed} ${dryRun ? "to rename" : "renamed"}, ${unchanged} unchanged.`,
  );
}

main().catch((e) => fail(e.message));
