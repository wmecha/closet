import { describe, expect, it } from "vitest";
import { createDefaultScenario } from "@/features/planner/defaults";
import { calculateSellerCommission } from "@/lib/calculations/commission";
import { compareScenarios } from "@/lib/calculations/comparison";
import {
  allocatedExpenseTotal,
  operatingExpenseTotal,
} from "@/lib/calculations/landed-cost";
import {
  marginPrice,
  markupPrice,
  roundPrice,
} from "@/lib/calculations/pricing";
import { calculateScenario } from "@/lib/calculations/scenario";
import {
  calculateSensitivity,
  scenarioPresets,
} from "@/lib/calculations/sensitivity";

describe("financial calculation engine", () => {
  it("calculates available stock budget and expense allocation", () => {
    const scenario = createDefaultScenario();
    const result = calculateScenario(scenario);

    expect(allocatedExpenseTotal(scenario.expenses)).toBe(10_000);
    expect(operatingExpenseTotal(scenario.expenses)).toBe(7_500);
    expect(result.capital.stockBudget).toBe(7_500);
    expect(result.capital.totalExpenses).toBe(17_500);
    expect(result.capital.overBudget).toBe(0);
    expect(result.inventory.totalItems).toBe(50);
    expect(result.inventory.averagePurchaseCost).toBe(150);
    expect(scenario.categories[0].minBuyingPrice).toBe(100);
    expect(scenario.categories[0].maxBuyingPrice).toBe(200);
  });

  it("calculates budget-driven quantity and unused budget", () => {
    const scenario = createDefaultScenario({
      mode: "budget",
      categories: [
        {
          ...createDefaultScenario().categories[0],
          budget: 1_000,
          averageBuyingPrice: 300,
        },
      ],
    });
    const result = calculateScenario(scenario);

    expect(result.categories[0].quantity).toBe(3);
    expect(result.categories[0].unusedBudget).toBe(100);
  });

  it("calculates quantity-driven required category budget", () => {
    const base = createDefaultScenario();
    const scenario = createDefaultScenario({
      mode: "quantity",
      categories: [
        {
          ...base.categories[0],
          quantity: 12,
          averageBuyingPrice: 450,
        },
      ],
    });
    const result = calculateScenario(scenario);

    expect(result.categories[0].quantity).toBe(12);
    expect(result.categories[0].budget).toBe(5_400);
  });

  it("calculates average purchase and landed costs", () => {
    const result = calculateScenario(createDefaultScenario());

    expect(result.inventory.totalItems).toBeGreaterThan(0);
    expect(result.inventory.averagePurchaseCost).toBeGreaterThan(0);
    expect(result.inventory.averageLandedCost).toBeGreaterThan(
      result.inventory.averagePurchaseCost,
    );
    expect(result.inventory.totalLandedCost).toBe(
      result.inventory.directStockCost + result.inventory.acquisitionCosts,
    );
  });

  it("supports markup, margin and all price rounding modes", () => {
    expect(markupPrice(1_000, 50)).toBe(1_500);
    expect(marginPrice(1_000, 50)).toBe(2_000);
    expect(roundPrice(1_234, "nearest_10")).toBe(1_230);
    expect(roundPrice(1_234, "nearest_50")).toBe(1_250);
    expect(roundPrice(1_234, "nearest_100")).toBe(1_200);
    expect(roundPrice(1_234, "end_49")).toBe(1_249);
    expect(roundPrice(1_234, "end_99")).toBe(1_299);
  });

  it("models revenue by channel, discounts, damage and unsold stock", () => {
    const base = createDefaultScenario();
    const baseline = calculateScenario(base);
    const adverse = calculateScenario({
      ...base,
      categories: base.categories.map((category) => ({
        ...category,
        discountPercent: 20,
        damagedPercent: 10,
        unsoldPercent: 25,
      })),
    });

    expect(baseline.revenue.onlineRevenue).toBeGreaterThan(0);
    expect(baseline.revenue.marketRevenue).toBeGreaterThan(0);
    expect(baseline.revenue.clearanceRevenue).toBeGreaterThan(0);
    expect(adverse.revenue.realisedRevenue).toBeLessThan(
      baseline.revenue.realisedRevenue,
    );
    expect(adverse.inventory.damagedItems).toBeGreaterThan(
      baseline.inventory.damagedItems,
    );
    expect(adverse.inventory.unsoldItems).toBeGreaterThan(
      baseline.inventory.unsoldItems,
    );
  });

  it("treats market price as the fixed minimum business return", () => {
    const base = createDefaultScenario({
      expectedSellThroughPercent: 100,
      categories: [
        {
          ...createDefaultScenario().categories[0],
          quantity: 10,
          onlinePercent: 0,
          marketPercent: 100,
          clearancePercent: 0,
          marketPrice: 400,
          discountPercent: 50,
          damagedPercent: 0,
          unsoldPercent: 0,
        },
      ],
    });
    const result = calculateScenario(base);

    expect(result.revenue.marketRevenue).toBe(4_000);
    expect(result.profit.sellerCommission).toBe(0);
  });

  it("calculates supported seller commissions", () => {
    expect(
      calculateSellerCommission(
        { type: "percentage", amount: 10, targetAmount: 0 },
        10_000,
        5,
      ),
    ).toBe(1_000);
    expect(
      calculateSellerCommission(
        { type: "fixed_per_item", amount: 100, targetAmount: 0 },
        10_000,
        5,
      ),
    ).toBe(500);
    expect(
      calculateSellerCommission(
        { type: "after_target", amount: 10, targetAmount: 8_000 },
        10_000,
        5,
      ),
    ).toBe(200);
  });

  it("calculates profit, return, break-even and cash recovery", () => {
    const result = calculateScenario(createDefaultScenario());

    expect(result.profit.grossProfit).toBe(
      result.revenue.realisedRevenue -
        Math.floor(
          (result.inventory.totalLandedCost * result.inventory.saleableItems) /
            result.inventory.totalItems,
        ),
    );
    expect(result.profit.netProfit).toBeLessThan(result.profit.grossProfit);
    expect(Number.isFinite(result.profit.returnOnCapitalPercent)).toBe(true);
    expect(result.profit.breakEvenItemCount).toBeGreaterThan(0);
    expect(result.profit.breakEvenSellThroughPercent).toBeGreaterThan(0);
    expect(result.cashRecovery).toHaveLength(6);
    expect(result.cashRecovery.at(-1)?.cashRecovered).toBe(
      result.revenue.realisedRevenue,
    );
  });

  it("runs derived sensitivity without overwriting the base scenario", () => {
    const scenario = createDefaultScenario();
    const baseline = calculateScenario(scenario);
    const downside = calculateSensitivity(
      scenario,
      scenarioPresets.conservative,
    );

    expect(downside.profit.netProfit).toBeLessThan(baseline.profit.netProfit);
    expect(scenario.categories[0].averageBuyingPrice).toBe(150);
  });

  it("compares scenarios and identifies key extrema", () => {
    const first = createDefaultScenario({ name: "Expected" });
    const second = createDefaultScenario({
      name: "Lower capital",
      totalCapital: 40_000,
      plannedStockBudget: 6_000,
      categories: createDefaultScenario().categories.map((category) => ({
        ...category,
        quantity: Math.max(1, Math.floor(category.quantity * 0.8)),
      })),
    });
    const comparison = compareScenarios([first, second]);

    expect(comparison.rows).toHaveLength(2);
    expect(comparison.highlights.lowestCapital).toBe(40_000);
    expect(Number.isFinite(comparison.highlights.highestProfit)).toBe(true);
  });
});
