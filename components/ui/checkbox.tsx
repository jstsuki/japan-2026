"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

/** Large-tap-target checkbox (44px hit area) with an accessible label. */
export function Checkbox({
  checked,
  onChange,
  label,
  className,
  tone = "matcha",
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  className?: string;
  tone?: "matcha" | "sakura";
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn("group grid size-11 shrink-0 place-items-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sakura", className)}
    >
      <span
        className={cn(
          "grid size-6 place-items-center rounded-full border-[1.5px] transition-all duration-200",
          checked
            ? tone === "matcha"
              ? "border-matcha bg-matcha text-white"
              : "border-sakura bg-sakura text-charcoal"
            : "border-ink-faint bg-surface group-hover:border-ink-muted"
        )}
      >
        <Check className={cn("size-3.5 transition-transform duration-200", checked ? "scale-100" : "scale-0")} strokeWidth={3} />
      </span>
    </button>
  );
}
