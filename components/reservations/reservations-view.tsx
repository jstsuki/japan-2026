"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Clock, ExternalLink, MapPin, Navigation } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useTrip } from "@/components/providers/trip-store";
import { ChipGroup } from "@/components/shared/chips";
import { NoteField, SectionHeader } from "@/components/shared/bits";
import { PlaceActions } from "@/components/shared/place-actions";
import { useDeepLink } from "@/components/shared/use-deep-link";
import { NO_BOOKING, RESERVATIONS } from "@/data/reservations";
import { mapsDirectionsUrl } from "@/lib/maps";
import { formatDate, formatTime } from "@/lib/time";
import { CITY_LABEL, STATUS_LABEL, bookingProgress, reservationStatus } from "@/lib/trip";
import type { ReservationItem, ReservationStatus } from "@/lib/types";
import { cn, pct } from "@/lib/utils";

const STATUSES: ReservationStatus[] = ["not-booked", "booked", "completed", "canceled"];
const STATUS_STYLE: Record<ReservationStatus, string> = {
  "not-booked": "bg-surface text-ink border-ink",
  booked: "bg-matcha text-white border-matcha",
  completed: "bg-ink text-background border-ink",
  canceled: "bg-rose-100 text-rose-900 border-rose-300 dark:bg-rose-400/20 dark:text-rose-100 dark:border-rose-400/40",
};

export function ReservationsView() {
  const { state } = useTrip();
  const [filter, setFilter] = useState<"all" | ReservationStatus>("all");

  useDeepLink("reservations", ({ focus }) => {
    if (focus) setFilter("all");
  });

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: RESERVATIONS.length };
    for (const s of STATUSES) c[s] = RESERVATIONS.filter((r) => reservationStatus(r.id, state) === s).length;
    return c;
  }, [state]);

  const list = RESERVATIONS.filter((r) => filter === "all" || reservationStatus(r.id, state) === filter);
  const prog = bookingProgress(state);
  const highest = list.filter((r) => r.priority === "highest");
  const secondary = list.filter((r) => r.priority === "secondary");

  return (
    <div className="space-y-6">
      <SectionHeader eyebrow="予約" title="Reservations" subtitle="Nothing is marked booked until you mark it. Add confirmation numbers as you go." />

      <Card className="p-5">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-sm text-ink-muted">Booked or completed</p>
            <p className="font-display text-4xl tabular-nums">
              {prog.done}
              <span className="text-xl text-ink-muted"> / {prog.total}</span>
            </p>
          </div>
          <p className="font-display text-3xl text-sakura-ink tabular-nums">{pct(prog.done, prog.total)}%</p>
        </div>
        <Progress value={pct(prog.done, prog.total)} className="mt-3" label="Reservation progress" />
        <div className="mt-4 grid grid-cols-4 gap-2 text-center">
          {STATUSES.map((s) => (
            <div key={s} className="rounded-2xl bg-surface-2/70 py-2">
              <p className="font-display text-2xl tabular-nums">{counts[s]}</p>
              <p className="text-[10px] uppercase tracking-[0.12em] text-ink-muted">{STATUS_LABEL[s]}</p>
            </div>
          ))}
        </div>
        <p className="mt-3 text-[11px] text-ink-faint">Canceled items don’t count toward the total.</p>
      </Card>

      <ChipGroup
        label="Filter by status"
        value={filter}
        onChange={setFilter}
        options={[{ value: "all", label: "All", count: counts.all }, ...STATUSES.map((s) => ({ value: s, label: STATUS_LABEL[s], count: counts[s] }))]}
      />

      {list.length === 0 && <Card className="p-8 text-center text-sm text-ink-muted">No bookings with this status.</Card>}

      {highest.length > 0 && (
        <section aria-labelledby="pri-high" className="space-y-3">
          <h2 id="pri-high" className="font-display text-2xl">
            Highest priority
          </h2>
          <ul className="grid gap-3 lg:grid-cols-2">
            {highest.map((r) => (
              <ReservationCard key={r.id} r={r} />
            ))}
          </ul>
        </section>
      )}

      {secondary.length > 0 && (
        <section aria-labelledby="pri-second" className="space-y-3">
          <h2 id="pri-second" className="font-display text-2xl">
            Secondary priority
          </h2>
          <ul className="grid gap-3 lg:grid-cols-2">
            {secondary.map((r) => (
              <ReservationCard key={r.id} r={r} />
            ))}
          </ul>
        </section>
      )}

      <section aria-labelledby="no-booking" className="space-y-3 pt-2">
        <div>
          <h2 id="no-booking" className="font-display text-2xl">
            No advance reservation normally needed
          </h2>
          <p className="text-sm text-ink-muted">Temples, markets, shopping — and My CUPNOODLES Factory’s same-day ticket system.</p>
        </div>
        <Card className="divide-y divide-line">
          {NO_BOOKING.map((n) => (
            <div key={n.id} className="flex items-center gap-3 p-4">
              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-medium">{n.name}</p>
                <p className="text-xs text-ink-muted">
                  {CITY_LABEL[n.city]}
                  {n.date ? ` · ${formatDate(n.date, { weekday: true })}` : ""} · {n.detail}
                </p>
              </div>
              <LinkButton href={mapsDirectionsUrl(n.mapsQuery)} size="icon-sm" variant="outline" aria-label={`Directions to ${n.name}`}>
                <Navigation />
              </LinkButton>
            </div>
          ))}
        </Card>
      </section>
    </div>
  );
}

