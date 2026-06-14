import type { PlannerScenario } from "./schema";
import type { ScenarioResult } from "@/lib/calculations/scenario";
import { formatKes } from "@/lib/format";

function csvCell(value: string | number) {
  const text = String(value);
  return `"${text.replaceAll('"', '""')}"`;
}

function download(filename: string, content: string, type = "text/csv") {
  const blob = new Blob([content], { type: `${type};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function exportScenarioCsv(
  scenario: PlannerScenario,
  result: ScenarioResult,
) {
  const rows = [
    ["Metric", "Value"],
    ["Scenario", scenario.name],
    ["Status", scenario.status],
    ["Total capital", scenario.totalCapital],
    ["Stock budget", scenario.plannedStockBudget],
    ["Total expenses", result.capital.totalExpenses],
    ["Planned items", result.inventory.totalItems],
    ["Average purchase cost", result.inventory.averagePurchaseCost],
    ["Average landed cost", result.inventory.averageLandedCost],
    ["Expected revenue", result.revenue.realisedRevenue],
    ["Net projected profit", result.profit.netProfit],
    ["Net margin percent", result.profit.netMarginPercent],
    [
      "Break-even sell-through percent",
      result.profit.breakEvenSellThroughPercent,
    ],
  ];
  download(
    `${scenario.name.toLowerCase().replaceAll(/[^a-z0-9]+/g, "-")}.csv`,
    rows.map((row) => row.map(csvCell).join(",")).join("\n"),
  );
}

export function exportCategoryCsv(
  scenario: PlannerScenario,
  result: ScenarioResult,
) {
  const rows = [
    [
      "Category",
      "Budget",
      "Quantity",
      "Average buying cost",
      "Average landed cost",
      "Online price",
      "Market price",
      "Clearance price",
      "Expected revenue",
    ],
    ...result.categories.map((category, index) => [
      category.name,
      category.budget,
      category.quantity,
      scenario.categories[index]?.averageBuyingPrice ?? 0,
      category.averageLandedCost,
      scenario.categories[index]?.onlinePrice ?? 0,
      scenario.categories[index]?.marketPrice ?? 0,
      scenario.categories[index]?.clearancePrice ?? 0,
      category.expectedRevenue,
    ]),
  ];
  download(
    `${scenario.name.toLowerCase().replaceAll(/[^a-z0-9]+/g, "-")}-categories.csv`,
    rows.map((row) => row.map(csvCell).join(",")).join("\n"),
  );
}

export function exportBuyingChecklist(
  scenario: PlannerScenario,
  result: ScenarioResult,
) {
  const rows = [
    ["Category", "Target quantity", "Target average cost", "Maximum price"],
    ...result.categories.map((category, index) => [
      category.name,
      category.quantity,
      scenario.categories[index]?.averageBuyingPrice ?? 0,
      scenario.categories[index]?.maxBuyingPrice ?? 0,
    ]),
  ];
  download(
    `${scenario.name.toLowerCase().replaceAll(/[^a-z0-9]+/g, "-")}-buying-checklist.csv`,
    rows.map((row) => row.map(csvCell).join(",")).join("\n"),
  );
}

export function whatsappSummary(
  scenario: PlannerScenario,
  result: ScenarioResult,
) {
  return [
    `*${scenario.name}*`,
    `Capital: ${formatKes(scenario.totalCapital)}`,
    `Stock budget: ${formatKes(scenario.plannedStockBudget)}`,
    `Planned pieces: ${result.inventory.totalItems}`,
    `Avg landed cost: ${formatKes(result.inventory.averageLandedCost)}`,
    `Expected revenue: ${formatKes(result.revenue.realisedRevenue)}`,
    `Projected net profit: ${formatKes(result.profit.netProfit)}`,
    `Break-even sell-through: ${result.profit.breakEvenSellThroughPercent}%`,
    "",
    "Planning estimate only. Results are not guaranteed.",
  ].join("\n");
}
