import type { Metadata } from "next";
import { MapView } from "@/components/map/map-view";

export const metadata: Metadata = { title: "Maps" };

export default function Page() {
  return <MapView />;
}
