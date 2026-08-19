import { Link } from "react-router-dom";
import { useI18n } from "@/i18n";
import { homeExplainer, homeFaq, type ExplainerBlock } from "@/content/homeExplainer";
import { resolveText } from "@/content/guides/figures";
import { guidePath } from "@/i18n/paths";
import { Faq } from "@/components/Faq";

/** A paragraph, a bullet list, or a link through to the guide covering the section in depth. */
function Block({ block }: { block: ExplainerBlock }) {
  const { lang } = useI18n();
  if ("p" in block) return <p>{resolveText(block.p, lang)}</p>;
  if ("ul" in block)
    return (
      <ul>
        {block.ul.map((li, i) => (
          <li key={i}>{resolveText(li, lang)}</li>
        ))}
      </ul>
    );
  return (
    <p className="explainer__more">
      <Link to={guidePath(lang, block.guide)}>{resolveText(block.label, lang)}</Link>
    </p>
  );
}

/**
 * Long-form explanation below the calculator: how the tax is worked out, a worked example, and the
 * questions people search for, each linking through to the guide that covers it in depth.
 *
 * The calculator on its own is a form, and a form is a handful of labels — too little text for a
 * search engine to judge the page against the multi-thousand-word portal pages competing for the
 * same queries. Headings start at h2; the page's single h1 is the calculator's own title.
 */
export function HomeExplainer() {
  const { t, lang } = useI18n();
  return (
    <section className="explainer doc" aria-labelledby="explainer-heading">
      <h2 className="doc__h2" id="explainer-heading">
        {t.pages.explainerHeading}
      </h2>
      {homeExplainer.map((s) => {
        const c = lang === "en" ? s.en : s.pt;
        return (
          <section className="doc__section" key={s.id}>
            <h3 className="doc__h2">{resolveText(c.heading, lang)}</h3>
            <div className="doc__body">
              {c.blocks.map((b, i) => (
                <Block block={b} key={i} />
              ))}
            </div>
          </section>
        );
      })}
      <Faq
        heading={t.guides.faqHeading}
        entries={homeFaq.map((f) => (lang === "en" ? f.en : f.pt))}
        level={3}
      />
    </section>
  );
}
