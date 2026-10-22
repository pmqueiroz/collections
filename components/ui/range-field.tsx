import type { ChangeEvent } from "react";

type RangeFieldProps = {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (value: number) => void;
};

export function RangeField({
  label,
  min,
  max,
  step,
  value,
  onChange,
}: RangeFieldProps) {
  const handle = (event: ChangeEvent<HTMLInputElement>) => {
    const next = Number.parseFloat(event.target.value);
    if (!Number.isNaN(next)) onChange(next);
  };
  return (
    <div className="grid h-12 grid-cols-[92px_minmax(0,1fr)_68px] items-center gap-3 border-b border-line regular:h-9">
      <div className="whitespace-nowrap mono text-tag uppercase text-muted">
        {label}
      </div>
      <input
        type="range"
        aria-label={label}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={handle}
        className="m-0 w-full accent-ink"
      />
      <input
        type="number"
        aria-label={label}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={handle}
        className="box-border h-8 w-full rounded-xs border border-line bg-surface px-1.5 text-right mono text-touch text-ink outline-none regular:h-6 regular:text-xs"
      />
    </div>
  );
}
