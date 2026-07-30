import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { useI18n, fmt } from "@/i18n";
import type { Lang } from "@/i18n";
import { useTheme } from "@/theme/theme";
import { LATEST_YEAR } from "@/engine/tables";
import { track } from "@/analytics";

export function Layout({ children }: { children: ReactNode }) {
  const { t, lang, setLang } = useI18n();
  const { theme, toggle } = useTheme();

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
            <div className="header__subtitle">{t.app.subtitle}</div>
          </div>
        </div>

        <nav className="nav" aria-label={t.app.title}>
          <NavLink to="/" className={navClass} end>
            {t.nav.calculator}
          </NavLink>
          <NavLink to="/glossary" className={navClass}>
            {t.nav.glossary}
          </NavLink>
          <NavLink to="/how-it-works" className={navClass}>
            {t.nav.howItWorks}
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
                  if (l !== lang) track("language_switch", { language: l });
                  setLang(l);
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
          <NavLink to="/how-it-works" className="footer__link">
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
