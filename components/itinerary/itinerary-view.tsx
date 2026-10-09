"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight, Plus, Printer, Route, TriangleAlert } from "lucide-react";
import { Button, LinkButton } from "@/components/ui/button";
import { ProgressRing } from "@/components/ui/progress";
import { useNow, useTrip } from "@/components/providers/trip-store";
import { CityArt } from "@/components/shared/city-art";
import { ChipGroup } from "@/components/shared/chips";
import { useDeepLink } from "@/components/shared/use-deep-link";
import { DAYS } from "@/data/days";
import { mapsRouteUrl, resolveQuery } from "@/lib/maps";
import { formatDate, jstNow, tripPhase } from "@/lib/time";
import { currentTripDate, dayActivities, dayProgress, nextActivity } from "@/lib/trip";
import type { TripDay } from "@/lib/types";
import { pct } from "@/lib/utils";
import { ActivityCard } from "./activity-card";
import { AddActivityDialog } from "./add-activity-dialog";
import { DaySelector } from "./day-selector";

type Mode = "day" | "all";

export function ItineraryView() {
  const { state } = useTrip();
  const now = useNow();
  const [date, setDate] = useState<string>(DAYS[0].date);
  const [mode, setMode] = useState<Mode>("day");
  const [addOpen, setAddOpen] = useState(false);
  const [linked, setLinked] = useState(false);

  useDeepLink("itinerary", ({ day }) => {
    if (day && DAYS.some((d) => d.date === day)) {
      setDate(day);
      setMode("day");
      setLinked(true);
    }
  });

  // "Today" mode: during the trip, open on today's date (Japan time).
  useEffect(() => {
    if (now !== null && !linked) setDate(currentTripDate(now));
    // only on first clock tick
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [now === null]);

  const today = now !== null && tripPhase(now) === "during" ? jstNow(now).date : null;
  const upNextId = now !== null ? nextActivity(now, state)?.activity.id : undefined;

  const progress = useMemo(() => {
    const out: Record<string, number> = {};
    for (const d of DAYS) {
      const p = dayProgress(d.date, state);
      out[d.date] = pct(p.done, p.total);
    }
    return out;
  }, [state]);

  const idx = DAYS.findIndex((d) => d.date === date);
  const day = DAYS[idx] ?? DAYS[0];

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gold-ink">October 10 – 17, 2026</p>
          <h1 className="font-display text-[34px] leading-[1.05] sm:text-[42px]">Daily itinerary</h1>
        </div>
        <div className="flex items-center gap-1">
          <Link href="/print" className="grid size-11 place-items-center rounded-full text-ink-muted hover:bg-surface-2 hover:text-ink" aria-label="Print-friendly itinerary">
            <Printer className="size-5" />
          </Link>
        </div>
      </div>

      <ChipGroup
          label="View"
          value={mode}
          onChange={setMode}
          options={[
            { value: "day", label: "One day" },
            { value: "all", label: "All 8 days" },
          ]}
      />
      {mode === "day" && (
        <div className="sticky top-[calc(3.5rem+env(safe-area-inset-top))] z-30 -mx-4 bg-background/90 px-4 py-2 backdrop-blur-xl">
          <DaySelector value={day.date} onChange={setDate} today={today} progress={progress} />
        </div>
      )}

      <p className="rounded-2xl bg-blush/60 px-4 py-2.5 text-[13px] text-ink/80">
        All times are <strong className="font-semibold">suggestions</strong>, not confirmed reservations. Tap “Edit time” to change them.
      </p>

      {mode === "day" ? (
        <AnimatePresence mode="wait" initial={false}>
          <motion.section
            key={day.date}
            id="day-panel"
            role="tabpanel"
            aria-label={`${formatDate(day.date, { weekday: true })} — ${day.title}`}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.22 }}
          >
            <DaySection
              day={day}
              upNextId={upNextId}
              isToday={today === day.date}
              onAdd={() => setAddOpen(true)}
              onPrev={idx > 0 ? () => setDate(DAYS[idx - 1].date) : undefined}
              onNext={idx < DAYS.length - 1 ? () => setDate(DAYS[idx + 1].date) : undefined}
            />
          </motion.section>
        </AnimatePresence>
      ) : (
        <div className="space-y-12">
          {DAYS.map((d) => (
            <section key={d.date} aria-label={d.title}>
              <DaySection
                day={d}
                upNextId={upNextId}
                isToday={today === d.date}
                onAdd={() => {
                  setDate(d.date);
                  setAddOpen(true);
                }}
              />
            </section>
          ))}
        </div>
      )}

      <AddActivityDialog open={addOpen} onOpenChange={setAddOpen} date={day.date} />
    </div>
  );
}

