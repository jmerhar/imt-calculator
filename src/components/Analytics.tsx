import { useEffect } from "react";
import { useLocation } from "react-router-dom";

declare global {
  interface Window {
    gtag?: (command: string, ...args: unknown[]) => void;
  }
}

// Sends a Google Analytics page_view on each route change (the initial one included). GA's own
// automatic page_view is disabled in index.html so this is the single source of page views.
// Depends on the route path only — the calculator rewrites the hash query on every input change
// (via replaceState, which the router ignores), and we don't want a page view for each keystroke.
export function Analytics() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.gtag?.("event", "page_view", {
      page_path: pathname,
      page_location: window.location.href,
      page_title: document.title,
    });
  }, [pathname]);
  return null;
}
