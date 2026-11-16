import { useState, useSyncExternalStore } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { dictionaries, type Lang } from "@/i18n";
import {
  LANG_STORAGE_KEY,
  LANG_SUGGEST_DISMISSED_KEY,
  preferredLang,
  switchLangPath,
} from "@/i18n/paths";
import { track } from "@/analytics";

/**
 * Offers the current page in the visitor's preferred language, as a dismissible banner with a real
 * link — never an automatic redirect.
 *
 * A redirect would make every page answer a crawler with a different page's content, so search
 * engines see the URL as redirecting and index neither version well; Google's internationalization
 * guidance is to serve the requested URL and signal the alternatives (hreflang, which the build
 * already emits) instead. A banner keeps every URL a 200 that serves its own language while still
 * getting a Portuguese visitor to the Portuguese page in one click.
 *
 * Renders nothing until after mount: the prerendered HTML is language-specific and shared by every
 * visitor, so the banner cannot be part of it without a hydration mismatch.
 */
export function LangSuggestion({ lang }: { lang: Lang }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  // False while hydrating the prerendered HTML and true from the render after it, so the banner
  // appears only once the page is interactive.
  const hydrated = useSyncExternalStore(subscribeNever, isClient, isServer);
  const [dismissed, setDismissed] = useState(false);

  // Worked out on every render, so following the link (or switching language) clears the banner
  // instead of leaving a suggestion for the language already being read.
  const target = hydrated && !dismissed ? suggestedLang(lang) : null;

  if (!target) return null;

  // The suggestion is written in the language it offers, so it is legible to the visitor it is aimed
  // at rather than to a reader of the current page.
  const t = dictionaries[target].langSuggest;
  const to = switchLangPath(pathname, target);

  return (
    <div className="langsuggest">
      <span className="langsuggest__text">{t.text}</span>
      <Link
        className="langsuggest__cta"
        to={to}
        hrefLang={target}
        onClick={(e) => {
          // Following the suggestion is as deliberate as using the header switcher, so it is
          // remembered the same way and the banner does not reappear.
          if (typeof localStorage !== "undefined") localStorage.setItem(LANG_STORAGE_KEY, target);
          track("language_switch", { language: target });
          // The ?c= state token is written with replaceState, so the router's location never sees it;
          // reading the live URL and re-appending it keeps a shared purchase across the switch.
          const search = typeof window !== "undefined" ? window.location.search : "";
          if (search) {
            e.preventDefault();
            navigate(to + search);
          }
        }}
      >
        {t.cta}
      </Link>
      <button
        type="button"
        className="langsuggest__dismiss"
        aria-label={t.dismiss}
        onClick={() => {
          if (typeof localStorage !== "undefined") {
            localStorage.setItem(LANG_SUGGEST_DISMISSED_KEY, "1");
          }
          setDismissed(true);
        }}
      >
        {/* The glyph is decorative; the button's accessible name comes from aria-label. */}
        <span aria-hidden="true">×</span>
      </button>
    </div>
  );
}

/** The language to suggest instead of `lang`, or null when the visitor reads it or dismissed the offer. */
function suggestedLang(lang: Lang): Lang | null {
  if (typeof localStorage !== "undefined" && localStorage.getItem(LANG_SUGGEST_DISMISSED_KEY)) {
    return null;
  }
  const preferred = preferredLang();
  return preferred === lang ? null : preferred;
}

/** A store that never changes; useSyncExternalStore only tells hydration from the renders after it. */
function subscribeNever(): () => void {
  return () => {};
}

/** The snapshot after hydration. */
function isClient(): boolean {
  return true;
}

/** The snapshot while hydrating, and when prerendering. */
function isServer(): boolean {
  return false;
}
