import type { RouteRecord } from "vite-react-ssg";
import type { Lang } from "@/i18n";
import { pageSlug } from "@/i18n/pages";
import { GUIDES_SEGMENT } from "@/content/guides/registry";
import { RootLayout } from "@/RootLayout";
import { CalculatorPage } from "@/pages/CalculatorPage";
import { GlossaryPage } from "@/pages/GlossaryPage";
import { HowItWorksPage } from "@/pages/HowItWorksPage";
import { GuidesIndexPage } from "@/pages/GuidesIndexPage";
import { GuidePage } from "@/pages/GuidePage";
import { NotFoundPage } from "@/pages/NotFoundPage";

// The pages within a language subtree (index + the two content pages). The glossary/how-it-works
// path segments are localized per language (EN "glossary" / PT "glossario", etc.).
const pages = (lang: Lang): RouteRecord[] => [
  { index: true, element: <CalculatorPage />, entry: "src/pages/CalculatorPage.tsx" },
  { path: pageSlug(lang, "/glossary"), element: <GlossaryPage />, entry: "src/pages/GlossaryPage.tsx" },
  { path: pageSlug(lang, "/how-it-works"), element: <HowItWorksPage />, entry: "src/pages/HowItWorksPage.tsx" },
];

// Guides live under a localized section segment (/guides in EN, /pt/guias in PT) with localized
// slugs. The article route is dynamic (:slug); the concrete slugs are enumerated for prerendering in
// vite.config.ts (ssgOptions.includedRoutes) from the guide registry.
const guideRoutes = (lang: Lang): RouteRecord[] => {
  const seg = GUIDES_SEGMENT[lang];
  return [
    { path: seg, element: <GuidesIndexPage />, entry: "src/pages/GuidesIndexPage.tsx" },
    { path: `${seg}/:slug`, element: <GuidePage />, entry: "src/pages/GuidePage.tsx" },
  ];
};

// EN is served at the root; PT under /pt. Each subtree fixes its language via RootLayout, so the
// prerendered HTML per URL is deterministic and hydrates without a flash. `/404` is prerendered and
// copied to dist/404.html (see scripts/postbuild.mjs) so GitHub Pages serves it — with a 404 status
// — for any unknown path; the `*` catch-all (EN only) renders the same NotFound page on the client,
// so unknown /pt/* also lands on the English 404 shell without a hydration mismatch.
export const routes: RouteRecord[] = [
  {
    path: "/",
    element: <RootLayout lang="en" />,
    entry: "src/RootLayout.tsx",
    children: [
      ...pages("en"),
      ...guideRoutes("en"),
      { path: "404", element: <NotFoundPage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
  {
    path: "/pt",
    element: <RootLayout lang="pt" />,
    entry: "src/RootLayout.tsx",
    children: [...pages("pt"), ...guideRoutes("pt")],
  },
];
