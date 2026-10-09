"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CalendarDays, Heart, MapPin, Navigation, Ticket } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { LinkButton } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useTrip } from "@/components/providers/trip-store";
import { ChipGroup, ToggleChip } from "@/components/shared/chips";
import { FavButton, NoteField, SectionHeader, VerifyBadge } from "@/components/shared/bits";
import { FOOD_ICON } from "@/components/shared/meta";
import { useDeepLink } from "@/components/shared/use-deep-link";
import { FOOD, FOOD_CATEGORIES, KONBINI } from "@/data/food";
import { mapsDirectionsUrl, mapsSearchUrl } from "@/lib/maps";
import { formatDate } from "@/lib/time";
import { CITY_LABEL, STATUS_LABEL, foodProgress, konbiniProgress, reservationStatus } from "@/lib/trip";
import type { CityKey, FoodCategory, FoodItem, KonbiniItem } from "@/lib/types";
import { cn, pct } from "@/lib/utils";

type CityFilter = "all" | CityKey;
type CatFilter = "all" | FoodCategory;
type VisitFilter = "all" | "todo" | "visited";

export function FoodView() {
  const { state } = useTrip();
  const [city, setCity] = useState<CityFilter>("all");
  const [cat, setCat] = useState<CatFilter>("all");
  const [visit, setVisit] = useState<VisitFilter>("all");
  const [needsRes, setNeedsRes] = useState(false);
  const [favs, setFavs] = useState(false);

  useDeepLink("food", ({ focus }) => {
    if (focus) {
      setCity("all");
      setCat("all");
      setVisit("all");
      setNeedsRes(false);
      setFavs(false);
    }
  });

  const filtered = useMemo(
    () =>
      FOOD.filter((f) => {
        const s = state.items[f.id];
        if (city !== "all" && f.city !== city) return false;
        if (cat !== "all" && f.category !== cat) return false;
        if (visit === "todo" && s?.done) return false;
        if (visit === "visited" && !s?.done) return false;
        if (needsRes && !f.reservationRequired) return false;
        if (favs && !s?.fav) return false;
        return true;
      }).sort((a, b) => (a.date ?? "9999").localeCompare(b.date ?? "9999")),
    [state, city, cat, visit, needsRes, favs]
  );

  const prog = foodProgress(state);
  const kProg = konbiniProgress(state);

  return (
    <div className="space-y-6">
      <SectionHeader eyebrow="Bucket list" title="Food guide" subtitle="Every dish on the wish list, when it’s planned, and where to find it." />

      <Card className="p-5">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-sm text-ink-muted">Tried so far</p>
            <p className="font-display text-4xl tabular-nums">
              {prog.done}
              <span className="text-xl text-ink-muted"> / {prog.total}</span>
            </p>
          </div>
          <p className="font-display text-3xl text-sakura-ink tabular-nums">{pct(prog.done, prog.total)}%</p>
        </div>
        <Progress value={pct(prog.done, prog.total)} className="mt-3" label="Food bucket-list progress" />
      </Card>

      <div className="space-y-2.5">
        <ChipGroup
          label="City"
          value={city}
          onChange={setCity}
          options={[
            { value: "all", label: "All cities" },
            { value: "osaka", label: "Osaka" },
            { value: "kyoto", label: "Kyoto" },
            { value: "tokyo", label: "Tokyo" },
          ]}
        />
        <ChipGroup
          label="Category"
          value={cat}
          onChange={setCat}
          options={[{ value: "all", label: "All food" }, ...(Object.keys(FOOD_CATEGORIES) as FoodCategory[]).map((c) => ({ value: c, label: FOOD_CATEGORIES[c] }))]}
        />
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
          <ChipGroup
            label="Visited"
            value={visit}
            onChange={setVisit}
            className="mx-0 px-0"
            options={[
              { value: "all", label: "All" },
              { value: "todo", label: "Not yet" },
              { value: "visited", label: "Visited" },
            ]}
          />
          <ToggleChip pressed={needsRes} onChange={setNeedsRes}>
            <Ticket /> Needs booking
          </ToggleChip>
          <ToggleChip pressed={favs} onChange={setFavs}>
            <Heart /> Favorites
          </ToggleChip>
        </div>
      </div>

      <p className="text-sm text-ink-muted" aria-live="polite">
        Showing {filtered.length} of {FOOD.length}
      </p>

      {filtered.length === 0 ? (
        <Card className="p-8 text-center text-sm text-ink-muted">No food matches these filters.</Card>
      ) : (
        <ul className="grid gap-3 md:grid-cols-2">
          {filtered.map((f) => (
            <FoodCard key={f.id} f={f} />
          ))}
        </ul>
      )}

      <section aria-labelledby="konbini" className="pt-4">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gold-ink">コンビニ</p>
            <h2 id="konbini" className="font-display text-3xl">Convenience-store snacks</h2>
            <p className="mt-1 text-sm text-ink-muted">7-Eleven, Lawson, FamilyMart and Mini Stop. Menus rotate — availability varies.</p>
          </div>
          <span className="font-display text-2xl tabular-nums">
            {kProg.done}/{kProg.total}
          </span>
        </div>
        <Progress value={pct(kProg.done, kProg.total)} tone="gold" className="mt-3" label="Konbini checklist progress" />
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {(["7-Eleven", "Lawson", "FamilyMart", "Mini Stop", "Any konbini"] as KonbiniItem["store"][]).map((store) => (
            <Card key={store} className="p-4">
              <h3 className="font-semibold">{store}</h3>
              <ul className="mt-1">
                {KONBINI.filter((k) => k.store === store).map((k) => (
                  <KonbiniRow key={k.id} k={k} />
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}

function KonbiniRow({ k }: { k: KonbiniItem }) {
  const { state, toggle } = useTrip();
  const done = !!state.items[k.id]?.done;
  return (
    <li className="-ml-2 flex items-center gap-1">
      <Checkbox checked={done} onChange={() => toggle(k.id, "done")} label={`Tried ${k.name}`} tone="sakura" />
      <span className={cn("text-[14.5px]", done && "text-ink-muted line-through")}>{k.name}</span>
    </li>
  );
}

function FoodCard({ f }: { f: FoodItem }) {
  const { state, toggle, patch } = useTrip();
  const s = state.items[f.id] ?? {};
  const Icon = FOOD_ICON[f.category];
  const status = f.reservationId ? reservationStatus(f.reservationId, state) : null;

  return (
    <li id={f.id}>
      <Card className={cn("h-full p-4 transition-opacity", s.done && "opacity-75")}>
        <div className="flex items-start gap-2">
          <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-full bg-sakura/25">
            <Icon className="size-4" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-muted">{FOOD_CATEGORIES[f.category]}</p>
            <h3 className={cn("text-[17px] font-semibold leading-snug", s.done && "line-through decoration-ink-faint")}>{f.name}</h3>
            {f.venue && <p className="text-sm text-ink">{f.venue}</p>}
          </div>
          <FavButton active={!!s.fav} onToggle={() => toggle(f.id, "fav")} label={f.name} />
          <Checkbox checked={!!s.done} onChange={() => toggle(f.id, "done")} label={`Mark ${f.name} as visited`} className="-mr-2" />
        </div>

        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[13px] text-ink-muted">
          <span className="inline-flex items-center gap-1">
            <MapPin className="size-3.5" /> {CITY_LABEL[f.city]} · {f.neighborhood}
          </span>
          {f.date ? (
            <Link href={`/itinerary?day=${f.date}`} className="inline-flex items-center gap-1 underline-offset-4 hover:underline">
              <CalendarDays className="size-3.5" /> {formatDate(f.date, { weekday: true })}
            </Link>
          ) : (
            <span className="inline-flex items-center gap-1">
              <CalendarDays className="size-3.5" /> Not scheduled
            </span>
          )}
        </div>

        <div className="mt-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted">Must try</p>
          <ul className="mt-1.5 flex flex-wrap gap-1.5">
            {f.dishes.map((d) => (
              <li key={d}>
                <Badge variant="blush">{d}</Badge>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {f.reservationRequired ? (
            status ? (
              <Link href={`/reservations?focus=${f.reservationId}`}>
                <Badge variant={status === "booked" || status === "completed" ? "matcha" : "danger"}>
                  <Ticket /> Reservation: {STATUS_LABEL[status]}
                </Badge>
              </Link>
            ) : (
              <Badge variant="danger">Reservation required</Badge>
            )
          ) : (
            <Badge>No reservation needed</Badge>
          )}
          {f.onceOnly && <Badge variant="gold">Once this trip</Badge>}
          {f.optional && <Badge variant="outline">Optional</Badge>}
          {f.verify && <VerifyBadge />}
        </div>

        {f.tip && <p className="mt-3 text-[13px] leading-relaxed text-ink/80">{f.tip}</p>}

        <div className="mt-3 flex flex-wrap gap-2">
          <LinkButton href={mapsDirectionsUrl(f.mapsQuery)} size="sm">
            <Navigation /> Directions
          </LinkButton>
          <LinkButton href={mapsSearchUrl(f.mapsQuery)} size="sm" variant="outline">
            <MapPin /> {f.venue ? "Map" : "Find nearby"}
          </LinkButton>
        </div>

        <div className="mt-3 border-t border-line pt-3">
          <NoteField value={s.note ?? ""} onSave={(v) => patch(f.id, { note: v })} />
        </div>
      </Card>
    </li>
  );
}
