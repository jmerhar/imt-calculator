import { useEffect, useState, type ReactNode } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useI18n, fmt } from "@/i18n";
import type { Lang } from "@/i18n";
import { LANG_STORAGE_KEY, localizedPath, switchLangPath, guidesIndexPath } from "@/i18n/paths";
import { useTheme } from "@/theme/theme";
import { LATEST_YEAR } from "@/engine/tables";
import { track } from "@/analytics";

/** App shell: header (brand, nav, language + theme controls), the page body, and the footer. */
export function Layout({ children }: { children: ReactNode }) {
  const { t, lang } = useI18n();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  // Nav targets are prefixed for the active language (EN at root, PT under /pt).
  const path = (bare: string) => localizedPath(lang, bare);

  // On narrow screens the nav collapses behind a toggle; it is always shown on wider viewports
  // (the toggle is hidden there via CSS). Any navigation closes it, so a tapped link doesn't leave
  // the menu hanging open over the new page.
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => setMenuOpen(false), [pathname]);

  const navClass = ({ isActive }: { isActive: boolean }) =>
    isActive ? "nav__link nav__link--active" : "nav__link";

  return (
    <div className="app">
      <a className="skiplink" href="#main">
        {t.controls.skipToContent}
      </a>

      <header className="header">
        <div className="header__brand">
          <HouseMark />
          <div>
            <div className="header__title">{t.app.title}</div>
            <div className="header__subtitle">{fmt(t.app.subtitle, { year: LATEST_YEAR })}</div>
          </div>
        </div>

        <button
          type="button"
          className="nav-toggle"
          aria-label={t.controls.menu}
          aria-expanded={menuOpen}
          aria-controls="primary-nav"
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <CloseIcon /> : <MenuIcon />}
        </button>

        <nav
          className={menuOpen ? "nav nav--open" : "nav"}
          id="primary-nav"
          aria-label={t.app.title}
        >
          <NavLink to={path("/")} className={navClass} end>
            {t.nav.calculator}
          </NavLink>
          <NavLink to={path("/glossary")} className={navClass}>
            {t.nav.glossary}
          </NavLink>
          <NavLink to={path("/how-it-works")} className={navClass}>
            {t.nav.howItWorks}
          </NavLink>
          <NavLink to={guidesIndexPath(lang)} className={navClass}>
            {t.nav.guides}
          </NavLink>
        </nav>

        <div className="header__tools">
          <div className="langswitch" role="group" aria-label={t.controls.language}>
            {(["en", "pt"] as Lang[]).map((l) => (
              <button
                key={l}
                type="button"
                className="langswitch__btn"
                aria-pressed={lang === l}
                onClick={() => {
                  if (l === lang) return;
                  // A deliberate choice: remember it so the load-time redirect honours it and never
                  // overrides the user. Then navigate to the same page in the other language,
                  // keeping the ?c= state token (written via replaceState, so read from the live URL).
                  if (typeof localStorage !== "undefined") localStorage.setItem(LANG_STORAGE_KEY, l);
                  track("language_switch", { language: l });
                  const search = typeof window !== "undefined" ? window.location.search : "";
                  navigate(switchLangPath(pathname, l) + search);
                }}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="iconbtn"
            onClick={() => {
              track("theme_toggle", { theme: theme === "dark" ? "light" : "dark" });
              toggle();
            }}
            aria-label={theme === "dark" ? t.controls.toLight : t.controls.toDark}
          >
            {theme === "dark" ? <SunIcon /> : <MoonIcon />}
          </button>
        </div>
      </header>

      <main className="main" id="main" tabIndex={-1}>
        {children}
      </main>

      <footer className="footer">
        <p className="footer__disclaimer">{t.footer.disclaimer}</p>
        <p className="footer__meta">
          <NavLink to={path("/how-it-works")} className="footer__link">
            {t.footer.sources}
          </NavLink>
          <span aria-hidden="true"> · </span>
          <a
            className="footer__link"
            href="https://github.com/jmerhar/imt-calculator"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => track("outbound", { target: "github" })}
          >
            {t.footer.github}
          </a>
          <span aria-hidden="true"> · </span>
          <span>{fmt(t.footer.dataYear, { year: LATEST_YEAR })}</span>
        </p>
        <p className="footer__privacy">{t.footer.privacy}</p>
      </footer>
    </div>
  );
}

// The brand mark: a house with a euro — a property purchase and its tax.
function HouseMark() {
  return (
    <svg className="header__mark" width="34" height="34" viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="7" fill="#2b5fa0" />
      <path d="M4.5 15.8 L16 5.5 L27.5 15.8 L23.5 15.8 L23.5 26.5 L8.5 26.5 L8.5 15.8 Z" fill="#ffffff" />
      <text
        x="16"
        y="24.6"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontSize="10"
        fontWeight="700"
        fill="#2b5fa0"
        textAnchor="middle"
      >
        €
      </text>
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M19 5l-1.5 1.5M6.5 17.5L5 19" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
    </svg>
  );
}
