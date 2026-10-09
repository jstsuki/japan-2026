import type { Metadata } from "next";
import { FoodView } from "@/components/food/food-view";

export const metadata: Metadata = { title: "Food guide" };

export default function Page() {
  return <FoodView />;
}
