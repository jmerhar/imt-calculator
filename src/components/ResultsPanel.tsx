import { useEffect, useRef, useState } from "react";
import { useI18n, fmt } from "@/i18n";
import type { ImtRule, BuyerResult, CalcInput, CalcResult } from "@/engine/types";
import { formatEuro, formatPercent } from "@/format";
import { encodeToken } from "@/state/url";
import { track } from "@/analytics";
import { SITE_URL } from "@/config";

function ruleLabel(rule: ImtRule, t: ReturnType<typeof useI18n>["t"]): string {
  if (rule === "non_resident_7_5") return t.results.ruleNonResident;
  if (rule === "tax_haven_10") return t.results.ruleTaxHaven;
  return t.results.ruleOrdinary;
}

/** The live results: headline tiles, the summary, the per-buyer breakdown, and the share/actions. */
export function ResultsPanel({
  input,
  result,
  onReset,
}: {
  input: CalcInput;
  result: CalcResult;
  onReset: () => void;
}) {
  const { t, lang } = useI18n();

  // A buyer's own name if given, else the ordinal fallback ("Buyer 2"). Read from the inputs (order
  // matches the results), so a named buyer is recognisable in the breakdown and shared links.
  const buyerLabel = (i: number): string =>
    input.buyers[i]?.name?.trim() || `${t.form.buyer} ${i + 1}`;

  const [flash, setFlash] = useState<string | null>(null);
  const flashTimer = useRef<ReturnType<typeof setTimeout>>();

  // Clear a pending flash timer if the panel unmounts, so it never fires setState afterwards.
  useEffect(() => () => clearTimeout(flashTimer.current), []);

  // The single reversible code that carries the whole calculation, on the canonical site URL in the
  // active language (EN at /, PT at /pt/) so a shared link opens the calculator in the same language
  // and renders identically on server and client.
  const home = lang === "en" ? "/" : "/pt/";
  const link = `${SITE_URL}${home}?c=${encodeToken(input)}`;

  const notify = (msg: string) => {
    clearTimeout(flashTimer.current); // supersede any in-flight message so timers don't overlap
    setFlash(msg);
    flashTimer.current = setTimeout(() => setFlash(null), 2000);
  };

  const copy = async (text: string, msg: string) => {
    try {
      await navigator.clipboard.writeText(text);
      notify(msg);
    } catch {
      /* clipboard unavailable (e.g. insecure context) — silently ignore */
    }
  };

  // Minimal decimal places so a rate reads "7.5%"/"8%", not "7.50%"/"8.00%".
  const pctDigits = (fraction: number) => {
    const p = fraction * 100;
    if (Number.isInteger(p)) return 0;
    if (Number.isInteger(p * 10)) return 1;
    return 2;
  };
  const pct = (fraction: number) => formatPercent(fraction, lang, pctDigits(fraction));

  // The AT `base × rate − deduction` formula for one buyer with the numbers filled in. Co-owners
  // split by the totality rule, so a share below 1 scales the whole-property amount rather than
  // moving the buyer into a lower bracket; that shows as a leading `share ×`. Flat rules
  // (non-resident, tax haven) carry no deduction, so only `base × rate` is shown.
  const imtFormula = (b: BuyerResult): string => {
    const base = formatEuro(result.taxBase, lang);
    const core =
      b.imtDeduction > 0
        ? `${base} × ${pct(b.imtRate)} − ${formatEuro(b.imtDeduction, lang)}`
        : `${base} × ${pct(b.imtRate)}`;
    const lhs = b.share === 1 ? core : `${pct(b.share)} × (${core})`;
    return `${lhs} = ${formatEuro(b.imt, lang)}`;
  };

  const copyResult = () => {
    track("copy_result");
    const lines = [
      `${t.results.taxBase}: ${formatEuro(result.taxBase, lang)}`,
      `${t.results.imt}: ${formatEuro(result.totalImt, lang)}`,
      `${t.results.stampDuty}: ${formatEuro(result.totalStampDuty, lang)}`,
      `${t.results.totalDue}: ${formatEuro(result.grandTotal, lang)}`,
      `${t.results.effectiveRate}: ${formatPercent(result.effectiveRate, lang)}`,
      link,
    ];
    void copy(lines.join("\n"), t.actions.copied);
  };

  return (
    <section className="results" aria-label={t.results.heading}>
      <div className="results__head">
        <h2 className="results__title">{t.results.heading}</h2>
        <span className="results__base">
          {t.results.taxBase}: <strong>{formatEuro(result.taxBase, lang)}</strong>
          <span className="badge">
            {result.baseSource === "vpt" ? t.results.usingVpt : t.results.usingPrice}
          </span>
        </span>
      </div>

      {result.warnings.includes("shares_not_100") && (
        <p className="warning" role="alert">
          {t.warnings.sharesNot100}
        </p>
      )}

      <div className="tiles">
        <Tile label={t.results.imt} value={formatEuro(result.totalImt, lang)} />
        <Tile label={t.results.stampDuty} value={formatEuro(result.totalStampDuty, lang)} />
        <Tile label={t.results.totalDue} value={formatEuro(result.grandTotal, lang)} accent />
      </div>

      {result.taxBase > 0 && (
        <details className="formula">
          <summary className="formula__summary">{t.results.formulaTitle}</summary>
          <div className="formula__body">
            {result.buyers.map((b, i) => (
              <div className="formula__row" key={i}>
                {result.buyers.length > 1 && (
                  <span className="formula__who">{buyerLabel(i)}</span>
                )}
                <code className="formula__expr">{imtFormula(b)}</code>
              </div>
            ))}
            {result.buyers.some((b) => b.rule === "ordinary" && b.imtDeduction > 0) && (
              <p className="formula__hint">{t.results.formulaDeductionHint}</p>
            )}
          </div>
        </details>
      )}

      <dl className="summary">
        <div className="summary__row">
          <dt>{t.results.effectiveRate}</dt>
          <dd>{formatPercent(result.effectiveRate, lang)}</dd>
        </div>
        <div className="summary__row">
          <dt>{t.results.totalOutlay}</dt>
          <dd>{formatEuro(result.totalOutlay, lang)}</dd>
        </div>
        {result.mortgageStampDuty > 0 && (
          <div className="summary__row">
            <dt>{t.results.stampDutyMortgage}</dt>
            <dd>{formatEuro(result.mortgageStampDuty, lang)}</dd>
          </div>
        )}
      </dl>

      {result.buyers.length > 1 && (
        <div className="breakdown">
          <h3 className="breakdown__title">{t.results.perBuyer}</h3>
          {result.buyers.map((b, i) => (
            <div className="bd-buyer" key={i}>
              <div className="bd-buyer__head">
                <span className="bd-buyer__name">{buyerLabel(i)}</span>
                <span className="tag">{ruleLabel(b.rule, t)}</span>
              </div>
              <dl className="bd-lines">
                <div className="bd-line">
                  <dt>{t.results.imt}</dt>
                  <dd>{formatEuro(b.imt, lang)}</dd>
                </div>
                <div className="bd-line">
                  <dt>{t.results.stampDutyTransfer}</dt>
                  <dd>{formatEuro(b.stampDutyTransfer, lang)}</dd>
                </div>
                <div className="bd-line bd-line--total">
                  <dt>{t.results.subtotal}</dt>
                  <dd>{formatEuro(b.subtotal, lang)}</dd>
                </div>
              </dl>
              {b.reclaimDelta != null && b.reclaimDelta > 0 && (
                <p className="bd-reclaim">
                  {t.results.reclaimable}: {formatEuro(b.reclaimDelta, lang)}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {result.reclaimableTotal > 0 && <p className="note">{t.results.reclaimableNote}</p>}

      <div className="sharebox">
        <label className="sharebox__label" htmlFor="share-link">
          {t.results.shareLink}
        </label>
        <div className="sharebox__row">
          <input
            id="share-link"
            className="sharebox__input"
            type="text"
            readOnly
            value={link}
            onFocus={(e) => e.currentTarget.select()}
          />
          <button
            type="button"
            className="btn"
            onClick={() => {
              track("share_link");
              void copy(link, t.actions.linkCopied);
            }}
          >
            {t.actions.copyLink}
          </button>
        </div>
      </div>

      <p className="results__year">{fmt(t.footer.dataYear, { year: result.year })}</p>

      <div className="actions">
        <button type="button" className="btn btn--soft" onClick={copyResult}>
          {t.actions.copy}
        </button>
        <button type="button" className="btn btn--soft" onClick={onReset}>
          {t.actions.reset}
        </button>
        <button
          type="button"
          className="btn btn--soft"
          onClick={() => {
            track("print");
            window.print();
          }}
        >
          {t.actions.print}
        </button>
      </div>
      {flash && (
        <p className="flash" role="status">
          {flash}
        </p>
      )}
    </section>
  );
}

function Tile({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={accent ? "tile tile--total" : "tile"}>
      <div className="tile__label">{label}</div>
      <div className="tile__value">{value}</div>
    </div>
  );
}
