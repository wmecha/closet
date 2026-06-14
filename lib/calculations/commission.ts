import type { PlannerScenario } from "@/features/planner/schema";
import { percentOf } from "./money";

export function calculateSellerCommission(
  assumption: PlannerScenario["sellerCommission"],
  marketRevenue: number,
  marketItems: number,
): number {
  switch (assumption.type) {
    case "fixed_per_item":
      return assumption.amount * marketItems;
    case "percentage":
      return percentOf(marketRevenue, assumption.amount);
    case "daily_allowance":
      return assumption.amount;
    case "after_target":
      return marketRevenue > assumption.targetAmount
        ? percentOf(marketRevenue - assumption.targetAmount, assumption.amount)
        : 0;
    default:
      return 0;
  }
}
