import type {
  PlannerCategory,
  PlannerExpense,
} from "@/features/planner/schema";
import { multiplyDivide, sum } from "./money";

export type AllocationMethod =
  | "equal_per_item"
  | "proportional_to_purchase_cost"
  | "category_specific";

export function allocatedExpenseTotal(expenses: PlannerExpense[]): number {
  return sum(
    expenses
      .filter((expense) => expense.allocateToInventory)
      .map((expense) => expense.amount),
  );
}

export function operatingExpenseTotal(expenses: PlannerExpense[]): number {
  return sum(
    expenses
      .filter((expense) => !expense.allocateToInventory)
      .map((expense) => expense.amount),
  );
}

export function allocateAcquisitionCosts(
  categories: Array<PlannerCategory & { calculatedQuantity: number }>,
  expenseTotal: number,
  method: AllocationMethod = "equal_per_item",
): Record<string, number> {
  const result: Record<string, number> = {};
  const totalItems = sum(
    categories.map((category) => category.calculatedQuantity),
  );
  const totalPurchaseCost = sum(
    categories.map(
      (category) => category.calculatedQuantity * category.averageBuyingPrice,
    ),
  );

  for (const category of categories) {
    if (method === "proportional_to_purchase_cost") {
      const categoryCost =
        category.calculatedQuantity * category.averageBuyingPrice;
      result[category.id] = multiplyDivide(
        expenseTotal,
        categoryCost,
        totalPurchaseCost,
      );
    } else {
      result[category.id] = multiplyDivide(
        expenseTotal,
        category.calculatedQuantity,
        totalItems,
      );
    }
  }

  return result;
}
