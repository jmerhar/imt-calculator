import { Link, useParams } from "react-router-dom";
import { useI18n } from "@/i18n";
import { GUIDE_BODIES, guideBySlug } from "@/content/guides";
import type { Block } from "@/content/guides/registry";
import { getYearData, LATEST_YEAR } from "@/engine/tables";
import type { TableId } from "@/engine/types";
import { guidesIndexPath, localizedPath } from "@/i18n/paths";
import { formatAmount, formatPercent } from "@/format";
import { track } from "@/analytics";
import { NotFoundPage } from "@/pages/NotFoundPage";

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
  if ("p" in block) return <p>{block.p}</p>;
  if ("ul" in block)
    return (
      <ul>
        {block.ul.map((li, i) => (
          <li key={i}>{li}</li>
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

  return (
    <article className="doc guide">
      <nav className="breadcrumb" aria-label="breadcrumb">
        <Link to={localizedPath(lang, "/")}>{t.guides.breadcrumbCalculator}</Link>
        <span aria-hidden="true"> / </span>
        <Link to={guidesIndexPath(lang)}>{t.nav.guides}</Link>
        <span aria-hidden="true"> / </span>
        <span aria-current="page">{meta.navLabel[lang]}</span>
      </nav>

      <h1 className="doc__title">{meta.title[lang]}</h1>
      <p className="guide__meta">
        {t.guides.updated} <time dateTime={meta.updated}>{meta.updated}</time>
      </p>
      <p className="doc__intro">{body.intro}</p>

      {body.sections.map((s, i) => (
        <section className="doc__section" key={i}>
          <h2 className="doc__h2">{s.heading}</h2>
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
                <h3 className="faq-item__q">{f.q}</h3>
                <p>{f.a}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <p className="guide__cta">
        <Link
          className="btn-cta"
          to={localizedPath(lang, "/")}
          onClick={() => track("guide_cta", { guide: meta.id })}
        >
          {body.cta}
        </Link>
      </p>
    </article>
  );
}
