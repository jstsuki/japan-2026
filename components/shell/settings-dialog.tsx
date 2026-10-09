"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Download, Printer, RotateCcw, Upload } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { sanitize, useTrip } from "@/components/providers/trip-store";
import { DAYS } from "@/data/days";
import { RESERVATIONS } from "@/data/reservations";
import { dayActivities, STATUS_LABEL, reservationStatus } from "@/lib/trip";

export function SettingsDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const { state, setHotels, replaceAll, reset } = useTrip();
  const [hotels, setLocal] = useState(state.hotels);
  const [message, setMessage] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Reset the form each time the dialog opens.
  useEffect(() => {
    if (open) setMessage(null);
  }, [open]);

  // Keep the hotel fields in sync with saved data (open, import, reset).
  useEffect(() => {
    if (open) setLocal(state.hotels);
  }, [open, state.hotels]);

  const exportJson = () => {
    const payload = {
      app: "japan-2026",
      version: 1,
      exportedAt: new Date().toISOString(),
      note: "Your edits are in `state`. `itinerary` and `reservations` are a readable snapshot including your edits.",
      state,
      itinerary: DAYS.map((d) => ({ ...d, activities: dayActivities(d.date, state) })),
      reservations: RESERVATIONS.map((r) => ({
        ...r,
        status: STATUS_LABEL[reservationStatus(r.id, state)],
        confirmation: state.items[r.id]?.confirmation ?? "",
        note: state.items[r.id]?.note ?? "",
      })),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `japan-2026-trip-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setMessage("Exported. Keep the file somewhere safe — it's your backup.");
  };

  const importJson = async (file: File) => {
    try {
      const parsed: unknown = JSON.parse(await file.text());
      const candidate = parsed && typeof parsed === "object" && "state" in parsed ? (parsed as { state: unknown }).state : parsed;
      const next = sanitize(candidate);
      if (!next) throw new Error("bad");
      if (!window.confirm("Replace everything on this device with the imported trip data?")) return;
      replaceAll(next);
      setMessage(`Imported ${Object.keys(next.items).length} saved items and ${next.custom.length} custom activities.`);
    } catch {
      setMessage("That file couldn't be read. Choose a JSON file exported from this app.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} title="Trip settings" description="Hotels, backups and printing.">
      <section className="space-y-3">
        <h3 className="text-sm font-semibold">Your hotels</h3>
        <p className="text-xs text-ink-muted">Used for “Directions” on hotel stops. Enter the name or address exactly as Google Maps knows it.</p>
        <div className="space-y-1.5">
          <Label htmlFor="hotel-osaka">Osaka hotel</Label>
          <Input id="hotel-osaka" value={hotels.osaka} onChange={(e) => setLocal({ ...hotels, osaka: e.target.value })} placeholder="e.g. hotel name, Namba" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="hotel-tokyo">Tokyo hotel</Label>
          <Input id="hotel-tokyo" value={hotels.tokyo} onChange={(e) => setLocal({ ...hotels, tokyo: e.target.value })} placeholder="e.g. hotel name, Shibuya" />
        </div>
        <Button
          variant="sakura"
          className="w-full"
          onClick={() => {
            setHotels({ osaka: hotels.osaka.trim(), tokyo: hotels.tokyo.trim() });
            setMessage("Hotels saved.");
          }}
        >
          Save hotels
        </Button>
      </section>

      <hr className="my-5 border-line" />

      <section className="space-y-3">
        <h3 className="text-sm font-semibold">Backup & print</h3>
        <p className="text-xs text-ink-muted">
          Edits are saved in this browser only. They don’t sync between devices automatically — export here and import on your
          other phone or laptop.
        </p>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" onClick={exportJson}>
            <Download /> Export JSON
          </Button>
          <Button variant="outline" onClick={() => fileRef.current?.click()}>
            <Upload /> Import JSON
          </Button>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void importJson(f);
            e.target.value = "";
          }}
        />
        <Link
          href="/print"
          onClick={() => onOpenChange(false)}
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full border border-line bg-surface text-sm font-medium hover:bg-surface-2"
        >
          <Printer className="size-4" /> Print-friendly itinerary
        </Link>
        <Button
          variant="ghost"
          className="w-full text-rose-700 dark:text-rose-300"
          onClick={() => {
            if (window.confirm("Clear every checkmark, note, time edit, booking status and custom activity on this device?")) {
              reset();
              setMessage("Everything was reset to the original plan.");
            }
          }}
        >
          <RotateCcw /> Reset all edits
        </Button>
      </section>

      {message && (
        <p role="status" className="mt-4 rounded-2xl bg-matcha/15 px-4 py-3 text-sm text-ink">
          {message}
        </p>
      )}
    </Dialog>
  );
}
