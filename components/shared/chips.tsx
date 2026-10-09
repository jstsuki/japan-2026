"use client";

import { cn } from "@/lib/utils";

export interface ChipOption<T extends string> {
  value: T;
  label: string;
  count?: number;
}

/** Horizontally scrolling single-select filter chips. */
export function ChipGroup<T extends string>({
  options,
  value,
  onChange,
  label,
  className,
}: {
  options: ChipOption<T>[];
  value: T;
  onChange: (v: T) => void;
  label: string;
  className?: string;
}) {
  return (
    <div role="radiogroup" aria-label={label} className={cn("no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1", className)}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.value)}
            className={cn(
              "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-3.5 text-[13px] font-medium transition-colors",
              active ? "border-ink bg-ink text-background" : "border-line bg-surface text-ink-muted hover:text-ink"
            )}
          >
            {o.label}
            {o.count !== undefined && <span className={cn("text-[11px]", active ? "opacity-70" : "opacity-60")}>{o.count}</span>}
          </button>
        );
      })}
    </div>
  );
}

/** On/off filter pill. */
export function ToggleChip({ pressed, onChange, children }: { pressed: boolean; onChange: (v: boolean) => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={() => onChange(!pressed)}
      className={cn(
        "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-3.5 text-[13px] font-medium transition-colors [&_svg]:size-3.5",
        pressed ? "border-sakura bg-sakura/25 text-ink" : "border-line bg-surface text-ink-muted hover:text-ink"
      )}
    >
      {children}
    </button>
  );
}
