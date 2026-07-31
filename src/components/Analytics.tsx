import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { track } from "@/analytics";

/**
 * Sends a Google Analytics page_view on each route change (the initial one included). GA's own
 * automatic page_view is disabled in index.html so this is the single source of page views.
 *
 * We route with HashRouter, so the path lives in the URL fragment (`…/#/glossary`). GA derives its
 * page-path dimension from `page_location`'s PATH and ignores the fragment, so sending the real URL
 * would collapse every route to "/". We send a synthetic path-based location instead so each route
 * is a distinct page in GA — and, as a bonus, it omits the hash query (the state token), keeping
 * analytics free of the values people enter. Depends on the route path only: the calculator
 * rewrites the hash query on every input change (via replaceState, which the router ignores), and
 * we don't want a page view per keystroke.
 */
export function Analytics() {
  const { pathname } = useLocation();
  useEffect(() => {
    track("page_view", {
      page_path: pathname,
      page_location: `${window.location.origin}${pathname}`,
      page_title: document.title,
    });
  }, [pathname]);
  return null;
}
