"use client";

import { useEffect, useState } from "react";
import { Heart, StickyNote, TriangleAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function VerifyBadge({ className }: { className?: string }) {
  return (
    <Badge variant="warn" className={className} title="Hours, prices or policies not verified — check before you go">
      <TriangleAlert /> Verify before visiting
    </Badge>
  );
}

export function FavButton({ active, onToggle, label }: { active: boolean; onToggle: () => void; label: string }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={active ? `Remove ${label} from favorites` : `Save ${label} to favorites`}
      onClick={onToggle}
      className="grid size-11 shrink-0 place-items-center rounded-full text-ink-muted transition-colors hover:text-sakura focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sakura"
    >
      <Heart className={cn("size-5 transition-all duration-200", active && "scale-110 fill-sakura text-sakura")} />
    </button>
  );
}

/** Expandable personal note. Saves on blur and after a short pause while typing. */
export function NoteField({ value, onSave, label = "Personal note", placeholder = "Add a note…" }: { value: string; onSave: (v: string) => void; label?: string; placeholder?: string }) {
  const [open, setOpen] = useState(!!value);
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    setDraft(value);
    if (value) setOpen(true);
  }, [value]);

  useEffect(() => {
    if (draft === value) return;
    const t = window.setTimeout(() => onSave(draft), 600);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft]);

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="inline-flex h-9 items-center gap-1.5 rounded-full px-1 text-[13px] text-ink-muted hover:text-ink">
        <StickyNote className="size-4" /> {placeholder}
      </button>
    );
  }
  return (
    <div className="space-y-1">
      <span className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.12em] text-ink-muted">
        <StickyNote className="size-3.5" /> {label}
      </span>
      <Textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => draft !== value && onSave(draft)}
        placeholder={placeholder}
        aria-label={label}
        className="min-h-[64px] bg-surface-2/60"
      />
    </div>
  );
}

export function SectionHeader({ eyebrow, title, subtitle, right }: { eyebrow?: string; title: string; subtitle?: string; right?: React.ReactNode }) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        {eyebrow && <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-gold-ink">{eyebrow}</p>}
        <h1 className="font-display text-[34px] leading-[1.05] text-ink sm:text-[42px]">{title}</h1>
        {subtitle && <p className="mt-2 max-w-xl text-[15px] text-ink-muted">{subtitle}</p>}
      </div>
      {right}
    </div>
  );
}

export function StatPill({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-2xl bg-surface-2/70 px-3.5 py-2.5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-muted">{label}</p>
      <p className="font-display text-2xl leading-tight text-ink">{value}</p>
      {sub && <p className="text-[11px] text-ink-muted">{sub}</p>}
    </div>
  );
}
