import { useI18n } from "@/i18n";
import type { Buyer, IntendedUse, BuyerType, Residency, NonResidentException } from "@/engine/types";
import { NumberField, Segmented, SelectField, Toggle } from "@/components/controls";

/** One acquirer's inputs: share, type, residency (+ exception), tax-haven and IMT Jovem toggles. */
export function BuyerCard({
  buyer,
  index,
  intendedUse,
  canRemove,
  onChange,
  onRemove,
}: {
  buyer: Buyer;
  index: number;
  intendedUse: IntendedUse;
  canRemove: boolean;
  onChange: (patch: Partial<Buyer>) => void;
  onRemove: () => void;
}) {
  const { t } = useI18n();
  const sharePct = Number((buyer.share * 100).toFixed(2));

  return (
    <div className="buyer">
      <div className="buyer__head">
        <h3 className="buyer__title">
          {t.form.buyer} {index + 1}
        </h3>
        {canRemove && (
          <button
            type="button"
            className="buyer__remove"
            onClick={onRemove}
            aria-label={`${t.form.removeBuyer} — ${t.form.buyer} ${index + 1}`}
          >
            {t.form.removeBuyer}
          </button>
        )}
      </div>

      <div className="buyer__body">
        {/* Row 1: who the buyer is and where they are tax-resident. */}
        <div className="buyer__row buyer__row--pair">
          <Segmented<BuyerType>
            label={t.form.buyerType}
            value={buyer.type}
            onChange={(type) =>
              onChange({
                type,
                // Tax-haven applies to entities only; IMT Jovem to individuals only.
                taxHaven: type === "individual" ? false : buyer.taxHaven,
                jovem: type === "entity" ? false : buyer.jovem,
              })
            }
            options={[
              { value: "individual", label: t.form.typeIndividual },
              { value: "entity", label: t.form.typeEntity },
            ]}
          />

          <Segmented<Residency>
            label={t.form.residency}
            value={buyer.residency}
            // The non-resident exception is meaningful only while non-resident; clear it on the way
            // back to resident so no stale value survives in state or a shared link.
            onChange={(residency) =>
              onChange({ residency, ...(residency === "resident" ? { exception: "none" } : {}) })
            }
            options={[
              { value: "resident", label: t.form.residencyResident },
              { value: "non_resident", label: t.form.residencyNonResident },
            ]}
          />
        </div>

        {/* Row 2: a narrow share sits beside the wide non-resident-situation dropdown, so its long
            option labels fit inside the control rather than truncating. */}
        <div className="buyer__row buyer__row--share">
          <NumberField
            label={t.form.share}
            value={sharePct}
            suffix="%"
            min={0}
            max={100}
            onChange={(n) => onChange({ share: (n ?? 0) / 100 })}
          />

          {buyer.residency === "non_resident" && (
            <SelectField<NonResidentException>
              label={t.form.exception}
              value={buyer.exception}
              onChange={(exception) => onChange({ exception })}
              options={[
                { value: "none", label: t.form.exceptionNone },
                { value: "former_resident", label: t.form.exceptionFormerResident },
                { value: "becomes_resident", label: t.form.exceptionBecomesResident },
                { value: "accessible_rent", label: t.form.exceptionAccessibleRent },
              ]}
            />
          )}
        </div>

        {buyer.type === "entity" && (
          <Toggle
            label={t.form.taxHaven}
            checked={buyer.taxHaven}
            onChange={(taxHaven) => onChange({ taxHaven })}
          />
        )}

        {intendedUse === "own_permanent" && buyer.type === "individual" && (
          <Toggle label={t.form.jovem} checked={buyer.jovem} onChange={(jovem) => onChange({ jovem })} />
        )}
      </div>
    </div>
  );
}
