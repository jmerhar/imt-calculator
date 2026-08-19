import { Outlet } from "react-router-dom";
import type { Lang } from "@/i18n";
import { ThemeProvider } from "@/theme/theme";
import { I18nProvider } from "@/i18n";
import { Analytics } from "@/components/Analytics";
import { Layout } from "@/components/Layout";
import { LangSuggestion } from "@/components/LangSuggestion";

/**
 * The app shell rendered for every route: theme + language providers, analytics, the page chrome
 * (header/nav/footer), and the routed page via <Outlet />. Each language subtree passes its `lang`
 * (EN at `/`, PT at `/pt/…`), so language is authoritative from the URL.
 *
 * A visitor whose preferred language differs from the page's is offered the other language by
 * LangSuggestion, which links rather than redirects — see that component for why.
 */
export function RootLayout({ lang = "en" }: { lang?: Lang }) {
  return (
    <ThemeProvider>
      <I18nProvider lang={lang}>
        <Analytics />
        <Layout>
          <LangSuggestion lang={lang} />
          <Outlet />
        </Layout>
      </I18nProvider>
    </ThemeProvider>
  );
}
