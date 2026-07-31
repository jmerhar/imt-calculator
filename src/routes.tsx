import type { RouteRecord } from "vite-react-ssg";
import { RootLayout } from "@/RootLayout";
import { CalculatorPage } from "@/pages/CalculatorPage";
import { GlossaryPage } from "@/pages/GlossaryPage";
import { HowItWorksPage } from "@/pages/HowItWorksPage";
import { NotFoundPage } from "@/pages/NotFoundPage";

// The pages within a language subtree (index + the two content pages), reused for EN and PT.
const pages = (): RouteRecord[] => [
  { index: true, element: <CalculatorPage />, entry: "src/pages/CalculatorPage.tsx" },
  { path: "glossary", element: <GlossaryPage />, entry: "src/pages/GlossaryPage.tsx" },
  { path: "how-it-works", element: <HowItWorksPage />, entry: "src/pages/HowItWorksPage.tsx" },
];

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
      ...pages(),
      { path: "404", element: <NotFoundPage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
  {
    path: "/pt",
    element: <RootLayout lang="pt" />,
    entry: "src/RootLayout.tsx",
    children: pages(),
  },
];
