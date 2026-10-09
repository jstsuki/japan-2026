"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CloudOff, Download, KeyRound, Printer, RefreshCw, RotateCcw, Upload, Users } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { sanitize, useTrip, type SyncStatus } from "@/components/providers/trip-store";
import { DAYS } from "@/data/days";
import { RESERVATIONS } from "@/data/reservations";
import { dayActivities, STATUS_LABEL, reservationStatus } from "@/lib/trip";

export function SettingsDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const { state, sync, setPasscode, setHotels, replaceAll, reset } = useTrip();
  const shared = sync.mode !== "local";
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
      const where = shared ? "the shared trip (for everyone)" : "this device";
      if (!window.confirm(`Replace everything on ${where} with the imported trip data?`)) return;
      replaceAll(next);
      setMessage(`Imported ${Object.keys(next.items).length} saved items and ${next.custom.length} custom activities.`);
    } catch {
      setMessage("That file couldn't be read. Choose a JSON file exported from this app.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} title="Trip settings" description="Sharing, hotels, backups and printing.">
      <SyncSection sync={sync} onPasscode={setPasscode} />

      <hr className="my-5 border-line" />

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
          {shared
            ? "Export saves a copy of the shared trip as a file. Import and reset change the trip for everyone."
            : "Edits are saved in this browser only. Export here and import on your other phone or laptop."}
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
            if (window.confirm(`Clear every checkmark, note, time edit, booking status and custom activity ${shared ? "for everyone sharing this trip" : "on this device"}?`)) {
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

function SyncSection({ sync, onPasscode }: { sync: SyncStatus; onPasscode: (code: string) => void }) {
  const [code, setCode] = useState("");
  const waiting = sync.pending > 0 ? ` ${sync.pending} change${sync.pending === 1 ? "" : "s"} waiting to sync.` : "";

  return (
    <section className="space-y-3">
      <h3 className="flex items-center gap-2 text-sm font-semibold">
        <Users className="size-4" /> Shared trip
      </h3>
      {sync.mode === "checking" && (
        <p className="flex items-center gap-2 text-xs text-ink-muted">
          <RefreshCw className="size-3.5 animate-spin" /> Connecting…
        </p>
      )}
      {sync.mode === "local" && (
        <p className="text-xs text-ink-muted">
          Not set up yet — edits are saved on this device only. Connect an Upstash Redis database to the project in Vercel to share
          them live.
        </p>
      )}
      {sync.mode === "synced" && (
        <p className="text-xs text-ink-muted">
          <span className="font-medium text-ink">Live.</span> Checkmarks, notes, bookings, your own activities and hotels are shared
          with everyone using this trip, and update within a few seconds.{waiting}
        </p>
      )}
      {sync.mode === "offline" && (
        <p className="flex items-start gap-2 text-xs text-ink-muted">
          <CloudOff className="mt-0.5 size-3.5 shrink-0" />
          <span>Can’t reach the shared trip right now. Your edits are saved on this phone and will sync when you’re back online.{waiting}</span>
        </p>
      )}
      {sync.mode === "locked" && (
        <form
          className="space-y-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (code.trim()) onPasscode(code);
          }}
        >
          <p className="text-xs text-ink-muted">This trip is shared with a passcode. Enter it to see and make shared changes.</p>
          <Label htmlFor="trip-passcode">Trip passcode</Label>
          <div className="flex gap-2">
            <Input
              id="trip-passcode"
              type="password"
              autoComplete="off"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Passcode"
            />
            <Button type="submit" variant="sakura" className="shrink-0">
              <KeyRound /> Join
            </Button>
          </div>
          {sync.wrongPasscode && <p className="text-xs text-rose-700 dark:text-rose-300">That passcode didn’t work. Check it and try again.</p>}
        </form>
      )}
    </section>
  );
}
