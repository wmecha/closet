import type { PlannerScenario } from "@/features/planner/schema";
import { percentOf } from "./money";
import { calculateScenario } from "./scenario";

export type SensitivityAdjustments = {
  purchaseCostChangePercent: number;
  sellingPriceChangePercent: number;
  sellThroughPercent: number | null;
  damagedStockChangePercent: number;
  transportCostChangePercent: number;
  commissionChangePercent: number;
  marketMixShiftPercent: number;
};

export const neutralSensitivity: SensitivityAdjustments = {
  purchaseCostChangePercent: 0,
  sellingPriceChangePercent: 0,
  sellThroughPercent: null,
  damagedStockChangePercent: 0,
  transportCostChangePercent: 0,
  commissionChangePercent: 0,
  marketMixShiftPercent: 0,
};

function adjust(value: number, changePercent: number): number {
  return Math.max(0, value + percentOf(value, changePercent));
}

export function applySensitivity(
  scenario: PlannerScenario,
  adjustments: SensitivityAdjustments,
): PlannerScenario {
  return {
    ...scenario,
    sellerCommission: {
      ...scenario.sellerCommission,
      amount: adjust(
        scenario.sellerCommission.amount,
        adjustments.commissionChangePercent,
      ),
    },
    expenses: scenario.expenses.map((expense) => ({
      ...expense,
      amount: /transport/i.test(expense.name)
        ? adjust(expense.amount, adjustments.transportCostChangePercent)
        : expense.amount,
    })),
    categories: scenario.categories.map((category) => {
      const onlinePercent = Math.max(
        0,
        category.onlinePercent - adjustments.marketMixShiftPercent,
      );
      const marketPercent =
        category.marketPercent + (category.onlinePercent - onlinePercent);
      const unsoldPercent =
        adjustments.sellThroughPercent === null
          ? category.unsoldPercent
          : Math.max(
              0,
              100 -
                category.damagedPercent -
                adjustments.damagedStockChangePercent -
                adjustments.sellThroughPercent,
            );
      return {
        ...category,
        averageBuyingPrice: adjust(
          category.averageBuyingPrice,
          adjustments.purchaseCostChangePercent,
        ),
        minBuyingPrice: adjust(
          category.minBuyingPrice,
          adjustments.purchaseCostChangePercent,
        ),
        maxBuyingPrice: adjust(
          category.maxBuyingPrice,
          adjustments.purchaseCostChangePercent,
        ),
        onlinePrice: adjust(
          category.onlinePrice,
          adjustments.sellingPriceChangePercent,
        ),
        marketPrice: adjust(
          category.marketPrice,
          adjustments.sellingPriceChangePercent,
        ),
        clearancePrice: adjust(
          category.clearancePrice,
          adjustments.sellingPriceChangePercent,
        ),
        onlinePercent,
        marketPercent,
        damagedPercent: Math.min(
          100,
          category.damagedPercent + adjustments.damagedStockChangePercent,
        ),
        unsoldPercent,
      };
    }),
  };
}

export function calculateSensitivity(
  scenario: PlannerScenario,
  adjustments: SensitivityAdjustments,
) {
  return calculateScenario(applySensitivity(scenario, adjustments));
}

export const scenarioPresets = {
  conservative: {
    purchaseCostChangePercent: 10,
    sellingPriceChangePercent: -10,
    sellThroughPercent: 60,
    damagedStockChangePercent: 3,
    transportCostChangePercent: 15,
    commissionChangePercent: 10,
    marketMixShiftPercent: 15,
  },
  expected: neutralSensitivity,
  optimistic: {
    purchaseCostChangePercent: -5,
    sellingPriceChangePercent: 10,
    sellThroughPercent: 92,
    damagedStockChangePercent: -1,
    transportCostChangePercent: 0,
    commissionChangePercent: 0,
    marketMixShiftPercent: -10,
  },
} satisfies Record<string, SensitivityAdjustments>;
