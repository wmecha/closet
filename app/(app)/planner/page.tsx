import type { Metadata } from "next";
import { PlannerWorkspace } from "@/features/planner/planner-workspace";

export const metadata: Metadata = {
  title: "Stock Buy Planner",
};

export default function PlannerPage() {
  return <PlannerWorkspace />;
}
