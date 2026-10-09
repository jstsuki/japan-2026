import type { Metadata } from "next";
import { ShoppingView } from "@/components/shopping/shopping-view";

export const metadata: Metadata = { title: "Shopping" };

export default function Page() {
  return <ShoppingView />;
}