function ReservationCard({ r }: { r: ReservationItem }) {
  const { state, patch } = useTrip();
  const s = state.items[r.id] ?? {};
  const status = reservationStatus(r.id, state);
  const [conf, setConf] = useState(s.confirmation ?? "");
  const [url, setUrl] = useState(s.url ?? "");

  useEffect(() => setConf(s.confirmation ?? ""), [s.confirmation]);
  useEffect(() => setUrl(s.url ?? ""), [s.url]);

  const bookingHref = s.url?.trim() || r.bookingUrl;
  const time = s.time || r.time;

  return (
    <li id={r.id}>
      <Card className={cn("h-full p-4 sm:p-5", status === "canceled" && "opacity-70")}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap gap-1.5">
              <Badge variant={r.priority === "highest" ? "sakura" : "outline"}>{r.priority === "highest" ? "Highest priority" : "Secondary"}</Badge>
              {r.optional && <Badge variant="outline">Optional</Badge>}
            </div>
            <h3 className="mt-1.5 text-[17px] font-semibold leading-snug">{r.name}</h3>
          </div>
          <Badge variant={status === "booked" ? "matcha" : status === "completed" ? "ink" : status === "canceled" ? "danger" : "default"} className="shrink-0">
            {STATUS_LABEL[status]}
          </Badge>
        </div>

        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[13px] text-ink-muted">
          <span className="inline-flex items-center gap-1">
            <CalendarDays className="size-3.5" /> {r.date ? formatDate(r.date, { weekday: true }) : "Flexible"}
          </span>
          {time && (
            <span className="inline-flex items-center gap-1">
              <Clock className="size-3.5" /> {formatTime(time)} <span className="text-ink-faint">(suggested)</span>
            </span>
          )}
          <span className="inline-flex items-center gap-1">
            <MapPin className="size-3.5" /> {r.location.name}
          </span>
        </div>

        {r.tip && <p className="mt-2 text-[13px] leading-relaxed text-ink/80">{r.tip}</p>}

        <fieldset className="mt-4">
          <legend className="mb-1.5 text-[11px] font-medium uppercase tracking-[0.12em] text-ink-muted">Status</legend>
          <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4" role="radiogroup" aria-label={`Status for ${r.name}`}>
            {STATUSES.map((st) => (
              <button
                key={st}
                type="button"
                role="radio"
                aria-checked={status === st}
                onClick={() => patch(r.id, { status: st })}
                className={cn(
                  "h-10 rounded-full border text-[13px] font-medium transition-colors",
                  status === st ? STATUS_STYLE[st] : "border-line bg-surface text-ink-muted hover:text-ink"
                )}
              >
                {STATUS_LABEL[st]}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="mt-3 grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label htmlFor={`${r.id}-conf`}>Confirmation #</Label>
            <Input
              id={`${r.id}-conf`}
              value={conf}
              onChange={(e) => setConf(e.target.value)}
              onBlur={() => conf !== (s.confirmation ?? "") && patch(r.id, { confirmation: conf.trim() })}
              placeholder="Add when booked"
              autoComplete="off"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor={`${r.id}-time`}>Time</Label>
            <Input id={`${r.id}-time`} type="time" value={time ?? ""} onChange={(e) => patch(r.id, { time: e.target.value })} />
          </div>
          <div className="col-span-2 space-y-1">
            <Label htmlFor={`${r.id}-url`}>Booking link</Label>
            <Input
              id={`${r.id}-url`}
              type="url"
              inputMode="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onBlur={() => url !== (s.url ?? "") && patch(r.id, { url: url.trim() })}
              placeholder={r.bookingUrl ?? "Paste your booking or confirmation link"}
            />
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {bookingHref && /^https?:\/\//i.test(bookingHref) && (
            <LinkButton href={bookingHref} size="sm" variant="sakura">
              <ExternalLink /> {s.url?.trim() ? "Your link" : r.bookingLabel ?? "Booking page"}
            </LinkButton>
          )}
        </div>
        <PlaceActions place={r.location} compact className="mt-2" />

        <div className="mt-3 border-t border-line pt-3">
          <NoteField value={s.note ?? ""} onSave={(v) => patch(r.id, { note: v })} />
        </div>
      </Card>
    </li>
  );
}
