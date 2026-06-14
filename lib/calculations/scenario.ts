import type {
  PlannerCategory,
  PlannerScenario,
} from "@/features/planner/schema";
import { calculateSellerCommission } from "./commission";
import {
  allocateAcquisitionCosts,
  allocatedExpenseTotal,
  operatingExpenseTotal,
} from "./landed-cost";
import {
  divideRoundUp,
  multiplyDivide,
  percentOf,
  ratioPercent,
  sum,
} from "./money";
import {
  marginAtPrice,
  profitAtPrice,
  roundPrice,
  targetPrice,
} from "./pricing";

export type CategoryResult = {
  id: string;
  name: string;
  budget: number;
  quantity: number;
  unusedBudget: number;
  directCost: number;
  allocatedAcquisitionCost: number;
  landedCost: number;
  averageLandedCost: number;
  saleableItems: number;
  damagedItems: number;
  unsoldItems: number;
  clearanceItems: number;
  marketItems: number;
  onlineRevenue: number;
  marketRevenue: number;
  clearanceRevenue: number;
  expectedRevenue: number;
  fullPotentialRevenue: number;
  recommendedPrice: number;
  premiumPrice: number;
  minimumSafePrice: number;
  profitAtOnlinePrice: number;
  marginAtOnlinePrice: number;
};

export type ScenarioResult = {
  capital: {
    totalCapital: number;
    stockBudget: number;
    totalExpenses: number;
    allocatedExpenses: number;
    operatingExpenses: number;
    categoryBudget: number;
    unallocatedStockBudget: number;
    overBudget: number;
    totalPlannedCashOutlay: number;
    remainingCashReserve: number;
  };
  inventory: {
    totalItems: number;
    directStockCost: number;
    averagePurchaseCost: number;
    acquisitionCosts: number;
    totalLandedCost: number;
    averageLandedCost: number;
    saleableItems: number;
    damagedItems: number;
    unsoldItems: number;
    clearanceItems: number;
  };
  revenue: {
    fullPotentialRevenue: number;
    onlineRevenue: number;
    marketRevenue: number;
    clearanceRevenue: number;
    realisedRevenue: number;
  };
  profit: {
    grossProfit: number;
    netProfit: number;
    grossMarginPercent: number;
    netMarginPercent: number;
    averageMarkupPercent: number;
    returnOnCapitalPercent: number;
    profitPerItemSold: number;
    breakEvenRevenue: number;
    breakEvenItemCount: number;
    breakEvenSellThroughPercent: number;
    sellerCommission: number;
    paymentCharges: number;
  };
  cashRecovery: Array<{
    stagePercent: number;
    cashRecovered: number;
    capitalRecovered: boolean;
  }>;
  capitalRecoveryPointPercent: number;
  categories: CategoryResult[];
  warnings: string[];
};

function calculateQuantity(
  scenario: PlannerScenario,
  category: PlannerCategory,
): number {
  if (scenario.mode === "quantity") return category.quantity;
  if (category.averageBuyingPrice <= 0) return 0;
  return Math.floor(category.budget / category.averageBuyingPrice);
}

function calculateBudget(
  scenario: PlannerScenario,
  category: PlannerCategory,
  quantity: number,
): number {
  return scenario.mode === "quantity"
    ? quantity * category.averageBuyingPrice
    : category.budget;
}

