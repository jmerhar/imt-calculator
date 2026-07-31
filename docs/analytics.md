# Analytics (Google Analytics 4)

How the IMT calculator is instrumented, how to register the reporting definitions, and how to build
the reports. Everything here is aggregate and non-identifying — the figures collected are property
values, never tied to a person (see [Privacy](#privacy)).

- **Measurement ID:** `G-7SNXFN63ZN` (loaded in `index.html`; auto page-view disabled — the app
  sends its own).
- **Property ID:** `547888811`.

## Contents

1. [What is tracked](#what-is-tracked)
2. [Custom definitions](#custom-definitions)
3. [Registering the definitions](#registering-the-definitions)
   - [Option A — the script (recommended)](#option-a--the-script-recommended)
   - [Option B — manually in the UI](#option-b--manually-in-the-ui)
4. [Verifying data flows](#verifying-data-flows)
5. [Reports (Explorations)](#reports-explorations)
6. [Caveats](#caveats)
7. [Privacy](#privacy)

---

## What is tracked

Page views are sent per route by the app (GA's automatic page_view is disabled). Because the app
uses `HashRouter`, the route lives in the URL fragment, which GA ignores when deriving the page
path — so the app sends a **path-based `page_location`** (`origin` + route path) to make each route
a distinct page. That also keeps the state token (`?c=…`) out of analytics.

| Event | Fires when | Parameters |
|---|---|---|
| `page_view` | Each route change (initial load included) | `page_path`, `page_location`, `page_title`, `ui_language`, `ui_theme` |
| `calculate` | ~1.5 s after the user pauses editing (one per scenario, only once they've interacted and price > 0) | see below |
| `arrived_via_share` | Page loads from a valid shared link (once per load; reloads excluded) | — |
| `bad_share_link` | Page loads with a share token that fails to decode | — |
| `share_link` | "Copy link" clicked | — |
| `copy_result` | "Copy result" clicked | — |
| `print` | "Print" clicked | — |
| `reset` | "Reset" clicked | — |
| `language_switch` | Language changed | `language` |
| `theme_toggle` | Theme toggled | `theme` |
| `outbound` | External link clicked (footer GitHub) | `target` |

`calculate` parameters:

- **Dimensions (categorical):** `intended_use`, `location`, `year`, `buyer_count`, `price_band`,
  `rate_band`, `vpt_ratio_band`, `has_non_resident`, `has_entity`, `has_tax_haven`, `has_jovem`,
  `has_mortgage`, `has_vpt`, `shares_valid`.
- **Metrics (numeric):** `price`, `tax_base`, `imt`, `stamp_duty`, `grand_total`, `effective_rate`
  (a percentage, 2 dp), and — only when a VPT was entered — `vpt`, `vpt_ratio` (a percentage, 1 dp);
  `mortgage_amount` only when a mortgage is included. The conditional ones are omitted (not sent as
  0) so they never skew averages.

Source of truth for the full list is `bin/ga-setup.mjs` (`DIMENSIONS` / `METRICS`).

## Custom definitions

GA4 collects event parameters but will not expose them in reports until they are **registered as
custom definitions**. Categorical parameters become **dimensions**; numeric ones become **metrics**.

**19 dimensions** (all Event-scoped):

Columns map to the "Create custom dimension" form: **Dimension name** = Display name, **Event
parameter** = Parameter, **Description** as given (Scope = Event for all).

| Parameter | Display name | Description |
|---|---|---|
| `intended_use` | Intended use | Own permanent home vs secondary/rental |
| `location` | Location | Mainland / Açores / Madeira |
| `year` | Year | Tax-table year used for the calculation |
| `buyer_count` | Buyer count | Number of buyers on the deed |
| `price_band` | Price band | Coarse purchase-price bucket |
| `rate_band` | Rate band | Coarse effective-tax-rate bucket |
| `vpt_ratio_band` | VPT ratio band | Coarse VPT-to-price ratio bucket |
| `has_non_resident` | Has nonresident | Any buyer is a non-resident |
| `has_entity` | Has entity | Any buyer is a company |
| `has_tax_haven` | Has tax haven | Any buyer is a tax-haven entity |
| `has_jovem` | Has Jovem | IMT Jovem relief was applied |
| `has_mortgage` | Has mortgage | Mortgage stamp duty was included |
| `has_vpt` | Has VPT | A VPT was entered |
| `shares_valid` | Shares valid | Buyer shares summed to 100% |
| `language` | Language switch | Language switched to (en / pt), on language_switch |
| `ui_language` | UI language | Active in-app language (en / pt) at each page view |
| `theme` | Theme switch | Theme switched to (light / dark), on theme_toggle |
| `ui_theme` | UI theme | Active theme (light / dark) at each page view |
| `target` | Outbound target | Which external link was clicked |

**9 metrics** (all Event-scoped, unit **Standard**):

| Parameter | Display name | Description |
|---|---|---|
| `price` | Price | Purchase price entered (EUR) |
| `tax_base` | Tax base | max(price, VPT) — the IMT base (EUR) |
| `imt` | IMT | Total IMT (EUR) |
| `stamp_duty` | Stamp duty | Total stamp duty (EUR) |
| `grand_total` | Total tax | IMT + stamp duty (EUR) |
| `mortgage_amount` | Mortgage amount | Loan amount when a mortgage is included (EUR) |
| `vpt` | VPT | VPT entered (EUR) |
| `effective_rate` | Effective rate | Total tax as a percentage of price |
| `vpt_ratio` | VPT ratio | VPT as a percentage of price |

> **Why Standard, not Currency, for euro amounts:** GA4's `CURRENCY` unit requires a
> `restrictedMetricType`, which gates the metric behind a "view revenue" permission. These are plain
> property values, so `STANDARD` is used — they average and sum identically, just without a €
> symbol in the UI.
>
> **Naming rule:** GA display names allow only letters, digits, spaces and underscores, and must
> start with a letter — **no hyphens or `%`**. (Hence "Has nonresident", not "Has non-resident", and
> "Effective rate", not "Effective rate %".) The script enforces this before calling the API.

## Registering the definitions

### Option A — the script (recommended)

`bin/ga-setup.mjs` creates every definition above, idempotently (existing ones are skipped), from
its single canonical list. It's dependency-free and authenticates with a service-account key.

**One-time: create a service account**

1. **Google Cloud Console** → pick/create a project.
2. **APIs & Services → Library** → enable **"Google Analytics Admin API"**.
3. **IAM & Admin → Service Accounts → Create service account** (e.g. `imt-ga-setup`). Copy its
   email (`…@<project>.iam.gserviceaccount.com`).
4. Open it → **Keys → Add key → Create new key → JSON**. Save the file as **`ga-key.json` in the
   repo root** (it is gitignored — never commit it).
5. In **Google Analytics → Admin → Property access management → `+` → Add users**, add the service
   account email with the **Editor** role (Editor is required to create definitions; untick "Notify
   by email"). Property ID is under **Admin → Property details**.

**Run it**

```sh
make ga-setup                # apply (defaults to ./ga-key.json and the calc-imt property)
make ga-setup ARGS=--dry-run # preview only, write nothing
```

Overrides if needed: `--key <path>` / `GOOGLE_APPLICATION_CREDENTIALS`, and `--property <id>` /
`GA_PROPERTY_ID`. Re-run whenever new parameters are added to the app — existing definitions are
skipped and only the new ones are created.

### Option B — manually in the UI

**Admin → Data display → Custom definitions.**

- **Custom dimensions tab → Create custom dimension** — for each row in the dimensions table above:
  Dimension name = the display name, **Scope = Event**, **Event parameter =** the exact parameter
  name.
- **Custom metrics tab → Create custom metric** — for each metric: Metric name = display name,
  **Scope = Event**, **Event parameter =** the parameter, **Unit of measurement = Standard**.

Mind the naming rule (no hyphens/`%`). This is tedious for 26 definitions — prefer Option A.

## Verifying data flows

- **Realtime:** Reports → Realtime → "Event count by event name" shows events as you use the live
  site. Interact with the calculator (change inputs, wait ~2 s for the debounce) and watch
  `calculate` appear.
- **DebugView (parameter-level):** Admin → DebugView. Enable debug on your browser (the *Google
  Analytics Debugger* extension, or append `?debug_mode=1`), then click a `calculate` event to
  confirm `price_band`, `grand_total`, etc. are present. This is the fastest way to prove the wiring
  and your registrations, with no waiting.

Two things to remember before trusting a report:

- **Custom dimensions/metrics are not retroactive** — they only populate for events received *after*
  you register them. Old events show `(not set)`.
- **Standard reports and Explorations lag ~24–48 h**, even though Realtime/DebugView are instant. A
  brand-new report can look empty or sparse until the next day.

## Reports (Explorations)

Explorations have **no public API** — build them in the UI (Explore → Blank/Free-form or the Funnel
template). General mechanics for Free-form: in the **Variables** column click **`+`** next to
*Dimensions*/*Metrics* to import what you need, then drag them onto **Rows**/**Values**/**Columns**;
add **Filters** at the bottom of the Settings column. Set the **date range to include today**.

### 1. Event overview

- **Technique:** Free-form.
- **Rows:** `Event name`. **Values:** `Event count`, `Total users`.
- Add a second tab as a **Line chart** for the trend over time.
- *Reads as:* how often each event fires — your master overview.

### 2. Calculate breakdown — average tax by size and region

- **Technique:** Free-form.
- **Filter:** `Event name` — `exactly` — `calculate` (so the dimensions aren't `(not set)` for other
  events).
- **Rows:** `Price band`, then `Location` nested beneath it.
- **Values:** `Event count`, `Total tax` (set the aggregation to **Average**), `Effective rate`
  (**Average**). Optionally add `IMT` and `Stamp duty` (Average) too.
- Optional **Columns:** `Has mortgage` to split each row by with/without mortgage.
- *Reads as:* for each price band and region, how many calculations and the average total tax and
  effective rate. To switch a value from Sum to Average, click the metric chip under Values → change
  the aggregation.

### 3. VPT ratio distribution

- **Technique:** Free-form.
- **Filter:** `Event name` — `exactly` — `calculate`, and (optional) `Has VPT` — `exactly` — `true`
  to exclude calculations without a VPT.
- **Rows:** `VPT ratio band`. **Values:** `Event count`, `VPT ratio` (**Average**).
- *Reads as:* the shape of VPT-vs-price across usage (buckets), plus the mean. `>=100%` means the
  VPT was the tax base. The numeric `VPT ratio` metric gives the true average independent of the
  bands.

### 4. Share funnel — visit → compute → share

- **Technique:** **Funnel exploration** (not Free-form). Steps aren't dimensions — edit them in the
  **Steps** editor (pencil icon).
  - Step 1 "Visited": condition **event** `page_view`.
  - Step 2 "Calculated": event `calculate`.
  - Step 3 "Shared": event `share_link`; click **Or** and add `copy_result`.
- Keep the funnel **closed** (default) for the strict visit→compute→share order.
- *Reads as:* the drop-off from visiting to computing to sharing.

### 5. Share-link health

- **Technique:** Free-form.
- **Rows:** `Event name`. **Values:** `Event count`.
- **Filter:** `Event name` — `matches regex` — `^(arrived_via_share|bad_share_link)$` (the Filters
  box ANDs multiple filters, so use one regex filter to OR the two names).
- *Reads as:* how many arrivals came via shared links, and how many links were broken. A meaningful
  `bad_share_link` share suggests links are being truncated somewhere (e.g. email clients wrapping
  the URL).

### 6. Language and theme

Language and theme each have the **same two-signal split** — the *active* value (on every
`page_view`) versus the *switched-to* value (only on a deliberate switch). Don't confuse them, and
note that GA's **built-in `Language`** is a third, unrelated signal: the visitor's **browser
language** (`navigator.language`) — it can show e.g. "German" even though the app only offers EN/PT,
so it reflects the audience's locale, not in-app choice.

| Question | Dimension | Filter event |
|---|---|---|
| Which language do people use? | **UI language** (`ui_language`) | `page_view` |
| How do people switch language? | **Language switch** (`language`) | `language_switch` |
| Which theme do people use? | **UI theme** (`ui_theme`) | `page_view` |
| How do people switch theme? | **Theme switch** (`theme`) | `theme_toggle` |

For each: Free-form, apply the **Filter** (`Event name = …`), put the **dimension** on **Rows**, and
use `Event count` (and `Total users`) as **Values**. The "active" rows (`page_view`) give the real
usage split — including users who never switch, who fire no switch event. `>=100%`-style edge cases
don't apply here; the values are just `en`/`pt` and `light`/`dark`.

## Caveats

- **Latency & non-retroactivity** — see [Verifying data flows](#verifying-data-flows).
- **`(not set)`** — a custom dimension reads `(not set)` for events that don't carry it. Filter to
  the owning event (`calculate` for most) to avoid noisy `(not set)` rows.
- **Register parameters, not just events** — event *names* work in reports out of the box; only
  *parameters* need custom definitions.
- **Cardinality** — the bands and flags are intentionally low-cardinality, so they won't be bucketed
  into GA's `(other)` row.
- **Dev traffic** — `index.html` only configures GA off `localhost`, so `npm run dev` does not send
  events to the live property.

## Privacy

The footer discloses this in-app. Analytics is anonymous and aggregate: it may include the figures
entered (e.g. prices), but those are property values only and are never linked to a user's identity.
The calculations themselves run entirely in the browser; the URL state token is not sent to GA. No
special-category or personal data is collected.
