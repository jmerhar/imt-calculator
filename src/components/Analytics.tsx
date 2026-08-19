import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { useI18n } from "@/i18n";
import { barePath, guideFromPath } from "@/i18n/paths";
import { GUIDES_INDEX_SEO, guideById } from "@/content/guides/registry";
import { NOT_FOUND_TITLE, SEO_PAGES } from "@/seo/meta";
import { SITE_URL } from "@/config";
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
  const { lang } = useI18n();
  const { theme } = useTheme();

  // Localized, per-route document title (also read by the page_view below), taken from the same
  // declaration the prerendered <title> is built from — SEO_PAGES for the core routes, the guide
  // registry for guides. Composing it from separate pieces here instead would leave two independent
  // definitions of every title, and this effect assigns document.title/og:title/twitter:title, so
  // the client's version wins in the rendered DOM: an edit to the SEO copy alone would be reverted
  // on hydration and never reach a crawler. Guides are handled first, since barePath doesn't model
  // them. A path with no SEO entry is one the router did not match — the `*` catch-all renders the
  // not-found page — so it takes the not-found title rather than the home page's.
  const guide = guideFromPath(pathname);
  const bare = barePath(pathname);
  const docTitle = guide
    ? ((guide.kind === "article" && guide.id ? guideById(guide.id)?.title[lang] : undefined) ??
      GUIDES_INDEX_SEO[lang].title)
    : (SEO_PAGES[bare]?.[lang].title ?? NOT_FOUND_TITLE[lang]);
  // Keep the tab title and the shareable-URL meta (canonical + og:url/title) in sync with the route.
  // These are baked per URL into the prerendered HTML, but on client-side navigation the app must
  // refresh them — otherwise a mobile "Share" (which reads og:url) would share the URL the visitor
  // landed on, not the one they navigated to. The query string is dropped so the shared link is the
  // clean canonical page, not the `?c=` state token. Runs before the page_view effect so
  // document.title is current when that reads it.
  useEffect(() => {
    document.title = docTitle;
    const url = `${SITE_URL}${pathname.endsWith("/") ? pathname : `${pathname}/`}`;
    document.querySelector('link[rel="canonical"]')?.setAttribute("href", url);
    document.querySelector('meta[property="og:url"]')?.setAttribute("content", url);
    document.querySelector('meta[property="og:title"]')?.setAttribute("content", docTitle);
    document.querySelector('meta[name="twitter:title"]')?.setAttribute("content", docTitle);
    const ogImage = `${SITE_URL}/og-${lang}.png`;
    document.querySelector('meta[property="og:image"]')?.setAttribute("content", ogImage);
    document.querySelector('meta[name="twitter:image"]')?.setAttribute("content", ogImage);
  }, [pathname, docTitle, lang]);

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
