import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { useI18n, fmt } from "@/i18n";
import type { Lang } from "@/i18n";
import { useTheme } from "@/theme/theme";
import { LATEST_YEAR } from "@/engine/tables";

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
          <SealMark />
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
                onClick={() => setLang(l)}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="iconbtn"
            onClick={toggle}
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
          <span>{fmt(t.footer.dataYear, { year: LATEST_YEAR })}</span>
        </p>
      </footer>
    </div>
  );
}

// The brand mark: a small "selo" (seal), echoing the deed stamp / Imposto do Selo.
function SealMark() {
  return (
    <svg className="header__mark" width="34" height="34" viewBox="0 0 32 32" aria-hidden="true">
      <circle cx="16" cy="16" r="15" fill="#14345e" />
      <circle cx="16" cy="16" r="10.5" fill="none" stroke="#f7f4ed" strokeWidth="1.6" />
      <circle cx="16" cy="16" r="7" fill="none" stroke="#8fb3de" strokeWidth="1" />
      <circle cx="16" cy="16" r="2.4" fill="#d99a2b" />
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