function DaySection({
  day,
  upNextId,
  isToday,
  onAdd,
  onPrev,
  onNext,
}: {
  day: TripDay;
  upNextId?: string;
  isToday: boolean;
  onAdd: () => void;
  onPrev?: () => void;
  onNext?: () => void;
}) {
  const { state } = useTrip();
  const list = dayActivities(day.date, state);
  const p = dayProgress(day.date, state);
  const percent = pct(p.done, p.total);
  const route = mapsRouteUrl(
    list
      .filter((a) => a.location && a.category !== "hotel")
      .map((a) => resolveQuery(a.location!.query, state.hotels))
      .filter((q): q is string => !!q)
  );

  return (
    <div className="space-y-5">
      <div className="relative overflow-hidden rounded-[28px] shadow-lift">
        <CityArt city={day.art} photoKey={day.date} className="aspect-[16/10] w-full sm:aspect-[21/8]" label={`${day.cityLabel} illustration`} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-5 text-white">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/80">
              Day {day.dayNumber} · {formatDate(day.date, { weekday: true })}
              {isToday && <span className="ml-2 rounded-full bg-sakura px-2 py-0.5 text-charcoal">Today</span>}
            </p>
            <h2 className="mt-1 font-display text-[30px] leading-[1.05] sm:text-[38px]">{day.title}</h2>
            <p className="mt-1 text-[13px] text-white/85">
              {day.cityLabel} · {day.theme}
            </p>
          </div>
          <ProgressRing value={percent} size={58} className="shrink-0 text-white" />
        </div>
        {(onPrev || onNext) && (
          <div className="absolute right-3 top-3 flex gap-2">
            <button type="button" onClick={onPrev} disabled={!onPrev} className="grid size-10 place-items-center rounded-full bg-black/30 text-white backdrop-blur disabled:opacity-30" aria-label="Previous day">
              <ChevronLeft className="size-5" />
            </button>
            <button type="button" onClick={onNext} disabled={!onNext} className="grid size-10 place-items-center rounded-full bg-black/30 text-white backdrop-blur disabled:opacity-30" aria-label="Next day">
              <ChevronRight className="size-5" />
            </button>
          </div>
        )}
      </div>

      {day.alerts && day.alerts.length > 0 && (
        <ul className="space-y-2">
          {day.alerts.map((t) => (
            <li key={t} className="flex gap-2.5 rounded-2xl border border-gold/40 bg-gold/10 px-4 py-3 text-[13.5px] leading-relaxed">
              <TriangleAlert className="mt-0.5 size-4 shrink-0 text-gold-ink" aria-hidden />
              {t}
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-auto text-sm text-ink-muted">
          {p.done} of {p.total} done · {percent}%
        </span>
        {route && (
          <LinkButton href={route} variant="outline" size="sm">
            <Route /> Route in Maps
          </LinkButton>
        )}
        <Button variant="sakura" size="sm" onClick={onAdd}>
          <Plus /> Add activity
        </Button>
      </div>

      <ol className="relative" aria-label={`Timeline for ${day.title}`}>
        {list.map((a, i) => (
          <ActivityCard key={a.id} a={a} upNext={a.id === upNextId} isLast={i === list.length - 1} />
        ))}
      </ol>
    </div>
  );
}
