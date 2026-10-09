"use client";

import { useEffect, useRef } from "react";
import { DAYS } from "@/data/days";
import { shortWeekday } from "@/lib/time";
import { cn } from "@/lib/utils";

export function DaySelector({ value, onChange, today, progress }: { value: string; onChange: (d: string) => void; today: string | null; progress: Record<string, number> }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current?.querySelector<HTMLElement>(`[data-date="${value}"]`);
    el?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [value]);

  return (
    <div ref={ref} role="tablist" aria-label="Trip days" className="no-scrollbar -mx-4 flex snap-x gap-2 overflow-x-auto px-4 py-1">
      {DAYS.map((d) => {
        const active = d.date === value;
        const isToday = d.date === today;
        const p = progress[d.date] ?? 0;
        return (
          <button
            key={d.date}
            data-date={d.date}
            role="tab"
            aria-selected={active}
            aria-controls="day-panel"
            onClick={() => onChange(d.date)}
            className={cn(
              "relative flex w-[60px] shrink-0 snap-center flex-col items-center rounded-2xl border px-1.5 pb-1.5 pt-2 transition-all duration-200",
              active ? "border-ink bg-ink text-background shadow-lift" : "border-line bg-surface text-ink hover:border-ink-faint"
            )}
          >
            <span className={cn("text-[10px] font-semibold uppercase tracking-[0.16em]", active ? "opacity-70" : "text-ink-muted")}>{shortWeekday(d.date)}</span>
            <span className="font-display text-[23px] leading-none">{Number(d.date.slice(8))}</span>
            <span className={cn("mt-1 max-w-full truncate text-[10px]", active ? "opacity-80" : "text-ink-muted")}>{d.cityLabel.split(" ").pop()}</span>
            <span className="mt-1.5 h-1 w-8 overflow-hidden rounded-full bg-current/15" aria-hidden>
              <span className={cn("block h-full rounded-full", active ? "bg-sakura" : "bg-matcha")} style={{ width: `${p}%` }} />
            </span>
            {isToday && <span className="absolute -top-1.5 rounded-full bg-sakura px-1.5 text-[9px] font-bold uppercase tracking-wider text-charcoal">Today</span>}
          </button>
        );
      })}
    </div>
  );
}
