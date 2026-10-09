"use client";

import { useMemo, useRef, useState } from "react";
import { ExternalLink, Eye, EyeOff, MapPin, Navigation, Route } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, LinkButton } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useTrip } from "@/components/providers/trip-store";
import { ChipGroup } from "@/components/shared/chips";
import { SectionHeader } from "@/components/shared/bits";
import { CopyButton } from "@/components/shared/place-actions";
import { PIN_META } from "@/components/shared/meta";
import { DAYS } from "@/data/days";
import { mapsDirectionsUrl, mapsEmbedUrl, mapsRouteUrl, mapsSearchUrl } from "@/lib/maps";
import { formatDate } from "@/lib/time";
import { CITY_LABEL, PIN_LABEL, buildPlaces, type MapPlace, type PinKind } from "@/lib/trip";
import type { CityKey } from "@/lib/types";
import { cn } from "@/lib/utils";

type Group = "day" | "kind";

export function MapView() {
  const { state } = useTrip();
  const [city, setCity] = useState<"all" | CityKey>("all");
  const [kind, setKind] = useState<"all" | PinKind>("all");
  const [group, setGroup] = useState<Group>("day");
  const [selected, setSelected] = useState<MapPlace | null>(null);
  const [showMap, setShowMap] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const select = (p: MapPlace) => {
    setSelected(p);
    if (window.matchMedia("(max-width: 1023px)").matches) panelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const places = useMemo(() => buildPlaces(state), [state]);
  const filtered = places.filter((p) => (city === "all" || p.city === city) && (kind === "all" || p.kind === kind));

  const groups = useMemo(() => {
    if (group === "kind") {
      return (Object.keys(PIN_LABEL) as PinKind[])
        .map((k) => ({ key: k, title: PIN_LABEL[k], sub: undefined as string | undefined, items: filtered.filter((p) => p.kind === k) }))
        .filter((g) => g.items.length);
    }
    const byDay = DAYS.map((d) => ({
      key: d.date,
      title: `Day ${d.dayNumber} · ${formatDate(d.date, { weekday: true })}`,
      sub: d.cityLabel,
      items: filtered.filter((p) => p.dates.includes(d.date)),
    })).filter((g) => g.items.length);
    const unscheduled = filtered.filter((p) => !p.dates.length);
    if (unscheduled.length) byDay.push({ key: "unscheduled", title: "Not scheduled", sub: "Saved places", items: unscheduled });
    return byDay;
  }, [filtered, group]);

  const active = selected ?? filtered[0] ?? null;

  return (
    <div className="space-y-5">
      <SectionHeader eyebrow="地図" title="Maps" subtitle="Every saved place, grouped by day. Tap any pin for one-tap Google Maps directions." />

      <div className="space-y-2.5">
        <ChipGroup
          label="Destination"
          value={city}
          onChange={(v) => {
            setCity(v);
            setSelected(null);
          }}
          options={[
            { value: "all", label: "All", count: places.length },
            ...(["osaka", "kyoto", "tokyo"] as CityKey[]).map((c) => ({ value: c, label: CITY_LABEL[c], count: places.filter((p) => p.city === c).length })),
          ]}
        />
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
          <ChipGroup
            label="Category"
            value={kind}
            onChange={(v) => {
              setKind(v);
              setSelected(null);
            }}
            className="mx-0 px-0"
            options={[
              { value: "all", label: "All pins" },
              ...(Object.keys(PIN_LABEL) as PinKind[]).map((k) => ({ value: k, label: PIN_LABEL[k].split(" ")[0] })),
            ]}
          />
        </div>
        <ChipGroup
          label="Group by"
          value={group}
          onChange={setGroup}
          options={[
            { value: "day", label: "By day" },
            { value: "kind", label: "By category" },
          ]}
        />
      </div>

      {/* Legend */}
      <ul className="flex flex-wrap gap-3 text-xs text-ink-muted" aria-label="Pin legend">
        {(Object.keys(PIN_META) as PinKind[]).map((k) => (
          <li key={k} className="flex items-center gap-1.5">
            <Pin kind={k} small /> {PIN_LABEL[k]}
          </li>
        ))}
      </ul>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_1.1fr] lg:items-start">
        {/* Map panel */}
        <div ref={panelRef} className="min-w-0 scroll-mt-20 lg:sticky lg:top-20 lg:order-2">
        <Card className="overflow-hidden">
          {active ? (
            <>
              {showMap ? (
                <div className="relative aspect-[4/3] w-full bg-surface-2">
                  <iframe
                    key={active.key}
                    title={`Map of ${active.name}`}
                    src={mapsEmbedUrl(active.query)}
                    className="absolute inset-0 size-full border-0"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              ) : (
                <div className="grid aspect-[16/10] w-full place-items-center bg-[radial-gradient(circle_at_30%_30%,var(--blush),transparent_60%),radial-gradient(circle_at_80%_70%,color-mix(in_oklab,var(--matcha)_30%,transparent),transparent_55%)] p-6 text-center">
                  <div className="flex flex-col items-center">
                    <Pin kind={active.kind} />
                    <p className="mt-3 font-display text-2xl leading-tight">{active.name}</p>
                    <p className="text-sm text-ink-muted">{CITY_LABEL[active.city]}</p>
                    <Button variant="outline" size="sm" className="mt-4" onClick={() => setShowMap(true)}>
                      <Eye /> Load map preview
                    </Button>
                    <p className="mt-2 text-[11px] text-ink-faint">The preview is optional — the buttons below always work.</p>
                  </div>
                </div>
              )}
              <div className="space-y-3 p-4">
                <div className="flex items-start gap-3">
                  <Pin kind={active.kind} />
                  <div className="min-w-0">
                    <p className="font-semibold leading-snug">{active.name}</p>
                    <p className="text-xs text-ink-muted">
                      {active.address ?? `Google Maps search: “${active.query}”`}
                    </p>
                    {active.dates.length > 0 && <p className="mt-1 text-xs text-ink-muted">Planned: {active.dates.map((d) => formatDate(d)).join(", ")}</p>}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <LinkButton href={mapsDirectionsUrl(active.query)} size="sm">
                    <Navigation /> Directions
                  </LinkButton>
                  <LinkButton href={mapsSearchUrl(active.query)} size="sm" variant="outline">
                    <ExternalLink /> Open in Google Maps
                  </LinkButton>
                  <CopyButton text={active.address ?? active.query} />
                  {showMap && (
                    <Button size="sm" variant="ghost" onClick={() => setShowMap(false)}>
                      <EyeOff /> Hide map
                    </Button>
                  )}
                </div>
              </div>
            </>
          ) : (
            <p className="p-8 text-center text-sm text-ink-muted">No places match these filters.</p>
          )}
        </Card>
        </div>

        {/* List */}
        <div className="min-w-0 space-y-6 lg:order-1">
          {groups.map((g) => {
            const route = group === "day" && g.key !== "unscheduled" ? mapsRouteUrl(g.items.map((p) => p.query)) : null;
            return (
              <section key={g.key} aria-label={g.title}>
                <div className="mb-2 flex items-end justify-between gap-2">
                  <div>
                    <h2 className="font-display text-xl leading-tight">{g.title}</h2>
                    {g.sub && <p className="text-xs text-ink-muted">{g.sub}</p>}
                  </div>
                  {route && g.items.length > 1 && (
                    <LinkButton href={route} size="sm" variant="ghost">
                      <Route /> Route
                    </LinkButton>
                  )}
                </div>
                <ul className="space-y-2">
                  {g.items.map((p) => {
                    const isActive = active?.key === p.key;
                    return (
                      <li key={p.key + g.key}>
                        <div className={cn("flex items-center gap-2 rounded-2xl border bg-surface p-2 pr-2.5 transition-colors", isActive ? "border-ink" : "border-line")}>
                          <button
                            type="button"
                            onClick={() => select(p)}
                            className="flex min-w-0 flex-1 items-center gap-3 rounded-xl p-1 text-left"
                            aria-pressed={isActive}
                          >
                            <Pin kind={p.kind} />
                            <span className="min-w-0">
                              <span className="block truncate text-[15px] font-medium">{p.name}</span>
                              <span className="block truncate text-xs text-ink-muted">
                                {CITY_LABEL[p.city]} · {PIN_LABEL[p.kind]}
                              </span>
                            </span>
                          </button>
                          <LinkButton href={mapsDirectionsUrl(p.query)} size="icon-sm" variant="outline" aria-label={`Directions to ${p.name}`}>
                            <Navigation />
                          </LinkButton>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })}
          {!state.hotels.osaka && !state.hotels.tokyo && (
            <p className="flex items-start gap-2 rounded-2xl bg-surface-2/70 p-3 text-xs text-ink-muted">
              <MapPin className="mt-0.5 size-3.5 shrink-0" /> Add your hotels in Trip settings (gear icon) to include them here.
            </p>
          )}
          <Badge variant="outline" className="whitespace-normal">
            Locations open as Google Maps searches unless a verified address is listed — no coordinates are guessed.
          </Badge>
        </div>
      </div>
    </div>
  );
}

function Pin({ kind, small }: { kind: PinKind; small?: boolean }) {
  const m = PIN_META[kind];
  const Icon = m.icon;
  return (
    <span
      className={cn(
        "relative grid shrink-0 place-items-center rounded-full rounded-br-none rotate-45 shadow-soft ring-4",
        m.pin,
        m.ring,
        small ? "size-4 ring-2" : "size-9"
      )}
      aria-hidden
    >
      {!small && <Icon className="size-4 -rotate-45" />}
    </span>
  );
}
