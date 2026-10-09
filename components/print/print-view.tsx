"use client";

import Link from "next/link";
import { ArrowLeft, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTrip } from "@/components/providers/trip-store";
import { DAYS } from "@/data/days";
import { RESERVATIONS } from "@/data/reservations";
import { resolveQuery } from "@/lib/maps";
import { formatDate, formatTime } from "@/lib/time";
import { STATUS_LABEL, dayActivities, reservationStatus } from "@/lib/trip";

export function PrintView() {
  const { state } = useTrip();
  return (
    <div className="print-root mx-auto max-w-3xl">
      <div className="no-print mb-6 flex items-center justify-between gap-3">
        <Link href="/itinerary" className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink">
          <ArrowLeft className="size-4" /> Back
        </Link>
        <Button onClick={() => window.print()}>
          <Printer /> Print / Save as PDF
        </Button>
      </div>

      <header className="mb-6 border-b border-line pb-4">
        <h1 className="font-display text-4xl">Japan 2026 — Itinerary</h1>
        <p className="text-sm text-ink-muted">October 10–17 · Osaka → Kyoto → Tokyo → Osaka · All times are suggestions (JST).</p>
      </header>

      {DAYS.map((d) => (
        <section key={d.date} className="print-day mb-7">
          <h2 className="font-display text-2xl">
            Day {d.dayNumber} · {formatDate(d.date, { weekday: true })} — {d.title}
          </h2>
          <p className="mb-2 text-sm text-ink-muted">
            {d.cityLabel} · {d.theme}
          </p>
          {d.alerts?.map((a) => (
            <p key={a} className="mb-1 text-[13px]">
              ⚠︎ {a}
            </p>
          ))}
          <table className="mt-2 w-full border-collapse text-[13px]">
            <tbody>
              {dayActivities(d.date, state).map((a) => {
                const place = a.location ? (a.location.address ?? resolveQuery(a.location.query, state.hotels) ?? a.location.name) : "";
                return (
                  <tr key={a.id} className="border-t border-line align-top">
                    <td className="w-[92px] py-1.5 pr-2 tabular-nums">
                      {formatTime(a.start)}
                      {a.end ? `–${formatTime(a.end)}` : a.openEnded ? " →" : ""}
                    </td>
                    <td className="w-5 py-1.5">{a.done ? "☑" : "☐"}</td>
                    <td className="py-1.5">
                      <strong className="font-semibold">{a.title}</strong>
                      {a.optional ? " (optional)" : ""}
                      {a.tentative ? " (tentative)" : ""}
                      {a.reservation === "required" ? " · reservation required" : ""}
                      {a.verify ? " · verify before visiting" : ""}
                      {place && <div className="text-ink-muted">{place}</div>}
                      {a.note && <div className="italic">Note: {a.note}</div>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>
      ))}

      <section className="print-day">
        <h2 className="font-display text-2xl">Reservations</h2>
        <table className="mt-2 w-full border-collapse text-[13px]">
          <tbody>
            {RESERVATIONS.map((r) => (
              <tr key={r.id} className="border-t border-line align-top">
                <td className="py-1.5 pr-2">{r.name}</td>
                <td className="py-1.5 pr-2 whitespace-nowrap">
                  {r.date ? formatDate(r.date) : ""} {formatTime(state.items[r.id]?.time || r.time)}
                </td>
                <td className="py-1.5 pr-2">{STATUS_LABEL[reservationStatus(r.id, state)]}</td>
                <td className="py-1.5">{state.items[r.id]?.confirmation || ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
