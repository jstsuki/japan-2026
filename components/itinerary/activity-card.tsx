"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Clock, ExternalLink, Info, MapPin, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, LinkButton } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input, Label } from "@/components/ui/input";
import { useTrip } from "@/components/providers/trip-store";
import { CATEGORY_META, RESERVATION_META } from "@/components/shared/meta";
import { FavButton, NoteField, VerifyBadge } from "@/components/shared/bits";
import { PlaceActions } from "@/components/shared/place-actions";
import { formatDuration, formatTime } from "@/lib/time";
import { STATUS_LABEL, reservationStatus, type MergedActivity } from "@/lib/trip";
import { cn } from "@/lib/utils";
import Link from "next/link";

export function ActivityCard({ a, upNext, isLast }: { a: MergedActivity; upNext?: boolean; isLast?: boolean }) {
  const { state, patch, toggle, removeCustom } = useTrip();
  const [editing, setEditing] = useState(false);
  const [start, setStart] = useState(a.start);
  const [end, setEnd] = useState(a.end ?? "");
  const meta = CATEGORY_META[a.category] ?? CATEGORY_META.experience;
  const Icon = meta.icon;
  const duration = formatDuration(a.start, a.end);
  const res = RESERVATION_META[a.reservation];
  const bookingStatus = a.reservationId ? reservationStatus(a.reservationId, state) : null;

  const saveTimes = () => {
    patch(a.id, { start: start || a.start, end: end });
    setEditing(false);
  };

  return (
    <motion.li
      id={a.id}
      layout="position"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="relative grid grid-cols-[62px_1fr] gap-3 sm:grid-cols-[84px_1fr]"
    >
      {/* time rail */}
      <div className="relative flex flex-col items-end pr-2.5 pt-4 text-right">
        <span className={cn("font-display text-[18px] leading-none tabular-nums", a.done ? "text-ink-faint" : "text-ink")}>
          {formatTime(a.start).split(" ")[0]}
        </span>
        <span className="mt-0.5 text-[10px] font-semibold tracking-[0.12em] text-ink-muted">{formatTime(a.start).split(" ")[1]}</span>
        {a.end && <span className="mt-1.5 whitespace-nowrap text-[10.5px] leading-tight tabular-nums text-ink-faint">– {formatTime(a.end)}</span>}
        {a.openEnded && <span className="mt-1.5 text-[11px] text-ink-faint">onward</span>}
        <span className={cn("absolute -right-[9px] top-[18px] z-10 size-2.5 rounded-full ring-4 ring-background", meta.dot)} aria-hidden />
        {!isLast && <span className="absolute -right-[5px] top-7 h-[calc(100%-4px)] w-px bg-line" aria-hidden />}
      </div>

      <article
        className={cn(
          "mb-3 min-w-0 rounded-3xl border bg-surface p-4 shadow-soft transition-all duration-300 sm:p-5",
          upNext ? "border-sakura ring-4 ring-sakura/20" : "border-line",
          a.done && "opacity-70"
        )}
      >
        <div className="-mr-2 -mt-2 flex items-center gap-1.5">
          <span className={cn("grid size-8 shrink-0 place-items-center rounded-full", meta.chip)} title={meta.label}>
            <Icon className="size-4" aria-hidden />
            <span className="sr-only">{meta.label}</span>
          </span>
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1">
            {upNext && <Badge variant="ink">Up next</Badge>}
            {a.tentative && <Badge variant="gold">Tentative</Badge>}
            {a.optional && <Badge variant="outline">Optional</Badge>}
            {a.custom && <Badge variant="blush">Yours</Badge>}
            {a.edited && <Badge variant="outline">Edited</Badge>}
          </div>
          <FavButton active={a.fav} onToggle={() => toggle(a.id, "fav")} label={a.title} />
          <Checkbox checked={a.done} onChange={() => toggle(a.id, "done")} label={`Mark “${a.title}” as done`} />
        </div>
        <h3 className={cn("mt-0.5 text-[17px] font-semibold leading-snug text-ink", a.done && "line-through decoration-ink-faint")}>{a.title}</h3>

        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-ink-muted">
          {duration && (
            <span className="inline-flex items-center gap-1">
              <Clock className="size-3.5" /> {duration}
            </span>
          )}
          {a.location && (
            <span className="inline-flex min-w-0 items-center gap-1">
              <MapPin className="size-3.5 shrink-0" /> <span className="truncate">{a.location.name}</span>
            </span>
          )}
        </div>

        {a.description && <p className="mt-2 text-[14.5px] leading-relaxed text-ink/85">{a.description}</p>}

        {a.tags && a.tags.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {a.tags.map((t) => (
              <li key={t}>
                <Badge variant="blush">{t}</Badge>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          {a.reservation !== "none" && <Badge variant={res.variant}>{res.label}</Badge>}
          {bookingStatus && (
            <Link href={`/reservations?focus=${a.reservationId}`} className="inline-flex">
              <Badge variant={bookingStatus === "booked" || bookingStatus === "completed" ? "matcha" : "outline"}>
                Booking: {STATUS_LABEL[bookingStatus]}
              </Badge>
            </Link>
          )}
          {a.verify && <VerifyBadge />}
        </div>

        {a.notes && a.notes.length > 0 && (
          <ul className="mt-3 space-y-1.5 rounded-2xl bg-gold/10 p-3 text-[13px] leading-relaxed text-ink/90">
            {a.notes.map((n) => (
              <li key={n} className="flex gap-2">
                <Info className="mt-0.5 size-3.5 shrink-0 text-gold-ink" aria-hidden />
                <span>{n}</span>
              </li>
            ))}
          </ul>
        )}

        {a.location?.address && <p className="mt-2 text-xs text-ink-muted">Address: {a.location.address}</p>}

        {a.links && a.links.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {a.links.map((l) => (
              <LinkButton key={l.url} href={l.url} size="sm" variant="soft">
                <ExternalLink /> {l.label}
              </LinkButton>
            ))}
          </div>
        )}

        {a.location && <PlaceActions place={a.location} className="mt-3" />}

        <div className="mt-3 border-t border-line pt-3">
          <NoteField value={a.note} onSave={(v) => patch(a.id, { note: v })} />
        </div>

        <div className="mt-1 flex flex-wrap items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => {
              setStart(a.start);
              setEnd(a.end ?? "");
              setEditing((e) => !e);
            }}
            aria-expanded={editing}
          >
            <Pencil /> Edit time
          </Button>
          {a.custom && (
            <Button
              variant="ghost"
              size="sm"
              className="text-rose-700 dark:text-rose-300"
              onClick={() => window.confirm(`Delete “${a.title}”?`) && removeCustom(a.id)}
            >
              <Trash2 /> Delete
            </Button>
          )}
        </div>

        {editing && (
          <div className="mt-2 grid grid-cols-2 gap-3 rounded-2xl bg-surface-2/60 p-3">
            <div className="space-y-1">
              <Label htmlFor={`${a.id}-start`}>Start</Label>
              <Input id={`${a.id}-start`} type="time" value={start} onChange={(e) => setStart(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label htmlFor={`${a.id}-end`}>End</Label>
              <Input id={`${a.id}-end`} type="time" value={end} onChange={(e) => setEnd(e.target.value)} />
            </div>
            <div className="col-span-2 flex flex-wrap gap-2">
              <Button size="sm" onClick={saveTimes}>
                Save times
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  patch(a.id, { start: undefined, end: undefined });
                  setEditing(false);
                }}
              >
                Restore suggested
              </Button>
            </div>
            <p className="col-span-2 text-[11px] text-ink-muted">Suggested times only — not confirmed reservations.</p>
          </div>
        )}
      </article>
    </motion.li>
  );
}
