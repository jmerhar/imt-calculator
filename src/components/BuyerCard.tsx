import { useI18n } from "@/i18n";
import type { Buyer, IntendedUse, BuyerType, Residency, NonResidentException } from "@/engine/types";
import { NumberField, Segmented, SelectField, Toggle } from "@/components/controls";

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

      <div className="buyer__grid">
        <NumberField
          label={t.form.share}
          value={sharePct}
          suffix="%"
          min={0}
          onChange={(n) => onChange({ share: (n ?? 0) / 100 })}
        />

        <Segmented<BuyerType>
          label={t.form.buyerType}
          value={buyer.type}
          onChange={(type) => onChange({ type, taxHaven: type === "individual" ? false : buyer.taxHaven })}
          options={[
            { value: "individual", label: t.form.typeIndividual },
            { value: "entity", label: t.form.typeEntity },
          ]}
        />

        <Segmented<Residency>
          label={t.form.residency}
          value={buyer.residency}
          onChange={(residency) => onChange({ residency })}
          options={[
            { value: "resident", label: t.form.residencyResident },
            { value: "non_resident", label: t.form.residencyNonResident },
          ]}
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

        {buyer.type === "entity" && (
          <Toggle
            label={t.form.taxHaven}
            checked={buyer.taxHaven}
            onChange={(taxHaven) => onChange({ taxHaven })}
          />
        )}

        {intendedUse === "own_permanent" && (
          <Toggle label={t.form.jovem} checked={buyer.jovem} onChange={(jovem) => onChange({ jovem })} />
        )}
      </div>
    </div>
  );
}
