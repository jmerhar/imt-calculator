import { Link, useParams } from "react-router-dom";
import { useI18n } from "@/i18n";
import { GUIDE_BODIES, guideBySlug } from "@/content/guides";
import type { Block } from "@/content/guides/registry";
import { resolveText } from "@/content/guides/figures";
import { getYearData, LATEST_YEAR } from "@/engine/tables";
import type { CalcInput, TableId } from "@/engine/types";
import { guidesIndexPath, localizedPath } from "@/i18n/paths";
import { formatAmount, formatPercent } from "@/format";
import { defaultInput, defaultBuyer } from "@/state/defaults";
import { encodeToken } from "@/state/url";
import { track } from "@/analytics";
import { Breadcrumb } from "@/components/Breadcrumb";
import { NotFoundPage } from "@/pages/NotFoundPage";

// The worked example each guide's CTA pre-fills into the calculator (via a ?c= token), so the
// reader lands on the exact scenario the article describes. Guides without an entry link to an
// empty calculator.
const CTA_EXAMPLES: Record<string, CalcInput> = {
  "imt-non-residents": {
    ...defaultInput(),
    price: 400000,
    intendedUse: "secondary",
    buyers: [{ ...defaultBuyer(), residency: "non_resident", exception: "none" }],
  },
  "imt-jovem": {
    ...defaultInput(),
    price: 400000,
    intendedUse: "own_permanent",
    buyers: [{ ...defaultBuyer(), jovem: true }],
  },
  "imt-imi-stamp-duty": { ...defaultInput(), price: 400000, intendedUse: "own_permanent" },
  "imt-regions": { ...defaultInput(), price: 400000, location: "azores", intendedUse: "own_permanent" },
  "imt-tables": { ...defaultInput(), price: 400000, intendedUse: "own_permanent" },
};

/** Renders the IMT rate table `id` for the current year from the engine, so the figures stay live. */
function BracketTable({ id }: { id: TableId }) {
  const { t, lang } = useI18n();
  const brackets = getYearData(LATEST_YEAR)?.tables[id];
  if (!brackets) return null;
  return (
    <table className="rate-table">
      {/* caption must be the table's first child per the HTML content model */}
      <caption className="rate-table__note">{t.guides.tableNote}</caption>
      <thead>
        <tr>
          <th scope="col">{t.guides.tableFrom}</th>
          <th scope="col">{t.guides.tableRate}</th>
          <th scope="col">{t.guides.tableDeduction}</th>
        </tr>
      </thead>
      <tbody>
        {brackets.map((b) => (
          <tr key={b.lower}>
            <td>{formatAmount(b.lower, lang, 0)}</td>
            {/* whole-percent rates render without decimals; use rounding, not float compare */}
            <td>{formatPercent(b.rate, lang, Math.round(b.rate * 1000) % 10 === 0 ? 0 : 1)}</td>
            <td>{b.deduction ? formatAmount(b.deduction, lang) : "—"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function GuideBlock({ block }: { block: Block }) {
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
  return <BracketTable id={block.table} />;
}

/** A single guide article, resolved from the localized :slug param. Unknown slugs render NotFound. */
export function GuidePage() {
  const { t, lang } = useI18n();
  const { slug = "" } = useParams();
  const meta = guideBySlug(lang, slug);
  if (!meta) return <NotFoundPage />;
  const body = GUIDE_BODIES[meta.id][lang];

  const example = CTA_EXAMPLES[meta.id];
  const home = localizedPath(lang, "/");
  const ctaHref = example ? `${home}?c=${encodeToken(example)}` : home;

  return (
    <article className="doc guide">
      <Breadcrumb
        items={[
          { label: t.nav.calculator, to: localizedPath(lang, "/") },
          { label: t.nav.guides, to: guidesIndexPath(lang) },
          { label: meta.navLabel[lang] },
        ]}
      />

      <h1 className="doc__title">{meta.title[lang]}</h1>
      <p className="guide__meta">
        {t.guides.updated} <time dateTime={meta.updated}>{meta.updated}</time>
      </p>
      <p className="doc__intro">{resolveText(body.intro, lang)}</p>

      {body.sections.map((s, i) => (
        <section className="doc__section" key={i}>
          <h2 className="doc__h2">{resolveText(s.heading, lang)}</h2>
          <div className="doc__body">
            {s.blocks.map((b, j) => (
              <GuideBlock key={j} block={b} />
            ))}
          </div>
        </section>
      ))}

      {body.faq && (
        <section className="doc__section">
          <h2 className="doc__h2">{t.guides.faqHeading}</h2>
          <div className="doc__body">
            {body.faq.map((f, i) => (
              <div className="faq-item" key={i}>
                <h3 className="faq-item__q">{resolveText(f.q, lang)}</h3>
                <p>{resolveText(f.a, lang)}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <p className="guide__cta">
        <Link className="btn-cta" to={ctaHref} onClick={() => track("guide_cta", { guide: meta.id })}>
          {resolveText(body.cta, lang)}
        </Link>
      </p>
    </article>
  );
}
