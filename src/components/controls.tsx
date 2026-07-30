import type { ReactNode } from "react";
import { useId } from "react";

// Small accessible form primitives shared across the calculator. Styling is provided by the
// design-system CSS; these only supply structure, labels, and ARIA wiring.

export function Field({
  label,
  hint,
  htmlFor,
  optional,
  children,
}: {
  label: string;
  hint?: string;
  htmlFor?: string;
  optional?: string;
  children: ReactNode;
}) {
  return (
    <div className="field">
      <label className="field__label" htmlFor={htmlFor}>
        {label}
        {optional && <span className="field__optional">{optional}</span>}
      </label>
      {children}
      {hint && <p className="field__hint">{hint}</p>}
    </div>
  );
}

export function NumberField({
  label,
  hint,
  optional,
  value,
  onChange,
  min = 0,
  max,
  suffix,
}: {
  label: string;
  hint?: string;
  optional?: string;
  value: number | undefined;
  onChange: (n: number | undefined) => void;
  min?: number;
  max?: number;
  suffix?: string;
}) {
  const id = useId();
  return (
    <Field label={label} hint={hint} htmlFor={id} optional={optional}>
      <div className="num">
        <input
          id={id}
          className="num__input"
          type="number"
          inputMode="numeric"
          min={min}
          max={max}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value === "" ? undefined : Number(e.target.value))}
        />
        {suffix && <span className="num__suffix">{suffix}</span>}
      </div>
    </Field>
  );
}

export interface Option<T extends string> {
  value: T;
  label: string;
}

export function SelectField<T extends string>({
  label,
  hint,
  value,
  options,
  onChange,
}: {
  label: string;
  hint?: string;
  value: T;
  options: Option<T>[];
  onChange: (v: T) => void;
}) {
  const id = useId();
  return (
    <Field label={label} hint={hint} htmlFor={id}>
      <select id={id} className="select" value={value} onChange={(e) => onChange(e.target.value as T)}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </Field>
  );
}

export function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: Option<T>[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="field" role="group" aria-label={label}>
      <span className="field__label">{label}</span>
      <div className="segmented">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            className="segmented__option"
            aria-pressed={value === o.value}
            onClick={() => onChange(o.value)}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (b: boolean) => void;
}) {
  const id = useId();
  return (
    <div className="toggle">
      <input
        id={id}
        type="checkbox"
        className="toggle__input"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <label htmlFor={id} className="toggle__label">
        {label}
      </label>
    </div>
  );
}
