import type { PriceRounding, PricingMethod } from "@/features/planner/schema";
import { divideRoundUp, percentOf } from "./money";

export function markupPrice(cost: number, markupPercent: number): number {
  return cost + percentOf(cost, markupPercent);
}

export function marginPrice(cost: number, marginPercent: number): number {
  if (marginPercent >= 100) return 0;
  return divideRoundUp(cost * 100, 100 - Math.trunc(marginPercent));
}

export function targetPrice(
  cost: number,
  method: PricingMethod,
  ratePercent: number,
): number {
  return method === "markup"
    ? markupPrice(cost, ratePercent)
    : marginPrice(cost, ratePercent);
}

export function roundPrice(value: number, mode: PriceRounding): number {
  const price = Math.max(0, Math.trunc(value));
  if (mode === "end_49" || mode === "end_99") {
    const ending = mode === "end_49" ? 49 : 99;
    const base = Math.floor(price / 100) * 100 + ending;
    return base < price ? base + 100 : base;
  }

  const increment =
    mode === "nearest_10" ? 10 : mode === "nearest_50" ? 50 : 100;
  return Math.round(price / increment) * increment;
}

export function profitAtPrice(price: number, landedCost: number): number {
  return price - landedCost;
}

export function marginAtPrice(price: number, landedCost: number): number {
  if (price <= 0) return 0;
  return Math.floor(((price - landedCost) * 100) / price);
}
