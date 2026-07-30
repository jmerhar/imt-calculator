import { useEffect, useMemo, useRef, useState } from "react";
import { useI18n } from "@/i18n";
import type {
  Buyer,
  CalcInput,
  IntendedUse,
  Location,
  MortgageTerm,
} from "@/engine/types";
import { calculate } from "@/engine/imt";
import { AVAILABLE_YEARS } from "@/engine/tables";
import { defaultBuyer, defaultInput } from "@/state/defaults";
import { readStateFromUrl, writeStateToUrl } from "@/state/url";
import { track, priceBand, rateBand } from "@/analytics";
import { NumberField, Segmented, SelectField, Toggle } from "@/components/controls";
import { BuyerCard } from "@/components/BuyerCard";
import { ResultsPanel } from "@/components/ResultsPanel";

/** True if the current URL arrived with a share token. */
function arrivalKind(): "none" | "ok" | "bad" {
  if (typeof window === "undefined" || !/[?&]c=/.test(window.location.hash)) return "none";
  return readStateFromUrl() ? "ok" : "bad";
}

/** Distribute shares equally, giving the last buyer the rounding remainder so they sum to 1. */
function equalShares(buyers: Buyer[]): Buyer[] {
  const n = buyers.length;
  if (n === 0) return buyers;
  const each = Number((1 / n).toFixed(4));
  return buyers.map((b, i) => ({
    ...b,
    share: i === n - 1 ? Number((1 - each * (n - 1)).toFixed(4)) : each,
  }));
}