export function calculateScenario(scenario: PlannerScenario): ScenarioResult {
  const preparedCategories = scenario.categories.map((category) => {
    const calculatedQuantity = calculateQuantity(scenario, category);
    return {
      ...category,
      calculatedQuantity,
      calculatedBudget: calculateBudget(scenario, category, calculatedQuantity),
    };
  });

  const acquisitionCosts = allocatedExpenseTotal(scenario.expenses);
  const operatingExpenses = operatingExpenseTotal(scenario.expenses);
  const allocations = allocateAcquisitionCosts(
    preparedCategories,
    acquisitionCosts,
  );

  const categories: CategoryResult[] = preparedCategories.map((category) => {
    const quantity = category.calculatedQuantity;
    const directCost = quantity * category.averageBuyingPrice;
    const allocatedAcquisitionCost = allocations[category.id] ?? 0;
    const landedCost = directCost + allocatedAcquisitionCost;
    const averageLandedCost =
      quantity > 0 ? Math.floor(landedCost / quantity) : 0;
    const damagedItems = percentOf(quantity, category.damagedPercent);
    const targetUnsoldItems = percentOf(quantity, category.unsoldPercent);
    const categorySaleableItems = Math.max(
      0,
      quantity - damagedItems - targetUnsoldItems,
    );
    const scenarioSaleableItems = percentOf(
      quantity,
      scenario.expectedSellThroughPercent,
    );
    const saleableItems = Math.min(
      categorySaleableItems,
      scenarioSaleableItems,
    );
    const unsoldItems = Math.max(0, quantity - damagedItems - saleableItems);
    const clearanceItems = percentOf(saleableItems, category.clearancePercent);
    const marketItems = percentOf(saleableItems, category.marketPercent);
    const onlineRevenueBeforeDiscount = multiplyDivide(
      saleableItems * category.onlinePrice,
      category.onlinePercent,
      100,
    );
    const marketRevenueBeforeDiscount = multiplyDivide(
      saleableItems * category.marketPrice,
      category.marketPercent,
      100,
    );
    const clearanceRevenueBeforeDiscount = multiplyDivide(
      saleableItems * category.clearancePrice,
      category.clearancePercent,
      100,
    );
    const discountMultiplier = 100 - category.discountPercent;
    const onlineRevenue = percentOf(
      onlineRevenueBeforeDiscount,
      discountMultiplier,
    );
    const marketRevenue = percentOf(
      marketRevenueBeforeDiscount,
      discountMultiplier,
    );
    const clearanceRevenue = percentOf(
      clearanceRevenueBeforeDiscount,
      discountMultiplier,
    );
    const recommendedPrice = roundPrice(
      targetPrice(
        averageLandedCost,
        scenario.targetPricingMethod,
        scenario.targetRatePercent,
      ),
      scenario.priceRounding,
    );

    return {
      id: category.id,
      name: category.name,
      budget: category.calculatedBudget,
      quantity,
      unusedBudget: Math.max(0, category.calculatedBudget - directCost),
      directCost,
      allocatedAcquisitionCost,
      landedCost,
      averageLandedCost,
      saleableItems,
      damagedItems,
      unsoldItems,
      clearanceItems,
      marketItems,
      onlineRevenue,
      marketRevenue,
      clearanceRevenue,
      expectedRevenue: onlineRevenue + marketRevenue + clearanceRevenue,
      fullPotentialRevenue:
        onlineRevenueBeforeDiscount +
        marketRevenueBeforeDiscount +
        clearanceRevenueBeforeDiscount,
      recommendedPrice,
      premiumPrice: roundPrice(
        percentOf(recommendedPrice, 125),
        scenario.priceRounding,
      ),
      minimumSafePrice: roundPrice(averageLandedCost, scenario.priceRounding),
      profitAtOnlinePrice: profitAtPrice(
        category.onlinePrice,
        averageLandedCost,
      ),
      marginAtOnlinePrice: marginAtPrice(
        category.onlinePrice,
        averageLandedCost,
      ),
    };
  });

  const totalItems = sum(categories.map((category) => category.quantity));
  const directStockCost = sum(
    categories.map((category) => category.directCost),
  );
  const totalLandedCost = directStockCost + acquisitionCosts;
  const saleableItems = sum(
    categories.map((category) => category.saleableItems),
  );
  const damagedItems = sum(categories.map((category) => category.damagedItems));
  const unsoldItems = sum(categories.map((category) => category.unsoldItems));
  const clearanceItems = sum(
    categories.map((category) => category.clearanceItems),
  );
  const onlineRevenue = sum(
    categories.map((category) => category.onlineRevenue),
  );
  const marketRevenue = sum(
    categories.map((category) => category.marketRevenue),
  );
  const clearanceRevenue = sum(
    categories.map((category) => category.clearanceRevenue),
  );
  const realisedRevenue = onlineRevenue + marketRevenue + clearanceRevenue;
  const fullPotentialRevenue = sum(
    categories.map((category) => category.fullPotentialRevenue),
  );
  const marketItems = sum(categories.map((category) => category.marketItems));
  const sellerCommission = calculateSellerCommission(
    scenario.sellerCommission,
    marketRevenue,
    marketItems,
  );
  const paymentCharges = percentOf(
    onlineRevenue,
    scenario.paymentChargePercent,
  );
  const landedCostOfSold = multiplyDivide(
    totalLandedCost,
    saleableItems,
    totalItems,
  );
  const damagedStockLoss = multiplyDivide(
    totalLandedCost,
    damagedItems,
    totalItems,
  );
  const grossProfit = realisedRevenue - landedCostOfSold;
  const netProfit =
    grossProfit -
    operatingExpenses -
    sellerCommission -
    paymentCharges -
    damagedStockLoss;
  const totalExpenses = acquisitionCosts + operatingExpenses;
  const categoryBudget = sum(
    preparedCategories.map((category) => category.calculatedBudget),
  );
  const totalPlannedCashOutlay = directStockCost + totalExpenses;
  const averageExpectedRevenuePerItem =
    saleableItems > 0 ? Math.floor(realisedRevenue / saleableItems) : 0;
  const netRevenuePerItem =
    averageExpectedRevenuePerItem > 0
      ? averageExpectedRevenuePerItem -
        percentOf(averageExpectedRevenuePerItem, scenario.paymentChargePercent)
      : 0;
  const breakEvenRevenue = totalPlannedCashOutlay;
  const breakEvenItemCount = divideRoundUp(
    totalPlannedCashOutlay,
    netRevenuePerItem,
  );
  const breakEvenSellThroughPercent = ratioPercent(
    breakEvenItemCount,
    Math.max(1, totalItems - damagedItems),
  );
  const stages = [10, 25, 50, 75, 90, 100];
  const cashRecovery = stages.map((stagePercent) => {
    const cashRecovered = percentOf(realisedRevenue, stagePercent);
    return {
      stagePercent,
      cashRecovered,
      capitalRecovered: cashRecovered >= totalPlannedCashOutlay,
    };
  });
  const warnings: string[] = [];
  if (categoryBudget > scenario.plannedStockBudget) {
    warnings.push("Category allocations exceed the planned stock budget.");
  }
  if (totalPlannedCashOutlay > scenario.totalCapital) {
    warnings.push("Planned cash outlay exceeds available capital.");
  }
  if (
    scenario.categories.some(
      (category) =>
        category.onlinePercent +
          category.marketPercent +
          category.clearancePercent !==
        100,
    )
  ) {
    warnings.push("One or more channel mixes do not total 100%.");
  }

  return {
    capital: {
      totalCapital: scenario.totalCapital,
      stockBudget: scenario.plannedStockBudget,
      totalExpenses,
      allocatedExpenses: acquisitionCosts,
      operatingExpenses,
      categoryBudget,
      unallocatedStockBudget: Math.max(
        0,
        scenario.plannedStockBudget - categoryBudget,
      ),
      overBudget: Math.max(0, totalPlannedCashOutlay - scenario.totalCapital),
      totalPlannedCashOutlay,
      remainingCashReserve: Math.max(
        0,
        scenario.totalCapital - totalPlannedCashOutlay,
      ),
    },
    inventory: {
      totalItems,
      directStockCost,
      averagePurchaseCost:
        totalItems > 0 ? Math.floor(directStockCost / totalItems) : 0,
      acquisitionCosts,
      totalLandedCost,
      averageLandedCost:
        totalItems > 0 ? Math.floor(totalLandedCost / totalItems) : 0,
      saleableItems,
      damagedItems,
      unsoldItems,
      clearanceItems,
    },
    revenue: {
      fullPotentialRevenue,
      onlineRevenue,
      marketRevenue,
      clearanceRevenue,
      realisedRevenue,
    },
    profit: {
      grossProfit,
      netProfit,
      grossMarginPercent: ratioPercent(grossProfit, realisedRevenue),
      netMarginPercent: ratioPercent(netProfit, realisedRevenue),
      averageMarkupPercent: ratioPercent(grossProfit, landedCostOfSold),
      returnOnCapitalPercent: ratioPercent(netProfit, totalPlannedCashOutlay),
      profitPerItemSold:
        saleableItems > 0 ? Math.floor(netProfit / saleableItems) : 0,
      breakEvenRevenue,
      breakEvenItemCount,
      breakEvenSellThroughPercent,
      sellerCommission,
      paymentCharges,
    },
    cashRecovery,
    capitalRecoveryPointPercent: ratioPercent(
      totalPlannedCashOutlay,
      realisedRevenue,
    ),
    categories,
    warnings,
  };
}
