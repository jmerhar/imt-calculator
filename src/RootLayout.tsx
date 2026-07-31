import { Outlet } from "react-router-dom";
import { ThemeProvider } from "@/theme/theme";
import { I18nProvider } from "@/i18n";
import { Analytics } from "@/components/Analytics";
import { Layout } from "@/components/Layout";

/**
 * The app shell rendered for every route: theme + language providers, analytics, the page chrome
 * (header/nav/footer), and the routed page via <Outlet />. It is the root route's element, so it
 * mounts once and persists across in-app navigation.
 */
export function RootLayout() {
  return (
    <ThemeProvider>
      <I18nProvider>
        <Analytics />
        <Layout>
          <Outlet />
        </Layout>
      </I18nProvider>
    </ThemeProvider>
  );
}