export function CalculatorPage() {
  const { t } = useI18n();
  const [input, setInput] = useState<CalcInput>(() => readStateFromUrl() ?? defaultInput());
  const arrival = useRef(arrivalKind());
  const interacted = useRef(false);

  useEffect(() => {
    writeStateToUrl(input);
  }, [input]);

  // Report whether this visit opened a shared link (and whether that link was valid).
  useEffect(() => {
    if (arrival.current === "ok") track("arrived_via_share");
    else if (arrival.current === "bad") track("bad_share_link");
  }, []);

  const result = useMemo(() => calculate(input), [input]);

  // A single, debounced "calculate" event once the user pauses — one event per scenario, not per
  // keystroke — with coarse, non-identifying parameters describing what was computed.
  useEffect(() => {
    if (!interacted.current || input.price <= 0) return;
    const id = setTimeout(() => {
      track("calculate", {
        intended_use: input.intendedUse,
        location: input.location,
        year: input.year,
        buyer_count: input.buyers.length,
        has_non_resident: input.buyers.some((b) => b.residency === "non_resident"),
        has_entity: input.buyers.some((b) => b.type === "entity"),
        has_tax_haven: input.buyers.some((b) => b.taxHaven),
        has_jovem: input.buyers.some((b) => b.jovem),
        has_mortgage: input.mortgage != null,
        has_vpt: input.vpt != null && input.vpt > 0,
        price_band: priceBand(result.taxBase),
        rate_band: rateBand(result.effectiveRate),
        shares_valid: !result.warnings.includes("shares_not_100"),
        value: result.grandTotal,
      });
    }, 1500);
    return () => clearTimeout(id);
  }, [input, result]);

  const touch = () => {
    interacted.current = true;
  };
  const update = (patch: Partial<CalcInput>) => {
    touch();
    setInput((prev) => ({ ...prev, ...patch }));
  };
  const updateBuyer = (i: number, patch: Partial<Buyer>) => {
    touch();
    setInput((prev) => ({
      ...prev,
      buyers: prev.buyers.map((b, j) => (j === i ? { ...b, ...patch } : b)),
    }));
  };
  const addBuyer = () => {
    touch();
    setInput((prev) => ({ ...prev, buyers: equalShares([...prev.buyers, defaultBuyer()]) }));
  };
  const removeBuyer = (i: number) => {
    touch();
    setInput((prev) => ({ ...prev, buyers: equalShares(prev.buyers.filter((_, j) => j !== i)) }));
  };
  const reset = () => {
    track("reset");
    setInput(defaultInput());
  };

  const mortgageOn = input.mortgage != null;

  return (
    <div className="calculator">
      <form className="panel form" onSubmit={(e) => e.preventDefault()}>
        <h2 className="panel__title">{t.form.heading}</h2>

        <div className="form__cols">
          {AVAILABLE_YEARS.length > 1 && (
            <div className="form__span">
              <SelectField
                label={t.form.year}
                value={String(input.year)}
                onChange={(v) => update({ year: Number(v) })}
                options={AVAILABLE_YEARS.map((y) => ({ value: String(y), label: String(y) }))}
              />
            </div>
          )}

          {/* Row order is column-major: location + intended use fill the left column,
              price + VPT the right, and the grid keeps the two rows aligned. */}
          <SelectField<Location>
            label={t.form.location}
            value={input.location}
            onChange={(location) => update({ location })}
            options={[
              { value: "mainland", label: t.form.locationMainland },
              { value: "azores", label: t.form.locationAzores },
              { value: "madeira", label: t.form.locationMadeira },
            ]}
          />

          <NumberField
            label={t.form.price}
            hint={t.form.priceHint}
            value={input.price}
            suffix="€"
            onChange={(n) => update({ price: n ?? 0 })}
          />

          <Segmented<IntendedUse>
            label={t.form.intendedUse}
            value={input.intendedUse}
            onChange={(intendedUse) => update({ intendedUse })}
            options={[
              { value: "own_permanent", label: t.form.useOwnPermanent },
              { value: "secondary", label: t.form.useSecondary },
            ]}
          />

          <NumberField
            label={t.form.vpt}
            hint={t.form.vptHint}
            optional={t.form.vptOptional}
            value={input.vpt}
            suffix="€"
            onChange={(n) => update({ vpt: n })}
          />
        </div>

        <div className="mortgage">
          <Toggle
            label={t.form.mortgageToggle}
            checked={mortgageOn}
            onChange={(on) =>
              update({ mortgage: on ? { amount: 200000, term: "ge5" } : undefined })
            }
          />
          {mortgageOn && input.mortgage && (
            <div className="mortgage__grid">
              <NumberField
                label={t.form.mortgageAmount}
                value={input.mortgage.amount}
                suffix="€"
                onChange={(n) => update({ mortgage: { ...input.mortgage!, amount: n ?? 0 } })}
              />
              <SelectField<MortgageTerm>
                label={t.form.mortgageTerm}
                value={input.mortgage.term}
                onChange={(term) => update({ mortgage: { ...input.mortgage!, term } })}
                options={[
                  { value: "ge5", label: t.form.termGe5 },
                  { value: "y1to5", label: t.form.termY1to5 },
                  { value: "lt1", label: t.form.termLt1 },
                ]}
              />
              {input.mortgage.term === "lt1" && (
                <NumberField
                  label={t.form.mortgageMonths}
                  min={1}
                  value={input.mortgage.months ?? 1}
                  onChange={(n) => update({ mortgage: { ...input.mortgage!, months: n ?? 1 } })}
                />
              )}
            </div>
          )}
        </div>

        <div className="buyers">
          <h2 className="panel__title">{t.form.buyers}</h2>
          {input.buyers.map((b, i) => (
            <BuyerCard
              key={i}
              buyer={b}
              index={i}
              intendedUse={input.intendedUse}
              canRemove={input.buyers.length > 1}
              onChange={(patch) => updateBuyer(i, patch)}
              onRemove={() => removeBuyer(i)}
            />
          ))}
          <button type="button" className="btn btn--ghost" onClick={addBuyer}>
            + {t.form.addBuyer}
          </button>
        </div>
      </form>

      <div className="panel panel--results">
        <ResultsPanel input={input} result={result} onReset={reset} />
      </div>
    </div>
  );
}
