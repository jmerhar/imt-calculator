import { useI18n } from "@/i18n";
import { resolveText } from "@/content/guides/figures";

/** One question and its answer, with {token} figures still to resolve. */
export interface FaqEntry {
  q: string;
  a: string;
}

/**
 * A list of questions and answers, shared by the guide articles and the home page explainer so the
 * two cannot drift apart in markup or styling. Plain headings rather than an accordion: the answers
 * are short, and collapsing them would hide text that is the point of the section being there.
 *
 * `heading` is the section title; the caller supplies it because the guides and the home page label
 * the section differently. `level` is the section heading's depth — 2 on a guide article, where the
 * article title is the h1, and 3 inside the home explainer, whose own heading is already an h2.
 * Questions sit one level below it either way, so the outline never skips a level.
 */
export function Faq({
  heading,
  entries,
  level = 2,
}: {
  heading: string;
  entries: FaqEntry[];
  level?: 2 | 3;
}) {
  const { lang } = useI18n();
  const Heading = level === 3 ? "h3" : "h2";
  const Question = level === 3 ? "h4" : "h3";
  return (
    <section className="doc__section">
      <Heading className="doc__h2">{heading}</Heading>
      <div className="doc__body">
        {entries.map((f, i) => (
          <div className="faq-item" key={i}>
            <Question className="faq-item__q">{resolveText(f.q, lang)}</Question>
            <p>{resolveText(f.a, lang)}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
