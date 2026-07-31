import type { RouteRecord } from "vite-react-ssg";
import { RootLayout } from "@/RootLayout";
import { CalculatorPage } from "@/pages/CalculatorPage";
import { GlossaryPage } from "@/pages/GlossaryPage";
import { HowItWorksPage } from "@/pages/HowItWorksPage";

// The pages within a language subtree (index + the two content pages), reused for EN and PT.
const pages = (): RouteRecord[] => [
  { index: true, element: <CalculatorPage />, entry: "src/pages/CalculatorPage.tsx" },
  { path: "glossary", element: <GlossaryPage />, entry: "src/pages/GlossaryPage.tsx" },
  { path: "how-it-works", element: <HowItWorksPage />, entry: "src/pages/HowItWorksPage.tsx" },
];

// EN is served at the root; PT under /pt. Each subtree fixes its language via RootLayout, so the
// prerendered HTML per URL is deterministic and hydrates without a flash. The `*` catch-all lives
// only on the EN subtree: unknown paths (including unknown /pt/*) fall through to it and render the
// English shell, which matches the English 404.html served by GitHub Pages (no hydration mismatch).
export const routes: RouteRecord[] = [
  {
    path: "/",
    element: <RootLayout lang="en" />,
    entry: "src/RootLayout.tsx",
    children: [...pages(), { path: "*", element: <CalculatorPage /> }],
  },
  {
    path: "/pt",
    element: <RootLayout lang="pt" />,
    entry: "src/RootLayout.tsx",
    children: pages(),
  },
];
