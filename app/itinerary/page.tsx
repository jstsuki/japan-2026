import type { Metadata } from "next";
import { ItineraryView } from "@/components/itinerary/itinerary-view";

export const metadata: Metadata = { title: "Itinerary" };

export default function Page() {
  return <ItineraryView />;
}
