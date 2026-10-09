"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, Search, ShoppingBag, Ticket, UtensilsCrossed } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useTrip } from "@/components/providers/trip-store";
import { FOOD } from "@/data/food";
import { RESERVATIONS } from "@/data/reservations";
import { SHOPS } from "@/data/shopping";
import { allActivities, CITY_LABEL } from "@/lib/trip";
import { formatDate, formatTime } from "@/lib/time";

type Kind = "activity" | "food" | "shop" | "booking";
interface Result {
  id: string;
  kind: Kind;
  title: string;
  sub: string;
  text: string;
  href: string;
  detail: { section: string; day?: string; focus: string };
}

const KIND_ICON = { activity: CalendarDays, food: UtensilsCrossed, shop: ShoppingBag, booking: Ticket };
const KIND_LABEL = { activity: "Itinerary", food: "Food", shop: "Shopping", booking: "Booking" };

export const NAVIGATE_EVENT = "trip:navigate";
export interface NavigateDetail {
  section: string;
  day?: string;
  focus?: string;
}

export function SearchDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const { state } = useTrip();
  const router = useRouter();
  const [q, setQ] = useState("");

  const index = useMemo<Result[]>(() => {
    const out: Result[] = [];
    for (const a of allActivities(state)) {
      out.push({
        id: a.id,
        kind: "activity",
        title: a.title,
        sub: `${formatDate(a.date, { weekday: true })} · ${formatTime(a.start)} · ${CITY_LABEL[a.city]}`,
        text: [a.title, a.description, a.location?.name, a.tags?.join(" "), a.notes?.join(" "), a.note, CITY_LABEL[a.city]].join(" "),
        href: `/itinerary?day=${a.date}&focus=${a.id}`,
        detail: { section: "itinerary", day: a.date, focus: a.id },
      });
    }
    for (const f of FOOD) {
      out.push({
        id: f.id,
        kind: "food",
        title: f.venue ? `${f.name} · ${f.venue}` : f.name,
        sub: `${CITY_LABEL[f.city]} · ${f.neighborhood}`,
        text: [f.name, f.venue, f.neighborhood, f.dishes.join(" "), CITY_LABEL[f.city], state.items[f.id]?.note].join(" "),
        href: `/food?focus=${f.id}`,
        detail: { section: "food", focus: f.id },
      });
    }
    for (const s of SHOPS) {
      out.push({
        id: s.id,
        kind: "shop",
        title: s.name,
        sub: `${s.city === "multi" ? "Multiple cities" : CITY_LABEL[s.city]} · ${s.neighborhood}`,
        text: [s.name, s.neighborhood, s.tip, s.categories.join(" "), state.items[s.id]?.note].join(" "),
        href: `/shopping?focus=${s.id}`,
        detail: { section: "shopping", focus: s.id },
      });
    }
    for (const r of RESERVATIONS) {
      out.push({
        id: r.id,
        kind: "booking",
        title: r.name,
        sub: `${r.date ? formatDate(r.date, { weekday: true }) : "Flexible"}${r.time ? " · " + formatTime(r.time) : ""}`,
        text: [r.name, r.location.name, r.tip, state.items[r.id]?.note, state.items[r.id]?.confirmation].join(" "),
        href: `/reservations?focus=${r.id}`,
        detail: { section: "reservations", focus: r.id },
      });
    }
    return out;
  }, [state]);

  const results = useMemo(() => {
    const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
    if (!terms.length) return [];
    return index.filter((r) => {
      const hay = r.text.toLowerCase();
      return terms.every((t) => hay.includes(t));
    }).slice(0, 40);
  }, [q, index]);

  const go = (r: Result) => {
    onOpenChange(false);
    setQ("");
    router.push(r.href);
    window.setTimeout(() => window.dispatchEvent(new CustomEvent<NavigateDetail>(NAVIGATE_EVENT, { detail: r.detail })), 150);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} title="Search the trip" description="Activities, food, shopping and bookings.">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-faint" />
        <Input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Try “matcha”, “Ginza”, “tattoo”…"
          className="pl-10"
          aria-label="Search"
          type="search"
        />
      </div>
      <ul className="mt-4 space-y-1" aria-live="polite">
        {q && results.length === 0 && <li className="py-6 text-center text-sm text-ink-muted">Nothing matches “{q}”.</li>}
        {results.map((r) => {
          const Icon = KIND_ICON[r.kind];
          return (
            <li key={`${r.kind}-${r.id}`}>
              <button type="button" onClick={() => go(r)} className="flex w-full items-center gap-3 rounded-2xl p-2.5 text-left hover:bg-surface-2">
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-blush text-ink">
                  <Icon className="size-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[15px] font-medium text-ink">{r.title}</span>
                  <span className="block truncate text-xs text-ink-muted">
                    {KIND_LABEL[r.kind]} · {r.sub}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </Dialog>
  );
}
