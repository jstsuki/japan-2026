import type { Metadata } from "next";
import { PrintView } from "@/components/print/print-view";

export const metadata: Metadata = { title: "Print itinerary" };

export default function Page() {
  return <PrintView />;
}
