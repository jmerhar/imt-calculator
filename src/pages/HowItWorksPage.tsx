import { useI18n } from "@/i18n";
import { howItWorks } from "@/content/howItWorks";
import { resolveText } from "@/content/guides/figures";
import { localizedPath } from "@/i18n/paths";
import { Breadcrumb } from "@/components/Breadcrumb";

/** How-it-works page: methodology, the rules with citations, and the data-provenance disclosure. */
export function HowItWorksPage() {
  const { t, lang } = useI18n();
  return (
    <article className="doc">
      <Breadcrumb items={[{ label: t.nav.calculator, to: localizedPath(lang, "/") }, { label: t.nav.howItWorks }]} />
      <h1 className="doc__title">{t.nav.howItWorks}</h1>
      <p className="doc__intro">{t.pages.howtoIntro}</p>

      {howItWorks.map((s) => {
        const c = lang === "en" ? s.en : s.pt;
        return (
          <section className="doc__section" key={s.id}>
            <h2 className="doc__h2">{resolveText(c.heading, lang)}</h2>
            <div className="doc__body">
              {c.blocks.map((b, i) =>
                "p" in b ? (
                  <p key={i}>{resolveText(b.p, lang)}</p>
                ) : (
                  <ul key={i}>
                    {b.ul.map((li, j) => (
                      <li key={j}>{resolveText(li, lang)}</li>
                    ))}
                  </ul>
                ),
              )}
            </div>
          </section>
        );
      })}
    </article>
  );
}
