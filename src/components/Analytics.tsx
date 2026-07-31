import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { useI18n } from "@/i18n";
import { useTheme } from "@/theme/theme";
import { track } from "@/analytics";
import { arrivalKind } from "@/state/url";

/**
 * Sets the per-route document title and sends a Google Analytics page_view on each route change
 * (the initial one included). GA's own automatic page_view is disabled in index.html so this is
 * the single source of page views.
 *
 * page_location is built from the route path (origin + pathname), deliberately omitting the query
 * string so the state token (`?c=…`) — derived from the values people enter — never reaches GA.
 * Depends on the route path only: the calculator rewrites the query on every input change (via
 * replaceState, which the router ignores), and we don't want a page view per keystroke.
 */
export function Analytics() {
  const { pathname } = useLocation();
  const { lang, t } = useI18n();
  const { theme } = useTheme();

  // Localized, per-route document title (also read by the page_view below). The home route keeps
  // the brand title; subpages read "<page> · <brand>".
  const docTitle =
    pathname === "/glossary"
      ? `${t.nav.glossary} · ${t.app.title}`
      : pathname === "/how-it-works"
        ? `${t.nav.howItWorks} · ${t.app.title}`
        : `${t.app.title} · ${t.app.subtitle}`;
  // Declared before the page_view effect so document.title is current when page_view reads it.
  // Reacts to the route and the language; a language switch updates the tab without a new page view.
  useEffect(() => {
    document.title = docTitle;
  }, [docTitle]);

  // Track the active UI language and theme on each page view, sampled when the route changes. Held
  // in refs (not page_view dependencies) so switching language or theme — which keeps the same
  // route — does not emit a second page view; language_switch/theme_toggle record the switch.
  const langRef = useRef(lang);
  const themeRef = useRef(theme);
  useEffect(() => {
    langRef.current = lang;
    themeRef.current = theme;
  }, [lang, theme]);

  // Whether this page load opened a shared link — captured once, here in a component that mounts a
  // single time per load (not in a page that remounts on navigation, which would misread the app's
  // own continuously-written token as a fresh arrival).
  const [arrival] = useState(arrivalKind);
  useEffect(() => {
    if (arrival === "ok") track("arrived_via_share");
    else if (arrival === "bad") track("bad_share_link");
  }, [arrival]);

  useEffect(() => {
    track("page_view", {
      page_path: pathname,
      page_location: `${window.location.origin}${pathname}`,
      page_title: document.title,
      ui_language: langRef.current,
      ui_theme: themeRef.current,
    });
  }, [pathname]);
  return null;
}
