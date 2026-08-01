import { Link } from "react-router-dom";
import { useI18n, fmt } from "@/i18n";
import { LATEST_YEAR } from "@/engine/tables";
import { GUIDE_META } from "@/content/guides/registry";
import { guidePath, localizedPath } from "@/i18n/paths";
import { Breadcrumb } from "@/components/Breadcrumb";
import { track } from "@/analytics";

/** The guides index: lists each article with its short label and description, linked by language. */
export function GuidesIndexPage() {
  const { t, lang } = useI18n();
  return (
    <article className="doc">
      <Breadcrumb items={[{ label: t.nav.calculator, to: localizedPath(lang, "/") }, { label: t.nav.guides }]} />
      <h1 className="doc__title">{t.pages.guidesTitle}</h1>
      <p className="doc__intro">{fmt(t.pages.guidesIntro, { year: LATEST_YEAR })}</p>

      <ul className="guides">
        {GUIDE_META.map((g) => (
          <li key={g.id} className="guide-card">
            <h2 className="guide-card__title">
              <Link
                className="guide-card__link"
                to={guidePath(lang, g.id)}
                onClick={() => track("guide_open", { guide: g.id })}
              >
                {g.navLabel[lang]}
              </Link>
            </h2>
            <p className="guide-card__desc">{g.description[lang]}</p>
          </li>
        ))}
      </ul>
    </article>
  );
}
