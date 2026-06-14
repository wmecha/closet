import { z } from "zod";

const money = z.number().int().min(0).max(1_000_000_000);
const quantity = z.number().int().min(0).max(1_000_000);
const percent = z.number().int().min(0).max(100);

export const expenseSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  category: z.string().min(1),
  amount: money,
  costType: z.enum(["fixed", "variable"]),
  allocateToInventory: z.boolean(),
  notes: z.string(),
});

export const categorySchema = z
  .object({
    id: z.string(),
    name: z.string().min(1),
    budget: money,
    quantity,
    minBuyingPrice: money,
    averageBuyingPrice: money,
    maxBuyingPrice: money,
    onlinePrice: money,
    marketPrice: money,
    clearancePrice: money,
    onlinePercent: percent,
    marketPercent: percent,
    clearancePercent: percent,
    discountPercent: percent,
    damagedPercent: percent,
    unsoldPercent: percent,
    priority: z.enum([
      "essential",
      "high",
      "medium",
      "experimental",
      "avoid_if_expensive",
    ]),
    notes: z.string(),
  })
  .superRefine((category, ctx) => {
    const channelTotal =
      category.onlinePercent +
      category.marketPercent +
      category.clearancePercent;
    if (channelTotal !== 100) {
      ctx.addIssue({
        code: "custom",
        path: ["onlinePercent"],
        message: "Online, market and clearance percentages must total 100%.",
      });
    }
    if (category.damagedPercent + category.unsoldPercent > 100) {
      ctx.addIssue({
        code: "custom",
        path: ["damagedPercent"],
        message: "Damaged and unsold percentages cannot exceed 100%.",
      });
    }
  });

export const scenarioSchema = z
  .object({
    id: z.string(),
    name: z.string().min(2, "Enter a scenario name."),
    description: z.string(),
    status: z.enum([
      "draft",
      "under_review",
      "approved",
      "used_for_buying_trip",
      "archived",
    ]),
    mode: z.enum(["budget", "quantity"]),
    totalCapital: money,
    plannedStockBudget: money,
    targetPricingMethod: z.enum(["markup", "margin"]),
    targetRatePercent: z.number().int().min(0).max(1000),
    expectedSellThroughPercent: percent,
    plannedSourcingDate: z.string(),
    plannedLaunchDate: z.string(),
    notes: z.string(),
    priceRounding: z.enum([
      "nearest_10",
      "nearest_50",
      "nearest_100",
      "end_49",
      "end_99",
    ]),
    paymentChargePercent: percent,
    sellerCommission: z.object({
      type: z.enum([
        "none",
        "fixed_per_item",
        "percentage",
        "daily_allowance",
        "after_target",
      ]),
      amount: money,
      targetAmount: money,
    }),
    expenses: z.array(expenseSchema),
    categories: z.array(categorySchema).min(1),
    createdAt: z.string(),
    updatedAt: z.string(),
  })
  .superRefine((scenario, ctx) => {
    const normalizedNames = scenario.categories.map((category) =>
      category.name.trim().toLowerCase(),
    );
    if (new Set(normalizedNames).size !== normalizedNames.length) {
      ctx.addIssue({
        code: "custom",
        path: ["categories"],
        message: "Category names must be unique.",
      });
    }
  });

export type PlannerExpense = z.infer<typeof expenseSchema>;
export type PlannerCategory = z.infer<typeof categorySchema>;
export type PlannerScenario = z.infer<typeof scenarioSchema>;
export type PricingMethod = PlannerScenario["targetPricingMethod"];
export type PriceRounding = PlannerScenario["priceRounding"];
