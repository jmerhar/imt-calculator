import { Link } from "react-router-dom";
import { useI18n } from "@/i18n";
import { localizedPath } from "@/i18n/paths";

/** 404 page: prerendered to /404 (served by GitHub Pages as 404.html) and the client `*` fallback. */
export function NotFoundPage() {
  const { t, lang } = useI18n();
  return (
    <article className="doc">
      <h1 className="doc__title">{t.pages.notFoundTitle}</h1>
      <p className="doc__intro">{t.pages.notFoundBody}</p>
      <p>
        <Link className="footer__link" to={localizedPath(lang, "/")}>
          {t.pages.notFoundHome}
        </Link>
      </p>
    </article>
  );
}
