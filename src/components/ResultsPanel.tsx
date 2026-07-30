import { useState } from "react";
import { useI18n, fmt } from "@/i18n";
import type { ImtRule, CalcInput, CalcResult } from "@/engine/types";
import { formatEuro, formatPercent } from "@/format";
import { encodeState } from "@/state/url";

function ruleLabel(rule: ImtRule, t: ReturnType<typeof useI18n>["t"]): string {
  if (rule === "non_resident_7_5") return t.results.ruleNonResident;
  if (rule === "tax_haven_10") return t.results.ruleTaxHaven;
  return t.results.ruleOrdinary;
}

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
  const [flash, setFlash] = useState<string | null>(null);

  const notify = (msg: string) => {
    setFlash(msg);
    window.setTimeout(() => setFlash(null), 2000);
  };

  const copy = async (text: string, msg: string) => {
    try {
      await navigator.clipboard.writeText(text);
      notify(msg);
    } catch {
      /* clipboard unavailable (e.g. insecure context) — silently ignore */
    }
  };

  const shareLink = () => {
    const url = `${window.location.origin}${window.location.pathname}#/?${encodeState(input)}`;
    void copy(url, t.actions.linkCopied);
  };

  const copyResult = () => {
    const lines = [
      `${t.results.taxBase}: ${formatEuro(result.taxBase, lang)}`,
      `${t.results.imt}: ${formatEuro(result.totalImt, lang)}`,
      `${t.results.stampDutyTransfer}: ${formatEuro(result.totalStampDutyTransfer, lang)}`,
    ];
    if (result.mortgageStampDuty > 0) {
      lines.push(`${t.results.stampDutyMortgage}: ${formatEuro(result.mortgageStampDuty, lang)}`);
    }
    lines.push(
      `${t.results.totalDue}: ${formatEuro(result.grandTotal, lang)}`,
      `${t.results.effectiveRate}: ${formatPercent(result.effectiveRate, lang)}`,
      `${t.results.calcId}: ${result.calcId}`,
    );
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
        <Tile label={t.results.stampDutyTransfer} value={formatEuro(result.totalStampDuty, lang)} />
        <Tile label={t.results.totalDue} value={formatEuro(result.grandTotal, lang)} accent />
      </div>

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
            <div className="breakdown__row" key={i}>
              <span className="breakdown__who">
                {t.form.buyer} {i + 1}
                <span className="tag">{ruleLabel(b.rule, t)}</span>
              </span>
              <span className="breakdown__val">{formatEuro(b.subtotal, lang)}</span>
              {b.reclaimDelta != null && b.reclaimDelta > 0 && (
                <span className="breakdown__reclaim">
                  {t.results.reclaimable}: {formatEuro(b.reclaimDelta, lang)}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {result.reclaimableTotal > 0 && <p className="note">{t.results.reclaimableNote}</p>}

      <div className="results__foot">
        <span className="calcid">
          {t.results.calcId}: <code>{result.calcId}</code>
        </span>
        <span className="results__year">{fmt(t.footer.dataYear, { year: result.year })}</span>
      </div>

      <div className="actions">
        <button type="button" className="btn" onClick={shareLink}>
          {t.actions.share}
        </button>
        <button type="button" className="btn" onClick={copyResult}>
          {t.actions.copy}
        </button>
        <button type="button" className="btn" onClick={onReset}>
          {t.actions.reset}
        </button>
        <button type="button" className="btn" onClick={() => window.print()}>
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
