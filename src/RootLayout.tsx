import { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import type { Lang } from "@/i18n";
import { ThemeProvider } from "@/theme/theme";
import { I18nProvider } from "@/i18n";
import { preferredLang, switchLangPath } from "@/i18n/paths";
import { Analytics } from "@/components/Analytics";
import { Layout } from "@/components/Layout";

// English content pages eligible for the once-per-load "prefer Portuguese" redirect.
const REDIRECTABLE = ["/", "/glossary", "/how-it-works"];

/**
 * The app shell rendered for every route: theme + language providers, analytics, the page chrome
 * (header/nav/footer), and the routed page via <Outlet />. Each language subtree passes its `lang`
 * (EN at `/`, PT at `/pt/…`), so language is authoritative from the URL.
 */
export function RootLayout({ lang = "en" }: { lang?: Lang }) {
  const navigate = useNavigate();
  const { pathname, search } = useLocation();

  // Send a visitor whose preferred language is Portuguese to the /pt twin of an English content
  // page — ONCE, on load. An explicit toggle saves a preference (see Layout) that preferredLang()
  // honours over the browser language, so a deliberate choice is never overridden. Runs once
  // (RootLayout reconciles across the redirect rather than remounting); guarded to EN pages so it
  // cannot loop (PT pages never redirect).
  useEffect(() => {
    if (lang === "en" && REDIRECTABLE.includes(pathname) && preferredLang() === "pt") {
      navigate(switchLangPath(pathname, "pt") + search, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once on load, by design
  }, []);

  return (
    <ThemeProvider>
      <I18nProvider lang={lang}>
        <Analytics />
        <Layout>
          <Outlet />
        </Layout>
      </I18nProvider>
    </ThemeProvider>
  );
}
