import type { Metadata } from "next";
import { ReservationsView } from "@/components/reservations/reservations-view";

export const metadata: Metadata = { title: "Reservations" };

export default function Page() {
  return <ReservationsView />;
}
