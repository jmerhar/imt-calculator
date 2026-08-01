import { useI18n } from "@/i18n";
import { glossary } from "@/content/glossary";
import { localizedPath } from "@/i18n/paths";
import { Breadcrumb } from "@/components/Breadcrumb";

/** Glossary page: key IMT/stamp-duty terms; the English view shows each term in both languages. */
export function GlossaryPage() {
  const { t, lang } = useI18n();
  return (
    <article className="doc">
      <Breadcrumb items={[{ label: t.nav.calculator, to: localizedPath(lang, "/") }, { label: t.nav.glossary }]} />
      <h1 className="doc__title">{t.nav.glossary}</h1>
      <p className="doc__intro">{t.pages.glossaryIntro}</p>

      <dl className="glossary">
        {glossary.map((e) => (
          <div className="glossary__item" id={e.id} key={e.id}>
            <dt className="glossary__term">
              {lang === "en" ? (
                <>
                  {e.en.term}
                  <span className="glossary__alt"> · {e.pt.term}</span>
                </>
              ) : (
                e.pt.term
              )}
            </dt>
            <dd className="glossary__def">{lang === "en" ? e.en.def : e.pt.def}</dd>
          </div>
        ))}
      </dl>
    </article>
  );
}
