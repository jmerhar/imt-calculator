// Guide content aggregation. Re-exports the light registry (metadata) and maps each guide id to its
// bilingual body. Import from here when you need the article prose (GuidePage, JSON-LD); import from
// ./registry directly when you only need metadata (path helpers, nav, analytics) so the article
// bodies stay out of the main bundle.

import type { Lang } from "@/i18n/lang";
import type { GuideBody } from "./registry";
import { imtNonResidents } from "./imt-non-residents";
import { imtJovem } from "./imt-jovem";
import { imtImiStampDuty } from "./imt-imi-stamp-duty";
import { imtRegions } from "./imt-regions";
import { imtTables } from "./imt-tables";

export * from "./registry";

/** Each guide's bilingual body, keyed by the guide id in ./registry. */
export const GUIDE_BODIES: Record<string, Record<Lang, GuideBody>> = {
  "imt-non-residents": imtNonResidents,
  "imt-jovem": imtJovem,
  "imt-imi-stamp-duty": imtImiStampDuty,
  "imt-regions": imtRegions,
  "imt-tables": imtTables,
};
