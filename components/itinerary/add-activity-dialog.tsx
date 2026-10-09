"use client";

import { useEffect, useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { useTrip } from "@/components/providers/trip-store";
import { CATEGORY_META } from "@/components/shared/meta";
import { DAYS } from "@/data/days";
import { formatDate } from "@/lib/time";
import type { ActivityCategory, CityKey } from "@/lib/types";
import { uid } from "@/lib/utils";

export function AddActivityDialog({ open, onOpenChange, date }: { open: boolean; onOpenChange: (o: boolean) => void; date: string }) {
  const { addCustom } = useTrip();
  const [form, setForm] = useState({ date, title: "", start: "12:00", end: "13:00", category: "food" as ActivityCategory, city: "osaka" as CityKey, place: "", description: "", note: "" });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const day = DAYS.find((d) => d.date === date);
    const city: CityKey = day ? day.art : "osaka";
    setForm((f) => ({ ...f, date, city, title: "", place: "", description: "", note: "" }));
    setError(null);
  }, [open, date]);

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => setForm((f) => ({ ...f, [k]: v }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return setError("Give the activity a name.");
    if (!form.start) return setError("Add a start time.");
    const place = form.place.trim();
    addCustom({
      id: uid("custom"),
      date: form.date,
      start: form.start,
      end: form.end || undefined,
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category,
      city: form.city,
      location: place ? { name: place, query: place } : undefined,
      reservation: "none",
      custom: true,
      notes: form.note.trim() ? [form.note.trim()] : undefined,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} title="Add an activity" description="Saved on this device. You can edit or delete it later.">
      <form onSubmit={submit} className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="act-title">What</Label>
          <Input id="act-title" value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. Purikura photo booth" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="act-day">Day</Label>
            <Select id="act-day" value={form.date} onChange={(e) => set("date", e.target.value)}>
              {DAYS.map((d) => (
                <option key={d.date} value={d.date}>
                  {formatDate(d.date, { weekday: true })} · {d.cityLabel}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="act-city">City</Label>
            <Select id="act-city" value={form.city} onChange={(e) => set("city", e.target.value as CityKey)}>
              <option value="osaka">Osaka</option>
              <option value="kyoto">Kyoto</option>
              <option value="tokyo">Tokyo</option>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="act-start">Start</Label>
            <Input id="act-start" type="time" value={form.start} onChange={(e) => set("start", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="act-end">End</Label>
            <Input id="act-end" type="time" value={form.end} onChange={(e) => set("end", e.target.value)} />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="act-cat">Category</Label>
          <Select id="act-cat" value={form.category} onChange={(e) => set("category", e.target.value as ActivityCategory)}>
            {(Object.keys(CATEGORY_META) as ActivityCategory[]).map((c) => (
              <option key={c} value={c}>
                {CATEGORY_META[c].label}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="act-place">Place (for Google Maps)</Label>
          <Input id="act-place" value={form.place} onChange={(e) => set("place", e.target.value)} placeholder="Name and area, or an address" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="act-desc">Details</Label>
          <Textarea id="act-desc" value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Optional" />
        </div>
        {error && (
          <p role="alert" className="text-sm text-rose-700 dark:text-rose-300">
            {error}
          </p>
        )}
        <Button type="submit" variant="sakura" size="lg" className="w-full">
          Add to itinerary
        </Button>
      </form>
    </Dialog>
  );
}
