"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, CalendarDays, Clock, Map, MapPin, ShoppingBag, Ticket, UtensilsCrossed } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useNow, useTrip } from "@/components/providers/trip-store";
import { CityArt } from "@/components/shared/city-art";
import { PlaceActions } from "@/components/shared/place-actions";
import { CATEGORY_META } from "@/components/shared/meta";
import { DAYS } from "@/data/days";
import { RESERVATIONS } from "@/data/reservations";
import { countdownParts, formatDate, formatTime, jstNow, tripPhase } from "@/lib/time";
import { bookingProgress, dayProgress, foodProgress, getDay, nextActivity, reservationStatus, shoppingProgress } from "@/lib/trip";
import { cn, pct } from "@/lib/utils";

const ROUTE = ["Osaka", "Kyoto", "Tokyo", "Osaka"];

export function Dashboard() {
  const { state, hydrated } = useTrip();
  const now = useNow();
  const phase = now !== null ? tripPhase(now) : null;
  const jst = now !== null ? jstNow(now) : null;
  const todayDay = phase === "during" && jst ? getDay(jst.date) : undefined;
  const next = now !== null ? nextActivity(now, state) : null;

  const bookings = bookingProgress(state);
  const food = foodProgress(state);
  const shopping = shoppingProgress(state);
  const todayProg = todayDay ? dayProgress(todayDay.date, state) : null;
  const pendingPriority = RESERVATIONS.filter((r) => r.priority === "highest" && reservationStatus(r.id, state) === "not-booked");

  return (
    <div className="space-y-6">
      {/* Hero */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-[32px] shadow-lift"
      >
        <CityArt city="japan" className="aspect-[1/1] w-full sm:aspect-[21/9]" label="Mountain, sun and cherry blossoms illustration" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#242424]/80 via-[#242424]/10 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-white/80">Travel journal · 日本</p>
          <h1 className="mt-2 font-display text-[56px] leading-[0.92] sm:text-[76px]">
            Japan <span className="italic text-[#F4DDE1]">2026</span>
          </h1>
          <p className="mt-3 text-[15px] text-white/90">October 10 – 17 · two travellers</p>
          <ol className="mt-4 flex flex-wrap items-center gap-1.5" aria-label="Route">
            {ROUTE.map((c, i) => (
              <li key={i} className="flex items-center gap-1.5">
                <span className="rounded-full bg-white/15 px-3 py-1 text-[13px] backdrop-blur">{c}</span>
                {i < ROUTE.length - 1 && <ArrowRight className="size-3.5 text-white/70" aria-hidden />}
              </li>
            ))}
          </ol>
        </div>
      </motion.section>

      {/* Status + next up */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-5">
          {phase === null ? (
            <div className="h-24 animate-pulse rounded-2xl bg-surface-2" />
          ) : phase === "before" ? (
            <Countdown ms={now!} />
          ) : phase === "during" ? (
            <div>
              <Badge variant="sakura">Trip in progress</Badge>
              {todayDay && (
                <>
                  <p className="mt-3 font-display text-3xl leading-tight">
                    Day {todayDay.dayNumber} · {todayDay.cityLabel}
                  </p>
                  <p className="text-sm text-ink-muted">{todayDay.title} — {todayDay.theme}</p>
                  {todayProg && (
                    <div className="mt-4 space-y-1.5">
                      <div className="flex justify-between text-xs text-ink-muted">
                        <span>Today’s progress</span>
                        <span>{pct(todayProg.done, todayProg.total)}%</span>
                      </div>
                      <Progress value={pct(todayProg.done, todayProg.total)} tone="matcha" label="Today’s progress" />
                    </div>
                  )}
                </>
              )}
            </div>
          ) : (
            <div>
              <Badge variant="matcha">Trip completed</Badge>
              <p className="mt-3 font-display text-3xl leading-tight">おかえりなさい — welcome home.</p>
              <p className="mt-1 text-sm text-ink-muted">Export your notes from Trip settings to keep them.</p>
            </div>
          )}
          <p className="mt-4 text-[11px] text-ink-faint">Times shown in Japan Standard Time (JST).</p>
        </Card>

        <Card className="p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold-ink">{next?.isToday ? "Up next today" : "Next on the plan"}</p>
          {next ? (
            <div className="mt-2">
              <div className="flex items-start gap-3">
                <NextIcon category={next.activity.category} />
                <div className="min-w-0">
                  <p className="text-[17px] font-semibold leading-snug">{next.activity.title}</p>
                  <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-sm text-ink-muted">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="size-3.5" />
                      {formatDate(next.day.date, { weekday: true })} · {formatTime(next.activity.start)}
                    </span>
                    {next.activity.location && (
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="size-3.5" /> {next.activity.location.name}
                      </span>
                    )}
                  </p>
                </div>
              </div>
              {next.activity.location && <PlaceActions place={next.activity.location} compact className="mt-4" />}
              <Link href={`/itinerary?day=${next.day.date}&focus=${next.activity.id}`} className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-ink underline-offset-4 hover:underline">
                Open in itinerary <ArrowRight className="size-3.5" />
              </Link>
            </div>
          ) : (
            <p className="mt-2 text-sm text-ink-muted">{phase === "after" ? "That’s a wrap." : "Everything is checked off."}</p>
          )}
        </Card>
      </div>

      {/* Progress */}
      <section aria-label="Trip progress" className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <ProgressCard href="/reservations" icon={Ticket} label="Bookings" done={bookings.done} total={bookings.total} tone="sakura" note="booked or completed" hydrated={hydrated} />
        <ProgressCard href="/food" icon={UtensilsCrossed} label="Food bucket list" done={food.done} total={food.total} tone="gold" note="tried" hydrated={hydrated} />
        <ProgressCard href="/shopping" icon={ShoppingBag} label="Shopping list" done={shopping.done} total={shopping.total} tone="matcha" note="visited" hydrated={hydrated} />
      </section>

      {/* Priority bookings */}
      {hydrated && pendingPriority.length > 0 && (
        <Card className="border-sakura/50 p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-sakura-ink">Priority</p>
              <h2 className="font-display text-2xl">Still to book</h2>
            </div>
            <Link href="/reservations" className="text-sm font-medium underline-offset-4 hover:underline">
              All bookings
            </Link>
          </div>
          <ul className="mt-3 divide-y divide-line">
            {pendingPriority.map((r) => (
              <li key={r.id}>
                <Link href={`/reservations?focus=${r.id}`} className="flex items-center justify-between gap-3 py-3">
                  <span className="min-w-0">
                    <span className="block truncate text-[15px] font-medium">{r.name}</span>
                    <span className="text-xs text-ink-muted">
                      {r.date ? formatDate(r.date, { weekday: true }) : "Flexible"}
                      {r.time ? ` · suggested ${formatTime(r.time)}` : ""}
                    </span>
                  </span>
                  <Badge variant="outline">Not booked</Badge>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Quick nav */}
      <section aria-label="Quick navigation">
        <h2 className="mb-3 font-display text-2xl">Jump to</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {[
            { href: "/itinerary", label: "Itinerary", sub: "8 days", icon: CalendarDays, cls: "bg-blush" },
            { href: "/map", label: "Maps", sub: "All places", icon: Map, cls: "bg-matcha/20" },
            { href: "/food", label: "Restaurants", sub: "Bucket list", icon: UtensilsCrossed, cls: "bg-sakura/25" },
            { href: "/shopping", label: "Shopping", sub: "By neighbourhood", icon: ShoppingBag, cls: "bg-gold/20" },
            { href: "/reservations", label: "Reservations", sub: "Status tracker", icon: Ticket, cls: "bg-surface-2" },
          ].map((q) => (
            <Link key={q.href} href={q.href} className={cn("group flex flex-col justify-between rounded-3xl p-4 transition-transform hover:-translate-y-0.5", q.cls)}>
              <q.icon className="size-5 text-ink" aria-hidden />
              <span className="mt-6">
                <span className="block text-[15px] font-semibold">{q.label}</span>
                <span className="text-xs text-ink-muted">{q.sub}</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Days overview */}
      <section aria-label="Days overview">
        <h2 className="mb-3 font-display text-2xl">The week</h2>
        <ul className="no-scrollbar -mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2">
          {DAYS.map((d) => {
            const p = dayProgress(d.date, state);
            const isToday = todayDay?.date === d.date;
            return (
              <li key={d.date} className="w-[220px] shrink-0 snap-start">
                <Link href={`/itinerary?day=${d.date}`} className={cn("block overflow-hidden rounded-3xl border bg-surface shadow-soft", isToday ? "border-sakura" : "border-line")}>
                  <CityArt city={d.art} photoKey={d.date} className="aspect-[16/9]" label={d.cityLabel} />
                  <div className="p-3.5">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-muted">
                      Day {d.dayNumber} · {formatDate(d.date)} {isToday && <span className="text-sakura-ink">· Today</span>}
                    </p>
                    <p className="mt-0.5 truncate font-display text-xl">{d.title}</p>
                    <p className="truncate text-xs text-ink-muted">{d.cityLabel}</p>
                    <Progress value={pct(p.done, p.total)} tone="matcha" className="mt-3 h-1.5" label={`${d.title} progress`} />
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}

function NextIcon({ category }: { category: keyof typeof CATEGORY_META }) {
  const m = CATEGORY_META[category];
  const Icon = m.icon;
  return (
    <span className={cn("grid size-11 shrink-0 place-items-center rounded-full", m.chip)}>
      <Icon className="size-5" aria-hidden />
    </span>
  );
}

function Countdown({ ms }: { ms: number }) {
  const c = countdownParts(ms);
  return (
    <div>
      <Badge variant="blush">Countdown</Badge>
      <div className="mt-3 flex items-end gap-4">
        {[
          ["days", c.days],
          ["hours", c.hours],
          ["min", c.minutes],
        ].map(([label, v]) => (
          <div key={label as string}>
            <p className="font-display text-[44px] leading-none tabular-nums">{v}</p>
            <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-ink-muted">{label}</p>
          </div>
        ))}
      </div>
      <p className="mt-3 text-sm text-ink-muted">until Day 1 begins in Osaka (midnight JST, Oct 10).</p>
    </div>
  );
}

function ProgressCard({
  href,
  icon: Icon,
  label,
  done,
  total,
  tone,
  note,
  hydrated,
}: {
  href: string;
  icon: typeof Ticket;
  label: string;
  done: number;
  total: number;
  tone: "sakura" | "gold" | "matcha";
  note: string;
  hydrated: boolean;
}) {
  const v = pct(done, total);
  return (
    <Link href={href} className="block rounded-3xl border border-line bg-surface p-4 shadow-soft transition-transform hover:-translate-y-0.5">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 text-sm font-medium">
          <Icon className="size-4 text-ink-muted" aria-hidden /> {label}
        </span>
        <span className="font-display text-2xl tabular-nums">{hydrated ? `${v}%` : "–"}</span>
      </div>
      <Progress value={hydrated ? v : 0} tone={tone} className="mt-3" label={`${label} progress`} />
      <p className="mt-2 text-xs text-ink-muted">
        {done} of {total} {note}
      </p>
    </Link>
  );
}
