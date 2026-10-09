"use client";

import { useMemo, useState } from "react";
import { Heart, MapPin, Navigation } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { LinkButton } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useTrip } from "@/components/providers/trip-store";
import { ChipGroup, ToggleChip } from "@/components/shared/chips";
import { FavButton, NoteField, SectionHeader, VerifyBadge } from "@/components/shared/bits";
import { useDeepLink } from "@/components/shared/use-deep-link";
import { SHOPS, SHOP_CATEGORIES } from "@/data/shopping";
import { mapsDirectionsUrl, mapsSearchUrl } from "@/lib/maps";
import { formatDate } from "@/lib/time";
import { CITY_LABEL, shoppingProgress } from "@/lib/trip";
import type { ShopCategory, ShopItem } from "@/lib/types";
import { cn, pct } from "@/lib/utils";

type CityFilter = "all" | ShopItem["city"];
const CITY_ORDER: ShopItem["city"][] = ["tokyo", "osaka", "kyoto", "multi"];
const cityName = (c: ShopItem["city"]) => (c === "multi" ? "Multiple cities" : CITY_LABEL[c]);

export function ShoppingView() {
  const { state } = useTrip();
  const [city, setCity] = useState<CityFilter>("all");
  const [cat, setCat] = useState<"all" | ShopCategory>("all");
  const [hideDone, setHideDone] = useState(false);
  const [favs, setFavs] = useState(false);

  useDeepLink("shopping", ({ focus }) => {
    if (focus) {
      setCity("all");
      setCat("all");
      setHideDone(false);
      setFavs(false);
    }
  });

  const filtered = useMemo(
    () =>
      SHOPS.filter((s) => {
        const st = state.items[s.id];
        if (city !== "all" && s.city !== city) return false;
        if (cat !== "all" && !s.categories.includes(cat)) return false;
        if (hideDone && st?.done) return false;
        if (favs && !st?.fav) return false;
        return true;
      }),
    [state, city, cat, hideDone, favs]
  );

  const grouped = useMemo(() => {
    const out: { city: ShopItem["city"]; hoods: { name: string; items: ShopItem[] }[] }[] = [];
    for (const c of CITY_ORDER) {
      const items = filtered.filter((s) => s.city === c);
      if (!items.length) continue;
      const hoods: { name: string; items: ShopItem[] }[] = [];
      for (const s of items) {
        let h = hoods.find((x) => x.name === s.neighborhood);
        if (!h) hoods.push((h = { name: s.neighborhood, items: [] }));
        h.items.push(s);
      }
      out.push({ city: c, hoods });
    }
    return out;
  }, [filtered]);

  const prog = shoppingProgress(state);

  return (
    <div className="space-y-6">
      <SectionHeader eyebrow="Wish list" title="Shopping guide" subtitle="Streetwear, vintage designer and Japanese fashion — organised by neighbourhood." />

      <Card className="p-5">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-sm text-ink-muted">Stores visited</p>
            <p className="font-display text-4xl tabular-nums">
              {prog.done}
              <span className="text-xl text-ink-muted"> / {prog.total}</span>
            </p>
          </div>
          <p className="font-display text-3xl text-matcha-ink tabular-nums">{pct(prog.done, prog.total)}%</p>
        </div>
        <Progress value={pct(prog.done, prog.total)} tone="matcha" className="mt-3" label="Shopping checklist progress" />
        <p className="mt-3 text-xs text-ink-muted">Many stores offer tax-free shopping for visitors — carry your passport.</p>
      </Card>

      <div className="space-y-2.5">
        <ChipGroup
          label="City"
          value={city}
          onChange={setCity}
          options={[
            { value: "all", label: "All cities" },
            { value: "tokyo", label: "Tokyo" },
            { value: "osaka", label: "Osaka" },
            { value: "kyoto", label: "Kyoto" },
            { value: "multi", label: "Multiple" },
          ]}
        />
        <ChipGroup
          label="Category"
          value={cat}
          onChange={setCat}
          options={[
            { value: "all", label: "Everything" },
            ...(Object.keys(SHOP_CATEGORIES) as ShopCategory[]).map((c) => ({ value: c, label: SHOP_CATEGORIES[c], count: SHOPS.filter((s) => s.categories.includes(c)).length })),
          ]}
        />
        <div className="flex gap-2">
          <ToggleChip pressed={hideDone} onChange={setHideDone}>
            Hide visited
          </ToggleChip>
          <ToggleChip pressed={favs} onChange={setFavs}>
            <Heart /> Favorites
          </ToggleChip>
        </div>
      </div>

      {grouped.length === 0 && <Card className="p-8 text-center text-sm text-ink-muted">No stores match these filters.</Card>}

      {grouped.map((g) => (
        <section key={g.city} aria-labelledby={`city-${g.city}`} className="space-y-4">
          <h2 id={`city-${g.city}`} className="font-display text-3xl">
            {cityName(g.city)}
          </h2>
          {g.hoods.map((h) => (
            <div key={h.name}>
              <h3 className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-gold-ink">
                <MapPin className="size-3.5" /> {h.name}
              </h3>
              <ul className="grid gap-3 md:grid-cols-2">
                {h.items.map((s) => (
                  <ShopCard key={s.id} s={s} />
                ))}
              </ul>
            </div>
          ))}
        </section>
      ))}
    </div>
  );
}

function ShopCard({ s }: { s: ShopItem }) {
  const { state, toggle, patch } = useTrip();
  const st = state.items[s.id] ?? {};
  return (
    <li id={s.id}>
      <Card className={cn("h-full p-4", st.done && "opacity-75")}>
        <div className="flex items-start gap-1">
          <Checkbox checked={!!st.done} onChange={() => toggle(s.id, "done")} label={`Visited ${s.name}`} className="-ml-2 -mt-1" />
          <div className="min-w-0 flex-1 pt-1.5">
            <h4 className={cn("text-[16px] font-semibold leading-snug", st.done && "line-through decoration-ink-faint")}>{s.name}</h4>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {s.categories.map((c) => (
                <Badge key={c} variant="gold">
                  {SHOP_CATEGORIES[c]}
                </Badge>
              ))}
              {s.date && <Badge variant="outline">Planned {formatDate(s.date)}</Badge>}
              {s.verify && <VerifyBadge />}
            </div>
          </div>
          <FavButton active={!!st.fav} onToggle={() => toggle(s.id, "fav")} label={s.name} />
        </div>
        {s.tip && <p className="mt-2 text-[13px] text-ink/80">{s.tip}</p>}
        <div className="mt-3 flex flex-wrap gap-2">
          <LinkButton href={mapsDirectionsUrl(s.mapsQuery)} size="sm">
            <Navigation /> Directions
          </LinkButton>
          <LinkButton href={mapsSearchUrl(s.mapsQuery)} size="sm" variant="outline">
            <MapPin /> Map
          </LinkButton>
        </div>
        <div className="mt-3 border-t border-line pt-3">
          <NoteField value={st.note ?? ""} onSave={(v) => patch(s.id, { note: v })} placeholder="Add a note (sizes, wish list…)" />
        </div>
      </Card>
    </li>
  );
}
