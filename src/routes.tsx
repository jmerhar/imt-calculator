import type { RouteRecord } from "vite-react-ssg";
import { RootLayout } from "@/RootLayout";
import { CalculatorPage } from "@/pages/CalculatorPage";
import { GlossaryPage } from "@/pages/GlossaryPage";
import { HowItWorksPage } from "@/pages/HowItWorksPage";

// The route table, shared by the SSG build (which prerenders each static path to HTML) and the
// client router. `*` is a splat, so it is not prerendered — it's the client-side fallback for any
// path the 404.html shim boots the app on.
export const routes: RouteRecord[] = [
  {
    path: "/",
    element: <RootLayout />,
    entry: "src/RootLayout.tsx",
    children: [
      { index: true, element: <CalculatorPage />, entry: "src/pages/CalculatorPage.tsx" },
      { path: "glossary", element: <GlossaryPage />, entry: "src/pages/GlossaryPage.tsx" },
      { path: "how-it-works", element: <HowItWorksPage />, entry: "src/pages/HowItWorksPage.tsx" },
      { path: "*", element: <CalculatorPage /> },
    ],
  },
];
